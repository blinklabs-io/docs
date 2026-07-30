---
title: Configuration Reference
description: YAML and environment-variable reference for cDNSd.
---

cDNSd reads an optional YAML file and then applies environment variable overrides.
Environment variables take precedence over YAML values.

## Logging, DNS, and observability

| YAML key | Environment variable | Purpose | Default |
| --- | --- | --- | --- |
| `logging.debug` | `LOGGING_DEBUG` | Enable debug logging. | `false` |
| `logging.queryLog` | `LOGGING_QUERY_LOG` | Log individual DNS queries. | `true` |
| `dns.address` | `DNS_LISTEN_ADDRESS` | DNS listen address; empty means all interfaces. | empty |
| `dns.port` | `DNS_LISTEN_PORT` | UDP/TCP DNS port. | `8053` |
| `dns.tlsPort` | `DNS_LISTEN_TLS_PORT` | DNS-over-TLS port; TLS still requires both key and certificate paths. | `8853` |
| `dns.recursionEnabled` | `DNS_RECURSION` | Allow recursive lookups for non-blockchain names. | `false` |
| `dns.rootHints` | `DNS_ROOT_HINTS` | Root-hints content supplied directly. | built in |
| `dns.rootHintsFile` | `DNS_ROOT_HINTS_FILE` | File containing root hints. | empty |
| `dns.retryCount` | `DNS_RETRY_COUNT` | Number of upstream lookup retries. | `3` |
| `dns.retryDelayMs` | `DNS_RETRY_DELAY_MS` | Delay between retries in milliseconds. | `100` |
| `dns.queryTimeoutMs` | `DNS_QUERY_TIMEOUT_MS` | Upstream query timeout in milliseconds. | `5000` |
| `dns.soa.mname` | `DNS_SOA_MNAME` | SOA primary name server. | `ns1.cdnsd.localhost.` |
| `dns.soa.rname` | `DNS_SOA_RNAME` | SOA responsible mailbox. | `hostmaster.cdnsd.localhost.` |
| `dns.soa.refresh` | `DNS_SOA_REFRESH` | SOA refresh interval. | `3600` |
| `dns.soa.retry` | `DNS_SOA_RETRY` | SOA retry interval. | `900` |
| `dns.soa.expire` | `DNS_SOA_EXPIRE` | SOA expiry interval. | `604800` |
| `dns.soa.minimum` | `DNS_SOA_MINIMUM` | SOA minimum/TTL value. | `86400` |
| `metrics.address` | `METRICS_LISTEN_ADDRESS` | Prometheus metrics listen address. | empty |
| `metrics.port` | `METRICS_LISTEN_PORT` | Prometheus metrics port. | `8081` |
| `debug.address` | `DEBUG_ADDRESS` | Debug and pprof HTTP listen address. | `localhost` |
| `debug.port` | `DEBUG_PORT` | Debug and pprof HTTP port; `0` disables it. | `0` |

`METRICS_LISTEN_ADDRESS=127.0.0.1` is the safest local-only setting. An empty
address binds an unauthenticated `/metrics` endpoint on all interfaces.

## Indexing, state, and TLS

| YAML key | Environment variable | Purpose | Default |
| --- | --- | --- | --- |
| `indexer.network` | `INDEXER_NETWORK` | Cardano network name, such as `preprod` or `mainnet`. | profile-provided |
| `indexer.networkMagic` | `INDEXER_NETWORK_MAGIC` | Cardano network magic when required. | `0` |
| `indexer.address` | `INDEXER_TCP_ADDRESS` | Cardano node TCP address. | empty |
| `indexer.socketPath` | `INDEXER_SOCKET_PATH` | Cardano node IPC socket path. | empty |
| `indexer.interceptHash` | `INDEXER_INTERCEPT_HASH` | Block hash at which to begin or resume syncing. | profile-provided |
| `indexer.interceptSlot` | `INDEXER_INTERCEPT_SLOT` | Slot at which to begin or resume syncing. | profile-provided |
| `indexer.verify` | `INDEXER_VERIFY` | Enable additional indexer verification. | `true` |
| `indexer.handshakeAddress` | `INDEXER_HANDSHAKE_ADDRESS` | Handshake peer address. | empty |
| `state.dir` | `STATE_DIR` | Persistent BadgerDB state directory. | `./.state` |
| `tls.certFilePath` | `TLS_CERT_FILE_PATH` | TLS certificate for DNS-over-TLS. | empty |
| `tls.keyFilePath` | `TLS_KEY_FILE_PATH` | TLS private key for DNS-over-TLS. | empty |
| `profiles` | `PROFILES` | Comma-separated enabled profile names. | `ada-preprod,auto-preprod` |

DNS-over-TLS starts only when `TLS_CERT_FILE_PATH` and `TLS_KEY_FILE_PATH` both
point to readable files. Profiles can supply a network and sync intercept point;
view the [profile source](https://github.com/blinklabs-io/cdnsd/blob/main/internal/config/profile.go)
for the current list.
