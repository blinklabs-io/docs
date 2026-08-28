---
title: Set Up Musashi Testnet Pool
description: SPO Guide for Dingo Pools - How to set up a Musashi Testnet Pool.
---

In this guide, we will walk you through how to set up a Musashi testnet pool using the Dingo node.

This guide splits the setup into two sections:
1. **Dingo Node Setup.**
2. **Musashi Testnet Pool Registration.**

<br>

***

## Section 1 - Dingo Node Setup

✅ This guide assumes a typical Linux setup. Please adjust commands and paths as needed.

***

<br>

### Step 1 - Create Working Directory
We will create a directory for all our files related to the pool setup.

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

<br>

### Step 2 - Download Dingo Binary
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

Move the Dingo binary to `/usr/local/bin/` so it is accessible system-wide.

<br>

Copy the binary:

```
sudo cp $DINGO_HOME/dingo /usr/local/bin/
```

> ✅ You can verify the binary was copied by running `which dingo`

***

<br>

### Step 3 -Download the latest Cardano CLI binary 

First, go to the Cardano CLI repo <a href="https://github.com/IntersectMBO/cardano-cli/releases" target="_blank">https://github.com/IntersectMBO/cardano-cli/releases</a> page.

Download the Cardano CLI binary and run the following command:


⚠️ Adjust the link path to the correct path for the version you want to download. 

```
cd $DINGO_HOME
wget https://github.com/IntersectMBO/cardano-cli/releases/download/cardano-cli-11.2.2.0/cardano-cli-11.2.2.0-x86_64-linux.tar.gz -O - | tar -xz
```

***

Rename the Cardano CLI binary and set execute permissions.

To make the file executable, run:

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

We need the Shelley Genesis JSON file to run some of our CLI commands.

We will create a directory to store our Cardano configuration files. For this example, we will use the following directory structure `/config/leios/` by running the following command in our `$DINGO_HOME` directory:

```
cd $DINGO_HOME
mkdir -p config/leios
```

Next, navigate to the `config/leios` folder and download the Cardano Shelley Genesis file.

```
cd config/leios
```

To download the Shelley Genesis file, run:

```
wget https://book.play.dev.cardano.org/environments-pre/leios/shelley-genesis.json
```

> 💡 Tip: Cardano Configuration Files can be found at <a href="https://book.play.dev.cardano.org/adv-musashi.html" target="_blank">https://book.play.dev.cardano.org/adv-musashi.html</a>

***

<br>

### Step 4 - Create dingo.yaml Configuration File

Dingo ships with embedded Cardano network configurations (genesis files and config.json) for Musashi, so you do not need to download them separately.

The `$DINGO_HOME` variable will automatically expand to your home directory path:

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
topology: \"$DINGO_HOME/config/leios/topology.json\"

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

First download the topology file to your `$DINGO_HOME/config/leios` directory by running:
```
cd $DINGO_HOME/config/leios
wget https://book.play.dev.cardano.org/environments-pre/leios/topology.json
```

> 💡 Tip: Cardano Configuration Files can be found at <a href="https://book.play.dev.cardano.org/adv-musashi.html" target="_blank">https://book.play.dev.cardano.org/adv-musashi.html</a>


**To help with initial sync, we will use the Kleioscan explorer to find peers to connect to.**

Go to <a href="https://kleioscan.com/#/musashi/pools" target="_blank">https://kleioscan.com/#/musashi/pools</a>

<img src="/dingo-kleio-explorer-pools.png"
     alt="dingo-kleio-explorer-pools"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />
     
Click on some of your SPO friends and copy 📝 their public IPs and Ports

<img src="/dingo-kleio-explorer-pool-relay-example.png"
     alt="dingo-kleio-explorer-pool-relay-example"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

Use the IPs and Ports to edit your `localRoots` in your `topology.json` file:
```
sudo nano topology.json
```

Edit `localRoots` adding your friends' pools. For this example, we just added 3 pools.
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

> Make sure the node is fully synced before proceeding. Run the command to see if the node is 100% synced.
> 
> ```
> cardano-cli query tip
> ```

***

<br>

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

***

<br>

### Step 2 - Create `keys` Folder
We will create a `keys` folder for all our pool keys and `cert` files. The following command will create directory and move into that directory.

```
mkdir -p "$DINGO_HOME/keys" && cd "$DINGO_HOME/keys"
```

***

<br>

### Step 3 - Create Payment and Stake Keys

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

***

<br>

### Step 4 - Create Payment Address
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

***

<br>

### Step 5 - Fund Address
Go to the faucet and paste your address from above.

<a href="https://faucet.leios.play.dev.cardano.org/basic-faucet" target="_blank">https://faucet.leios.play.dev.cardano.org/basic-faucet</a>


> You can confirm Tada was received by running:
> 
> ```
> cardano-cli dijkstra query utxo --address "$(cat payment.addr)"
> ```

***

