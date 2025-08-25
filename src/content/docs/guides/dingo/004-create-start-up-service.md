---
title: Create Startup Service
description: Create Startup Service for Dingo.
---

# Dingo

A Cardano blockchain data node written in Go which actively participates in network communications on the Cardano blockchain using the Ouroboros Network Node-to-Node family of mini-protocols.

⚠️ This is a work in progress and is currently under heavy development

<br>

***

For this guide we will walk you through setting up a `systemd` service. Using a `systemd` service to run a Dingo Node maximizes the uptime by automatically restarting the dingo when the computer reboots. To get started follow the steps below.

<br>

✅ This guide assumes typical Linux setup. Please adjust commands and paths as needed.

***

<br>

## Step 1 - Move Dingo and dingo.yaml Files  

Best Practices: Since we will be using a `systemd` to startup Dingo we will move our Dingo Binary to the `/usr/local/bin/` and our dingo.yaml to the `/etc/dingo/` directory by running the following:

> ⚠️ Please adjust path below. Paths are based on our [Quick Start](../002-quick-start-overview) guide and `USER=test`.
> 💡 Tip: to find your path to dingo you can run the `realpath dingo` command.

```
sudo mv /home/test/dingo/dingo /usr/local/bin/
```

> ✅ You can check that dingo was moved by running `which dingo`

Now we will create the `/etc/dingo/` directory:

```
sudo mkdir /etc/dingo/
```

and then move our dingo.yaml file to `/etc/dingo/`:

> ⚠️ Please adjust path below. Paths are based on `USER=test`

```
sudo mv /home/test/dingo/dingo.yaml /etc/dingo/
```

***

<br>

## Step 2 - Create dingo.service Unit Configuration File

Next, we will write the dingo.service unit configuration file (i.e., 'service' file), which will be run by `systemd`.

> ⚠️ Please adjust the `User=` line. In our [Quick Start](../002-quick-start-overview) guide we used the user `test` please adjust this to your username.  
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
User=test
WorkingDirectory=/usr/local/bin/
ExecStart=/usr/local/bin/dingo
SyslogIdentifier=dingo
TimeoutStopSec=3

[Install]
WantedBy=multi-user.target
ENDFILE
```

***

<br>

## Step 3 - Move dingo.service

Move dingo.service to `/etc/systemd/system/` so it can operate via systemd by running:

```
sudo mv /tmp/dingo.service /etc/systemd/system/
```

***

<br>

## Step 4 - Enable the Service and Start Service

Now we will enable the service to run at start and turn it on by running:

```
sudo systemctl enable dingo.service
```

Then:

```
sudo systemctl start dingo.service
```

***

<br>

## Step 5 - Check Status

You can ensure that dingo.service is active by checking its status by running:

```
sudo systemctl status dingo.service
```

***

<br>
