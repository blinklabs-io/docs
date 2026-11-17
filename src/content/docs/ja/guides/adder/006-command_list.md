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

> 複数の方法で同じ設定を指定した場合、Adderは次の優先順位を使用します。CLIフラグ > YAML設定ファイル > 環境変数 > デフォルト値。

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
> 1つのオプションに複数の値を指定する場合は、値をカンマで区切ります。同じオプション内では、指定した値のいずれか1つに一致すればフィルターに一致します。
>
> ```
> --filter-address addr1...,addr1...
> --filter-pool pool1...,a1b2...
> --filter-drep drep1...,drep_script1...
> ```
>
> 異なる種類のフィルターはANDで組み合わせます。ただし、`--filter-pool`と`--filter-drep`を同時に指定した場合はORで組み合わせます。他に設定したフィルターは、この組み合わせに対してもANDで適用されます。`--filter-drep`はブロックイベントには適用されません。
>
> フィルターフラグはプラグイン名を省略しますが、環境変数と設定ファイルの名前にはプラグイン名が含まれます。
>
> | フラグ | 環境変数 | 設定ファイルのキー |
> | --- | --- | --- |
> | `--filter-address` | `FILTER_CARDANO_ADDRESS` | `plugins.filter.cardano.address` |
> | `--filter-asset` | `FILTER_CARDANO_ASSET` | `plugins.filter.cardano.asset` |
> | `--filter-policy` | `FILTER_CARDANO_POLICY` | `plugins.filter.cardano.policy` |
> | `--filter-pool` | `FILTER_CARDANO_POOL` | `plugins.filter.cardano.pool` |
> | `--filter-drep` | `FILTER_CARDANO_DREP` | `plugins.filter.cardano.drep` |
> | `--filter-type` | `FILTER_EVENT_TYPE` | `plugins.filter.event.type` |
>
> **イベントの種類:**
> 1. `input.block` - 新しいブロックが観察されました。
> 2. `input.rollback` - 前のチェーン ポイントにロールバックが発生しました。
> 3. `input.transaction` - トランザクションはブロックで見られた。
> 4. `input.governance` - ガバナンス関連イベント(CIP-1694時代)。
> 5. `input.drep-registration` - DRep登録が発生しました。
> 6. `input.drep-update` - DRep更新が発生しました。
> 7. `input.drep-retirement` - DRep退任が発生しました。

### `input.governance` イベント

`input.governance`イベントは、Conway時代のオンチェーンガバナンスデータを含むトランザクションごとに1件発生します。1つのトランザクションに含まれるすべてのガバナンスデータを1件のイベントにまとめます。ロールバックや再処理では同じトランザクションが再び処理されることがあります。同じトランザクションの`input.transaction`イベントに加えて発生します。

次のいずれかを含むトランザクションでイベントを発生させます。

- 1つ以上の提案手続き（新しいガバナンスアクション）
- 1つ以上の投票手続き（ガバナンスアクションへの投票）
- DRepの登録、更新、退任、投票委任、または憲法委員会のホットキー承認・コールドキー辞任の証明書

ガバナンスデータを含まないトランザクションではイベントを発生させません。

#### `context`

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `transactionHash` | string | トランザクションのハッシュ（16進数） |
| `blockNumber` | number | トランザクションを含むブロックの高さ |
| `slotNumber` | number | トランザクションを含むブロックのスロット |
| `transactionIdx` | number | ブロック内のトランザクションのインデックス |
| `networkMagic` | number | 接続先ノードのネットワークマジック |

#### `payload`

`payload`には常に`blockHash`が含まれます。`transactionCbor`は`--input-chainsync-include-cbor`を有効にした場合だけ含まれます。次の配列は、空の場合は省略されます。

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `blockHash` | string | 含まれるブロックのハッシュ（16進数） |
| `transactionCbor` | string | トランザクションの生CBOR（16進数）。`--input-chainsync-include-cbor`指定時だけ含まれます |
| `proposalProcedures` | array | このトランザクションで提案されたガバナンスアクション |
| `votingProcedures` | array | このトランザクションで行われた投票 |
| `drepCertificates` | array | DRepの登録・更新・退任の証明書 |
| `voteDelegationCertificates` | array | 投票委任の証明書 |
| `committeeCertificates` | array | 憲法委員会のホットキー承認・コールドキー辞任の証明書 |

アンカーオブジェクトは常にシリアライズされ、アンカーがない場合は`url`と`dataHash`が空文字列になります。証明書の`deposit`は値が0の場合に省略されます。

