---
title: Command Reference Guide
description: List of Adder Commands.
---

# <ins>List of commands:</ins>

<br />

## Configuration:


```
 --config string
```
 
> path to config file to load

> If the same setting is provided through multiple methods, Adder uses this precedence order: CLI flags > environment variables > YAML configuration file > defaults.

### Optional Kupo input resolution

Kupo resolves transaction input references to the outputs they spend. This lets
address, asset, and policy filters inspect senders and spent assets through the
event's `resolvedInputs`, in addition to inspecting its new outputs.

Set a shared endpoint with top-level YAML `kupo_url` or the `KUPO_URL`
environment variable. There is no top-level `--kupo-url` flag. The ChainSync
and mempool inputs also expose `plugins.input.<name>.kupo-url` in YAML and the
input-specific flags listed below. An input-specific YAML value replaces the
top-level YAML fallback. Environment variables override YAML, and an explicit
input-specific flag overrides both. Passing an empty input-specific flag, such
as `--input-mempool-kupo-url=`, disables Kupo for that input.

Kupo must use the same Cardano network as Adder and must index every output
that Adder may need to resolve. See [Resolve transaction senders with Kupo](/guides/adder/kupo-input-resolution/)
for configuration and a sender-address example.

***

## Managed routing:

Managed routing starts when `--managed-config-dir` is set. See the [managed routing reference](/guides/adder/014-managed-routing/) for file schemas, API semantics, live-tail validation, limits, supported adapters, and delivery behavior.

```
  --managed-config-dir string
```

> path to the managed routing configuration directory (default empty)

> The directory must contain a valid managed configuration bundle before managed mode starts.

<br />

```
  --managed-credentials-dir string
```

> restricted managed credential directory (default empty)

> Credential files must be restricted files.

<br />

```
  --managed-log-dir string
```

> trusted local managed event file directory (default empty)

> Managed event files must stay within this trusted local directory.

<br />

```
  --managed-allow-hosts stringSlice
```

> operator-approved webhook hostnames (default empty)

> Remote webhook targets must use an approved hostname.

<br />

```
  --managed-allow-local-targets
```

> allow loopback webhook receivers for local tests (default false)

> Local webhook targets require this explicit exception.

<br />

```
  --managed-address string
```

> private managed API listener (loopback only) (default `127.0.0.1:8081`)

> The address must use a literal loopback address.

<br />

```
  --managed-token-file string
```

> restricted file containing the operator API token (default empty)

> The token file must be a restricted regular file.

<br />

***

## Filter:

```
  --filter-address string
```
  
> specifies address(es) to filter on (comma-separated)
<br />


```
  --filter-asset string
```
  
> specifies the asset fingerprint (asset1xxx) to filter on
<br />


```
  --filter-drep string
```
  
> specifies DRep ID(s) to filter on (comma-separated, hex or bech32)
<br />


```
  --filter-policy string
```
  
> specifies asset policy ID to filter on
<br />

```
  --filter-pool string
```
  
> specifies Pool ID(s) to filter on (comma-separated)
<br />

```
  --filter-type string
```
  
> specifies event type to filter on
>
> For `--filter-address`, `--filter-asset`, `--filter-policy`, `--filter-pool`, `--filter-drep`, and `--filter-type`, Adder trims surrounding whitespace from comma-separated entries and ignores empty entries.
>
> **Event Types:**
> 1. `input.block` - A new block was observed.
> 2. `input.rollback` -	A rollback occurred to a previous chain point.
> 3. `input.transaction` -	A transaction was seen in a block.
> 4. `input.governance` -	A governance-related event (CIP-1694 era).
> 5. `input.drep-registration` - A DRep registration occurred.
> 6. `input.drep-update` - Adder emits a DRep update event.
> 7. `input.drep-retirement` - Adder emits a DRep retirement event.

### Filter values and combinations

Each filter option accepts a comma-separated list. Adder matches an event when
it matches any value in that option.

