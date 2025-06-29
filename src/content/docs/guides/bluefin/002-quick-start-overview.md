---
title: Quick Start Guide
description: Bluefin Quick Start Overview.
---

# Bluefin

Bluefin a standalone Fortuna (TUNA) miner, written in Go, which syncs the chain, mines for TUNA, and submits transactions to remote nodes without any other infrastructure..

Bluefin is self-contained and runs with no external dependencies. You can run it via the <a href="https://github.com/blinklabs-io/bluefin/pkgs/container/bluefin" target="_blank">Docker images</a> or binaries from the <a href="https://github.com/blinklabs-io/bluefin/releases" target="_blank">releases page</a>.

<br>

For this guide we will walk you through downloading the binary and running the Bluefin binary. To get started follow the steps below.

<br>

⚠️ This guide assumes typical Linux setup. Please adjust commands and paths as needed.

***

<br>

## Step 1 - Download binary from Blinklabs  
<br>

**Step 1-A** - First start by going to <a href="https://blinklabs.io/projects-open-source" target="_blank">https://blinklabs.io/projects-open-source</a> and scroll down to Bluefin.

![bluefin-blinklabs-site](/bluefin-blinklabs-site.png)
<br>


**Step 1-B** - Select the operating system that you want to use to run Bluefin.  

![bluefin-blinklabs-site-operating-system](/bluefin-blinklabs-site-operating-system.png)
<br>

**Step 1-C** - You can either download the binary file and move the file to your preferred location or...  

![bluefin-blinklabs-site-download](/bluefin-blinklabs-site-download.png)

<br>

Copy the path from Blinklabs and run the following command to download the binary file.  

<br>

⚠️ Adjust the link path to the correct path for the version you want to download. 

> 💡 Tip: You can download the latest Bluefin release from the <a href="https://github.com/blinklabs-io/bluefin/releases" target="_blank">https://github.com/blinklabs-io/bluefin/releases</a> page.

```
wget -cO - https://github.com/blinklabs-io/bluefin/releases/download/v0.13.3/bluefin-v0.13.3-linux-amd64 > bluefin
```

***

<br>

## Step 2 - Change Permissions

<br>

For this example, we named the binary file `bluefin`. To make the file executable run the following command:

<br>

⚠️ Adjust the file path and file name if needed. 

```
chmod +x bluefin
```

***

<br>
