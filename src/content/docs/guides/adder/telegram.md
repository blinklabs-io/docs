---
title: Telegram Output Controls
description: Configure Telegram delivery preferences and in-chat controls for Adder.
---

# Telegram Output Controls

## Overview

This reference describes the YAML settings and Telegram commands that control Adder event notifications. Adder sends block, transaction, rollback, and governance messages to one configured Telegram chat and lets authorized users change those delivery preferences.

## Configuration

Add the Telegram output settings to the Adder YAML configuration:

```yaml
output: telegram
plugins:
  output:
    telegram:
      bot-token: "<Telegram bot token>"
      chat-id: "<Telegram chat ID>"
      settings-file: "/var/lib/adder/telegram-settings.yaml"
      operator-user-ids: "123456789,987654321" # group and supergroup chats only
```

The `chat-id` value selects the only chat that receives event messages and command replies. The `settings-file` value selects the local YAML file that stores notification preferences. Adder must be able to write the file's parent directory.

Set `operator-user-ids` to a comma separated list of positive Telegram user IDs when the configured chat is a group or supergroup. These users can change notification preferences in that chat. Leave the value empty for a private chat or when no group member should change preferences.

## Persisted notification settings

The settings file uses this structure:

```yaml
chat_id: 123456789
blocks: true
transactions: true
rollbacks: true
governance: true
```

Set `chat_id` to the same numeric ID as the configured `chat-id`. The file stores four independent preferences:

- `blocks` controls block messages.
- `transactions` controls transaction messages.
- `rollbacks` controls rollback messages.
- `governance` controls governance messages.

Adder enables all four categories by default. Adder also uses those defaults when the settings file does not exist yet, then creates the file when a user changes a preference. Adder writes each preference change atomically and keeps the configured chat ID in the file.

At startup, Adder rejects the settings file when it contains malformed YAML, unknown fields, more than one YAML document, no `chat_id`, or a `chat_id` that differs from the configured chat. An unreadable file or a parent directory that does not permit writing also prevents Adder from using persisted preferences.

Omit `settings-file` to keep Telegram delivery enabled without persistence. Adder continues to show the current settings, but in-chat preference changes remain unavailable. Notification preferences affect Telegram delivery only; Adder continues processing events for every category.

## Commands

Send commands in the configured chat:

| Command | Behavior |
| --- | --- |
| `/start` | Introduces the bot and points to `/help`. |
| `/help` | Lists the available commands. |
| `/status` | Reports the pipeline state as `running`, `stopped`, or `unavailable`. |
| `/settings` | Shows whether `blocks`, `transactions`, `rollbacks`, and `governance` notifications are `on` or `off`. It also reports when `settings-file` is not configured. |
| `/notify blocks\|transactions\|rollbacks\|governance on\|off` | Enables or disables the selected notification category and saves the change to the settings file. |

The `/notify` command requires exactly one category and either `on` or `off`. For example:

```text
/notify blocks off
/notify transactions on
/notify rollbacks off
/notify governance on
```

The `/status` response uses the configured pipeline status provider. It reports `running` when the provider reports an active pipeline, `stopped` when the provider reports an inactive pipeline, and `unavailable` when Adder has no status provider.

## Authorization and chat scope

Adder accepts commands only from the configured `chat-id`. A command from another chat receives no response and cannot change preferences.

- In a private chat, only the user whose Telegram ID matches the configured chat ID can change preferences.
- In a group or supergroup, only users listed in `operator-user-ids` can change preferences. Other members can use `/status` and `/settings`, but `/notify` does not change anything for them.
- An empty `operator-user-ids` list leaves group and supergroup preferences unchanged through chat.
- Channels can receive event messages, but they cannot use these message commands.

Telegram privacy mode may require a group member to address a command to the bot, such as `/status@YourBotName`. Adder ignores commands addressed to another bot.

## Failure behavior

- Adder ignores unknown commands and commands sent outside the configured chat.
- Adder returns the `/notify` usage text when the category or state is invalid.
- Adder reports that only the configured chat owner or an operator can change notifications when authorization fails.
- Adder reports that `output.telegram.settings-file` must be configured when a preference change has no settings file.
- If Adder cannot save a preference, it leaves the change unapplied and reports that it could not save the notification preferences.
