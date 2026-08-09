---
title: Operating Mode Overview
description: Adder Operating Mode Overview. Adder supports two primary operating modes, Adder Tray and Adder CLI.  
---

Adder offers two distinct operating modes, each optimized for different types of users and deployment environment. Choosing the right mode ensures you get the correct balance of usability, configurability, and operational control.

## 1. Adder Tray (Windows & macOS)

Adder Tray is a packaged desktop application that runs in the system tray and provides a streamlined, user‑friendly experience for monitoring Cardano blockchain activity.

### Key Characteristics:
- Delivered as signed installers (`.msi` for Windows, `.pkg` for macOS).
- Automatic OS integration, including:
  - System tray menu
  - Guided setup wizard
  - Notification permissions
  - Background service management
- Simplified configuration:
  - Users select targets (addresses, stake keys, pool IDs, DReps, etc.)
  - Adder Tray applies predefined notification type
- No YAML or CLI required — ideal for non‑technical users.

### Use Cases: 
- SPOs or delegators who want simple notifications.
- Governance participants monitoring votes or proposals.
- Users who prefer GUI‑based configuration over command‑line tools.

## 2. Adder CLI / Event Monitor (Linux Binary)

The Adder command‑line binary provides full access to Adder’s event‑processing pipeline. This mode is designed for operators, developers, and integrators who want more control over how events are filtered and emitted.

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

## Quick Decision Matrix
| Requirement | Recommended Mode |
| --- | --- |
| Simple notifications | **Adder Tray** |
| No CLI experience | **Adder Tray** |
| Full customization | **Adder CLI** |
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

