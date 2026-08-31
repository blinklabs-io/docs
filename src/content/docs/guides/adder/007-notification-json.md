---
title: Headless Notification JSON
description: Configure and consume Adder's headless notification JSON output.
---

# Headless Notification JSON

## Overview

This guide describes Adder's `notify-json` output. Adder writes one JSON object per line to standard output, so a supervisor or another process can consume connection status and target-aware notification records without a graphical interface.

The output uses the same notification rules and rate limiting as the tray. A versioned JSON configuration controls the network, monitoring targets, alert categories, rate limits, and connection staleness threshold.

## Prerequisites

- A Cardano node that Adder can reach through the `chainsync` input.
- A JSON configuration file that follows the `schemaVersion` 1 contract in this guide.
- A process that reads standard output as a line-oriented JSON stream and keeps standard error separate.

See the [Command Reference Guide](./006-command_list.md) for the other Adder command-line options.

## Command usage

### Start the headless output

Select the `chainsync` input, select the `notify-json` output, and provide a nonempty configuration path:

```shell
adder \
  --input chainsync \
  --input-chainsync-network mainnet \
  --input-chainsync-address 127.0.0.1:3001 \
  --output notify-json \
  --output-notify-json-config ./notification.json
```

The `--output-notify-json-config` option identifies the versioned notification JSON file.

### Validate a configuration

Run the validator before starting Adder:

```shell
adder notifications validate --config ./notification.json
```

For a valid file, the command writes:

```text
notification configuration is valid
```

For an invalid file, the command writes one `field: message` line for each problem and exits with a failure. The validator also fails when the `--config` path is missing, the file does not exist, the JSON is malformed, the file contains an unknown field or more than one top-level JSON value, or a value violates the configuration rules.

Add `--json` when a supervisor needs a machine-readable result:

```shell
adder notifications validate --config ./notification.json --json
```

The command writes one JSON result with these fields:

| Field | Description |
| --- | --- |
| `schemaVersion` | The notification configuration schema version reported by the validator. The current value is `1`. |
| `valid` | `true` when the file parses and passes every validation rule; otherwise `false`. |
| `errors` | An optional array. Each entry contains `field` and `message`. The field identifies the invalid value, and the message describes the required value or condition. |

For example, an invalid configuration can produce a result like this:

```json
{"schemaVersion":1,"valid":false,"errors":[{"field":"monitor.wallets[0]","message":"invalid address"}]}
```

The validator returns a failure even when it writes a JSON result with `"valid": false`. If the command omits `--config`, it exits with an error because the option is required.

## Configuration schema

The configuration file must contain JSON with `schemaVersion` `1` and these top-level fields:

| Field | Type | Description |
| --- | --- | --- |
| `schemaVersion` | integer | Must equal `1`. |
| `network` | object | Selects a supported Cardano network and optionally identifies a custom node. |
| `monitor` | object | Selects `wallets`, `dreps`, `pools`, `assets`, and `policies`, or enables `everything`. |
| `alerts` | object | Maps supported alert keys to Boolean enabled values. |
| `rateLimit` | object | Sets the notification maximum and time window. |
| `connectionStaleSeconds` | integer | Sets the interval after which Adder reports that no chain event has arrived. The value must range from `30` through `3600`. |

Adder rejects unknown fields, including unknown fields inside the nested objects. The configuration reader also rejects multiple top-level JSON values. Adder trims leading and trailing whitespace from network names, custom addresses, target identifiers, and match modes before it validates them. The file reader does not fill omitted fields from `DefaultNotificationConfig`; a file must provide values that pass validation. Applications that explicitly use that helper receive its default configuration, including a 90-second connection staleness interval.

### Network

The `network` object supports these fields:

| Field | Type | Description |
| --- | --- | --- |
| `name` | string | Required. Accepts `mainnet`, `preprod`, or `preview`. |
| `customAddress` | string | Optional host name or IP address for a custom node. Adder combines this value with `customPort` for the startup address check. |
| `customPort` | integer | Optional TCP port. It must range from `1` through `65535` when `customAddress` has a value. If `customPort` has a nonzero value, `customAddress` must also have a value. |

