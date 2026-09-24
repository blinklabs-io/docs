---
title: Adder Tray configuration reference
description: Configure Adder Tray monitoring targets, notification preferences, and tray editor behavior.
---

This reference describes the Adder Tray settings in `adder-tray.yaml` and the `Notification Rules...` editor. The tray uses the `filter` section to match notification targets; the engine configuration no longer supplies the tray target lists.

## Open the Notification Rules editor

During first run, the setup wizard provides the monitoring target and notification controls. After setup completes:

1. Open the Adder menu from the system tray.
2. Select `Notification Rules...`.

The editor loads the saved targets and preferences into a working copy. The editor saves changes only when the `Apply & Restart` button receives a selection.

The editor supports two monitoring modes:

- `Monitor Everything (ignore per-target lists)` monitors supported event types without using the `Wallets`, `DReps`, `Pools`, `Assets`, or `Policies` values.
- Standard monitoring uses one or more values in the target groups and evaluates the configured target expression.

## Configuration file location

Adder Tray stores its configuration in `adder-tray.yaml` at the following platform-specific path:

| Platform | Configuration path |
| --- | --- |
| macOS | `$HOME/Library/Application Support/Adder/adder-tray.yaml` |
| Windows | `%APPDATA%\Adder\adder-tray.yaml`, or `%USERPROFILE%\AppData\Roaming\Adder\adder-tray.yaml` when `APPDATA` is not set |
| Linux | `$XDG_CONFIG_HOME/adder/adder-tray.yaml`, or `$HOME/.config/adder/adder-tray.yaml` when `XDG_CONFIG_HOME` is not set |

Set `ADDER_TRAY_CONFIG_DIR` to override the directory that contains `adder-tray.yaml`. The override value names the directory, not a replacement filename.

## Automatic startup

The tray stores the automatic startup preference in the `auto_start` YAML field:

```yaml
auto_start: true
```

Set `auto_start` to `true` to start Adder automatically at login or reboot. Set it to `false` to disable automatic startup at login or reboot.

The setup wizard is the normal user-facing way to change this value. On the Notifications step, select or clear `Start Adder automatically on login / reboot` and complete the wizard to save the preference.

The `auto_start` field belongs to the tray configuration and is separate from the engine's `config.yaml`.

## Background activity status

The setup wizard reports the tray's background activity status:

- **Registered & Running**: Adder has a startup registration and the background activity is running.
- **Registered**: Adder has a startup registration, but the background activity is not running.
- **Not registered**: Adder has no startup registration.
- **Status unknown**: The wizard could not determine the registration or running state.

Registration and running are separate states. A registered tray can remain inactive until it starts, while a running tray has an active background process.

## Platform behavior

### Windows

When `auto_start` is `true`, Adder registers the tray to start for the current Windows user at login. The registration applies to that user and does not require administrator elevation. When `auto_start` is `false`, Adder does not register the tray for automatic login startup.

### macOS

When `auto_start` is `true`, Adder configures its LaunchAgent to run when the user logs in and to remain available, and adds Adder to macOS Login Items. When `auto_start` is `false`, Adder disables those automatic startup behaviors and removes the corresponding Login Items entry.

## Target filters

The following example uses explicit target arrays:

```yaml
filter:
  monitor_everything: false
  wallets:
    - addr1...
    - stake1...
  dreps:
    - drep1...
    - deadbeef
  pools:
    - pool1...
    - 0123456789abcdef
  assets:
    - asset1...
  policies:
    - aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
  drep_match: any
  pool_match: all
  asset_match: any
  policy_match: any
```

Set `filter.monitor_everything` to `true` to monitor all supported event types. This setting ignores every target array. Set it to `false` when the configuration should match selected targets; at least one target must then appear in `wallets`, `dreps`, `pools`, `assets`, or `policies`.

Use these values in the target arrays:

- `wallets`: Cardano payment or stake addresses that start with `addr1` or `stake1`.
- `dreps`: DRep identifiers that start with `drep1` or hexadecimal DRep IDs.
- `pools`: Stake pool identifiers that start with `pool1` or hexadecimal pool IDs.
- `assets`: CIP-14 asset fingerprints that start with `asset1`.
- `policies`: 56-character hexadecimal minting policy IDs.

In the `Notification Rules...` editor, enter target values in the matching `Wallets`, `DReps`, `Pools`, `Assets`, or `Policies` section. Comma separated input creates multiple rows. The editor trims surrounding whitespace and ignores empty comma items. It validates every value before adding any row from the submission, shows invalid values inline, and rejects the submission when a value fails validation. It rejects a value that already exists in the same group, including case-only duplicates and duplicates within one submission.

Select a row's remove button to delete it. The editor asks for confirmation before it removes the row.

### Match modes

Set `drep_match`, `pool_match`, `asset_match`, and `policy_match` to `any` or `all`. An omitted match field resolves to `any`.

Each target array matches any one of its values. A match field joins its populated target group to the preceding populated group:

- `any` joins the groups with `OR`.
- `all` joins the groups with `AND`.

For example, this filter matches either selected wallet or selected DRep events:

```yaml
filter:
  wallets: [addr1...]
  dreps: [drep1...]
  drep_match: any
```