| Option | Example |
| --- | --- |
| `--filter-address` | `--filter-address addr1qyht4ja0zcn45qvyx477qlyp6j5ftu5ng0prt9608dxp6l2j2c79gy9l76sdg0xwhd7r0c0kna0tycz4y5s6mlenh8pq4jxtdy,addr1q88zh70hsfjkqnexte4u5ewsfpjq3dxrhlvr3ha7k99p3y8rtwtt945eg3tvmg09t8f4ug4dw24nednp598w4vlycgqsry583e` |
| `--filter-pool` | `--filter-pool pool1z5uqdk7dzdxaae5633fqfcu2eqzy3a3rgtuvy087fdld7yws0xt,a81f156d98e1f02123abccdef5439a89d71fa9d8b76c8db028c7df0e` |
| `--filter-drep` | `--filter-drep drep1p4h4ea7y70ede2wy7x3t83x4umm63wwq68308f94cmt7szexmnr,81f156d98e1f02123abccdef5439a89d71fa9d8b76c8db028c7df0e1` |

Different filter kinds combine with **AND**. The one exception combines
`--filter-pool` and `--filter-drep` with **OR**. Any other configured filter
still combines with **AND**. For example, an event must match the address
filter and either the pool or DRep filter when all three options are set.

Adder applies each filter only to its supported event types. For example,
`--filter-drep` does not apply to `input.block` events, so DRep filtering never
removes a block event. A filter does not remove an event type to which it does
not apply.

### Filter flags, environment variables, and YAML keys

Filter flags omit the plugin name, but environment variables and YAML keys use
the plugin type and name. The shortened flag name therefore differs from the
other two names.

| Flag | Environment variable | YAML key |
| --- | --- | --- |
| `--filter-address` | `FILTER_CARDANO_ADDRESS` | `plugins.filter.cardano.address` |
| `--filter-asset` | `FILTER_CARDANO_ASSET` | `plugins.filter.cardano.asset` |
| `--filter-policy` | `FILTER_CARDANO_POLICY` | `plugins.filter.cardano.policy` |
| `--filter-pool` | `FILTER_CARDANO_POOL` | `plugins.filter.cardano.pool` |
| `--filter-drep` | `FILTER_CARDANO_DREP` | `plugins.filter.cardano.drep` |
| `--filter-type` | `FILTER_EVENT_TYPE` | `plugins.filter.event.type` |
        
***

## Governance events

The chainsync input emits one `input.governance` event for each transaction
that contains Conway-era governance data, including proposal procedures,
voting procedures, DRep certificates, vote delegation certificates, or
committee certificates. The event collects all governance data from that
transaction and appears in addition to its `input.transaction` event. Adder
emits no governance event when a transaction contains no governance data.

### Governance event context

The `context` object identifies the transaction and its chain position:

| Field | Meaning |
| --- | --- |
| `transactionHash` | Transaction hash in hexadecimal. |
| `blockNumber` | Height of the containing block. |
| `slotNumber` | Slot of the containing block. |
| `transactionIdx` | Transaction index within the block. |
| `networkMagic` | Network magic of the connected node. |

### Governance event payload

The `payload` object always contains `blockHash` and contains
`transactionCbor` only when the input uses `--input-chainsync-include-cbor`. It can
also contain the following arrays; Adder omits an array when it has no items:

| Field | Meaning |
| --- | --- |
| `blockHash` | Hash of the containing block in hexadecimal. |
| `transactionCbor` | Raw transaction CBOR in hexadecimal. |
| `proposalProcedures` | Governance actions proposed in the transaction. |
| `votingProcedures` | Votes cast in the transaction. |
| `drepCertificates` | DRep registration, update, and retirement certificates. |
| `voteDelegationCertificates` | Vote delegation certificates. |
| `committeeCertificates` | Constitutional Committee hot key authorization and cold key resignation certificates. |

