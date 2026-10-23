---
title: Set Up Musashi Testnet Pool
description: SPO Guide for Dingo Pools - How to set up a Musashi Testnet Pool.
---

In this guide, we will walk you through how to set up a Musashi testnet pool using the Dingo node.

This guide splits the setup into two sections:
1. **Dingo Node Setup.**
2. **Musashi Testnet Pool Registration.**

⚠️ Musashi is the Leios prototype testnet. It is reset (respun) from time to time, and each respin needs a Dingo release that ships the new Musashi configuration. Check the Dingo Release Notes for Musashi compatibility before you start.

<br>

***

## Section 1 - Dingo Node Setup

✅ This guide assumes a typical Linux setup with `systemd`, on an x86-64 (`amd64`) or ARM64 (`aarch64`) machine. Please adjust commands and paths as needed.

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

> You can verify by running:
> ```
> echo $DINGO_HOME
> ```

***

<br>

### Step 2 - Download Dingo Binary
<br>

Download the latest release from the <a href="https://github.com/blinklabs-io/dingo/releases" target="_blank">Dingo releases</a> page.

Set the architecture for the download. Dingo publishes Linux builds for `amd64` and `arm64`:

```
case "$(uname -m)" in
  x86_64) DINGO_ARCH=amd64 ;;
  aarch64|arm64) DINGO_ARCH=arm64 ;;
  *) echo "Unsupported architecture: $(uname -m)" ;;
esac
echo $DINGO_ARCH
```

Then download and extract the release:

```
cd $DINGO_HOME
wget https://github.com/blinklabs-io/dingo/releases/download/v0.86.0/dingo-v0.86.0-linux-$DINGO_ARCH.tar.gz -O - | tar -xz
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

### Step 3 - Download the Leios Cardano-CLI binary

Make directory and move into it:
```
mkdir -p "$DINGO_HOME/cli" && cd "$DINGO_HOME/cli"
```

Musashi needs the `cardano-cli` from the Leios prototype release that matches the network. Find the network's version in the `MinNodeVersion` field of the Musashi <a href="https://book.play.dev.cardano.org/environments-pre/leios/config.json" target="_blank">config.json</a>. For example, `11.1.0.164-prototype-2026w42` matches the `rc-2026w42` release on the <a href="https://github.com/input-output-hk/ouroboros-leios/releases" target="_blank">ouroboros-leios releases</a> page.

The Leios release names its Linux builds `x86_64` and `aarch64`. Set the release tag and your architecture, then download the archive and its checksum:

```
LEIOS_RELEASE=rc-2026w42
LEIOS_ARCH=$(uname -m)
[ "$LEIOS_ARCH" = arm64 ] && LEIOS_ARCH=aarch64
wget https://github.com/input-output-hk/ouroboros-leios/releases/download/$LEIOS_RELEASE/cardano-node-leios-$LEIOS_ARCH-linux.tar.gz
wget https://github.com/input-output-hk/ouroboros-leios/releases/download/$LEIOS_RELEASE/cardano-node-leios-$LEIOS_ARCH-linux.sha256
sha256sum -c cardano-node-leios-$LEIOS_ARCH-linux.sha256
tar -xzf cardano-node-leios-$LEIOS_ARCH-linux.tar.gz
```

> ✅ `sha256sum` should print `cardano-node-leios-x86_64-linux.tar.gz: OK` (or `aarch64` on ARM64)

***

Move `cardano-cli` to `/usr/local/bin` by running:

```
sudo mv bin/cardano-cli /usr/local/bin/cardano-cli
```

You can verify the version by running:

```
cardano-cli --version
```

***

Remove unneeded files:
```
cd $DINGO_HOME
rm -rf cli
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
wget https://book.play.dev.cardano.org/environments-pre/leios/shelley-genesis.json
```

> 💡 Tip: Cardano Configuration Files can be found at <a href="https://book.play.dev.cardano.org/adv-musashi.html" target="_blank">https://book.play.dev.cardano.org/adv-musashi.html</a>

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
        "address": "RELAY_1_ADDRESS",
        "port": RELAY_1_PORT
      },
      {
        "address": "RELAY_2_ADDRESS",
        "port": RELAY_2_PORT
      },
      {
        "address": "RELAY_3_ADDRESS",
        "port": RELAY_3_PORT
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
  "useLedgerAfterSlot": 1000
}
```

Replace the `RELAY_*` placeholders with the addresses and ports you copied from Kleioscan. Keep the `useLedgerAfterSlot` value from the `topology.json` you downloaded; it changes when the network is respun.

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
slotsPerKESPeriod=$(jq -r '.slotsPerKESPeriod' "$DINGO_HOME/config/shelley-genesis.json")
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
cat > meta.json << EOF
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
--pool-metadata-file meta.json \
--out-file leiosPoolMetaDataHash.txt
```

***

Host `meta.json` on GitHub Pages

The metadata URL in your pool registration can be at most 128 characters long. If you already host metadata on your own website, set `METADATA_URL` to that URL in the check below and skip the GitHub steps. Otherwise, GitHub Pages hosts it for free:

1. Sign in to <a href="https://github.com" target="_blank">GitHub</a> and create a new **public** repository named `pool`.
2. In the repository, select **Add file** → **Upload files**, upload your `meta.json`, and commit it to the `main` branch.
3. Open **Settings** → **Pages**. Under **Build and deployment**, set **Source** to **Deploy from a branch**, choose the `main` branch and the `/ (root)` folder, and select **Save**.
4. After a minute or two, your metadata is served at `https://YOUR_GITHUB_USERNAME.github.io/pool/meta.json`.

Check that the URL works and is no longer than 128 characters:

```
METADATA_URL=https://YOUR_GITHUB_USERNAME.github.io/pool/meta.json
curl -s -L "$METADATA_URL"
echo -n "$METADATA_URL" | wc -c
```

> ⚠️ Upload the file exactly as `cardano-cli` hashed it. Editing it on GitHub afterwards changes the hash, so it no longer matches the hash in your registration and wallets and explorers ignore your metadata.

***

Verify the metadata hashes
First retrieve the metadata hash from your metadata JSON URL.  

- This uses the `METADATA_URL` you set above.
```
cardano-cli dijkstra stake-pool metadata-hash --pool-metadata-file <(curl -s -L "$METADATA_URL")
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
- The metadata URL comes from the `METADATA_URL` you set in Step 9.

After replacing `<YOUR_PUBLIC_IP>`, run:
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
  --metadata-url "$METADATA_URL" \
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

### Step 13 - Update your `dingo.yaml` with the new KES key, VRF key, BLS key and Operational Certificate

Stop the Dingo node by running:
```
sudo systemctl stop dingo
```

Restrict the signing keys so only your user can read them. Dingo refuses to load a BLS signing key that group or other users can read:

```
chmod 600 $DINGO_HOME/keys/*.skey
```

Add the following lines to your `dingo.yaml` file by running:

```
sudo bash -c "cat <<EOF >> /etc/dingo/dingo.yaml
# Validator / block producer (core storage, API ports ignored):
blockProducer: true
shelleyVrfKey: \"$DINGO_HOME/keys/vrf.skey\"
shelleyKesKey: \"$DINGO_HOME/keys/kes.skey\"
shelleyOperationalCertificate: \"$DINGO_HOME/keys/node.cert\"
# Leios voting: the BLS key registered with your pool in Step 10
leiosVoteSigningKeyFile: \"$DINGO_HOME/keys/bls.skey\"
EOF"
```

> 💡 Without `leiosVoteSigningKeyFile`, the pool still forges blocks but does not vote on Leios endorser blocks.

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
