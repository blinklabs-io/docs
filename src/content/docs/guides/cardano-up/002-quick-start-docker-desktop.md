---
title: Quick Start using Docker Desktop
description: How to use cardano-up using Docker Desktop.
---

# cardano-up using Docker Desktop on Windows

This guide will walk you through how to use cardano-up on Windows using Docker Desktop. 

To get started follow the steps below

## Step 1 - Download Docker Desktop

First start by going to <a href="https://www.docker.com/products/docker-desktop/" target="_blank">https://www.docker.com/products/docker-desktop/</a> and scroll down to `Download Docker Desktop`

![cardano-up-docker-desktop-website](/cardano-up-docker-desktop-website.png)

## Step 2 - Select Operating System

For this example, we selected Windows - AMD64. Please select your operating system.

![cardano-up-docker-desktop-website-operating-system](/cardano-up-docker-desktop-website-operating-system.png)

Follow the onscreen directions.

![cardano-up-docker-desktop-install](/cardano-up-docker-desktop-install.png)

💡 Tip: Docker Desktop installs a Windows Subsystem for Linux that docker will run in.

![cardano-up-subsystem-install](/cardano-up-subsystem-install.png)



## Step 3 - Open PowerShell as Administrator 

In your search bar type `powershell` and select run as administrator.

![cardano-up-open-powershell-admin](/cardano-up-open-powershell-admin.png)

💡 Tip: you can verify that docker desktop is running by with the following command in your PowerShell

```
wsl -l -v
```

![cardano-up-verify-wsl-docker-desktop](/cardano-up-verify-wsl-docker-desktop.png)

<!--

### Congratulations!

Now we are ready to run Adder with filters and commands so we can track certain information and pick the way we are notified.

<br />


> 💡 TIP: You can get a list of all available commands by using the `-h` or `-help` flag.

<br />


We are now ready to walk through some [examples](../examples/001-using-adder-examples-desc) on the usefulness and power 💪 of Adder!

-->
