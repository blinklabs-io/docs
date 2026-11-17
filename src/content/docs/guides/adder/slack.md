---
title: Slack Output Reference
description: Configure Adder to send selected events to Slack through incoming webhooks.
---

# Slack output

The `slack` output sends selected Adder events to one or more Slack channels
through Slack incoming webhooks. This reference covers webhook setup,
configuration, payloads, validation, delivery limits, and lifecycle behavior.

## Prerequisites

- Create a Slack app with an incoming webhook for each destination channel. Follow
  the [Slack incoming webhook setup](https://docs.slack.dev/messaging/sending-messages-using-incoming-webhooks/).
- Store each webhook URL in a secret-managed configuration source. A webhook URL
  authenticates requests for its Slack destination and must remain private.
- Ensure that the host running Adder can make HTTPS requests to each webhook.

## Configuration

Select the output with `output: slack` and configure its options under
`plugins.output.slack`:

```yaml
output: slack

plugins:
  output:
    slack:
      webhook-urls: "https://hooks.slack.com/services/EXAMPLE/ONE,https://hooks.slack.com/services/EXAMPLE/TWO"
      event-types: "blocks,transactions,rollbacks,governance"
```

The equivalent command line options are
`--output-slack-webhook-urls` and `--output-slack-event-types`.

### Configuration fields

| Field | Required | Default | Description |
| --- | --- | --- | --- |
| `webhook-urls` | Yes | None | Comma-separated Slack incoming webhook URLs. Adder requires at least one destination. |
| `event-types` | No | `blocks,transactions,rollbacks,governance` | Comma-separated event names to send to Slack. Adder requires at least one supported name when this field is set. |

Adder trims surrounding whitespace from comma-separated values. An empty value
does not provide a destination or event type.

### Webhook validation and secret handling

Adder validates every `webhook-urls` entry before it starts delivery:

- The URL must use `https`.
- The URL must not contain user information such as an embedded username or
  password.
- At least one valid URL must be present.

Keep webhook URLs out of source control, command history, shared configuration
examples, and diagnostic output. Adder reports delivery failures by destination
number and error condition rather than including the webhook URL in the error.

## Event selection and payload

The `event-types` field accepts these exact names:

- `blocks`
- `transactions`
- `rollbacks`
- `governance`
- `drep-registration`
- `drep-update`
- `drep-retirement`

The default selection includes `blocks`, `transactions`, `rollbacks`, and
`governance`. DRep registration, update, and retirement events require explicit
selection.

Adder ignores events outside the selection. Filtering affects Slack delivery
only; an ignored event continues through the rest of the Adder pipeline.

For each selected event and destination, Adder sends one HTTP `POST` request
with `Content-Type: application/json`. The request body always uses this JSON
shape:

```json
{"text":"..."}
```

The `text` value contains a human-readable event summary. Adder does not expose
a configurable Slack message format. The summary includes the following
information for the supported event types:

| Event type | Summary information |
| --- | --- |
| `blocks` | Block number, slot, era, block hash, and transaction count. |
| `transactions` | Transaction hash, block number, slot, and fee in lovelace. |
| `rollbacks` | Rollback slot and block hash. |
| `governance` | Transaction hash, slot, proposal count, vote count, and DRep certificate count. |
| `drep-registration`, `drep-update`, `drep-retirement` | Certificate type, DRep ID, transaction hash, and slot. |

Adder sends the same formatted text to every configured destination. A failure
for one destination does not prevent delivery attempts to the other configured
destinations.

## Delivery contract

Adder considers a request successful only when Slack returns HTTP status `200`
with the response body `ok`. Each request uses a 15-second HTTP client timeout.
Adder does not treat another status or response body as successful.

After a successful request, Adder waits at least one second before sending the
next request to that same destination. The spacing applies independently to
each destination.

### Rate limits and retries

When Slack returns HTTP `429`, Adder reads `Retry-After` as a nonnegative whole
number of seconds:

1. For a delay from `0` through `60` seconds, Adder records a cooldown for each
   destination and retries the same message up to three times after the initial
   request.
2. The cooldown also applies to later events for that destination. If the retry
   budget ends, Adder reports the delivery failure but keeps the cooldown.
3. A missing, invalid, negative, or nonnumeric `Retry-After` value fails the
   affected delivery and applies a one-minute cooldown.
4. A `Retry-After` delay greater than one minute fails the affected delivery and
   leaves the destination cooling down. Adder does not wait beyond the
   one-minute retry window for that delivery.

Adder retries transport failures and HTTP `5xx` responses up to three times
after the initial request. The retry waits use bounded exponential delays of
one, two, and four seconds. Adder does not retry other HTTP `4xx` responses.

Adder skips a destination while more than one minute remains in its cooldown
and reports that delivery as cooling down. When one minute or less remains,
Adder waits for the rest of the cooldown before attempting the request. Each
destination maintains its own cooldown, so a rate limit on one webhook does not
pause another webhook.

### Errors, shutdown, and restart behavior

Adder logs delivery errors and sends them through the output error
channel. Error messages identify the affected destination and failure without
exposing webhook URLs or other webhook secret values.

The output runs a background delivery worker. During shutdown, Adder stops the
worker and waits for it to exit. The output has no durable queue: Adder does
not recover events that remain pending when it stops and restarts.

## Live check

Use a dedicated Slack test channel and webhook. Do not use a production channel
or paste a production webhook URL into a test file or diagnostic output.

1. Create a test incoming webhook for the dedicated Slack channel.
2. Configure `output: slack` with the test URL and select one event type, such
   as `blocks`.
3. Start Adder and trigger one matching Cardano event.
4. Confirm that the test channel receives one human-readable Slack message and
   that Adder reports no output error.
5. If multiple test destinations are configured, confirm that each receives the
   same event summary. Trigger an unselected event to confirm that Adder does
   not send it to Slack.

After the check, revoke the test webhook when it is no longer needed.

## Related references

- [Adder output integration overview](/guides/adder/008-output-integrations/)
- [Command reference](/guides/adder/006-command_list/)

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>