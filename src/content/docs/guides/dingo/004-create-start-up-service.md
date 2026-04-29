---
title: Create Startup Service
description: Create Startup Service for Dingo.
---

# Dingo

A Cardano blockchain data node written in Go which actively participates in network communications on the Cardano blockchain using the Ouroboros Network Node-to-Node family of mini-protocols.

⚠️ This is a work in progress and is currently under heavy development

<br>

***

For this guide we will walk you through setting up a `systemd` service. Using a `systemd` service to run a Dingo Node maximizes the uptime by automatically restarting the Dingo node when the computer reboots. To get started follow the steps below.

<br>

✅ This guide assumes typical Linux setup. Please adjust commands and paths as needed.

> ✅ For this guide we assume you have already completed the [Quick Start](../002-quick-start-overview) guide.

***

<br>

## Step 1 - Move Dingo Binary and Configuration

We will move the Dingo binary to `/usr/local/bin/` and the configuration to `/etc/dingo/` so they are accessible system-wide.

<br>

Copy the binary:

```
sudo cp ~/dingo/dingo /usr/local/bin/
```

> ✅ You can verify the binary was copied by running `which dingo`

<br>

Create the config directory and copy the configuration:

```
sudo mkdir -p /etc/dingo
sudo cp ~/dingo/dingo.yaml /etc/dingo/
```

***

<br>

## Step 2 - Update Paths in dingo.yaml

Since the service will run as your user but the config is now in `/etc/dingo/`, we need to make sure the database and socket paths use absolute paths. Run the following to regenerate the config with your `$HOME` expanded:

Many of these settings also have CLI flag equivalents. This service example keeps them in `dingo.yaml` so operators can keep startup behavior consistent across reboots and routine service operations.

```
sudo bash -c "cat <<EOF > /etc/dingo/dingo.yaml
# Database
database:
  blob:
    plugin: \"badger\"
    badger:
      block-cache-size: 0
      compression: false
      data-dir: \"$HOME/dingo/.dingo/badger\"
      gc: true
      index-cache-size: 0
  metadata:
    plugin: \"sqlite\"
    sqlite:
      data-dir: \"$HOME/dingo/.dingo/metadata.db\"
databasePath: \"$HOME/dingo/.dingo\"

# Mempool
mempoolCapacity: 1048576

# Mithril
mithril:
  aggregatorUrl: \"\"
  cleanupAfterLoad: true
  enabled: true
  verifyCertificates: true

# Network
bindAddr: \"0.0.0.0\"
metricsPort: 12798
network: \"preview\"
privateBindAddr: \"127.0.0.1\"
privatePort: 3002
relayPort: 3001
socketPath: \"$HOME/dingo/dingo.socket\"

# Storage
blockfrostPort: 0
meshPort: 0
storageMode: \"core\"
utxorpcPort: 0
EOF"
```

> 📝 Operators who want Blockfrost compatible HTTP endpoints must run with `storageMode: "api"` and set `blockfrostPort` to a non zero value. API mode now includes block lookup plus `/network`, `/network/eras`, and `/genesis`.

> 📝 Dingo serves Prometheus metrics on `metricsPort`. Recent updates make startup and operator observability clearer.

```yaml
storageMode: "api"
blockfrostPort: 3000
```

***

<br>

## Step 3 - Bootstrap from Mithril (First Run Only)

Before starting the service for the first time, bootstrap the database from a Mithril snapshot:

```
dingo mithril sync --config /etc/dingo/dingo.yaml
```

This downloads and loads a snapshot, saving hours of sync time. See [Step 4 of the Quick Start guide](../002-quick-start-overview#step-4---bootstrap-from-mithril-snapshot) for details.

> 📝 Bootstrap remains a first run step. Restart and resume handling is safer now, and API mode services can continue backfill and checkpoint work after snapshot import. Let that work finish before treating the HTTP APIs as fully ready.

> 📝 When the node starts from origin, it now selects a Genesis style bootstrap chain automatically and then returns to normal Praos chain selection near the tip. Early sync behavior can differ from older guidance.


***

<br>

## Step 4 - Create dingo.service Unit File

Create the systemd service file. Replace `YOUR_USER` with your username (`echo $USER`):

Use `journalctl` and the service logs during startup to watch bootstrap and backfill progress.

```
cat <<ENDFILE | sudo tee /etc/systemd/system/dingo.service > /dev/null
[Unit]
Description=Dingo Node
After=network-online.target

[Service]
Type=simple
Restart=on-failure
RestartSec=10
User=YOUR_USER
ExecStart=/usr/local/bin/dingo serve --config /etc/dingo/dingo.yaml
SyslogIdentifier=dingo
TimeoutStopSec=5

[Install]
WantedBy=multi-user.target
ENDFILE
```

***

<br>

## Step 5 - Enable and Start the Service

Enable the service to start on boot and start it now:

```
sudo systemctl enable dingo.service
sudo systemctl start dingo.service
```

***

<br>

## Step 6 - Check Status

Verify the service is running:

```
sudo systemctl status dingo.service
```

To follow the logs in real time:

```
sudo journalctl -u dingo -f
```

To see recent logs if there is an error:

```
sudo journalctl -u dingo -n 50 --no-pager
```

***

<br>

### Congratulations you have setup a startup service for Dingo!
