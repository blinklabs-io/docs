---
title: Adder - Example 4
description: Adder Example 4 - Watch a Smart Contract for a Specific Asset ID and get a Desktop Notification.
---

# Watch a Smart Contract for a Specific Asset ID and get a Desktop Notification

This example is a bit more advanced, where we use Adder to watch a smart contract to see if a certain asset was added or removed from the contract.

> ⚠️Before we breakdown the filters and commands we will use for this example we assume you already have a smart contract policy in mind that you want to watch.


![adder-policy-id](/adder-policy-id.png)

<br />

For this example, the smart contract policy id that we are going to watch is:

```
c04e78ea267631f27975446a15d96ef1f3bbcdbf99577d3e552c663b
```

<br />

> ✅ For this guide we assume you have already downloaded the Adder exe and have opened a command prompt. If not see our [Quick Start](../quick-start-overview) guide.



***

Let's start by picking an asset that we want to follow. If this asset is used in the smart contract we are following, we will get a desktop alert.

## Step 1 - Get Asset ID / Fingerprint

In order to filter by a Token that we want to watch we need the asset id also known as the asset fingerprint. We can use tools like <a href="https://www.cexplorer.io" target="_blank">cexplorer.io</a> to search by a token name so we can get the asset id / asset fingerprint.

![adder-cTOSI-cexploer](/adder-cTOSI-cexploer.png)

<br />

📝Make note of the asset fingerprint, we will need it later. For this example, we used the following asset id / asset fingerprint:

```
asset1uaxup2yv695uat3chgwqtpg9xvau55pd5z6r46
```

***

Now that we have our asset id / asset fingerprint that we want to monitor, we are ready to look at the filters and commands we will use. For this example, we will use:

* Filter Policy
* Filter Asset
* Filter Type
* Output

## Filter Policy

We will use the smart contract policy id from above to tell Adder to watch this policy by using the following filter:

```
-filter-policy c04e78ea267631f27975446a15d96ef1f3bbcdbf99577d3e552c663b
```

## Filter Asset

We can use the asset fingerprint for cTOSI from above to have Adder track transactions with that fingerprint by using the following filter:

```
-filter-asset asset1uaxup2yv695uat3chgwqtpg9xvau55pd5z6r46
```

## Filter Type - Transaction

For this example, we want to get alerts when a transaction occurs with the smart contract, either when sending or receiving the cTOSI asset. To do this we will add the following filter:

```
-filter-type chainsync.transaction
```

## Output

We want the output to be a desktop notification. So when a transaction that contains cTOSI occurs with the smart contract, we will receive a desktop notification. To do this we will add the following command:

```
-output notify
```

***

## Putting it All Together

To get desktop notifications when a transaction includes the Tosidrop token cTOSI, within the smart contract we will run the following command in our command prompt:

> ⚠️ Please adjust the path to your Adder exe. In this example it's on the Desktop for user richm.\
> Also adjust to the asset id and policy id that you want to track.


```
C:\Users\richm\Desktop\adder-v0.26.0-windows-amd64.exe -filter-type chainsync.transaction -filter-asset asset1uaxup2yv695uat3chgwqtpg9xvau55pd5z6r46 -filter-policy c04e78ea267631f27975446a15d96ef1f3bbcdbf99577d3e552c663b -output notify
```


### Congratulations!

Now you can minimize the window and let Adder run in the background. Anytime a transaction occurs containing cTOSI in our smart contract you will get a desktop alert.

![adder-desktop-alert](/adder-desktop-alert.png)

***


> 💡TIP: You can get a list of all available commands by using the `-h` or `-help` flag.

See our other examples to see what else Adder can do and unlock the power of Adder 💪

1. [Example 1](../example-1-watch-my-wallet-and-get-a-desktop-notification) - Watch My Wallet and get a Desktop Notification
2. [Example 2](../example-2-watch-a-token-and-get-a-desktop-notification) - Watch a Token and get a Desktop Notification
3. [Example 3](../example-3-watch-an-spo-and-get-an-alert-in-discord) - Watch an SPO and get an Alert in Discord
4. [Example 4](../example-4-watch-a-smart-contract-for-a-specific-asset-id-and-get-a-desktop-notification) - Watch a Smart Contract for a Specific Asset ID and get a Desktop Notification
