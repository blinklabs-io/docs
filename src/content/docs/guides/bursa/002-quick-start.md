---
title: Quick Start Guide
description: Bursa Quick Start Overview.
---

# Bursa

A programmatic Cardano wallet, written in Go, which exposes an API, CLI, and library interface, allowing developers to easily integrate wallet functionality.

Simply download the Bursa binary file from blinklabs.io. Then run the Bursa in the command line or API.

<br>

To get started follow the steps below

<br>

⚠️ This guide assumes typical Linux setup. Please adjust commands and paths as needed.

***

<br>

## Step 1 - Download binary from Blinklabs  
<br>

**Step 1-A** - First start by going to <a href="https://blinklabs.io/projects-open-source" target="_blank">https://blinklabs.io/projects-open-source</a> and scroll down to Bursa.

<!--

![cardano-node-api-blinklabs-site](/cardano-node-api-blinklabs-site.png)
<br>

**Step 1-B** - Select the operating system of your node server.  

![cardano-node-api-blinklabs-site-operating-system](/cardano-node-api-blinklabs-site-operating-system.png)
<br>

**Step 1-C** - You can either download the binary file and move the file to your node server or...  

![cardano-node-api-blinklabs-site-download](/cardano-node-api-blinklabs-site-download.png)

<br>

Copy the path from Blinklabs and run the following command to download the binary file on your node server  

![cardano-node-api-blinklabs-site-copy-link](/cardano-node-api-blinklabs-site-copy-link.png)

<br>

⚠️ Adjust the link path to the correct path for the version you want to download. 

```
wget -cO - https://github.com/blinklabs-io/cardano-node-api/releases/download/v0.8.4/cardano-node-api-v0.8.4-linux-amd64 > cardano-node-api
```

***

<br>

## Step 2 - Change Permissions

<br>

For this example, we named the binary file `cardano-node-api` and saved the file to our `$NODE_HOME` folder. To make the file executable run the following command:

<br>

⚠️ Adjust the file path and file name if needed. 

```
chmod +x $NODE_HOME/cardano-node-api
```

***

<br>

## Step 3 - Open Firewall to your Selected Port

<br>

Make sure your firewall is open on the port you selected. For this example, we used port 8080. To open the port on 8080 we run the following command:

```
sudo ufw allow 8080/tcp
```

***

<br>

-->
