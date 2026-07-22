---
title: Update Dingo Node
description: SPO Guide for Dingo Pools - How to update your Dingo Node.
---

## How to update your Dingo Node 

## Step 1 - Download latest release
Download the latest release from the <a href="https://github.com/blinklabs-io/dingo/releases" target="_blank">Dingo releases</a> page.

⚠️ Adjust the version and architecture to match your system.
```
cd ~/dingo
wget https://github.com/blinklabs-io/dingo/releases/download/v0.66.2/dingo-v0.66.2-linux-amd64.tar.gz -O - | tar -xz
```

***

## Step 2 - Stop Dingo Node

```
sudo systemctl stop dingo
```

***

## Step 3 - Copy Dingo node to `/usr/local/bin/`

```
sudo cp ~/dingo/dingo /usr/local/bin/
```

Verify it has been copied by `which dingo`

***

## Step 4 - Check for Config file updates
Check to make sure no config updates are required.

Refer to the <a href="https://docs.blinklabs.io/guides/dingo/releases/001-release-notes/" target="_blank"> Dingo Release notes and the [Quick Start](../../002-quick-start-overview) guide.

> 💡 To view and edit `dingo.yaml` file run:
>
> ```
> sudo nano /etc/dingo/dingo.yaml
> ```
> ⚠️ Adjust path as needed

***

## Step 5 - RECOMMENDED - Remove `.dingo` Database and Resync Mithril Snapshot
Since Dingo is in heavy development it's recommended during upgrading to delete database and start fresh.

### Step 5.1 - Delete `.dingo` Database
> 💡 To view hidden files and double check path run:
> ```
> cd ~/dingo
> ls -a
> ```
>
> You should see `.dingo`. If not check your dingo.yaml file for the database path you used.

Delete the .dingo database file by running:
```
cd ~/dingo
rm -r .dingo
```

### Step 5.2 - Mithril Sync
Dingo has a built-in Mithril client that downloads and loads a snapshot automatically. This saves hours of sync time compared to replaying the chain from genesis.

Run the following command from your dingo directory:
```
dingo sync --mithril
```
Dingo will:
1. Download the latest Mithril snapshot for your configured network
2. Verify the certificate chain
3. Load the snapshot into the database

This takes approximately 20-30 minutes depending on your system and network speed.

> 📝 If you skip this step, Dingo will sync from genesis when started, which takes significantly longer.

### Step 5.3 - Start Dingo
Once the Mithril snapshot has finished loading, start the node:
```
cd ~/dingo
sudo systemctl start dingo
```
***

## Step 6 - Verify the Update
Check Version is updated:
```
dingo version
```

***

## Step 7 - Check Status
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
