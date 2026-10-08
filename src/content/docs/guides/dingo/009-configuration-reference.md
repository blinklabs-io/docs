---
title: Dingo v0.80.0 Configuration Reference
description: Complete, release-specific Dingo v0.80.0 configuration reference and example.
---

This page covers the configuration shipped with Dingo v0.80.0. The complete
field reference, including descriptions, defaults, environment variables,
command-line flags, provider settings, and deployment patterns, is in the
release-matched [`dingo.yaml.example` file](https://raw.githubusercontent.com/blinklabs-io/dingo/v0.80.0/dingo.yaml.example).
The same file is available in the [Dingo v0.80.0 source](https://github.com/blinklabs-io/dingo/blob/v0.80.0/dingo.yaml.example).

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
| Listeners and diagnostics | `bindAddr`, `privateBindAddr`, `relayPort`, `privatePort`, `metricsPort`, `healthPort`, `debugPort`, `debugBindAddr`, `tracing`, `localStateQueryViewMaxLifetime` | Configure node and private listeners, metrics, health probes, profiling, tracing, and LocalStateQuery snapshot lifetime. |
| Logging and TLS | `logging`, `tlsCertFilePath`, `tlsKeyFilePath`, `api.tls` | Select log output and secure supported API or Bark listeners. |
| Storage and APIs | `storageMode`, `plugins.storage`, `plugins.mempool`, `plugins.api`, `corsAllowedOrigins` | Choose stored history, storage providers, transaction ordering, and application APIs. |
| Bootstrap and synchronization | `mithril`, `mithril.downloadMaxBytes`, `genesisBootstrap`, `intersectTip`, `immutableDbPath`, `chainsync`, `validateHistorical`, `strictUtxoValidation` | Configure snapshot or genesis bootstrap, synchronization, and historical validation. |
| Peer management | `targetNumberOfKnownPeers`, `targetNumberOfEstablishedPeers`, `targetNumberOfActivePeers`, `targetNumberOfRootPeers`, `activePeersTopologyQuota`, `activePeersGossipQuota`, `activePeersLedgerQuota`, `inboundWarmTarget`, `inboundHotQuota`, `inboundMinTenure`, `inboundHotScoreThreshold`, `inboundPruneAfter`, `inboundDuplexOnlyForHot`, `inboundCooldown` | Set peer targets, source quotas, and inbound peer policy. |
| Block production and ledger rules | `blockProducer`, `shelley*`, `forge*`, `validateForgedBlock`, `minPoolMargin`, `pledgeLeverage*`, `fullPotRewards*`, `delegatorInactivity*` | Configure forging keys, safety thresholds, and optional ledger behaviors. |
| Archives and database lifecycle | `bark*`, `historyExpiry`, `databaseLifecycle` | Serve or consume archive data, expire local history, and manage snapshots. |
| Optional indexes and diagnostics | `midnight`, `tokenRegistry`, `koiosParity`, `cache`, `skipRewardLiveStakeBackfillCheck` | Configure optional indexing, registry refresh, parity diagnostics, caching, and startup validation. |

### ImmutableDB source

The `immutableDbPath` setting and the positional input to `dingo load` accept a
local directory or a remote URL. Remote sources require an `https://` URL;
`http://` works only for loopback hosts, and Dingo rejects non-loopback HTTP.
Remote roots provide `tip.json` and numbered `.chunk`, `.primary`, and
`.secondary` files as chunk triads. Dingo fails when published chunk data is
mismatched or incomplete. See the bootstrap and data maintenance guide for the
remote source, chunk, and integrity requirements.

### LocalStateQuery snapshot lifetime

| Setting | YAML key | CLI flag | Environment variable | Default | Validation and behavior |
| --- | --- | --- | --- | --- | --- |
| Maximum lifetime of an acquired ledger snapshot | `localStateQueryViewMaxLifetime` | `--local-state-query-view-max-lifetime` | `DINGO_LOCAL_STATE_QUERY_VIEW_MAX_LIFETIME` | `5m` | Use a positive duration string, such as `5m`. Dingo rejects an invalid, zero, or negative value during startup or configuration validation. After the maximum lifetime, Dingo closes the session-held ledger snapshot and the next query returns the closed-view error instead of reading live state. |

### Mithril download limit

| Setting | YAML key | CLI flag | Environment variable | Default and behavior |
| --- | --- | --- | --- | --- |
| Compressed size limit for each downloaded Mithril object | `mithril.downloadMaxBytes` | `--mithril-download-max-bytes` | `DINGO_MITHRIL_DOWNLOAD_MAX_BYTES` | `0` uses the built-in per-object compressed limits. A positive value replaces the limit for every downloaded object. Dingo rejects a negative value during startup or configuration validation. |

When `mithril.downloadMaxBytes` is `0`, Dingo uses these built-in compressed limits:

| Mithril object | Built-in limit |
| --- | --- |
| v1 | `512 GiB` |
| v2 immutable archive | `1 GiB` |
| v2 digest list | `256 MiB` |
| v2 ancillary data | `64 GiB` |

### SQLite metadata storage validation

When `plugins.storage.metadata.provider` is `sqlite`, or when the configuration
omits the provider and Dingo defaults it to `sqlite`, set a root `databasePath`
that is not empty. Dingo rejects startup when `databasePath` is empty in either
case.

### Database lifecycle snapshot pause bound

| Setting | YAML key | CLI flag | Environment variable | Default | Validation and scope |
| --- | --- | --- | --- | --- | --- |
| Snapshot commit pause bound | `databaseLifecycle.snapshotMaxCommitPause` | `--db-snapshot-max-commit-pause` | `DINGO_DB_LIFECYCLE_SNAPSHOT_MAX_COMMIT_PAUSE` | `0s` (no bound). | Set a nonnegative duration. Dingo rejects negative values during configuration validation. A positive duration limits manual and offline, live, and automatic epoch-boundary snapshots after they acquire the commit barrier. If the bound is exceeded, Dingo cancels the snapshot, removes partial output, and reports an error that wraps `ErrCommitPauseExceeded`. |

### Block production

Dingo v0.77.1 removes `ForgePrimaryChainTipToleranceSlots` and
`forgePrimaryChainTipToleranceSlots` from YAML, the CLI, and environment
variables.
Remove these settings rather than replacing them with another field.

Set the optional `forgeAppliedTipStalenessSlots` setting in YAML, with the
`--forge-applied-tip-staleness-slots` CLI flag, or with the
`DINGO_FORGE_APPLIED_TIP_STALENESS_SLOTS` environment variable. Its default is
`0`, which disables the bound. Dingo evaluates the bound only when a
corroborated upstream target exists and ignores it when the target is unknown.

#### Shelley KES agent socket

The `--shelley-kes-agent-socket` flag accepts filesystem socket paths and
abstract socket addresses. Dingo resolves a relative filesystem path once and
reuses the resolved path across reconnects. It preserves `@`-prefixed abstract
addresses, rejects literal NUL-prefixed addresses when creating the client,
and checks platform socket-length limits.

### Kupo provider

The optional Kupo provider belongs under `plugins.api.kupo`. Set
`provider: "builtin"` to use the built-in provider. Kupo requires
`storageMode: api`; the `--kupo-provider` flag selects the provider from the
CLI. Set `plugins.api.kupo.config.port` to `0` to disable the Kupo listener.

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