Each `proposalProcedures` item reports its transaction `index`, lovelace
`deposit`, deposit return `rewardAccount`, `actionType`, action-specific
`actionData`, and an `anchor` with `url` and `dataHash`. `actionType` identifies
one of `ParameterChange`, `HardForkInitiation`, `TreasuryWithdrawal`,
`NoConfidence`, `UpdateCommittee`, `NewConstitution`, `Info`, or `Unknown`.

Each `votingProcedures` item reports `voterType` (`DRep`, `SPO`, `CCHot`, or
`Unknown`), the voter `voterHash` and `voterId`, the target governance action's
`govActionTxId` and `govActionIndex`, its `vote` (`Yes`, `No`, `Abstain`, or
`Unknown`), and an `anchor` with `url` and `dataHash`.

Each `drepCertificates` item reports `certificateType` (`Registration`,
`Update`, or `Deregistration`), the DRep `drepHash` and `drepId`, an optional
lovelace `deposit`, and an `anchor`. Each `voteDelegationCertificates` item
reports `certificateType`, the delegating `stakeCredential`, and `drepType`
(`KeyHash`, `ScriptHash`, `Abstain`, or `NoConfidence`). Key and script DRep
delegations also report `drepHash` and `drepId`. Combined stake and vote
delegation types report `poolKeyHash` and an optional `deposit`.

Each `committeeCertificates` item reports `certificateType` (`AuthHot` or
`ResignCold`), the committee `coldCredential`, and `hotCredential` for
`AuthHot`, plus an `anchor`.

Adder always serializes governance `anchor` objects. When no anchor exists,
their `url` and `dataHash` values are empty strings. Adder omits zero-valued
certificate `deposit` fields.

### Filtering governance events

The following filters inspect `input.governance` data:

- `--filter-drep` checks DRep certificates, vote delegation certificates that
  delegate to the DRep, and voting procedures where the DRep casts the vote.
- `--filter-pool` checks SPO votes and pool references in vote delegation
  certificates.
- `--filter-address` checks different data for each address type:
  - A stake address checks governance reward accounts, treasury withdrawal
    destinations, and vote delegation credentials.
  - A payment address checks treasury withdrawal destinations only.

Use a stake address to follow an account's governance activity. The
`--filter-policy` and `--filter-asset` options do not filter governance events.

`--filter-drep` accepts these DRep forms:

- `drep1...` and `drep_script1...` bech32 values decode to a credential hash.
  Adder accepts a decoded payload of 28 bytes. When the decoded payload is 29
  bytes, Adder removes the leading byte and uses the remaining 28 bytes. Adder
  ignores all other decoded lengths.
- Hex input must contain the raw 28-byte credential hash as exactly 56
  hexadecimal characters. Adder does not remove a header byte from hex input.

## Input:

```
  --input string
```
  
> input plugin to use, 'list' to show available (default "chainsync")
>
> **Input Types:**
> 1. `chainsync` - syncs blocks from a Cardano node using either NtC (node-to-client) or NtN (node-to-node)
> 2. `mempool` - reads unconfirmed transactions from a Cardano node's mempool via LocalTxMonitor (NtC)
<br />

### input-chainsync:

```
  --input-chainsync-address string
```
  
> specifies the TCP address of the node to connect to in the form 'host:port'
<br />

 ```
  --input-chainsync-auto-reconnect
```
  
> auto-reconnect if the connection is broken (default true)
<br />

```
  --input-chainsync-delay-confirmations uint
```
  
> number of confirmations required before emitting events
<br />

```
  --input-chainsync-include-cbor
```
  
> include original CBOR for block/transaction in events
<br />

```
  --input-chainsync-intersect-point string
```
  
> start syncing at the specified chain point(s) in '<slot>.<hash>' format
>
> Adder trims whitespace from each comma-separated entry and ignores empty entries.
>
> If the value contains only whitespace or empty entries after trimming, Adder follows the configured `--input-chainsync-intersect-tip` behavior.
>
> Adder treats malformed non-empty `<slot>.<hash>` entries as errors.
>
<br />

