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

## Step 4 - Install Ubuntu in WSL 

To install Ubuntu in WSL we run:

```
wsl --install -d Ubuntu
```

![cardano-up-install-ubuntu-wsl](/cardano-up-install-ubuntu-wsl.png)

## Step 5 - Launch WSL and Finish Setup 

Once Ubuntu is install we will run the following command to finish setup by creating a user and password. First run WSL by running:

```
wsl.exe -d Ubuntu
```

![cardano-up-finish-install-ubuntu-wsl-exe](/cardano-up-finish-install-ubuntu-wsl-exe.png)


Now type in a username and password. You will need to type in your password twice.

![cardano-up-finish-install-ubuntu-username](/cardano-up-finish-install-ubuntu-username.png)

Once you add a username a password you will see a `Welcome to Ubuntu...` message. You can now exit out of your PowerShell by typing `exit`

![cardano-up-install-ubuntu-wsl-successful](/cardano-up-install-ubuntu-wsl-successful.png)


## Step 6 - Enable Ubuntu in Docker Desktop

Go back into Docker Desktop and select settings.

![cardano-up-docker-desktop-settings](/cardano-up-docker-desktop-settings.png)

Once in settings select the `Resources` tab on the left side.

![cardano-up-docker-desktop-resources](/cardano-up-docker-desktop-resources.png)

Under Resources tab select `WSL intergration`

![cardano-up-docker-desktop-wsl-intergration](/cardano-up-docker-desktop-wsl-intergration.png)

Under WSL intergration select `Ubuntu` and click `Apply & restart`

![cardano-up-docker-desktop-apply-ubuntu](/cardano-up-docker-desktop-apply-ubuntu.png)

## Step 7 - Launch Ubuntu app

In your search bar type `ubuntu` and select ubuntu app and click open.

![cardano-up-launch-ubuntu-app](/cardano-up-launch-ubuntu-app.png)

> 💡 TIP: You can check if docker is available by running `docker`. It will show a list of all available docker commands.
>
> ![cardano-up-check-docker-available-tip](/cardano-up-check-docker-available-tip.png)

<!--

### Congratulations!

Now we are ready to run Adder with filters and commands so we can track certain information and pick the way we are notified.

<br />


> 💡 TIP: You can get a list of all available commands by using the `-h` or `-help` flag.

<br />


We are now ready to walk through some [examples](../examples/001-using-adder-examples-desc) on the usefulness and power 💪 of Adder!

-->
