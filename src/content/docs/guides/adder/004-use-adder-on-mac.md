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
4. Run `adder` from Terminal when the installer creates the normal `/usr/local/bin/adder` convenience link. If that link cannot be created, run `/Applications/Adder.app/Contents/MacOS/adder` instead. The installer does not replace an unrelated existing `/usr/local/bin/adder` link.

## Launch Adder

- Open `Adder` from `/Applications`.
- Or run `open /Applications/Adder.app` in Terminal.

The first-run tray wizard handles startup and login registration. The package does not configure those settings.

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

For local testing with working app notifications, build an ad hoc signed app package:

```bash
make pkg-macos-adhoc
ARCH=arm64 make pkg-macos-adhoc
ARCH=amd64 make pkg-macos-adhoc
```

Release packages use release signing, notarization, and stapling when the release credentials are available. The `pkg-macos-adhoc` target sets `ADHOC=1`, which signs the app bundle for local notifications but leaves the `.pkg` unsigned and not notarized. Local unsigned and ad hoc packages are not expected to pass Gatekeeper.
