---
title: Adder API Reference
description: Route, request, and response reference for the Adder API.
---

# Adder API reference

## Overview

This reference describes the Adder HTTP API, including the root health and event routes, the `/v1` push and QR routes, and the Swagger UI. The API listens on `0.0.0.0:8080` by default.

Adder separates routes into two path levels:

- Root routes provide health checks and event streaming: `/ping`, `/healthcheck`, and `/events`.
- The `/v1` group provides push notification and QR setup routes: `/v1/fcm`, `/v1/fcm/{token}`, and `/v1/qrcode`.

**Important:** Use `/v1/fcm` for the token creation route. `/fcm` without the `/v1` prefix is not the documented route.

## Route reference

| Method | Path | Purpose | Response and status |
| --- | --- | --- | --- |
| `GET` | `/ping` | Verify that the API server is reachable. | Returns plain text `pong` with `200 OK`. |
| `GET` | `/healthcheck` | Report the health of the running pipeline and registered health checkers. | Returns JSON with `200 OK` when all checkers run successfully. Returns JSON with `503 Service Unavailable` when a registered checker is unhealthy. |
| `GET` | `/events` | Stream pipeline events in real time. | Upgrades to a WebSocket when requested by the client or falls back to Server-Sent Events (SSE). A successful connection uses `200 OK`. |
| `POST` | `/v1/fcm` | Store an FCM token. | Accepts a JSON request and returns `201 Created`. Invalid JSON or a missing `fcmToken` returns `400 Bad Request`. A token store failure returns `500 Internal Server Error`. |
| `GET` | `/v1/fcm/{token}` | Retrieve a stored FCM token by value. | Returns a JSON token response with `200 OK`. An unknown token returns `404 Not Found`. A token store failure returns `500 Internal Server Error`. |
| `DELETE` | `/v1/fcm/{token}` | Delete a stored FCM token by value. | Returns `204 No Content` after deletion. An unknown token returns `404 Not Found`. A token store failure returns `500 Internal Server Error`. |
| `GET` | `/v1/qrcode` | Generate the QR setup page for the local API FCM endpoint. | Returns an interactive HTML page with `200 OK`. |
| `GET` | `/swagger/` | Open the Swagger UI. | Serves the interactive API documentation. Use the trailing slash shown in the path. |

## Integration details

### Store an FCM token

Send a `POST` request to `/v1/fcm` with `application/json` and a required `fcmToken` property:

```json
{"fcmToken":"example-device-token"}
```

The API returns `201 Created` after it stores the token. The API returns `400 Bad Request` when the JSON cannot be decoded or when `fcmToken` is empty.

### Read or delete an FCM token

Replace `{token}` in `/v1/fcm/{token}` with the stored token value:

- `GET` returns the token in a JSON response with `200 OK`.
- `DELETE` removes the token and returns `204 No Content`.
- Both methods return `404 Not Found` when the token does not exist.

### Stream events

Use `GET /events` to open an event stream. The server upgrades the connection to WebSocket when the client requests that protocol; otherwise, it uses SSE. The route accepts these optional query parameters:

- `types`: A comma separated list of event types to include, such as `input.block` or `input.transaction`.
- `replay`: A Boolean value that controls whether the server replays recent events from the ring buffer when the connection opens. The documented default is `true`.

The API describes event responses as `text/event-stream` or `application/json`, depending on the connection mode.

## Path and slash rules

- Keep health and event routes at the root. Do not prepend `/v1` to `/ping`, `/healthcheck`, or `/events`.
- Keep FCM and QR routes under `/v1`. `/fcm` without `/v1` is not the documented token route.
- The root registration accepts `/ping/` and `/healthcheck/` in addition to their documented paths.
- The FCM and QR registrations accept an optional trailing slash as well as the documented paths.
- Use `/swagger/` with its trailing slash. Use `/events` as documented; this reference does not define an `/events/` variant.