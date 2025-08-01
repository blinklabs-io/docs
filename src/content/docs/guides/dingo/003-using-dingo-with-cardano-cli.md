---
title: Using Dingo with Cardano CLI
description: Dingo - How to use Dingo with Cardano CLI.
---

# How to use Dingo with Cardano CLI

Dingo is a Cardano blockchain data node written in Go which actively participates in network communications on the Cardano blockchain using the Ouroboros Network Node-to-Node family of mini-protocols.

⚠️ This is a work in progress and is currently under heavy development

<br>

For this guide we will walk you through downloading and running the Cardano CLI binary and running some Cardano CLI commands. To get started follow the steps below.

<br>

> ✅ For this guide we assume you have already downloaded Dingo and synced the chain. If not see our [Quick Start](../../002-quick-start-overview) guide.

***

## Step 1 - Download the latest Cardano CLI binary 

First start by going to the Cardano CLI repo <a href="https://github.com/IntersectMBO/cardano-cli/releases" target="_blank">https://github.com/IntersectMBO/cardano-cli/releases</a> page.

You can either download the binary file and move the file to your preferred location or... 

<br>

Copy the path to the latest the Cardano CLI binary file and run the following command to download the binary file.

<br>

⚠️ For this example we put the Cardano-cli binary in our `dingo` folder. Adjust the link path to the correct path for the version you want to download. 

```
cd dingo
wget -c https://github.com/IntersectMBO/cardano-cli/releases/download/cardano-cli-10.11.1.0/cardano-cli-10.11.1.0-x86_64-linux.tar.gz -O - | tar -xz
```

***

## Step 2 - Rename File and Change Permissions for the Cardano CLI 

For this example, we will name the binary file `cardano-cli`. To rename the binary will we run the following:

⚠️ Adjust the file path and file name if needed. 

```
mv cardano-cli-x86_64-linux cardano-cli
```


To make the file executable run the following command:

<br>

```
chmod +x cardano-cli
```

***
