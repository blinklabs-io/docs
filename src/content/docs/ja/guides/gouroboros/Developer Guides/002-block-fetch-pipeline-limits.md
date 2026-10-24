---
title: BlockPipeline の所有権と Block Fetch の範囲制限
description: 保持するブロックデータの上限を設定し、BlockPipeline の結果を解放して、Go で Block Fetch の範囲制限を処理します。
---

このガイドでは、gOuroboros を組み込む際の 2 つのリソース契約を説明します。

- `BlockPipeline` は、処理中の項目が保持する完全なブロック CBOR の合計量を制限します。
- Block Fetch は、両端を含む各範囲のブロック数、エンコード済み応答のバイト数、全処理時間を制限します。

## BlockPipeline の結果の所有権

`PipelineConfig.MaxRawCborBytes` は、送信から結果の受け渡しまでに保持する完全なブロック CBOR コピーの合計予算です。処理中の項目について、送信時の生データのコピーと、デコード済みブロックが保存する CBOR の両方を含みます。`DefaultMaxRawCborBytes` は既定値を `64 MiB` に設定し、`MaxRawCborBytes` が 0 の場合はこの既定値を使用します。

`WithMaxRawCborBytes` で設定します。

```go
blockPipeline := pipeline.NewBlockPipeline(
	pipeline.WithMaxRawCborBytes(128 * 1024 * 1024),
)
```

パイプラインは `Submit` 中に必要な保持バイト数を予約し、利用側が結果を受け取るまで計上し続けます。ブロックが設定した合計予算に収まらない場合、`Submit` は `pipeline.ErrRawCborBudgetExceeded` に一致するエラーを返します。`Results()` または `DrainResults()` から結果を受け取ると、予約は自動的に解放されます。未受信の結果は予算を占有し続けるため、受信するまで後続の送信がバックプレッシャーで待機する場合があります。受信した項目の処理後は `Release()` を呼び出し、利用側が所有するデータを消去してください。

### すべての結果を処理して解放する

`Results()` から受信した各項目、および `DrainResults()` が返す各項目の所有権は呼び出し元に移ります。`Release` を呼ぶ前に項目を処理してください。

```go
consume := func(item *pipeline.BlockItem) {
	// Read or process all required fields before releasing the item.
	raw := item.RawCbor()
	block := item.Block()
	_ = raw
	_ = block

	item.Release()
}

for item := range blockPipeline.Results() {
	consume(item)
}

for _, item := range blockPipeline.DrainResults() {
	consume(item)
}
```

`Release()` は冪等であり、繰り返し呼んでも安全です。項目の生データとデコード済みブロックデータを消去するため、解放後に `RawCbor()` や `Block()` を呼んではいけません。通常処理、後処理、終了処理のすべてで、処理してから解放する順序を守ってください。

## Block Fetch の範囲保護

Block Fetch は、両端を含む各範囲に 3 つの累積上限を適用します。`blockfetch.Config` のフィールドを直接設定するか、対応するオプション関数を使用します。

| 設定フィールド | オプション | 単位 | 0 の場合 |
| --- | --- | --- | --- |
| `MaxBlocksPerRange` | `WithMaxBlocksPerRange` | 範囲内のブロック数 | `2,161` ブロック |
| `MaxRangeBytes` | `WithMaxRangeBytes` | 範囲内のエンコード済みバイト数の合計 | `214,205,235` バイト |
| `RangeTimeout` | `WithRangeTimeout` | 範囲の全処理時間 | `36 hours 3 minutes`（36 時間 3 分） |

`NewConfig` はこれらの既定値を適用します。フィールドまたはオプション引数に 0 を設定すると、対応する既定値を選択します。0 は保護を無効にしません。

クライアントは、範囲内の完全なエンコード済み `MsgBlock` メッセージをすべて数えます。

- `MaxBlocksPerRange` は、受け入れたブロックの累積数です。
- `MaxRangeBytes` は、それらの完全な `MsgBlock` メッセージのエンコード済みバイト数の累積です。
- `RangeTimeout` は、リクエストの受け入れ処理開始時に始まります。処理中の容量やリクエストのキュー投入を待つローカル時間も含み、ブロックの取得が進んでも期限は延長されません。

カウンターは、個別の応答やバッチではなく、両端を含む範囲全体に適用されます。クライアントは各ブロックを渡す前に上限を確認し、範囲の終了処理時にも期限を確認します。

### 範囲制限のエラー

上限に達すると、クライアントは次の公開センチネルエラーのいずれかをラップします。

- `blockfetch.ErrRangeBlockLimit`: `MaxBlocksPerRange` を超えた場合。
- `blockfetch.ErrRangeByteLimit`: `MaxRangeBytes` を超えた場合。
- `blockfetch.ErrRangeTimeout`: `RangeTimeout` を超えた場合。

エラー文字列を比較せず、ラップされたエラーの一致確認を使用します。

```go
if errors.Is(err, blockfetch.ErrRangeTimeout) {
	// Retry or discard the range according to application policy.
}
```

`Client.RequestRange` は受け入れ時の失敗を直接返し、`RangeDoneFunc` は各範囲の終了時の失敗を `error` 引数で受け取ります。同期 API やその他のコールバック方式のリクエストは、通常の戻り値または完了コールバックで該当するエラーを通知します。範囲制限の失敗はプロトコルエラーを送信し、該当する Block Fetch プロトコルを終了するため、呼び出し元はそのプロトコル上の他のリクエストの終了エラーも処理する必要があります。

### 範囲制限と処理中リクエストの受け入れ

範囲保護は、`RangeRequest.ExpectedBytes` や `MaxInFlightBytes` を置き換えるものではありません。`ExpectedBytes` は、ヘッダーを含む範囲のシリアライズ後サイズについての呼び出し元の見積もりです。クライアントはこの見積もりを、未完了のパイプラインリクエストを `MaxInFlightBytes` の範囲内で受け入れ、要求する受信許容量を決めるために使用します。一方、範囲保護は、完全な `MsgBlock` 応答の実際のサイズと、1 つの範囲の実際の総所要時間を計測します。

## 接続の読み取りバッファーの計上

接続全体の読み取りバッファーの計上は、受け渡しとコンパクションを通して各 `bytes.Buffer` が保持する容量に従います。メッセージの消費後に残る容量も、計上から除外されずに含まれます。新しいオプションは追加されず、関係のない設定を変更する必要もありません。
