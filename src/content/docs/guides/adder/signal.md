---
title: Signal Output Reference
description: Configure Adder to send selected events through a signal-cli JSON-RPC daemon.
---

# Signal output

The `signal` output sends selected Adder events through a separately managed
[`signal-cli` HTTP JSON-RPC daemon](https://github.com/AsamK/signal-cli/blob/master/man/signal-cli-jsonrpc.5.adoc).
This page covers configuration, endpoint validation, supported events, and the
delivery behavior that operators must account for.

## Prerequisites

- Run a maintained `signal-cli` daemon with a linked or registered Signal account.
- Provide at least one Signal recipient number or service ID.
- Configure the daemon's JSON-RPC endpoint and ensure that Adder can reach it.

Signal does not provide an official bot API. A local daemon can run on loopback,
for example:

```shell
signal-cli -a SIGNAL_ACCOUNT daemon --http=127.0.0.1:8081
```

## Configuration

Select the output with `output: signal` and configure its options under
`plugins.output.signal`:

```yaml
output: signal

plugins:
  output:
    signal:
      endpoint: "http://127.0.0.1:8081/api/v1/rpc"
      recipients: "SIGNAL_RECIPIENT_1,SIGNAL_RECIPIENT_2"
      account: "SIGNAL_ACCOUNT"
      event-types: "blocks,rollbacks,governance"
```

Replace the placeholder values with values from the Signal installation. The
configuration fields have these requirements and defaults:

| Field | Required | Default | Description |
| --- | --- | --- | --- |
| `endpoint` | No | `http://127.0.0.1:8081/api/v1/rpc` | The `signal-cli` daemon's HTTP JSON-RPC endpoint. |
| `recipients` | Yes | None | A comma-separated list of recipient numbers or service IDs. Adder trims surrounding whitespace and ignores empty entries. |
| `account` | No | Empty | The Signal account to use when the daemon manages multiple accounts. |
| `event-types` | No | `blocks,rollbacks,governance` | A comma-separated list of event names to send. |

Adder requires `recipients` to contain at least one value. If the configuration
sets `event-types`, it must name at least one supported event. Adder matches
event names without regard to letter case.

## Endpoint validation

The endpoint must use the exact `/api/v1/rpc` path. Adder rejects endpoints that
contain credentials, a query string, or a fragment.

- Use plain `http` only for `localhost`, `127.0.0.1`, or `::1`.
- Use `https` for a daemon on any remote host.
- Do not add a trailing path, query parameters, or fragment to the endpoint.

Adder does not follow HTTP redirects. A redirect therefore produces an output
error instead of sending the event to a different URL.

## Supported event types

The `event-types` option accepts these names:

- `blocks`
- `transactions`
- `rollbacks`
- `governance`
- `drep-registration`
- `drep-update`
- `drep-retirement`

Adder sends the event JSON as the Signal message. Adder sends only the selected
event types and ignores other events.

## Delivery contract

For each selected event, Adder sends a JSON-RPC `send` request to the configured
daemon. The request includes the configured recipients, the event JSON as the
message, and the configured account when `account` is not empty.

Adder accepts a response only when all of these checks succeed:

1. The HTTP status is `200`.
2. The response uses JSON-RPC version `2.0`.
3. The response ID matches the request ID.
4. The successful result contains a non-zero `timestamp`.
5. Every per-recipient result reports `SUCCESS`.

If a recipient result reports another type, Adder reports the result type as an
error for that event. Adder sends delivery errors to the output error channel.
Error reporting does not log the Signal message body or recipient addresses.

A successful JSON-RPC result means that `signal-cli` accepted the send request;
it does not confirm that a recipient received or read the message. Adder does
not automatically retry failed requests. In particular, an ambiguous timeout
can occur after the daemon accepts a message, so retrying could create a
duplicate. Adder also does not retain pending events across restarts.

## Live check

Use a separate Signal account and recipient for a live check. Do not use a
production account or real credentials in a test configuration.

1. Start a test `signal-cli` daemon and record its local or remote JSON-RPC endpoint.
2. Configure `output: signal` with the test endpoint, test recipient, optional test account, and a selected event type.
3. Start Adder and trigger one test event that matches the configured event type.
4. Confirm that the daemon accepts the JSON-RPC request and that Adder reports no output error.
5. Confirm that the separate test recipient receives the event message.

Use the observed receipt to validate the test account, recipient, and event
selection in the test environment.

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>