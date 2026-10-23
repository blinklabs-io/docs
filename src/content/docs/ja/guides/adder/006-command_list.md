---
title: コマンドリファレンスガイド
description: Adderコマンドのリスト。
---

# <ins>コマンドリスト：</ins>

<br />

## 設定：


```
 --config string
```

> 読み込む設定ファイルのパス

> 同じ設定が複数の方法で指定された場合、Adder は次の優先順位で適用します: CLI フラグ > YAML 設定ファイル > 環境変数。

***

## フィルター：

```
  --filter-address string
```

> フィルタリングするアドレスを指定
<br />


```
  --filter-asset string
```

> フィルタリングするアセットフィンガープリント（asset1xxx）を指定
<br />


```
  --filter-drep string
```

> フィルタリングするDRep ID（複数可、カンマ区切り、hexまたはbech32）を指定
<br />


```
  --filter-policy string
```

> フィルタリングするアセットポリシーIDを指定
<br />

```
  --filter-pool string
```

> フィルタリングするプールIDを指定
<br />

```
  --filter-type string
```

> フィルタリングするイベントタイプを指定
>
> **イベントタイプ：**
> 1. `input.block` - 新しいブロックが観測された。
> 2. `input.rollback` -	以前のチェーンポイントへのロールバックが発生した。
> 3. `input.transaction` -	ブロック内でトランザクションが確認された。
> 4. `input.governance` -	ガバナンス関連のイベント（CIP-1694時代）。
> 5. `input.drep-registration` - DRepの登録イベント。
>
>

***

## 入力：

```
  --input string
```

> 使用する入力プラグイン、利用可能なものを表示するには'list'（デフォルト"chainsync"）
>
> **入力タイプ：**
> 1. `chainsync` - NtC（node-to-client）またはNtN（node-to-node）のいずれかを使用してCardanoノードからブロックを同期する
> 2. `mempool` - LocalTxMonitor（NtC）を介してCardanoノードのメンプールから未確認のトランザクションを読み取る
<br />

### input-chainsync:

```
  --input-chainsync-address string
```

> 接続するノードのTCPアドレスを'host:port'形式で指定
<br />

 ```
  --input-chainsync-auto-reconnect
```

> 接続が切断された場合に自動再接続（デフォルトtrue）
<br />

```
  --input-chainsync-delay-confirmations uint
```

> イベントを発行する前に必要な確認数
<br />

```
  --input-chainsync-include-cbor
```

> イベントにブロック/トランザクションの元のCBORを含める
<br />

```
  --input-chainsync-intersect-point string
```

> '<slot>.<hash>'形式のチェーンポイントをカンマ区切りで指定して、その地点から同期を開始
>
> 各項目の前後の空白を取り除き、空の項目を無視します。空白または空の項目だけの場合は、`--input-chainsync-intersect-tip`の設定に従います。空でない項目の形式が正しくない場合はエラーになります。
<br />

```
  --input-chainsync-intersect-tip
```

> チェーンの先端から同期を開始（デフォルトはチェーンジェネシス）（デフォルトtrue）
<br />

```
  --input-chainsync-network string
```

> よく知られたCardanoネットワーク名を指定（デフォルト"mainnet"）
<br />

```
  --input-chainsync-network-magic uint
```

> 使用するネットワークマジック値を指定、'network'を上書き
<br />

```
  --input-chainsync-ntc-tcp
```

> TCP経由でNtC（node-to-client）プロトコルを使用、socatなどを介してノードのUNIXソケットを公開する場合に使用
<br />

```
  --input-chainsync-socket-path string
```

> 接続するUNIXソケットのパスを指定

***

```
  --input-chainsync-kupo-url string
```

> kupo-urlアドレス
<br />


### input-mempool:

```
  --input-mempool-address string
```

> TCPアドレス（host:port）；ntc-tcp=trueが必要
<br />

```
  --input-mempool-include-cbor
```

> イベントにトランザクションのCBORを含める
<br />

```
  --input-mempool-kupo-url string
```

> トランザクション入力を解決するためのKupo APIのURL（例：http://localhost:1442）。Kupoは必要な出力をインデックスしている必要があります（例：`--match "*"`で実行）。そうでない場合、解決は空になります。
<br />

```
  --input-mempool-network string
```

> よく知られたCardanoネットワーク名（例：mainnet、preprod）（デフォルト"mainnet"）
<br />

```
  --input-mempool-network-magic uint
```

> ネットワークマジック値（ネットワーク名を上書き）
<br />

```
  --input-mempool-ntc-tcp
```

> TCP経由でNtCを使用（例：socat経由でソケットを公開する場合）
<br />

```
  --input-mempool-poll-interval string
```

> メンプールをポーリングする頻度（例：5s、1m）（デフォルト"5s"）
<br />

```
  --input-mempool-socket-path string
```

> ノードのUNIXソケットへのパス（NtC）

***

## ロギング：

```
  --logging-level string
```

> ロギングレベル（debug、info、warn、error）（デフォルト"info"）
<br />

