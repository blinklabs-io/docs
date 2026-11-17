---
title: Check for Updates
description: How to check for and install Adder updates from the system tray.
---

# Check for Updates

## Overview

Adder can check for a newer release from the system tray. The `Software Update` window supports manual checks on every platform and automatic installation on macOS and Windows when the release provides an installer for the current architecture.

## Start a manual check

1. Open the system tray.
2. Right-click `Adder`.
3. Select `Check for Updates...`.

Adder opens the `Software Update` window and checks the latest published release. The window reports when Adder already has the newest version or when a newer version is available.

## Configure weekly checks

The `Software Update` window includes `Check for updates weekly` after it completes a check. The Notifications step in the setup wizard also includes this setting.

- Enable `Check for updates weekly` to let Adder check for updates automatically.
- Disable `Check for updates weekly` to stop automatic checks.

Adder runs an enabled automatic check at most once every seven days. The setting and the time of the last successful check persist in `adder-tray.yaml` as `check_updates_weekly` and `last_update_check`.

## Skip a release

When the window reports an available release, select `Skip This Version` to dismiss that release. Adder stores the skipped release value in `adder-tray.yaml` as `skipped_version`. The weekly check does not prompt for that release again.

## Install an update on macOS

1. Open `Check for Updates...` from the Adder tray menu.
2. Wait for the `Software Update` window to report an available release.
3. Verify that the window offers the `.pkg` installer for the current Mac architecture.
4. Select `Install and Relaunch`.
5. Wait for Adder to download the installer and verify its SHA-256 digest.
6. Select `Quit & Install` after Adder launches the installer. Adder quits so the installer can complete the update.

## Install an update on Windows

1. Open `Check for Updates...` from the Adder tray menu.
2. Wait for the `Software Update` window to report an available release.
3. Verify that the window offers the `.msi` installer for the current Windows architecture.
4. Select `Install and Relaunch`.
5. Wait for Adder to download the installer and verify its SHA-256 digest.
6. Select `Quit & Install` after Adder launches the installer. Adder quits so the installer can complete the update.

Adder downloads a matching `.pkg` or `.msi` installer only after the window presents an available release. Adder verifies the installer with its SHA-256 digest before launching it. A missing or invalid SHA-256 digest prevents installation.

## Update Linux and FreeBSD manually

Adder does not install updates automatically on Linux or FreeBSD. When the `Software Update` window reports an available release:

1. Select `Open Release Page`.
2. Download the package for the platform and architecture from the release page.
3. Install the downloaded package using the platform's normal installation procedure.

macOS and Windows also use `Open Release Page` when a release does not provide an installer for the current architecture. Adder never substitutes an installer for another architecture. The release page lists the supported platforms and architectures for manual installation.