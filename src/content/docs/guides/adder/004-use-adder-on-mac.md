---
title: Using on Mac
description: How to use Adder on Mac.
---

# Using on Mac

Adder ships as a signed and notarized macOS `.pkg` package for each supported Mac architecture.

## Install Adder

1. Open the Adder release page and download the macOS `.pkg` package that matches the Mac architecture: `arm64` for Apple silicon or `amd64` for Intel Macs.
2. Double-click the `.pkg` file and follow the package installer prompts.
3. The installer places `Adder.app` in `/Applications`. The app includes the `adder-tray` GUI and the `adder` CLI.
4. Run `adder` from Terminal when the installer creates the normal `/usr/local/bin/adder` convenience link. If the installer cannot create that link, run `/Applications/Adder.app/Contents/MacOS/adder` instead. The installer does not replace an unrelated existing `/usr/local/bin/adder` link.

## Launch Adder

- Open `Adder` from `/Applications`.
- Or run `open /Applications/Adder.app` in Terminal.

The first run tray wizard handles startup and login registration. The package does not configure those settings.

### Configure startup on macOS

1. In the tray wizard, select `Start Adder automatically on login / reboot` to enable automatic startup, or clear it to disable automatic startup.
2. Check the background activity status shown by the wizard. The status reports whether the macOS service remains registered or currently runs.
3. Select `Open Login Items Settings...` to open `System Settings > General > Login Items & Extensions > Open at Login / App Background Activity`.

The wizard applies the startup choice and keeps the macOS launch agent and Login Item synchronized. Opening the package does not configure startup before the wizard applies a choice.

### View About metadata

Open `About Adder` from the tray menu to view the running version. The dialog also displays the commit hash when the build includes one. When no version is available, the dialog displays `devel`.

## Build a local macOS package

Developers can build the standard package locally:

```bash
make pkg-macos
```

Set `ARCH` to select the package architecture:

```bash
ARCH=arm64 make pkg-macos
ARCH=amd64 make pkg-macos
```

For local testing, use the ad hoc target to sign the app bundle and enable app notifications:

```bash
make pkg-macos-adhoc
ARCH=arm64 make pkg-macos-adhoc
ARCH=amd64 make pkg-macos-adhoc
```

Release packages use release signing, notarization, and stapling when the release credentials are available. The `pkg-macos-adhoc` target sets `ADHOC=1`, which signs the app bundle for local notifications but leaves the `.pkg` unsigned and not notarized. Gatekeeper may reject local unsigned and ad hoc packages.

To build a local app bundle with explicit version and commit metadata, pass `VERSION` and `COMMIT_HASH` to the `bundle-macos` target:

```bash
VERSION=1.2.3 COMMIT_HASH=abc1234 make bundle-macos
```

The bundle script passes `VERSION` to the `adder` and `adder-tray` builds and stores the original value in the bundle's `AdderGitVersion` metadata. The Makefile uses `VERSION` and `COMMIT_HASH` as linker overrides, so the About dialog can display the selected values.

## Uninstall from a source checkout

Run the uninstall script from the Adder source checkout:

```bash
./scripts/bundle-macos-uninstall.sh
```

The script stops running Adder processes, removes Adder from Login Items, unloads and removes the launch agent, removes Adder app bundles, and cleans local build artifacts. It preserves configuration and logs by default.

To remove configuration and logs as well, use `--purge`, `--all`, or `-a`:

```bash
./scripts/bundle-macos-uninstall.sh --purge
```

This source checkout procedure also removes Login Item and launch agent state; manually removing an installed package does not run that cleanup. The script does not remove the `/usr/local/bin/adder` convenience link. The package installer creates that link when possible and does not replace an unrelated existing link, so handle the link separately when it points to an Adder installation that no longer exists.


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