The configuration validator trims `name` and `customAddress` before it applies these rules.

### Monitoring targets

The `monitor` object supports these fields:

| Field | Type | Description |
| --- | --- | --- |
| `everything` | Boolean | When `true`, Adder monitors all supported event families and ignores the target arrays. When `false`, configure at least one target in one of the arrays. |
| `wallets` | array of strings | Cardano payment or stake addresses. Each value must start with `addr` or `stake`. |
| `dreps` | array of strings | DRep identifiers. Each value must start with `drep1` or contain valid hexadecimal bytes. |
| `pools` | array of strings | Stake pool identifiers. Each value must start with `pool1` or contain valid hexadecimal bytes. |
| `assets` | array of strings | CIP-14 asset fingerprints. Each value must start with `asset1`. |
| `policies` | array of strings | Minting policy identifiers. Each value must contain exactly 56 hexadecimal characters. |
| `drepMatch` | string | Optional connector for the DRep group. Accepts `any` or `all`. |
| `poolMatch` | string | Optional connector for the pool group. Accepts `any` or `all`. |
| `assetMatch` | string | Optional connector for the asset group. Accepts `any` or `all`. |
| `policyMatch` | string | Optional connector for the policy group. Accepts `any` or `all`. |

Adder trims every target and match mode before validation. An empty target remains invalid after trimming. Each target group combines its values with OR. Each populated DRep, pool, asset, or policy group uses its match field to connect to the preceding populated group: `any` joins with OR, and `all` joins with AND. An omitted match field resolves to `any`.

Adder rejects duplicate targets within the same array without regard to case. For example, two wallet entries that differ only by case count as duplicates. Adder requires either `monitor.everything: true` or at least one target across all five target arrays.

### Alerts

The `alerts` object accepts these keys:

| Key | Description |
| --- | --- |
| `incomingTransactions` | Incoming transaction activity. |
| `outgoingTransactions` | Outgoing transaction activity. |
| `tokenTransfers` | Token transfer activity. |
| `blocksMinted` | Newly observed blocks. |
| `chainRollbacks` | Chain rollback activity. |
| `poolParameterChanges` | Stake pool parameter changes. |
| `governanceProposals` | New governance proposals. |
| `votesCast` | Votes cast on governance actions. |
| `registrationChanges` | Registration changes. |
| `assetActivity` | Activity involving a monitored asset. |
| `policyActivity` | Activity involving a monitored minting policy. |
| `connectionIssues` | Connection loss and recovery notifications. |

Each value must be a Boolean, and at least one known alert key must have the value `true`. Adder rejects every unknown alert key. The JSON key `chainRollbacks` corresponds to the tray label `Chain rollbacks`; it is independent of `blocksMinted`. Setting `blocksMinted` to `false` does not disable rollback notifications, and setting `chainRollbacks` to `false` does not disable block notifications.

### Rate limits

The `rateLimit` object supports these fields:

| Field | Type | Description |
| --- | --- | --- |
| `max` | integer | Accepts `-1` to disable the limit, or any value of `0` or greater. Values below `-1` fail validation. |
| `windowSeconds` | integer | The rate limit window in seconds. The value must be greater than `0`. |

Adder applies this limit to notification requests using the same notification rules that the tray uses.

### Complete example

The following file enables every alert category, monitors selected targets, and allows unlimited notifications with `max: -1`:

