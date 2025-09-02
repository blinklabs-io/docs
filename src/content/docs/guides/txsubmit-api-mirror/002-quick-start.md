---
title: Quick Start Guide
description: Tx Submit API Mirror Quick Start Guide.
---

# Quick Start

Tx Submit API Mirror is a simple Cardano transaction submission API service which mirrors all incoming requests asynchronously to configured backend submission API services.

A simple HTTP API which accepts a CBOR encoded Cardano transaction as a payload body and submits it to one or more configured backend transaction submission API services.

Simply download the Tx Submit API Mirro binary file from blinklabs.io on to your node server. Configuration can be done using a config file or setting environment variables.  

To get started follow the steps below

⚠️ This guide assumes typical Linux Cardano Node setup. Please adjust commands and paths as needed.

***

## Step 1 - Download binary from Blinklabs  
<br>

**Step 1-A** - First start by going to <a href="https://blinklabs.io/projects-open-source" target="_blank">https://blinklabs.io/projects-open-source</a> and scroll down to Tx Submit API Mirror.  

![txsubmit-mirror-blinklabs-site](/txsubmit-mirror-blinklabs-site.png)
<br>

**Step 1-B** - Select the operating system of your node server.  

![txsubmit-mirror-blinklabs-site-operating-system](/txsubmit-mirror-blinklabs-site-operating-system.png)
<br>

**Step 1-C** - You can either download the binary file and move the file to your node server or...  

![txsubmit-mirror-blinklabs-site-download](/txsubmit-mirror-blinklabs-site-download.png)

<br>

Copy the path from Blinklabs and run the following command to download the binary file on your node server  

![txsubmit-mirror-blinklabs-site-copy-link](/txsubmit-mirror-blinklabs-site-copy-link.png)

<br>

⚠️ Adjust the link path to the correct path for the version you want to download. 

> 💡 Tip: You can download the latest Tx Submit API Mirror release from the <a href="https://github.com/blinklabs-io/tx-submit-api-mirror/releases" target="_blank">https://github.com/blinklabs-io/tx-submit-api-mirror/releases</a> page.  

```
wget -O - https://github.com/blinklabs-io/tx-submit-api-mirror/releases/download/v0.8.1/tx-submit-api-mirror-v0.8.1-linux-amd64 > tx-submit-api-mirror
```

***

## Step 2 - Change Permissions

For this example, we named the binary file `tx-submit-api-mirror` and saved the file to our `$NODE_HOME` folder. To make the file executable run the following command:

⚠️ Adjust the file path and file name if needed. 

```
chmod +x $NODE_HOME/tx-submit-api-mirror
```

***

## Step 3 - Open Firewall to your Selected Port

Make sure your firewall is open on the port you selected. For this example, we used port 8090. To open the port on 8090 we run the following command:

`
sudo ufw allow 8090/tcp
`

***

## Step 4 - Setup Config File
