---
title: Cert Command Line Guide
description: Bursa Command Line Guide for Generating Various Cardano Certificates.
---

<a name="cert"></a>
## Using Bursa to Create Certificates
These Bursa commands create certificates for stake pool operations, stake delegation, and Conway era governance.

<table>
  <tr>
    <th colspan="2" align="left">Certificate types:</th>
  </tr>
<tr>
    <td><a href="#op">op-cert</a></td>
    <td>- Operational certificate for block production</td>
</tr>
<tr>
    <td><a href="#pool-registration">pool-registration</a></td>
    <td>- Pool registration certificate</td>
</tr>
<tr>
    <td><a href="#pool-retirement">pool-retirement</a></td>
    <td>- Pool retirement certificate</td>
</tr>
<tr>
    <td><a href="#stake-registration">stake-registration</a></td>
    <td>- Stake address registration</td>
<tr>
    <td><a href="#stake-deregistration">stake-deregistration</a></td>
    <td>- Stake address deregistration</td>
</tr>
<tr>
    <td><a href="#stake-delegation">stake-delegation</a></td>
    <td>- Stake delegation to a pool</td>
</tr>
<tr>
    <td><a href="#drep-registration">drep-registration</a></td>
    <td>- DRep registration (Conway)</td>
</tr>
<tr>
    <td><a href="#drep-deregistration">drep-deregistration</a></td>
    <td>- DRep deregistration (Conway)</td>
</tr>
<tr>
    <td><a href="#vote-delegation">vote-delegation</a></td>
    <td>- Vote delegation (Conway)</td>
</tr>
<tr>
    <td><a href="#committee-hot-auth">committee-hot-auth</a></td>
    <td>- Committee hot key auth (Conway)</td>
</tr>
<tr>
    <td><a href="#committee-cold-resign">committee-cold-resign</a></td>
    <td>- Committee cold key resign (Conway)</td>
</tr>
</table>

***
<a name="op"></a>

## Create Certificates for Stake Pool Operation
Bursa can be used to create certificates for stake pool operations, stake delegation, and Conway era governance.

The `op-cert` command can be used to generate an operational certificate, aka `node.cert`, linking a KES key to a pool cold key. Stake Pools need to create a new node.cert when rotating their KES key. So SPOs can use Bursa to create a new `node.cert` with their new kes.vkey, cold key and kes period.

🔁 Output format is compatible with cardano-cli operational certificates.

> **Required inputs:** <br>
>   `--kes-vkey` &emsp; &nbsp; &nbsp; KES verification key file (bech32 or hex format) <br>
>   `--cold-skey` &emsp; &nbsp; Pool cold signing key file (bech32 or hex format) <br>
>   `--counter` &emsp; &nbsp; &nbsp; &nbsp;Certificate sequence number (must increment with each new cert) <br>
>   `--kes-period` &emsp; KES period at certificate creation time

✅ The counter value must be incremented each time a new operational certificate
is created, if and only if, you minted a block with old KES key. The KES period is the current slot divided by the slots per KES
period (typically 129600 slots = ~36 hours on mainnet).

Output format of `node.cert` is compatible with cardano-cli operational certificates. 

To create `node.cert` we can run the following command.

> ⚠️ Please adjust the paths to your kes and cold key. Also please adjust your counter and kes period below.

```
./bursa cert opcert --kes-vkey /path/kes.vkey --cold-skey /path/cold.skey --counter 0 --kes-period 200 --out node.cert
```

***

<a name="pool-registration"></a>

## Generate a Pool Registration Certificate

The pool registration certificate registers a new stake pool or updates an existing registration on the Cardano blockchain.

> Required inputs:
> -  `--cold-vkey`       Pool cold verification key file
> -  `--vrf-vkey`        VRF verification key file
> -  `--pledge`          Pledge amount in lovelace
> -  `--cost`            Fixed cost per epoch in lovelace
> -  `--margin`          Pool margin (0.0 to 1.0)
> -  `--reward-account`  Reward account address (bech32 stake address)

>Optional inputs:
> -  `--metadata-url`    Pool metadata URL
> -  `--metadata-hash`   Pool metadata hash (hex)

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

***

<a name="pool-retirement"></a>

## Generate a Pool Retirement Certificate
The pool retirement certificate signals that a stake pool will retire at the specified epoch boundary.

> Required inputs:
> -  `--cold-vkey`  Pool cold verification key file
> -  `--epoch`      Retirement epoch

Output format is compatible with cardano-cli certificates.

> ⚠️ Please adjust the paths to your cold key.
```
./bursa cert pool-retirement --cold-vkey /path/cold.vkey \
    --epoch 300 --out pool-retire.cert
```

***

<a name="stake-registration"></a>

## Create a Stake Address Registration Certificate

This certificate registers a stake address on-chain, which is required before the stake key can be used for delegation or reward withdrawal.

Output format is a cardano-cli compatible JSON text envelope.

> ⚠️ Please adjust path below.

```
./bursa cert stake-registration \
    --stake-vkey /path/stake.vkey --out stake-reg.cert
```

***

<a name="stake-deregistration"></a>

## Create a Stake Address Deregistration Certificate

This certificate deregisters a stake address, returning the deposit and removing the stake key from on-chain registration.