When `drep_match` changes to `all`, an event must match the wallet group and the DRep group. Values inside each group still use `OR`, so the expression becomes `(wallet 1 OR wallet 2) AND (DRep 1 OR DRep 2)` when both groups contain multiple values. The first populated group has no preceding group, so its match field has no effect. Adder Tray does not support a `wallet_match` field.

The editor displays `AND` or `OR` connectors between populated groups. `Pools` match block events, `Wallets`, `Assets`, and `Policies` match transaction events, and `DReps` match governance events. An `AND` across incompatible event families can match no single event, so the editor rejects that expression before applying it. Select `OR` or remove a target group to correct it.

## Notification preferences

`notify_prefs` maps each supported alert category to `true` or `false`. The following are the exact YAML map keys:

```yaml
notify_prefs:
  "Incoming transactions": true
  "Outgoing transactions": true
  "Token transfers": true
  "Blocks minted": true
  "Chain rollbacks": true
  "Pool parameter changes": true
  "New governance proposals": true
  "Votes cast": true
  "Registration changes": true
  "Asset activity": true
  "Policy activity": true
  "Connection issues": true
```

The setup wizard shows the categories that apply to the selected targets:

- `wallets` shows `Incoming transactions`, `Outgoing transactions`, and `Token transfers`.
- `dreps` shows `New governance proposals`, `Votes cast`, and `Registration changes`.
- `pools` shows `Blocks minted`, `Pool parameter changes`, and `Chain rollbacks`.
- `assets` shows `Asset activity`.
- `policies` shows `Policy activity`.
- `monitor_everything: true` shows `Incoming transactions`, `Blocks minted`, `Chain rollbacks`, and `Votes cast`.
- `Connection issues` remains available as a connection status preference.

The standalone `Notification Rules...` editor shows one checkbox for every category in `notify_prefs`. Each checkbox enables or disables that category's notification rules across the configured targets. Current target scoping works as follows:

- `Incoming transactions`, `Outgoing transactions`, and `Token transfers` use followed wallets.
- `Blocks minted` uses followed pool issuers. An unrelated pool does not trigger a followed pool alert.
- `New governance proposals` reports proposals as general governance alerts and does not require a followed DRep.
- `Votes cast` and `Registration changes` use followed DReps. An unrelated DRep does not trigger a followed DRep alert.
- `Asset activity` uses followed asset fingerprints, and `Policy activity` uses followed policy IDs.
- `Chain rollbacks` and `Connection issues` operate independently of followed target identities.
- `Pool parameter changes` remains visible as a preference, but Adder does not currently emit a working pool parameter notification. Enabling it does not create pool parameter alerts.

## Notification coalescing

`notify_rate_limit` sets the maximum number of notifications that can fire during `notify_rate_window`. Additional matching events combine into one notification at the end of the window.

- Omit both fields, or set either field to `0`, to use one notification every five seconds.
- Set `notify_rate_limit` to a negative number to disable coalescing so every matching event fires immediately.
- Set `notify_rate_window` to a positive duration string such as `5s`, `30s`, or `1m`.
- The setup wizard accepts the same duration format and rejects zero or negative window durations.

For example:

```yaml
notify_rate_limit: 1
notify_rate_window: 5s
```

## Apply or cancel editor changes

Before applying, the editor validates the complete target expression. If every possible `AND` term spans incompatible event families, the editor keeps the window open and shows a validation message instead of restarting Adder with silent monitoring.

Select `Apply & Restart` to save the engine and tray configuration, restart or reconnect the managed Adder engine as needed, and hot swap the notification rules and rate limit in the running tray. The tray process does not require a relaunch. Select `Cancel` to close the editor and discard the working copy without saving it.

### Handle a soft apply failure

Adder persists the configuration before it performs binary, service, and API reconnect work. If a post save operation fails, the warning identifies the binary, service, or API problem, and the saved configuration remains in place. The editor stays open and re enables its inputs, so another `Apply & Restart` attempt remains available. If the service did not restart, restart Adder manually before retrying.

## Review Recent Events

Select `Recent Events` from the tray menu to open an event in an explorer. Transaction and governance events use their transaction hash. Block events use their block hash. Adder selects the explorer base URL from the network recorded on each event, so each link opens on the event's network.

## Migration from legacy filter settings

Older configurations stored tray target values under `plugins.filter.cardano` in the engine configuration. On upgrade, Adder Tray imports those values only when the new tray `filter` contains no monitor-everything setting and no target values. Comma-separated values become entries in the corresponding target arrays.

### Before migration

```yaml
plugins:
  filter:
    cardano:
      address: addr1...,stake1...
      drep: drep1...,deadbeef
      pool: pool1...,0123456789abcdef
      asset: asset1...
      policy: aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
```

### After migration

Adder Tray saves the imported targets in `adder-tray.yaml`:

```yaml
filter:
  monitor_everything: false
  wallets:
    - addr1...
    - stake1...
  dreps:
    - drep1...
    - deadbeef
  pools:
    - pool1...
    - 0123456789abcdef
  assets:
    - asset1...
  policies:
    - aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
```

When Adder Tray saves the new configuration, it removes the legacy `address`, `drep`, `pool`, `asset`, and `policy` keys from the engine configuration. Manual edits to those legacy engine values afterward do not change tray notification matching. This migration affects tray matching only; it does not remove CLI filter options.

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
