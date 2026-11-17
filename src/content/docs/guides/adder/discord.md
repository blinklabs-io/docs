---
title: Discord Bot Output Reference
description: Configure Adder's Discord bot output and understand its runtime behavior.
---

# Discord bot output

## Overview

The `discord` output sends selected Adder events through a Discord bot to one
configured server and channel. It also registers the read only commands
`/adder-status` and `/adder-recent` for that server.

This integration uses the Discord Gateway for bot interactions and the Discord
REST API for command registration, event messages, and command replies. It is a
bot integration rather than the existing Discord webhook configuration.

## Configuration

Set `output: discord` and place the Discord settings under
`plugins.output.discord`:

```yaml
output: discord
plugins:
  output:
    discord:
      bot-token: "replace-with-the-bot-token"
      application-id: "123456789012345678"
      guild-id: "234567890123456789"
      channel-id: "345678901234567890"
      event-types: "blocks,rollbacks,governance"
```

| Option | Default | Requirement and behavior |
| --- | --- | --- |
| `bot-token` | Empty | Required. The secret token for the Discord bot. Adder uses it to authenticate REST requests and the Gateway session. |
| `application-id` | Empty | Required. A positive Discord application ID. Adder uses it when it registers the slash commands and verifies interactions. |
| `guild-id` | Empty | Required. A positive ID for the Discord server that can receive events and commands. |
| `channel-id` | Empty | Required. A positive ID for the channel that receives events and accepts the commands. |
| `event-types` | `blocks,rollbacks,governance` | Optional. When set, provide at least one supported value: `blocks`, `transactions`, `rollbacks`, or `governance`. |

Transactions remain disabled by default. Add `transactions` to
`event-types` when transaction messages are required. Adder rejects an empty
selection and rejects event types that Discord output does not support.

Keep `bot-token` in a secret store or provide it through the
`OUTPUT_DISCORD_BOT_TOKEN` environment variable. Avoid committing the token to
the YAML file. Adder does not include the token in delivery or command error
messages.

## Discord bot setup

Complete these steps before starting Adder:

1. Create a Discord application and add a bot user in the Discord Developer
   Portal.
2. Copy the application ID, server ID, and channel ID into the corresponding
   settings. Enable Developer Mode in Discord when the client needs to expose
   server and channel IDs for copying.
3. Generate an installation link with the `bot` and
   `applications.commands` scopes. Install the bot in the configured server.
4. Grant the bot `View Channel`, `Send Messages`, and `Embed Links` in the
   configured channel. These permissions allow event messages and command
   replies to appear there.
5. Store the bot token securely, configure the five options, and start Adder.

Adder registers `/adder-status` and `/adder-recent` in the configured server
when the output starts. The bot uses no privileged Gateway intents, so the
installation does not require Message Content or member intents.

## Commands and interactions

Both commands are read only and return ephemeral replies. Discord shows an
ephemeral reply only to the person who invoked the command.

| Command | Behavior |
| --- | --- |
| `/adder-status` | Confirms that the Adder Discord output is running. |
| `/adder-recent` | Lists the most recent selected events that Adder delivered successfully since startup. |

Adder keeps at most five recent delivered events in memory. A sixth successful
delivery removes the oldest entry. The list does not use durable storage and
clears when Adder restarts. If no selected event has been delivered since
startup, `/adder-recent` reports that no events are available.

Adder accepts interactions only from the configured server. It ignores
interactions from every other server without sending a reply. An interaction
from another channel in the configured server receives an ephemeral message
that the command is available only in the configured channel.

Command replies suppress mentions. A command cannot publish an event, change
Adder configuration, or change the recent event list.

## Event delivery

Adder sends each selected event to the configured channel. It formats event
messages with Adder's Discord event layout and sets Discord's
`allowed_mentions.parse` value to an empty list. Event content therefore does
not notify users, roles, or everyone mentions even when event data contains
mention syntax.

Adder records an event in the recent list only after Discord accepts the event
message. The output does not keep a durable queue. A failed or interrupted
delivery does not reappear after a restart, and Adder does not replay an
ambiguous event message automatically because a replay could create a
duplicate.

Delivery and command response failures go to Adder's output error reporting
path and logs. The output continues to report failures without exposing the
bot token. An event delivery failure does not make an unselected event eligible
for delivery.

## Gateway connection and reconnection

The bot connects to Discord Gateway version `10` and follows the Gateway
session lifecycle:

- Adder sends an Identify message with zero privileged intents when it creates
  a new session.
- Adder sends heartbeats at the interval supplied by Discord and includes the
  latest sequence number when one exists.
- Adder tracks heartbeat acknowledgements. If Discord does not acknowledge a
  heartbeat, Adder closes the connection and starts reconnect handling.
- After a successful session, Adder saves the session ID, resume URL, and
  sequence number. It attempts to resume that session after a disconnect.
- If Discord rejects the resume or no resumable session exists, Adder starts a
  new session with Identify.

The reconnect delay starts at one second, doubles after each unsuccessful
attempt, and stops increasing at fifteen seconds. Adder cancels the reconnect
wait when the output stops. Discord Gateway failures that prevent a valid
session remain visible through the output error reporting path and logs.

## REST rate limits and retries

Adder applies Discord route and global rate limit cooldowns to authenticated
requests. It reads the `Retry-After` header or Discord's `retry_after` response
value and rejects missing, negative, nonnumeric, or otherwise invalid delays.

- A request waits for a cooldown of ten seconds or less.
- Adder fails the request immediately when more than ten seconds remain in the
  cooldown. Later requests for the same route also fail while that long
  cooldown remains.
- A `429` response receives at most three retries, for a maximum of four
  attempts including the initial request.
- `GET` requests also retry temporary transport failures and server errors with
  bounded delays of one, two, and four seconds.
- Adder does not automatically replay a non-`GET` request after an ambiguous
  transport or server failure. A rate limited `POST` can retry within the
  bounded `429` retry budget because Discord explicitly supplies the cooldown.

These limits apply to command registration, event messages, and interaction
callbacks. A delivery that exhausts its retry budget reports an error and does
not enter a local replay queue.

## Shutdown behavior

When `Stop` runs, Adder cancels the output workers, cancels in-flight work, and
closes the Gateway connection before it waits for the workers to finish. A
Gateway connection that already closed during concurrent shutdown counts as a
successful close. Repeating `Stop` therefore does not produce a spurious
closed-connection error.

Adder still reports other Gateway close failures. The idempotent behavior does
not suppress errors unrelated to an already closed connection.

## Related references

- [Output integrations guide](./008-output-integrations.md)
- [Command reference](./006-command_list.md)
