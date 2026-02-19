---
title: Script Command Line Guide
description: Bursa Command Line Guide for Multi-Signature Operations.
---

There are currently 7 categories of commands that Bursa can run which makes it a power tool for Cardano users.

> **Bursa Command Categories**
> 1. [wallet](../003-commands) &nbsp; - Commands for generating wallet and the files needed to manage a Cardano wallet
> 2. [api](../003-commands)  &emsp;&nbsp;&nbsp; - Commands for running API
> 3. [cert](#cert)   &emsp;&nbsp; - Commands for generating various Cardano certificates
> 4. [hash](../005-hash-commands)  &nbsp;&nbsp;&nbsp; - Commands for generating cryptographic hashes used in Cardano
> 5. [script](#script) &nbsp;&nbsp; - Commands for multi-signature operations
> 6. [address](../07-address-commands) - Commands for working with Cardano addresses
> 7. [key](../08-key-commands)  &emsp;&nbsp;&nbsp; - Commands for deriving individual keys from a mnemonic

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
