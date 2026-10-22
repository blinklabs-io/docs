---
title: Dingo v0.87.0 Configuration Reference
description: Complete, release-specific Dingo v0.87.0 configuration reference and example.
---

This page covers the configuration shipped with Dingo v0.87.0. The complete
field reference, including descriptions, defaults, environment variables,
command-line flags, provider settings, and deployment patterns, is in the
release-matched [`dingo.yaml.example` file](https://raw.githubusercontent.com/blinklabs-io/dingo/v0.87.0/dingo.yaml.example).
The same file is available in the [Dingo v0.87.0 source](https://github.com/blinklabs-io/dingo/blob/v0.87.0/dingo.yaml.example).

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
| Listeners and diagnostics | `bindAddr`, `privateBindAddr`, `relayPort`, `privatePort`, `metricsBindAddr`, `metricsAuthToken`, `metricsPort`, `healthPort`, `debugPort`, `debugBindAddr`, `tracing`, `tracingEndpoint`, `tracingServiceName`, `tracingSampleRatio`, `localStateQueryViewMaxLifetime` | Configure node and private listeners, metrics, health probes, profiling, tracing, and LocalStateQuery snapshot lifetime. |
| Logging and TLS | `logging`, `tlsCertFilePath`, `tlsKeyFilePath`, `api.tls` | Select log output and secure supported API or Bark listeners. |
| Storage and APIs | `storageMode`, `plugins.storage`, `plugins.mempool`, `plugins.api`, `corsAllowedOrigins` | Choose stored history, storage providers, transaction ordering, and application APIs. |
| Consensus and plugin selection | `plugins.consensus` | Select the consensus provider used by the node. |
| Bootstrap and synchronization | `mithril`, `mithril.downloadMaxBytes`, `mithril.server`, `mithril.server.aggregator`, `genesisBootstrap`, `genesisBootstrap.corroborationPeers`, `intersectTip`, `immutableDbPath`, `chainsync`, `validateHistorical`, `strictUtxoValidation` | Configure snapshot or genesis bootstrap, synchronization, and historical validation. |
| Peer management | `targetNumberOfKnownPeers`, `targetNumberOfEstablishedPeers`, `targetNumberOfActivePeers`, `targetNumberOfRootPeers`, `activePeersTopologyQuota`, `activePeersGossipQuota`, `activePeersLedgerQuota`, `inboundWarmTarget`, `inboundHotQuota`, `inboundMinTenure`, `inboundHotScoreThreshold`, `inboundPruneAfter`, `inboundDuplexOnlyForHot`, `inboundCooldown` | Set peer targets, source quotas, and inbound peer policy. |
| Block production and ledger rules | `blockProducer`, `shelley*`, `forge*`, `validateForgedBlock`, `minPoolMargin`, `pledgeLeverage*`, `fullPotRewards*`, `delegatorInactivity*`, `ledgerApplyRowBatchingEnabled`, `ledgerPrefetchAheadEnabled` | Configure forging keys, safety thresholds, and optional ledger behaviors. |
| Archives and database lifecycle | `bark*`, `historyExpiry`, `databaseLifecycle` | Serve or consume archive data, expire local history, and manage snapshots. |
| Optional indexes and diagnostics | `midnight`, `midnight.authTokenPolicyId`, `midnight.authTokenAssetName`, `tokenRegistry`, `tokenRegistry.manifestUrl`, `tokenRegistry.trustedManifestKey`, `tokenRegistry.allowRollback`, `koiosParity`, `cache`, `skipRewardLiveStakeBackfillCheck` | Configure optional indexing, authenticated registry refresh, parity diagnostics, caching, and startup validation. |

### Consensus provider

| Setting | YAML key | CLI flag | Environment variable | Default and behavior |
| --- | --- | --- | --- | --- |
| Consensus provider | `plugins.consensus.provider` | `--consensus` | `DINGO_PLUGINS_CONSENSUS_PROVIDER` | `praos` by default. Selects the consensus provider used for header validation, chain comparison, and leader scheduling. |

Dingo records the selected provider's database identity in the data directory.
When the stored identity differs from the selected provider identity, Dingo
rejects startup. Dingo accepts an unmarked database only with the built-in
Praos provider identity `praos/v1`, then records that identity for later checks.

### Ledger processing

| Setting | YAML key | CLI flag | Environment variable | Default and behavior |
| --- | --- | --- | --- | --- |
| Ledger row batching | `ledgerApplyRowBatchingEnabled` | `--ledger-apply-row-batching-enabled` | `DINGO_LEDGER_APPLY_ROW_BATCHING_ENABLED` | `false` (off). In core storage mode, Dingo applies multi-row batching to eligible unvalidated block deltas. Dingo forwards this setting to `serve` and `dingo load`; API mode already uses batching. This setting does not affect consensus. |
| Ledger prefetch ahead | `ledgerPrefetchAheadEnabled` | `--ledger-prefetch-ahead-enabled` | `DINGO_LEDGER_PREFETCH_AHEAD_ENABLED` | `false` (off). For validated blocks, Dingo prefetches the next block's input UTxOs from a read-only transaction while the current block applies. This setting does not affect consensus. |
| Blockfetch low watermark | `blockfetchLowWatermarkEnabled` | `--blockfetch-low-watermark-enabled` | `DINGO_BLOCKFETCH_LOW_WATERMARK_ENABLED` | `false` (off). When enabled while the header is far from the peer tip, Dingo starts blockfetch after one queued blockfetch header range instead of waiting for four. The setting leaves header queue capacity unchanged and does not affect consensus. |

### Metrics listener

| Setting | YAML key | CLI flag | Environment variable | Default and behavior |
| --- | --- | --- | --- | --- |
| Metrics bind address | `metricsBindAddr` | `--metrics-bind-addr` | `DINGO_METRICS_BIND_ADDR` | `127.0.0.1`. This address is independent of `bindAddr` and defaults to loopback. Set it explicitly to a wildcard or remotely reachable address when a scraper runs outside the container or host. |
| Metrics authentication token | `metricsAuthToken` | — | `DINGO_METRICS_AUTH_TOKEN` | Empty by default, which keeps metrics unauthenticated. Dingo provides no CLI flag because process arguments can be visible to other users. When set, clients must send `Authorization: Bearer <token>` to both the node metrics endpoint and the Mithril metrics endpoint. |
| Metrics port | `metricsPort` | `--metrics-port` | — | `12798` by default. Set it to `0` to disable the Prometheus listener. |

The metrics listener uses plain HTTP. Protect the token with a TLS reverse
proxy or an authenticated encrypted tunnel when traffic crosses an untrusted
network.

### Tracing

| Setting | YAML key | CLI flag | Environment variable | Default and behavior |
| --- | --- | --- | --- | --- |
| Tracing collector endpoint | `tracingEndpoint` | `--tracing-endpoint` | `DINGO_TRACING_ENDPOINT` | Empty by default. Set an OTLP HTTP collector URL to enable tracing. When empty, the `tracing` setting controls tracing and the standard `OTEL_EXPORTER_OTLP_*` environment variables select the destination. |
| Tracing service name | `tracingServiceName` | `--tracing-service-name` | `DINGO_TRACING_SERVICE_NAME` | `dingo` by default. Sets the service name for exported traces. |
| Tracing sample ratio | `tracingSampleRatio` | `--tracing-sample-ratio` | `DINGO_TRACING_SAMPLE_RATIO` | `1` by default. Set a value from `0` through `1`, inclusive. Dingo rejects values outside this range during configuration validation. |

### DMQ configuration

| Setting | YAML key | CLI flag | Environment variable | Default | Validation and behavior |
| --- | --- | --- | --- | --- | --- |
| Enabled | `dmq.enabled` | `--dmq-enabled` | `DINGO_DMQ_ENABLED` | `false` | Boolean value; `false` disables the setting. |
| Topic | `dmq.topic` | `--dmq-topic` | `DINGO_DMQ_TOPIC` | `mithril` | When enabled, Dingo requires the value `mithril`; no other value is valid. |
| Network magic | `dmq.networkMagic` | `--dmq-network-magic` | `DINGO_DMQ_NETWORK_MAGIC` | Derived from the topic and Cardano network when unset. | When omitted, Dingo derives the value from the topic and Cardano network. An explicit value overrides the derived value. Set it when the Cardano network has no default for the topic. |
| Socket path | `dmq.socketPath` | `--dmq-socket-path` | `DINGO_DMQ_SOCKET_PATH` | `dingo-dmq.socket` | When enabled, Dingo requires a nonempty value different from the Cardano `socketPath`. |
| Message TTL | `dmq.messageTtl` | `--dmq-message-ttl` | `DINGO_DMQ_MESSAGE_TTL` | `1800` seconds | When enabled, Dingo requires a positive value no greater than `9223372036` seconds. |
| Maximum mempool size | `dmq.maxMempoolSize` | `--dmq-max-mempool-size` | `DINGO_DMQ_MAX_MEMPOOL_SIZE` | `128` MB | When enabled, Dingo requires a positive value no greater than `8796093022207` MB. |
| N2N peer port | `dmq.n2nPort` | `--dmq-n2n-port` | `DINGO_DMQ_N2N_PORT` | `0` | Dingo serves local clients only until a nonzero peer port is configured. |
| IPv4 peer listener address | `dmq.listenAddress` | `--dmq-listen-address` | `DINGO_DMQ_LISTEN_ADDRESS` | `0.0.0.0` | When `dmq.n2nPort` is nonzero, Dingo requires an IPv4 literal when this field is set. An empty value disables the IPv4 listener. |
| IPv6 peer listener address | `dmq.listenIpv6Address` | `--dmq-listen-ipv6-address` | `DINGO_DMQ_LISTEN_IPV6_ADDRESS` | `::` | When `dmq.n2nPort` is nonzero, Dingo requires an IPv6 literal when this field is set. An empty value disables the IPv6 listener. |
| DMQ peer topology file | `dmq.topologyFile` | `--dmq-topology-file` | `DINGO_DMQ_TOPOLOGY_FILE` | Unset | When set, the path must contain no `..` traversal and identify an existing regular file. The current DMQ stack does not consume it for peer dialing. |
| Minimum DMQ peers | `dmq.minPeers` | `--dmq-min-peers` | `DINGO_DMQ_MIN_PEERS` | `3` | The value cannot exceed `dmq.maxPeers`; `0` allows no required peers. |
| Maximum DMQ peers | `dmq.maxPeers` | `--dmq-max-peers` | `DINGO_DMQ_MAX_PEERS` | `10` | The value limits held peer connections and must be at least `dmq.minPeers`; `0` allows no peers when `minPeers` is also `0`. |

Dingo validates these six peer settings when DMQ starts, but the current DMQ
stack does not activate a peer listener or dialer. With `dmq.n2nPort: 0`, Dingo
skips listener address validation. With a nonzero port, each configured listener
address must use its matching IP version.

### ImmutableDB source

The `immutableDbPath` setting and the positional input to `dingo load` accept a
local directory or a remote URL. Remote sources require an `https://` URL;
`http://` works only for loopback hosts, and Dingo rejects non-loopback HTTP.
For HTTPS sources, Dingo rejects private or special-use destinations for the
initial URL, every redirect, and each dial-time DNS resolution. Dingo ignores
ambient HTTP proxy settings for remote imports.
Remote roots provide `tip.json` and numbered `.chunk`, `.primary`, and
`.secondary` files as chunk triads. Dingo rejects mismatched or incomplete
published chunk data. Dingo derives aggregate limits for transfer bytes, cache
and staging, free-space reserves, and concurrency from the requested chunk
range. Dingo reports an error and fails the import when a limit is exceeded or
available free space is insufficient. It then removes staging files after the
failure. For a remote import, if trusted replay or processing fails after
copied immutable blocks advance beyond the ledger-applied tip, Dingo rewinds
the unapplied blocks to that tip before returning the original error. Staging
cleanup therefore does not leave unapplied immutable blocks ahead of the
ledger tip. If the storage backend refuses the rewind, Dingo returns both the
original and rewind errors, and the database requires recovery before another
load. See the bootstrap and data maintenance guide for the remote source,
chunk, and integrity requirements.

### Genesis bootstrap corroboration

| Setting | YAML key | CLI flag | Environment variable | Default and behavior |
| --- | --- | --- | --- | --- |
| Corroborating peers | `genesisBootstrap.corroborationPeers` | `--genesis-bootstrap-corroboration-peers` | `DINGO_GENESIS_BOOTSTRAP_CORROBORATION_PEERS` | `1` by default. One independent peer must report the same recent blocks before a fast source can drive Genesis selection. Set `0` explicitly to disable the corroboration gate for an intentional single-peer or test topology. |

### Blockfrost provider

The built-in Blockfrost provider listens on loopback by default. Read-only API
requests are not subject to the Blockfrost mutation admission limits, although
shared API authentication can still apply when configured.

| Setting | YAML key | CLI flag | Environment variable | Default and validation |
| --- | --- | --- | --- | --- |
| Host | `plugins.api.blockfrost.config.host` | — | — | `127.0.0.1` by default. An explicitly empty value uses the root `bindAddr`; set a host to expose the provider on another interface. |
| Authentication token | `plugins.api.blockfrost.config.authToken` | — | — | Empty by default. Transaction submission and evaluation require this token in `project_id`, `X-Blockfrost-Project-Id`, or `Authorization: Bearer <token>`. Missing or invalid credentials return HTTP `401`. |
| Total concurrent mutations | `plugins.api.blockfrost.config.maxConcurrentMutations` | — | — | `4` by default. The value must be positive and limits transaction submission and evaluation across the provider. |
| Concurrent mutations per client | `plugins.api.blockfrost.config.maxConcurrentMutationsPerClient` | — | — | `1` by default. The value must be positive and no greater than `maxConcurrentMutations`; it limits work from one remote address. |

When `authToken` is configured and the provider listens on a non-loopback host,
configure server TLS through `plugins.api.blockfrost.config.tls`. Dingo
refuses to start authenticated mutation access without server TLS. After
authentication and before reading the request body, the provider applies both
mutation limits. When either limit is exhausted, it returns HTTP `429` with
`Retry-After: 1` without reading the body.

### LocalStateQuery snapshot lifetime

| Setting | YAML key | CLI flag | Environment variable | Default | Validation and behavior |
| --- | --- | --- | --- | --- | --- |
| Maximum lifetime of an acquired ledger snapshot | `localStateQueryViewMaxLifetime` | `--local-state-query-view-max-lifetime` | `DINGO_LOCAL_STATE_QUERY_VIEW_MAX_LIFETIME` | `5m` | Use a positive duration string, such as `5m`. Dingo rejects an invalid, zero, or negative value during startup or configuration validation. After the maximum lifetime, Dingo closes the held snapshot. The next query reopens it at the acquired point and answers from that snapshot; tip acquires use their snapshotted tips. If a rollback removes the acquired point or retention pruning removes it, Dingo cannot reopen the snapshot and closes the connection. |

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

### SQL metadata TLS

Provider-generated PostgreSQL connections use `sslMode: verify-full` by
default, which verifies the server certificate and hostname. Provider-generated
MySQL connections use `tls=true` when `sslMode` is unset and the host is not a
loopback host; `localhost`, `127.0.0.1`, and `::1` remain exempt from this
automatic remote-TLS default. An explicitly supplied `dsn` remains authoritative
and bypasses these provider-generated defaults.

MySQL snapshot and restore reject `tls=skip-verify` instead of weakening the
connection to opportunistic TLS. Use an explicit supported mode such as
`tls=false`, `tls=true`, or `tls=preferred` when the lifecycle operation needs a
different setting.

### Midnight auth-token configuration

Configure the Midnight auth-token fields under `midnight` when registration
authorization must use a specific policy and asset.

| Setting | YAML key | Default | Validation and behavior |
| --- | --- | --- | --- |
| Auth-token policy ID | `midnight.authTokenPolicyId` | Empty | The configured policy ID must contain exactly 56 hexadecimal characters and decode to 28 bytes. |
| Auth-token asset name | `midnight.authTokenAssetName` | Empty | Dingo uses this value with the configured policy ID when it validates an auth token. |

Operators must set both fields or leave both fields empty. A partial pair fails
configuration and startup validation. When configured, Dingo accepts an auth
token only when its policy ID and asset name exactly match the configured
values.

### Badger value-log garbage collection

Configure these provider YAML keys under `plugins.storage.blob.config` for the
Badger provider. These settings do not add top-level CLI flags or environment
variables.

Dingo uses `1 MiB` as the default for
`plugins.storage.blob.config.valueThreshold`, except during Core-mode `sync`
and Mithril sync, when Dingo uses `1 KiB`.
An explicit YAML value overrides either mode default, including an explicit
`0`.

| Setting | Provider YAML key | Default | Validation and behavior |
| --- | --- | --- | --- |
| Value-log GC interval | `plugins.storage.blob.config.gcInterval` | `5m` | A zero interval selects the `5m` default. Dingo rejects negative intervals. |
| Value-log GC discard ratio | `plugins.storage.blob.config.gcDiscardRatio` | `0.5` | The value must be strictly greater than `0` and less than `1`. |

Dingo keeps value-log GC disabled in both `load` and `sync` bulk-import modes,
even when the Badger provider configuration sets
`plugins.storage.blob.config.gc` to `true`.

### Database lifecycle snapshot pause bound

| Setting | YAML key | CLI flag | Environment variable | Default | Validation and scope |
| --- | --- | --- | --- | --- | --- |
| Snapshot commit pause bound | `databaseLifecycle.snapshotMaxCommitPause` | `--db-snapshot-max-commit-pause` | `DINGO_DB_LIFECYCLE_SNAPSHOT_MAX_COMMIT_PAUSE` | `30s`. Set `0s` for no bound. | Set a nonnegative duration. Dingo rejects negative values during configuration validation. A positive duration limits manual and offline, live, and automatic epoch-boundary snapshots after they acquire the commit barrier. If the bound is exceeded, Dingo cancels the snapshot, removes partial output, and reports an error that wraps `ErrCommitPauseExceeded`. |

### Database lifecycle snapshot trust key

| Setting | YAML key | CLI flag | Environment variable | Default and validation |
| --- | --- | --- | --- | --- |
| Snapshot trust-key file | `databaseLifecycle.snapshotTrustKeyFile` | `--db-snapshot-trust-key-file` | `DINGO_DB_LIFECYCLE_SNAPSHOT_TRUST_KEY_FILE` | Empty by default. A configured file must contain at least 16 bytes and no more than 1024 bytes, and must be a regular, non-symlink file. |

Unix requires the file to belong to the current user and to grant no group or
other access. Windows accepts the current user or `BUILTIN\Administrators` as
owner when the process belongs to that group. Its DACL may contain only the
owner, `Administrators`, `SYSTEM`, `Creator Owner`, and `Owner Rights`, plus
the restricted local `Administrator` ACE when `Administrators` owns the file.
Dingo rejects an invalid file during snapshot authentication and during any
lifecycle operation that needs the trust key.

### Bark remote lifecycle service

The remote Bark lifecycle service is disabled by default. When enabled, it
provides `Stop`, `Restart`, and `GetStatus` operations through Bark. Bark uses
`127.0.0.1` by default when a lifecycle service is mounted; set `barkHost` to
expose it on another interface.

| Setting | YAML key | CLI flag | Environment variable | Default and requirements |
| --- | --- | --- | --- | --- |
| Enable lifecycle service | `barkLifecycleEnabled` | `--bark-lifecycle-enabled` | `DINGO_BARK_LIFECYCLE_ENABLED` | `false`. Enabling it requires a nonzero `barkPort`, `barkClientCaFilePath`, both `tlsCertFilePath` and `tlsKeyFilePath`, and at least one `barkLifecycleOperatorCertificateFingerprints` value. |
| Lifecycle operator certificates | `barkLifecycleOperatorCertificateFingerprints` | `--bark-lifecycle-operator-certificate-fingerprints` | `DINGO_BARK_LIFECYCLE_OPERATOR_CERTIFICATE_FINGERPRINTS` | Empty by default. Each value must be the SHA-256 fingerprint of the client certificate DER bytes, encoded as hexadecimal; colons are accepted and matching ignores case. These credentials authorize `Stop` and `Restart` only. |
| Private or special-use addresses for block downloads | `barkBlockDownloadAllowPrivateAddresses` | `--bark-block-download-allow-private-addresses` | `DINGO_BARK_BLOCK_DOWNLOAD_ALLOW_PRIVATE_ADDRESSES` | `false`. When `true`, Dingo permits private or special-use resolved addresses for Bark block-download destinations. Dingo still checks the origin allowlist, requires HTTPS, validates redirects, and disables proxy use. This setting affects block downloads only, not Bark RPC traffic. |

All lifecycle operations require a client certificate verified against
`barkClientCaFilePath`. `Stop` and `Restart` additionally require a matching
certificate fingerprint from the lifecycle operator list. `GetStatus` requires
mTLS but does not require that allowlist. DatabaseService operator
credentials remain separate and do not grant lifecycle access. `Restart` is
available on Unix platforms; other platforms return an unsupported operation
error.

### Bark archive lookup budgets

| Setting | YAML key | CLI flag | Environment variable | Default and validation |
| --- | --- | --- | --- | --- |
| Global archive lookups per second | `barkArchiveLookupsPerSecond` | `--bark-archive-lookups-per-second` | `DINGO_BARK_ARCHIVE_LOOKUPS_PER_SECOND` | `200` when set to `0`. The budget covers all anonymous `ArchiveService` callers. Dingo rejects negative values. |
| Per-caller archive lookups per second | `barkArchiveCallerLookupsPerSecond` | `--bark-archive-caller-lookups-per-second` | `DINGO_BARK_ARCHIVE_CALLER_LOOKUPS_PER_SECOND` | `50` when set to `0`. Dingo keys callers by IPv4 address or IPv6 `/64` and rejects negative values. |

Dingo charges the full `FetchBlock` reference batch against both budgets. When
either budget cannot cover the batch, Dingo refuses the whole request with
`RESOURCE_EXHAUSTED` before it performs archive or cloud lookups.

### File-backed secret and parity inputs

File-backed inputs provide alternatives to literal values. Dingo applies the
same CLI, environment, YAML, and built-in default precedence described above.
Dingo rejects a source that sets both the literal form and the file form.

| Setting | YAML key | CLI flag | Environment variable | Default and behavior |
| --- | --- | --- | --- | --- |
| Dingo Koios parity API key file | `koiosParity.apiKeyFile` | `--koios-parity-api-key-file` | `DINGO_KOIOS_PARITY_API_KEY_FILE` | Empty by default. Use instead of `koiosParity.apiKey`, `--koios-parity-api-key`, or `DINGO_KOIOS_PARITY_API_KEY`. Dingo reads the file as the API key string. |
| Generic plugin configuration field file | — | — | `DINGO_PLUGINS_<CAPABILITY>_CONFIG_<FIELD>_FILE` | Use instead of `DINGO_PLUGINS_<CAPABILITY>_CONFIG_<FIELD>`. Dingo reads the file as a plain string and does not parse its contents as YAML. |
| `koios-parity` API key file | — | `--api-key-file` | `KOIOS_API_KEY_FILE` | Use instead of `--api-key` or `KOIOS_API_KEY`. CLI flags take precedence over environment variables. |
| `koios-parity` metadata DSN file | — | `--metadata-dsn-file` | — | Use instead of `--metadata-dsn`. The file supplies the connection string as plain text. |
| `node-parity from-genesis` Koios API key file | — | `--koios-api-key-file` | — | Use instead of `--koios-api-key`. The file supplies the API key used for the Koios request. |

Every file-backed value must meet these requirements:

- The path must identify a regular file. Dingo rejects directories, devices,
  and other non-regular paths.
- Dingo accepts at most `64 KiB` of file content. Dingo strips trailing `CR`
  and `LF` characters, then rejects empty or whitespace-only content.
- File permissions or ACLs must satisfy the platform security policy. Unix
  files can allow owner and group access but cannot allow access to other
  users. Windows ACLs can allow only the owner, Administrators, and SYSTEM.
- Dingo identifies the value or path in errors but never includes file contents.

### Token registry manifest authentication

When configuration enables token registry sync, Dingo requires a signed manifest
URL and the trusted public key used to verify it.

| Setting | YAML key | CLI flag | Environment variable | Default and behavior |
| --- | --- | --- | --- | --- |
| Signed manifest URL | `tokenRegistry.manifestUrl` | `--token-registry-manifest-url` | `DINGO_TOKEN_REGISTRY_MANIFEST_URL` | Empty by default. Required when token registry sync is enabled. Set an absolute HTTPS URL. |
| Trusted manifest key | `tokenRegistry.trustedManifestKey` | `--token-registry-trusted-manifest-key` | `DINGO_TOKEN_REGISTRY_TRUSTED_MANIFEST_KEY` | Empty by default. Required when token registry sync is enabled. Set a hex-encoded 32-byte Ed25519 public key. |
| Allow manifest rollback | `tokenRegistry.allowRollback` | `--token-registry-allow-rollback` | `DINGO_TOKEN_REGISTRY_ALLOW_ROLLBACK` | `false` by default. Set `true` only for an intentional publisher rollback. |

If `tokenRegistry.sourceUrl` has an explicit value, Dingo also requires it to
be an absolute HTTPS URL. Before Dingo applies a snapshot, it verifies the
signed manifest against the configured archive URL, exact compressed size, and
BLAKE2b-256 digest. The manifest also supplies the sequence used for rollback
checks.

Dingo rejects unauthenticated, mismatched, or incomplete snapshots. Dingo
also rejects a lower sequence unless `allowRollback` is `true`, and rejects a
same-sequence digest change. A rejected snapshot does not replace the last
accepted snapshot.

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
