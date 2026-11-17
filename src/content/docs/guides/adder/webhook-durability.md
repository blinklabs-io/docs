---
title: Durable Webhook Delivery
description: Configure restart-safe webhook delivery with bounded SQLite persistence in Adder.
---

## Overview

Set `plugins.output.webhook.state-path` to enable durable webhook delivery. Adder stores each formatted request in a persistent SQLite queue before sending it, so pending deliveries survive a restart.

Durable delivery provides at-least-once attempts for events that reach the SQLite queue. It does not provide exactly-once effects, and it does not make the upstream event pipeline and the SQLite append one atomic operation.

## Configuration

Configure the webhook output with a persistent SQLite file and a bounded pending queue:

```yaml
output: webhook
plugins:
  output:
    webhook:
      url: "https://example.org/adder-hook"
      format: "adder"
      state-path: "/var/lib/adder/webhook.sqlite"
      max-pending: 1024
```

`state-path` enables durable mode. Leave it empty to disable durable delivery. `max-pending` sets the maximum number of persisted, unacknowledged deliveries. Durable mode requires a value of at least `11`; Adder uses `1024` by default. Each encoded queue entry must fit within `16 MiB`.

### State path requirements

Provide a plain filename that refers to an on-disk SQLite file. Adder rejects a state path that:

- Uses `:memory:` or a SQLite URI.
- Includes SQLite query parameters, such as `?mode=memory`.
- Contains a parent-directory component such as `..`.
- Names a directory instead of a file.
- Resolves to a symlink for the state file or an existing SQLite sidecar file.

Use one Adder process for each `state-path`. Preserve the state file through restarts. Adder binds a state file to the configured webhook URL and format. A later start rejects a different URL or format for the same state file; use a separate state file for a new destination or format.

## Delivery lifecycle

Adder handles a durable event in this order:

1. Format the event and encode the request.
2. Append the encoded request to SQLite before sending it.
3. Send the pending requests in their original order.
4. Remove an entry only after the receiver returns an HTTP `2xx` response.

When Adder starts, it opens the state file and replays all pending entries in order before startup returns. If replay cannot complete, startup fails and the entries remain in SQLite. During normal operation, Adder also sends each newly appended entry and continues with the queue in order.

Start and Stop coordinate the worker and its shared channels under a mutex. Stop waits for the worker to exit before it closes and clears the event and error channels. If Stop interrupts a retry wait, Adder cancels the wait and stops the delivery run instead of leaving the worker asleep. A shutdown cancellation is not a receiver response and does not acknowledge the entry, so the next start can replay it under the SQLite contract.

An HTTP `2xx` response confirms that the receiver accepted the request according to HTTP semantics. It does not confirm that the receiver completed its own downstream work. Pending entries have no automatic age expiry. An entry remains until the receiver returns `2xx` or an operator removes it explicitly.

## Validation and errors

Adder validates each webhook event before it sends the event. A nil payload, nil or unexpected context, unexpected payload type, or unknown event type produces an error on the plugin error channel, and Adder does not send that event. Webhook formatting and marshaling errors, invalid request setup, and transport errors also surface as errors instead of causing a panic. Adder handles the default HTTP transport safely when it prepares a request.

In non-durable mode, the plugin error channel reports these validation and delivery errors without persisting the event. In durable mode, Adder encounters validation and formatting errors before the SQLite append and does not queue them. Errors that occur after an entry reaches SQLite follow the durable retry and replay behavior described below, so a shutdown or failed delivery does not remove the persisted entry.

## Retries and failures

Adder applies the webhook retry policy to each delivery run: one initial attempt followed by up to three retries for transient failures. A terminal response or an exhausted retry limit stops the pipeline, reports a terminal failure, and leaves the entry in SQLite. Restarting with the same URL and format retries the entry.

If the queue reaches `max-pending`, SQLite cannot persist an event, or the encoded entry exceeds `16 MiB`, Adder fails instead of silently discarding the event. A process crash can still lose an event before Adder appends it to SQLite, including an event held upstream in a pipeline or output channel. Durable mode does not couple the chainsync cursor and the webhook append into one transaction.

## Delivery IDs and duplicate effects

Each persisted delivery carries an `X-Adder-Delivery-ID` header. Adder keeps that ID stable across delivery retries and process restarts, so a receiver can use it for deduplication.

The receiver can accept a request immediately before Adder records the SQLite acknowledgement. If Adder stops during that interval, the next run sends the same entry again with the same delivery ID. Durable mode therefore provides at-least-once attempts for persisted entries, not exactly-once effects. The receiver must make repeated effects safe when it requires exactly-once business behavior.

## Filesystem safety and access control

Place the state file in a directory that other local users cannot modify. On Unix, Adder checks the ownership and permissions of every path component, rejects an immediate parent directory that is a symlink, and restricts the database and existing SQLite journal sidecars to owner-only file permissions before opening them. Adder also rejects a state file or existing sidecar that is a symlink.

Unix mode checks do not inspect extended ACLs. Ensure that extended ACLs do not grant another account write access. On Windows, configure a directory ACL that grants write access only to the Adder account; Adder does not validate Windows directory ACLs.

These checks do not protect the state file from another process running as the Adder account and changing files while Adder starts. Do not share a state path between processes, and do not use a state path that another service manages.

## Redirect handling

Durable mode rejects a redirect when the HTTP client changes the request from `POST` with a body to a bodyless `GET`. A `307` or `308` redirect can preserve the `POST` method and request body, so the delivery can follow that redirect. Configure the final webhook URL directly when the destination does not require redirects.

## Verify recovery

Use a test receiver and do not provide real credentials during this verification.

1. Configure durable mode with a temporary SQLite `state-path` and a test receiver that returns HTTP `500`.
2. Send an event and confirm that Adder reports a delivery failure while the entry remains in the SQLite file.
3. Restart Adder with the test receiver returning HTTP `200`.
4. Confirm that the receiver receives the same `X-Adder-Delivery-ID` as the failed attempt.
5. Query the SQLite file:

   ```sql
   SELECT COUNT(*) FROM queue WHERE name = 'webhook.pending';
   ```

   Confirm that the query returns `0` after the receiver returns `200`.

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>