---
title: BlockPipeline と Block Fetch の制限
description: BlockPipeline の結果所有権と Block Fetch の range 制限を説明します。
---

このページでは、`BlockPipeline` の結果を管理する方法と、Block Fetch の `RequestRange` に適用される制限を説明します。

## BlockPipeline の結果所有権

`BlockPipeline` は、処理済みの `BlockItem` を `Results()` または `DrainResults()` で渡します。受け取った結果は呼び出し側が所有するため、各 `BlockItem` の利用が終わったら `Release()` を1回呼び出します。結果を解放しないと、保持されたブロックデータが `MaxRawCborBytes` の予算を占有し続け、後続の `Submit` が待機したり失敗したりします。

`PipelineConfig.MaxRawCborBytes` と `WithMaxRawCborBytes` は、パイプラインが保持する完全なブロック CBOR コピーの合計バイト数を制限します。`MaxRawCborBytes` に `0` を指定すると、`DefaultMaxRawCborBytes` の `64 * 1024 * 1024`（64 MiB）を使用します。`Submit` は保持用の予算を確保してからブロックを受け入れ、1つのブロックの保持コピーが予算に収まらない場合は `ErrRawCborBudgetExceeded` を返します。

結果は `Results()` から受け取るか、`DrainResults()` が返すスライスから取り出した時点で呼び出し側の所有になります。`RawCbor()` または `Block()` で必要なデータを読み取った後、同じ結果に対して `Release()` を呼び出します。

```go
for item := range p.Results() {
	raw := item.RawCbor()
	block := item.Block()

	// Process raw and decoded block data.
	_ = raw
	_ = block

	item.Release()
}
```

`Release()` は複数回呼び出しても安全ですが、各結果につき1回だけ呼び出す運用にします。`Release()` は保持していた raw CBOR と decoded block を消去するため、呼び出し後の `RawCbor()` と `Block()` は使用できません。

## Block Fetch の range 制限

`blockfetch.Config` は、`Client.RequestRange` で送信する1つの range に対して、ブロック数、エンコード済みバイト数、合計実行時間の3つを制限します。これらの制限は、range 全体に対して累積して適用されます。

| 設定 | 単位 | `0` の場合のデフォルト | オプション |
| --- | --- | --- | --- |
| `MaxBlocksPerRange` | ブロック数 | `DefaultMaxBlocksPerRange`: `2,161` | `WithMaxBlocksPerRange` |
| `MaxRangeBytes` | 完全なエンコード済み `MsgBlock` の累積バイト数 | `DefaultMaxRangeBytes`: `214,205,235` bytes | `WithMaxRangeBytes` |
| `RangeTimeout` | range の合計有効期間 | `DefaultRangeTimeout`: `36 hours 3 minutes` | `WithRangeTimeout` |

`MaxBlocksPerRange` は、1つの range で受け入れるブロックの累積数を制限します。`MaxRangeBytes` は、同じ range で受け入れる完全なエンコード済み `MsgBlock` の累積サイズを制限します。各 `MsgBlock` を受け入れる前に両方のカウンターを確認し、ブロックを配信してもカウンターをリセットしません。

`RangeTimeout` は、range の admission が始まった時点から完了するまでの固定された合計期限です。ローカルの admission とキューへの追加を待つ時間も期限に含まれ、`MsgBlock` の進行によって期限を更新しません。設定値を `0` にすると、上表の安全なデフォルト値を選択します。既知の大きな range を扱う場合は、`WithMaxBlocksPerRange`、`WithMaxRangeBytes`、`WithRangeTimeout` で明示的に上限を引き上げます。

### `ExpectedBytes` との違い

`RangeRequest.ExpectedBytes` は、range 全体のシリアライズ済みサイズ（ヘッダーを含む）に対する呼び出し側の見積もりです。この値は、複数の outstanding request に対する `MaxInFlightBytes` の admission と、Block Fetch の ingress allowance を計算します。`ExpectedBytes` は、実際に受信したブロック数やエンコード済みバイト数を制限する値ではありません。

そのため、`ExpectedBytes` による in-flight admission と、`MaxBlocksPerRange`、`MaxRangeBytes`、`RangeTimeout` による range 内の累積制限および合計期限は別々に適用されます。見積もりが小さくても、range は実際のブロック数、エンコード済みサイズ、経過時間の制限を超えられません。

### range のエラー処理

次のエラーは、`RequestRange` の range が完了できない理由を示します。

| エラー | 発生条件 |
| --- | --- |
| `ErrRangeBlockLimit` | range の累積ブロック数が `MaxBlocksPerRange` を超えた。 |
| `ErrRangeByteLimit` | range の累積エンコード済み `MsgBlock` バイト数が `MaxRangeBytes` を超えた。 |
| `ErrRangeTimeout` | admission から完了までの固定期限が経過した。 |

`RequestRange` は、送信後に発生した terminal error を戻り値として返しません。クライアントは、range ごとに `RangeDoneFunc` を1回呼び出し、コールバックの `error` 引数に成功時は `nil`、失敗時は terminal error を渡します。範囲にブロックがない場合も `RangeDoneFunc` に `ErrNoBlocks` を渡しますが、これは通常の peer 応答です。

エラーの種類を確認するには、`errors.Is` と同じエラー値を使用します。

```go
func rangeDone(ctx blockfetch.CallbackContext, err error) error {
	if errors.Is(err, blockfetch.ErrRangeBlockLimit) {
		// Handle a range that exceeded MaxBlocksPerRange.
	}
	if errors.Is(err, blockfetch.ErrRangeByteLimit) {
		// Handle a range that exceeded MaxRangeBytes.
	}
	if errors.Is(err, blockfetch.ErrRangeTimeout) {
		// Handle a range that exceeded RangeTimeout.
	}
	return nil
}
```

`ErrRangeBlockLimit`、`ErrRangeByteLimit`、`ErrRangeTimeout` が発生すると、クライアントはその terminal error をプロトコルの `SendError` に渡して、該当する protocol を停止します。したがって、`RangeDoneFunc` はエラーを受け取りますが、同じ protocol はその後の range を処理しません。peer がプロトコルに違反した場合も、プロトコルエラーとして `SendError` が接続を停止します。

## 接続全体の読み取りバッファ会計

プロトコルがメッセージを消費した後も保持する読み取りバッファの容量を、接続全体の読み取りバッファ会計に含めます。この会計の動作は既存の接続管理に属し、新しい設定オプションではありません。

詳細な API 仕様については、[gOuroboros の Go API ドキュメント](https://pkg.go.dev/github.com/blinklabs-io/gouroboros)を参照してください。