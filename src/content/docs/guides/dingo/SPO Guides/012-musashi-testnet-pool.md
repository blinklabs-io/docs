---
title: Set Up Musashi Testnet Pool
description: SPO Guide for Dingo Pools - How to set up a Musashi Testnet Pool.
---

In this guide, we will walk you through how to set up a Mushashi testnet pool using the Dingo node.


This guide spilts the set up into two sections:
1. Dingo Node Set Up.
2. Musashi Testnet Pool Registration.

<br>

# Section 1 - Dingo Node Set Up

✅ This guide assumes a typical Linux setup. Please adjust commands and paths as needed.

***

<br>

## Step 1 - Create Working Directory
Will we create a directory for all our files releated to the pool setup.

First export directory path to `.bashrc` by running:

```
echo 'export DINGO_HOME=~/dingo-leios-testnet' >> ~/.bashrc
source ~/.bashrc
```

Next create directory:

```
mkdir -p "$DINGO_HOME"
```

***

## Step 2 - Download Dingo Binary
<br>

Download the latest release from the <a href="https://github.com/blinklabs-io/dingo/releases" target="_blank">Dingo releases</a> page.

⚠️ Adjust the version and architecture to match your system.

```
cd $DINGO_HOME
wget https://github.com/blinklabs-io/dingo/releases/download/v0.70.1/dingo-v0.70.1-linux-amd64.tar.gz -O - | tar -xz
```

You can verify the binary works by running:

```
./dingo version
```

***

Move the Dingo binary to `/usr/local/bin/`
Move the Dingo binary to `/usr/local/bin/` so they are accessible system-wide.

<br>

Copy the binary:

```
sudo cp $DINGO_HOME/dingo /usr/local/bin/
```

> ✅ You can verify the binary was copied by running `which dingo`

***

## Step 3 -Download the latest Cardano CLI binary 

First, go to the Cardano CLI repo <a href="https://github.com/IntersectMBO/cardano-cli/releases" target="_blank">https://github.com/IntersectMBO/cardano-cli/releases</a> page.

Download the Cardano CLI binary and run the following command:


⚠️ Adjust the link path to the correct path for the version you want to download. 

```
cd $DINGO_HOME
wget https://github.com/IntersectMBO/cardano-cli/releases/download/cardano-cli-11.2.2.0/cardano-cli-11.2.2.0-x86_64-linux.tar.gz -O - | tar -xz
```

***

Rename the Cardano CLI Binary and Set Execute Permissions 

To make the file executable run the following command:

```
chmod +x cardano-cli-x86_64-linux
```

<br>

For this example, we will rename the binary to `cardano-cli` and move it to `/usr/local/bin/`:

⚠️ Adjust the file path and file name if needed. 

```
sudo mv cardano-cli-x86_64-linux /usr/local/bin/cardano-cli
```

***

<br>

## Step 4 - Create dingo.yaml Configuration File

Dingo ships with embedded Cardano network configurations (genesis files, config.json) for preview, preprod, and mainnet. You do not need to download them separately.

The `$DINGO_HOME` variable will automatically expand to your home directory path:

