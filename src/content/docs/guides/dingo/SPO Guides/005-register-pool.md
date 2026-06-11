---
title: Registering Stake Pool
description: SPO Guide for Dingo Pools - Registering Your Stake Pool.
---

# Dingo - Registering Your Stake Pool

✅ This guide assume your files are in the $HOME/dingo folder. Adjust paths below if necessary.

## Step 1






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