```
  --input-chainsync-intersect-tip
```
  
> start syncing at the chain tip (defaults to chain genesis) (default true)
<br />

```
  --input-chainsync-network string
```
  
> specifies a well-known Cardano network name: `mainnet`, `preprod`, `preview`, or `dijkstra` (default "mainnet")
<br />

```
  --input-chainsync-network-magic uint
```
  
> specifies the network magic value to use, overrides 'network'
<br />

```
  --input-chainsync-ntc-tcp
```
  
> use the NtC (node-to-client) protocol over TCP, for use when exposing a node's UNIX socket via socat or similar
<br />

```
  --input-chainsync-socket-path string
```
  
> specifies the path to the UNIX socket to connect to

<br />

```
  --input-chainsync-state-path string
```
  
> path to a SQLite database file for persisting the chainsync cursor across restarts (default empty)
>
> Leave this option empty to disable cursor persistence. Set a SQLite filename to create or reopen the cursor file and resume from the persisted state after a restart.
>
> See the [ChainSync cursor persistence reference](/guides/adder/chainsync-cursor-persistence/) for restart behavior, flush timing, rollback handling, and Go API details.

***

```
  --input-chainsync-kupo-url string
```
  
> optional Kupo HTTP endpoint for resolving transaction inputs
<br />


### input-mempool:

```
  --input-mempool-address string
```
  
> TCP address (host:port); requires ntc-tcp=true
<br />

```
  --input-mempool-include-cbor
```
  
> include transaction CBOR in events
<br />

```
  --input-mempool-kupo-url string
```
  
> optional Kupo HTTP endpoint for resolving on-chain transaction inputs (for example, `http://127.0.0.1:1442`). Mempool outputs created during the same poll are resolved without Kupo. Kupo must index the outputs you need or on-chain resolution will be empty.
<br />

```
  --input-mempool-network string
```
  
> well-known Cardano network name (`mainnet`, `preprod`, `preview`, or `dijkstra`) (default "mainnet")
<br />

```
  --input-mempool-network-magic uint
```
  
> network magic value (overrides network name)
<br />

```
  --input-mempool-ntc-tcp
```
  
> use NtC over TCP (e.g. when exposing socket via socat)
<br />

```
  --input-mempool-poll-interval string
```
  
> how often to poll the mempool (e.g. 5s, 1m) (default "5s")
<br />

```
  --input-mempool-socket-path string
```
  
> path to the node's UNIX socket (NtC)

***

## Output:

```
  --output string
```
  
> output plugin to use, `notify-json` for notification NDJSON, or `list` to show available (default "log")
>
<br />

```
  --output-log-level string
```
  
> sets the `output.log` logging threshold. Accepted values are `debug`, `info`, `warn`, and `error` (default "info"). `debug` and `info` emit event records; `warn` and `error` suppress event records. The selected output's threshold also filters Adder application diagnostics on stderr.
>
> Configure the same setting through YAML `plugins.output.log.level` or the `OUTPUT_LOG_LEVEL` environment variable. During YAML loading, Adder accepts the legacy top-level `logging.level` setting and migrates it to `plugins.output.log.level` only when the modern key is absent. An explicit `plugins.output.log.level` value takes precedence. Adder writes only the modern `plugins.output.log.level` form when it saves configuration. Invalid legacy values still cause a configuration error. The old `--logging-level` flag, `LOGGING_LEVEL` environment variable, and `Config.Logging` configuration remain unsupported. Set `--output-log-level`, `OUTPUT_LOG_LEVEL`, or `plugins.output.log.level` instead.
<br />

```
  --output-log-format string
```
  
> specifies the output format: text (human-readable, default) or json (machine-parseable) (default "text")
<br />

```
  --output-notify-json-config string
```
  
