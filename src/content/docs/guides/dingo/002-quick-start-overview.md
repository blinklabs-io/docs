---
title: Quick Start Guide
description: Dingo Quick Start Overview.
---

# Dingo

A Cardano blockchain data node written in Go which actively participates in network communications on the Cardano blockchain using the Ouroboros Network Node-to-Node family of mini-protocols. This project was funded in Project Catalyst Fund 12.

⚠️ This is a work in progress and is currently under heavy development

<br>

For this guide we will walk you through downloading and running the Dingo binary. To get started follow the steps below.

<br>

✅ This guide assumes typical Linux setup. Please adjust commands and paths as needed.

***

<br>

## Step 1 - Download binary from Blinklabs  
<br>

**Step 1-A** - First start by going to <a href="https://blinklabs.io/projects-open-source" target="_blank">https://blinklabs.io/projects-open-source</a> and scroll down to Dingo.

![dingo-blinklabs-site](/dingo-blinklabs-site.png)
<br>


**Step 1-B** - Select the operating system that you want to use to run Dingo.  

![dingo-blinklabs-site-operating-system](/dingo-blinklabs-site-operating-system.png)
<br>

**Step 1-C** - You can either download the binary file and move the file to your preferred location or...  

![dingo-blinklabs-site-download](/dingo-blinklabs-site-download.png)

<br>

Copy the path from Blinklabs and run the following command to download the binary file.  

<br>

⚠️ Adjust the link path to the correct path for the version you want to download. 

> 💡 Tip: You can download the latest Dingo release from the <a href="https://github.com/blinklabs-io/dingo/releases" target="_blank">https://github.com/blinklabs-io/dingo/releases</a> page.

```
wget -c https://github.com/blinklabs-io/dingo/releases/download/v0.12.1/dingo-v0.12.1-linux-amd64.tar.gz -O - | tar -xz
```

***

## Best Practices - Files Needed to Run Dingo
1. dingo.yaml
2. Node Config
3. Node Topology
4. Byron Genesis
5. Shelley Genesis
6. Alonzo Genesis
7. Conway Genesis

> ✅ Cardano Configuration Files can be found at <a href="https://book.play.dev.cardano.org/environments.html" target="_blank">https://book.play.dev.cardano.org/environments.html</a>

## Step 2 - Download dingo.yaml Example File

For this guide we will use the dingo.yaml file. We will download it to our main dingo directory by using the following command:
```
wget -cO - https://github.com/blinklabs-io/dingo/blob/main/dingo.yaml.example > dingo.yaml
```

## Step 3 - Create Directory and Download Configuration Files

We will create a directory to store our Cardano Configuration Files. For this example the file structure we will create is `/config/cardano/preview/` by running the following command:

```
mkdir -p config/cardano/preview
```

Now we will navigate to the `config/cardano/preview` folder and download the Cardano Configuration Files

```
cd config/cardano/preview
```

We will now download the Cardano Preview Testnet Non-block-producers config file by running:

```
wget https://book.play.dev.cardano.org/environments/preview/config.json
```

Next we will download the Preview Testnet Topology file by running:

```
wget https://book.play.dev.cardano.org/environments/preview/topology.json
```

Lastly we will download the Byron, Shelley, Alonzo, and Conway Genesis files

```
wget https://book.play.dev.cardano.org/environments/preview/byron-genesis.json https://book.play.dev.cardano.org/environments/preview/shelley-genesis.json https://book.play.dev.cardano.org/environments/preview/alonzo-genesis.json https://book.play.dev.cardano.org/environments/preview/conway-genesis.json
```
