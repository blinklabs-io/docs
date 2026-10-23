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

> If the same setting is provided through multiple methods, Adder uses this precedence order: CLI flags > YAML configuration file > environment variables.

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
<br />

```
  --input-chainsync-intersect-tip
```
  
> start syncing at the chain tip (defaults to chain genesis) (default true)
<br />

```
  --input-chainsync-network string
```
  
> specifies a well-known Cardano network name (default "mainnet")
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
  
> well-known Cardano network name (e.g. mainnet, preprod) (default "mainnet")
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

## Logging:

```
  --logging-level string
```
  
> logging level (debug, info, warn, error) (default "info")
<br />

***

## Output:

```
  --output string
```
  
> output plugin to use, `notify-json` for notification NDJSON, or `list` to show available (default "log")
>
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
| `network.name` | Required supported Cardano network: `mainnet`, `preprod`, or `preview`. |
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
