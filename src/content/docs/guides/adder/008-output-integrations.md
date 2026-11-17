---
title: Output Integrations Guide
description: Configure Adder output integrations and understand their delivery behavior.
---

# Output integrations

## Overview

This guide describes the YAML configuration and delivery behavior for Adder's
PostgreSQL, MQTT, RabbitMQ, Google Cloud Pub/Sub, Elasticsearch, Amazon S3,
Amazon SQS, Amazon SNS, and Redis output integrations. The command reference
covers command line flags; this guide explains the corresponding plugin
settings, destination requirements, payload formats, acknowledgements, and
failure behavior.

Each output selects events with `event-types`. Supported values include
`blocks`, `transactions`, `rollbacks`, `governance`, `drep-registration`,
`drep-update`, and `drep-retirement`, although each plugin has its own default
selection. Adder rejects an empty selection and rejects event names that the
selected plugin does not support.

## Dedicated output references

These pages provide the detailed configuration options and delivery contracts
for the following outputs:

- [Discord bot output](./discord.md)
- [Slack output](./slack.md)
- [Matrix output](./matrix.md)
- [ClickHouse output](./clickhouse.md)
- [Kafka output](./kafka.md)
- [NATS output](./nats.md)
- [Signal output](./signal.md)
- [Durable webhook delivery](./webhook-durability.md)

## PostgreSQL

The `postgres` output appends selected events to an existing PostgreSQL
database. Configure the connection URL and event selection under
`plugins.output.postgres`:

```yaml
plugins:
  output:
    postgres:
      database-url: postgres://adder:secret@db.example.org:5432/adder?sslmode=require
      event-types: blocks,transactions,rollbacks,governance
```

| Option | Default | Configuration requirements |
| --- | --- | --- |
| `database-url` | Empty | Provide a valid PostgreSQL connection URL. |
| `event-types` | `blocks,transactions,rollbacks,governance,drep-registration,drep-update,drep-retirement` | Provide at least one supported event type. |

At startup, Adder creates the `adder_events` table and its time index. The
database account therefore needs suitable DDL privileges, as well as `INSERT`
permission on the table and permission to use its identity sequence. When the
URL uses password credentials over TCP, require TLS in the URL. For server
identity verification, configure `sslmode=verify-full` and a suitable root
certificate.

Adder stores each selected event as an append-only JSONB row. The row includes
an arrival identifier, event hash, schema version, event type, event time, and
complete event JSON. Rollback rows remain in the table; consumers apply them
when deriving active chain state. A single output writer provides arrival
order, but concurrent writers do not provide one global chain order.

Adder executes one insert per event with a ten-second statement deadline. The
output reports failed inserts and does not retry or retain them locally. When
the output stops, it cancels the in-flight statement and discards queued
events.

## MQTT

The `mqtt` output publishes complete event JSON through an MQTT 5 broker. Use
`mqtt://` for a broker connection without TLS or `tls://` for a TLS connection:

```yaml
plugins:
  output:
    mqtt:
      broker: tls://mqtt.example.org:8883
      client-id: adder-output
      username: adder
      password: secret
      topic-prefix: adder/events
      qos: 1
      event-types: blocks,rollbacks,governance
```

| Option | Default | Configuration requirements |
| --- | --- | --- |
| `broker` | `mqtt://127.0.0.1:1883` | Use an `mqtt://` or `tls://` broker URL. |
| `client-id` | `adder-output` | Set a nonempty identifier. Give each running Adder instance a distinct identifier because the broker disconnects an existing session when another client uses the same identifier. |
| `username` | Empty | Optional. Use credentials only with a `tls://` broker. |
| `password` | Empty | Optional. Use credentials only with a `tls://` broker. |
| `topic-prefix` | `adder/events` | Use nonempty topic levels and omit the MQTT wildcards `+` and `#`. |
| `qos` | `1` | Use only `0`, `1`, or `2`. |
| `event-types` | `blocks,rollbacks,governance` | Provide at least one supported event type. |

Adder appends the event type as the final topic level, so the default topics
include `adder/events/block`, `adder/events/rollback`, and
`adder/events/governance`. The output does not set MQTT's retained flag.

At QoS 0, publish completion does not include a broker acknowledgement. At
QoS 1, the broker acknowledgement reports `PUBACK`; at QoS 2, it reports
completion of the QoS 2 exchange. None of these acknowledgements confirms that
a subscriber received or processed the event. Adder reconnects before the next
event after a connection loss, reports failed or uncertain publishes, and does
not replay them from durable storage. The output also does not use the client's
optional publish queue.

## RabbitMQ

The `rabbitmq` output publishes selected event JSON through an existing AMQP
topology:

```yaml
plugins:
  output:
    rabbitmq:
      url: amqps://adder:secret@rabbitmq.example.org:5671/
      exchange: adder.events
      routing-key: blocks
      persistent: true
      event-types: blocks,rollbacks,governance
```

