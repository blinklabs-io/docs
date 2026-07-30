---
title: Quick Start
description: Install, configure, and test a cDNSd resolver.
---

## Step 1: Install and start cDNSd

Build or download `cdnsd` from the [cDNSd releases](https://github.com/blinklabs-io/cdnsd/releases),
then start it with an optional configuration file:

```sh
cdnsd -config /etc/cdnsd/config.yaml
```

With no configuration file, cDNSd uses DNS on port `8053`, metrics on port `8081`,
and persistent state in `./.state`. DNS-over-TLS uses port `8853` only when both TLS
certificate and key paths are configured; otherwise it is disabled. Ports below
`1024` generally require elevated privileges, so use a reverse proxy or container
port mapping when exposing standard port 53.

## Step 2: Create a minimal configuration

This example enables the Cardano preprod profile and stores state outside the
working directory:

```yaml
dns:
  address: "0.0.0.0"
  port: 8053
metrics:
  address: "127.0.0.1"
  port: 8081
indexer:
  network: "preprod"
  address: "127.0.0.1:3001"
state:
  dir: "/var/lib/cdnsd"
profiles:
  - "ada-preprod"
```

The Cardano node address must point to a node cDNSd can reach. Use `socketPath`
instead of `address` when connecting through a local node socket. Profiles provide
network and domain settings; see the [available profiles](https://github.com/blinklabs-io/cdnsd/blob/main/internal/config/profile.go).

An empty `METRICS_LISTEN_ADDRESS` binds metrics on all interfaces. The `/metrics`
endpoint is unauthenticated, so use `127.0.0.1` for local-only monitoring or put an
intentionally exposed endpoint behind network controls and authentication.

## Step 3: Start with environment variables

For a container or systemd unit, override the same values without mounting YAML:

```sh
export DNS_LISTEN_ADDRESS=127.0.0.1
export DNS_LISTEN_PORT=8053
export METRICS_LISTEN_ADDRESS=127.0.0.1
export INDEXER_NETWORK=preprod
export INDEXER_TCP_ADDRESS=127.0.0.1:3001
export STATE_DIR=/var/lib/cdnsd
export PROFILES=ada-preprod
cdnsd
```

Environment variables take precedence over values in the YAML file.

## Step 4: Test the resolver

Query the DNS listener directly with `dig`:

```sh
dig @127.0.0.1 -p 8053 example.com
dig @127.0.0.1 -p 8053 <indexed-domain>.ada
```

The first query exercises ordinary DNS resolution. Replace `<indexed-domain>` with
a domain known to be present in your node's indexed Cardano/Handshake state; a
configured profile alone does not guarantee that any particular name resolves. If
DNS-over-TLS is enabled, test it with a compatible client and the configured
certificate.

## Step 5: Monitor cDNSd

Scrape `/metrics` on the configured metrics address and port. Set `debug.port` to a
non-zero value to enable the debug HTTP server, including Go pprof endpoints. Keep
debug endpoints on localhost or behind authentication unless they are intentionally
exposed for diagnostics.

For all configuration options, read the [Configuration Reference](/guides/cdnsd/003-configuration-reference/).