> path to the versioned notification JSON configuration used by `notify-json`
>
> required when `--output notify-json` is selected
<br />

```
  --output-notify-title string
```
  
> specifies the title to use (default "Adder")
<br />

```
  --output-push-accessTokenUrl string
```
  
> specifies the url to get access token from (default `https://www.googleapis.com/auth/firebase.messaging`)
<br />

```
  --output-push-serviceAccountFilePath string
```
  
> specifies the path to the service account file. This value must be non-empty when using `--output push`.
>
> The service-account JSON must contain `project_id` as a non-empty string. Missing, non-string, or empty `project_id` values cause startup/configuration failure.
>
> Push token acquisition and FCM delivery errors reach the output `ErrorChan`. Each FCM HTTP request has a 10-second limit.
>
<br />

```
  --output-telegram-bot-token string
```
  
> Telegram Bot API token (from @BotFather)
<br />

```
  --output-telegram-chat-id string
```
  
> Telegram chat ID to send messages to (user, group, or channel)
<br />

```
  --output-telegram-disable-preview
```
  
> disable link preview in messages
<br />

```
  --output-telegram-parse-mode string
```
  
> message parse mode (HTML, Markdown, MarkdownV2) (default "HTML")
<br />

```
  --output-webhook-format string
```
  
> specifies the webhook payload format to use (default "adder")
<br />

```
  --output-webhook-password string
```
  
> specifies the password for basic auth
<br />

```
  --output-webhook-tls-skip-verify
```
  
> skip tls verification (for self-signed certs)
<br />

```
  --output-webhook-url string
```
  
> specifies the url to use (default `http://localhost:3000`)
<br />

```
  --output-webhook-username string
```
  
> specifies the username for basic auth

<br />

```
  --output-webhook-state-path string
```
  
> SQLite file for restart-safe pending webhook deliveries (default empty)
>
> Set a persistent filename to enable durable delivery. Leave the value empty to disable durable delivery.

<br />

```
  --output-webhook-max-pending int
```
  
> maximum persisted pending webhook deliveries (default `1024`)
>
> Durable mode requires `--output-webhook-state-path` and a value of at least `11` for this option.

<br />

```
  --output-signal-endpoint string
```
  
> signal-cli daemon HTTP JSON-RPC endpoint (default `http://127.0.0.1:8081/api/v1/rpc`)
>
> Use the `/api/v1/rpc` path. HTTP endpoints must use loopback addresses; remote endpoints must use HTTPS.

<br />

```
  --output-signal-account string
```
  
> Signal account for a multi-account daemon (default empty)

<br />

```
  --output-signal-recipients string
```
  
> comma-separated Signal recipient numbers or IDs (default empty)
>
> Set at least one recipient.

<br />

```
  --output-signal-event-types string
```
  
> comma-separated Signal event types (default `blocks,rollbacks,governance`)
>
> Select one or more of `blocks`, `rollbacks`, or `governance`.
>
> See the [Signal output reference](/guides/adder/signal/).

<br />

```
  --output-nats-servers string
```
  
> comma-separated NATS server URLs (default `nats://127.0.0.1:4222`)
>
> Each URL must use the `nats://` or `tls://` scheme and cannot include credentials, a query, a fragment, or a path other than `/`. Explicit ports must be between `1` and `65535`.

<br />

```
  --output-nats-token string
```
  
> optional NATS authentication token (default empty)

<br />

```
  --output-nats-subject-prefix string
```
  
> subject prefix for event subjects (default `adder.events`)
>
> Use a non-empty, dot-separated prefix without whitespace, wildcards, or empty subject tokens.

<br />

```
  --output-nats-event-types string
```
  
> comma-separated NATS event types (default `blocks,rollbacks,governance`)
>
> Select one or more of `blocks`, `rollbacks`, or `governance`.
>
> See the [NATS output reference](/guides/adder/nats/).

<br />

```
  --output-telegram-settings-file string
```
  
