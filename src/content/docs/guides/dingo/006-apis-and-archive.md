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
        host: 127.0.0.1
        maxConcurrentMutations: 4
        maxConcurrentMutationsPerClient: 1
    utxorpc:
      provider: builtin
      config:
        port: 9090
        host: "127.0.0.1"
```

### Blockfrost mutation requests

The built-in Blockfrost provider listens on `127.0.0.1` by default. It does
not inherit the root `bindAddr` unless `plugins.api.blockfrost.config.host` is
explicitly empty. Set a specific host to expose it on another interface.

Blockfrost mutation routes accept anonymous requests. The provider uses `4` for
`maxConcurrentMutations` and `1` for
`maxConcurrentMutationsPerClient` by default. Set both values to positive
integers, and keep `maxConcurrentMutationsPerClient` no greater than
`maxConcurrentMutations`.

The following routes accept anonymous requests and consume mutation admission
capacity:

| Route | Authentication and admission behavior |
| --- | --- |
| `POST /api/v0/tx/submit` | Accepts anonymous requests and consumes global and per-client mutation admission capacity. |
| `POST /api/v0/utils/txs/evaluate` | Accepts anonymous requests and consumes global and per-client mutation admission capacity. |
| `POST /api/v0/utils/txs/evaluate/utxos` | Accepts anonymous requests and consumes global and per-client mutation admission capacity. |

Dingo accepts a request only when the global and per-client limits have
capacity. It checks capacity before it reads the request body; an
over-capacity request returns HTTP `429` with `Retry-After: 1`.

Keep the default loopback host unless external mutation access is an
intentional deployment decision.

The complete v0.92.4 configuration reference and release-matched
[`dingo.yaml.example`](https://raw.githubusercontent.com/blinklabs-io/dingo/v0.92.4/dingo.yaml.example) are
available on this site. Use configuration files with their matching release;
provider options can change between versions.

## Secure API access

The shared API bind address applies to the selected API providers, including
Kupo. The built-in UTxO RPC listener binds to `127.0.0.1` by default. To allow
remote access, set `plugins.api.utxorpc.config.host` explicitly; the shared
API bind address alone does not expose this listener. The `api.tls` and
`api.auth` settings define shared defaults. A provider can override either
policy under its own `plugins.api.<name>.config` block.
Provider-specific TLS settings take precedence over the shared TLS defaults.
Shared API authentication is disabled by default. The built-in Blockfrost
mutation policy is separate: its mutation admission limits apply only to those
Blockfrost mutation routes, not to every route on the listener.
When token authentication is enabled for a provider, send
`Authorization: Bearer <token>`. UTxO RPC's HTTP and Connect/gRPC routes use
the bearer token as well.

Authentication applies to every route on that listener, including health
checks. Configure a probe to send the token or use a TCP check when the probe
cannot attach credentials. Dingo rejects incomplete TLS certificate/key pairs
at startup and does not log token or key contents.

You can also put API listeners behind a reverse proxy or API gateway. Choose
one place to terminate TLS and authenticate requests, and configure Dingo's
listener policy to match that deployment.

## Bark archive traffic

Bark is a Dingo-to-Dingo archive protocol, separate from the application APIs.
An archive node can serve historical blocks from signed-URL-capable object
storage. A history-expiry node can use a Bark archive as a fallback after old
local block files expire; see [Bootstrap and data
maintenance](/guides/dingo/007-bootstrap-and-data-maintenance/).

Bark has no built-in authentication for ordinary archive traffic. Keep it on a
trusted network. Ordinary archive traffic remains separate from the optional
LifecycleService.

### Bark LifecycleService

Bark optionally exposes a remote `LifecycleService` for node lifecycle
operations. The service is disabled by default. Enable it with
`barkLifecycleEnabled: true`, `--bark-lifecycle-enabled`, or
`DINGO_BARK_LIFECYCLE_ENABLED=true`.

Before starting the node, configure these settings as needed:

- Set `barkPort` to a nonzero port with `--bark-port` or
  `DINGO_BARK_PORT`.

LifecycleService accepts `GetStatus`, `Stop`, and `Restart` over plaintext HTTP
without client certificates or operator allowlists. Use network-layer controls
to restrict access when exposing the service beyond a trusted network.
`Restart` is unsupported on non-Unix platforms.

When the service is enabled and `barkHost` is empty, Bark binds to loopback by
default. Set `barkHost`, `--bark-host`, or `DINGO_BARK_HOST` to expose it on a
different interface. Use network-layer controls to restrict access when
exposing it beyond a trusted network.

Bark accepts signed block download URLs only when their normalized HTTPS origin
matches the configured normalized HTTPS origin or an explicitly allowed
download origin.
The normalized origin includes the scheme, lowercased host, and effective port.
Bark checks redirect destinations against the same policy. By default,
`barkBlockDownloadAllowPrivateAddresses` is `false`, so Bark rejects any
block-download destination whose resolved address is private or special-use.
Set `barkBlockDownloadAllowPrivateAddresses` to `true`, use
`--bark-block-download-allow-private-addresses`, or set
`DINGO_BARK_BLOCK_DOWNLOAD_ALLOW_PRIVATE_ADDRESSES=true` to permit
private or special-use resolved addresses for block-download destinations
only. This option does not disable the configured origin allowlist, the
HTTPS-only requirement, or redirect validation. For block-download requests,
Bark does not use ambient HTTP proxy settings or caller-provided dialers. These
rules apply only to block downloads; the separately configured Bark RPC client
continues to handle archive RPC calls.


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
