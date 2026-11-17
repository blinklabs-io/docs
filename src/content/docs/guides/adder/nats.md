---
title: NATS Output Reference
description: Configure Adder to publish selected events to Core NATS subjects.
---

# NATS output

This guide describes the `nats` output, its Core NATS subjects, and its delivery behavior.

## Configuration

Configure the output in the Adder YAML file:

```yaml
output: nats
plugins:
  output:
    nats:
      servers: "nats://127.0.0.1:4222"
      token: "<secret-managed-token>"
      subject-prefix: "adder.events"
      event-types: "blocks,rollbacks,governance"
```

Replace the token placeholder with an authentication token when the NATS deployment requires one. Store the token in a secret-managed configuration source and use a `tls://` server URL so the credential travels over TLS.

### Configuration fields

| Field | Default | Description |
| --- | --- | --- |
| `servers` | `nats://127.0.0.1:4222` | Comma-separated NATS server URLs. Adder requires at least one URL. |
| `token` | `""` | Optional NATS authentication token. |
| `subject-prefix` | `adder.events` | Prefix for the subjects that carry Adder events. |
| `event-types` | `blocks,rollbacks,governance` | Comma-separated event names to publish. Adder requires at least one supported name. |

## Server URL validation

Adder trims each comma-separated server entry and accepts only URLs that meet all of these requirements:

- The scheme is `nats://` or `tls://`.
- The URL contains a host name.
- The URL contains no credentials, query string, or fragment.
- The path is empty or `/`.
- An explicit port is between `1` and `65535`.

Adder rejects an empty `servers` value and stops startup when any server entry fails validation.

The output does not derive TLS credentials from the token or accept credentials embedded in a server URL.

## Subject and event mapping

The output publishes each selected event to `<subject-prefix>.<event-type>`. Adder removes the `input.` prefix from the event type before it builds the subject.

With the default prefix, the default event selection produces these subjects:

| Event name | Subject |
| --- | --- |
| `blocks` | `adder.events.block` |
| `rollbacks` | `adder.events.rollback` |
| `governance` | `adder.events.governance` |

The output also supports these event names:

- `transactions`, which publishes to `<subject-prefix>.transaction`.
- `drep-registration`, which publishes to `<subject-prefix>.drep-registration`.
- `drep-update`, which publishes to `<subject-prefix>.drep-update`.
- `drep-retirement`, which publishes to `<subject-prefix>.drep-retirement`.

Adder serializes the complete event as JSON in each message. The output does not reduce the event to a summary or select individual fields.

### Subject prefix validation

The `subject-prefix` value must contain one or more nonempty NATS subject levels. Adder rejects a prefix that:

- Is empty or contains whitespace.
- Contains `/`, `*`, or `>`.
- Starts or ends with `.`.
- Contains `..` or any other empty subject level.

For example, `adder.events` passes validation, while `.adder.events`, `adder..events`, and `adder.events.>` fail validation. Use the wildcard only in subscriber subjects, such as `adder.events.>`; never place it in the output prefix.

## Delivery behavior

Adder uses Core NATS publishing semantics:

1. The output ignores events outside the configured `event-types` selection.
2. For each selected event, Adder publishes the JSON message to the mapped subject.
3. After each successful publish, Adder flushes the connection and waits up to five seconds for the server response.

A successful flush confirms that the NATS server processed the publish command. It does not confirm that a subscriber received or processed the message. Core NATS does not provide JetStream persistence through this output.

The output does not buffer events while it is offline. Adder reports a publish failure for an event that cannot reach the server, reconnects for later events when possible, and does not accumulate that event for later delivery. The output provides at-most-once behavior: it does not retry an ambiguous flush failure because a retry could publish a duplicate message.

The output reports publish failures, flush timeouts, and asynchronous NATS errors through the plugin error channel and the Adder logger. During shutdown, Adder closes the connection and waits for pending asynchronous callbacks. Adder does not recover pending in-memory events after a restart.

## Live check

Use a Core NATS server and a NATS CLI subscription to verify a running deployment:

1. Configure `subject-prefix: "adder.events"` and select `blocks` in `event-types`.
2. Subscribe to every event subject:

   ```shell
   nats sub 'adder.events.>'
   ```

3. Start Adder and allow it to observe a new block.
4. Confirm that the subscription receives a message on `adder.events.block` and that the message contains the complete event JSON.
5. Disconnect the NATS server and confirm that Adder reports the failed publish or asynchronous broker error instead of queueing the event.

The receipt shown by the subscription demonstrates broker delivery to that subscriber at that moment. It does not establish persistence, replay, or successful processing by any subscriber application.

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>