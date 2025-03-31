---
title: Quick Start Guide
description: TxTop Quick Start Overview.
---

# Quick Start

TxTop is a mempool inspector for Cardano Node software.

TxTop is a local monitoring tool for a Cardano Node (cardano-node) meant to provide a local view of a running node's mempool transactions with a simple icon legend for at-a-glance transaction categorization.
 
<!---

Simply download the nview binary file from blinklabs.io on to your node server. Then run nview in the server command line. It's that simple to use and you will get monitoring right out of the box! 

To get started follow the steps below

***


## Step 1 - Download binary from Blinklabs  
<br>

**Step 1-A** - First start by going to <a href="https://blinklabs.io/projects-open-source" target="_blank">https://blinklabs.io/projects-open-source</a> and scroll down to TxTop.  

![nview-blinklabs-site](/nview-blinklabs-site.png)
<br>

**Step 1-B** - Select the operating system of your node server.  

![nview-blinklabs-site-operating-system](/nview-blinklabs-site-operating-system.png)
<br>

**Step 1-C** - You can either download the binary file and move the file to your node server or...  

![nview-blinklabs-site-download](/nview-blinklabs-site-download.png)

<br>

Copy the path from Blinklabs and run the following command to download the binary file on your node server  

![nview-blinklabs-site-copy-link](/nview-blinklabs-site-copy-link.png)
<br>

⚠️ Adjust the link path to the correct path for the version you want to download. 

```
wget -cO - https://github.com/blinklabs-io/txtop/releases/download/v0.12.3/txtop-v0.12.3-linux-amd64 > txtop
```

***


## Step 2 - Change Permissions

For this example, we named the binary file `txtop` and saved the file to our `$NODE_HOME` folder. To make the file executable run the following command:

⚠️ Adjust the file path and file name if needed. 

```
chmod +x $NODE_HOME/txtop
```


***


## Step 3 - Run txtop

Run the executable file by running the following command.

⚠️ For this example, we named the binary file `txtop` and saved the file to our `$NODE_HOME` folder.

```
cd $NODE_HOME
./txtop
```

![nview-screen](/nview-screen.png)

***


### Congratulations you are ready to start inspecting your mempool transactions with TxTop!

-->

