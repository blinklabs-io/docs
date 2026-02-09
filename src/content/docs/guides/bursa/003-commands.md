---
title: Command Line Guide
description: Bursa Command Line Guide.
---

We can now use the command line to create a Cardano wallet and output all the files we will need to manage the wallet. We can also start the API and access the API Swagger documentation. Bursa can also be used to generate hashes, keys, including keys and cetificates need to run a Cardano stake pool. 

There are 7 categories of commands that Bursa can run:

1. [wallet](#wallet)
2. [api](#api)
3. [cert](#cert) - Commands for generating various Cardano certificates
4. [hash](#hash) - Commands for generating cryptographic hashes used in Cardano
5. [key](#key) - Commands for deriving individual keys from a mnemonic
6. script
7. address

***

<a name="wallet"></a>

## Use Command Line to Create Wallet and Output Wallet Files

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

<a name="cert"></a>

## Create Certificates for Stake Pool Operation
Example... 
```
./bursa cert opcert --kes-vkey kes.vkey --cold-skey cold.skey --counter 0 --kes-period 200 --out node.cert
```

***

<a name="hash"></a>

## Create hashes for metadata files or anchor data
We can use Bursa to create hashes for metadata or anchor-data, often used in Cardano Governance or in Stake Pool Operation.

> Hash types: <br>
> metadata  - Blake2b-256 hash of pool/DRep metadata JSON <br>
> anchor-data - Blake2b-256 hash of anchor data (constitutions, governance proposals) 

### Metadata
The hash metadata commands are used for pool and DRep metadata registration.
The hash is calculated from the canonical JSON representation.

Supported metadata types:
  - pool: Pool registration metadata
  - drep: DRep registration metadata
    
pool metadata command example
```
./bursa hash metadata pool-metadata.json
```

#### Anchor Data
The hash anchor-data commands are used to generate a Blake2b-256 hash of anchor data used in Cardano governance. For example you might want to create an anchor data hash for constitutions, governance proposals, and other documents that are anchored to on-chain governance actions.

anchor-data command example
```
./bursa hash anchor-data --file-text constitution.txt
```

## Create Keys
Keys 
