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

> '<slot>.<hash>'形式で指定されたチェーンポイントから同期を開始
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
<br />

```
  --output-log-format string
```

> 出力フォーマットを指定：text（人間が読める形式、デフォルト）またはjson（機械が解析可能）（デフォルト"text"）
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

> サービスアカウントファイルのパスを指定
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

## バージョン：

```
  --version
```

> バージョンを表示して終了

