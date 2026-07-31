---
title: Using nview to Monitor Your Dingo Nodes
description: SPO Guide for Dingo Pools - How to Use nview to Monitor Your Dingo Nodes.
---

nview is a local monitoring tool for a Cardano Node meant to complement remote monitoring tools by providing a local view of a running node from the command line. It is a TUI (terminal user interface) designed to fit most screens.

Simply download the `nview` binary file from blinklabs.io on to your node server. Then run nview in the server command line. It's that simple to use and you will get monitoring right out of the box!

To get started, follow the steps below.

## Step 1 - Download the nview binary from Blink Labs
Copy the download URL from the Blink Labs GitHub releases page and run the following command on your node server.

⚠️ Adjust the download URL to match the version and architecture you want to download. 

> 💡 Tip: You can download the latest nview release from the <a href="https://github.com/blinklabs-io/nview/releases" target="_blank">https://github.com/blinklabs-io/nview/releases</a> page.

```
cd ~/dingo
wget -O - https://github.com/blinklabs-io/nview/releases/download/v0.15.0/nview-v0.15.0-linux-amd64 > nview
```

***


## Step 2 - Change Permissions

For this example, we named the binary file `nview` and saved the file to our `~/dingo` directory. 

To make the binary executable, run:

⚠️ Adjust the file path and file name if needed. 

```
chmod +x ~/dingo/nview
```


***


## Step 3 - Run `nview`

Run `nview`

⚠️ For this example, the `nview` binary is located in the `~/dingo` directory.

```
cd ~/dingo
./nview
```

<!-- ![nview-screen](/nview-screen.png) ONCE UPDATED I WILL INSERT DINGO SCREENSHOT -->

***


### Congratulations! You are now ready to monitor your Dingo node using nview.

Running `nview` against a Dingo Node works out of the box with the default node configuration. However, if you need to make changes, you can run nview with a configuration file. 

Want to customize the `nview` configuration? See our guide on using an [nview configuration file](../../../nview/003-using-config-file).
