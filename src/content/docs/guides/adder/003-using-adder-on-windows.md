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
Enter the information that you would like to monitor. For example, Wallet Address, Policy ID, Asset Fingerprint, Pool ID, and/or DRep ID.

For this example, we will enter a Pool ID and a DRep ID that we want to follow. 

<img src="/adder-windows-config-pool-id-drep-id.webp"
     alt="adder-windows-config-pool-id-drep-id"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

Select `OR` to receive an alert if either the Pool or DRep performs an event you have selected to track.

<img src="/adder-windows-config-or.webp"
     alt="adder-windows-config-or"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

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
Select the checkboxes for the events for which you would like to receive a desktop alert.
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

### Congratulations! Adder will now alert you when an event that you have selected to track occurs.

***

## Using the Tray Menu
If you want to view recent events, adjust the configuration, or start, stop, or restart the app, you can right-click the Adder app in your system tray to adjust the settings as needed.

<img src="/adder-windows-tray-app-menu.webp"
     alt="adder-windows-tray-app-menu"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

Select `Notification Rules...` to edit monitoring targets and notification categories. Select `Apply & Restart` to save the changes and apply them to the running monitoring engine without relaunching the tray. See the [tray configuration reference](../007-tray-configuration-reference) for target formats and connector behavior.

Select `Recent Events` to review recent notifications. Transaction and governance entries open transaction explorer pages, while block entries open block explorer pages. Adder uses the event's network when it builds each link. When the tray reconnects, it requests replayed events from `/events?replay=true` and avoids adding duplicate entries to the list.

Select `Show Logs` to open the log folder. Windows stores tray diagnostics in `%LOCALAPPDATA%\Adder\Logs\adder-tray.log`.

Select `About` to open an in-app dialog that shows the running Adder version. If Adder includes commit metadata, the dialog displays `Version: <version> (commit: <hash>)`; otherwise, it displays `Version: <version>`.

## Troubleshooting

### The Windows app fails to start or run

The Windows GUI has no normal console, so it records startup failures and failures while running in the log file. This includes panic details and graphics initialization failures. Review the file before retrying the operation.

### A second tray launch exits immediately

Windows runs only one Adder tray instance per logon session. If a second launch exits immediately, check whether the existing Adder tray instance is already running in the system tray.

### Applying notification rules shows a warning

When a restart or reconnection cannot complete immediately, Adder saves the configuration, keeps the Notification Rules editor open, and enables its controls again. Check the tray status and the log file, then select `Apply & Restart` again.


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