| Option | Default | Configuration requirements |
| --- | --- | --- |
| `url` | `amqp://127.0.0.1:5672/` | Provide a valid broker URL. Use `amqps://` outside a trusted network. |
| `exchange` | Empty | Use an existing exchange. An empty value selects RabbitMQ's default exchange. |
| `routing-key` | `adder.events` | Provide a nonempty routing key. With the default exchange, use the destination queue name. |
| `persistent` | `true` | Persistence requires a durable destination and suitable broker configuration. |
| `event-types` | `blocks,rollbacks,governance` | Provide at least one supported event type. |

Adder does not create exchanges, queues, or bindings. Create a destination
queue before startup. With the default exchange, RabbitMQ routes the message
to the queue whose name matches `routing-key`; with a named exchange, create
the exchange and its bindings before startup.

The publisher enables publisher confirms and mandatory routing. RabbitMQ can
acknowledge a publish even when mandatory routing reports that no queue could
receive it, so Adder reports an unroutable message as a failure. A broker
confirmation means that the broker accepted the message; it does not mean that
a consumer processed it. Adder reports negative confirmations, closed
connections, and ten-second confirmation timeouts. The next event reconnects
after a connection failure.

Persistent messages require a durable destination; `persistent` does not turn
Adder into a durable queue. Adder does not automatically republish ambiguous
failures because republishing can duplicate delivery, and pending events can
be lost when the process restarts.

## Google Cloud Pub/Sub

The `pubsub` output publishes events to one existing Google Cloud Pub/Sub
topic. Adder uses Application Default Credentials:

```yaml
plugins:
  output:
    pubsub:
      project-id: my-project
      topic-id: adder-events
      event-types: blocks,rollbacks,governance
```

| Option | Default | Configuration requirements |
| --- | --- | --- |
| `project-id` | Empty | Provide a Google Cloud project ID or project number accepted by Pub/Sub. |
| `topic-id` | Empty | Provide a valid existing topic ID. |
| `event-types` | `blocks,rollbacks,governance` | Provide at least one supported event type. |

Grant the configured identity permission to publish to the topic. Adder sends
the complete event JSON as the message data and sets the `event_type` message
attribute. Rollbacks remain separate records; consumers decide how those
records affect earlier events.

Adder waits for each publish result before accepting the next event. A result
means that Pub/Sub accepted or rejected the message, not that a subscriber
received or processed it. Adder sends events sequentially without intentional
batching, uses a ten-second request deadline, and reports failures without
local durable replay. Pub/Sub limits the message data and publish request to
10 MB; Adder rejects data over the data limit, and request overhead can cause
the service to reject a message near the limit.

During shutdown, Adder stops accepting events and waits up to ten seconds for
the outstanding publish attempt before closing the client. Pub/Sub can still
complete that publication after Adder stops waiting for its result.

## Elasticsearch

The `elasticsearch` output indexes selected events in a versioned index:

```yaml
plugins:
  output:
    elasticsearch:
      url: https://elastic.example.org:9200
      index: adder-events-v1
      api-key: BASE64_ENCODED_API_KEY
      event-types: blocks,transactions,rollbacks,governance
```

| Option | Default | Configuration requirements |
| --- | --- | --- |
| `url` | `http://127.0.0.1:9200` | Provide the Elasticsearch origin URL. |
| `index` | `adder-events-v1` | Use a versioned index name. |
| `api-key` | Empty | Optional. Use an API key only with an HTTPS URL. |
| `event-types` | `blocks,transactions,rollbacks,governance,drep-registration,drep-update,drep-retirement` | Provide at least one supported event type. |

At startup, Adder creates the configured index with a strict mapping for
`schema_version`, `event_type`, and `event_time`. Adder stores the complete
event JSON in `event` without indexing arbitrary payload fields. The
Elasticsearch identity needs permission to create the index and index
documents. An incompatible existing mapping requires a new index name with a
`-vN` suffix; Adder does not migrate an existing index.

Adder derives each document ID from the SHA-256 digest of the complete event
JSON. Repeating identical JSON overwrites the same document, while a changed
timestamp or payload produces a different document. Rollbacks create separate
`input.rollback` documents; consumers apply them when deriving active chain
state. Elasticsearch results do not provide insertion order, so this output
does not support ordered chain replay by itself.

Adder waits for each document response and does not use a batch buffer or flush
timer. Each request has a ten-second deadline. Adder retries transport errors
and HTTP `429`, `502`, `503`, and `504` responses for up to four attempts with
short backoff. The deterministic document ID makes a retry safe from extra
copies, but a timeout can still leave the result uncertain. Adder reports
failures and discards queued events when the output stops.

## Amazon S3

The `s3` output archives each selected event as a separate S3 object. Configure
an existing bucket and use the normal AWS credential chain:

```yaml
plugins:
  output:
    s3:
      region: us-east-1
      bucket: adder-archive
      prefix: adder/events
      event-types: blocks,transactions,rollbacks,governance
```

| Option | Default | Configuration requirements |
| --- | --- | --- |
| `region` | Empty | Configure the AWS region used for the bucket. |
| `bucket` | Empty | Identify an existing bucket and grant `s3:PutObject` for the selected prefix. |
| `prefix` | `adder/events` | Use the relative prefix for object keys. |
| `event-types` | `blocks,transactions,rollbacks,governance,drep-registration,drep-update,drep-retirement` | Provide at least one supported event type. |

