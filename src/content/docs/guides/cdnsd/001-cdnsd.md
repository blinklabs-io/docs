---
title: cDNSd
description: Run a Cardano and Handshake-aware DNS resolver with cDNSd.
---

cDNSd is a DNS resolver and blockchain indexer for [Cardano](https://cardano.org/)
and [Handshake](https://handshake.org/). It resolves second-level domains registered
under Handshake top-level domains while still resolving ordinary DNS names through
ICANN root hints.

The daemon serves DNS over UDP and TCP, can serve DNS-over-TLS, and exposes
Prometheus metrics. Configure it with YAML, environment variables, or both.

## What you need

- A Cardano node that cDNSd can reach over TCP or a local IPC socket.
- A persistent directory for cDNSd state.
- A configured profile for the Cardano/Handshake domains you want to resolve.

## Next steps

- Follow the [Quick Start](/guides/cdnsd/002-quick-start/) to install, configure,
  and test a resolver.
- Use the [Configuration Reference](/guides/cdnsd/003-configuration-reference/)
  for every YAML key and environment variable.

## Source and support

- [cDNSd source code](https://github.com/blinklabs-io/cdnsd)
- [cDNSd releases](https://github.com/blinklabs-io/cdnsd/releases)
- [Open an issue](https://github.com/blinklabs-io/cdnsd/issues)
