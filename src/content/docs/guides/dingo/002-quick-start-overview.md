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

## Step 2 - Create dingo.yaml Configuration File

Dingo ships with embedded Cardano network configurations (genesis files, config.json) for preview, preprod, and mainnet. You do not need to download them separately.

Create a `dingo.yaml` file in your dingo directory. The `$HOME` variable will automatically expand to your home directory path:

```
cat <<EOF > ~/dingo/dingo.yaml
# Database
database:
  blob:
    plugin: "badger"
    badger:
      block-cache-size: 0
      compression: false
      data-dir: "$HOME/dingo/.dingo/badger"
      gc: true
      index-cache-size: 0
  metadata:
    plugin: "sqlite"
    sqlite:
      data-dir: "$HOME/dingo/.dingo/metadata.db"
databasePath: "$HOME/dingo/.dingo"

# Mempool
mempoolCapacity: 1048576

# Mithril
mithril:
  aggregatorUrl: ""
  cleanupAfterLoad: true
  enabled: true
  verifyCertificates: true

# Network
bindAddr: "0.0.0.0"
metricsPort: 12798
network: "preview"
privateBindAddr: "127.0.0.1"
privatePort: 3002
relayPort: 3001
socketPath: "$HOME/dingo/dingo.socket"

# Storage
blockfrostPort: 0
meshPort: 0
storageMode: "core"
utxorpcPort: 0
EOF
```

> 💡 Setting `block-cache-size` and `index-cache-size` to 0 with `compression: false` uses OS page cache (mmap) instead of BadgerDB's internal caches. This dramatically reduces memory usage.

***

<br>

## Step 3 - Open Ports

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

> 📝 In v0.35.3, Dingo only sends peer sharing requests to remote peers that advertise peer sharing support. Dingo skips peer sharing requests for peers with peer sharing disabled, which avoids `UnknownMiniProtocol` errors and connection resets from unsupported requests.

***

<br>

## Step 4 - Bootstrap from Mithril Snapshot

Dingo has a built-in Mithril client that downloads and loads a snapshot automatically. This saves hours of sync time compared to replaying the chain from genesis.

Run the following command from your dingo directory:

```
cd ~/dingo
./dingo mithril sync --config ~/dingo/dingo.yaml
```

Dingo will:
1. Download the latest Mithril snapshot for your configured network
2. Verify the certificate chain
3. Load the snapshot into the database

This takes approximately 10-15 minutes depending on your system and network speed.

> 📝 If you skip this step, Dingo will sync from genesis when started, which takes significantly longer.

***

<br>

## Step 5 - Start Dingo

Once the Mithril snapshot has loaded, start the node:

```
cd ~/dingo
./dingo serve --config ~/dingo/dingo.yaml
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
