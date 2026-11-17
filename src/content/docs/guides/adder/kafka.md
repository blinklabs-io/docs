---
title: Kafka Output Reference
description: Configure and operate Adder's Kafka output.
---

# Kafka output

The `kafka` output publishes selected Adder events as JSON records to one Kafka topic. Create the topic before Adder starts.

See the [command reference](./006-command_list.md) for Kafka CLI flags and the [output integration overview](./output.md) for shared output configuration.

## Configuration

Configure the output in YAML:

```yaml
output: kafka
plugins:
  output:
    kafka:
      brokers: "127.0.0.1:9092"
      topic: "adder.events"
      event-types: "blocks,rollbacks,governance"
```

Configure these parameters under `plugins.output.kafka`:

| Parameter | Description |
| --- | --- |
| `brokers` | Comma-separated Kafka bootstrap addresses. The default is `127.0.0.1:9092`. Each address must use valid `host:port` syntax, and Adder requires at least one address. |
| `topic` | Kafka topic name. The default is `adder.events`. Use 1 to 249 ASCII letters, digits, dots, underscores, or hyphens, and do not use a dot-only name. |
| `username` | Optional SASL PLAIN username. Set it together with `password`; Adder rejects a username without a password. |
| `password` | Optional SASL PLAIN password. Set it together with `username`; Adder rejects a password without a username. |
| `tls` | Enables TLS for broker connections. The default is `false`. Set it to `true` when using SASL PLAIN credentials; Adder rejects SASL PLAIN credentials without TLS. |
| `event-types` | Comma-separated event type names. The default is `blocks,rollbacks,governance`. |

Adder accepts these event type names:

- `blocks`
- `transactions`
- `rollbacks`
- `governance`
- `drep-registration`
- `drep-update`
- `drep-retirement`

Adder rejects an unknown event type or an empty `event-types` value. Store SASL credentials through secret-managed configuration.

## Startup and delivery behavior

Before Adder starts the Kafka output, it checks connectivity by pinging a configured broker. If the check fails, Adder does not start the output.

For every selected event, Adder sends one record with these properties:

- The record value contains the complete event as JSON.
- The record key is always `adder.events`.
- Kafka receives the record with `acks=all`, so the producer waits for acknowledgement from all in-sync replicas.
- Adder waits for the result of each selected record before it reads the next selected event.
- Each delivery has a ten-second deadline.
- The Kafka client uses idempotence internally.

When Kafka rejects a record or Adder cannot determine whether Kafka accepted it, Adder reports the failure through the plugin error channel. Adder does not resend an uncertain record at the application level because Kafka may have accepted it before the response failed. A successful acknowledgement confirms the broker's configured replication policy, not consumer processing.

## Ordering

The fixed key sends records from one Adder process to one partition while the topic partition count remains unchanged. Adder preserves the sequence of selected event types under that condition. Do not increase the topic's partition count when the process depends on this ordering. Multiple Adder processes do not share one total order.

## Shutdown and restart

Shutdown cancels in-flight produce operations. Adder does not recover buffered records after shutdown or restart.

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
