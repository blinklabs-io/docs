---
title: Build a Blockfrost API Client
description: Connect an application or explorer to Dingo's Blockfrost-compatible API.
---

Use Dingo's Blockfrost-compatible REST API when an application already supports
the Blockfrost client model. The API is served by your Dingo node; clients do
not need to send chain data requests to a hosted Blockfrost service.

## Configure Dingo

The Blockfrost provider requires API storage mode. Enable the provider in the
configuration used by your Dingo release:

```yaml
storageMode: api
plugins:
  api:
    blockfrost:
      provider: builtin
      config:
        port: 3000
```

See [Dingo APIs and archive services](/guides/dingo/006-apis-and-archive/) for
listener authentication, TLS, and the current release's complete configuration.
Keep the API listener on a trusted network or put it behind a secured gateway.

## Connect an application

Configure the application's Blockfrost-compatible provider URL to point to the
Dingo listener, for example `http://127.0.0.1:3000` for local development.
Supply a Dingo API token when authentication is enabled. A frontend should use
its server-side proxy to reach Dingo; avoid embedding a reusable API token in
browser code or exposing an unrestricted node listener to the public internet.

Start with the endpoints the application actually needs and check their
availability against the Dingo release you deploy. Compatibility with the
Blockfrost API shape does not imply that every hosted Blockfrost endpoint or
behavior is implemented. Handle missing resources and unsupported routes, and
do not treat an HTTP 404 as proof that the chain has no such data.

If the application needs a Go client library, its API reference is published at
[pkg.go.dev](https://pkg.go.dev/github.com/blinklabs-io/dingo). For the Dingo
node's HTTP API, use the endpoint and configuration documentation above.
