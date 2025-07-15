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

⚠️ This guide assumes typical Linux setup. Please adjust commands and paths as needed.

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