<br>

### Step 6 - Create Node Operational Keys
Create Cold keys, KES keys and VRF keys

***

**Cold keys (your pool's identity — keep offline / backed up)**
```
cardano-cli dijkstra node key-gen \
  --cold-verification-key-file cold.vkey \
  --cold-signing-key-file cold.skey \
  --operational-certificate-issue-counter-file opcert.counter
```

**KES keys (hot keys, rotated periodically)**
```
cardano-cli dijkstra node key-gen-KES \
  --verification-key-file kes.vkey \
  --signing-key-file kes.skey
```

**VRF keys (used to win block-production slots)**
```
cardano-cli dijkstra node key-gen-VRF \
  --verification-key-file vrf.vkey \
  --signing-key-file vrf.skey
```

***

<br>

### Step 7 - Create BLS Keys
BLS keys are keys that pools use to vote on and certify endorser blocks. You need them to register a Leios-enabled stake pool.

**BLS key pair (Leios voting/certification key)**
```
cardano-cli dijkstra node key-gen-BLS \
  --verification-key-file bls.vkey \
  --signing-key-file bls.skey
```

***

<br>

### Step 8 - Create Operational Certificate
We can find the starting KES period by running:

```
slotsPerKESPeriod=$(jq -r '.slotsPerKESPeriod' "$DINGO_HOME/config/leios/shelley-genesis.json")
slotNo=$(cardano-cli query tip | jq -r '.slot')
kesPeriod=$(( slotNo / slotsPerKESPeriod ))
```
Now run the following command to create `node.cert`:
```
cardano-cli dijkstra node issue-op-cert \
  --kes-verification-key-file kes.vkey \
  --cold-signing-key-file cold.skey \
  --operational-certificate-issue-counter-file opcert.counter \
  --kes-period "$kesPeriod" \
  --out-file node.cert
```

***

<br>

### Step 9 - Create your pool's metadata JSON file
Update the values below with your pool's information. 

📝 **ticker** must be between 3-5 characters in length
📝 **description** cannot exceed 255 characters in length.

```
cat > leios-pool-metadata.json << EOF
{
"name": "MyPoolName",
"description": "My pool description",
"ticker": "ABC",
"homepage": "https://pool-Website.com"
}
EOF
```

***

Calculate the metadata hash
Calculate the hash of your metadata file. The hash is saved to `leiosPoolMetaDataHash.txt`

```
cardano-cli dijkstra stake-pool metadata-hash \
--pool-metadata-file leios-pool-metadata.json \
--out-file leiosPoolMetaDataHash.txt
```

***

Upload `leios-pool-metadata.json` to a public website

Upload your `leios-pool-metadata.json` file to a website that you administer or a public Web site. For example, you can upload your pool metadata to GitHub. <a href="https://www.coincashew.com/coins/overview-ada/guide-how-to-build-a-haskell-stakepool-node/part-v-tips/uploading-pool-metadata-to-github" target="_blank">See Coincashew guide here for uploading to GitHub.</a> 

***

Verify the metadata hashes
First retrieve the metadata hash from your metadata JSON URL.  

- Replace <https://www.METADATA-URL.com> with your actual URL from above.
```
cardano-cli dijkstra stake-pool metadata-hash --pool-metadata-file <(curl -s -L <https://www.METADATA-URL.com>)
```

Verify that this hash matches the value here:

```
cat leiosPoolMetaDataHash.txt
```

***

### Step 10 - Register Stake Address and Pool
Build both Stake and Pool certificates, then submit them in a single transaction.

**Stake-address registration certificate:**
```
cardano-cli dijkstra stake-address registration-certificate \
  --stake-verification-key-file stake.vkey \
  --key-reg-deposit-amt "$(cardano-cli dijkstra query gov-state | jq .currentPParams.stakeAddressDeposit)" \
  --out-file stake-reg.cert
```

***

**Pool registration certificate:**
- Replace `<YOUR_PUBLIC_IP>` with your node's public IP (the address other nodes will use to reach it). 
- Also replace <https://website.com/leios-pool-metadata.json> with your URL from above.

After replacing `<YOUR_PUBLIC_IP>` and `<https://website.com/leios-pool-metadata.json>` run:
```
cardano-cli dijkstra stake-pool registration-certificate \
  --cold-verification-key-file cold.vkey \
  --vrf-verification-key-file vrf.vkey \
  --bls-signing-key-file bls.skey \
  --pool-pledge 1000000000 \
  --pool-cost 170000000 \
  --pool-margin 0.05 \
  --pool-reward-account-verification-key-file stake.vkey \
  --pool-owner-stake-verification-key-file stake.vkey \
  --pool-relay-ipv4 <YOUR_PUBLIC_IP> \
  --pool-relay-port 3010 \
  --metadata-url <https://website.com/leios-pool-metadata.json> \
  --metadata-hash $(cat leiosPoolMetaDataHash.txt) \
  --out-file pool-reg.cert
```

Submit both certificates in one transaction.

Get UTxO for `tx-in` by running:
```
TXIN=$(cardano-cli dijkstra query utxo --address "$(cat payment.addr)" | jq -r 'keys[0]')
```

Build raw transaction by running:
```
cardano-cli dijkstra transaction build \
  --tx-in "$TXIN" \
  --change-address "$(cat payment.addr)" \
  --certificate-file stake-reg.cert \
  --certificate-file pool-reg.cert \
  --out-file pool-reg-tx.raw
```

Sign Transaction by running:
```
cardano-cli dijkstra transaction sign \
  --tx-body-file pool-reg-tx.raw \
  --signing-key-file payment.skey \
  --signing-key-file stake.skey \
  --signing-key-file cold.skey \
  --out-file pool-reg-tx.signed
```

Submit Transaction by running: 
```
cardano-cli dijkstra transaction submit \
  --tx-file pool-reg-tx.signed
```

***

<br>

### Step 11 - Delegate Stake to Your Pool
Build a delegation certificate and submit it in its own transaction.

Create delegation cert by running:
```
cardano-cli dijkstra stake-address stake-delegation-certificate \
  --stake-verification-key-file stake.vkey \
  --cold-verification-key-file cold.vkey \
  --out-file delegation.cert
```

Get UTxO for `tx-in` by running:
```
TXIN=$(cardano-cli dijkstra query utxo --address "$(cat payment.addr)" | jq -r 'keys[0]')
```

Build raw transaction by running:
```
cardano-cli dijkstra transaction build \
  --tx-in "$TXIN" \
  --change-address "$(cat payment.addr)" \
  --certificate-file delegation.cert \
  --out-file delegation-tx.raw
```

Sign Transaction by running:
```
cardano-cli dijkstra transaction sign \
  --tx-body-file delegation-tx.raw \
  --signing-key-file payment.skey \
  --signing-key-file stake.skey \
  --out-file delegation-tx.signed
```

Submit Transaction by running: 
```
cardano-cli dijkstra transaction submit \
  --tx-file delegation-tx.signed
```

***

<br>

### Step 12 - Get bech32 Id

```
cardano-cli dijkstra stake-pool id --output-bech32 --cold-verification-key-file cold.vkey
```
example: `pool1…`

**Go to faucet and request delegation for your pool.** 

Paste your pool id from above.
<a href="https://faucet.leios.play.dev.cardano.org/basic-faucet" target="_blank">https://faucet.leios.play.dev.cardano.org/basic-faucet</a>

**Verify Registration**
Capture your pool id (from the cold key) and your stake address by running:

```
POOL_ID=$(cardano-cli dijkstra stake-pool id --cold-verification-key-file cold.vkey --output-format hex)
STAKE_ADDR=$(cardano-cli dijkstra stake-address build --stake-verification-key-file stake.vkey)
echo "pool id: $POOL_ID"
echo "stake address: $STAKE_ADDR"
```

Check the pool is registered on-chain — this should print your pool's parameters (pledge, cost, margin, VRF):
```
cardano-cli dijkstra query pool-state --stake-pool-id "$POOL_ID"
```

Check the delegation took effect — stakeDelegation should point at your pool id:

```
cardano-cli dijkstra query stake-address-info --address "$STAKE_ADDR"
```

***

<br>

### Step 13 - Update your `dingo.yaml` with the new KES key, VRF key and Operational Certificate

Stop the Dingo node by running:
```
sudo systemctl stop dingo
```

Add the following lines to your `dingo.yaml` file by running:

```
sudo bash -c "cat <<EOF >> /etc/dingo/dingo.yaml
# Validator / block producer (core storage, API ports ignored):
blockProducer: true
shelleyVrfKey: \"$DINGO_HOME/keys/vrf.skey\"
shelleyKesKey: \"$DINGO_HOME/keys/kes.skey\"
shelleyOperationalCertificate: \"$DINGO_HOME/keys/node.cert\"
EOF"
```

You can view and verify our `dingo.yaml` file by running:

```
sudo nano /etc/dingo/dingo.yaml
```

***

<br>

### Step 14 - Start Dingo Node

```
sudo systemctl start dingo
```

***

<br>

### Step 15 - Check Status

Verify that Dingo is running:

```
sudo systemctl status dingo
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

#### Congratulations! You have a Leios Dingo Node running on the Musashi Testnet.

***

<br>

If you want to participate in the Musashi Testnet Rewards Program for SPO go here and fill out the form <a href="https://leios.cardano-scaling.org/docs/testnet/rewards-program" target="_blank">https://leios.cardano-scaling.org/docs/testnet/rewards-program</a>

***

<br>

> Credit to original guides and additional resource here <a href="https://leios.cardano-scaling.org/docs/testnet/getting-started" target="_blank">https://leios.cardano-scaling.org/docs/testnet/getting-started</a>
