---
title: Script Command Line Guide
description: Bursa Command Line Guide for Multi-Signature Operations.
---

<a name="script"></a>

Bursa Command Line Guide for Multi-Signature Operations.

## Commands for Multi-Signature Operations
Bursa can also be used to generate multi-signature scripts. The Bursa script command has 3 command types that you can run.

> **Script command types:**
>  - **create:** Creates a new multi-signature script
>  - **validate:** Validates a script against vkey witnesses and slot
>  - **address:** Generates mainnet address from script

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

#### Validate Script

- Validate a script with Ed25519 witnesses:

```
./bursa script validate --script script.json --public-keys abcdef1234...,1234567890... --signatures 0123abcd...,fedcba9876... --message-hex 74657874 --slot 123456789
```

- `--script` specifies the required path to the script file.
- `--public-keys` accepts a comma-separated list of hex-encoded Ed25519 verification keys. `--signatures` accepts a comma-separated list of hex-encoded signatures. The item at position `i` in each list forms one witness, and both lists must have matching lengths.
- Use `--message` for the signed payload as UTF-8 text or `--message-hex` for the signed payload as hex; these flags exclude each other. Default witness verification requires one of these flags when witnesses are supplied.
- `--slot` supplies the current slot for timelock validation.
- By default, Bursa validates each supplied witness cryptographically: it matches the Blake2b-224 hash of each verification key to the script key hash and verifies the Ed25519 signature against the supplied message. A script that requires signatures and receives no witnesses exits with a non-zero diagnostic.
- `--structural-only` performs structural validation without verifying witnesses or signatures.

The command returns JSON with `valid`, `slot`, `signatures`, `scriptHash`, and `structuralOnly` fields.

***

Explore other Bursa Commands

> **Bursa Command Categories**
> 1. [wallet](../003-commands) &nbsp; - Commands for generating wallet and the files needed to manage a Cardano wallet
> 2. [api](../003-commands)  &emsp;&nbsp;&nbsp; - Commands for running API
> 3. [cert](../004-cert-commands)   &emsp;&nbsp; - Commands for generating various Cardano certificates
> 4. [hash](../005-hash-commands)  &nbsp;&nbsp;&nbsp; - Commands for generating cryptographic hashes used in Cardano
> 5. [script](#script) &nbsp;&nbsp; - Commands for multi-signature operations
> 6. [address](../007-address-commands) - Commands for working with Cardano addresses
> 7. [key](../008-key-commands)  &emsp;&nbsp;&nbsp; - Commands for deriving individual keys from a mnemonic

***
