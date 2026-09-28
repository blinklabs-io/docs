---
title: Configuration Reference
description: Dingo configuration, environment variable, and CLI reference.
---

# Configuration Reference

This reference covers the Dingo settings for Koios private destinations, token registry limits, and SQLite metadata maintenance.

## Koios private destinations

`koiosParity.allowPrivateAddresses` controls whether the Koios parity client may use private or special-use destinations. The default is `false`. With the default, Dingo rejects private, loopback, link-local, multicast, unspecified, and other special-use destinations, including destinations reached through redirects or DNS resolution.

Set the option only when the Koios endpoint is an intentionally local or private self-hosted deployment.

| YAML key | Environment variable | CLI flag | Default |
| --- | --- | --- | --- |
| `koiosParity.allowPrivateAddresses` | `DINGO_KOIOS_PARITY_ALLOW_PRIVATE_ADDRESSES` | `--koios-parity-allow-private-addresses` | `false` |

The standalone `node-parity from-genesis` command accepts this separate flag:

```text
node-parity from-genesis --koios-allow-private-addresses
```

The plain HTTP opt-in is separate from the private-address opt-in. Allowing HTTP does not allow private or special-use destinations by itself.

## Token registry limits

Configure these limits under `tokenRegistry`. A value of `0` selects the built-in default.

| YAML key | Default when set to `0` | Environment variable | CLI flag |
| --- | --- | --- | --- |
| `tokenRegistry.maxDecompressedBytes` | `2 GB` | `DINGO_TOKEN_REGISTRY_MAX_DECOMPRESSED_BYTES` | `--token-registry-max-decompressed-bytes` |
| `tokenRegistry.maxArchiveEntries` | `100,000` | `DINGO_TOKEN_REGISTRY_MAX_ARCHIVE_ENTRIES` | `--token-registry-max-archive-entries` |
| `tokenRegistry.maxAcceptedEntries` | `50,000` | `DINGO_TOKEN_REGISTRY_MAX_ACCEPTED_ENTRIES` | `--token-registry-max-accepted-entries` |
| `tokenRegistry.maxBatchBytes` | `64 MB` | `DINGO_TOKEN_REGISTRY_MAX_BATCH_BYTES` | `--token-registry-max-batch-bytes` |

When configuration sets both bounds to positive values, `tokenRegistry.maxBatchBytes` must be greater than or equal to `tokenRegistry.maxEntryBytes`. Dingo rejects the configuration during startup when `maxBatchBytes` is smaller than `maxEntryBytes`.

## Leios endorser-block forging controls

Configure the following settings to control Leios endorser-block selection and size.

| YAML key | Purpose | Default | Environment variable | CLI flag | Zero-value behavior |
| --- | --- | --- | --- | --- | --- |
| `forgeEbSelectionReserve` | Reserves slot time for ranking-block assembly after Leios endorser-block selection. | `300ms` | `DINGO_FORGE_EB_SELECTION_RESERVE` | `--forge-eb-selection-reserve` | `0` or a negative value uses `300ms`. |
| `forgeEbMaxTxRefs` | Limits transaction references in a forged Leios endorser block. | `20000` | `DINGO_FORGE_EB_MAX_TX_REFS` | `--forge-eb-max-tx-refs` | An explicit `0` disables the cap. |
| `forgeEbMaxBytes` | Limits the total bytes of referenced transactions in a forged Leios endorser block. | `25165824` bytes (`24 MiB`) | `DINGO_FORGE_EB_MAX_BYTES` | `--forge-eb-max-bytes` | An explicit `0` disables the cap. |

## SQLite metadata maintenance

Set `plugins.storage.metadata.config.vacuumIntervalSeconds` for the SQLite metadata provider:

```yaml
plugins:
  storage:
    metadata:
      provider: sqlite
      config:
        vacuumIntervalSeconds: 86400
```

Set the interval in seconds. Omission or `0` disables periodic full `VACUUM`. A positive value enables it; full `VACUUM` can pause SQLite writers, so configure an interval only when that pause is acceptable.

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
