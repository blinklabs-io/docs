---
title: Adder Tray Configuration
description: Configure structured monitoring and notification rate controls for Adder Tray.
---

# Adder Tray Configuration

## Overview

This reference describes the monitoring and notification settings that Adder Tray saves in `adder-tray.yaml`. Configure monitoring targets under `filter`, and configure notification combining with `notify_rate_limit` and `notify_rate_window`.

Adder Tray uses its `filter` as the authoritative source for notification target matching. The engine configuration no longer controls the per-target lists used by tray notifications.

## Structured monitoring

The `filter` object supports one broad monitoring mode or explicit target lists:

| YAML key | Purpose | Accepted values |
| --- | --- | --- |
| `monitor_everything` | Enables monitoring without target lists. | `true` or `false` |
| `wallets` | Lists wallet targets. | Cardano addresses beginning with `addr` or `stake` |
| `dreps` | Lists DRep targets. | DRep IDs beginning with `drep1` or hexadecimal bytes |
| `pools` | Lists stake pool targets. | Pool IDs beginning with `pool1` or hexadecimal bytes |
| `assets` | Lists asset targets. | CIP-14 bech32 fingerprints beginning with `asset1` |
| `policies` | Lists minting policy targets. | 56-character hexadecimal policy IDs |
| `drep_match` | Joins the DRep group to the preceding populated target group. | `any` or `all` |
| `pool_match` | Joins the pool group to the preceding populated target group. | `any` or `all` |
| `asset_match` | Joins the asset group to the preceding populated target group. | `any` or `all` |
| `policy_match` | Joins the policy group to the preceding populated target group. | `any` or `all` |

Values within one target list match with `OR`. A `*_match` key joins adjacent populated groups with `any` or `all`. The wallet group starts the expression and does not have a matching key.

### Monitor Everything

Set `monitor_everything` to `true` to monitor all supported target types. This mode ignores `wallets`, `dreps`, `pools`, `assets`, and `policies`.

The wizard exposes this mode as **Monitor Everything (ignore per-target lists)**. The control is exclusive: when enabled, the wizard hides the Wallets, DReps, Pools, Assets, and Policies sections and saves only the broad monitoring mode. Disable it before configuring explicit lists.

When `monitor_everything` is `false`, configure at least one explicit target in the wizard. The wizard maps its visible sections to the YAML keys as follows:

- **Wallets** → `wallets`
- **DReps** → `dreps`
- **Pools** → `pools`
- **Assets** → `assets`
- **Policies** → `policies`

## Persistence and migration

Adder Tray saves `filter`, `notify_rate_limit`, and `notify_rate_window` in `adder-tray.yaml`. Changing per-target values in the engine configuration does not change desktop notification matching.

Older configurations may contain target values under the engine-side `filter.cardano` keys `address`, `drep`, `pool`, `asset`, or `policy`, or under older tray template and parameter settings. During migration, Adder Tray carries supported legacy values into the corresponding structured lists. It splits comma-separated values into individual targets.

After migration, Adder Tray removes the legacy per-target engine keys when it writes the engine configuration. Place new monitoring configuration in the tray `filter` object instead of `filter.cardano`.

## Notification rate controls

Configure these tray-level keys in `adder-tray.yaml`:

| YAML key | Description |
| --- | --- |
| `notify_rate_limit` | Maximum number of notifications allowed in one window. |
| `notify_rate_window` | Length of the combining window. |

The default is one notification per five seconds. An omitted or zero `notify_rate_limit` uses `1`, and an omitted or zero `notify_rate_window` uses `5s`.

The wizard exposes both settings under **Advanced — Rate Limiting**:

- **Max notifications per window** accepts an integer.
- **Window duration** accepts a positive Go duration such as `5s`, `30s`, or `1m`.
- Leave either field blank to use its default.
- Enter a negative rate limit to disable coalescing. Each matching event then produces an individual notification.

With a positive rate limit, matches beyond the limit wait until the window ends and combine into one **Multiple events occurred** notification. Connection issue notifications bypass this event rate limit so connection loss and reconnection alerts remain immediate.

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>