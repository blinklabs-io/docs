---
title: ClickHouse Output
description: Configure and operate Adder's ClickHouse output.
---

# ClickHouse output

## Overview

The `clickhouse` output sends selected Adder events to the versioned
`adder_events_v1` table in ClickHouse. Adder sends rows in `JSONEachRow`
batches over the ClickHouse HTTP interface, and ClickHouse receives each
event as a separate row after a successful insert.

## Configuration

Configure the output in the Adder YAML file:

```yaml
output: clickhouse
plugins:
  output:
    clickhouse:
      url: https://clickhouse.example.org:8443
      database: analytics
      username: adder
      password: YOUR_PASSWORD
      event-types: blocks,transactions,rollbacks
```

The output uses these defaults:

| Option | Default | Description |
| --- | --- | --- |
| `url` | `http://127.0.0.1:8123` | ClickHouse HTTP origin. |
| `database` | `default` | ClickHouse database name. |
| `username` | `default` | ClickHouse user. |
| `password` | Empty | Optional ClickHouse password. |
| `event-types` | `blocks,transactions,rollbacks,governance,drep-registration,drep-update,drep-retirement` | Comma-separated event selections. |

The `url` value must use `http` or `https`, include a host, and identify only
an origin. Do not include credentials, a query, a fragment, or a path other
than `/`. The `database` value must be nonempty and cannot contain whitespace,
`/`, or a backslash. The `username` value must be nonempty. When configuration
sets a password,
use `https` for a remote ClickHouse server; plain HTTP with a password works
only for localhost or another loopback address. Protect the configuration and
password with the same access controls used for ClickHouse credentials.

The `event-types` value must name at least one supported selection. If the
configuration omits the value, the output uses the default shown in the table.

## Table and row format

At startup, Adder creates `adder_events_v1` in the configured database when
the table does not already exist. The table uses the ClickHouse `MergeTree`
engine and stores each event as one `JSONEachRow` object with these fields:

| Field | ClickHouse type | Contents |
| --- | --- | --- |
| `schema_version` | `UInt8` | Schema version `1`. |
| `event_hash` | `String` | SHA-256 of the complete event JSON. |
| `event_type` | `LowCardinality(String)` | The Adder event type, such as `input.block` or `input.rollback`. |
| `event_time` | `DateTime64(9, 'UTC')` | The event timestamp in UTC with nanosecond precision. |
| `event_json` | `String` | The complete event JSON. |

ClickHouse partitions the table by event month and orders rows by
`event_time`, `event_type`, and `event_hash`. The `event_hash` supports
comparison; it does not identify a unique row.

## Batching and shutdown

Adder sends a batch when it reaches 100 selected events or when one second
passes, whichever occurs first. Each flush uses one synchronous `INSERT`
request. Adder waits for the HTTP request and ClickHouse query to finish
before it treats the batch as successful.

When Adder stops, it drains events already accepted into the output buffer and
attempts one final flush. The final request has a ten-second deadline. Adder
does not maintain a durable queue, so events in a failed batch do not persist
locally for later delivery.

## Errors and retained events

Adder checks each event timestamp before it adds the event to a batch. A
timestamp outside the supported `DateTime64(9)` range produces an individual
error, while other valid events continue through batching. Adder reports a
failed batch and discards it locally. Adder does not automatically retry an
ambiguous failed insert because repeating the request can create duplicate
rows.

ClickHouse keeps every row that it accepts successfully, including identical
event duplicates. ClickHouse also keeps rollback events as ordinary
`input.rollback` rows; Adder does not delete earlier rows when a rollback
occurs. Query the retained rows
with the event fields, for example:

```sql
SELECT event_type, event_time, event_json
FROM adder_events_v1
ORDER BY event_time;
```

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
