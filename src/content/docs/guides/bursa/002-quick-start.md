---
title: Quick Start Guide
description: Bursa Quick Start Overview.
---

# Bursa

A programmatic Cardano wallet, written in Go, which exposes an API, CLI, and library interface, allowing developers to easily integrate wallet functionality.

Download the appropriate CLI binary or archive, or the platform installer for the operating system, from blinklabs.io. Then run Bursa from the command line or API.

<br>

To get started follow the steps below

<br>

⚠️ This guide assumes typical Linux setup. Please adjust commands and paths as needed.

***

<br>

## Step 1 - Download a CLI binary or a platform installer from Blinklabs  
<br>

**Step 1-A** - First start by going to <a href="https://blinklabs.io/projects-open-source" target="_blank">https://blinklabs.io/projects-open-source</a> and scroll down to Bursa.



![bursa-blinklabs-site](/bursa-blinklabs-site.png)
<br>


**Step 1-B** - Select the operating system that you want to use to run Bursa.  

![bursa-blinklabs-site-operating-system](/bursa-blinklabs-site-operating-system.png)
<br>

**Step 1-C** - For a CLI download, download the binary or archive file and move it to the preferred location. For the desktop wallet, download the platform installer.  

![bursa-blinklabs-site-download](/bursa-blinklabs-site-download.png)

<br>

For Linux or FreeBSD CLI archive downloads, copy the path from Blinklabs and run the following commands to download and extract the archive.  

<br>

⚠️ Adjust the link path to the correct path for the version you want to download. 

> 💡 Tip: You can download the latest Bursa release from the <a href="https://github.com/blinklabs-io/bursa/releases" target="_blank"> https://github.com/blinklabs-io/bursa/releases</a> page.

```
wget -O bursa-v0.15.0-linux-amd64.tar.gz https://github.com/blinklabs-io/bursa/releases/download/v0.15.0/bursa-v0.15.0-linux-amd64.tar.gz
tar xzf bursa-v0.15.0-linux-amd64.tar.gz
```

Linux and FreeBSD CLI downloads use per-architecture `.tar.gz` archives. Windows CLI downloads remain `.exe` files. The official Windows desktop wallet release provides a signed, architecture-specific `.msi` installer. The installer can include the WebView2 Evergreen bootstrapper only when the release includes the optional bundle and the runtime is missing. macOS CLI downloads remain `.zip` files. The official macOS desktop wallet release provides a notarized, architecture-specific `.pkg` installer.

***

<br>



## Step 2 - Change Permissions for a Linux or FreeBSD CLI Binary

<br>

After extracting a Linux or FreeBSD CLI archive, make the `bursa` binary executable with the following command:

<br>

⚠️ Adjust the file path and file name if needed. 

Windows `.msi` and macOS `.pkg` users should use the platform installer. Do not extract those installer files or run `chmod` on them.

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

Bursa can also be used to generate multi-signature scripts, hashes, keys, including keys and certificates needed to run a Cardano stake pool.  

[Learn more about how to use Bursa with the command line and useful commands that you can run.](../003-commands)


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
