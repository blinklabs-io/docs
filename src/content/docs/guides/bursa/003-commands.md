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

<a name="cert"></a>

## Create Certificates for Stake Pool Operation
Bursa can be used to create certificates for stake pool operations, stake delegation, and Conway era governance.

The `op-cert` command can be used to generate an operational certificate, aka `node.cert`, linking a KES key to a pool cold key. Stake Pools need to create a new node.cert when rotating their KES key. So SPOs can use Bursa to create a new `node.cert` with their new kes.vkey, cold key and kes period.

🔁 Output format is compatible with cardano-cli operational certificates.

> **Required inputs:** <br>
>   --kes-vkey &emsp; &nbsp; &nbsp; KES verification key file (bech32 or hex format) <br>
>   --cold-skey &emsp; &nbsp; Pool cold signing key file (bech32 or hex format) <br>
>   --counter &emsp; &nbsp; &nbsp; &nbsp;Certificate sequence number (must increment with each new cert) <br>
>   --kes-period &emsp; KES period at certificate creation time

✅ The counter value must be incremented each time a new operational certificate
is created, if and only if, you minted a block with old KES key. The KES period is the current slot divided by the slots per KES
period (typically 129600 slots = ~36 hours on mainnet).

Output format of `node.cert` is compatible with cardano-cli operational certificates. 

To create `node.cert` we can run the following command.

> ⚠️ Please adjust the paths to your kes and cold keys. Also please adjust your counter and kes period below.

```
./bursa cert opcert --kes-vkey /path/kes.vkey --cold-skey /path/cold.skey --counter 0 --kes-period 200 --out node.cert
```

***

<a name="hash"></a>

## Create Hashes for Metadata Files or Anchor Data
We can use Bursa to create hashes for metadata or anchor-data, often used in Cardano Governance or in Stake Pool Operation.

> **Hash types:**
> - metadata - Blake2b-256 hash of pool/DRep metadata JSON <br>
> - anchor-data - Blake2b-256 hash of anchor data (constitutions, governance proposals) 

#### Metadata
The hash metadata commands are used for pool and DRep metadata registration.
The hash is calculated from the canonical JSON representation.

**Supported metadata types:**
  - pool: Pool registration metadata
  - drep: DRep registration metadata
    
**Pool Metadata Command Example**
```
./bursa hash metadata pool-metadata.json
```

#### Anchor Data
The hash anchor-data commands are used to generate a Blake2b-256 hash of anchor data used in Cardano governance. 

For example, you might want to create an anchor data hash for constitutions, governance proposals, and other documents that are anchored to on-chain governance actions.

**Anchor-Data Command Example**
```
./bursa hash anchor-data --file-text constitution.txt
```

***

<a name="script"></a>

## Commands for Multi-Signature Operations
Bursa can also be used to generate multi-signature script. The Bursa script command has 3 command types that you can run.

> **Script command types:**
>  - **create:** Creates a new multi-signature script
>  - **validate:** Validates a script against signatures and slot
>  - **address:** Generate mainnet address from script

#### Create Multi-Signature Script

- Create a 2-of-3 multi-sig script
  
  ```
  ./bursa script create --required 2 --key-hashes abcdef1234567890abcdef1234567890abcdef12,abcdef1234567890abcdef1234567890abcdef13,abcdef1234567890abcdef1234567890abcdef14
  ```

- Create an all-signers-required script

  ```
  ./bursa script create --all --key-hashes abcdef1234567890abcdef1234567890abcdef12,abcdef1234567890abcdef1234567890abcdef13
  ```

- Create an any-signer script
  
  ```
  ./bursa script create --any --key-hashes abcdef1234567890abcdef1234567890abcdef12,abcdef1234567890abcdef1234567890abcdef13,abcdef1234567890abcdef1234567890abcdef14
  ```

- Create a timelocked script (valid after slot 1000000)
  
  ```
  ./bursa script create --required 2 --key-hashes abcdef1234567890abcdef1234567890abcdef12,abcdef1234567890abcdef1234567890abcdef13 --timelock-after 1000000
  ```

  ***

<a name="address"></a>

## Address
Bursa can be used to generate Cardano wallet addresses from a payment verification key through the `build` command. Bursa can also be used to parse out addresses and display its components using `info`.

> **Bursa supports all CIP-0019 address types:**
> - Base addresses (payment + stake credentials)
> - Enterprise addresses (payment only)
> - Pointer addresses (payment + stake pointer)
> - Reward addresses (stake only)
> - Byron/Bootstrap addresses (legacy) 

#### Address Build
- Base addresses (payment + stake credentials)
```
./bursa address build --payment-key addr_vk1... --stake-key stake_vk1... --network mainnet
```

- Enterprise addresses (payment only)
Enterprise addresses contain only a payment credential and no stake credential.
They are useful for simple payments without staking delegation. 

```
./bursa address build --payment-key addr_vk1... --network mainnet --type enterprise
```

- Reward addresses (stake only)
```
./bursa address build --stake-key stake_vk1... --network mainnet --type reward`
```

#### Address Info
We can use the `address info` command to display information about a Cardano address. 
Credentials are displayed in both bech32 and hex formats. 

- Base Address Example:
```
./bursa address info addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer...
  ```

- Stake Address Example:
```
./bursa address info stake1uy9ggsc9qls4pu46g9...
```

***

<a name="key"></a>

## Create Keys
Bursa can be used to derive individual keys from a mnemonic. 

> Keys are derived following Cardano CIP standards and output in bech32 format suitable for use with cardano-cli and other tools.
> 
> **Derivation paths by key type:**
> -  CIP-1852: root, account, payment, stake (m/1852'/1815'/...)
> -  CIP-1853: pool-cold (m/1853'/1815'/...)
> -  CIP-1855: policy (m/1855'/1815'/...)
> -  CIP-0105: drep, committee-cold, committee-hot (m/1852'/1815'/account'/role/...)
> -  CIP-88/151: calidus (m/1852'/1815'/account'/0/index, SPO authentication)

#### Root Key
```
./bursa key root --mnemonic "word1 word2 ..."
```

#### Account Key
```
./bursa key account --mnemonic "word1 word2 ..." --index 0
```

#### Payment Key
```
./bursa key payment --mnemonic "word1 word2 ..."
```

#### Stake Key
```
./bursa key stake --mnemonic "word1 word2 ..."
```

#### Pool Cold Key
```
./bursa key pool-cold --mnemonic "word1 word2 ..."
```

#### Policy Key
```
./bursa key policy --mnemonic "word1 word2 ..."
```

#### Calidus Key
```
./bursa key calidus --mnemonic "word1 word2 ..."
```

#### VRF Key Pair
```
./bursa key vrf --mnemonic "word1 word2 ... word24"
```

#### KES Key Pair
```
./bursa key kes --mnemonic "word1 word2 ... word24"
```

#### drep Key
```
./bursa key drep --mnemonic "word1 word2 ..."
```

#### Constitutional Committee Cold Key
```
./bursa key committee-cold --mnemonic "word1 word2 ..."
```

#### Constitutional Committee Hot Key
```
./bursa key committee-hot --mnemonic "word1 word2 ..."
``` 

***