```json
{
  "schemaVersion": 1,
  "network": {
    "name": "mainnet"
  },
  "monitor": {
    "everything": false,
    "wallets": [
      "addr1example"
    ],
    "dreps": [
      "drep1example"
    ],
    "pools": [
      "pool1example"
    ],
    "assets": [
      "asset1example"
    ],
    "policies": [
      "01234567012345670123456701234567012345670123456701234567"
    ],
    "drepMatch": "any",
    "poolMatch": "any",
    "assetMatch": "any",
    "policyMatch": "any"
  },
  "alerts": {
    "incomingTransactions": true,
    "outgoingTransactions": true,
    "tokenTransfers": true,
    "blocksMinted": true,
    "chainRollbacks": true,
    "poolParameterChanges": true,
    "governanceProposals": true,
    "votesCast": true,
    "registrationChanges": true,
    "assetActivity": true,
    "policyActivity": true,
    "connectionIssues": true
  },
  "rateLimit": {
    "max": -1,
    "windowSeconds": 60
  },
  "connectionStaleSeconds": 90
}
```

## NDJSON output contract

When `notify-json` starts, Adder reserves standard output for one JSON record per line. A consumer can read each complete line as one independent JSON object. Adder sends runtime errors and log messages through standard error instead of standard output, so diagnostic text does not corrupt the record stream.

Adder emits two record kinds, `status` and `notification`, and uses UTC timestamps for both kinds.

### Status records

Status records contain these fields:

| Field | Type | Description |
| --- | --- | --- |
| `schemaVersion` | integer | Always `1` for this output contract. |
| `kind` | string | Always `status`. |
| `status` | string | One of `starting`, `connected`, or `stale`. |
| `timestamp` | string | The UTC timestamp for the record. |
| `message` | string | A descriptive status message. |

Adder writes a `starting` record immediately after it loads the configuration and prepares the notification rules:

```json
{"schemaVersion":1,"kind":"status","status":"starting","timestamp":"2026-01-01T12:00:00Z","message":"waiting for the first chain event"}
```

The first chain event causes Adder to write a `connected` record. Its message identifies the configured network, for example `receiving chain events from mainnet`.

If no chain event arrives before `connectionStaleSeconds` elapses, Adder writes a `stale` record with the message `no chain events received before startup timeout`. If the connection previously received an event and then exceeds the interval, Adder writes a `stale` record with the message `no chain events received recently`.

The stale timer resets whenever an event arrives. After a stale connection receives another event, Adder writes a new `connected` record. A stale state that follows a connected state also uses the configured `connectionIssues` rule to produce a connection notification when that alert is enabled; the initial startup timeout does not represent a lost established connection.

### Notification records

Notification records contain these fields:

| Field | Type | Description |
| --- | --- | --- |
| `schemaVersion` | integer | Always `1` for this output contract. |
| `kind` | string | Always `notification`. |
| `timestamp` | string | The UTC timestamp for the record. |
| `ruleId` | string | The identifier of the notification rule that matched. |
| `eventType` | string | Optional event type from the matching event. Adder omits this field when it has no value. |
| `title` | string | Notification title. Adder uses `Adder` when the rule does not provide a title. |
| `body` | string | Rendered notification body. |
| `batched` | Boolean | Indicates whether the notification combines multiple requests. |
| `count` | integer | Number of requests represented by the record. |

For example:

```json
{"schemaVersion":1,"kind":"notification","timestamp":"2026-01-01T12:01:00Z","ruleId":"incoming-tx","eventType":"input.transaction","title":"Adder","body":"Incoming transaction detected","batched":false,"count":1}
```

## Startup compatibility checks

Before Adder starts processing, it performs these checks when `--output notify-json` is selected:

1. Select `chainsync` as the input. Adder rejects any other input.
2. Set a nonempty `--output-notify-json-config` path. Adder rejects an empty path or a configuration that fails to load or validate.
3. Make `network.name` equal to `--input-chainsync-network`. Adder rejects a mismatch before it starts processing.
4. When `network.customAddress` has a value, make its normalized `host:port` equal to `--input-chainsync-address`. Adder normalizes host names without regard to case, canonicalizes IP addresses, and compares the port number. Adder rejects an invalid or mismatched address before it starts processing.

The startup checks prevent the notification rules from monitoring a network or custom node different from the one that supplies chain events.

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
