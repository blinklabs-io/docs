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

```
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
