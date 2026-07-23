---
title: Using Dingo with Cardano CLI
description: Dingo - How to use Dingo with Cardano CLI.
---

Dingo is a Cardano blockchain node written in Go which actively participates in network communications on the Cardano blockchain using the Ouroboros Network Node-to-Node family of mini-protocols.

⚠️ Dingo is a work in progress and is currently under heavy development

<br>

***

In this guide, we will walk you through downloading and running the Cardano CLI binary, then demonstrate several Cardano CLI commands. To get started follow the steps below.

<br>

> ✅ This guide we assume you have already downloaded Dingo and synced the blockchain. If not see our [Quick Start](../002-quick-start-overview) guide.

***

<br>

## Step 1 - Download the latest Cardano CLI binary 

First, go to the Cardano CLI repo <a href="https://github.com/IntersectMBO/cardano-cli/releases" target="_blank">https://github.com/IntersectMBO/cardano-cli/releases</a> page.

You can either download the binary and move the file to your preferred location or... 

<br>

Copy the download URL for the latest Cardano CLI binary and run the following command:

<br>

⚠️ For this example we place the `cardano-cli` binary in our `~dingo` directory. Adjust the link path to the correct path for the version you want to download. 

```
cd ~/dingo
wget https://github.com/IntersectMBO/cardano-cli/releases/download/cardano-cli-11.0.0.0/cardano-cli-11.0.0.0-x86_64-linux.tar.gz -O - | tar -xz
```

***

<br>

## Step 2 - Rename the Cardano CLI Binary and Set Execute Permissions 

To make the file executable run the following command:

```
chmod +x cardano-cli-x86_64-linux
```

<br>

For this example, we will rename the binary to `cardano-cli` and move it to `/usr/local/bin/`:

⚠️ Adjust the file path and file name if needed. 

```
sudo mv cardano-cli-x86_64-linux /usr/local/bin/cardano-cli
```

***

<br>

#### Congratulations! You can now use cardano-cli to communicate with your Dingo node.

<br>

## Step 3 - Run  Cardano CLI Command to Query Tip
Let's run our first Cardano CLI command to query the tip of the Preview network using the Dingo node.  

Run the following command to query the tip:

```
./cardano-cli query tip \
--testnet-magic 2 \
--socket-path dingo.socket
```
> ⚠️ Please note: The `--socket-path` shown above assumes you downloaded cardano-cli into your `~/dingo` directory. If you installed cardano-cli elsewhere, adjust the path accordingly. You can use `realpath dingo.socket` to determine the absolute path to `dingo.socket`.

![dingo-query-tip](/dingo-query-tip.png)

***

<br>

## Step 4 - Using Environment Variables (Optional)
Instead of specifying the Cardano network and node socket each time you run a cardano-cli command, you can use environment variables.

<br>

### Setting Environment Variables for Current Session (Option 1)

Run the following commands to export the variable for our current session.

Socket Path:

```
export CARDANO_NODE_SOCKET_PATH=~/dingo/dingo.socket
```

Node Network:

```
export CARDANO_NODE_NETWORK_ID=2
```

<br>

### Setting Environment Variables Permanently (Option 2)
To make an environment variable persistent across sessions, you need to add it to your shell's configuration file.

Socket Path:

```
echo export CARDANO_NODE_SOCKET_PATH=~/dingo/dingo.socket >> ~/.bashrc
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

<br>

### Congratulations! You are now ready to use your Dingo node with the Cardano CLI!
Learn more about the Cardano CLI at [https://developers.cardano.org](https://developers.cardano.org/docs/get-started/cli-operations/basic-operations/get-started/)
