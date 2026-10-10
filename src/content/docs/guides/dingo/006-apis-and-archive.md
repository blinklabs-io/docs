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

The complete v0.81.0 configuration reference and release-matched
[`dingo.yaml.example`](https://raw.githubusercontent.com/blinklabs-io/dingo/v0.81.0/dingo.yaml.example) are
available on this site. Use configuration files with their matching release;
provider options can change between versions.

## Secure API access

The shared API bind address applies to the selected API providers, including
Kupo. The `api.tls` and `api.auth` settings define shared defaults. A provider
can override either policy under its own `plugins.api.<name>.config` block.
Provider-specific TLS settings take precedence over the shared TLS defaults.
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
Bark checks redirect destinations against the same policy and rejects any
redirect whose resolved address is private or special-use. For block-download
requests, Bark does not use ambient HTTP proxy settings or caller-provided
dialers. These rules apply
only to block downloads; the separately configured Bark RPC client continues to
handle archive RPC calls.


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
