---
title: Quick Start Guide
description: Dingo Quick Start Overview.
---

# Dingo

A Cardano blockchain data node written in Go which actively participates in network communications on the Cardano blockchain using the Ouroboros Network Node-to-Node family of mini-protocols.

⚠️ This is a work in progress and is currently under heavy development

<br>

For this guide we will walk you through downloading and running the Dingo binary. To get started follow the steps below.

<br>

✅ This guide assumes typical Linux setup. Please adjust commands and paths as needed.

***

<br>

## Step 1 - Download binary from Blinklabs  
<br>

**Step 1-A** - First start by going to <a href="https://blinklabs.io/projects-open-source" target="_blank">https://blinklabs.io/projects-open-source</a> and scroll down to Dingo.

![dingo-blinklabs-site](/dingo-blinklabs-site.png)
<br>


**Step 1-B** - Select the operating system that you want to use to run Dingo.  

![dingo-blinklabs-site-operating-system](/dingo-blinklabs-site-operating-system.png)
<br>

**Step 1-C** - You can either download the binary file and move the file to your preferred location or...  

![dingo-blinklabs-site-download](/dingo-blinklabs-site-download.png)

<br>

Copy the path from Blinklabs and run the following command to download the binary file.  

<br>

⚠️ Adjust the link path to the correct path for the version you want to download. 

> 💡 Tip: You can download the latest Dingo release from the <a href="https://github.com/blinklabs-io/dingo/releases" target="_blank">https://github.com/blinklabs-io/dingo/releases</a> page.

```
mkdir dingo
cd dingo
wget -c https://github.com/blinklabs-io/dingo/releases/download/v0.13.0/dingo-v0.13.0-linux-amd64.tar.gz -O - | tar -xz
```

***

## Best Practices - Files Needed to Run Dingo
1. dingo.yaml
2. Node Config
3. Node Topology
4. Byron Genesis
5. Shelley Genesis
6. Alonzo Genesis
7. Conway Genesis

> ✅ Cardano Configuration Files can be found at <a href="https://book.play.dev.cardano.org/environments.html" target="_blank">https://book.play.dev.cardano.org/environments.html</a>

## Step 2 - Download dingo.yaml Example File

For this guide we will use the dingo.yaml file. We will download it to our main dingo directory by using the following command:
```
wget -cO - https://raw.githubusercontent.com/blinklabs-io/dingo/refs/heads/main/dingo.yaml.example > dingo.yaml
```

## Step 3 - Create Directory and Download Configuration Files

We will create a directory to store our Cardano Configuration Files. For this example the file structure we will create is `/config/cardano/preview/` by running the following command:

```
mkdir -p config/cardano/preview
```

Now we will navigate to the `config/cardano/preview` folder and download the Cardano Configuration Files

```
cd config/cardano/preview
```

We will now download the Cardano Preview Testnet Non-block-producers config file by running:

```
wget https://book.play.dev.cardano.org/environments/preview/config.json
```

Next we will download the Preview Testnet Topology file by running:

```
wget https://book.play.dev.cardano.org/environments/preview/topology.json
```

✅ For this example we will use the default topology file, as seen below, just to get the node running and synced. Dingo supports all current and legacy topology files.

```
{
  "bootstrapPeers": [
    {
      "address": "preview-node.play.dev.cardano.org",
      "port": 3001
    }
  ],
  "localRoots": [
    {
      "accessPoints": [],
      "advertise": false,
      "trustable": false,
      "valency": 1
    }
  ],
  "publicRoots": [
    {
      "accessPoints": [],
      "advertise": false
    }
  ],
  "useLedgerAfterSlot": 73267000
}
```

Lastly we will download the Byron, Shelley, Alonzo, and Conway Genesis files

```
wget https://book.play.dev.cardano.org/environments/preview/byron-genesis.json \
https://book.play.dev.cardano.org/environments/preview/shelley-genesis.json \
https://book.play.dev.cardano.org/environments/preview/alonzo-genesis.json \
https://book.play.dev.cardano.org/environments/preview/conway-genesis.json
```

## Step 4 - Edit dingo.yaml File

Now that we have the configuration files needed, we will edit the dingo.yaml file to point to the right directories and files. To edit this file, we will run:

> ✅ For this example we save the dingo.yaml file to our main dingo directory so we will use `cd dingo` to return to that directory, please adjust path and file name if needed.

```
cd dingo
sudo nano dingo.yaml
```

We will add a path to our topology file and double check our path to our Cardano config.json file. If you used a different path than `/config/cardano/preview` please adjust as needed.