各配列の項目は次の情報を含みます。

- `proposalProcedures[]`: `index`（トランザクション内の提案インデックス）、`deposit`（提案にロックされたlovelace）、`rewardAccount`（預託金の返還先ステークアドレス）、`actionType`（`ParameterChange`、`HardForkInitiation`、`TreasuryWithdrawal`、`NoConfidence`、`UpdateCommittee`、`NewConstitution`、`Info`、`Unknown`のいずれか）、`actionData`（アクション固有のデータ）、`anchor`（提案メタデータの`url`と`dataHash`）
- `votingProcedures[]`: `voterType`（`DRep`、`SPO`、`CCHot`、`Unknown`のいずれか）、`voterHash`、`voterId`、`govActionTxId`、`govActionIndex`、`vote`（`Yes`、`No`、`Abstain`、`Unknown`のいずれか）、`anchor`
- `drepCertificates[]`: `certificateType`（`Registration`、`Update`、`Deregistration`のいずれか）、`drepHash`、`drepId`、`deposit`、`anchor`
- `voteDelegationCertificates[]`: `certificateType`（`VoteDelegation`、`StakeVoteDelegation`、`VoteRegistrationDelegation`、`StakeVoteRegistrationDelegation`のいずれか）、`stakeCredential`、`drepType`（`KeyHash`、`ScriptHash`、`Abstain`、`NoConfidence`のいずれか）、該当する場合の`drepHash`と`drepId`、複合ステーク・投票委任の場合の`poolKeyHash`、`deposit`
- `committeeCertificates[]`: `certificateType`（`AuthHot`または`ResignCold`）、`coldCredential`、`AuthHot`の場合の`hotCredential`、`anchor`

#### ガバナンスイベントのフィルタリング

`input.governance`イベントには`--filter-drep`、`--filter-pool`、`--filter-address`が適用されます。リスト内のデータのいずれかがフィルター値に一致すると、イベントはそのフィルターに一致します。

- `--filter-drep`は、DRep証明書、DRepへの委任を示す投票委任証明書、DRepが投票者である投票手続きに一致します。
- `--filter-pool`は、SPOとしてプールが行った投票手続きと、プールのキー ハッシュを参照する投票委任証明書に一致します。
- `--filter-address`はアドレスの種類で照合対象が異なります。ステークアドレス（`stake1...`）は提案の`rewardAccount`、資金引き出し先アドレス、投票委任証明書のステーク資格情報に一致します。支払いアドレス（`addr1...`）は資金引き出し先アドレスだけに一致します。
- `--filter-asset`と`--filter-policy`はガバナンスイベントに適用されません。`input.governance`イベントはこれらのフィルターをそのまま通過します。

`--filter-drep`は、Bech32形式の`drep1...`と`drep_script1...`を受け付けます。Bech32をデコードしたペイロードが29バイトの場合だけ先頭の1バイトを除去し、28バイトの資格情報ハッシュとして扱います。その他の長さは無視します。16進数形式にはヘッダーを付けず、56文字の生の資格情報ハッシュを指定します。16進数の値から先頭バイトを除去しません。

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

```
  --input-chainsync-state-path string
```

> ChainSyncカーソルを再起動後も保持するSQLiteデータベースファイルのパスを指定します。未設定の場合、カーソルを保持しません。
>
> [ChainSyncカーソル永続化の詳細](./chainsync-cursor-persistence.md)を参照してください。

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
> 推奨される設定方法は、`--output-log-level`、環境変数の`OUTPUT_LOG_LEVEL`、YAMLの`plugins.output.log.level`です。YAMLの読み込みでは、後方互換性のためトップレベルの`logging.level`も受け付けます。`plugins.output.log.level`が未設定の場合に限り、`logging.level`の値を`plugins.output.log.level`へ移行します。両方が設定されている場合は、`plugins.output.log.level`を優先します。設定を保存すると、最新の形式だけを書き込み、`logging.level`は保存しません。旧形式の値が不正な場合は、引き続きエラーになります。旧形式の`--logging-level`フラグと`LOGGING_LEVEL`環境変数はサポートしません。
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
> プッシュトークンの取得またはFCM送信で発生したエラーは`ErrorChan`から通知されます。FCMへの各HTTPリクエストは10秒で打ち切られます。
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

```
  --output-signal-endpoint string
```

> signal-cliデーモンのHTTP JSON-RPC URLを指定します（デフォルト `http://127.0.0.1:8081/api/v1/rpc`）。
<br />

