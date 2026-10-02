---
title: Node Configuration and Storage Modes
description: Choose a Dingo node role and find the matching configuration options.
---

Use the [quick start](/guides/dingo/002-quick-start-overview/) to install Dingo
and start a node. This page explains the main configuration choices. Read the
[complete Dingo v0.77.0 configuration reference](/guides/dingo/009-configuration-reference/)
and download the release-matched [`dingo.yaml.example`](https://raw.githubusercontent.com/blinklabs-io/dingo/v0.77.0/dingo.yaml.example).

## Choose a node role

| Role | Storage mode | Block production | Use |
| --- | --- | --- | --- |
| Relay | `core` | Off | Follow and validate the chain, serve node-to-node and node-to-client connections. |
| Block producer | `core` | On, with pool keys and an operational certificate | Follow the chain and forge blocks when elected. Use the [SPO guides](../SPO%20Guides/000-spo-guide/). |
| API node | `api` | Off | Keep historical transaction data and serve configured Blockfrost, Mesh, UTxO RPC, or the optional built-in Kupo-compatible API. |

`core` is the default storage mode and stores the data needed for consensus.
`api` also indexes historical transaction details for query services. API
providers require `api` mode, including the optional built-in Kupo-compatible
API. Setting an individual provider port to `0` disables that listener. Storage
mode does not enable block production.

Dingo block production is intended for test networks and private devnets in
current releases. Follow the pool key and certificate guidance in the [SPO
guides](../SPO%20Guides/000-spo-guide/); do not use a mainnet
configuration as a signal that mainnet production is supported.

## Configure Dingo

Dingo reads settings from a YAML file, environment variables, and command-line
flags. The precedence is command-line flags, environment variables, YAML, then
built-in defaults. A basic local run uses the embedded Preview network
configuration:

```sh
./dingo --network preview
```

For a persistent or non-default setup, save the downloaded file as
`dingo.yaml` and pass it with `--config`. Configuration options and defaults
can change between releases.

Providers are configured under `plugins`: storage providers keep block data
and metadata, mempool providers order pending transactions, and API providers
serve client requests. Provider-specific configuration lives alongside the
provider name. The example file documents the providers and options available
in Dingo v0.77.0. Environment variables use the
`DINGO_PLUGINS_<CAPABILITY>_<PROVIDER>_...` form. For example, the current
example shows the supported blob and metadata providers and their options.

The [Grafana guide](../SPO%20Guides/008-grafana-dashboard/) covers
metrics dashboards. For deployment as a Linux service, see [Run Dingo as a
service](/guides/dingo/003-create-start-up-service/).


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