> local YAML file for Telegram notification preferences (default empty)

<br />

```
  --output-telegram-operator-user-ids string
```
  
> comma-separated Telegram user IDs allowed to change group preferences (default empty)
>
> Every value must be a positive Telegram user ID.

<br />

```
  --output-slack-webhook-urls string
```
  
> comma-separated Slack incoming webhook URLs (default empty)
>
> Provide at least one URL. Each URL must use HTTPS and cannot include credentials.

<br />

```
  --output-slack-event-types string
```
  
> comma-separated Slack event types (default `blocks,transactions,rollbacks,governance`)
>
> Select one or more supported Slack event types.

> See the [Slack output reference](/guides/adder/slack/).

<br />

```
  --output-discord-bot-token string
```
  
> Discord bot token (default empty)

<br />

```
  --output-discord-application-id string
```
  
> Discord application ID (default empty)

<br />

```
  --output-discord-guild-id string
```
  
> allowed Discord server ID (default empty)

<br />

```
  --output-discord-channel-id string
```
  
> allowed Discord channel ID (default empty)

<br />

```
  --output-discord-event-types string
```
  
> comma-separated Discord event types (default `blocks,rollbacks,governance`)
>
> Select one or more supported Discord event types.

> See the [Discord bot output reference](/guides/adder/discord/).

<br />

```
  --output-matrix-homeserver-url string
```
  
> Matrix homeserver base URL (default empty)

<br />

```
  --output-matrix-access-token string
```
  
> Matrix access token (default empty)
>
> Set a non-empty access token.

<br />

```
  --output-matrix-room-ids string
```
  
> comma-separated Matrix room IDs (default empty)
>
> Provide at least one room ID. Each room ID must pass Matrix room ID validation.

<br />

```
  --output-matrix-event-types string
```
  
> comma-separated Matrix event types (default `blocks,rollbacks,governance`)
>
> Select one or more supported Matrix event types.

> See the [Matrix output reference](/guides/adder/matrix/).

<br />

```
  --output-rabbitmq-url string
```
  
> AMQP broker URL (default `amqp://127.0.0.1:5672/`)

<br />

```
  --output-rabbitmq-exchange string
```
  
> existing exchange; an empty value uses the default exchange (default empty)

<br />

```
  --output-rabbitmq-routing-key string
```
  
> routing key or queue name for the default exchange (default `adder.events`)
>
> Set a non-empty routing key.

<br />

```
  --output-rabbitmq-persistent
```
  
> publish persistent messages (default true)

<br />

```
  --output-rabbitmq-event-types string
```
  
> comma-separated RabbitMQ event types (default `blocks,rollbacks,governance`)
>
> Select one or more supported RabbitMQ event types.

<br />

```
  --output-mqtt-broker string
```
  
> MQTT 5 broker TCP or TLS URL (default `mqtt://127.0.0.1:1883`)

<br />

```
  --output-mqtt-client-id string
```
  
> MQTT client identifier (default `adder-output`)
>
> Set a non-empty client ID.

<br />

```
  --output-mqtt-username string
```
  
> optional MQTT username (default empty)

<br />

```
  --output-mqtt-password string
```
  
> optional MQTT password (default empty)

<br />

```
  --output-mqtt-topic-prefix string
```
  
> prefix for event topics (default `adder/events`)
>
> Use a non-empty topic prefix without wildcard characters.

<br />

```
  --output-mqtt-qos int
```
  
> MQTT publish QoS: `0`, `1`, or `2` (default `1`)
>
> Only `0`, `1`, and `2` are valid values.

<br />

```
  --output-mqtt-event-types string
```
  
> comma-separated MQTT event types (default `blocks,rollbacks,governance`)
>
> Select one or more supported MQTT event types.

<br />

```
  --output-pubsub-project-id string
```
  
> Google Cloud project ID (default empty)

<br />

```
  --output-pubsub-topic-id string
```
  
