---
title: Using Dingo with Cardano CLI
description: Dingo - How to use Dingo with Cardano CLI.
---

Dingo is a Cardano blockchain data node written in Go which actively participates in network communications on the Cardano blockchain using the Ouroboros Network Node-to-Node family of mini-protocols.

⚠️ This is a work in progress and is currently under heavy development

<br>

***

This guide covers downloading and running the Cardano CLI binary so it can inspect Dingo local state and ledger data through the Dingo node socket. To get started follow the steps below.

<br>

> ✅ For this guide we assume you have already downloaded Dingo and synced the chain. If not see our [Quick Start](../002-quick-start-overview) guide.

***

<br>

## Step 1 - Download the latest Cardano CLI binary 

First start by going to the Cardano CLI repo <a href="https://github.com/IntersectMBO/cardano-cli/releases" target="_blank">https://github.com/IntersectMBO/cardano-cli/releases</a> page.

You can either download the binary file and move the file to your preferred location or... 

<br>

Copy the path to the latest the Cardano CLI binary file and run the following command to download the binary file.

<br>

⚠️ For this example we put the Cardano-cli binary in our `dingo` folder. Adjust the link path to the correct path for the version you want to download. 

```
cd ~/dingo
wget https://github.com/IntersectMBO/cardano-cli/releases/download/cardano-cli-10.11.1.0/cardano-cli-10.11.1.0-x86_64-linux.tar.gz -O - | tar -xz
```

***

<br>

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

<br>

#### Congratulations the `cardano-cli` can now communicate with the node.

<br>

## Step 3 - Run Cardano CLI Command to Query Tip
Run a first Cardano CLI command to query the tip of the preview blockchain and confirm that the CLI can read data from the Dingo node.

We will run the following command to query the tip:

```
./cardano-cli query tip \
--testnet-magic 2 \
--socket-path dingo.socket
```
> ⚠️ Please note the socket path above assumes the Cardano CLI binary is in the `dingo` folder. If the `cardano-cli` binary is in a different location, adjust the path. Use `realpath dingo.socket` to find the absolute path to `dingo.socket`.

After this command succeeds, Cardano CLI and other compatible tools can target the same Dingo socket to inspect more of the ledger state than earlier versions supported. This includes delegation and reward account information, along with Conway era governance state where the client tooling supports those queries.

- Expect better answers from local state queries that read governance, committee, and proposal state, because Dingo now exposes substantially more complete Conway era query data than older guidance implied.
- Operators can also expose API oriented interfaces such as Blockfrost separately, but Cardano CLI still connects through the Dingo node socket path shown in this guide.

![dingo-query-tip](/dingo-query-tip.png)

***

<br>

## Step 4 - Using Environment Variables (Optional)
Instead of specifying the Cardano node network and Cardano node socket each time a `cardano-cli` command runs, use environment variables.

<br>

### Setting Environment Variables for Current Session (Option 1)

We can run the following commands to export the variable for our current session.

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
echo 'export CARDANO_NODE_SOCKET_PATH=~/dingo/dingo.socket' >> ~/.bashrc
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

### Congratulations the Dingo node is ready for Cardano CLI queries.
For node setup details, see the [Quick Start](../002-quick-start-overview) guide. For HTTP based access instead of node to client queries, see the API mode setup documentation. Learn more about the Cardano CLI at [https://developers.cardano.org](https://developers.cardano.org/docs/get-started/cli-operations/basic-operations/get-started/)
