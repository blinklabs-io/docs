---
title: Dingo
description: Find Dingo documentation for node operators, application developers, and contributors.
---

![Dingo logo](/dingo-logo-250.png)

Dingo is Blink Labs' Cardano node implementation written in Go. These guides
are organized by what you want to do.

> Dingo is under active development. Use it on Preview, Preprod, or private
> devnets; current releases are not intended for mainnet operation.

## I operate a Dingo node

- [Quick start](/guides/dingo/002-quick-start-overview/) — download Dingo and
  start a Preview node.
- [Configuration and storage modes](/guides/dingo/005-node-configuration/) —
  choose a relay, block producer, or API node and configure providers.
- [Bootstrap and data maintenance](/guides/dingo/007-bootstrap-and-data-maintenance/)
  — use Mithril and manage local node data.
- [Run Dingo as a service](/guides/dingo/003-create-start-up-service/) and
  [monitor it with Grafana](../SPO%20Guides/008-grafana-dashboard/).
- [Stake pool operator guides](../SPO%20Guides/001-spo-guide/) —
  configure and operate a testnet block producer.

## I connect an application

- [API and archive services](/guides/dingo/006-apis-and-archive/) — choose an
  API, configure access, and understand Bark archive nodes.
- [Use Dingo with Cardano CLI](/guides/dingo/004-using-dingo-with-cardano-cli/)
  — query a running node over node-to-client.

## I contribute to Dingo

The [Dingo repository](https://github.com/blinklabs-io/dingo) contains the Go
source, examples, and contributor documentation. Start with its
[development guide](https://github.com/blinklabs-io/dingo/blob/main/docs/development.md),
[architecture](https://github.com/blinklabs-io/dingo/blob/main/ARCHITECTURE.md),
and [database design](https://github.com/blinklabs-io/dingo/blob/main/DATABASE.md).

For exact, release-specific settings, use the
[configuration example](https://github.com/blinklabs-io/dingo/blob/main/dingo.yaml.example)
from the same Dingo version you run. See the
[release notes](/guides/dingo/releases/001-release-notes/) for changes between
versions.
