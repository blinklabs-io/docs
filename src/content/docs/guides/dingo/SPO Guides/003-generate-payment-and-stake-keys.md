---
title: Generate Payment and Stake Keys
description: SPO Guide for Dingo Pools - Generate Payment and Stake Keys.
---

# Dingo - Generate Payment and Stake Keys

✅ This guide assumes your files are in the $HOME/dingo folder. Adjust paths below if necessary.

## Step 1 - Obtain the protocol-parameters

```
cd ~/dingo
cardano-cli conway query protocol-parameters \
--testnet-magic 2 \
--out-file params.json
```

***

## Step 2 - Generate a new payment key pair
Generate a new payment key pair: `payment.skey` and `payment.vkey`

⚠️ On Air Gapped

```
cd ~/dingo
cardano-cli conway address key-gen \
--verification-key-file payment.vkey \
--signing-key-file payment.skey
```

***

## Step 3 - Generate a new stake address key pair
Generate a new stake address key pair: `stake.skey` and `stake.vkey`

⚠️ On Air Gapped

```
cardano-cli conway stake-address key-gen \
--verification-key-file stake.vkey \
--signing-key-file stake.skey
```

***

## Step 4 - Generate your stake address
Generate your stake address from the stake address verification key and store it in `stake.addr`

⚠️ On Air Gapped

```
cardano-cli conway stake-address build \
--stake-verification-key-file stake.vkey \
--out-file stake.addr \
--testnet-magic 2
```

***

## Step 5 - Generate payment address
Generate payment address for the payment key `payment.vkey` and stake key `stake.vkey` and store it in `payment.addr`

```
cardano-cli conway address build \
--payment-verification-key-file payment.vkey \
--stake-verification-key-file stake.vkey \
--out-file payment.addr \
--testnet-magic 2
```

✅ **Copy payment.addr to your hot environment.**

Run the following to see and copy your payment address.
```
cat payment.addr
```

***

## Step 6 -  Fund your wallet
On testnet, use the <a href="https://docs.cardano.org/cardano-testnets/tools/faucet" target="_blank">Cardano faucet</a> to get test ADA. Select the Preview testnet and paste your payment.addr.

After funding your account, check your payment address balance.

```
cardano-cli conway query utxo \
--address $(cat payment.addr) \
--testnet-magic 2
```
