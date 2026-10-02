---
title: Dingo APIs and Archive Services
description: Configure Dingo APIs for applications and Bark for Dingo archive traffic.
---

## Application APIs

Dingo's Blockfrost-compatible REST, Mesh/Rosetta REST, UTxO RPC, and
Kupo-compatible REST interfaces serve application clients. They require
`storageMode: api`, which stores historical transaction data for queries.
Configure each listener under `plugins.api`; set its port to `0` to disable it.

| Interface | Protocol | Default port |
| --- | --- | ---: |
| Blockfrost-compatible API | HTTP/REST | `3000` |
| Mesh (Rosetta) | HTTP/REST | `8080` |
| UTxO RPC | Connect/gRPC and HTTP | `9090` |
| Kupo-compatible API | HTTP/REST | Default `port: 0` (disabled); built-in provider example: `1442` |

Kupo uses the built-in provider. Enable it with `storageMode: api` and a
nonzero provider port. For example:

```yaml
storageMode: api
plugins:
  api:
    kupo:
      provider: builtin
      config:
        port: 1442
```

The `--kupo-provider=builtin` option selects the built-in provider from the
command line. The YAML port key is `plugins.api.kupo.config.port`; the
corresponding environment variable is
`DINGO_PLUGINS_API_KUPO_CONFIG_PORT`. The provider follows the node's normal
start and stop lifecycle.

For example, enable the built-in Blockfrost and UTxO RPC providers in
`dingo.yaml`:

```yaml
storageMode: api
plugins:
  api:
    blockfrost:
      provider: builtin
      config:
        port: 3000
    utxorpc:
      provider: builtin
      config:
        port: 9090
```

The complete v0.77.0 configuration reference and release-matched
[`dingo.yaml.example`](https://raw.githubusercontent.com/blinklabs-io/dingo/v0.77.0/dingo.yaml.example) are
available on this site. Use configuration files with their matching release;
provider options can change between versions.

## Secure API access

The shared API bind address applies to the selected API providers, including
Kupo. The `api.tls` and `api.auth` settings define shared defaults. A provider
can override either policy under its own `plugins.api.<name>.config` block;
provider-specific TLS settings can override the shared TLS defaults.
Authentication is disabled by default.
When token authentication is enabled, send `Authorization: Bearer <token>`;
Blockfrost clients may also use the `project_id` header. UTxO RPC's HTTP and
Connect/gRPC routes use the bearer token as well.

Authentication applies to every route on that listener, including health
checks. Configure a probe to send the token or use a TCP check when the probe
cannot attach credentials. Dingo rejects incomplete TLS certificate/key pairs
at startup and does not log token or key contents.

You can also put API listeners behind a reverse proxy or API gateway. Choose
one place to terminate TLS and authenticate requests, and configure Dingo's
listener policy to match that deployment.

## Kupo-compatible API

The optional Kupo-compatible provider exposes Kupo v2.12-compatible responses
for these route families:

- Matches: `/matches`
- Datum: `/datums/{datum_hash}`
- Script: `/scripts/{script_hash}`
- Checkpoints: `/checkpoints` and `/checkpoints/{slot_no}`
- Metadata: `/metadata/{slot_no}`
- Health: `/health`
- Metrics: `/metrics`

The API always uses the fixed global `*` pattern for match queries, so match
requests use the provider's global pattern.

Clients should account for these compatibility behaviors:

- Requests for missing datum, script, or checkpoint resources return HTTP `404`.
- `GET /metadata/{slot_no}` returns HTTP `400` immediately when `slot_no` is
  beyond the newest indexed block. The request does not wait for a future block.

## Bark archive traffic

Bark is a Dingo-to-Dingo archive protocol, separate from the application APIs.
An archive node can serve historical blocks from signed-URL-capable object
storage. A history-expiry node can use a Bark archive as a fallback after old
local block files expire; see [Bootstrap and data
maintenance](/guides/dingo/007-bootstrap-and-data-maintenance/).

Bark has no built-in authentication for ordinary archive traffic. Keep it on a
trusted network. If you enable the database lifecycle service, follow the
configuration example's mutual TLS requirements for its maintenance RPCs.


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
