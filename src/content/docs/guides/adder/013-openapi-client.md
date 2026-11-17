---
title: Adder OpenAPI Go Client
description: Use the generated Adder OpenAPI client with the canonical Go module and import path.
---

The generated Go client provides access to the Adder OpenAPI service. Use the `github.com/blinklabs-io/adder/openapi` module path.

## Installation

Before importing the client, install the dependencies specified in the generated client instructions:

```sh
go get github.com/stretchr/testify/assert
go get golang.org/x/net/context
```

Import the client with its canonical path:

```go
import openapi "github.com/blinklabs-io/adder/openapi"
```

Use this module declaration in Go module references:

```go
module github.com/blinklabs-io/adder/openapi
```

## Migrate from the retired module path

In Go imports and `go.mod` module references, replace `github.com/blinklabs-io/cardano-node-api/openapi` with `github.com/blinklabs-io/adder/openapi`:

```diff
-import openapi "github.com/blinklabs-io/cardano-node-api/openapi"
+import openapi "github.com/blinklabs-io/adder/openapi"
```

Rebuild the project after updating the references. Go resolves the client from the Adder module.

## API route reference

The Adder API exposes the following routes:

| Area | Method | Path | Behavior |
| --- | --- | --- | --- |
| Root | `GET` | `/ping` | Returns `pong` as plain text. |
| Root | `GET` | `/healthcheck` | Returns health status as JSON. The server returns `503 Service Unavailable` when a registered health check reports an unhealthy component. |
| Root | `GET` | `/events` | Opens a server-sent events (SSE) stream. The server upgrades requests with WebSocket upgrade headers to WebSocket connections. |
| FCM | `POST` | `/v1/fcm` | Stores an FCM token from a JSON body containing a non-empty `fcmToken` value. |
| FCM | `GET` | `/v1/fcm/{token}` | Returns the stored FCM token. |
| FCM | `DELETE` | `/v1/fcm/{token}` | Deletes the stored FCM token. |
| QR setup | `GET` | `/v1/qrcode` | Returns the HTML page that generates a QR code for connecting to the Adder server. |
| OpenAPI | `GET` | `/swagger/` | Opens the Swagger UI. Include the trailing slash in this URL. |

The FCM and QR routes accept their documented trailing slash variants, such as `/v1/fcm/` and `/v1/qrcode/`. The root `/ping` and `/healthcheck` routes also accept a trailing slash. The `/events` stream preserves SSE and WebSocket behavior during request processing. The server applies read, header, and idle timeouts without a write timeout, so active streams continue without interruption.

An FCM request with malformed JSON or without a non-empty `fcmToken` returns a JSON `400 Bad Request` response. The server records each request in structured access logs. If a handler panics before sending a response, panic recovery logs the failure and returns `500 Internal Server Error`.

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
