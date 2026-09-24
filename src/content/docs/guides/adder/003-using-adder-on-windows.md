---
title: Using on Windows
description: How to use Adder on Windows.
---

Adder is a packaged desktop application that runs in the system tray and provides a streamlined, user‑friendly experience for monitoring Cardano blockchain activity.

## Install and Configure

### Step 1.1 - Download the Adder Installer
The easiest way to install Adder on Windows is by using the MSI installer available at <a href="https://blinklabs.io/projects-open-source" target="_blank">https://blinklabs.io/projects-open-source</a>. <br>

<img src="/adder-windows-release-download.webp"
     alt="adder-windows-release-download"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />
 
> Select the appropriate version for your system (Windows x64 or Windows arm64).

***

### Step 1.2 - Once the download is complete, click `Open` to open the `.msi` file.
<img src="/adder-windows-open-msi.webp"
     alt="adder-windows-open-msi"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

***

### Step 1.3 - Then click `Run` to start the installation.
<img src="/adder-windows-run-msi.webp"
     alt="adder-windows-run-msi"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

Release MSIs are signed and install both `adder.exe` (the command-line application) and `adder-tray.exe` (the tray application) under `%ProgramFiles%\Adder`. The installer creates an `Adder` shortcut in the Windows Start Menu and adds Adder to Windows **Apps & Features** or **Add/Remove Programs**.

