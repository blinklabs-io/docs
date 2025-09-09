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

Sample config.yaml:

```
node:
  network: mainnet
  port: 8090
  socketPath: /home/user/cardano-my-node/db/socket
  backends: http://tx1, http://tx2, http://tx3
```

✅ `BACKENDS` is a comma separated list of HTTP Cardano transaction submission service API URIs

***

💡 Tip: To find the path to your node socket run the following command:

```
echo $CARDANO_NODE_SOCKET_PATH
```

<br>

More infomation on configuration file or Environment variables can be found here: [https://github.com/blinklabs-io/tx-submit-api-mirror](https://github.com/blinklabs-io/tx-submit-api-mirror)

***

## Step 5 - Run Tx Submit Mirror API With Config File

Run the executable file by running the following with the command line flag `-config` to set the file to load as a configuration.

⚠️ Adjust the file path below to match your path to the `config.yaml` file.

```
cd $NODE_HOME
./tx-submit-api-mirror -config /path/to/config.yaml
```

💡 Tip: You can hit `control`+`z` and then type `bg` to run in the background. Hit `fg` to bring back to the foreground

***

<br>

💡 Tip: You can check that Tx Submit Mirror API is running by using the following command. Please adjust port if needed.

```
curl http://localhost:8090/healthcheck
```

### Congratulations you are ready to start submitting transactions with Tx Submit Mirror API!

<br>

## Step 6 - Submit Transactions to your Tx Submit Mirror URL

Submit transactions to your Tx Submit Mirror API URL. It should look like `http://192.0.2.0:8090/api/submit/tx` ⚠️ Adjust to your IP and Port
