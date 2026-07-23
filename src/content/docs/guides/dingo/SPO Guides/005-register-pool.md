---
title: Registering Stake Pool
description: SPO Guide for Dingo Pools - Registering Your Stake Pool.
---

# Dingo - Registering Your Stake Pool

✅ This guide assumes your files are in the $HOME/dingo folder. Adjust paths below if necessary.

## Step 1 - Create your pool's metadata JSON file
Update the values below with your pool's information. 

📝 **ticker** must be between 3-5 characters in length
📝 **description** cannot exceed 255 characters in length.

```
cd ~/dingo
cat > preview-pool-metadata.json << EOF
{
"name": "MyPoolName",
"description": "My pool description",
"ticker": "ABC",
"homepage": "https://pool-Website.com"
}
EOF
```

***

## Step 2 - Calculate the metadata hash
Calculate the hash of your metadata file. The hash is saved to `previewPoolMetaDataHash.txt`

```
cardano-cli conway stake-pool metadata-hash \
--pool-metadata-file preview-pool-metadata.json \
--out-file previewPoolMetaDataHash.txt
```

Copy `previewPoolMetaDataHash.txt` to your air-gapped machine.

***

## Step 3 - Upload `preview-pool-metadata.json` to a public website

Upload your `preview-pool-metadata.json` file to a website that you administer or a public Web site. For example, you can upload your pool metadata to GitHub. <a href="https://www.coincashew.com/coins/overview-ada/guide-how-to-build-a-haskell-stakepool-node/part-v-tips/uploading-pool-metadata-to-github" target="_blank">See Coincashew guide here for uploading to GitHub.</a> 

***

## Step 4 - Verify the metadata hashes
First retrieve the metadata hash from your metadata JSON URL.  

Replace <https://www.METADATA-URL.com> with your actual URL from Step 3.
```
cardano-cli conway stake-pool metadata-hash --pool-metadata-file <(curl -s -L <https://www.METADATA-URL.com>)
```

Verify that this hash matches the value here:

```
cat previewPoolMetaDataHash.txt
```

***

## Step 5 - Create a registration certificate for your stake pool

To simplify future updates to your pool registration certificate, create an environment (`env`) file containing your pool configuration and a script to generate `pool.cert`.

### Step 5.1 - Create a pool-scripts folder
⚠️ On an air-gapped machine

```
cd ~/dingo
mkdir pool-scripts
```

### Step 5.2 - Create an env file
Create an environment (`env`) file for our pool in the pool-scripts folder.

✅ Update the values below with your metadata URL, your relay node IP and port, pool pledge amount and cost (min pool fee) and margin.

```
cat > $HOME/dingo/pool-scripts/env << 'EOF' 
#!/bin/bash

PLEDGE=25000000000  # 25,000 ADA
COST=170000000     #  170 ADA
MARGIN=0.01        #    1 %

NET="--testnet-magic 2"  #preview
RELAY1_HOST=55.209.117.58
RELAY1_PORT=6000
RELAY2_HOST=55.23.123.206
RELAY2_PORT=6000
METADATA_URL=https://website.com/preview-pool-metadata.json
METADATA_HASH=$(cat $HOME/dingo/previewPoolMetaDataHash.txt)
EOF
```

> The example above uses IP addresses. If your relay nodes use DNS names instead, use the following options:
> ```
> --single-host-pool-relay <relaynode1.pool.example.com> \
> --pool-relay-port 6000 \
> --single-host-pool-relay <relaynode2.pool.example.com> \
> --pool-relay-port 6000 \
>```

💡 Tip: Make sure the `RELAY_PORT` you use on your relays is open in firewall rules.

To see which ports are currently open:

```
sudo ufw status numbered
```

### Step 5.3 - Create `pool-registration.sh` script
Create pool-registration.sh script in the pool-scripts folder:

```
cat > $HOME/dingo/pool-scripts/pool-registration.sh << EOF 
#!/bin/bash

source ./env

cardano-cli conway stake-pool registration-certificate \
--cold-verification-key-file $HOME/dingo/cold-keys/node.vkey \
--vrf-verification-key-file $HOME/dingo/vrf.vkey \
--pool-pledge \${PLEDGE} \
--pool-cost \${COST} \
--pool-margin \${MARGIN} \
--pool-reward-account-verification-key-file $HOME/dingo/stake.vkey \
--pool-owner-stake-verification-key-file $HOME/dingo/stake.vkey \
\${NET} \
--pool-relay-ipv4 \${RELAY1_HOST} \
--pool-relay-port \${RELAY1_PORT} \
--pool-relay-ipv4 \${RELAY2_HOST} \
--pool-relay-port \${RELAY2_PORT} \
--metadata-url \${METADATA_URL} \
--metadata-hash \${METADATA_HASH} \
--out-file $HOME/dingo/pool.cert
EOF
```

