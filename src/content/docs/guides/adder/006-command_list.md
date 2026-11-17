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

> If the same setting is provided through multiple methods, Adder uses this precedence order: CLI flags > YAML configuration file > environment variables > defaults.

***

## Managed routing:

Managed routing starts when `--managed-config-dir` is set. See the [managed routing reference](./014-managed-routing.md) for file schemas, API semantics, live-tail validation, limits, supported adapters, and delivery behavior.

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
  
> specifies address to filter on
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
  
> specifies Pool ID to filter on
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
        
***

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

***

```
  --input-chainsync-kupo-url string
```
  
> kupo-url address
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
  
> Kupo API URL for resolving transaction inputs (e.g. http://localhost:1442). Kupo must index the outputs you need (e.g. run with --match "*") or resolution will be empty.
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
  
> sets the `output.log` logging threshold. Accepted values are `debug`, `info`, `warn`, and `error` (default "info"). `debug` and `info` emit event records; `warn` and `error` suppress event records. The threshold also filters Adder application diagnostics on stderr, even when another output plugin is selected.
>
> Configure the same setting with YAML `plugins.output.log.level` or the `OUTPUT_LOG_LEVEL` environment variable. Adder no longer provides the `--logging-level` flag. Adder accepts the legacy YAML `logging.level` setting and maps it to `plugins.output.log.level` when the replacement setting is absent. Adder ignores the old `LOGGING_LEVEL` environment variable.
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
> See the [Signal output reference](./signal.md).

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
> See the [NATS output reference](./nats.md).

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

> See the [webhook durability reference](./webhook-durability.md).
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
