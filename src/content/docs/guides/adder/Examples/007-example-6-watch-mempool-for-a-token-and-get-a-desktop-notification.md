---
title: Watch Mempool for a transaction with a Token
description: Adder Example 6 - Watch Mempool for a Transaction with a Token.
---

In this example we will use Adder to send us a desktop notification when there is a transaction in our mempool that includes a certain token or asset that we want to track.

⚠️ Mempool is used for pre-accepted transactions. If higher assurance is needed, use `input-chainsync`.

> ✅ For this guide we assume you are running Adder on same machine as your node. If not see our [Adder Linux Guide](../../005-use-adder-on-linux).

***

Let us start by picking an asset that we want to follow.

## Step 1 - Get Asset ID / Fingerprint

In order to filter by a Token that we want to watch we need the asset id also known as the asset fingerprint. We can use tools like <a href="https://www.cexplorer.io" target="_blank">cexplorer.io</a> to search by a token name so we can get the asset id / asset fingerprint.

![adder-cTOSI-cexploer](/adder-cTOSI-cexploer.png)

📝 Make note of the asset fingerprint, we will need it later. For this example, we used the following asset id / asset fingerprint:

```
asset1uaxup2yv695uat3chgwqtpg9xvau55pd5z6r46
```

***

## Step 2 - Selecting Adder Commands

Now that we have our asset id / fingerprint that we want to monitor, we are ready to look at the filters and commands we will use. For this example, we will use:

* Input Mempool Socket Path
* Filter Asset
* Filter Type
* Output

### Input Mempool Socket Path

We need to specifiy socket path for the mempool of a Cardano Node that we are running Adder on. 

⚠️ Adjust the file path below to match your path

```
---input-mempool-socket-path /home/user/cardano-my-node/db/socket
```

💡 Tip: To find the path to your node socket run the following command:

```
echo $CARDANO_NODE_SOCKET_PATH
```

<br>

### Filter Asset

We can use the asset fingerprint from above for cTOSI to have Adder track transactions with that fingerprint by using the following filter:

```
--filter-asset asset1uaxup2yv695uat3chgwqtpg9xvau55pd5z6r46
```

### Filter Type - Transaction

For this example, we want to get alerts when a transaction occurs using the cTOSI asset id / fingerprint. To do this we will add the following filter:

```
--filter-type input.transaction
```

### Output

We want the output events to console using logger. So that when a transaction that contains cTOSI occurs, we will receive log to console. To do this we will add the following command:

```
--output log
```

***

## Step 3 - Putting it All Together

To get desktop notifications when a transaction includes the Tosidrop token cTOSI, we will run the following command in our command prompt:

> ⚠️ Please adjust socket path


```
./adder ---input-mempool-address backbone.cardano.iog.io:3001 --filter-type input.transaction --filter-asset asset1uaxup2yv695uat3chgwqtpg9xvau55pd5z6r46 --output log
```

### Congratulations!

Anytime a transaction appears in our mempool containing cTOSI you will get a log event.

***

> 💡 TIP: You can get a list of all available commands by using the `-h` or `--help` flag.

See our other examples to see what else Adder can do and unlock the power of Adder 💪

1. [Example 1](../002-example-1-watch-my-wallet-and-get-a-desktop-notification) - Watch My Wallet and get a Desktop Notification
2. [Example 2](../003-example-2-watch-a-token-and-get-a-desktop-notification) - Watch a Token and get a Desktop Notification
3. [Example 3](../004-example-3-watch-an-spo-and-get-an-alert-in-discord) - Watch an SPO and get an Alert in Discord
4. [Example 4](../005-example-4-watch-a-smart-contract-for-a-specific-asset-id-and-get-a-desktop-notification) - Watch a Smart Contract for a Specific Asset ID and get a Desktop Notification
5. [Example 5](../006-example-5-watch-an-drep-and-get-an-alert-in-telegram) - Watch an DRep and get an Alert in Telegram
6. [Example 6](../007-example-6-watch-mempool-for-a-token) - Watch Mempool for a Transaction with a Token