### Step 5.4 - Add execute permissions
Add execute permissions to the `pool-registration.sh` script.

```
chmod +x $HOME/dingo/pool-scripts/pool-registration.sh
```

### Step 5.5 - Execute the Script
The script must be executed in order to generate the new stake pool registration certificate, which will need to be submitted with a transaction.

```
cd $HOME/dingo/pool-scripts
./pool-registration.sh
```

### Step 5.6 - Copy pool.cert to your hot environment
Copy `pool.cert` to the `~/dingo` directory on your hot environment (block producer or relay node).

***

## Step 6 - Pledge stake to your stake pool
⚠️ On an air-gapped machine

```
cd ~/dingo
cardano-cli conway stake-address stake-delegation-certificate \
--stake-verification-key-file stake.vkey \
--cold-verification-key-file $HOME/dingo/cold-keys/node.vkey \
--out-file deleg.cert
```

***

## Step 7 - Submit the certificates
Build and sign the transaction to submit both the `pool.cert` and the `deleg.cert`.

### Step 7.1 - Query the current slot
```
currentSlot=$(cardano-cli conway query tip --testnet-magic 2 | jq -r '.slot')
echo Current Slot: $currentSlot
```

### Step 7.2 - Build the transaction
```
cd ~/dingo
cardano-cli conway transaction build \
    --tx-in $(cardano-cli query utxo --address $(cat payment.addr) --out-file /dev/stdout | jq -r 'keys[0]') \
    --change-address $(cat payment.addr) \
    --certificate-file pool.cert \
    --certificate-file deleg.cert \
    --invalid-hereafter $(( ${currentSlot} + 1000 )) \
    --witness-override 3 \
    --out-file tx.raw
```

### Step 7.3 - Sign the transaction
Copy `tx.raw` to the `~/dingo` directory on your air-gapped machine.

⚠️ On an air-gapped machine
```
cd ~/dingo
cardano-cli conway transaction sign \
--tx-body-file tx.raw \
--signing-key-file payment.skey \
--signing-key-file $HOME/dingo/cold-keys/node.skey \
--signing-key-file stake.skey \
--out-file tx.signed
```

### Step 7.4 - Submit transaction
Copy `tx.signed` to the `~/dingo` directory on your hot environment (block producer or relay node).

```
cd ~/dingo
cardano-cli conway transaction submit --tx-file tx.signed
```

***

## Step 8 - Verify registration

### Step 8.1 - Create `stakepoolid.txt` file

⚠️ On an air-gapped machine
```
cardano-cli conway stake-pool id \
--cold-verification-key-file $HOME/dingo/cold-keys/node.vkey \
--output-format hex \
> stakepoolid.txt

cat stakepoolid.txt
```

### Step 8.2 - Copy `stakepoolid.txt` to your hot environment
Copy `stakepoolid.txt` to the `~/dingo` directory on your hot environment (block producer or relay node).

### Step 8.3 - Verify that the pool has appeared on-chain:
```
cd ~/dingo
cardano-cli query stake-snapshot --stake-pool-id $(cat stakepoolid.txt)
```

***

## Step 9 - Update your `dingo.yaml` with the new KES key, VRF key and operation certificate

⚠️ On Block Producer

Stop the Dingo node by running:
```
sudo systemctl stop dingo
```

Add the following lines to your `dingo.yaml` file by running:

```
sudo bash -c "cat <<EOF >> /etc/dingo/dingo.yaml
# Validator / block producer (core storage, API ports ignored):
blockProducer: true
shelleyVrfKey: \"$HOME/dingo/vrf.skey\"
shelleyKesKey: \"$HOME/dingo/kes.skey\"
shelleyOperationalCertificate: \"$HOME/dingo/node.cert\"
EOF"
```

You can view and verify our `dingo.yaml` file by running:

```
sudo nano /etc/dingo/dingo.yaml
```

***

## Step 10 - Start Dingo Node

```
sudo systemctl start dingo
```

***

## Step 11 - Check Status

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

>💡 Tip: You can use the <a href="https://docs.cardano.org/cardano-testnets/tools/faucet" target="_blank">Cardano faucet</a> to request some test ADA be delegated to your pool. Select the Preview testnet and select `receive pool delegation`. Then paste your pool id which you can copy from your favorite Cardano Explorer.

***

### Congratulations! You are now running a Dingo stake pool on the Preview network.