```
# Example config file for dingo
# The values shown below correspond to the in-code defaults

# Public bind address for the Dingo server
bindAddr: "0.0.0.0"

# Path to the Cardano node configuration file
#
# Can be overridden with the config environment variable
cardanoConfig: "./config/cardano/preview/config.json"

# A directory which contains the ledger database files
databasePath: ".dingo"

# Path to the UNIX domain socket file used by the server
socketPath: "dingo.socket"

# Name of the Cardano network
network: "preview"

# TLS certificate file path (for HTTPS)
#
# Can be overridden with the TLS_CERT_FILE_PATH environment variable
tlsCertFilePath: ""

# TLS key file path (for HTTPS)
#
# Can be overridden with the TLS_KEY_FILE_PATH environment variable
tlsKeyFilePath: ""

# Path to the topology configuration file for Cardano node
topology: "./config/cardano/preview/topology.json"

# TCP port to bind for Prometheus metrics endpoint
metricsPort: 12798

# Internal/private address to bind for listening for Ouroboros NtC
privateBindAddr: "127.0.0.1"

# TCP port to bind for listening for Ouroboros NtC
privatePort: 3002

# TCP port to bind for listening for Ouroboros NtN
#
# Can be overridden with the port environment variable
relayPort: 3001

# TCP port to bind for listening for UTxO RPC
utxorpcPort: 9090

# Ignore prior chain history and start from current tip (default: false)
# This is experimental and may break — use with caution
intersectTip: false

# Maximum cache size in bytes used by BadgerDB for block/index cache
# Default: 1073741824 (1 GB)
badgerCacheSize: 1073741824

# Maximum total size (in bytes) of all transactions allowed in the mempool.
# Transactions exceeding this limit will be rejected.
# Default: 1048576 (1 MB)
mempoolCapacity: 1048576
```
## Step 5 - Open Ports
We will cover how to list and add UFW firewall rules to add the ports needed. Adjust as needed.

> 💡Tip: UFW stands for Uncomplicated Firewall, and is used for managing iptables (netfilter) firewall rules.

To see which ports are currently open we can run:

```
sudo ufw status numbered
```

#### Add Port 3001 for Ouroboros Node to Node (NtN) Communication
In order for us to sync the chain and pass data between nodes we need to open port 3001 or whatever port you selected. To open port 3001 we will run:

```
sudo ufw allow 3001/tcp
```

#### Add Port 12798 for Prometheus metrics (Optional)
If you want track metrics using a tool like Grafana you will want to open port 12798 or whatever port you selected. To open port 12798 we will run:

```
sudo ufw allow 12798/tcp
```

#### Add Port 9090 for UTxO RPC (Optional)
You might want to also add port 9090 or whatever port you selected for UTxO RPC if you want to access chain data or transactions. We can open port 9090 by running:

```
sudo ufw allow 9090/tcp
```

## Step 6 - Bootstrap syncing Blockchain using Mithril Client (Optional)
We can speed up the initial syncing of the blocks also known as a block replay by using the Mithril Client to download a Mithril snapshot. This could save you hours of syncing time.

#### Step 6.1 - Create Mithril folder
We will create folder inside our dingo folder that will will will use to download the mithril binary. To create a folder in our dingo folder we can run:

```
cd dingo
mkdir mithril
```

#### Step 6.2 - Download Mithril Client
We can now download the Mithril Client binary by running the following:

⚠️ Adjust the link path to the correct path for the version you want to download. 

> 💡 Tip: You can download the latest Mithril release from the <a href="https://github.com/input-output-hk/mithril/releases" target="_blank">https://github.com/input-output-hk/mithril/releases</a> page.

```
cd /dingo/mithril
wget -c https://github.com/input-output-hk/mithril/releases/download/2524.0/mithril-2524.0-linux-x64.tar.gz -O - | tar -xz
```

#### Step 6.3 - Export Environment Variables
We will export the following environment variables to download the Mithril snapshot. Run these commands:

Preview Network variable:

```
export NETWORK=preview
```

Endpoint variable:

```
export AGGREGATOR_ENDPOINT=https://aggregator.pre-release-preview.api.mithril.network/aggregator
```

Genesis verification key variable:
```
export GENESIS_VERIFICATION_KEY=$(curl -s https://raw.githubusercontent.com/input-output-hk/mithril/main/mithril-infra/configuration/pre-release-preview/genesis.vkey)
```
#### Step 6.4 - Find Lastest Snapshot and Download it

> 💡 Tip: it creates the db/ directory in your current folder.

First we run the following to get the current list of snapshots

```
./mithril-client cardano-db snapshot list
```

To see current snapshot we run:

```
./mithril-client cardano-db snapshot show $SNAPSHOT_DIGEST
```

Download the current snapshot by running:

```
./mithril-client cardano-db download $SNAPSHOT_DIGEST
```

It takes some time, maybe up to 2 hours, you can see the progress.


#### Step 6.5 - Load snapshot into Dingo db

```
dingo load ~/tmp/immutable/
```