***

## 出力：

```
  --output string
```

> 使用する出力プラグイン、利用可能なものを表示するには'list'（デフォルト"log"）
>
> `notify-json`を指定すると、通知リクエストをNDJSONとして出力します。この出力を選択する場合は、`--output-notify-json-config`で設定ファイルのパスを指定する必要があります。
<br />

```
  --output-log-format string
```

> 出力フォーマットを指定：text（人間が読める形式、デフォルト）またはjson（機械が解析可能）（デフォルト"text"）
<br />

```
  --output-notify-json-config string
```

> `notify-json`で使用するバージョン付き通知JSON設定ファイルのパスを指定
<br />

```
  --output-notify-title string
```

> 使用するタイトルを指定（デフォルト"Adder"）
<br />

```
  --output-push-accessTokenUrl string
```

> アクセストークンを取得するURLを指定（デフォルト`https://www.googleapis.com/auth/firebase.messaging`）
<br />

```
  --output-push-serviceAccountFilePath string
```

<br />

```
  --output-telegram-bot-token string
```

> Telegram Bot APIトークン（@BotFatherから取得）
<br />

```
  --output-telegram-chat-id string
```

> メッセージを送信するTelegramチャットID（ユーザー、グループ、またはチャンネル）
<br />

```
  --output-telegram-disable-preview
```

> メッセージ内のリンクプレビューを無効化
<br />

```
  --output-telegram-parse-mode string
```

> メッセージのパースモード（HTML、Markdown、MarkdownV2）（デフォルト"HTML"）
<br />

```
  --output-webhook-format string
```

> 使用するWebhookペイロード形式を指定（デフォルト"adder"）
<br />

```
  --output-webhook-password string
```

> Basic認証のパスワードを指定
<br />

```
  --output-webhook-tls-skip-verify
```

> TLS検証をスキップ（自己署名証明書用）
<br />

```
  --output-webhook-url string
```

> 使用するURLを指定（デフォルト`http://localhost:3000`）
<br />

```
  --output-webhook-username string
```

> Basic認証のユーザー名を指定

***

## 通知：

```
adder notifications validate --config <path> [--json]
```

> `--config <path>`は必須です。通常の出力では設定の有効性またはエラーを表示します。`--json`を指定すると、機械で読み取れる検証結果を出力します。

### 通知JSON設定

通知JSON設定は、次のフィールドを使用します。

- `schemaVersion`：スキーマバージョン。`1`を指定します。
- `network`：`name`に`mainnet`、`preprod`、または`preview`を指定します。カスタムノードを使用する場合は、`customAddress`と`customPort`をペアで指定します。`customPort`は`1`から`65535`までの値を指定します。
- `monitor`：監視対象を指定します。`everything`を`true`にするとすべてを監視します。個別に指定する場合は、`wallets`、`dreps`、`pools`、`assets`、`policies`にそれぞれウォレットアドレス、DRep ID、プールID、アセットフィンガープリント、ポリシーIDを指定します。`drepMatch`、`poolMatch`、`assetMatch`、`policyMatch`には任意で`any`または`all`を指定します。
- `alerts`：有効にするアラートカテゴリを指定します。対応するカテゴリは`incomingTransactions`、`outgoingTransactions`、`tokenTransfers`、`blocksMinted`、`chainRollbacks`、`poolParameterChanges`、`governanceProposals`、`votesCast`、`registrationChanges`、`assetActivity`、`policyActivity`、`connectionIssues`です。
- `rateLimit`：通知のレート制限を指定します。`max`には`-1`（無効）または`0`以上の値を指定し、`windowSeconds`には`0`より大きい値を指定します。
- `connectionStaleSeconds`：チェーンイベントがない状態を stale と判定する秒数を指定します。`30`から`3600`までの値を指定します。

設定では、未対応のフィールドや複数のJSON値を拒否します。`monitor.everything`が`false`の場合は、少なくとも1つの監視対象を指定してください。少なくとも1つのアラートカテゴリを有効にし、各ウォレットアドレス、DRep ID、プールID、アセットフィンガープリント、ポリシーIDには有効な識別子を指定してください。監視対象の重複や無効なマッチモードも拒否します。

`notify-json`は`chainsync`入力を使用します。設定の`network.name`は`--input-chainsync-network`と一致させてください。`network.customAddress`を指定する場合は、`customAddress`と`customPort`で構成されるノードアドレスを`--input-chainsync-address`のアドレスとポートに一致させてください。

### notify-json のNDJSON出力

`notify-json`は、標準出力に1行1オブジェクトのJSONを出力します。すべてのレコードは`schemaVersion`に`1`を含みます。状態レコードは`kind`が`status`で、`status`に`starting`、`connected`、または`stale`を含みます。通知レコードは`kind`が`notification`で、描画済みの`ruleId`、`eventType`、`title`、`body`と、バッチ処理の`batched`、`count`を含みます。

***

## バージョン：

```
  --version
```

> バージョンを表示して終了



---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
