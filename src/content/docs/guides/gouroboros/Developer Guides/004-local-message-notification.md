---
title: LocalMessageNotification replay cache configuration
description: Configure the replay cache for authenticated LocalMessageNotification messages.
---

# LocalMessageNotification Replay Cache Configuration

This guide describes the public replay-cache configuration for the `localmessagenotification` package. The cache prevents the client from delivering an accepted message ID again while its signed expiration time remains active.

## Configuration

Create a `Config` with `localmessagenotification.NewConfig` and use `localmessagenotification.WithMaxReplayEntries` to set the maximum number of accepted message IDs that the client retains:

```go
cfg := localmessagenotification.NewConfig(
	localmessagenotification.WithMaxReplayEntries(200000),
)
```

`Config.MaxReplayEntries` and `WithMaxReplayEntries` control the same bound:

| Setting | Behavior |
| --- | --- |
| Omit `WithMaxReplayEntries` or set `Config.MaxReplayEntries` to `0` | The client uses the package default. |
| Set `WithMaxReplayEntries` to a positive value | The client uses that value as the replay-cache bound. |

The default value is `31 * 4096 = 126976` entries. It covers 31 unexpired messages per stake pool for 4096 pools.

## Retention and capacity

The bound counts accepted message IDs that the client retains until their signed expiration time. The client never evicts an unexpired ID to make room for a new message. Expiration removes an ID from the retained set.

| Condition | Result |
| --- | --- |
| The reply fits within the configured bound | The client admits the reply's fresh message IDs. |
| The reply would exceed the configured bound | The client refuses the entire reply, delivers and records no messages from it, and returns a replay-cache-capacity error. The protocol closes the connection because it returns the error. |

After a capacity refusal, later replies remain refused until enough accepted message IDs expire to bring the retained set below the configured bound.

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>