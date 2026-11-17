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

## Build a local package

Run the following command to create a package for local testing:

```sh
make pkg-macos-adhoc
```

This command ad hoc signs the `Adder.app` bundle so local notifications work. The resulting `.pkg` remains unsigned and does not pass Gatekeeper, so use it for local testing only. If a regular local package build has no signing identities, the build skips signing and notarization with warnings, and the resulting package does not have Gatekeeper acceptance.


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
