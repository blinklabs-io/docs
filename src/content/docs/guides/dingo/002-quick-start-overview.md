---
title: Quick Start Guide
description: Dingo Quick Start Overview.
---

# Dingo

A Cardano blockchain data node written in Go which actively participates in network communications on the Cardano blockchain using the Ouroboros Network Node-to-Node family of mini-protocols.

⚠️ This is a work in progress and is currently under heavy development

<br>

***

For this guide we will walk you through downloading the Dingo binary and all the steps necessary to get the Dingo node running on the Cardano Preview network. To get started follow the steps below.

<br>

✅ This guide assumes typical Linux setup. Please adjust commands and paths as needed.

***

<br>

## Step 1 - Download Dingo Binary
<br>

Download the latest release from the <a href="https://github.com/blinklabs-io/dingo/releases" target="_blank">Dingo releases</a> page.

⚠️ Adjust the version and architecture to match your system.

```
mkdir -p ~/dingo
cd ~/dingo
wget https://github.com/blinklabs-io/dingo/releases/download/v0.27.7/dingo-v0.27.7-linux-amd64.tar.gz -O - | tar -xz
```

You can verify the binary works by running:

```
./dingo version
```

***

<br>

## Step 2 - Create Directory Structure

We will create a clean directory layout for Dingo:

```
mkdir -p ~/dingo/.dingo
```

Your directory should look like this:

```
~/dingo/
├── dingo              # binary
├── dingo.yaml         # configuration (created in Step 3)
└── .dingo/            # database directory (managed by Dingo)
    ├── badger/        # blob storage (created automatically)
    └── metadata.db    # metadata (created automatically)
```

***

<br>

## Step 3 - Create dingo.yaml Configuration File

Dingo ships with embedded Cardano network configurations (genesis files, config.json) for preview, preprod, and mainnet. You do not need to download them separately.

Create a `dingo.yaml` file in your dingo directory:

```
nano ~/dingo/dingo.yaml
```

Paste the following configuration:

```yaml
# Dingo node configuration - Preview network

bindAddr: "0.0.0.0"

# Network name — Dingo uses embedded configs for preview, preprod, mainnet
network: "preview"

# Database configuration
database:
  blob:
    plugin: "badger"
    badger:
      data-dir: "/home/YOUR_USER/dingo/.dingo/badger"
      # Setting caches to 0 uses OS page cache (mmap) instead of BadgerDB's
      # internal LRU caches. Dramatically reduces memory usage.
      block-cache-size: 0
      index-cache-size: 0
      # Compression must be disabled when caches are set to 0
      compression: false
      gc: true
  metadata:
    plugin: "sqlite"
    sqlite:
      data-dir: "/home/YOUR_USER/dingo/.dingo/metadata.db"

# Database root directory
databasePath: "/home/YOUR_USER/dingo/.dingo"

# UNIX domain socket for Cardano CLI (NtC)
socketPath: "/home/YOUR_USER/dingo/dingo.socket"

# Relay port for node-to-node communication
relayPort: 3001

# Private port for node-to-client (NtC) communication
privateBindAddr: "127.0.0.1"
privatePort: 3002

# Prometheus metrics
metricsPort: 12798

# Storage mode: "core" for relay/BP, "api" for data nodes with APIs enabled
storageMode: "core"

# API ports (0 = disabled)
utxorpcPort: 0
blockfrostPort: 0
meshPort: 0

# Mempool capacity in bytes
mempoolCapacity: 1048576

# Mithril snapshot bootstrap
mithril:
  enabled: true
  aggregatorUrl: ""
  cleanupAfterLoad: true
  verifyCertificates: true
```

> ⚠️ Replace `YOUR_USER` with your actual username in all paths above. You can find it by running `echo $USER`.

***

<br>

## Step 4 - Open Ports

We will cover how to add UFW firewall rules for the ports Dingo needs.

> 💡 Tip: UFW stands for Uncomplicated Firewall and is used for managing iptables (netfilter) firewall rules.

To see which ports are currently open:

```
sudo ufw status numbered
```

#### Add Port 3001 for Ouroboros Node to Node (NtN) Communication

```
sudo ufw allow 3001/tcp
```

***

<br>

## Step 5 - Bootstrap from Mithril Snapshot

Dingo has a built-in Mithril client that downloads and loads a snapshot automatically. This saves hours of sync time compared to replaying the chain from genesis.

Run the following command from your dingo directory:

```
cd ~/dingo
./dingo mithril sync --config dingo.yaml
```

Dingo will:
1. Download the latest Mithril snapshot for your configured network
2. Verify the certificate chain
3. Load the snapshot into the database

This takes approximately 10-15 minutes depending on your system and network speed.

> 📝 If you skip this step, Dingo will sync from genesis when started, which takes significantly longer.

***

<br>

## Step 6 - Start Dingo

Once the Mithril snapshot has loaded, start the node:

```
cd ~/dingo
./dingo serve --config dingo.yaml
```

You should see log output showing the node connecting to peers and syncing the remaining blocks to reach the chain tip.

***

<br>

#### Interested in using a systemd service to run a Dingo Node to maximize the uptime by automatically restarting the Dingo node when the computer reboots?
[See our guide on how to create a startup service for Dingo](../004-create-start-up-service).

***

<br>

### Congratulations you are ready to start using the Dingo node!

[Learn how to interact with Dingo using the Cardano CLI](../003-using-dingo-with-cardano-cli).
