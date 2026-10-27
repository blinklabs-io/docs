---
title: Cert Command Line Guide
description: Bursa Command Line Guide for Generating Various Cardano Certificates.
---

<a name="cert"></a>

Bursa can be used to create certificates for stake pool operations, stake delegation, and Conway era governance.

## Using Bursa to Create Certificates
These Bursa commands can be used for generating various Cardano certificates.

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
</tr>
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

The `op-cert` command can be used to generate an operational certificate, aka `node.cert`, linking a KES key to a pool cold key. Stake Pools need to create a new node.cert when rotating their KES key. So SPOs can use Bursa to create a new `node.cert` with their new kes.vkey, cold key and kes period.

When `--out` is supplied, Bursa writes a `cardano-cli` compatible JSON text envelope:

```json
{
    "type": "NodeOperationalCertificate",
    "description": "Operational Certificate",
    "cborHex": "<hex>"
}
```

The hex encoded `cborHex` value represents the canonical two element CBOR structure:

```text
[[kes_vkey, counter, kes_period, signature], cold_vkey]
```

The outer array has two elements: the four element certificate tuple and the 32 byte `cold_vkey`. Bursa derives this cold verification key from the supplied 32 byte seed or 64 byte Ed25519 private key and includes it for verification and round tripping.

> **Required inputs:** <br>
>   `--kes-vkey` &emsp; &nbsp; &nbsp; KES verification key file (bech32 or hex format) <br>
>   `--cold-skey` &emsp; &nbsp; Pool cold signing key file (bech32 or hex format) <br>
>   `--counter` &emsp; &nbsp; &nbsp; &nbsp;Certificate sequence number (must increment with each new cert) <br>
>   `--kes-period` &emsp; KES period at certificate creation time

✅ The counter value must be incremented each time a new operational certificate
is created, if and only if, you minted a block with old KES key. The KES period is the current slot divided by the slots per KES
period (typically 129600 slots = ~36 hours on mainnet).

To create `node.cert` we can run the following command.

> ⚠️ Please adjust the paths to your kes and cold key. Also please adjust your counter and kes period below.

```
./bursa cert op-cert --kes-vkey /path/kes.vkey --cold-skey /path/cold.skey --counter 0 --kes-period 200 --out node.cert
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
> -  `--margin`          Pool margin must be finite and fall within the inclusive range `0.0` to `1.0`. Bursa rejects negative values, values greater than `1`, `NaN`, and positive or negative infinity before generating the pool-registration certificate.
> -  `--reward-account`  Reward account address (bech32 stake address)

>Optional inputs:
> -  `--metadata-url`    Pool metadata URL
> -  `--metadata-hash`   Pool metadata hash (hex)
> -  `--owner-stake-vkey`  Pool owner stake verification key file (repeatable)
> -  `--relay-address`  Relay IP address with port: `IPv4:port` or `[IPv6]:port` (repeatable)
> -  `--relay-host`  Relay host name with an optional port: `name[:port]` (repeatable)
> -  `--relay-multi-host`  Multi host DNS name (repeatable)

When no `--owner-stake-vkey` flags are supplied, Bursa derives the pool owner from the stake key in `--reward-account`. If the reward account is not a stake key address, Bursa requires at least one explicit `--owner-stake-vkey` file. Each explicit owner file must contain a `StakeVerificationKeyShelley_ed25519` envelope; use stake verification key files rather than pool cold key files.

Bursa emits relay values in this order: address, host, then multi host.

Output format is compatible with cardano-cli certificates.

> ⚠️ Please adjust paths below.

```
./bursa cert pool-registration \
    --cold-vkey /path/cold.vkey --vrf-vkey /path/vrf.vkey \
    --pledge 1000000000 --cost 340000000 --margin 0.01 \
    --reward-account stake1... \
    --owner-stake-vkey /path/owner-1.vkey \
    --owner-stake-vkey /path/owner-2.vkey \
    --relay-address 203.0.113.10:3001 \
    --relay-address '[2001:db8::1]:3001' \
    --relay-host relay.example.com:3001 \
    --relay-host relay.example.net \
    --relay-multi-host multi.example.com \
    --relay-multi-host another.example.com \
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

Without `--deposit`, Bursa writes the Shelley registration certificate (type `0`). With `--deposit <lovelace>`, Bursa writes the Conway registration certificate (type `7`) and includes the deposit. `--deposit 0` still selects the Conway form and includes a zero coin because the flag's presence selects the certificate form.

> Optional input: `--deposit <lovelace>`  Deposit amount in lovelace.

> ⚠️ Please adjust path below.

```
./bursa cert stake-registration \
    --stake-vkey /path/stake.vkey --out stake-reg.cert
```

To write the Conway form with an explicit deposit:

```
./bursa cert stake-registration \
    --stake-vkey /path/stake.vkey --deposit 2000000 --out stake-reg.cert
```

***

<a name="stake-deregistration"></a>

## Create a Stake Address Deregistration Certificate

This certificate deregisters a stake address, returning the deposit and removing the stake key from on-chain registration.

Output format is a cardano-cli compatible JSON text envelope.

Without `--deposit-refund`, Bursa writes the Shelley deregistration certificate (type `1`). With `--deposit-refund <lovelace>`, Bursa writes the Conway deregistration certificate (type `8`) and includes the refund. `--deposit-refund 0` still selects the Conway form and includes a zero coin because the flag's presence selects the certificate form.

> Optional input: `--deposit-refund <lovelace>`  Deposit refund amount in lovelace.

> ⚠️ Please adjust path below.

```
 ./bursa cert stake-deregistration \
    --stake-vkey /path/stake.vkey --out stake-dereg.cert
```

To write the Conway form with an explicit deposit refund:

```
 ./bursa cert stake-deregistration \
    --stake-vkey /path/stake.vkey --deposit-refund 2000000 \
    --out stake-dereg.cert
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
> 3. [kes-agent](../003-commands#kes-agent)  &emsp;&nbsp;&nbsp; - Commands for running the KES agent daemon
> 4. [cert](#cert)   &emsp;&nbsp; - Commands for generating various Cardano certificates
> 5. [hash](../005-hash-commands)  &nbsp;&nbsp;&nbsp; - Commands for generating cryptographic hashes used in Cardano
> 6. [script](../006-script-commands) &nbsp;&nbsp; - Commands for multi-signature operations
> 7. [address](../007-address-commands) - Commands for working with Cardano addresses
> 8. [key](../008-key-commands)  &emsp;&nbsp;&nbsp; - Commands for deriving individual keys from a mnemonic
> 9. [tx](../003-commands#tx) - Offline transaction operations
> 10. [sign](../003-commands#sign) - CIP-8/CIP-30 message signing and verification
> 11. [signer](../003-commands#signer) - Remote signing service

***


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
