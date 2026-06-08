---
title: Generate Pool Keys
description: SPO Guide for Dingo Pools - Generate Pool Keys.
---

# Dingo - Block Production Keys

We will now generate the Pool Keys needed for Block Production on the Preview Network. 


| Key	| Purpose	| Where it lives
|-------|---------------|-------------------|
|Cold key<br> (cold.skey / cold.vkey)	|Authorizes pool registration and KES rotation	|Air-gapped machine only — never transferred
|KES key<br> (kes.skey / kes.vkey)	|Signs blocks; rotated every ~90 days	|kes.skey - Block producer
|VRF key<br> (vrf.skey / vrf.vkey)	|Proves slot leadership	|vrf.skey - Block producer
|Operational certificate<br> (node.cert)	|Binds KES key to cold key for the node	|Block producer


For background on what these keys do, see <a href="https://developers.cardano.org/docs/operate-a-stake-pool/basics/cardano-key-pairs/" target="new" >Cardano Key Pairs</a>.

***

> ⚠️ The following guide assumes you have already completed the following 3 steps. If not please do them first and return here when you done. 
> 
> - [x] 1. Complete the [Quick Start](../002-quick-start-overview) guide.
> - [x] 2. [Create Start Up Serivce](../003-create-start-up-service)
> - [x] 3. [Install Cardano CLI](../004-using-dingo-with-cardano-cli)

***

✅ This guide assumes your files are in the $HOME/dingo folder. Adjust paths below if necessary.

## Step 1 - Generate KES key pair

```
cd ~/dingo
cardano-cli conway node key-gen-KES \
--verification-key-file kes.vkey \
--signing-key-file kes.skey
```

***

## Step 2 - Make a directory to store your cold keys

⚠️ On Air Gapped

```
mkdir $HOME/dingo/cold-keys
pushd $HOME/dingo/cold-keys
```

***

## Step 3 - Generate set of cold keys and create the cold counter file

⚠️ On Air Gapped

```
cardano-cli conway node key-gen \
--cold-verification-key-file node.vkey \
--cold-signing-key-file node.skey \
--operational-certificate-issue-counter node.counter
```

***

## Step 4 - Find the starting KES period

We need the Shelley Genesis json file to run our CLI command

So we will create a directory to store our Cardano configuration files. For this example, the file structure we will create is `/config/cardano/preview/` by running the following command in our `dingo` directory:

```
cd ~/dingo
mkdir -p config/cardano/preview
```

Now we will navigate to the `config/cardano/preview` folder and download the Cardano Shelley Genesis file.

```
cd config/cardano/preview
```

To download the Shelley Genesis file run:

```
wget https://book.play.dev.cardano.org/environments/preview/shelley-genesis.json
```

> 💡 Tip: Cardano Configuration Files can be found at <a href="https://book.play.dev.cardano.org/environments.html" target="_blank">https://book.play.dev.cardano.org/environments.html</a>

***

Now we can find the starting KES period by running:
```
slotNo=$(cardano-cli conway query tip --testnet-magic 2 | jq -r '.slot')
slotsPerKESPeriod=$(cat $HOME/dingo/config/cardano/preview/shelley-genesis.json | jq -r '.slotsPerKESPeriod')
kesPeriod=$((${slotNo} / ${slotsPerKESPeriod}))
startKesPeriod=${kesPeriod}
echo startKesPeriod: ${startKesPeriod}
```

📝 WRITE DOWN THIS NUMBER

***

## Step 5 - Generate operational certificate for your pool

✅ Change the <startKesPeriod> value you wrote down in the previous step.

⚠️ On Air Gapped once you have copied kes.vkey to your cold environment.

```
cd ~/dingo
cardano-cli conway node issue-op-cert \
--kes-verification-key-file kes.vkey \
--cold-signing-key-file $HOME/dingo/cold-keys/node.skey \
--operational-certificate-issue-counter $HOME/dingo/cold-keys/node.counter \
--kes-period <startKesPeriod> \
--out-file node.cert
```

***

## Step 6 - Copy node.cert to your hot environment

Copy your `node.cert` file to your Block Producer.
***

## Step 7 - Generate a a VRF key pair

```
cd ~/dingo
cardano-cli conway node key-gen-VRF \
--verification-key-file vrf.vkey \
--signing-key-file vrf.skey
```

***

## Step 8 - Update vrf key permissions to read-only. You must also copy vrf.vkey to your cold environment.

```
chmod 400 vrf.skey
```

***

## Step 9 - Update your `dingo.yaml` with the new KES, VRF and Operation Certificate

Stop Dingo node by running:
```
sudo systemctl stop dingo
```

Add the following lines to your `dingo.yaml` file by running:

```
sudo bash -c 'cat <<EOF >> /etc/dingo/dingo.yaml
# Validator / block producer (core storage, API ports ignored):
storageMode: "core"
blockProducer: true
shelleyVrfKey: "$HOME/dingo/vrf.skey"
shelleyKesKey: "$HOME/dingo/kes.skey"
shelleyOperationalCertificate: "$HOME/dingo/opcert.cert"
EOF'
```

***

## Step 10 - Start Digno Node

```
sudo systemctl start dingo
```

***

> ### Reminder
>**Block-producing Node**
> The only stake pool keys and certs that should be on the block producer, are the following three files.
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
> **All other keys must remain offline in your air-gapped offline cold environment.**
> 
> **Relay Nodes**
> Relay nodes must NOT store any operational certificates, vrf, skey or cold keys.
