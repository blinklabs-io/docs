---
title: Command Line Guide
description: Bursa Command Line Guide.
---

We can now use the command line to create a Cardano wallet and output all the files we will need to manage the wallet. We can also start the API and access the API Swagger documentation. Bursa can also be used to generate hashes, keys, including keys and cetificates need to run a Cardano stake pool. There are 7 categories of commands that Bursa can run:

1. address
2. api
3. cert
4. hash - Commands for generating cryptographic hashes used in Cardano
5. key - Commands for deriving individual keys from a mnemonic
6. script
7. wallet

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

## Create Certificates for Stake Pool Operation
Example... 
```
./bursa cert opcert --kes-vkey kes.vkey --cold-skey cold.skey --counter 0 --kes-period 200 --out node.cert
```

## Create hashes for metadata files or anchor data
We can use Bursa to create hashes for metadata or anchor-data, often used in Cardano Governance or in Stake Pool Operation.

> Hash types: <br>
> metadata  - Blake2b-256 hash of pool/DRep metadata JSON <br>
> anchor-data - Blake2b-256 hash of anchor data (constitutions, governance proposals) 

metadata example
```
./bursa hash metadata pool-metadata.json
```

anchor data example
```
./bursa hash anchor-data --file-text constitution.txt
```

## Create Keys
Keys 
