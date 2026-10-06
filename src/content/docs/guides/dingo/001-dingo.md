---
title: Dingo
description: Find Dingo documentation for node operators, application developers, and contributors.
---

![Dingo logo](/dingo-logo-250.png)

Dingo is Blink Labs' Cardano node implementation written in Go. These guides
are organized by what you want to do.

## I operate a Dingo node

- [Quick start](/guides/dingo/002-quick-start-overview/) — download Dingo and
  start a Preview node.
- [Run Dingo in a container](/guides/dingo/008-docker/) — use the published
  image, persist node data, and check container health.
- [Configuration and storage modes](/guides/dingo/005-node-configuration/) —
  choose a relay, block producer, or API node and configure providers.
- [Dingo configuration reference](/guides/dingo/009-configuration-reference/) —
  configure Dingo v0.79.0 and review every setting.
- [Download the Dingo v0.79.0 `dingo.yaml.example`](https://raw.githubusercontent.com/blinklabs-io/dingo/v0.79.0/dingo.yaml.example).
- [Bootstrap and data maintenance](/guides/dingo/007-bootstrap-and-data-maintenance/)
  — use Mithril and manage local node data.
- [Run Dingo as a service](/guides/dingo/003-create-start-up-service/) and
  [monitor it with Grafana](../SPO%20Guides/008-grafana-dashboard/).
- [Stake pool operator guides](../SPO%20Guides/000-spo-guide/) —
  configure and operate a testnet block producer.

## I connect an application

- [API and archive services](/guides/dingo/006-apis-and-archive/) — choose an
  API, configure access, and understand Bark archive nodes.
- [Build a Blockfrost API client](/guides/dingo/Development%20Guides/009-build-blockfrost-client/) —
  connect an explorer or service through Dingo's Blockfrost-compatible API.
- [Build a wallet frontend with UTxO RPC](/guides/dingo/Development%20Guides/010-build-utxorpc-frontend/)
  — query wallet UTxOs and submit transactions through Dingo.
- [Build a governance dashboard](/guides/dingo/Development%20Guides/011-build-governance-dashboard/)
  — understand the tradeoffs of reading indexed governance metadata.
- [Use Dingo with Cardano CLI](/guides/dingo/004-using-dingo-with-cardano-cli/)
  — query a running node over node-to-client.

## I contribute to Dingo

The [Dingo repository](https://github.com/blinklabs-io/dingo) contains the Go
source and contributor documentation. Start with its
[development guide](https://github.com/blinklabs-io/dingo/blob/main/docs/development.md),
[architecture](https://github.com/blinklabs-io/dingo/blob/main/ARCHITECTURE.md),
and [database design](https://github.com/blinklabs-io/dingo/blob/main/DATABASE.md).
For Go library API documentation, see
[pkg.go.dev](https://pkg.go.dev/github.com/blinklabs-io/dingo).

See the [release notes](/guides/dingo/releases/001-release-notes/) for changes
between versions.


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
