---
title: Operational Tips and Maintenance
description: SPO Guide for Dingo Pools - How to update your Dingo Node .
---

## How to update your Dingo Node 

## Step 1 - Download
Download the latest release from the Dingo releases page.

⚠️ Adjust the version and architecture to match your system.
```
cd ~/dingo
wget https://github.com/blinklabs-io/dingo/releases/download/v0.54.0/dingo-v0.54.0-linux-amd64.tar.gz -O - | tar -xz
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

## Step 4 - Start Dingo Node

```
sudo sytemctl start dingo
```

Check Version is updated:
```
dingo version
```

## Step 5 Check Status
Verify the service is running:
```
sudo systemctl status dingo.service
```

To folow the logs in real time:
```
sudo journalctl -u dingo -f
```

To see recent logs if there is an error:
```
sudo journalctl -u dingo -n 50 --no-pager
```
