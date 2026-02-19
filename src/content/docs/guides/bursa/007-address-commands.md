---
title: Address Command Line Guide
description: Bursa Command Line Guide for Working with Cardano Addresses.
---

There are currently 7 categories of commands that Bursa can run which makes it a power tool for Cardano users.

> **Bursa Command Categories**
> 1. [wallet](../003-commands) &nbsp; - Commands for generating wallet and the files needed to manage a Cardano wallet
> 2. [api](../003-commands)  &emsp;&nbsp;&nbsp; - Commands for running API
> 3. [cert](#cert)   &emsp;&nbsp; - Commands for generating various Cardano certificates
> 4. [hash](../005-hash-commands)  &nbsp;&nbsp;&nbsp; - Commands for generating cryptographic hashes used in Cardano
> 5. [script](../006-script-commands) &nbsp;&nbsp; - Commands for multi-signature operations
> 6. [address](#address) - Commands for working with Cardano addresses
> 7. [key](../08-key-commands)  &emsp;&nbsp;&nbsp; - Commands for deriving individual keys from a mnemonic

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
./bursa address build --stake-key stake_vk1... --network mainnet --type reward
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
