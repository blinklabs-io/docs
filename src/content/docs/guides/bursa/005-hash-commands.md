
---
title: Command Line Guide
description: Bursa Command Line Guide.
---

There are currently 7 categories of commands that Bursa can run which makes it a power tool for Cardano users.

> **Bursa Command Categories**
> 1. [wallet](../003-commands) &nbsp; - Commands for generating wallet and the files needed to manage a Cardano wallet
> 2. [api](../003-commands)  &emsp;&nbsp;&nbsp; - Commands for running API
> 3. [cert](../004-cert-commands)   &emsp;&nbsp; - Commands for generating various Cardano certificates
> 4. [hash](#hash)  &nbsp;&nbsp;&nbsp; - Commands for generating cryptographic hashes used in Cardano
> 5. [script](../06-script-commands) &nbsp;&nbsp; - Commands for multi-signature operations
> 6. [address](../07-address-commands) - Commands for working with Cardano addresses
> 7. [key](../08-key-commands)  &emsp;&nbsp;&nbsp; - Commands for deriving individual keys from a mnemonic

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
***

