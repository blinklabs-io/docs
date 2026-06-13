---
title: Registering Stake Pool
description: SPO Guide for Dingo Pools - Registering Your Stake Pool.
---

# Dingo - Registering Your Stake Pool

✅ This guide assume your files are in the $HOME/dingo folder. Adjust paths below if necessary.

## Step 1 - Create your pool's metadata json file
Update below with your pool's information. 

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
Calculate the hash of your metadata file. It's saved to `previewPoolMetaDataHash.txt`

```
cardano-cli conway stake-pool metadata-hash --preview-pool-metadata.json > previewPoolMetaDataHash.txt
```

Copy previewPoolMetaDataHash.txt to your air-gapped

***

## Step 3 - Upload preview-pool-metadata.json to public web site

Upload your `preview-pool-metadata.json` file to a Web site that you administer or a public Web site. For example, you can upload your pool metadata to GitHub. <a href="https://www.coincashew.com/coins/overview-ada/guide-how-to-build-a-haskell-stakepool-node/part-v-tips/uploading-pool-metadata-to-github" target="_blank">See Coincashew guide here for uploading to GitHub.</a> 

***

## Step 4 - Verify the metadata hashes
First we will get the metadata hash from your metadata json URL.  

Replace <https://www.METADATA-URL.com> with your actual URL from Step 3.
```
cardano-cli conway stake-pool metadata-hash --pool-metadata-file <(curl -s -L <https://www.METADATA-URL.com>)
```

Make sure this hash matches the hash here:
```
cat poolMetaDataHash.txt
```

***

## Step 5  Create a registration certificate for your stake pool

To make udpating your Pool certificate easier if you need to make changes in the furture, we will create a `env` file with our pool information and a script to generate the `pool.cert` file.

### Step 5.1 - Create a pool-scripts folder
⚠️ On Air Gapped

```
cd ~/dingo
mkdir pool-scripts
```

### Step 5.2 - Create an env file
Create an env file for our pool in the pool-scripts folder:

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
METADATA_URL=https://webstie.com/preview-pool-metadata.json
METADATA_HASH=$(cat $HOME/dingo/poolMetaDataHash.txt)
EOF
```
***

## Step 9 - Update your `dingo.yaml` with the new KES, VRF and Operation Certificate

Stop Dingo node by running:
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

## Step 10 - Start Digno Node

```
sudo systemctl start dingo
```

***

## Step 11 - Check Status

Verify Dingo is running:

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
