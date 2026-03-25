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

***

<br>

## Step 1 - Move Dingo Binary and Configuration Files

Best Practices: Since we will be using `systemd` to run Dingo we will move our binary to `/usr/local/bin/` and our configuration to `/etc/dingo/`.

<br>

> ⚠️ Please adjust paths below. Paths are based on our [Quick Start](../002-quick-start-overview) guide.
>
> 💡 Tip: to find your path to the Dingo binary, navigate to your Dingo binary directory, then you can run the `realpath dingo` command.

Move the binary:

```
sudo cp ~/dingo/dingo /usr/local/bin/
```

> ✅ You can check that the Dingo binary was moved by running `which dingo`

<br>

Create the config directory and copy the configuration:

```
sudo mkdir -p /etc/dingo
sudo cp ~/dingo/dingo.yaml /etc/dingo/
```

***

<br>

## Step 2 - Edit Paths in dingo.yaml File

Now we will edit the dingo.yaml to use absolute paths that work with the systemd service.

```
sudo nano /etc/dingo/dingo.yaml
```

Update the following paths. Replace `YOUR_USER` with your actual username:

```yaml
# Dingo node configuration - Preview network

bindAddr: "0.0.0.0"

network: "preview"

database:
  blob:
    plugin: "badger"
    badger:
      data-dir: "/home/YOUR_USER/dingo/.dingo/badger"
      block-cache-size: 0
      index-cache-size: 0
      compression: false
      gc: true
  metadata:
    plugin: "sqlite"
    sqlite:
      data-dir: "/home/YOUR_USER/dingo/.dingo/metadata.db"

databasePath: "/home/YOUR_USER/dingo/.dingo"

socketPath: "/home/YOUR_USER/dingo/dingo.socket"

relayPort: 3001

privateBindAddr: "127.0.0.1"
privatePort: 3002

metricsPort: 12798

storageMode: "core"

utxorpcPort: 0
blockfrostPort: 0
meshPort: 0

mempoolCapacity: 1048576

mithril:
  enabled: true
  aggregatorUrl: ""
  cleanupAfterLoad: true
  verifyCertificates: true
```

***

<br>

## Step 3 - Create dingo.service Unit Configuration File

Next, we will create the systemd service file.

> ⚠️ Replace `YOUR_USER` with your actual username below.
>
> 💡 Tip: you can run `echo $USER` command to find your username.

```
cat <<'ENDFILE' >> /tmp/dingo.service
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

## Step 4 - Move dingo.service

Move dingo.service to `/etc/systemd/system/` so it can operate via systemd by running:

```
sudo mv /tmp/dingo.service /etc/systemd/system/
```

***

<br>

## Step 5 - Bootstrap from Mithril (First Run Only)

Before starting the service for the first time, bootstrap the database from a Mithril snapshot:

```
dingo mithril sync --config /etc/dingo/dingo.yaml
```

This downloads and loads a snapshot, saving hours of sync time. See [Step 5 of the Quick Start guide](../002-quick-start-overview#step-5---bootstrap-from-mithril-snapshot) for details.

> 📝 You only need to do this once. After the initial bootstrap, the systemd service will keep the node synced.

***

<br>

## Step 6 - Enable the Service and Start Service

Now we will enable the service to run at boot and start it:

```
sudo systemctl enable dingo.service
```

Then:

```
sudo systemctl start dingo.service
```

***

<br>

## Step 7 - Check Status

You can ensure that dingo.service is active by checking its status:

```
sudo systemctl status dingo.service
```

To follow the logs in real time:

```
sudo journalctl -u dingo -f
```

If you have an error, you can see recent logs with:

```
sudo journalctl -u dingo -n 50 --no-pager
```

***

<br>

### Congratulations you have setup a startup service for Dingo!
