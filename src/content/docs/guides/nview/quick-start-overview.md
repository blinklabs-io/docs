---
title: nview Quick Start Overview
description: nview Quick Start Overview.
---

# Quick Start

nview is a local monitoring tool for a Cardano Node (cardano-node) meant to complement remote monitoring tools by providing a local view of a running node from the command line. It is a TUI (terminal user interface) designed to fit most screens. 

Simply download the nview binary file from blinklabs.io on to your node server. Then run nview in the server command line. It's that simple to use and you will get monitoring right out of the box! 

To get started follow the steps below

***


## Step 1 - Download binary from Blinklabs

##### Step 1-A - First start by going to <a href="https://blinklabs.io/projects-open-source" target="_blank">https://blinklabs.io/projects-open-source</a> and scroll down to nview. 
<br>

##### Step 1-B - Select the operating system of your node server.

![nview-blinklabs-site-operating-system](/nview-blinklabs-site-operating-system.png)
<br>

##### Step 1-C - You can either download the binary file and move the file to your node server or...  

![nview-blinklabs-site-download](/nview-blinklabs-site-download.png)

<br>

Copy the path from Blinklabs and run the following command to download the binary file on your node server

![nview-blinklabs-site-copy-link](/nview-blinklabs-site-copy-link.png)
<br>

⚠️Adjust link path to correct path for the version you want to download. 

```
wget -cO - https://github.com/blinklabs-io/nview/releases/download/v0.10.7/nview-v0.10.7-linux-amd64 > nview
```

***


## Step 2 - Change Permissions

For this example, we named the binary file `nview` and saved the file to our `$NODE_HOME` folder. To make the file executable run the following command:

```
chmod +x $NODE_HOME/nview
```


***


## Step 3 Run nview

Run the executable file by running the following command.

⚠️For this example, we named the binary file `nview` and saved the file to our `$NODE_HOME` folder.

```
cd $NODE_HOME
./nview
```

![nview-screen](/nview-screen.png)

***


### Congratulations you are ready to start monitoring your node using nview!

Running nview against a running Cardano Node will work out of the box with a default Cardano Node configuration, which exposes metrics in Prometheus data format on a specific port. However, if you need to make change you can run nview with a configuration file. 

Want to adjust the configuration file of nview? See our how to use a [configuration file guide](../using-config-file) for nview.
