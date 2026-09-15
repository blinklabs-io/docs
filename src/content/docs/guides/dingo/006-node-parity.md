---
title: node-parity CLI Reference
description: Run and configure Dingo's node-parity watch and check commands.
---

# node-parity CLI Reference

## Overview

Use `node-parity` to compare a Dingo node with a Cardano node on the `preview` or `preprod` network. The command connects to already running node-to-client endpoints; it does not start or manage either node.

Both endpoints must be running and reachable before the command starts. Supply `--network`, `--dingo-addr`, and `--cardano-addr` for every `node-parity` command.

## Watch command

`watch` starts a comparison cycle when either node produces a new block. This invocation uses the default incremental mode:

```bash
node-parity watch \
  --network preview \
  --dingo-addr <dingo-node-to-client-address> \
  --cardano-addr <cardano-node-to-client-address> \
  --cursor-file /var/lib/node-parity/cursor
```

### Shared flags

| Flag | Description |
| --- | --- |
| `--network` | Required. Set it to `preview` or `preprod`. |
| `--dingo-addr` | Required. Provide Dingo's node-to-client address as `host:port` or a Unix socket path beginning with `/`. |
| `--cardano-addr` | Required. Provide the Cardano node's node-to-client address as `host:port` or a Unix socket path beginning with `/`. |
| `--metrics-addr` | Optional. Set the address for the `watch` Prometheus metrics endpoint, or set an empty value to disable metrics. |

### Comparison mode

Set `--mode` to one of the following values:

- `incremental` (default): validates new blocks incrementally and runs full comparisons at configured checkpoints.
- `full`: runs the whole-ledger comparison for each watch cycle.

The previous whole-ledger behavior requires an explicit `--mode full` setting.

### Incremental mode

Incremental mode requires `--cursor-file`. The command persists its cursor at the specified path and uses that cursor to resume after a restart.

Configure the incremental checks with these flags:

| Flag | Default | Requirement |
| --- | --- | --- |
| `--cursor-file <path>` | None | Required. Specify the path for the persisted cursor. |
| `--full-check-interval <blocks>` | `1000` | Set a value greater than `0`. Runs a full comparison after the configured number of blocks. |
| `--full-check-timeout <duration>` | `20m` | Set a positive duration for each triggered full comparison. |

For example:

```bash
node-parity watch \
  --network preprod \
  --dingo-addr 127.0.0.1:3002 \
  --cardano-addr 127.0.0.1:3003 \
  --mode incremental \
  --cursor-file /var/lib/node-parity/preprod.cursor \
  --full-check-interval 1000 \
  --full-check-timeout 20m
```

### Full mode

Set `--mode full` to configure the fallback schedule and per-cycle timeout with these flags:

| Flag | Default | Requirement |
| --- | --- | --- |
| `--fallback-interval <duration>` | `2m` | Set a positive duration between fallback checks. |
| `--check-timeout <duration>` | `20m` | Set a positive duration for each full comparison. |

For example:

```bash
node-parity watch \
  --network preview \
  --dingo-addr /var/run/dingo/node-to-client.sock \
  --cardano-addr /var/run/cardano/node-to-client.sock \
  --mode full \
  --fallback-interval 2m \
  --check-timeout 20m
```

> **Note:** `watch` rejects `--at-slot` and `--at-hash`. Use `check` for an explicit historical comparison.

## Check-only historical mode

Use `check` for a comparison at a specific historical point. Supply `--at-slot` and `--at-hash` together, or omit both flags for a live comparison.

`--at-hash` accepts a hexadecimal block hash that must decode to exactly `32` bytes, or `64` hexadecimal characters. For example:

```bash
node-parity check \
  --network preview \
  --dingo-addr 127.0.0.1:3002 \
  --cardano-addr 127.0.0.1:3003 \
  --at-slot 123456 \
  --at-hash <64-hex-character-block-hash>
```

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>