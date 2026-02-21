---
title: Cert Command Line Guide
description: Bursa Command Line Guide for Generating Various Cardano Certificates.
---

There are currently 7 categories of commands that Bursa can run which makes it a power tool for Cardano users.

> **Bursa Command Categories**
> 1. [wallet](../003-commands) &nbsp; - Commands for generating wallet and the files needed to manage a Cardano wallet
> 2. [api](../003-commands)  &emsp;&nbsp;&nbsp; - Commands for running API
> 3. [cert](#cert)   &emsp;&nbsp; - Commands for generating various Cardano certificates
> 4. [hash](../005-hash-commands)  &nbsp;&nbsp;&nbsp; - Commands for generating cryptographic hashes used in Cardano
> 5. [script](../06-script-commands) &nbsp;&nbsp; - Commands for multi-signature operations
> 6. [address](../07-address-commands) - Commands for working with Cardano addresses
> 7. [key](../08-key-commands)  &emsp;&nbsp;&nbsp; - Commands for deriving individual keys from a mnemonic

***

<a name="cert"></a>
## Using Bursa to Create Certificates
These Bursa commands create certificates for stake pool operations,
stake delegation, and Conway era governance.


Certificate types:
- [op-cert](#op) &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&nbsp;&nbsp; - Operational certificate for block production
- [pool-registration](#pool-registration) &emsp;&emsp;&nbsp; - Pool registration certificate
- [pool-retirement](#pool-retirement) &emsp;&emsp;&nbsp;&nbsp;&nbsp; - Pool retirement certificate
- [stake-registration](#stake-registration) &emsp;&emsp;&nbsp; - Stake address registration
- [stake-deregistration](#stake-deregistration) &emsp; - Stake address deregistration
- [stake-delegation](#stake-delegation) &emsp;&emsp;&nbsp;&nbsp; - Stake delegation to a pool
- [drep-registration](#drep-registration) &emsp;&emsp;&nbsp;&nbsp; - DRep registration (Conway)
- [drep-deregistration](#drep-deregistration) &emsp;&nbsp;&nbsp; - DRep deregistration (Conway)
- [vote-delegation](#vote-delegation) &emsp;&emsp;&emsp;&nbsp; - Vote delegation (Conway)
- [committee-hot-auth](#committee-hot-auth) &emsp;&nbsp; - Committee hot key auth (Conway)
- [committee-cold-resign](#committee-cold-resign) &nbsp; - Committee cold key resign (Conway)

***
<a name="op"></a>

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
<a name="pool-registration"></a>

## Generate a Pool Registration Certificate

The pool registration certificate registers a new stake pool or
updates an existing registration on the Cardano blockchain.

> Required inputs:
> -  --cold-vkey       Pool cold verification key file
> -  --vrf-vkey        VRF verification key file
> -  --pledge          Pledge amount in lovelace
> -  --cost            Fixed cost per epoch in lovelace
> -  --margin          Pool margin (0.0 to 1.0)
> -  --reward-account  Reward account address (bech32 stake address)

>Optional inputs:
> -  --metadata-url    Pool metadata URL
> -  --metadata-hash   Pool metadata hash (hex)

Output format is compatible with cardano-cli certificates.

> ⚠️ Please adjust paths below.

```
./bursa cert pool-registration \
    --cold-vkey /path/cold.vkey --vrf-vkey /path/vrf.vkey \
    --pledge 1000000000 --cost 340000000 --margin 0.01 \
    --reward-account stake1... \
    --metadata-url "https://example.com/pool.json" \
    --metadata-hash "abc123..." --out pool-reg.cert
```