The MSI does not register a Scheduled Task or independently enable automatic startup. The tray setup wizard owns the per-user startup setting described in [Step 4](#step-4---startup-and-background-activity).

Locally built or test MSIs may be unsigned, so Windows SmartScreen or an unknown-publisher warning may appear when they launch.

***

### Step 2 - Launch Adder

### Step 2.1 - Open the Windows Start Menu.

<img src="/adder-windows-start-menu.webp"
     alt="adder-windows-start-menu"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

***

### Step 2.2 - Search for `Adder`
Search for the Adder app and open it. 


<img src="/adder-windows-search-adder-app.webp"
     alt="adder-windows-search-adder-app"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

>If you don't see the configuration **Welcome** screen, open your system tray, right-click the Adder app, and select **Configure** to open the setup wizard.

***

### Step 3 - Configure Adder
Once you open the *Adder Tray App*, you will see the **Welcome** screen, which will guide you through the steps to configure Adder and set up the alerts you want to receive.

<img src="/adder-windows-config-welcome.webp"
     alt="adder-windows-config-welcome"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

***

### Step 3.1 - Select a Cardano network that you want to monitor.
<img src="/adder-windows-config-network.webp"
     alt="adder-windows-config-network"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />
***

### Step 3.2 - Add Your Monitoring Targets
Select one monitoring mode:

- Enable `Monitor Everything` to monitor all supported events. This option ignores all values in the target sections.
- Disable `Monitor Everything` and enter at least one value in the appropriate `Wallets`, `DReps`, `Pools`, `Assets`, or `Policies` section.

Enter the target value in the form accepted by its section:

- `Wallets`: a payment address or stake address.
- `DReps`: a bech32 or hexadecimal DRep ID.
- `Pools`: a bech32 or hexadecimal pool ID.
- `Assets`: a CIP-14 asset fingerprint.
- `Policies`: a 56-character hexadecimal policy ID.

For this example, we will enter a Pool ID and a DRep ID that we want to follow. 

<img src="/adder-windows-config-pool-id-drep-id.webp"
     alt="adder-windows-config-pool-id-drep-id"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

Values within one target section act as alternatives. The visible `OR` and `AND` controls join populated target sections. Select `OR` when either section can produce the matching event. Do not use `AND` between different event families. `Pools` match blocks, `Wallets`, `Assets`, and `Policies` match transactions, and `DReps` match governance events. No single event can satisfy an `AND` between these families, and the wizard rejects such a configuration.

<img src="/adder-windows-config-or.webp"
     alt="adder-windows-config-or"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

See the [tray configuration reference](../007-tray-configuration-reference) for the available target and notification settings.

***

### Step 3.3 - Notification Output (Optional)
Adder is already configured to provide desktop notifications. You can select other notification methods if you choose. 
<img src="/adder-windows-config-output.webp"
     alt="adder-windows-config-output"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

***

**Then click `Next Step`**

***

### Step 3.4 - Event Alerts
Adder scopes event alerts to the selected target groups. Select the categories that should produce desktop alerts. Enable `Notify on connection issues` separately when connection status alerts are required.

Open `Advanced — Rate Limiting` to control the maximum notifications per window and the window duration. Leave a field blank to use its default; the defaults are one notification per five seconds. Enter a negative limit to disable notification coalescing. Enter a window value using Go duration syntax, such as `5s`, `30s`, or `1m`.

<img src="/adder-windows-config-events.webp"
     alt="adder-windows-config-events"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

***

### Step 3.5 - Send a Test Notification

Click `Test Notification` to confirm that you are receiving desktop alerts.
<img src="/adder-windows-config-send-test.webp"
     alt="adder-windows-config-send-test"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

If you see the notification, click `Yes, I saw it`.

***

### Step 3.6 - Finish Setup
Click `Finish Setup`.

***

### Step 4 - Startup and Background Activity
Select the `Start Adder automatically on login / reboot` checkbox to start Adder automatically for the current Windows user. Clear the checkbox to disable automatic startup. The tray wizard stores this choice in the current user's startup registration. The tray runs the Adder engine in the background without opening a window, and the installer does not need administrator elevation for this setting.

The background activity status shows one of these states:

- `Background Activity: Registered & Running (io.blinklabs.adder)` means that startup is registered and the Adder engine is running.
- `Background Activity: Registered (io.blinklabs.adder)` means that startup is registered but the engine is not running.
- `Background Activity: Not registered` means that startup is disabled.
- `Background Activity: Status unknown` means that Adder could not determine the startup status.

Select `Open Login Items Settings...` to open the Windows startup settings and review Adder's startup registration.

***

### Congratulations! Adder will now alert you when an event that you have selected to track occurs.

***

## Using the Tray Menu
If you want to view recent events, adjust the configuration, or start, stop, or restart the app, you can right-click the Adder app in your system tray to adjust the settings as needed.

<img src="/adder-windows-tray-app-menu.webp"
     alt="adder-windows-tray-app-menu"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

Select `Notification Rules...` to edit monitoring targets and notification categories. Select `Apply & Restart` to save the changes and apply them to the running monitoring engine without relaunching the tray. See the [tray configuration reference](../007-tray-configuration-reference) for target formats and connector behavior.

Select `Recent Events` to review recent notifications. Transaction and governance entries open transaction explorer pages, while block entries open block explorer pages. Adder uses the event's network when it builds each link. When the tray reconnects, it requests replayed events from `/events?replay=` and avoids adding duplicate entries to the list.

Select `Show Logs` to open the log folder. Windows stores tray diagnostics in `%LOCALAPPDATA%\Adder\Logs\adder-tray.log`.

Select `About` to open an in-app dialog that shows the running Adder version. If Adder includes commit metadata, the dialog displays `Version: <version> (commit: <hash>)`; otherwise, it displays `Version: <version>`.

## Troubleshooting

### Windows GUI startup or runtime failures

The Windows GUI has no normal console, so it records startup and runtime failures in `%LOCALAPPDATA%\Adder\Logs\adder-tray.log`. This includes panic information and graphics initialization failures. Open the log folder with `Show Logs` and review the file before retrying the operation.

### A second tray launch exits immediately

Windows runs only one Adder tray instance per logon session. If a second launch exits immediately, check whether the existing Adder tray instance is already running in the system tray.

### Applying notification rules shows a warning

When a restart or reconnection cannot complete immediately, Adder saves the configuration, keeps the Notification Rules editor open, and re-enables its controls. Check the tray status and `%LOCALAPPDATA%\Adder\Logs\adder-tray.log`, then select `Apply & Restart` again.


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