```
  --output-signal-account string
```

> 複数アカウントのデーモンで使用するSignalアカウントを指定します（デフォルトは空）。
<br />

```
  --output-signal-recipients string
```

> Signalの受信者番号またはIDをカンマ区切りで指定します（デフォルトは空）。少なくとも1つの受信者が必要です。
<br />

```
  --output-signal-event-types string
```

> 選択するイベントタイプをカンマ区切りで指定します（デフォルト `blocks,rollbacks,governance`）。少なくとも1つのタイプが必要です。
<br />

> [Signal出力の詳細](./signal.md)を参照してください。

```
  --output-nats-servers string
```

> NATSサーバーURLをカンマ区切りで指定します（デフォルト `nats://127.0.0.1:4222`）。少なくとも1つのURLが必要です。各URLは`nats://`または`tls://`で始め、認証情報とパスを含めないでください。ポートを指定する場合は`1`から`65535`の範囲が必要です。
<br />

```
  --output-nats-token string
```

> 任意のNATS認証トークンを指定します（デフォルトは空）。
<br />

```
  --output-nats-subject-prefix string
```

> イベントsubjectのプレフィックスを指定します（デフォルト `adder.events`）。
<br />

```
  --output-nats-event-types string
```

> 選択するイベントタイプをカンマ区切りで指定します（デフォルト `blocks,rollbacks,governance`）。少なくとも1つのタイプが必要です。
<br />

> [NATS出力の詳細](./nats.md)を参照してください。

```
  --output-webhook-state-path string
```

> 再起動後も保留中の配信を保持するSQLiteファイルへのパスを指定します（デフォルトは空）。
<br />

```
  --output-webhook-max-pending int
```

> 保持する保留中の配信の最大数を指定します（デフォルト `1024`）。`state-path`を設定する場合は`11`以上が必要です。

> [再起動安全なWebhook配信の詳細](./webhook-durability.md)を参照してください。

***

```
  --output-telegram-settings-file string
```

> Telegram通知設定を保存するローカルYAMLファイルへのパスを指定します（デフォルトは空）。
<br />

```
  --output-telegram-operator-user-ids string
```

> グループ設定の変更を許可するTelegramユーザーIDをカンマ区切りで指定します（デフォルトは空）。各IDは正のTelegramユーザーIDである必要があります。
<br />

```
  --output-slack-webhook-urls string
```

> Slack受信Webhook URLをカンマ区切りで指定します（デフォルトは空）。各URLはHTTPS URLである必要があります。
<br />

```
  --output-slack-event-types string
```

> Slackへ配信するイベントタイプをカンマ区切りで指定します（デフォルト `blocks,transactions,rollbacks,governance`）。
<br />

> [Slack出力の詳細](./slack.md)を参照してください。

```
  --output-discord-bot-token string
```

> Discordボットトークンを指定します（デフォルトは空）。
<br />

```
  --output-discord-application-id string
```

> DiscordアプリケーションIDを指定します（デフォルトは空）。
<br />

```
  --output-discord-guild-id string
```

> 許可するDiscordサーバーIDを指定します（デフォルトは空）。
<br />

```
  --output-discord-channel-id string
```

> 許可するDiscordチャンネルIDを指定します（デフォルトは空）。
<br />

```
  --output-discord-event-types string
```

> イベントタイプをカンマ区切りで指定します（デフォルト `blocks,rollbacks,governance`）。
<br />

> [Discord出力の詳細](./discord.md)を参照してください。

```
  --output-matrix-homeserver-url string
```

> MatrixホームサーバーのベースURLを指定します（デフォルトは空）。
<br />

```
  --output-matrix-access-token string
```

> Matrixアクセストークンを指定します（デフォルトは空）。
<br />

```
  --output-matrix-room-ids string
```

> MatrixルームIDをカンマ区切りで指定します（デフォルトは空）。少なくとも1つのルームが必要です。
<br />

```
  --output-matrix-event-types string
```

> イベントタイプをカンマ区切りで指定します（デフォルト `blocks,rollbacks,governance`）。

> [Matrix出力の詳細](./matrix.md)を参照してください。

***

```
  --output-rabbitmq-url string
```

> AMQPブローカーURLを指定します（デフォルト `amqp://127.0.0.1:5672/`）。
<br />

```
  --output-rabbitmq-exchange string
```

> 既存のexchangeを指定します。空の場合はデフォルトexchangeを使用します（デフォルトは空）。
<br />

