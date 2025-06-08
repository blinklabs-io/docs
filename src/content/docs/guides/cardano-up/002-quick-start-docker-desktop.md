---
title: Quick Start using Docker Desktop
description: How to use cardano-up using Docker Desktop.
---

# cardano-up using Docker Desktop on Windows

cardano-up is a command line utility for managing Cardano services. cardano-up allows you to use a command line utility to install Cardano service by using docker images.

This guide will walk you through how to download Docker Desktop, run Ubuntu WSL and download the cardano-up binary on Windows. 

To get started follow the steps below

## Step 1 - Download Docker Desktop

First start by going to <a href="https://www.docker.com/products/docker-desktop/" target="_blank">https://www.docker.com/products/docker-desktop/</a> and scroll down to `Download Docker Desktop`

![cardano-up-docker-desktop-website](/cardano-up-docker-desktop-website.png)

***

## Step 2 - Select Operating System

For this example, we selected Windows - AMD64. Please select your operating system.

![cardano-up-docker-desktop-website-operating-system](/cardano-up-docker-desktop-website-operating-system.png)

Follow the onscreen directions.

![cardano-up-docker-desktop-install](/cardano-up-docker-desktop-install.png)

> 💡 Tip: Docker Desktop installs a Windows Subsystem for Linux that docker will run in.
> 
> ![cardano-up-subsystem-install](/cardano-up-subsystem-install.png)

***

## Step 3 - Open PowerShell as Administrator 

In your search bar type `powershell` and select run as administrator.

![cardano-up-open-powershell-admin](/cardano-up-open-powershell-admin.png)

> 💡 Tip: you can verify that docker desktop is running by with the following command in your PowerShell
> 
> ```
> wsl -l -v
> ```
> 
> ![cardano-up-verify-wsl-docker-desktop](/cardano-up-verify-wsl-docker-desktop.png)

***

## Step 4 - Install Ubuntu in WSL 

To install Ubuntu in WSL we run the following command in our PowerShell:

```
wsl --install -d Ubuntu
```

![cardano-up-install-ubuntu-wsl](/cardano-up-install-ubuntu-wsl.png)

***

<a name="step-5"></a>

## Step 5 - Launch WSL and Finish Setup 

Once Ubuntu is installed, we will run the following command in our PowerShell to finish the setup by creating a user and password. First start the Ubuntu WSL by running:

```
wsl.exe -d Ubuntu
```

![cardano-up-finish-install-ubuntu-wsl-exe](/cardano-up-finish-install-ubuntu-wsl-exe.png)


Now type in a username and password. You will need to type in your password twice.

![cardano-up-finish-install-ubuntu-username](/cardano-up-finish-install-ubuntu-username.png)

Once you added a username and password you will see a `Welcome to Ubuntu...` message. You can now exit out of your PowerShell by typing `exit`

![cardano-up-install-ubuntu-wsl-successful](/cardano-up-install-ubuntu-wsl-successful.png)

***

## Step 6 - Enable Ubuntu in Docker Desktop

To enable Ubuntu in Docker Desktop, go back into Docker Desktop and select settings.

![cardano-up-docker-desktop-settings](/cardano-up-docker-desktop-settings.png)

Once in settings select the `Resources` tab on the left side.

![cardano-up-docker-desktop-resources](/cardano-up-docker-desktop-resources.png)

Under the Resources tab select `WSL integration`

![cardano-up-docker-desktop-wsl-integration](/cardano-up-docker-desktop-wsl-intergration.png)

Under WSL integration select `Ubuntu` and click `Apply & restart`

![cardano-up-docker-desktop-apply-ubuntu](/cardano-up-docker-desktop-apply-ubuntu.png)

***

## Step 7 - Launch Ubuntu app

In your search bar type `ubuntu`, select ubuntu app and click open.

![cardano-up-launch-ubuntu-app](/cardano-up-launch-ubuntu-app.png)

> 💡 TIP: You can check if docker is available by running `docker`. It will show a list of all available docker commands.
>
> ![cardano-up-check-docker-available-tip](/cardano-up-check-docker-available-tip.png)

***

## Step 8 - Download cardano-up binary

You can download the latest cardano-up release from the <a href="https://github.com/blinklabs-io/cardano-up/releases" target="_blank">https://github.com/blinklabs-io/cardano-up/releases</a> page.

We will download the cardano-up binary by running the following command. ⚠️ Adjust download link to the most current version.

```
wget -cO - https://github.com/blinklabs-io/cardano-up/releases/download/v0.14.1/cardano-up-v0.14.1-linux-amd64 > cardano-up
```

![cardano-up-download-cardano-up](/cardano-up-download-cardano-up.png)

***

## Step 9 - Change Permissions

For this example, we named the binary file `cardano-up`. To make the file executable run the following command:

```
chmod +x cardano-up
```

![cardano-up-change-permissions](/cardano-up-change-permissions.png)

***

## Step 10 - Move cardano-up

For this example, we are going to put our cardano-up binary in the `/usr/local/bin` to move the cardano-up binary we can run:

```
sudo mv cardano-up /usr/local/bin/cardano-up
```

![cardano-up-move-binary](/cardano-up-move-binary.png)

You will need to enter your password that you created in [Step 5](#step-5)

![cardano-up-move-binary-password](/cardano-up-move-binary-password.png)

> 💡 TIP: You can run `which cardano-up` to verify the path of where your cardano-up binary is located.
>
> ![cardano-up-verify-binary-path](/cardano-up-verify-binary-path.png)

***

### Congratulations!

Now we are ready to start using cardano-up. We can now walk through [how to use cardano-up](../003-using-cardano-up) to demonstrate the ease of use and power of using cardano-up to install docker images of the Cardano services you need.

