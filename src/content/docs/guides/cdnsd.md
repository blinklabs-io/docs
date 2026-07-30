---
title: cDNSd
description: Run a Cardano and Handshake-aware DNS resolver with cDNSd.
---

cDNSd is a DNS resolver and blockchain indexer for [Cardano](https://cardano.org/)
and [Handshake](https://handshake.org/). It resolves second-level domains registered
under Handshake top-level domains, while still resolving ordinary DNS names through
the ICANN root hints.

The daemon listens for DNS over UDP and TCP, can expose DNS-over-TLS, and provides
Prometheus metrics for monitoring. Configuration can be supplied as YAML and then
overridden with environment variables.

## Install and start

Build or download `cdnsd` from the [cDNSd releases](https://github.com/blinklabs-io/cdnsd/releases),
then start it with an optional configuration file:

```sh
cdnsd -config /etc/cdnsd/config.yaml
```

With no configuration file, cDNSd uses its built-in defaults, including DNS on port
`8053`, DNS-over-TLS on port `8853`, metrics on port `8081`, and persistent state in
`./.state`. Ports below `1024` generally require elevated privileges, so use a
reverse proxy or a container port mapping when exposing standard port 53.

## Minimal configuration

The following configuration enables the Cardano preprod profile and stores the sync
database outside the working directory:

```yaml
dns:
  address: "0.0.0.0"
  port: 8053
indexer:
  network: "preprod"
  address: "127.0.0.1:3001"
state:
  dir: "/var/lib/cdnsd"
profiles:
  - "ada-preprod"
```

The Cardano node address must point to a node that cDNSd can reach. Use
`socketPath` instead when connecting through a local node socket. Profiles provide
network and domain settings; the available profile names are maintained in the
[cDNSd profile configuration](https://github.com/blinklabs-io/cdnsd/blob/main/internal/config/profile.go).

## Configuration reference

Every setting may be written in YAML or overridden with the corresponding
environment variable. Environment variables take precedence over the YAML file.

### Logging, DNS, and observability

| YAML key | Environment variable | Purpose | Default |
| --- | --- | --- | --- |
| `logging.debug` | `LOGGING_DEBUG` | Enable debug logging. | `false` |
| `logging.queryLog` | `LOGGING_QUERY_LOG` | Log individual DNS queries. | `true` |
| `dns.address` | `DNS_LISTEN_ADDRESS` | DNS listen address; empty means all interfaces. | empty |
| `dns.port` | `DNS_LISTEN_PORT` | UDP/TCP DNS port. | `8053` |
| `dns.tlsPort` | `DNS_LISTEN_TLS_PORT` | DNS-over-TLS port. | `8853` |
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

### Indexing, state, and TLS

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

## Environment-only example

This is useful for a container or a systemd unit where mounting a YAML file is
undesirable:

```sh
export DNS_LISTEN_ADDRESS=127.0.0.1
export DNS_LISTEN_PORT=8053
export INDEXER_NETWORK=preprod
export INDEXER_TCP_ADDRESS=127.0.0.1:3001
export STATE_DIR=/var/lib/cdnsd
export PROFILES=ada-preprod
cdnsd
```

## Test a resolver

Query the DNS listener directly with `dig`:

```sh
dig @127.0.0.1 -p 8053 example.com
dig @127.0.0.1 -p 8053 example.ada
```

The first query exercises ordinary DNS resolution. The second exercises a domain
served by a configured Cardano/Handshake profile. If the daemon is listening on
DNS-over-TLS, test it with a compatible client and the configured certificate.

## Metrics and debugging

When metrics are enabled, scrape the `/metrics` endpoint on the configured metrics
address and port. Set `debug.port` to a non-zero value to enable the debug HTTP
server, including Go pprof endpoints. Keep both endpoints on localhost or behind
authentication unless they are intentionally exposed for monitoring.

## Source and support

- [cDNSd source code](https://github.com/blinklabs-io/cdnsd)
- [Configuration implementation](https://github.com/blinklabs-io/cdnsd/blob/main/internal/config/config.go)
- [Open an issue](https://github.com/blinklabs-io/cdnsd/issues)
