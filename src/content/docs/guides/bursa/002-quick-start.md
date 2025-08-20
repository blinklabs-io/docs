---
title: Quick Start Guide
description: Bursa Quick Start Overview.
---

# Bursa

A programmatic Cardano wallet, written in Go, which exposes an API, CLI, and library interface, allowing developers to easily integrate wallet functionality.

Simply download the Bursa binary file from blinklabs.io. Then run the Bursa in the command line or API.

<br>

To get started follow the steps below

<br>

⚠️ This guide assumes typical Linux setup. Please adjust commands and paths as needed.

***

<br>

## Step 1 - Download binary from Blinklabs  
<br>

**Step 1-A** - First start by going to <a href="https://blinklabs.io/projects-open-source" target="_blank">https://blinklabs.io/projects-open-source</a> and scroll down to Bursa.



![bursa-blinklabs-site](/bursa-blinklabs-site.png)
<br>


**Step 1-B** - Select the operating system that you want to use to run Bursa.  

![bursa-blinklabs-site-operating-system](/bursa-blinklabs-site-operating-system.png)
<br>

**Step 1-C** - You can either download the binary file and move the file to your preferred location or...  

![bursa-blinklabs-site-download](/bursa-blinklabs-site-download.png)

<br>

Copy the path from Blinklabs and run the following command to download the binary file.  

<br>

⚠️ Adjust the link path to the correct path for the version you want to download. 

> 💡 Tip: You can download the latest Bursa release from the <a href="https://github.com/blinklabs-io/bursa/releases" target="_blank"> https://github.com/blinklabs-io/bursa/releases</a> page.

```
wget -O - https://github.com/blinklabs-io/bursa/releases/download/v0.11.1/bursa-v0.11.1-linux-amd64 > bursa
```

***

<br>



## Step 2 - Change Permissions

<br>

For this example, we named the binary file `bursa`. To make the file executable run the following command:

<br>

⚠️ Adjust the file path and file name if needed. 

```
chmod +x bursa
```

***

<br>



## Step 3 - Open Firewall on Port 8080 for the API

<br>

Make sure your firewall is open for the API. For this example, we used port 8080. To open the port on 8080 we run the following command:

```
sudo ufw allow 8080/tcp
```

***

<br>

### Congratulations you are ready to start using Bursa!

We can now use the command line to create a Cardano wallet and output all the files we will need to manage the wallet. We can also start the API and access the API Swagger documentation.

## Use Command Line to Create Wallet and Output Wallet Files

We can use the command line to create a wallet and output all the files we will need to manage our Cardano wallet.

✅ For this example we create the wallet files to the `dev` folder by using the `--output` flag and giving it a directory to output to.

```
./bursa wallet create --output dev
```

![bursa-wallet-create-with-output-string](/bursa-wallet-create-with-output-string.png)

Now we will have all the wallet files in our `dev` directory.

![bursa-wallet-files](/bursa-wallet-files.png)

## Use Command Line to Start API

If we want to use the API we can use the command line to start it, by running the following command.

```
./bursa api
```

![bursa-start-api](/bursa-start-api.png)

## Access API Swagger Documentation

You can check the Bursa API by going to your IP:port/swagger/index.html. Please adjust the IP and your port if needed.

```
http://localhost:8080/swagger/index.html
```

![bursa-swagger](/bursa-swagger.png)
