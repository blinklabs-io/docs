---
title: コマンドリファレンスガイド
description: Adderコマンドのリスト。
---

# <ins>コマンドリスト：</ins>

## 設定：


```
 -config string
```

> 読み込む設定ファイルのパス

***

## フィルター：

```
  -filter-address string
```

> フィルタリングするアドレスを指定
<br />


```
  -filter-asset string
```

> フィルタリングするアセットフィンガープリント（asset1xxx）を指定
<br />

```
  -filter-policy string
```

> フィルタリングするアセットポリシーIDを指定
<br />

```
  -filter-pool string
```

> フィルタリングするプールIDを指定
<br />

```
  -filter-type string
```

> フィルタリングするイベントタイプを指定

***

## 入力：

```
  -input string
```

> 使用する入力プラグイン、利用可能なものを表示するには'list'（デフォルト"chainsync"）
<br />

```
  -input-chainsync-address string
```

> 接続するノードのTCPアドレスを'host:port'形式で指定
<br />

 ```
  -input-chainsync-auto-reconnect
```

> 接続が切断された場合に自動再接続（デフォルトtrue）
<br />

```
  -input-chainsync-bulk-mode
```

> NtN（node-to-node）で'bulk'同期モードを使用。リソース使用の理由から、自分のノードに対してのみ使用してください
<br />

```
  -input-chainsync-include-cbor
```

> イベントにブロック/トランザクションの元のCBORを含める
<br />

```
  -input-chainsync-intersect-point string
```

> '<slot>.<hash>'形式で指定されたチェーンポイントから同期を開始
<br />

```
  -input-chainsync-intersect-tip
```

> チェーンの先端から同期を開始（デフォルトはチェーンジェネシス）（デフォルトtrue）
<br />

```
  -input-chainsync-kupo-url string
```

> kupo-urlアドレス
<br />

```
  -input-chainsync-network string
```

> よく知られたCardanoネットワーク名を指定（デフォルト"mainnet"）
<br />

```
  -input-chainsync-network-magic uint
```

> 使用するネットワークマジック値を指定、'network'を上書き
<br />

```
  -input-chainsync-ntc-tcp
```

> TCP経由でNtC（node-to-client）プロトコルを使用、socatなどを介してノードのUNIXソケットを公開する場合に使用
<br />

```
  -input-chainsync-socket-path string
```

> 接続するUNIXソケットのパスを指定

***

## 出力：

```
  -output string
```

> 使用する出力プラグイン、利用可能なものを表示するには'list'（デフォルト"log"）
<br />

```
  -output-log-level string
```

> 使用するログレベルを指定（デフォルト"info"）
<br />

```
  -output-notify-title string
```

> 使用するタイトルを指定（デフォルト"Adder"）
<br />

```
  -output-push-accessTokenUrl string
```

> アクセストークンを取得するURLを指定（デフォルト`https://www.googleapis.com/auth/firebase.messaging`）
<br />

```
  -output-push-serviceAccountFilePath string
```

> サービスアカウントファイルのパスを指定
<br />

```
  -output-webhook-format string
```

> 使用するWebhookペイロード形式を指定（デフォルト"adder"）
<br />

```
  -output-webhook-password string
```

> Basic認証のパスワードを指定
<br />

```
  -output-webhook-tls-skip-verify
```

> TLS検証をスキップ（自己署名証明書用）
<br />

```
  -output-webhook-url string
```

> 使用するURLを指定（デフォルト`http://localhost:3000`）
<br />

```
  -output-webhook-username string
```

> Basic認証のユーザー名を指定

***

## バージョン：

```
  -version
```

> バージョンを表示して終了

