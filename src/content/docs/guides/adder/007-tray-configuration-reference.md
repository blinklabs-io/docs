---
title: Tray configuration reference
description: Configure Adder Tray targets, notifications, and migration from legacy filter settings.
---

This reference describes the changed Adder Tray settings in `adder-tray.yaml`. The tray uses the `filter` section to match notification targets; the engine configuration no longer supplies the tray target lists.

## Configuration file location

Adder Tray stores its configuration in `adder-tray.yaml` at the following platform-specific path:

| Platform | Configuration path |
| --- | --- |
| macOS | `$HOME/Library/Application Support/Adder/adder-tray.yaml` |
| Windows | `%APPDATA%\Adder\adder-tray.yaml`, or `%USERPROFILE%\AppData\Roaming\Adder\adder-tray.yaml` when `APPDATA` is not set |
| Linux | `$XDG_CONFIG_HOME/adder/adder-tray.yaml`, or `$HOME/.config/adder/adder-tray.yaml` when `XDG_CONFIG_HOME` is not set |

Set `ADDER_TRAY_CONFIG_DIR` to override the directory that contains `adder-tray.yaml`. The override value names the directory, not a replacement filename.

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
