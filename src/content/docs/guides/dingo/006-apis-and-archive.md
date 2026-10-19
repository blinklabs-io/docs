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
        authToken: "<token>"
        maxConcurrentMutations: 4
        maxConcurrentMutationsPerClient: 1
    utxorpc:
      provider: builtin
      config:
        port: 9090
```

### Blockfrost mutation requests

The built-in Blockfrost provider listens on `127.0.0.1` by default. It does
not inherit the root `bindAddr`; set `plugins.api.blockfrost.config.host` to
expose it on another interface. Changing this host makes an explicit exposure
decision.

Set `plugins.api.blockfrost.config.authToken` to a secret before sending
mutation requests. An empty `authToken` keeps every mutation route closed.
The provider uses `4` for `maxConcurrentMutations` and `1` for
`maxConcurrentMutationsPerClient` by default. Set both values to positive
integers, and keep `maxConcurrentMutationsPerClient` no greater than
`maxConcurrentMutations`.

The following routes require the configured mutation token:

| Route | Authentication and admission behavior |
| --- | --- |
| `POST /api/v0/tx/submit` | Requires a valid mutation token and consumes mutation admission capacity. |
| `POST /api/v0/utils/txs/evaluate` | Requires a valid mutation token and consumes mutation admission capacity. |
| `POST /api/v0/utils/txs/evaluate/utxos` | Requires a valid mutation token and consumes mutation admission capacity. |

Send the token in any one of these forms: `project_id: <token>`,
`X-Blockfrost-Project-Id: <token>`, or `Authorization: Bearer <token>`. A
missing or invalid token returns HTTP `401` with
`WWW-Authenticate: Bearer`. After authentication, Dingo accepts a request
only when the server-wide and remote-client limits have capacity. It checks
capacity before it reads the request body; an over-capacity request returns
HTTP `429` with `Retry-After: 1`.

Before exposing authenticated mutations on a non-loopback host, configure
server TLS through `plugins.api.blockfrost.config.tls`. Without server TLS,
Dingo rejects startup for a non-loopback host with authenticated mutation
access. Keep the default loopback host unless external mutation access is an
intentional deployment decision.

The complete v0.83.1 configuration reference and release-matched
[`dingo.yaml.example`](https://raw.githubusercontent.com/blinklabs-io/dingo/v0.83.1/dingo.yaml.example) are
available on this site. Use configuration files with their matching release;
provider options can change between versions.

## Secure API access

The shared API bind address applies to the selected API providers, including
Kupo. The `api.tls` and `api.auth` settings define shared defaults. A provider
can override either policy under its own `plugins.api.<name>.config` block.
Provider-specific TLS settings take precedence over the shared TLS defaults.
Shared API authentication is disabled by default. The built-in Blockfrost
mutation policy is separate: its mutation routes require the provider's
`authToken`, even when shared API authentication remains disabled. The
mutation admission limits apply only to those Blockfrost mutation routes, not
to every route on the listener.
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

## Bark archive traffic

Bark is a Dingo-to-Dingo archive protocol, separate from the application APIs.
An archive node can serve historical blocks from signed-URL-capable object
storage. A history-expiry node can use a Bark archive as a fallback after old
local block files expire; see [Bootstrap and data
maintenance](/guides/dingo/007-bootstrap-and-data-maintenance/).

Bark has no built-in authentication for ordinary archive traffic. Keep it on a
trusted network. Ordinary archive traffic remains separate from the optional
LifecycleService, whose RPCs require mutual TLS.

### Bark LifecycleService

Bark optionally exposes a remote `LifecycleService` for node lifecycle
operations. The service is disabled by default. Enable it with
`barkLifecycleEnabled: true`, `--bark-lifecycle-enabled`, or
`DINGO_BARK_LIFECYCLE_ENABLED=true`.

Before starting the node, configure these settings:

- Set `barkPort` to a nonzero port with `--bark-port` or
  `DINGO_BARK_PORT`.
- Set `barkClientCaFilePath` to the PEM CA bundle that verifies client
  certificates with `--bark-client-ca-file-path` or
  `DINGO_BARK_CLIENT_CA_FILE_PATH`.
- Set both `tlsCertFilePath` and `tlsKeyFilePath` for the Bark server
  certificate and private key. Use `--tls-cert-file-path` and
  `--tls-key-file-path`, or the environment variables `TLS_CERT_FILE_PATH`
  and `TLS_KEY_FILE_PATH`.
- Add one or more SHA-256 client certificate fingerprints to
  `barkLifecycleOperatorCertificateFingerprints` with
  `--bark-lifecycle-operator-certificate-fingerprints` or
  `DINGO_BARK_LIFECYCLE_OPERATOR_CERTIFICATE_FINGERPRINTS`. This allowlist is
  separate from the DatabaseService operator allowlist.

The configured CA must verify the client certificate for every LifecycleService
RPC. `GetStatus` is read-only and needs only this verified certificate. `Stop`
and `Restart` are destructive: `Stop` requests a graceful stop, while
`Restart` requests a graceful stop followed by a restart. Both require a
certificate fingerprint from `barkLifecycleOperatorCertificateFingerprints`.
`Restart` is unsupported on non-Unix platforms.

When the service is enabled and `barkHost` is empty, Bark binds to loopback by
default. Set `barkHost`, `--bark-host`, or `DINGO_BARK_HOST` to expose it on a
different interface. A wider bind address does not replace client certificate
verification or the lifecycle operator allowlist.

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