> Pub/Sub topic ID (default empty)

<br />

```
  --output-pubsub-event-types string
```
  
> comma-separated Pub/Sub event types (default `blocks,rollbacks,governance`)
>
> Select one or more supported Pub/Sub event types.

<br />

```
  --output-postgres-database-url string
```
  
> PostgreSQL connection URL (default empty)

<br />

```
  --output-postgres-event-types string
```
  
> comma-separated PostgreSQL event types (default `blocks,transactions,rollbacks,governance,drep-registration,drep-update,drep-retirement`)
>
> Select one or more supported PostgreSQL event types.

<br />

```
  --output-clickhouse-url string
```
  
> ClickHouse HTTP origin (default `http://127.0.0.1:8123`)

<br />

```
  --output-clickhouse-database string
```
  
> ClickHouse database (default `default`)

<br />

```
  --output-clickhouse-username string
```
  
> ClickHouse user (default `default`)

<br />

```
  --output-clickhouse-password string
```
  
> optional ClickHouse password (default empty)

<br />

```
  --output-clickhouse-event-types string
```
  
> comma-separated ClickHouse event types (default `blocks,transactions,rollbacks,governance,drep-registration,drep-update,drep-retirement`)
>
> Select one or more supported ClickHouse event types.

> See the [ClickHouse output reference](/guides/adder/clickhouse/).

<br />

```
  --output-elasticsearch-url string
```
  
> Elasticsearch origin URL (default `http://127.0.0.1:9200`)

<br />

```
  --output-elasticsearch-index string
```
  
> versioned index name (default `adder-events-v1`)

<br />

```
  --output-elasticsearch-api-key string
```
  
> optional Elasticsearch API key (default empty)

<br />

```
  --output-elasticsearch-event-types string
```
  
> comma-separated Elasticsearch event types (default `blocks,transactions,rollbacks,governance,drep-registration,drep-update,drep-retirement`)
>
> Select one or more supported Elasticsearch event types.

<br />

```
  --output-s3-region string
```
  
> AWS region (default empty)

<br />

```
  --output-s3-bucket string
```
  
> S3 bucket (default empty)

<br />

```
  --output-s3-prefix string
```
  
> relative object key prefix (default `adder/events`)

<br />

```
  --output-s3-event-types string
```
  
> comma-separated S3 event types (default `blocks,transactions,rollbacks,governance,drep-registration,drep-update,drep-retirement`)
>
> Select one or more supported S3 event types.

<br />

```
  --output-sqs-region string
```
  
> AWS region (default empty)

<br />

```
  --output-sqs-queue-url string
```
  
> SQS queue URL (default empty)

<br />

```
  --output-sqs-group-id string
```
  
> message group ID for FIFO queues (default empty)

<br />

```
  --output-sqs-event-types string
```
  
> comma-separated SQS event types (default `blocks,rollbacks,governance`)
>
> Select one or more supported SQS event types.

<br />

```
  --output-sns-region string
```
  
> AWS region (default empty)

<br />

```
  --output-sns-topic-arn string
```
  
> SNS topic ARN (default empty)

<br />

```
  --output-sns-group-id string
```
  
> message group ID for FIFO topics (default empty)

<br />

```
  --output-sns-max-message-bytes int
```
  
> configured SNS topic message size limit (default `262144`)

<br />

```
  --output-sns-event-types string
```
  
> comma-separated SNS event types (default `blocks,rollbacks,governance`)
>
> Select one or more supported SNS event types.

<br />

```
  --output-redis-address string
```
  
> Redis TCP host and port (default `127.0.0.1:6379`)
>
> The value must use `host:port` syntax.

<br />

```
  --output-redis-username string
```
  
> optional Redis ACL username (default empty)

<br />

```
  --output-redis-password string
```
  
> optional Redis password (default empty)

<br />

```
  --output-redis-tls
```
  