Output format is a cardano-cli compatible JSON text envelope.

> ⚠️ Please adjust path below.

```
 ./bursa cert stake-deregistration \
    --stake-vkey /path/stake.vkey --out stake-dereg.cert
```

***

<a name="stake-delegation"></a>

## Create a Stake Delegation Certificate

This certificate delegates stake from a stake key to a specific stake pool identified by its pool ID (bech32 or hex format).

Output format is a cardano-cli compatible JSON text envelope.

> ⚠️ Please adjust path below.

```
./bursa cert stake-delegation \
    --stake-vkey /path/stake.vkey \
    --pool-id pool1... \
    --out stake-deleg.cert
```

***

<a name="drep-registration"></a>

## Create a DRep Registration Certificate (Conway)

This certificate registers a Delegated Representative (DRep) on-chain, which allows the DRep to receive vote delegations and participate in governance actions.

A deposit amount in lovelace is required. An optional anchor URL and hash can be provided for DRep metadata.

Output format is a cardano-cli compatible JSON text envelope.

**Register DRep with Anchor Metadata Example**

> ⚠️ Please adjust path below.

```
./bursa cert drep-registration \
    --drep-vkey /path/drep.vkey \
    --deposit 500000000 \
    --anchor-url https://example.com/drep.json \
    --anchor-hash abc123... \
    --out drep-reg.cert
```

***

<a name="drep-deregistration"></a>

## Create a DRep Deregistration Certificate (Conway)

This certificate deregisters a DRep from on-chain governance, returning the deposit refund amount.

Output format is a cardano-cli compatible JSON text envelope.

> ⚠️ Please adjust path below.

```
./bursa cert drep-deregistration \
    --drep-vkey /path/drep.vkey \
    --deposit-refund 500000000 \
    --out drep-dereg.cert
```

***

<a name="vote-delegation"></a>

## Create a Vote Delegation Certificate (Conway)

This certificate delegates voting power from a stake key to a DRep, or to special voting options (always-abstain or always-no-confidence).

<table>
  <tr>
    <th colspan="2" align="left">Exactly one delegation target must be specified:</th>
  </tr>
<tr>
    <td>--drep-vkey-hash</td>
    <td>Delegate to a DRep by key hash (hex)</td>
</tr>
<tr>
    <td>--drep-id</td>
    <td>Delegate to a DRep by ID (bech32 or hex)</td>
</tr>
<tr>
    <td>--always-abstain</td>
    <td>Always abstain from voting</td>
</tr>
<tr>
    <td>--always-no-confidence</td>
    <td>Always vote no confidence</td>
</tr>
</table>

Output format is a cardano-cli compatible JSON text envelope.

> ⚠️ Please adjust path below.

#### Delegate to a specific DRep
```
  ./bursa cert vote-delegation \
    --stake-vkey /path/stake.vkey \
    --drep-id drep1... \
    --out vote-deleg.cert
```

#### Always abstain
```
  ./bursa cert vote-delegation \
    --stake-vkey /path/stake.vkey \
    --always-abstain \
    --out vote-deleg.cert
```

***

<a name="committee-hot-auth"></a>

## Create a Committee Hot Key Authorization Certificate (Conway)

This certificate authorizes a hot key to act on behalf of a committee cold key for governance voting. The cold key remains offline while the hot key participates in governance.

Output format is a cardano-cli compatible JSON text envelope.

> ⚠️ Please adjust paths below.

```
./bursa cert committee-hot-auth \
    --cold-vkey /path/cc-cold.vkey \
    --hot-vkey /path/cc-hot.vkey \
    --out cc-hot-auth.cert
```

***

<a name="committee-cold-resign"></a>

## Create a Committee Cold Key Resignation Certificate (Conway)

This certificate resigns a committee member by their cold key. An optional anchor URL and hash can be provided to reference a rationale document.

Output format is a cardano-cli compatible JSON text envelope.

> ⚠️ Please adjust paths below.

#### Resign Without Anchor
```
  ./bursa cert committee-cold-resign \
    --cold-vkey /path/cc-cold.vkey \
    --out cc-resign.cert
```

#### Resign with Anchor Rationale
```  
  ./bursa cert committee-cold-resign \
    --cold-vkey /path/cc-cold.vkey \
    --anchor-url https://example.com/resign.json \
    --anchor-hash abc123... \
    --out cc-resign.cert
```

***

Explore other Bursa Commands

> **Bursa Command Categories**
> 1. [wallet](../003-commands) &nbsp; - Commands for generating wallet and the files needed to manage a Cardano wallet
> 2. [api](../003-commands)  &emsp;&nbsp;&nbsp; - Commands for running API
> 3. [cert](#cert)   &emsp;&nbsp; - Commands for generating various Cardano certificates
> 4. [hash](../005-hash-commands)  &nbsp;&nbsp;&nbsp; - Commands for generating cryptographic hashes used in Cardano
> 5. [script](../006-script-commands) &nbsp;&nbsp; - Commands for multi-signature operations
> 6. [address](../007-address-commands) - Commands for working with Cardano addresses
> 7. [key](../008-key-commands)  &emsp;&nbsp;&nbsp; - Commands for deriving individual keys from a mnemonic

***
