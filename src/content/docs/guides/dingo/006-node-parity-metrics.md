---
title: Node-Parity From-Genesis Metrics
description: Enable and monitor Prometheus metrics for the node-parity from-genesis command.
---

# Node-Parity From-Genesis Metrics

## Overview

This reference describes the Prometheus interface for `node-parity from-genesis`. The command follows the Dingo chain on `preview` or `preprod` and compares protocol parameters, stake distribution, and the UTxO set with Koios.

## Enable the metrics endpoint

Run `node-parity from-genesis` with the required network and Dingo address, and explicitly pass `--metrics-addr`:

```console
node-parity from-genesis \
  --network preview \
  --dingo-addr 127.0.0.1:3001 \
  --metrics-addr :9464
```

The `--metrics-addr` flag defaults to `:9464`, but `from-genesis` starts the metrics listener only when the command explicitly receives the flag with a non-empty value. Prometheus scrapes `/metrics` on the configured address. The listener is separate from Dingo's node `metricsPort` setting in `dingo.yaml`.

Pass `--network preprod` instead of `--network preview` when the replay uses Preprod. Pass `--metrics-addr=` to disable the listener explicitly. Omitting `--metrics-addr` also leaves the `from-genesis` listener disabled.

## Metric contract

The `from-genesis` command adds the `network` label to each metric. The `network` value identifies the selected `preview` or `preprod` network.

| Metric | Labels | Meaning |
| --- | --- | --- |
| `node_parity_epochs_total` | `network` | Counts epochs where at least one check reached a trustworthy verdict. |
| `node_parity_epoch_checks_incomplete_total` | `network`, `field` | Counts checks that could not reach a trustworthy verdict. The `field` values are `protocol_params`, `stake_distribution`, and `utxo`. |
| `node_parity_divergence_total` | `network`, `field`, `reference="koios"` | Counts real ledger-state divergences found while comparing Dingo with Koios. The `field` values are `protocol_params`, `stake_distribution`, and `utxo`. |

An incomplete check does not indicate a divergence. The command records an incomplete check when it cannot trust the result; it records a divergence when Dingo returns a different value from the Koios reference.

The `check` and `watch` commands share `node_parity_divergence_total`. Those commands use `reference="cardano_node"`; `from-genesis` uses `reference="koios"`. The `from-genesis` command does not register the check and watch counters, so their absence does not indicate a healthy from-genesis run.

## Alerts

Monitor the from-genesis metrics with these alert rules:

- `NodeParityFromGenesisStalled` identifies a replay that has recorded neither a trustworthy epoch verdict nor an incomplete check during the previous two hours. The rule waits until the process has run for more than two hours and the condition persists for 15 minutes.
- `NodeParityFromGenesisNotVerifying` identifies a replay that continues to record incomplete checks but has recorded no trustworthy epoch verdict during the previous two hours. The rule fires only after the condition persists for 30 minutes.

The shared divergence alert text reports the oracle through the `reference` label. A from-genesis divergence therefore identifies `koios`, while a `check` or `watch` divergence identifies `cardano_node`.

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>