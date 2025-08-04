---
title: Using Dingo with Cardano CLI
description: Dingo - How to use Dingo with Cardano CLI.
---

Dingo is a Cardano blockchain data node written in Go which actively participates in network communications on the Cardano blockchain using the Ouroboros Network Node-to-Node family of mini-protocols.

⚠️ This is a work in progress and is currently under heavy development

<br>

For this guide we will walk you through downloading and running the Cardano CLI binary and running some Cardano CLI commands. To get started follow the steps below.

<br>

> ✅ For this guide we assume you have already downloaded Dingo and synced the chain. If not see our [Quick Start](../../002-quick-start-overview) guide.

***

## Step 1 - Download the latest Cardano CLI binary 

First start by going to the Cardano CLI repo <a href="https://github.com/IntersectMBO/cardano-cli/releases" target="_blank">https://github.com/IntersectMBO/cardano-cli/releases</a> page.

You can either download the binary file and move the file to your preferred location or... 

<br>

Copy the path to the latest the Cardano CLI binary file and run the following command to download the binary file.

<br>

⚠️ For this example we put the Cardano-cli binary in our `dingo` folder. Adjust the link path to the correct path for the version you want to download. 

```
cd ~/dingo
wget -c https://github.com/IntersectMBO/cardano-cli/releases/download/cardano-cli-10.11.1.0/cardano-cli-10.11.1.0-x86_64-linux.tar.gz -O - | tar -xz
```

***

## Step 2 - Rename File and Change Permissions for the Cardano CLI 

For this example, we will name the binary file `cardano-cli`. To rename the binary will we run the following:

⚠️ Adjust the file path and file name if needed. 

```
mv cardano-cli-x86_64-linux cardano-cli
```

<br>

To make the file executable run the following command:

```
chmod +x cardano-cli
```

***

#### Congratulations we can now use the cardano-cli to communicate with the node.

## Step 3 - Run  Cardano CLI Command to Query Tip
Let run our first Cardano CLI command to query the tip of the preview blockchain using Dingo node to provide the data.  

We will run the following command to query the tip:

```
./cardano-cli query tip \
--testnet-magic 2 \
--socket-path dingo.socket
```
> ⚠️ Please note the socket-path above assumes you downloaded Cardano CLI to your dingo folder. If you put cardano-cli binary in a different location, please adjust the path. You can use `realpath dingo.socket` to find the absolute path to your dingo.socket.

![dingo-query-tip](/dingo-query-tip.png)

***

## Step 4 - Using Environment Variables (Optional)
Instead of specifying the Cardano Node Network and Cardano Node Socket each time we run a cardano-cli command we can use environment variables.

### Setting Environment Variables for Current Session

We can run the following commands to export the variable for our current session.

Socket Path:

```
export CARDANO_NODE_SOCKET_PATH=~/dingo/dingo.socket
```

Node Network:

```
export CARDANO_NODE_NETWORK_ID=2
```

### Setting Environment Variables Permanently
To make an environment variable persistent across sessions, you need to add it to your shell's configuration file.

Socket Path:

```
echo CARDANO_NODE_SOCKET_PATH=~/dingo/dingo.socket >> ~/.bashrc
```

Node Network:

```
echo export CARDANO_NODE_NETWORK_ID=2 >> ~/.bashrc
```

***

<br>

> 💡 Tip: Below are the current Network IDs
> ```
> # SanchoNet testnet
> export CARDANO_NODE_NETWORK_ID=4
>
> # Preview testnet
> export CARDANO_NODE_NETWORK_ID=2
>
> # Pre-production testnet
> export CARDANO_NODE_NETWORK_ID=1
>
> # Mainnet
> export CARDANO_NODE_NETWORK_ID=mainnet
> ```

***

### Congratulations you are ready to start using Dingo node with the Cardano CLI!
[Learn more about the Cardano CLI at https://developers.cardano.org](https://developers.cardano.org/docs/operate-a-stake-pool/cli-operations/basic-operations/get-started)
