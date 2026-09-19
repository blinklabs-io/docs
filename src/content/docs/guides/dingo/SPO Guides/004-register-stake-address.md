---
title: Register Stake Address
description: SPO Guide for Dingo Pools - Registering Your Stake Address.
---

# Dingo - Register Stake Address

> The stake address must be registered on-chain before it can be used. This costs transaction fees plus a deposit (currently 2 ADA, as defined by the network protocol parameters). The deposit is returned when the stake address is deregistered.

✅ This guide assumes your files are in the $DINGO_HOME folder. Adjust paths below if necessary.

## Step 1 - Generate the stake registration certificate

⚠️ On an air-gapped machine

```
cd $DINGO_HOME
cardano-cli conway stake-address registration-certificate \
--stake-verification-key-file stake.vkey \
--key-reg-deposit-amt "$(jq -r '.stakeAddressDeposit' params.json)" \
--out-file stake.cert
```

***

<br>

## Step 2 - Build the transaction 
Copy `stake.cert` to the `$DINGO_HOME` directory on your hot environment.


Query the current slot (used for `--invalid-hereafter`):

```
currentSlot=$(cardano-cli conway query tip --testnet-magic 2 | jq -r '.slot')
echo Current Slot: $currentSlot
```

Next, build the transaction. The `transaction build` command calculates fees and change automatically:

```
cd $DINGO_HOME
cardano-cli conway transaction build \
--tx-in $(cardano-cli query utxo --address $(cat payment.addr) --out-file /dev/stdout | jq -r 'keys[0]') \
--change-address $(cat payment.addr) \
--certificate-file stake.cert \
--invalid-hereafter $(( ${currentSlot} + 1000 )) \
--witness-override 2 \
--out-file tx.raw
```

> `--witness-override 2` tells the fee estimator that two keys will sign (payment + stake).

***

<br>

## Step 3 - Sign the transaction

Copy `tx.raw` to the `$DINGO_HOME` directory on your air-gapped machine.

Sign the transaction using both the payment and stake signing keys:

⚠️ On an air-gapped machine

```
cd $DINGO_HOME
cardano-cli conway transaction sign \
--tx-body-file tx.raw \
--signing-key-file payment.skey \
--signing-key-file stake.skey \
--out-file tx.signed
```

***

<br>

## Step 4 - Submit the transaction

Copy `tx.signed` to the `$DINGO_HOME` directory on your hot environment.

```
cd $DINGO_HOME
cardano-cli conway transaction submit --tx-file tx.signed
```

***

<br>

### Congratulations! You are ready to move to the next section.
