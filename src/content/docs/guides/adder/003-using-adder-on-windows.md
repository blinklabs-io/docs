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
Use the `Wallets`, `DReps`, `Pools`, `Assets`, and `Policies` sections to add the targets to monitor. Add more than one value to any section. The wizard validates each value and reports malformed or duplicate entries inline.

Enable `Monitor Everything` to ignore all per-target lists, or leave it disabled and add at least one wallet, DRep, pool, asset, or policy. The wizard does not accept an empty target configuration.

Values within each populated section match with `OR`. The connector controls that appear between populated sections join those groups with `OR` or `AND`.

For this example, enter a Pool ID and a DRep ID to follow. 

<img src="/adder-windows-config-pool-id-drep-id.webp"
     alt="adder-windows-config-pool-id-drep-id"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

Set the visible connector between the populated groups to `OR` to receive an alert if either the Pool or DRep performs an event selected for tracking.

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
The wizard derives the available event alert checkboxes from the selected target kinds. Connection issue alerts remain available separately. Select the checkboxes for the events for which desktop alerts should appear. The wizard saves these notification preferences with the tray configuration.
<img src="/adder-windows-config-events.webp"
     alt="adder-windows-config-events"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

#### Advanced rate limiting
Expand `Advanced — Rate Limiting` to set `Max notifications per window` and `Window duration`. Enter a duration such as `5s`, `30s`, or `1m`. Leave the fields blank to use the defaults of one notification per five seconds. When the maximum is reached, Adder batches additional alerts into a single notification at the end of the window. Enter a negative maximum to disable coalescing.

> **Note:** On Windows, `%APPDATA%\Adder\adder-tray.yaml` is the authoritative file for tray targets and notification preferences. When no tray filter exists, Adder migrates legacy target keys from `engine.yaml` `filter.cardano` once. Applying the new plan removes those target keys from `engine.yaml`; changes to the legacy fields do not control tray monitoring.

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

### Congratulations! Adder will now alert you when an event that you have selected to track occurs.

***

## Using the Tray Menu
If you want to view recent events, adjust the configuration, or start, stop, or restart the app, you can right-click the Adder app in your system tray to adjust the settings as needed.

<img src="/adder-windows-tray-app-menu.webp"
     alt="adder-windows-tray-app-menu"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />





