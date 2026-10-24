---
title: "コマンドリファレンスガイド"
description: "Adderコマンドの一覧です。"
---

<a id="list-of-commands"></a>

# <ins>コマンド一覧:</ins>

<br />

<a id="configuration"></a>

## 設定:


```
 --config string
```

> ファイルの読み込みにコンフィグする

> 複数のメソッドで同じ設定が提供される場合、Adder はこの優先オーダーを使います: CLI フラグ > YAML 設定ファイル > 環境変数。

***

<a id="filter"></a>

## フィルター:

```
  --filter-address string
```

> フィルタリングするアドレスを指定する
<br />


```
  --filter-asset string
```

> アセットフィンガープリント(asset1xxx)をフィルタリングする
<br />


```
  --filter-drep string
```

> DRep ID(s)をフィルタリングするように指定します(コンマ区切り、16 進数または bech32)
<br />


```
  --filter-policy string
```

> アセットポリシー ID をフィルタリングするように指定する
<br />

```
  --filter-pool string
```

> フィルタリングするプール ID を指定する
<br />

```
  --filter-type string
```

> フィルタリングするイベントタイプを指定する
>
> `--filter-address`、`--filter-asset`、`--filter-policy`、`--filter-pool`、`--filter-drep`、`--filter-type`、Adderはコンマ区切りのエントリーから空白を囲んで、空のエントリを無視します。
>
> **イベントの種類:**
> 1. `input.block` - 新しいブロックが観察されました。
> 2. `input.rollback` - 前のチェーン ポイントにロールバックが発生しました。
> 3. `input.transaction` - トランザクションはブロックで見られた。
> 4. `input.governance` - ガバナンス関連イベント(CIP-1694時代)。
> 5. `input.drep-registration` - DRep登録が発生しました。

***

<a id="input"></a>

## 入力:

```
  --input string
```

> 使用するプラグインを入力します。'list' で利用可能な表示 (既定の "chainsync")
>
> **入力タイプ:**
> 1. `chainsync` - NtC(node-to-client)またはNtN(node-to-node)を使用したCardanoノードからブロックを同期
> 2. `mempool` - LocalTxMonitor(NtC)を介してCardanoノードのmempoolから未確認のトランザクションを読み込む
<br />

<a id="input-chainsync"></a>

### input-chainsync:

```
  --input-chainsync-address string
```

> ノードの TCP アドレスを指定すると、フォーム 'host:port' に接続します。
<br />

 ```
  --input-chainsync-auto-reconnect
```

> 接続が壊れた場合の自動再接続(デフォルトtrue)
<br />

```
  --input-chainsync-delay-confirmations uint
```

> イベントを出す前に必要な確認件数
<br />

```
  --input-chainsync-include-cbor
```

> イベントのブロック/トランザクションのためのオリジナルのCBORが含まれています
<br />

```
  --input-chainsync-intersect-point string
```

> '<slot>.<hash>' 形式で指定されたチェーンポイントで同期を開始します。
>
<br />

```
  --input-chainsync-intersect-tip
```

> チェーンチップ(デフォルトはチェーンジェネシス)で同期を開始します(デフォルトはtrue)
<br />

```
  --input-chainsync-network string
```

> よく知られている Cardano ネットワーク名 (デフォルト "mainnet") を指定します。
<br />

```
  --input-chainsync-network-magic uint
```

> 使用するネットワークのマジック値を指定すると、'network' をオーバーライド
<br />

```
  --input-chainsync-ntc-tcp
```

> TCP 上で NtC (node-to-client) プロトコルを使用して、Socat または同様の方法でノードの UNIX ソケットを公開するときに使用します。
<br />

```
  --input-chainsync-socket-path string
```

> UNIX ソケットへのパスを指定すると、

***

```
  --input-chainsync-kupo-url string
```

> kupo-urlアドレス
<br />


<a id="input-mempool"></a>

### input-mempool:

