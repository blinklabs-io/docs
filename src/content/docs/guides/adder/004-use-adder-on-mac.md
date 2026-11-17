---
title: Using on Mac
description: How to use Adder on Mac.
---

# Using on Mac

Adder ships as a signed and notarized macOS `.pkg` package.

Use the macOS `.pkg` release artifact for both new installations and updates. Do not use an older standalone `.app` artifact.

## Install Adder

1. Open the Adder release page and download the macOS `.pkg` package.
2. Double-click the `.pkg` file and follow the installer prompts.
3. The installer places `Adder.app` in `/Applications`.

The `Adder.app` bundle contains both the `adder` CLI and the `adder-tray` tray app.

After installation, the installer makes a best effort to create `/usr/local/bin/adder` as a convenience symlink to the bundled CLI. It creates the symlink when no entry exists at that path or an existing symlink already points to the bundled CLI, and it does not replace an unrelated command.

## Launch Adder

- Open `Adder` from `/Applications`.
- Or run `open /Applications/Adder.app` in Terminal.

## Configure startup and background activity

During Adder setup, select `Start Adder automatically on login / reboot` to control whether Adder Tray starts automatically. The setting synchronizes the tray launch agent with macOS Login Items.

The setup screen shows whether Adder Tray's background activity is registered and running. Select `Open Login Items Settings...` to review or change the macOS settings. In System Settings, open `General > Login Items & Extensions` and review `Open at Login` and `App Background Activity`.

## Manage notification rules

From the Adder Tray menu, select `Notification Rules...` to edit notification targets and categories for `Wallets`, `DReps`, `Pools`, `Assets`, and `Policies`. Select the notification categories that each target receives, or select `Monitor Everything` instead of individual targets. `Monitor Everything` is exclusive and cannot be selected with specific targets.

Select `Apply` to persist the changes and hot refresh notification rules and rate limits without restarting Adder Tray. Deleting a target requires confirmation. If applying changes displays a reconnect warning, the editor remains open with its inputs re-enabled so the changes can be retried.

## View Adder Tray details

From the Adder Tray menu, select `About` to open the in-app dialog. When a commit hash is available, the dialog shows `Version: <version> (commit: <hash>)`; otherwise, it shows the version alone.

## Build a local package

Run the following command to create a package for local testing:

```sh
make pkg-macos-adhoc
```

This command ad hoc signs the `Adder.app` bundle so local notifications work. The resulting `.pkg` remains unsigned and does not pass Gatekeeper; it is suitable only for local testing. If a regular local package build has no signing identities, the build skips signing and notarization with warnings, and Gatekeeper does not accept the resulting package.


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
