---
title: Register Stake Address
description: SPO Guide for Dingo Pools - Registering Your Stake Address.
---

# Dingo - Register Stake Address

> The stake address must be registered on-chain. This costs transaction fees plus a deposit (currently 2 ADA on mainnet, returned when you deregister).

✅ This guide assumes your files are in the $HOME/dingo folder. Adjust paths below if necessary.

## Step 1 - Generate stake registration certificate

⚠️ On Air Gapped

```
cd ~/dingo
cardano-cli conway stake-address registration-certificate \
    --stake-verification-key-file stake.vkey \
    --out-file stake.cert
```

***

## Step 2 - Build Transaction 
Copy stake.cert to your hot environment to your dingo folder.


Query the current slot (used for --invalid-hereafter):

```
currentSlot=$(cardano-cli query tip | jq -r '.slot')
```

Build the transaction — transaction build calculates fees and change automatically:

```
cd ~/dingo
cardano-cli conway transaction build \
--tx-in $(cardano-cli query utxo --address $(cat payment.addr) --out-file /dev/stdout | jq -r 'keys[0]') \
--change-address $(cat payment.addr) \
--certificate-file stake.cert \
--invalid-hereafter $(( currentSlot + 1000 )) \
--witness-override 2 \
--out-file tx.raw
```

> `--witness-override 2` tells the fee estimator that two keys will sign (payment + stake).

***

## Step 3 - Sign Transaction

Copy tx.raw to your air gapped dingo folder.

Sign with both the payment and stake signing keys:

⚠️ On Air Gapped

```
cd ~/dingo
cardano-cli conway transaction sign \
--tx-body-file tx.raw \
--signing-key-file payment.skey \
--signing-key-file stake.skey \
--out-file tx.signed
```

***

## Step 4 - Submit Transaction

Copy tx.signed to your hot environment in your dingo folder.

```
cd ~/dingo
cardano-cli conway transaction submit --tx-file tx.signed
```