> use TLS for the Redis connection (default false)
>
> Enable TLS when `username` or `password` is set.

<br />

```
  --output-redis-stream string
```
  
> Redis Stream key (default `adder.events`)
>
> Set a non-empty stream key.

<br />

```
  --output-redis-event-types string
```
  
> comma-separated Redis event types (default `blocks,rollbacks,governance`)
>
> Select one or more supported Redis event types.

<br />

```
  --output-kafka-brokers string
```
  
> comma-separated Kafka bootstrap `host:port` addresses (default `127.0.0.1:9092`)

<br />

```
  --output-kafka-topic string
```
  
> Kafka topic (default `adder.events`)

<br />

```
  --output-kafka-username string
```
  
> optional SASL PLAIN username (default empty)

<br />

```
  --output-kafka-password string
```
  
> optional SASL PLAIN password (default empty)

<br />

```
  --output-kafka-tls
```
  
> use TLS for broker connections (default false)

<br />

```
  --output-kafka-event-types string
```
  
> comma-separated Kafka event types (default `blocks,rollbacks,governance`)
>
> Select one or more supported Kafka event types.

> See the [Kafka output reference](/guides/adder/kafka/).

> See the [webhook durability reference](/guides/adder/webhook-durability/).
***

## Notifications:

```
adder notifications validate --config <path> [--json]
```

> validates a notification JSON configuration
>
> `--config <path>` is required. Normal output reports validity and errors. `--json` emits the machine-readable validation result.
>

### Notification JSON configuration

The configuration uses JSON with `schemaVersion` set to `1`. Adder rejects unknown fields and multiple JSON values in the configuration file.

| Field | Description |
| --- | --- |
| `schemaVersion` | Required value: `1`. |
| `network.name` | Required supported Cardano network: `mainnet`, `preprod`, `preview`, or `dijkstra`. |
| `network.customAddress` and `network.customPort` | Optional custom node address and port. Set both fields together; `customPort` must be between `1` and `65535`. |
| `monitor.everything` | Set to `true` to monitor all supported targets. Set this field or configure at least one target in `wallets`, `dreps`, `pools`, `assets`, or `policies`. |
| `monitor.wallets` | Wallet addresses to monitor. |
| `monitor.dreps` | DRep IDs to monitor. `monitor.drepMatch` accepts `any` or `all`. |
| `monitor.pools` | Pool IDs to monitor. `monitor.poolMatch` accepts `any` or `all`. |
| `monitor.assets` | Asset fingerprints to monitor. `monitor.assetMatch` accepts `any` or `all`. |
| `monitor.policies` | Policy IDs to monitor. `monitor.policyMatch` accepts `any` or `all`. |
| `alerts` | Alert categories to enable: `incomingTransactions`, `outgoingTransactions`, `tokenTransfers`, `blocksMinted`, `chainRollbacks`, `poolParameterChanges`, `governanceProposals`, `votesCast`, `registrationChanges`, `assetActivity`, `policyActivity`, and `connectionIssues`. Enable at least one category. |
| `rateLimit.max` | Required value of `-1` to disable rate limiting, or `0` or greater. |
| `rateLimit.windowSeconds` | Required positive duration in seconds. |
| `connectionStaleSeconds` | Required staleness interval from `30` through `3600` seconds. |

Target lists must contain valid, nonduplicate wallet addresses, DRep IDs, pool IDs, asset fingerprints, or policy IDs. The notification network must match `--input-chainsync-network`. When a custom node is configured, its address and port must match `--input-chainsync-address`. The `notify-json` output requires the `chainsync` input.

### `notify-json` output

The `notify-json` output writes one JSON object per line to stdout. Each record uses schema version `1`. Status records report `starting`, `connected`, or `stale` states and include a timestamp and optional message. Notification records include `ruleId`, optional `eventType`, rendered `title` and `body`, plus the batching fields `batched` and `count`.

***
## Version:

```
  --version
```
  
> show version and exit



---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