Adder obtains AWS credentials through the normal AWS credential chain. Each
object contains one UTF-8 JSON event, uses `Content-Type: application/json`,
and includes an S3 SHA-256 checksum. Adder uses this key format:

```text
<prefix>/YYYY/MM/DD/<UTC timestamp>-<SHA-256 of JSON>.json
```

The JSON contains `timestamp`, `context`, `payload`, and `type`. The date uses
the event timestamp in UTC. Replaying the same event writes the same bytes to
the same key; events with the same timestamp can still produce different keys.
Rollback records remain in the archive, and consumers apply them when deriving
chain state. Adder does not delete or rewrite earlier objects.

Adder waits for each `PutObject` response and does not use a batch buffer or
background flush. The AWS SDK retries retryable errors within a
thirty-second request limit. Adder reports failures, does not retain failed
events for replay, and cancels an in-flight upload when it stops. A timeout can
leave the upload result uncertain, and queued events do not survive shutdown.

## Amazon SQS and SNS

The `sqs` and `sns` outputs use the normal AWS credential chain. Supply
credentials through an IAM role, profile, or environment; Adder does not store
access keys in this configuration.

### SQS

```yaml
plugins:
  output:
    sqs:
      region: us-east-1
      queue-url: https://sqs.us-east-1.amazonaws.com/123456789012/adder.fifo
      group-id: chain
      event-types: blocks,rollbacks,governance
```

| Option | Default | Configuration requirements |
| --- | --- | --- |
| `region` | Empty | Configure the AWS region for the queue. |
| `queue-url` | Empty | Provide the destination queue URL. |
| `group-id` | Empty | Required for FIFO queues. Standard queues can omit it; setting it on a standard SQS queue enables fair queues. |
| `event-types` | `blocks,rollbacks,governance` | Provide at least one supported event type. |

### SNS

```yaml
plugins:
  output:
    sns:
      region: us-east-1
      topic-arn: arn:aws:sns:us-east-1:123456789012:adder.fifo
      group-id: chain
      max-message-bytes: 262144
      event-types: blocks,rollbacks,governance
```

| Option | Default | Configuration requirements |
| --- | --- | --- |
| `region` | Empty | Configure the AWS region for the topic. |
| `topic-arn` | Empty | Provide the destination topic ARN. |
| `group-id` | Empty | Required for FIFO topics. Standard SNS topics do not gain FIFO ordering or deduplication from this setting. |
| `max-message-bytes` | `262144` | Match the configured SNS topic message limit. The topic can use a limit up to 1 MiB. |
| `event-types` | `blocks,rollbacks,governance` | Provide at least one supported event type. |

Adder sends one event per API call. SQS receives the complete event JSON as
`MessageBody`; SNS receives it as `Message`. Adder validates message size
before sending. SQS limits messages to 1 MiB. SNS defaults to 256 KiB and can
use a configured limit up to 1 MiB, although the destination can enforce a
smaller limit.

FIFO destinations require `group-id`. Adder supplies a SHA-256 digest of the
complete event JSON as the message deduplication ID. Identical JSON can
deduplicate within the service's deduplication window; an event with a new
timestamp produces a different digest. Standard destinations can omit
`group-id`.

The AWS SDK performs its normal transient retries within a ten-second request
deadline. An API success means that SQS accepted the message or SNS accepted
the publication for fanout. It does not confirm consumer receipt or
processing. Adder reports failed requests, does not keep a durable local queue,
and does not replay failed events.

## Redis Streams

The `redis` output appends selected events to a Redis Stream with `XADD`:

```yaml
plugins:
  output:
    redis:
      address: 127.0.0.1:6379
      username: adder
      password: secret
      tls: true
      stream: adder.events
      event-types: blocks,rollbacks,governance
```

| Option | Default | Configuration requirements |
| --- | --- | --- |
| `address` | `127.0.0.1:6379` | Use `host:port` syntax. |
| `username` | Empty | Optional Redis ACL username. Credentials require `tls: true`. |
| `password` | Empty | Optional password. Credentials require `tls: true`. |
| `tls` | `false` | Enable TLS before setting `username` or `password`. |
| `stream` | `adder.events` | Provide a nonempty Stream key. |
| `event-types` | `blocks,rollbacks,governance` | Provide at least one supported event type. |

The output pings Redis at startup. Redis Open Source 5.0 or later provides
`XADD`; Redis 6.0 or later supports the optional ACL username. Each selected
event creates one Stream entry. Redis generates the entry ID, while Adder
stores the event type in `type` and the complete event JSON in `event`.

A successful Redis reply confirms that Redis accepted the append; it does not
confirm disk persistence or consumer processing. Each append has a five-second
deadline. The client does not retry commands, and Adder reports failures
without replay. A connection failure before Redis receives the command means
that Redis did not store the event; a lost reply leaves the result uncertain,
so Adder avoids repeating `XADD` and creating a possible duplicate. Later
events can reconnect through the client connection pool, but pending events do
not survive shutdown or restart. Stream size and retention remain the
operator's responsibility.

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
