---
title: Full-Node Wallet
description: Install, configure, build, and troubleshoot the Bursa full-node wallet.
---

# Bursa Full-Node Wallet

This guide covers installation, launch modes, runtime configuration, source builds, macOS packaging, and operational troubleshooting for the Bursa full-node wallet.

## Install

Download the wallet asset for the target platform from the [Bursa releases page](https://github.com/blinklabs-io/bursa/releases). Release assets use this naming pattern:

```text
bursa-wallet-<version>-<os>-<arch>.<ext>
```

| Platform | Asset | Installation behavior |
| --- | --- | --- |
| macOS arm64 (Apple Silicon) | `.pkg` | Apple signs and notarizes the installer; it installs `Bursa.app`. |
| Windows amd64 or arm64 | `.msi` | Windows signs the installer. |
| Linux amd64 or arm64 | `.tar.gz` | Extract the archive to run the native window build. |
| FreeBSD amd64 or arm64 | `.tar.gz` | Extract the archive and run the headless build in a browser. FreeBSD does not provide a native window build. |

For Linux or FreeBSD, extract the archive and run the included `bursa-wallet` executable:

```bash
tar xzf bursa-wallet-<version>-<os>-<arch>.tar.gz
./bursa-wallet
```

## Run the wallet

Launch `Bursa` from the applications menu after installing the macOS or Windows package, or run the executable directly:

```bash
bursa-wallet
```

The desktop build opens a native window. The headless build serves the wallet interface at <http://127.0.0.1:8090>; open that address in a browser. The wallet binds to loopback on `127.0.0.1:8090`.

The first launch synchronizes the embedded node. The default `mithril` mode bootstraps from a Mithril snapshot instead of replaying the chain from genesis. The wallet stores its data under `~/.bursa-wallet/<network>/`.

## Configuration

Set environment variables before the first launch to seed the wallet configuration:

| Variable | Default | Operational effect |
| --- | --- | --- |
| `BURSA_NETWORK` | `preview` | Selects the Cardano network and its data directory. |
| `BURSA_SYNC` | `mithril` | Uses `genesis` to replay the chain from its beginning instead of bootstrapping from a Mithril snapshot. |
| `BURSA_LEAN` | `false` | Enables lean storage, which prunes historical chain data to reduce disk usage. |
| `BURSA_CONNECTOR` | `false` | Enables the dApp connector backend. |

The wallet persists settings configured in its interface after the first run. After the wallet stores a setting, that value takes precedence over the environment variable.

## Build from source

Install Go `1.26` or later and Node `22`. Run the build commands from the repository root.

### Build the headless wallet

Build the web bundle and the default pure-Go binary with:

```bash
make wallet
```

The command writes the binary to `ui/bursa-wallet`. This build serves the interface over loopback and supports cross compilation.

### Build the native-window wallet

Build the native-window version with:

```bash
make wallet-webview
```

This target requires CGO, a C toolchain, and the webview development headers for the target platform:

- macOS: `WKWebView`
- Windows: `WebView2`
- Linux: `webkit2gtk`

The webview build does not support compilation for another target architecture. Build it on a machine with the target architecture. On Linux, the build can use `webkit2gtk-4.1`; the Makefile supplies a `pkg-config` shim when the upstream binding requests `4.0`.

### Package for macOS

Create a package for local testing with:

```bash
make bundle-macos
```

This target creates an ad hoc signed `.pkg`. Create the signed and notarized release package with:

```bash
make pkg-macos
```

The `pkg-macos` target requires the Apple signing and notarization secrets.

## Troubleshooting

### Synchronization is slow or appears stuck

1. Open **Settings → Diagnostics** to check node health, peer status, and synchronization state.
2. Export the diagnostics logs, or inspect the log file directly at `~/.bursa-wallet/<network>/logs/bursa-wallet.log`.

### The Linux webview window is blank

Install `webkit2gtk` and its development headers for the webview build. If the system lacks a webview, use the pure-Go browser build and open the loopback address.

### The wallet uses too much disk space

Enable lean storage on the first run:

```bash
BURSA_LEAN=true bursa-wallet
```

Lean storage expires historical chain data and reduces the on-disk footprint.

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>