---
title: Dingo Node Setup
description: SPO Guide for Dingo Pools - Dingo Node Setup and Configuration.
---

## Dingo Node Setup

✅ This guide assumes a typical Linux setup. Please adjust commands and paths as needed.

***

<br>

### Step 1 - Create Working Directory
We will create a directory for all our files related to the pool setup.

First export directory path to `.bashrc` by running:

```
echo 'export DINGO_HOME=~/dingo-testnet-preview' >> ~/.bashrc
source ~/.bashrc
```

Next create directory:

```
mkdir -p "$DINGO_HOME"
```

> You can verify by running:
> ```
> echo $DINGO_HOME
> ```

***

<br>

### Step 2 - Download Dingo Binary
<br>

Download the latest release from the <a href="https://github.com/blinklabs-io/dingo/releases" target="_blank">Dingo releases</a> page.

⚠️ Adjust the version and architecture to match your system.

```
cd $DINGO_HOME
wget https://github.com/blinklabs-io/dingo/releases/download/v0.70.7/dingo-v0.70.7-linux-amd64.tar.gz -O - | tar -xz
```

You can verify the binary version by running:

```
./dingo version
```

***

Move the Dingo binary to `/usr/local/bin/` so it is accessible system-wide.

<br>

Copy the binary:

```
sudo cp $DINGO_HOME/dingo /usr/local/bin/
```

> ✅ You can verify the binary was copied by running `which dingo`

***

<br>

### Step 3 -Download the Cardano-CLI binary 

Download the Cardano-CLI binary and run the following command:

```
wget https://github.com/IntersectMBO/cardano-cli/releases/download/cardano-cli-11.2.3.1/cardano-cli-11.2.3.1-x86_64-linux.tar.gz -O - | tar -xz
```

> The Cardano-CLI latest releases repo can be found here: <a href="https://github.com/IntersectMBO/cardano-cli/releases" target="_blank">https://github.com/IntersectMBO/cardano-cli/releases</a> page.


***

Move `cardano-cli to`/usr/local/bin` by running:

```
cd bin
sudo mv cardano-cli-x86_64-linux /usr/local/bin/cardano-cli
```

***

<br>

**We need the Shelley Genesis JSON file to run some of our CLI commands.** 

For this example, we will use the following directory structure `$DINGO_HOME/config/`. The following command will create the directory and move into that directory:
```
mkdir -p "$DINGO_HOME/config" && cd "$DINGO_HOME/config"
```

To download the Shelley Genesis file, run:

```
wget https://book.play.dev.cardano.org/environments/preview/shelley-genesis.json
```

> 💡 Tip: Cardano Configuration Files can be found at <a href="https://book.play.dev.cardano.org/env-preview.html" target="_blank">https://book.play.dev.cardano.org/env-preview.html</a>

***

<br>

### Step 4 - Create dingo.yaml Configuration File

Dingo ships with embedded Cardano network configurations (genesis files and config.json) for Musashi, so you do not need to download them separately.

- First create needed directories:
```
sudo mkdir -p /etc/dingo
```

**and**

```
mkdir -p $DINGO_HOME/.dingo
```

- Then create `dingo.yaml` file:

> The `$DINGO_HOME` variable will automatically expand to your home directory path.

```
sudo bash -c "cat <<EOF > /etc/dingo/dingo.yaml
# Global data directory for both blob and metadata storage plugins.
# Can be overridden with CARDANO_DATABASE_PATH or --data-dir.
databasePath: \"$DINGO_HOME/.dingo\"

# Network
network: \"musashi\"
relayPort: 3010
socketPath: \"$DINGO_HOME/dingo.socket\"

# Path to the topology configuration file for Cardano node
topology: \"$DINGO_HOME/config/topology.json\"

