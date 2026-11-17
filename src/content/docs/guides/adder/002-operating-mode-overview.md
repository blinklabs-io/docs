---
title: Operating Mode Overview
description: Adder Operating Mode Overview. Adder supports two primary operating modes, Adder Tray and Adder CLI.  
---

Adder offers two distinct operating modes, each optimized for different types of users and deployment environment. Choosing the right mode ensures you get the correct balance of usability, configurability, and operational control.

## 1. Adder Tray (Windows & macOS)

Adder Tray is a packaged desktop application that runs in the system tray and provides a streamlined, user‑friendly experience for monitoring Cardano blockchain activity.

- [Windows Install Guide](../003-using-adder-on-windows)
- [Mac Install Guide](../004-use-adder-on-mac)

### Key Characteristics:
- Delivered as signed installers (`.msi` for Windows, `.pkg` for macOS).
- Automatic OS integration, including:
  - System tray menu
  - Guided setup wizard
  - Notification permissions
  - Background service management
- Simplified configuration:
  - Users select Wallets, DReps, and Pools as monitoring targets, with optional Assets and Policies.
  - Adder Tray uses the selected targets to determine notification options.
- No YAML or CLI required — ideal for non‑technical users.

### Use Cases: 
- SPOs or delegators who want simple notifications.
- Governance participants monitoring votes or proposals.
- Users who prefer GUI‑based configuration over command‑line tools.

## 2. Adder CLI / Event Monitor (Linux Binary)

The Adder command‑line binary provides full access to Adder’s event‑processing pipeline. This mode is designed for operators, developers, and integrators who want more control over how events are filtered and emitted.

- [Linux Guide](../005-use-adder-on-linux)

### Key Characteristics:
- Install via binary download
- Full configuration flexibility using:
  - Command‑line flags
  - YAML configuration files
  - Environment variables
- Complete access to all input/output plugins, including:
  - chainsync, mempool, ntn, ntc inputs
  - log, push, webhook, and other outputs
- Fine‑grained event filtering, supporting:
  - Event type
  - Wallet address
  - Stake address
  - Asset fingerprint
  - Policy ID
  - Pool ID and more
- Suitable for automation, scripting, and integration with external systems.

### Use Cases: 
- SPO infrastructure monitoring.
- Custom indexers or analytics pipelines.
- Automated alerting systems (webhooks, push notifications, JSON pipelines).
- Developers embedding Adder as a Go library

## 3. Adder Managed Routing (Opt In)

Adder Managed Routing is an operator mode for deployments that send one `ChainSync` stream through separate customer filter paths to named destinations. Enable it with `--managed-config-dir`. Without this flag, Adder keeps the existing CLI and embedded pipeline behavior as the default.

Use managed routing when multiple customers need isolated filters and destinations. Configure `chainsync` with `intersect-tip=true` and `auto-reconnect=true`. Do not configure `state-path` or `intersect-point`. Managed mode does not start the ordinary public `/events` API and rejects global filters.

Managed mode exposes a private configuration and status API that requires authentication. It supports only the managed `log` and `webhook` adapters. Bounded queues keep one slow customer or destination from blocking other lanes; full queues record drops. See [Managed customer routing](014-managed-routing.md) for configuration, API, and limits.

## Quick Decision Matrix

| Requirement | Recommended Mode |
| --- | --- |
| Simple notifications | **Adder Tray** |
| No CLI experience | **Adder Tray** |
| Full customization | **Adder CLI** |
| Managed customer routing | **Adder Managed Routing** |
| Default CLI or embedded pipeline behavior | **Adder CLI** |
| YAML configuration | **Adder CLI** |
| Webhooks / JSON outputs | **Adder CLI** |
| OS‑native notifications | **Adder Tray** |
| Running on Linux | **Adder CLI** |
| Integrating with scripts or services | **Adder CLI** |
| GUI‑based setup | **Adder Tray** |

## Adder Tray Guides (Windows & macOS)

- [Windows Install Guide](../003-using-adder-on-windows)
- [Mac Install Guide](../004-use-adder-on-mac)


## Adder CLI / Event Monitor Guides (Linux)

- [Linux Guide](../005-use-adder-on-linux)



---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
