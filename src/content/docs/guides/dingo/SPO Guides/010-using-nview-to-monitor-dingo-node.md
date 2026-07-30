---
title: Using nview to Monitor Your Dingo Nodes
description: SPO Guide for Dingo Pools - How to Use nview to Monitor Your Dingo Nodes.
---

## How to Use nview to Monitor Your Dingo Nodes 
nview is a local monitoring tool for a Cardano Node meant to complement remote monitoring tools by providing a local view of a running node from the command line. It is a TUI (terminal user interface) designed to fit most screens.

Simply download the nview binary file from blinklabs.io on to your node server. Then run nview in the server command line. It's that simple to use and you will get monitoring right out of the box!

To get started follow the steps below

## Step 1 - Download binary from Blinklabs
Copy the path from Blinklabs and run the following command to download the binary file on your node server

⚠️ Adjust the link path to the correct path for the version you want to download. 

> 💡 Tip: You can download the latest nview release from the <a href="https://github.com/blinklabs-io/nview/releases" target="_blank">https://github.com/blinklabs-io/nview/releases</a> page.

```
cd ~/dingo
wget -O - https://github.com/blinklabs-io/nview/releases/download/v0.15.0/nview-v0.15.0-linux-amd64 > nview
```

***


## Step 2 - Change Permissions

For this example, we named the binary file `nview` and saved the file to our `$NODE_HOME` folder. To make the file executable run the following command:

⚠️ Adjust the file path and file name if needed. 

```
chmod +x ~/dingo/nview
```


***


## Step 3 - 
