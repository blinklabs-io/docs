---
title: Dingo Configuration Reference
description: Complete, release-specific Dingo v0.75.1 configuration reference and example.
---

This page covers the configuration shipped with Dingo v0.75.1. The complete
field reference, including descriptions, defaults, environment variables,
command-line flags, provider settings, and deployment patterns, is in the
release-matched [`dingo.yaml.example` file](https://raw.githubusercontent.com/blinklabs-io/dingo/v0.75.1/dingo.yaml.example).
The same file is available in the [Dingo v0.75.1 source](https://github.com/blinklabs-io/dingo/blob/v0.75.1/dingo.yaml.example).

The example has no active settings. Leave values commented to use Dingo's
built-in defaults; uncomment a setting only when you want to override its
default. Do not copy a configuration file from a different Dingo release
without checking the release's example, because available fields and behavior
can change.

## Configuration precedence

Dingo resolves a setting from the command line first, then environment
variables, the YAML file, and finally the built-in default. CLI flag and
environment variable names are documented alongside the fields in the
example. See [Node Configuration and Storage Modes](/guides/dingo/005-node-configuration/)
for the main runtime choices.

## Configuration areas

| Area | Main settings | Purpose |
| --- | --- | --- |
| Network and paths | `network`, `networkMagic`, `cardanoConfig`, `topology`, `databasePath`, `socketPath` | Select a Cardano network and locate node, topology, and data files. |
| Listeners and diagnostics | `bindAddr`, `privateBindAddr`, `relayPort`, `privatePort`, `metricsPort`, `healthPort`, `debugPort`, `debugBindAddr`, `tracing` | Configure node and private listeners, metrics, health probes, profiling, and tracing. |
| Logging and TLS | `logging`, `tlsCertFilePath`, `tlsKeyFilePath`, `api.tls` | Select log output and secure supported API or Bark listeners. |
| Storage and APIs | `storageMode`, `plugins.storage`, `plugins.mempool`, `plugins.api`, `corsAllowedOrigins` | Choose stored history, storage providers, transaction ordering, and application APIs. |
| Bootstrap and synchronization | `mithril`, `genesisBootstrap`, `intersectTip`, `immutableDbPath`, `chainsync`, `validateHistorical`, `strictUtxoValidation` | Configure snapshot or genesis bootstrap, synchronization, and historical validation. |
| Peer management | `targetNumberOfKnownPeers`, `targetNumberOfEstablishedPeers`, `targetNumberOfActivePeers`, `targetNumberOfRootPeers`, `activePeersTopologyQuota`, `activePeersGossipQuota`, `activePeersLedgerQuota`, `inboundWarmTarget`, `inboundHotQuota`, `inboundMinTenure`, `inboundHotScoreThreshold`, `inboundPruneAfter`, `inboundDuplexOnlyForHot`, `inboundCooldown` | Set peer targets, source quotas, and inbound peer policy. |
| Block production and ledger rules | `blockProducer`, `shelley*`, `forge*`, `validateForgedBlock`, `minPoolMargin`, `pledgeLeverage*`, `fullPotRewards*`, `delegatorInactivity*` | Configure forging keys, safety thresholds, and optional ledger behaviors. |
| Archives and database lifecycle | `bark*`, `historyExpiry`, `databaseLifecycle` | Serve or consume archive data, expire local history, and manage snapshots. |
| Optional indexes and diagnostics | `midnight`, `tokenRegistry`, `koiosParity`, `cache`, `skipRewardLiveStakeBackfillCheck` | Configure optional indexing, registry refresh, parity diagnostics, caching, and startup validation. |

The example also contains commented deployment patterns for relay, API/data,
block producer, archive, history-expiry, and development nodes. Review the
warnings in each pattern before enabling settings that alter consensus,
forging, or network exposure.


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