```
  --input-mempool-address string
```

> TCPアドレス(host:port)。 ntc-tcp=true が必要です。
<br />

```
  --input-mempool-include-cbor
```

> イベントでトランザクションCBORを含める
<br />

```
  --input-mempool-kupo-url string
```

> Kupo API URL はトランザクションの入力(例:http://localhost:1442)を解決します。Kupo は、必要な出力をインデックス化する必要があります(例: --match "*") で実行するか、解像度は空になります。
<br />

```
  --input-mempool-network string
```

> よく知られている Cardano ネットワーク名 (例: mainnet, preprod) (既定の "mainnet")
<br />

```
  --input-mempool-network-magic uint
```

> ネットワークの魔法の価値(ネットワーク名を上書き)
<br />

```
  --input-mempool-ntc-tcp
```

> TCP 上で NtC を使う (例えば socat でソケットを露出するとき)
<br />

```
  --input-mempool-poll-interval string
```

> mempoolをポーリングする方法(例:5s、1m)(デフォルト「5s」)
<br />

```
  --input-mempool-socket-path string
```

> ノードの UNIX ソケット (NtC) へのパス

***

<a id="logging"></a>

## ログ:

```
  --logging-level string
```

> ロギングレベル(デバッグ、情報、警告、エラー)(デフォルト「info」)
<br />

***

<a id="output"></a>

## 出力:

```
  --output string
```

> 利用するプラグインを出力します。'list' で利用可能な表示 (既定の "log")
>
<br />

```
  --output-log-format string
```

> 出力形式を指定します: テキスト (human-readable, default) または json (machine-parseable) (デフォルト "text")
<br />

```
  --output-notify-json-config string
```

> `notify-json`で使われるバージョン通知JSON設定へのパス
<br />

```
  --output-notify-title string
```

> 使用するタイトルを指定します (デフォルト "Adder")
<br />

```
  --output-push-accessTokenUrl string
```

> アクセストークンを取得する URL を指定します (デフォルト `https://www.googleapis.com/auth/firebase.messaging`)
<br />

```
  --output-push-serviceAccountFilePath string
```

> サービスアカウントファイルへのパスを指定します。この値は、`--output push` を使用した場合、非空でなければなりません。
>
> サービスアカウント JSON には、`project_id` を非空の文字列として含まなければなりません。 欠損、非文字列、または空の `project_id` 値が起動/構成障害を引き起こします。
>
<br />

```
  --output-telegram-bot-token string
```

> Telegram Bot APIトークン(@BotFatherから)
<br />

```
  --output-telegram-chat-id string
```

> チャット ID をTelegramで送信(ユーザー、グループ、またはチャネル)
<br />

```
  --output-telegram-disable-preview
```

> メッセージのリンクプレビューを無効にする
<br />

```
  --output-telegram-parse-mode string
```

> メッセージ解析モード(HTML、Markdown、MarkdownV2)(デフォルト「HTML」)
<br />

```
  --output-webhook-format string
```

> 使用するWebhookペイロード形式を指定します(デフォルト "adder")
<br />

```
  --output-webhook-password string
```

> 基本的なauthのパスワードを指定する
<br />

```
  --output-webhook-tls-skip-verify
```

> tls の検証をスキップします(自己署名されたcertsのために)
<br />

```
  --output-webhook-url string
```

> 使用する URL を指定します (デフォルト `http://localhost:3000`)
<br />

```
  --output-webhook-username string
```

> 基本的なauthのユーザー名を指定する

***

<a id="notifications"></a>

## 通知:

```
adder notifications validate --config <path> [--json]
```

> 通知 JSON の設定を検証する
>
> `--config <path>`が必要です。通常の出力レポートの有効性とエラー。 `--json`は、機械で読みやすいバリデーション結果を出します。
>

***
<a id="version"></a>

## バージョン:

```
  --version
```

> バージョンと終了の表示



---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
