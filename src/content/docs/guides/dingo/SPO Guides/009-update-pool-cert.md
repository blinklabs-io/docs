---
title: Update Pool Cert 
description: SPO Guide for Dingo Pools - Update Pool Certificate.
---

# Dingo - Updating the Pool Certificate
Over time, you may need to update your pool certificate (`pool.cert`) to change your pledge amount, fees or relay information. This guide will walk you through the process.

> ✅ This guide assumes you generated your original `pool.cert` by following the [Register Your Stake Pool](../005-register-pool) guide.
> 
> ⚠️ If you're changing your preview-pool-metadata.json, recalculate the metadata hash and upload the updated file before continuing. Follow steps listed in [Register Your Stake Pool](../005-register-pool) guide.


***

## Step 1 - Edit the `env` file
Update the values in your `env` file with the updated information for your pool.

⚠️ On an air-gapped machine

```
sudo nano $HOME/dingo/pool-scripts/env
```

Sample `env` file:
```
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
```

***

## Step 2 - Execute the Script
The script must be executed in order to generate the new stake pool registration certificate, which will need to be submitted with a transaction.

```
cd $HOME/dingo/pool-scripts
./pool-registration.sh
```

***

## Step 3 - Copy pool.cert to your hot environment
Copy `pool.cert` to the `~/dingo` directory on your hot environment (block producer or relay node).

***

## Step 4 - Submit the Pool Certificate
Build and sign the transaction to submit the updated `pool.cert` on-chain.

### Step 4.1 - Query the current slot
```
currentSlot=$(cardano-cli conway query tip --testnet-magic 2 | jq -r '.slot')
echo Current Slot: $currentSlot
```

### Step 4.2 - Build the Transaction
```
cd ~/dingo
cardano-cli conway transaction build \
    --tx-in $(cardano-cli query utxo --address $(cat payment.addr) --out-file /dev/stdout | jq -r 'keys[0]') \
    --change-address $(cat payment.addr) \
    --certificate-file pool.cert \
    --invalid-hereafter $(( ${currentSlot} + 1000 )) \
    --witness-override 2 \
    --out-file tx.raw
```

> 💡 Tip: OPTIONAL - To double-check that you have the correct values for your pool.cert run:
> ```
> cardano-cli debug transaction view \
> --tx-body-file tx.raw
> ```

### Step 4.3 - Sign the Transaction
Copy `tx.raw` to your cold environment in your `~dingo` directory

⚠️ On an air-gapped machine
```
cd ~/dingo
cardano-cli conway transaction sign \
--tx-body-file tx.raw \
--signing-key-file payment.skey \
--signing-key-file $HOME/dingo/cold-keys/node.skey \
--out-file tx.signed
```

### Step 4.4 - Submit the Transaction
Copy `tx.signed` to the `~/dingo` directory on your hot environment (block producer or relay node).

```
cd ~/dingo
cardano-cli conway transaction submit --tx-file tx.signed
```

***

## Step 5 - Verify the Registration
Changes take effect in two epochs. After the next epoch transition, verify that your pool settings are correct.

Wait a few minutes for the transaction to reach the chain, then you can use your preferred Cardano explorer to see if transaction was successful like: https://cardanoscan.io/