```
  --output-rabbitmq-routing-key string
```

> デフォルトexchangeで使用するrouting keyまたはキュー名を指定します（デフォルト `adder.events`）。
<br />

```
  --output-rabbitmq-persistent
```

> 永続メッセージを発行します（デフォルト `true`）。
<br />

```
  --output-rabbitmq-event-types string
```

> 選択するイベントタイプをカンマ区切りで指定します（デフォルト `blocks,rollbacks,governance`）。
<br />

```
  --output-mqtt-broker string
```

> MQTT 5ブローカーのTCPまたはTLS URLを指定します（デフォルト `mqtt://127.0.0.1:1883`）。
<br />

```
  --output-mqtt-client-id string
```

> MQTTクライアント識別子を指定します（デフォルト `adder-output`）。
<br />

```
  --output-mqtt-username string
```

> 任意のMQTTユーザー名を指定します（デフォルトは空）。
<br />

```
  --output-mqtt-password string
```

> 任意のMQTTパスワードを指定します（デフォルトは空）。
<br />

```
  --output-mqtt-topic-prefix string
```

> イベントトピックのプレフィックスを指定します（デフォルト `adder/events`）。
<br />

```
  --output-mqtt-qos int
```

> MQTT発行のQoSを指定します（デフォルト `1`）。指定できる値は`0`、`1`、`2`です。
<br />

```
  --output-mqtt-event-types string
```

> イベントタイプをカンマ区切りで指定します（デフォルト `blocks,rollbacks,governance`）。
<br />

```
  --output-pubsub-project-id string
```

> Google CloudプロジェクトIDを指定します（デフォルトは空）。
<br />

```
  --output-pubsub-topic-id string
```

> Pub/SubトピックIDを指定します（デフォルトは空）。
<br />

```
  --output-pubsub-event-types string
```

> イベントタイプをカンマ区切りで指定します（デフォルト `blocks,rollbacks,governance`）。
<br />

```
  --output-postgres-database-url string
```

> PostgreSQL接続URLを指定します（デフォルトは空）。
<br />

```
  --output-postgres-event-types string
```

> 選択するイベントタイプをカンマ区切りで指定します（デフォルト `blocks,transactions,rollbacks,governance,drep-registration,drep-update,drep-retirement`）。

***

```
  --output-clickhouse-url string
```

> ClickHouse HTTP originを指定します（デフォルト `http://127.0.0.1:8123`）。
<br />

```
  --output-clickhouse-database string
```

> ClickHouseデータベースを指定します（デフォルト `default`）。
<br />

```
  --output-clickhouse-username string
```

> ClickHouseユーザーを指定します（デフォルト `default`）。
<br />

```
  --output-clickhouse-password string
```

> 任意のClickHouseパスワードを指定します（デフォルトは空）。
<br />

```
  --output-clickhouse-event-types string
```

> 選択するイベントタイプをカンマ区切りで指定します（デフォルト `blocks,transactions,rollbacks,governance,drep-registration,drep-update,drep-retirement`）。
<br />

> [ClickHouse出力の詳細](./clickhouse.md)を参照してください。

```
  --output-elasticsearch-url string
```

> Elasticsearch origin URLを指定します（デフォルト `http://127.0.0.1:9200`）。
<br />

```
  --output-elasticsearch-index string
```

> バージョン付きインデックス名を指定します（デフォルト `adder-events-v1`）。
<br />

```
  --output-elasticsearch-api-key string
```

> 任意のElasticsearch APIキーを指定します（デフォルトは空）。
<br />

```
  --output-elasticsearch-event-types string
```

> イベントタイプをカンマ区切りで指定します（デフォルト `blocks,transactions,rollbacks,governance,drep-registration,drep-update,drep-retirement`）。
<br />

```
  --output-s3-region string
```

> AWSリージョンを指定します（デフォルトは空）。
<br />

```
  --output-s3-bucket string
```

> S3バケットを指定します（デフォルトは空）。
<br />

```
  --output-s3-prefix string
```

> 相対オブジェクトキーのプレフィックスを指定します（デフォルト `adder/events`）。
<br />

```
  --output-s3-event-types string
```

> 選択するイベントタイプをカンマ区切りで指定します（デフォルト `blocks,transactions,rollbacks,governance,drep-registration,drep-update,drep-retirement`）。
<br />

```
  --output-sqs-region string
```

> AWSリージョンを指定します（デフォルトは空）。
<br />

```
  --output-sqs-group-id string
```

