---
title: Hash Command Line Guide
description: Bursa Command Line Guide for Generating Cryptographic Hashes used in Cardano.
---

<a name="hash"></a>

Bursa Command Line Guide for Generating Cryptographic Hashes used in Cardano.

## Create Hashes for Metadata Files or Anchor Data
We can use Bursa to create hashes for metadata or anchor-data, often used in Cardano Governance or in Stake Pool Operation.

> **Hash types:**
> - metadata - Blake2b-256 hash of pool/DRep metadata JSON <br>
> - anchor-data - Blake2b-256 hash of anchor data (constitutions, governance proposals) 

#### Metadata
The hash metadata commands are used for pool and DRep metadata registration.
After validating the file as JSON, the command hashes the exact file bytes with Blake2b-256.
Whitespace, field ordering, and other formatting changes can produce different hashes for semantically equivalent JSON. If a workflow requires canonical JSON, write that canonical representation to the file before running the command and hosting the file.

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

Explore other Bursa Commands

> **Bursa Command Categories**
> 1. [wallet](../003-commands) &nbsp; - Commands for generating wallet and the files needed to manage a Cardano wallet
> 2. [api](../003-commands)  &emsp;&nbsp;&nbsp; - Commands for running API
> 3. [kes-agent](../003-commands#kes-agent) &emsp;&nbsp; - Commands for running the KES agent daemon for a Cardano block producer
> 4. [cert](../004-cert-commands)   &emsp;&nbsp; - Commands for generating various Cardano certificates
> 5. [hash](#hash)  &nbsp;&nbsp;&nbsp; - Commands for generating cryptographic hashes used in Cardano
> 6. [script](../006-script-commands) &nbsp;&nbsp; - Commands for multi-signature operations
> 7. [address](../007-address-commands) - Commands for working with Cardano addresses
> 8. [key](../008-key-commands)  &emsp;&nbsp;&nbsp; - Commands for deriving individual keys from a mnemonic

***



---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