EOF"
```

You can view and verify `dingo.yaml` file by running:

```
sudo nano /etc/dingo/dingo.yaml
```

> 💡 Tip: Make sure port 3010 is open.
> ```
> sudo ufw allow 3010/tcp
> ```

***

<br>

### Step 5 - Setup Topology File
***If you plan a standard setup of a BP behind relays you can skip this step***

First download the topology file to your `$DINGO_HOME/config` directory by running:
```
cd $DINGO_HOME/config
wget https://book.play.dev.cardano.org/environments-pre/leios/topology.json
```

Then download peer-snapshot JSON file:
```
cd $DINGO_HOME/config
wget https://book.play.dev.cardano.org/environments-pre/leios/peer-snapshot.json
```

> 💡 Tip: Cardano Configuration Files can be found at <a href="https://book.play.dev.cardano.org/adv-musashi.html" target="_blank">https://book.play.dev.cardano.org/adv-musashi.html</a>

***

**To help with initial sync, we will use the Kleioscan explorer to find peers to connect to.**

- Go to <a href="https://kleioscan.com/#/musashi/pools" target="_blank">https://kleioscan.com/#/musashi/pools</a>

<img src="/dingo-kleio-explorer-pools.png"
     alt="dingo-kleio-explorer-pools"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />
     
- Click on some of your SPO friends and copy 📝 their public IPs and Ports

<img src="/dingo-kleio-explorer-pool-relay-example.png"
     alt="dingo-kleio-explorer-pool-relay-example"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

- Use the IPs and Ports to edit your `localRoots` in your `topology.json` file by running:
```
sudo nano $DINGO_HOME/config/topology.json
```

- Then edit `localRoots` section by adding your friends' pools. (For this example, we just added 3 pools.)

***Example `topology` file:*** 
```
{
  "bootstrapPeers": [
    {
      "address": "leios-node.play.dev.cardano.org",
      "port": 3001
    }
  ],
  "localRoots": [
    {
      "accessPoints": [
      {
        "address": "74.208.206.133",
        "port": 3010
      },
      {
        "address": "cerk-musashi.ddns.net",
        "port": 3001
      },
      {
        "address": "74.122.122.121",
        "port": 6400
      }
      ],
      "advertise": false,
      "trustable": false,
      "valency": 3
    }
  ],
  "peerSnapshotFile": "peer-snapshot.json",
  "publicRoots": [
    {
      "accessPoints": [],
      "advertise": false
    }
  ],
  "useLedgerAfterSlot": 64800
}
```

Save and exit.

***

<br>

### Step 6 - Create `dingo.service` Unit File

Create the systemd service file. Replace `YOUR_USER` with your Linux username (`echo $USER`):

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

We can view and verify our `dingo.service` file by running:

```
sudo nano /etc/systemd/system/dingo.service
```

***

<br>

### Step 7 - Enable and Start the Service

Enable the service to start on boot and start it now:

```
sudo systemctl daemon-reload
sudo systemctl enable dingo.service
sudo systemctl start dingo.service
```

***

<br>

### Step 8 - Check Status

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

#### Congratulations! You can now move to the **Musashi Testnet Pool Registration** section

<br>

***

## Section 2 - Musashi Testnet Pool Registration

> Make sure the node is fully synced before proceeding.
> To follow the logs in real time:
> 
> ```
> sudo journalctl -u dingo -f
> ```

### Step 1 - Add Environment Variables

Open your bashrc:

```
nano ~/.bashrc
```

Add the environment variables:

```
export CARDANO_NODE_NETWORK_ID=164
export CARDANO_NODE_SOCKET_PATH="$DINGO_HOME/dingo.socket"
```

**Save and exit.**

Reload your bashrc:

```
source ~/.bashrc
```

> You can verify your environment variables by running:
> ```
> echo $CARDANO_NODE_NETWORK_ID
> ```
>
> ```
> echo $CARDANO_NODE_SOCKET_PATH
> ```

***

<br>

Run this command to see if the node is 100% synced.
> 
> ```
> cardano-cli query tip
> ```

***

<br>
