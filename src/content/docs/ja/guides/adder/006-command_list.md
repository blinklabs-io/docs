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

> 読み込む設定ファイルへのパス

> 複数の方法で同じ設定を指定した場合、Adderは次の優先順位を使用します。CLIフラグ > 環境変数 > YAML設定ファイル > デフォルト値。

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
> `--filter-address`、`--filter-asset`、`--filter-policy`、`--filter-pool`、`--filter-drep`、`--filter-type`では、カンマ区切りの各項目の前後にある空白を除去し、空の項目を無視します。
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

> 使用する入力プラグインを指定します。'list'で利用可能なプラグインを表示します（デフォルトは"chainsync"）。
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

> 接続先ノードのTCPアドレスを'host:port'形式で指定します。
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

> '<slot>.<hash>'形式で指定したチェーンポイントから同期を開始します。
>
> カンマ区切りの各項目の前後にある空白を除去し、空の項目を無視します。
>
> 空白を除去した後に空白や空の項目しか残らない場合は、`--input-chainsync-intersect-tip`で設定された動作に従います。
>
> 空ではない`<slot>.<hash>`項目の形式が不正な場合、Adderはエラーとして扱います。
>
<br />

```
  --input-chainsync-intersect-tip
```

> チェーンの先端から同期を開始します（通常の開始位置はチェーンのジェネシス、デフォルトはtrue）。
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

> 接続先UNIXソケットへのパスを指定します。

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

> トランザクション入力を解決するKupo APIのURL（例：http://localhost:1442）。Kupoで必要な出力をインデックス化してください（例：--match "*"で実行）。インデックス化されていない場合、解決結果は空になります。
<br />

```
  --input-mempool-network string
```

> よく知られている Cardano ネットワーク名 (例: mainnet, preprod) (既定の "mainnet")
<br />

```
  --input-mempool-network-magic uint
```

> ネットワークマジック値（ネットワーク名より優先されます）。
<br />

```
  --input-mempool-ntc-tcp
```

> TCP 上で NtC を使う (例えば socat でソケットを露出するとき)
<br />

```
  --input-mempool-poll-interval string
```

> mempoolをポーリングする間隔（例：5s、1m。デフォルトは"5s"）。
<br />

```
  --input-mempool-socket-path string
```

> ノードの UNIX ソケット (NtC) へのパス

***

<a id="output"></a>

## 出力:

```
  --output string
```

> 使用する出力プラグインを指定します。通知NDJSONには`notify-json`、利用可能なプラグインの表示には`list`を指定します（デフォルトは"log"）。
>
<br />

```
  --output-log-level string
```

> `output.log`のログ出力のしきい値を設定します。指定できる値は`debug`、`info`、`warn`、`error`です（デフォルトは"info"）。`debug`と`info`ではイベントレコードを出力し、`warn`と`error`では出力を抑制します。他の出力プラグインを選択した場合も、このしきい値によってstderrに出力するAdderアプリケーションの診断情報を絞り込みます。
>
> 同じ設定はYAMLの`plugins.output.log.level`または環境変数`OUTPUT_LOG_LEVEL`でも指定できます。従来の`--logging-level`フラグとトップレベルのYAML設定`logging.level`は削除されており、指定すると拒否されます。従来の環境変数`LOGGING_LEVEL`も削除されており、指定しても無視されます。
<br />

```
  --output-log-format string
```

> 出力形式を指定します: テキスト (human-readable, default) または json (machine-parseable) (デフォルト "text")
<br />

```
  --output-notify-json-config string
```

> `notify-json`が使用する、バージョン付き通知JSON設定へのパス
>
> `--output notify-json`を選択した場合は必須です。
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

> メッセージの送信先となるTelegramチャットID（ユーザー、グループ、チャネル）。
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
> `--config <path>`は必須です。通常の出力では有効性とエラーを報告します。`--json`を指定すると、機械で処理できる検証結果を出力します。
>

<a id="notification-json-configuration"></a>

### 通知JSON設定

設定には、`schemaVersion`を`1`に設定したJSONを使用します。設定ファイルに未知のフィールドや複数のJSON値が含まれている場合、Adderは拒否します。

| フィールド | 説明 |
| --- | --- |
| `schemaVersion` | 必須の値は`1`です。 |
| `network.name` | サポートされるCardanoネットワーク`mainnet`、`preprod`、`preview`のいずれかを指定します。必須です。 |
| `network.customAddress`と`network.customPort` | 任意のカスタムノードアドレスとポートです。両方を一緒に設定します。`customPort`は`1`から`65535`の範囲で指定します。 |
| `monitor.everything` | サポートされるすべての対象を監視する場合は`true`にします。このフィールドを設定するか、`wallets`、`dreps`、`pools`、`assets`、`policies`のいずれかに少なくとも1つの対象を設定します。 |
| `monitor.wallets` | 監視するウォレットアドレス。 |
| `monitor.dreps` | 監視するDRep ID。`monitor.drepMatch`には`any`または`all`を指定できます。 |
| `monitor.pools` | 監視するプールID。`monitor.poolMatch`には`any`または`all`を指定できます。 |
| `monitor.assets` | 監視するアセットフィンガープリント。`monitor.assetMatch`には`any`または`all`を指定できます。 |
| `monitor.policies` | 監視するポリシーID。`monitor.policyMatch`には`any`または`all`を指定できます。 |
| `alerts` | 有効にするアラートのカテゴリ。`incomingTransactions`、`outgoingTransactions`、`tokenTransfers`、`blocksMinted`、`chainRollbacks`、`poolParameterChanges`、`governanceProposals`、`votesCast`、`registrationChanges`、`assetActivity`、`policyActivity`、`connectionIssues`を指定できます。少なくとも1つのカテゴリを有効にしてください。 |
| `rateLimit.max` | 必須です。レート制限を無効にする場合は`-1`、それ以外の場合は`0`以上を指定します。 |
| `rateLimit.windowSeconds` | 必須です。秒単位で正の期間を指定します。 |
| `connectionStaleSeconds` | 必須です。接続を古いと判定する間隔を`30`から`3600`秒の範囲で指定します。 |

対象リストには、有効かつ重複のないウォレットアドレス、DRep ID、プールID、アセットフィンガープリント、ポリシーIDを指定してください。通知のネットワークは`--input-chainsync-network`と一致する必要があります。カスタムノードを設定した場合、そのアドレスとポートは`--input-chainsync-address`と一致する必要があります。`notify-json`出力には`chainsync`入力が必要です。

<a id="notify-json-output"></a>

### `notify-json`出力

`notify-json`出力は、stdoutに1行につき1つのJSONオブジェクトを書き込みます。各レコードはスキーマバージョン`1`を使用します。ステータスレコードは`starting`、`connected`、`stale`の状態を報告し、タイムスタンプと任意のメッセージを含みます。通知レコードには、`ruleId`、任意の`eventType`、描画済みの`title`と`body`、バッチ処理用フィールドの`batched`と`count`が含まれます。

***
<a id="version"></a>

## バージョン:

```
  --version
```

> バージョンを表示して終了します。



---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
