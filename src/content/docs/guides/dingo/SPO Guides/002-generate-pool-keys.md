---
title: Generate Pool Keys
description: SPO Guide for Dingo Pools - Generate Pool Keys.
---

# Dingo Node - Block Production Keys

We will now generate the pool keys needed for block production on the Preview network. 


| Key	| Purpose	| Where it lives
|-------|---------------|-------------------|
|Cold key<br> (node.skey / node.vkey)	|Authorizes pool registration and KES rotation	|Air-gapped machine only — never transferred
|KES key<br> (kes.skey / kes.vkey)	|Signs blocks; rotated before KES expiration	|kes.skey - Block producer
|VRF key<br> (vrf.skey / vrf.vkey)	|Proves slot leadership	|vrf.skey - Block producer
|Operational certificate<br> (node.cert)	|Binds KES key to cold key for the node	|Block producer


For background on what these keys do, see <a href="https://developers.cardano.org/docs/operate-a-stake-pool/basics/cardano-key-pairs/" target="new" >Cardano Key Pairs</a>.

***

> ⚠️ The following guide assumes you have already completed the Dingo Node Setup and your node is 100% synced. If not please complete first and return here when you are done. 

***

✅ This guide assumes your files are in the $DINGO_HOME directory. Adjust paths below if necessary.

## Step 1 - Generate KES key pair

```
cd $DINGO_HOME
cardano-cli conway node key-gen-KES \
--verification-key-file kes.vkey \
--signing-key-file kes.skey
```

***

<br>

## Step 2 - Make a directory to store your cold keys

⚠️ On an air-gapped machine

Make directory and move into it:
```
mkdir -p "$DINGO_HOME/cold-keys" && cd "$DINGO_HOME/cold-keys"
```

***

<br>

## Step 3 - Generate a set of cold keys and create the cold counter file

⚠️ On an air-gapped machine

```
cardano-cli conway node key-gen \
--cold-verification-key-file node.vkey \
--cold-signing-key-file node.skey \
--operational-certificate-issue-counter node.counter
```

***

<br>

## Step 4 - Find the starting KES period

We need the Shelley Genesis JSON file to run our CLI command.

We will create a directory to store our Cardano configuration files. For this example, we will use the following directory structure `$DINGO_HOME/config/` by running the following command:

Make directory and move into it:
```
mkdir -p "$DINGO_HOME/config" && cd "$DINGO_HOME/config"
```

To download the Shelley Genesis file, run:

```
wget https://book.play.dev.cardano.org/environments/preview/shelley-genesis.json
```

> 💡 Tip: Cardano Configuration Files can be found at <a href="https://book.play.dev.cardano.org/environments.html" target="_blank">https://book.play.dev.cardano.org/environments.html</a>

***

**Now we can find the starting KES period by running:**

```
cd $DINGO_HOME
slotNo=$(cardano-cli conway query tip --testnet-magic 2 | jq -r '.slot')
slotsPerKESPeriod=$(cat $DINGO_HOME/config/shelley-genesis.json | jq -r '.slotsPerKESPeriod')
kesPeriod=$((${slotNo} / ${slotsPerKESPeriod}))
startKesPeriod=${kesPeriod}
echo startKesPeriod: ${startKesPeriod}
```

📝 WRITE DOWN THIS NUMBER.

***

<br>

## Step 5 - Generate the operational certificate for your pool

✅ Change the <startKesPeriod> value you wrote down in the previous step.

⚠️ On an air‑gapped machine, after you have copied `kes.vkey` to your cold environment.

```
cd $DINGO_HOME
cardano-cli conway node issue-op-cert \
--kes-verification-key-file kes.vkey \
--cold-signing-key-file $DINGO_HOME/cold-keys/node.skey \
--operational-certificate-issue-counter $DINGO_HOME/cold-keys/node.counter \
--kes-period <startKesPeriod> \
--out-file node.cert
```

***

<br>

## Step 6 - Copy node.cert to your hot environment

Copy your `node.cert` file to your Block Producer.

***

<br>

## Step 7 - Generate a VRF key pair

```
cd $DINGO_HOME
cardano-cli conway node key-gen-VRF \
--verification-key-file vrf.vkey \
--signing-key-file vrf.skey
```

***

<br>

## Step 8 - Update VRF key permissions to read-only. 

You must also copy `vrf.vkey` to your cold environment.

```
chmod 400 vrf.skey
```

***

> ### Reminder
>**Block-producing Node**
> The only stake pool keys and certs that should be stored on the block producer, are the following three files:
> 
> ```
> ###
> ### On block producer node
> ###
> KES = kes.skey
> VRF = vrf.skey
> CERT = node.cert
> ```
> 
> **All other keys must remain offline in your air-gapped cold environment.**
> 
> **Relay Nodes**
> Relay nodes must NOT store operational certificates, VRF keys, signing keys, or cold keys.

***

<br>

### Congratulations! You are ready to move to the next section.