> メッセージグループIDを指定します（FIFOでは必須）（デフォルトは空）。
<br />

```
  --output-sqs-event-types string
```

> イベントタイプをカンマ区切りで指定します（デフォルト `blocks,rollbacks,governance`）。
<br />

```
  --output-sqs-queue-url string
```

> SQSキューURLを指定します（デフォルトは空）。
<br />

```
  --output-sns-region string
```

> AWSリージョンを指定します（デフォルトは空）。
<br />

```
  --output-sns-group-id string
```

> メッセージグループIDを指定します（FIFOでは必須）（デフォルトは空）。
<br />

```
  --output-sns-event-types string
```

> イベントタイプをカンマ区切りで指定します（デフォルト `blocks,rollbacks,governance`）。
<br />

```
  --output-sns-topic-arn string
```

> SNSトピックARNを指定します（デフォルトは空）。
<br />

```
  --output-sns-max-message-bytes int
```

> SNSトピックに設定されたメッセージサイズ上限を指定します（デフォルト `262144`）。
<br />

```
  --output-redis-address string
```

> RedisのTCP `host:port`アドレスを指定します（デフォルト `127.0.0.1:6379`）。
<br />

```
  --output-redis-username string
```

> 任意のRedis ACLユーザー名を指定します（デフォルトは空）。
<br />

```
  --output-redis-password string
```

> 任意のRedisパスワードを指定します（デフォルトは空）。
<br />

```
  --output-redis-tls
```

> Redis接続にTLSを使用します（デフォルト `false`）。Redisの認証情報を使用する場合はTLSを有効にする必要があります。
<br />

```
  --output-redis-stream string
```

> Redis Streamキーを指定します（デフォルト `adder.events`）。
<br />

```
  --output-redis-event-types string
```

> イベントタイプをカンマ区切りで指定します（デフォルト `blocks,rollbacks,governance`）。
<br />

```
  --output-kafka-brokers string
```

> Kafka bootstrapの`host:port`アドレスをカンマ区切りで指定します（デフォルト `127.0.0.1:9092`）。
<br />

```
  --output-kafka-topic string
```

> Kafkaトピックを指定します（デフォルト `adder.events`）。
<br />

```
  --output-kafka-username string
```

> 任意のSASL PLAINユーザー名を指定します（デフォルトは空）。
<br />

```
  --output-kafka-password string
```

> 任意のSASL PLAINパスワードを指定します（デフォルトは空）。
<br />

```
  --output-kafka-tls
```

> ブローカー接続にTLSを使用します（デフォルト `false`）。
<br />

```
  --output-kafka-event-types string
```

> イベントタイプをカンマ区切りで指定します（デフォルト `blocks,rollbacks,governance`）。

> [Kafka出力の詳細](./kafka.md)を参照してください。

***

<a id="managed-routing"></a>

## 管理ルーティング:

```
  --managed-config-dir string
```

> [管理ルーティングの詳細](./014-managed-routing.md)。この設定ディレクトリを指定すると管理ルーティングが有効になります（デフォルトは空）。設定ディレクトリには有効なマニフェストが必要です。
<br />

```
  --managed-credentials-dir string
```

> 管理モードで使用する認証情報ディレクトリを指定します（デフォルトは空）。認証情報ファイルはアクセスを制限した通常ファイルでなければなりません。
<br />

```
  --managed-log-dir string
```

> 管理イベントファイルを保存する信頼済みローカルディレクトリを指定します（デフォルトは空）。出力ファイル名は所有する顧客IDで始まる必要があります。
<br />

```
  --managed-allow-hosts string
```

> Webhookで使用を許可するホスト名を指定します（デフォルトは空）。リモートWebhookのホスト名を許可リストに含めます。
<br />

```
  --managed-allow-local-targets
```

> ループバックのWebhook受信先を許可します（デフォルトは`false`）。ローカルテスト用に明示的に有効化します。
<br />

```
  --managed-address string
```

> 管理APIのプライベートリスナーアドレスを指定します（デフォルト `127.0.0.1:8081`）。数値で指定したループバックアドレスだけを指定できます。
<br />

```
  --managed-token-file string
```

> オペレーターAPIトークンを含むアクセス制限ファイルへのパスを指定します（デフォルトは空）。所有者だけがアクセスできる通常ファイルで、トークンは32文字以上でなければなりません。

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
| `network.name` | サポートされるCardanoネットワーク`mainnet`、`preprod`、`preview`、`dijkstra`のいずれかを指定します。必須です。 |
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
