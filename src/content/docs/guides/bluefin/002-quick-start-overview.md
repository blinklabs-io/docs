---
title: Quick Start Guide
description: Bluefin Quick Start Overview.
---

# Bluefin

Bluefin a standalone Fortuna (TUNA) miner, written in Go, which syncs the chain, mines for TUNA, and submits transactions to remote nodes without any other infrastructure..

Bluefin is self-contained and runs with no external dependencies. You can run it via the <a href="https://github.com/blinklabs-io/bluefin/pkgs/container/bluefin" target="_blank">Docker images</a> or binaries from the <a href="https://github.com/blinklabs-io/bluefin/releases" target="_blank">releases page</a>.

<br>

For this guide we will walk you through downloading the binary and running the Bluefin binary. To get started follow the steps below.

<br>

⚠️ This guide assumes typical Linux setup. Please adjust commands and paths as needed.

***

<br>

## Step 1 - Download binary from Blinklabs  
<br>

**Step 1-A** - First start by going to <a href="https://blinklabs.io/projects-open-source" target="_blank">https://blinklabs.io/projects-open-source</a> and scroll down to Bluefin.

![bluefin-blinklabs-site](/bluefin-blinklabs-site.png)
<br>


**Step 1-B** - Select the operating system that you want to use to run Bluefin.  

![bluefin-blinklabs-site-operating-system](/bluefin-blinklabs-site-operating-system.png)
<br>

**Step 1-C** - You can either download the binary file and move the file to your preferred location or...  

![bluefin-blinklabs-site-download](/bluefin-blinklabs-site-download.png)

<br>

Copy the path from Blinklabs and run the following command to download the binary file.  

<br>

⚠️ Adjust the link path to the correct path for the version you want to download. 

> 💡 Tip: You can download the latest Bluefin release from the <a href="https://github.com/blinklabs-io/bluefin/releases" target="_blank">https://github.com/blinklabs-io/bluefin/releases</a> page.

```
wget -cO - https://github.com/blinklabs-io/bluefin/releases/download/v0.13.3/bluefin-v0.13.3-linux-amd64 > bluefin
```

***

<br>

## Step 2 - Change Permissions

<br>

For this example, we named the binary file `bluefin`. To make the file executable run the following command:

<br>

⚠️ Adjust the file path and file name if needed. 

```
chmod +x bluefin
```

***

<br>

## Step 3 - Running Bluefin

<br>

> 📝 Bluefin is designed to take its configuration from environment variables. All examples below show running the bluefin binary directly from the shell and will need to be adapted for use with Docker.
>
> When run with no configuration, bluefin defaults to mining TUNA v1 on mainnet. It will generate a new wallet and write the seed phrase to the seed.txt file in the current directory.

```
./bluefin
...
{"level":"info","timestamp":"2024-07-04T20:13:53-05:00","caller":"wallet/wallet.go:62","msg":"wrote generated mnemonic to seed.txt"}
{"level":"info","timestamp":"2024-07-04T20:13:53-05:00","caller":"bluefin/main.go:73","msg":"loaded mnemonic for address: addr1..."}
{"level":"info","timestamp":"2024-07-04T20:13:53-05:00","caller":"bluefin/main.go:79","msg":"starting indexer on mainnet"}
```

You can use the `NETWORK` and `PROFILE` environment variables to change the mode that bluefin operates in.
For example, to mine TUNA v2 on `preview`:

```
NETWORK=preview PROFILE=tuna-v2 ./bluefin
```

If you want to provide your own wallet seed phrase, you can set the `MNEMONIC` environment variable or create the `seed.txt` file before
running bluefin.

### Seeding the wallet

If allowing bluefin to generate a new wallet, you will need to seed the wallet with some initial funds using the wallet address
logged at startup. If the wallet already exists, you may need to send funds back to your own wallet so that they're visible to bluefin.
The wallet will need at least 2 available UTxOs, one to cover TX fees, and another of at least 5 (t)ADA to use as collateral.

### Submitting TXs

By default, bluefin will use the NtN (node-to-node) TxSubmission protocol to submit transactions directly to the Cardano network.
This method has the downside of not providing any feedback if a transaction fails. You can use the `SUBMIT_URL` environment variable
to specify the URL for a submit API to use instead, which will provide feedback about any transaction validation issues.

### Clearing the local data

Bluefin stores its local data in `.bluefin/` in the current directory. If you run into a problem that requires clearing the data, you can
delete this data and bluefin will re-sync from scratch.