```
sudo bash -c "cat <<EOF > /etc/dingo/dingo.yaml
# Global data directory for both blob and metadata storage plugins.
# Can be overridden with CARDANO_DATABASE_PATH or --data-dir.
databasePath: \"$DINGO_HOME/.dingo\"

# Plugins
plugins:
  storage:
    blob:
      provider: \"badger\"
      config:
        # Optional Badger data directory. When unset, databasePath applies.
        dataDir: \"$DINGO_HOME/.dingo/badger\"
        blockCacheSize: 0
        compression: false
        gc: true
        indexCacheSize: 0
    metadata:
      provider: \"sqlite\"
      config:
        # Optional SQLite data directory. When unset, databasePath applies.
        dataDir: \"$DINGO_HOME/.dingo/metadata.db\"
  mempool:
    provider: \"default\"
    config:
      # `capacity` is an optional override, not a required setting.
      # Default: 1 MiB for Praos mode and normal serve mode, and 25 MiB for Musashi mode.
      # Leave the key commented or omit it to use the mode default.
      # capacity: 1048576
      # `revalidationDeltaCap` is optional. Default: 64. The value must be positive.
      # revalidationDeltaCap: 64
  api:
    blockfrost:
      provider: \"builtin\"
      config:
        port: 3000
    mesh:
      provider: \"builtin\"
      config:
        port: 8080
    utxorpc:
      provider: \"builtin\"
      config:
        port: 9090

# Mithril
mithril:
  aggregatorUrl: \"\"
  cleanupAfterLoad: true
  enabled: true
  verifyCertificates: true

# Network
bindAddr: \"0.0.0.0\"
metricsPort: 12798
debugPort: 0
network: \"musashi\"
privateBindAddr: \"127.0.0.1\"
privatePort: 3002
relayPort: 3001
socketPath: \"$DINGO_HOME/dingo.socket\"

# Storage
barkBaseUrl: \"\"
barkPort: 0
storageMode: \"core\"
# Database lifecycle
databaseLifecycle:
  # Dingo captures automatic database snapshots at epoch boundaries.
  # Default: false.
  snapshotEnabled: false
  # Dingo writes automatic snapshots to this local filesystem directory.
  # Set this when snapshotEnabled is true and when Bark mounts the live service.
  snapshotDir: \"$HOME/dingo/snapshots\"
  # Keep only the most recent automatic snapshots.
  # Default: 0.
  snapshotRetention: 0
  # Optional cloud mirror for snapshots.
  # snapshotCloudDestination: \"\"
  # snapshotCloudDestinationPrefix: \"\"
  # Capture an automatic snapshot every N epoch closes.
  # CLI: --db-snapshot-every-n-epochs
  snapshotEveryNEpochs: 1
EOF"
```

You can view and verify `dingo.yaml` file by running:

```
sudo nano /etc/dingo/dingo.yaml
```

## Step 5 - Create `dingo.service` Unit File

Create the systemd service file. Replace `YOUR_USER` with your username (`echo $USER`):

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

<br>

## Step 6 - Enable and Start the Service

Enable the service to start on boot and start it now:

```bash
sudo systemctl daemon-reload
sudo systemctl enable dingo.service
sudo systemctl start dingo.service
```

***

<br>

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

***

<br>

### Congratulations! You can now move to the **Musashi Testnet Pool Registration** section

# Section 2 - Musashi Testnet Pool Registration

> Make sure the node if fully synced before proceeding. Run the command to see if the node is 100% synced.
> 
> ```
> cardano-cli query tip
> ```

## Step 1 - Add Environment Variables

Open your bashrc:

```
nano ~/.bashrc
```

Add the environment variables:

```
export CARDANO_NODE_NETWORK_ID=164
export CARDANO_NODE_SOCKET_PATH="$DINGO_HOME/dingo.socket"
```

**Save and exit**

Reload your bashrc:

```
source ~/.bashrc
```

> You can verify your environment variables by running:
> ```
> echo $DINGO_HOME
> ```
>
> ```
> echo $CARDANO_NODE_NETWORK_ID
> ```
>
> ```
> echo $CARDANO_NODE_SOCKET_PATH
> ```

## Step 2 - Create `keys` Folder
We will create a key folder for all our pool keys and `cert` files. The following command will create directory and move into that directory.

```
mkdir -p "$DINGO_HOME/keys" && cd "$DINGO_HOME/keys"
```

## Step 3 - Create Payment and Stake Keys

Create payment keys:
```
cardano-cli dijkstra address key-gen \
  --verification-key-file payment.vkey \
  --signing-key-file payment.skey
```

Create stake keys:
```
cardano-cli dijkstra stake-address key-gen \
  --verification-key-file stake.vkey \
  --signing-key-file stake.skey
```

## Step 4 - Create Payment Address
Create payment address and `payment.addr` file
```
cardano-cli dijkstra address build \
  --payment-verification-key-file payment.vkey \
  --stake-verification-key-file stake.vkey \
  --out-file payment.addr
```

See your payment address and copy it by running:

```
cat payment.addr
```

## Step 5 - Fund Address
go to faucet and paste your address from above.

<a href="https://faucet.leios.play.dev.cardano.org/basic-faucet" target="_blank">https://faucet.leios.play.dev.cardano.org/basic-faucet</a>


> You can confirm Tada was received by running:
> 
> ```
> cardano-cli dijkstra query utxo --address "$(cat payment.addr)"
> ```

