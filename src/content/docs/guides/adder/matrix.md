---
title: Matrix Output Reference
description: Configure Adder to send selected events as Matrix room messages.
---

# Matrix output

The `matrix` output sends selected Adder events to one or more Matrix rooms as
plain text `m.room.message` events. This guide covers configuration,
authentication, room validation, Matrix Client Server API delivery, retry
behavior, and operational limits.

## Prerequisites

- Use a Matrix account with an access token.
- Join the account to every destination room.
- Grant the account permission to send messages in every destination room.
- Prepare a dedicated test room for the live check in this guide.

## Configuration

Select the output with `output: matrix` and configure its options under
`plugins.output.matrix`:

```yaml
output: matrix

plugins:
  output:
    matrix:
      homeserver-url: "https://matrix.example.org"
      access-token: "<secret-managed-access-token>"
      room-ids: "!alerts:example.org,!operations:example.org"
      event-types: "blocks,rollbacks,governance"
```

Store `access-token` in a secret-managed configuration source. The token must
belong to an account that has joined each configured room and can send messages
there. Adder sends the token as a bearer credential and does not expose it in
the message body.

### Configuration fields

| Field | Required | Default | Description |
| --- | --- | --- | --- |
| `homeserver-url` | Yes | None | Matrix homeserver base URL. Use HTTPS, or use HTTP only with `localhost`, `127.0.0.1`, or `::1` for loopback testing. |
| `access-token` | Yes | None | Access token for the Matrix account that sends the messages. |
| `room-ids` | Yes | None | Comma separated Matrix room IDs. Provide at least one ID beginning with `!`. |
| `event-types` | No | `blocks,rollbacks,governance` | Comma separated event names to send. |

## URL and room validation

Adder validates the configuration before it starts the output:

- `homeserver-url` must be a valid HTTP URL without credentials, a query, or a
  fragment.
- `homeserver-url` must use HTTPS for a remote homeserver. HTTP is allowed only
  for loopback testing with `localhost`, `127.0.0.1`, or `::1`.
- `access-token` must not be empty.
- `room-ids` must contain at least one room ID.
- Each room ID must begin with `!` and must not contain spaces, tabs, carriage
  returns, or newlines.
- Matrix room version 12 IDs can omit the legacy `:server` suffix.

Validation accepts comma separated room IDs after Adder trims each entry. A
room ID that fails validation prevents the output from starting.

## Event selection

The default selection sends these event types:

- `blocks`
- `rollbacks`
- `governance`

The `event-types` option also accepts:

- `transactions`
- `drep-registration`
- `drep-update`
- `drep-retirement`

Adder ignores events outside the configured selection. The option must name at
least one supported event type when it is present.

## Matrix delivery contract

For each selected event, Adder sends one request to every configured room. The
output uses the Matrix Client Server API room send endpoint:

```http
PUT /_matrix/client/v3/rooms/{room}/send/m.room.message/{txnId}
Authorization: Bearer <access-token>
Content-Type: application/json
```

The JSON body contains a plain text message:

```json
{
  "msgtype": "m.text",
  "body": "Adder <event-type>\n<event-json>"
}
```

`<event-type>` identifies the selected event, and `<event-json>` contains the
complete Adder event JSON. Adder creates a transaction ID for each room and
event. It reuses that same transaction ID for every retry of that room and
event, while sends to different rooms use different transaction IDs.

A successful room send means the homeserver accepted the request and returned
the event successfully. It does not confirm that a user received or read the
message.

## Retry and rate limit behavior

Adder makes an initial request and retries a failed delivery up to three times.
The output retries these conditions:

- Network or HTTP request errors.
- HTTP `408` request timeout responses.
- HTTP `5xx` server errors.
- HTTP `429` rate limit responses.

The output uses exponential backoff between retries. For HTTP `429`, Adder
uses a valid `Retry-After` value when the homeserver provides one. It accepts a
decimal delay in seconds or an HTTP date. Adder also accepts the legacy
`retry_after_ms` response field when the header is absent. A rate limit delay
cannot exceed one minute. If no usable rate limit hint exists, Adder uses its
bounded backoff instead.

Other HTTP `4xx` responses are permanent delivery failures and are not retried.
After the retry limit, Adder reports the delivery failure in the `output.matrix`
logs and sends it through the output error channel.

## Shutdown and restart behavior

Shutdown cancels in flight Matrix requests and any retry backoff waits. Adder
does not maintain a persistent queue for Matrix messages. Events that remain in
flight when Adder stops can be lost, and Adder does not replay them after a
restart.

## Live check

Use a dedicated Matrix account and test room. Do not place a production access
token in a test configuration.

1. Join the test account to the room and grant it permission to send messages.
2. Configure `output: matrix` with the test homeserver, access token, room ID,
   and one event type.
3. Start Adder and trigger an event that matches the selected type.
4. Confirm that the test room receives an `m.room.message` containing the event
   type and event JSON.
5. Confirm that Adder reports no output error.
6. If delivery fails, check the `output.matrix` logs and verify the token,
   room membership, send permission, and homeserver URL.

## Related references

- [Command reference](./006-command_list.md) for the Matrix output CLI options.
- [Output integration overview](./002-operating-mode-overview.md) for Adder's
  CLI event pipeline and output integrations.

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>