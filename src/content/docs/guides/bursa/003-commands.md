---
title: Command Line Guide
description: Bursa Command Line Guide.
---

We can now use the command line to create a Cardano wallet and output all the files we will need to manage the wallet. We can also start the API and access the API Swagger documentation. 

Bursa can also be used to generate multi-signature scripts, hashes, keys, including keys and certificates need to run a Cardano stake pool. 

There are currently 7 categories of commands that Bursa can run which makes it a power tool for Cardano users.

> **Bursa Command Categories**
> 1. [wallet](#wallet) &nbsp; - Commands for generating wallet and the files needed to manage a Cardano wallet
> 2. [api](#api)  &emsp;&nbsp;&nbsp; - Commands for running API
> 3. [cert](#cert)   &emsp;&nbsp; - Commands for generating various Cardano certificates
> 4. [hash](#hash)  &nbsp;&nbsp;&nbsp; - Commands for generating cryptographic hashes used in Cardano
> 5. [script](#script) &nbsp;&nbsp; - Commands for multi-signature operations
> 6. [address](#address) - Commands for working with Cardano addresses
> 7. [key](#key)  &emsp;&nbsp;&nbsp; - Commands for deriving individual keys from a mnemonic

***

<a name="wallet"></a>

## Use Command Line to Create a Wallet and Output Wallet Files

We can use the command line to create a wallet and output all the files we will need to manage our Cardano wallet.

✅ For this example we create the wallet files to the `dev` folder by using the `--output` flag and giving it a directory to output to.

```
./bursa wallet create --output dev
```

![bursa-wallet-create-with-output-string](/bursa-wallet-create-with-output-string.png)

Now we will have all the wallet files in our `dev` directory.

![bursa-wallet-files](/bursa-wallet-files.png)

***

<a name="api"></a>

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

***


