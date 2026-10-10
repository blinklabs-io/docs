---
title: Dingo v0.81.1 Configuration Reference
description: Complete, release-specific Dingo v0.81.1 configuration reference and example.
---

This page covers the configuration shipped with Dingo v0.81.1. The complete
field reference, including descriptions, defaults, environment variables,
command-line flags, provider settings, and deployment patterns, is in the
release-matched [`dingo.yaml.example` file](https://raw.githubusercontent.com/blinklabs-io/dingo/v0.81.1/dingo.yaml.example).
The same file is available in the [Dingo v0.81.1 source](https://github.com/blinklabs-io/dingo/blob/v0.81.1/dingo.yaml.example).

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
| Listeners and diagnostics | `bindAddr`, `privateBindAddr`, `relayPort`, `privatePort`, `metricsBindAddr`, `metricsPort`, `healthPort`, `debugPort`, `debugBindAddr`, `tracing`, `localStateQueryViewMaxLifetime` | Configure node and private listeners, metrics, health probes, profiling, tracing, and LocalStateQuery snapshot lifetime. |
| Logging and TLS | `logging`, `tlsCertFilePath`, `tlsKeyFilePath`, `api.tls` | Select log output and secure supported API or Bark listeners. |
| Storage and APIs | `storageMode`, `plugins.storage`, `plugins.mempool`, `plugins.api`, `corsAllowedOrigins` | Choose stored history, storage providers, transaction ordering, and application APIs. |
| Bootstrap and synchronization | `mithril`, `mithril.downloadMaxBytes`, `mithril.server`, `mithril.server.aggregator`, `genesisBootstrap`, `intersectTip`, `immutableDbPath`, `chainsync`, `validateHistorical`, `strictUtxoValidation` | Configure snapshot or genesis bootstrap, synchronization, and historical validation. |
| Peer management | `targetNumberOfKnownPeers`, `targetNumberOfEstablishedPeers`, `targetNumberOfActivePeers`, `targetNumberOfRootPeers`, `activePeersTopologyQuota`, `activePeersGossipQuota`, `activePeersLedgerQuota`, `inboundWarmTarget`, `inboundHotQuota`, `inboundMinTenure`, `inboundHotScoreThreshold`, `inboundPruneAfter`, `inboundDuplexOnlyForHot`, `inboundCooldown` | Set peer targets, source quotas, and inbound peer policy. |
| Block production and ledger rules | `blockProducer`, `shelley*`, `forge*`, `validateForgedBlock`, `minPoolMargin`, `pledgeLeverage*`, `fullPotRewards*`, `delegatorInactivity*`, `ledgerApplyRowBatchingEnabled`, `ledgerPrefetchAheadEnabled` | Configure forging keys, safety thresholds, and optional ledger behaviors. |
| Archives and database lifecycle | `bark*`, `historyExpiry`, `databaseLifecycle` | Serve or consume archive data, expire local history, and manage snapshots. |
| Optional indexes and diagnostics | `midnight`, `tokenRegistry`, `koiosParity`, `cache`, `skipRewardLiveStakeBackfillCheck` | Configure optional indexing, registry refresh, parity diagnostics, caching, and startup validation. |

### Ledger processing

| Setting | YAML key | CLI flag | Environment variable | Default and behavior |
| --- | --- | --- | --- | --- |
| Ledger row batching | `ledgerApplyRowBatchingEnabled` | `--ledger-apply-row-batching-enabled` | `DINGO_LEDGER_APPLY_ROW_BATCHING_ENABLED` | `false` (off). In core storage mode, write eligible unvalidated block deltas with multi-row batching. Dingo forwards the setting to `serve` and `dingo load`; API mode already uses batching. The setting does not affect consensus. |
| Ledger prefetch ahead | `ledgerPrefetchAheadEnabled` | `--ledger-prefetch-ahead-enabled` | `DINGO_LEDGER_PREFETCH_AHEAD_ENABLED` | `false` (off). For validated blocks, resolve the next block's input UTxOs from a read-only transaction while the current block applies. The setting does not affect consensus. |

### Metrics listener

| Setting | YAML key | CLI flag | Environment variable | Default and behavior |
| --- | --- | --- | --- | --- |
| Metrics bind address | `metricsBindAddr` | `--metrics-bind-addr` | `DINGO_METRICS_BIND_ADDR` | `127.0.0.1`. This address is independent of `bindAddr`. Set it explicitly to a wildcard or remote reachable address when a scraper runs outside the host. |
| Metrics port | `metricsPort` | `--metrics-port` | — | `12798` by default. Set it to `0` to disable the Prometheus listener. |

### ImmutableDB source

The `immutableDbPath` setting and the positional input to `dingo load` accept a
local directory or a remote URL. Remote sources require an `https://` URL;
`http://` works only for loopback hosts, and Dingo rejects non-loopback HTTP.
Remote roots provide `tip.json` and numbered `.chunk`, `.primary`, and
`.secondary` files as chunk triads. Dingo rejects mismatched or incomplete
published chunk data. See the bootstrap and data maintenance guide for the
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

### Mithril artifact server

The `mithril.server` settings control `dingo mithril snapshot create` and
`dingo mithril serve`. Snapshot artifact reads are public. Aggregator signer
registration and registration closure require the bearer token in
`mithril.server.aggregator.operatorTokenFile`. A non-loopback aggregator bind
requires TLS. Set `mithril.server.publicBaseUrl` to the public origin that
appears in snapshot download locations; use HTTPS except for an HTTP loopback
origin.

| Setting | YAML key | CLI flag | Environment variable | Default and behavior |
| --- | --- | --- | --- | --- |
| Artifact server port | `mithril.server.port` | `--mithril-server-port` | `DINGO_MITHRIL_SERVER_PORT` | `8081`. `dingo mithril serve` listens on this port and the root `bindAddr`. |
| Public snapshot origin | `mithril.server.publicBaseUrl` | `--mithril-server-public-base-url` | `DINGO_MITHRIL_SERVER_PUBLIC_BASE_URL` | Required by `dingo mithril serve`. Set an origin without credentials, a path, a query, or a fragment. HTTPS is required except for loopback HTTP. |
| Artifact store | `mithril.server.artifactStore` | `--mithril-server-artifact-store` | `DINGO_MITHRIL_SERVER_ARTIFACT_STORE` | Empty. Set a filesystem directory, `s3://bucket/prefix`, or `gcs://bucket/prefix`. The latter two require a build with `dingo_extra_plugins`. |
| Redirect base URL | `mithril.server.redirectBaseUrl` | `--mithril-server-redirect-base-url` | `DINGO_MITHRIL_SERVER_REDIRECT_BASE_URL` | Empty. When set, archive requests redirect to this base URL plus the object key instead of streaming the object. Use it only when the remote objects are publicly readable. |
| Snapshot retention | `mithril.server.keepSnapshots` | `--mithril-server-keep-snapshots` | `DINGO_MITHRIL_SERVER_KEEP_SNAPSHOTS` | `0` keeps every produced snapshot. A positive value retains that many newest snapshots. |
| Ancillary signing key | `mithril.server.ancillarySigningKeyFile` | `--mithril-server-ancillary-signing-key-file` | `DINGO_MITHRIL_SERVER_ANCILLARY_SIGNING_KEY_FILE` | Empty. Set the Ed25519 Mithril JSON hex key that signs each ancillary manifest. |
| Artifact server TLS | `mithril.server.tlsEnabled` | `--mithril-server-tls-enabled` | `DINGO_MITHRIL_SERVER_TLS_ENABLED` | `false`. When enabled, the server uses the shared `tlsCertFilePath` and `tlsKeyFilePath`. |
| Aggregator endpoints | `mithril.server.aggregator.enabled` | `--mithril-aggregator-enabled` | `DINGO_MITHRIL_AGGREGATOR_ENABLED` | `false`. Enable signer registration, signature collection, and snapshot certification. |
| Signer registration epoch | `mithril.server.aggregator.epoch` | `--mithril-aggregator-epoch` | `DINGO_MITHRIL_AGGREGATOR_EPOCH` | `0` selects no usable epoch; set at least `1` when the aggregator is enabled. The genesis certificate uses the preceding epoch. |
| STM quorum | `mithril.server.aggregator.k` | `--mithril-aggregator-k` | `DINGO_MITHRIL_AGGREGATOR_K` | `0` until configured. Set a positive quorum that does not exceed `m`. |
| STM lottery size | `mithril.server.aggregator.m` | `--mithril-aggregator-m` | `DINGO_MITHRIL_AGGREGATOR_M` | `0` until configured. Set a positive value when the aggregator is enabled. |
| STM win probability | `mithril.server.aggregator.phiF` | `--mithril-aggregator-phi-f` | `DINGO_MITHRIL_AGGREGATOR_PHI_F` | `0` until configured. Set a value greater than `0` and no greater than `1`. |
| Aggregator genesis signing key | `mithril.server.aggregator.genesisSigningKeyFile` | `--mithril-aggregator-genesis-signing-key-file` | `DINGO_MITHRIL_AGGREGATOR_GENESIS_SIGNING_KEY_FILE` | Required when the aggregator is enabled. Set an Ed25519 Mithril JSON hex key. |
| Aggregator operator token | `mithril.server.aggregator.operatorTokenFile` | `--mithril-aggregator-operator-token-file` | `DINGO_MITHRIL_AGGREGATOR_OPERATOR_TOKEN_FILE` | Required when the aggregator is enabled. Set a file containing at least 32 random bytes. |

### SQLite metadata storage validation

When `plugins.storage.metadata.provider` is `sqlite`, or when the configuration
omits the provider and Dingo defaults it to `sqlite`, set a root `databasePath`
that is not empty. Dingo rejects startup when `databasePath` is empty in either
case.

### Database lifecycle snapshot pause bound

| Setting | YAML key | CLI flag | Environment variable | Default | Validation and scope |
| --- | --- | --- | --- | --- | --- |
| Snapshot commit pause bound | `databaseLifecycle.snapshotMaxCommitPause` | `--db-snapshot-max-commit-pause` | `DINGO_DB_LIFECYCLE_SNAPSHOT_MAX_COMMIT_PAUSE` | `30s`. Set `0s` for no bound. | Set a nonnegative duration. Dingo rejects negative values during configuration validation. A positive duration limits manual and offline, live, and automatic epoch-boundary snapshots after they acquire the commit barrier. If the bound is exceeded, Dingo cancels the snapshot, removes partial output, and reports an error that wraps `ErrCommitPauseExceeded`. |

### Bark remote lifecycle service

The remote Bark lifecycle service is disabled by default. When enabled, it
provides `Stop`, `Restart`, and `GetStatus` operations through Bark. Bark uses
`127.0.0.1` by default when a lifecycle service is mounted; set `barkHost` to
expose it on another interface.

| Setting | YAML key | CLI flag | Environment variable | Default and requirements |
| --- | --- | --- | --- | --- |
| Enable lifecycle service | `barkLifecycleEnabled` | `--bark-lifecycle-enabled` | `DINGO_BARK_LIFECYCLE_ENABLED` | `false`. Enabling it requires a nonzero `barkPort`, `barkClientCaFilePath`, both `tlsCertFilePath` and `tlsKeyFilePath`, and at least one `barkLifecycleOperatorCertificateFingerprints` value. |
| Lifecycle operator certificates | `barkLifecycleOperatorCertificateFingerprints` | `--bark-lifecycle-operator-certificate-fingerprints` | `DINGO_BARK_LIFECYCLE_OPERATOR_CERTIFICATE_FINGERPRINTS` | Empty by default. Each value must be the SHA-256 fingerprint of the client certificate DER bytes, encoded as hexadecimal; colons are accepted and matching ignores case. These credentials authorize `Stop` and `Restart` only. |

All lifecycle operations require a client certificate verified against
`barkClientCaFilePath`. `Stop` and `Restart` additionally require a matching
certificate fingerprint from the lifecycle operator list. `GetStatus` requires
mTLS but does not require that allowlist. DatabaseService operator
credentials remain separate and do not grant lifecycle access. `Restart` is
available on Unix platforms; other platforms return an unsupported operation
error.

### Token registry header credentials

Use `tokenRegistry.headerSecrets` for credentials required by an authenticated
token registry mirror. The YAML form is a map of header names to secret values:

```yaml
tokenRegistry:
  headerSecrets:
    Authorization: "Bearer <token>"
```

The environment form is
`DINGO_TOKEN_REGISTRY_HEADER_SECRETS`, using `name:value` pairs separated by
commas. Dingo splits each pair at the first colon, so a value can contain
additional colons but cannot contain a comma. No CLI flag exists because a
command line would expose these credentials in the process list.

Dingo redacts header values from rendered configuration and errors. A request
with header credentials must use an HTTPS source URL or a loopback source.
Dingo rejects malformed header names and values as well as reserved header
names used by the transport or request. When a redirect changes the scheme or
host, Dingo removes the configured credentials before following it.

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

The `--shelley-kes-agent-socket` flag supports filesystem socket paths and
Linux abstract socket addresses. Dingo resolves a relative filesystem path
once at client construction and reuses the resolved path across reconnects. It
preserves `@`-prefixed abstract addresses, rejects literal NUL-prefixed
addresses at client construction, and enforces platform socket-length limits.

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
