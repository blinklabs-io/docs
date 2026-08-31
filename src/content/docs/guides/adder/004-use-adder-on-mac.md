---
title: Using on Mac
description: How to use Adder on Mac.
---

# Using on Mac

Adder ships as a signed and notarized macOS `.pkg` package.

## Install Adder

1. Open the Adder release page and download the macOS `.pkg` package.
2. Double-click the `.pkg` file and follow the installer prompts.
3. The installer places `Adder.app` in `/Applications`.

## Launch Adder

- Open `Adder` from `/Applications`.
- Or run `open /Applications/Adder.app` in Terminal.
- Open `Adder` from `/Applications`.
- Or run `open /Applications/Adder.app` in Terminal.

## Use the Adder CLI

After installation, the installer attempts to make `adder` available through `/usr/local/bin/adder`:

```bash
adder --help
```

The installer creates this link on a best effort basis. A locked down or read only `/usr/local` can prevent link creation, and an unrelated existing `/usr/local/bin/adder` remains untouched. In either case, run the bundled CLI directly:

```bash
/Applications/Adder.app/Contents/MacOS/adder --help
```

## Package locally

For a local package that needs macOS notification authorization, set `ADHOC=1` when building:

```bash
ADHOC=1 ./packaging/macos/build-pkg.sh
```

This option ad hoc signs the app bundle for local development. The resulting `.pkg` remains unsigned, and Gatekeeper does not accept it. This local package is for development only; use the release package for distribution.


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
