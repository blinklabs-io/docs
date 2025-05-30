---
title: Quick Start Guide
description: Cardano Node API Quick Start Overview.
---

# Quick Start

An HTTP API for interfacing with a local Cardano Node and providing the node internal data for HTTP clients. This service communicates with a Cardano full node using the Ouroboros network protocol via a UNIX socket and exposes the underlying Node-to-Client (NtC) Ouroboros mini-protocols to clients via a REST API or UTxO RPC gRPC API.

<br>

Cardano Node API is a service written in Go which communicates with a Cardano Node over its private interface and provides a featureful set of HTTP APIs built on collaborative standards.

<br>

Simply download the Cardano Node API binary file from blinklabs.io on to your node server. Then run Cardano Node API in the server command line. Configuration can be done using a config file or setting environment variables. In this example we will run it with a config file.

<br>

To get started follow the steps below

<br>

⚠️ This guide assumes typical Linux Cardano Node setup. Please adjust commands and paths as needed.

***

<br>

## Step 1 - Download binary from Blinklabs  
<br>

**Step 1-A** - First start by going to <a href="https://blinklabs.io/projects-open-source" target="_blank">https://blinklabs.io/projects-open-source</a> and scroll down to Cardano Node API.  

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

## Step 4 - Setup Config File

<br>

Sample config.yaml:

```
node:
  network: mainnet
  port: 8080
  socketPath: /home/user/cardano-my-node/db/socket
```

<br>

***

💡 Tip: To find the path to your node socket run the following command:

```
echo $CARDANO_NODE_SOCKET_PATH
```

<br>

A detailed breakdown of the configuration file can be found here: [https://github.com/blinklabs-io/cardano-node-api/blob/main/config.yaml.example](https://github.com/blinklabs-io/cardano-node-api/blob/main/config.yaml.example)


***

<br>

## Step 5 - Run Cardano Node API With Config File

<br>

Run the executable file by running the following with the command line flag `-config` to set the file to load as a configuration.

⚠️ Adjust the file path below to match your path to the `config.yaml` file.

```
cd $NODE_HOME
./cardano-node-api -config /path/to/config.yaml
```

<br>

💡 Tip: You can hit `control`+`z` and then type `bg` to run in the background. Hit `fg` to bring back to the foreground

***

<br>


💡 Tip: You can check the Cardano Node API by going to your IP:port/swagger/index.html. Please adjust IP and your port if needed.

```
http://192.0.2.0:8080/swagger/index.html
```

<br>

![cardano-node-api-swagger](/cardano-node-api-swagger.png)

<br>

### Congratulations you are ready to start using Cardano Node API!

<br>

Learn more about UTxO RPC [https://utxorpc.org](https://utxorpc.org/)


