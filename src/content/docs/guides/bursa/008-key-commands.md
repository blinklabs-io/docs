---
title: Key Command Line Guide
description: Bursa Command Line Guide for Deriving Individual Keys from a Mnemonic.
---

<a name="key"></a>

## Create Keys
Bursa can be used to derive individual keys from a mnemonic. 

<table>
  <tr>
    <th colspan="3" align="left">Key types:</th>
  </tr>
<tr>
  <td><a href="#root">Root Key</a></td>
  <td><a href="#account">Account Key</a></td>
  <td><a href="#payment">Payment Key</a></td>
</tr>
<tr>
  <td><a href="#stake">Stake Key</a></td>
  <td><a href="#pool-cold">Pool Cold Key</a></td>
  <td><a href="#policy">Policy Key</a></td>
</tr>
<tr>
  <td><a href="#calidus">Calidus Key</a></td>
  <td><a href="#vrf">VRF keys</a></td>
  <td><a href="#kes">KES Key Pair</a></td>
</tr>
<tr>
  <td><a href="#drep">DRep key </a></td>
  <td><a href="#committee-cold">Constitutional Committee Cold Key</a></td>
  <td><a href="#committee-hot">Constitutional Committee Hot Key</a></td>
</tr>
<tr>
  <td><a href="#bls">Dijkstra BLS Key</a></td>
  <td></td>
  <td></td>
</tr>
</table>

***

Bursa Command Line Guide for Deriving Individual Keys from a Mnemonic.

Use `--mnemonic-file seed.txt` to read the mnemonic from a file, or `--mnemonic-file -` to read it from standard input. Mnemonic sources are checked in this order: deprecated `--mnemonic`, `MNEMONIC` environment variable, `--mnemonic-file`, then the default `seed.txt` file. The `--mnemonic` and `--password` arguments are deprecated because process arguments are visible to other local users; use `--mnemonic-file` and `--password-file` instead. For an optional derivation password, use `--password-file <path>`; `-` reads standard input, but both secrets cannot read standard input in the same command.

The examples below write signing keys to explicit files in cardano-cli JSON envelope format. For mnemonic-derived commands, `--signing-key-file -` explicitly prints bech32 secret material to standard output instead. Omitting the signing destination is an error unless the command supports and receives only `--verification-key-file`. Root and account commands require a signing destination. Do not combine `--signing-key-file -` with `--verification-key-file`.

> Keys are derived following Cardano CIP standards. File output uses cardano-cli envelopes; explicitly requested standard output uses bech32.
> 
> **Derivation paths by key type:**
> -  CIP-1852: root, account, payment, stake (m/1852'/1815'/...)
> -  CIP-1853: pool-cold (m/1853'/1815'/...)
> -  CIP-1855: policy (m/1855'/1815'/...)
> -  CIP-0105: drep, committee-cold, committee-hot (m/1852'/1815'/account'/role/...)
> -  CIP-88/151: calidus (m/1852'/1815'/account'/0/index, SPO authentication)

***

### Signing Key File Format

When Bursa exports a signing key derived from an HD path, it writes an extended Ed25519-BIP32 envelope. Root, account, payment, stake, governance, policy, multisig, and Calidus signing files use envelope types such as `*_ExtendedSigningKeyShelley_ed25519_bip32` and 128-byte CBOR beginning with `5880`. Legacy non-extended files use 32-byte CBOR beginning with `5820`.

Pool-cold signing files are the exception. Fresh exports use a standard, non-extended Ed25519 envelope with type `StakePoolSigningKey_ed25519`; the matching verification envelope uses type `StakePoolVerificationKey_ed25519`. Bursa accepts the legacy `StakePoolSigningKeyShelley_ed25519` and `StakePoolVerificationKeyShelley_ed25519` types when loading and leaves those files unchanged. The pool-cold signing seed produces the exported verification key as the standard Ed25519 identity used by pool registration and operational certificates. The optional extended pool-cold representation preserves that same identity.

Bursa loads key inputs only from regular files. On Unix, it rejects symlinked inputs; on Windows, it rejects reparse-point inputs. Bursa limits key-file input to its supported maximum and rejects oversized files before processing. Secret-key files (`.skey`) must have owner-only access: Unix permissions cannot include group or other bits, and Windows files must use a restrictive DACL scoped to the owner. Bursa applies this permission check only when it loads secret material; it rejects insecure files with `ErrInsecureFileMode`. When a directory contains only `.skey` files that fail this permission check, Bursa reports that permission reason for the directory. Public artifacts such as `.vkey` files and operational certificates remain readable through the public-key loading path and do not use this secret-key permission check.

Do not repair legacy HD-derived signing files that declare a non-extended type by changing only the `type` field; Bursa does not rewrite them automatically. Regenerate the signing and verification files together from the original mnemonic, then compare the resulting address, key hash, or other existing identity before signing.

<a name="root"></a>

#### Root Key
The root key is the master key from which all other keys are derived.  
With `--signing-key-file -`, standard output uses bech32 format (root_xsk prefix).
```
./bursa key root --mnemonic-file seed.txt --signing-key-file root.skey
```

**Root Key with Signing Key File Example:**

> ⚠️ Please adjust path below.

```
./bursa key root --mnemonic-file seed.txt --signing-key-file /path/root.skey
```

***

<a name="account"></a>

#### Account Key
The account key follows CIP-1852 path: m/1852'/1815'/account'  
With `--signing-key-file -`, standard output uses bech32 format (acct_xsk prefix).

```
./bursa key account --mnemonic-file seed.txt --index 0 --signing-key-file account.skey
```

***

<a name="payment"></a>

#### Payment Key
The payment key follows CIP-1852 path: m/1852'/1815'/account'/0/index  
With `--signing-key-file -`, standard output uses bech32 format (addr_xsk prefix).
```
./bursa key payment --mnemonic-file seed.txt --account-index 0 --index 0 --signing-key-file payment.skey --verification-key-file payment.vkey
```

***

<a name="stake"></a>

#### Stake Key
The stake key follows CIP-1852 path: m/1852'/1815'/account'/2/index  
With `--signing-key-file -`, standard output uses bech32 format (stake_xsk prefix).
```
./bursa key stake --mnemonic-file seed.txt --account-index 0 --index 0 --signing-key-file stake.skey --verification-key-file stake.vkey
```

***

<a name="pool-cold"></a>

#### Pool Cold Key
The pool cold key follows CIP-1853 path: m/1853'/1815'/0'/index'  
These keys are used as the long-term identity keys for stake pool operators.  
With `--signing-key-file -`, standard output uses bech32 format (pool_xsk prefix).
```
./bursa key pool-cold --mnemonic-file seed.txt --index 0 --signing-key-file pool-cold.skey --verification-key-file pool-cold.vkey
```

***

<a name="policy"></a>

#### Policy Key
The policy key follows CIP-1855 path: m/1855'/1815'/policy_ix'  
These keys are used for native asset minting/burning policies.  
With `--signing-key-file -`, standard output uses bech32 format (policy_xsk prefix).
```
./bursa key policy --mnemonic-file seed.txt --index 0 --signing-key-file policy.skey --verification-key-file policy.vkey
```

***

<a name="calidus"></a>

#### Calidus Key
The Calidus key is the SPO on-chain authentication hot key defined by CIP-88/CIP-151. It uses the same derivation path as the payment key:  
m/1852'/1815'/account'/0/index  

The key is functionally identical to the payment key but uses different bech32 prefixes (calidus_xsk/calidus_xvk) and different cardano-cli text envelope types for SPO identity purposes.  

With `--signing-key-file -`, standard output uses bech32 format (calidus_xsk prefix).

```
./bursa key calidus --mnemonic-file seed.txt --account-index 0 --index 0 --signing-key-file calidus.skey --verification-key-file calidus.vkey
```

**Calidus Key with Key Files Example**

> ⚠️ Please adjust path below.

```
./bursa key calidus --mnemonic-file seed.txt --signing-key-file /path/calidus.skey --verification-key-file /path/calidus.vkey
```

***

<a name="vrf"></a>

#### VRF (Verifiable Random Function) Key Pair
VRF keys are used by stake pool operators for leader election in the Praos consensus protocol. The seed is derived deterministically from the mnemonic, allowing for key recovery.

With `--signing-key-file -`, standard output includes both the signing key (`vrf_sk`) and verification key (`vrf_vk`) in bech32 format.

```
./bursa key vrf --mnemonic-file seed.txt --index 0 --signing-key-file vrf.skey --verification-key-file vrf.vkey
```

**VRF with Key Files Example**

> ⚠️ Please adjust path below.

```
./bursa key vrf --mnemonic-file seed.txt --signing-key-file /path/vrf.skey --verification-key-file /path/vrf.vkey
```

***

<a name="kes"></a>

#### KES Key Pair
KES keys are used by stake pool operators for block signing in the Praos consensus protocol. KES provides forward-secure signatures where compromising the current key does not compromise past signatures.  

This implementation uses Cardano's depth 6, providing 64 time periods.  
The seed is derived deterministically from the mnemonic, allowing for key recovery.  

With `--signing-key-file -`, standard output includes both the signing key (`kes_sk`, 608 bytes) and verification key (`kes_vk`, 32 bytes) in bech32 format.

```
./bursa key kes --mnemonic-file seed.txt --index 0 --signing-key-file kes.skey --verification-key-file kes.vkey
```

**KES Key with Key Files Example**

> ⚠️ Please adjust path below.

```
./bursa key kes --mnemonic-file seed.txt --signing-key-file /path/kes.skey --verification-key-file /path/kes.vkey
```

### VRF and KES Key Validation

Bursa validates VRF and KES material before exporting or loading it. A VRF verification key must have the expected length. VRF signing material must use an accepted seed or seed-plus-public-key form, and its embedded public key must match the seed when that form is used. A KES verification key must have the expected length. A KES signing key must use Cardano KES depth and the expected secret-key size. Bursa rejects malformed lengths, a mismatched VRF seed and public key, invalid KES depth, and invalid KES secret size instead of producing an envelope.

***

<a name="drep"></a>

#### DRep Key
The DRep key follows CIP-0105 path: m/1852'/1815'/account'/3/index  
These keys are used for governance participation as a Delegated Representative.  
With `--signing-key-file -`, standard output uses bech32 format (drep_xsk prefix).

```
./bursa key drep --mnemonic-file seed.txt --account-index 0 --index 0 --signing-key-file drep.skey --verification-key-file drep.vkey
```

**DRep Key with Key Files Example**

> ⚠️ Please adjust path below.

```
./bursa key drep --mnemonic-file seed.txt --signing-key-file /path/drep.skey --verification-key-file /path/drep.vkey
```

***

<a name="committee-cold"></a>

#### Constitutional Committee Cold Key
The committee cold key follows CIP-0105 path: m/1852'/1815'/account'/4/index  
These keys are used for Constitutional Committee membership (long-term identity).  
With `--signing-key-file -`, standard output uses bech32 format (cc_cold_xsk prefix).

```
./bursa key committee-cold --mnemonic-file seed.txt --account-index 0 --index 0 --signing-key-file committee-cold.skey --verification-key-file committee-cold.vkey
```

**Constitutional Committee Cold Key with Key Files Example**

> ⚠️ Please adjust path below.

```
./bursa key committee-cold --mnemonic-file seed.txt --signing-key-file /path/committee-cold.skey --verification-key-file /path/committee-cold.vkey
```

***

<a name="committee-hot"></a>

#### Constitutional Committee Hot Key
The committee hot key follows CIP-0105 path: m/1852'/1815'/account'/5/index  
These keys are used for Constitutional Committee voting (operational key).  
With `--signing-key-file -`, standard output uses bech32 format (cc_hot_xsk prefix).

```
./bursa key committee-hot --mnemonic-file seed.txt --account-index 0 --index 0 --signing-key-file committee-hot.skey --verification-key-file committee-hot.vkey
```

**Constitutional Committee Hot Key with Key Files Example**

> ⚠️ Please adjust path below.

```
./bursa key committee-hot --mnemonic-file seed.txt --signing-key-file /path/committee-hot.skey --verification-key-file /path/committee-hot.vkey
```

***

<a name="bls"></a>

#### Dijkstra BLS Key and Registration Material
The BLS command generates cryptographically random BLS12-381 MinSig material for Dijkstra-era Leios and Peras stake-pool registration. It does not use the mnemonic input sources described for the other key commands.

The `--signing-key-file <path>` option is required. The `--verification-key-file` and `--output-file` options are optional:

- `--signing-key-file <path>` writes the signing key to the specified file. The command never prints the signing key.
- `--verification-key-file` writes the verification key to the specified file.
- `--output-file` writes the registration JSON to the specified file. When the command omits this flag, Bursa prints the registration JSON to standard output.

```bash
./bursa key bls --signing-key-file bls.skey --verification-key-file bls.vkey --output-file bls-registration.json
```

The registration JSON contains exactly these fields:

- `publicKey`: the 96-byte public key as a lowercase hexadecimal string.
- `possessionProof`: the 48-byte proof of possession as a lowercase hexadecimal string.

Bursa verifies the generated proof before it produces the registration output. The required signing key file uses the cardano-cli envelope type `BlsSigningKey_bls12-381-BLS-Signature-Minimal-Signature-Size`. The optional verification key file uses `BlsVerificationKey_bls12-381-BLS-Signature-Minimal-Signature-Size`. Bursa writes each generated destination file with owner-only permissions. Protect and back up the signing key file as stake-pool credential material.

The three destination paths must be distinct. Bursa rejects direct path collisions and paths that resolve to the same file through path normalization or symbolic links.

***

Explore other Bursa Commands

> **Bursa Command Categories**
> 1. [wallet](../003-commands) &nbsp; - Commands for generating wallet and the files needed to manage a Cardano wallet
> 2. [api](../003-commands)  &emsp;&nbsp;&nbsp; - Commands for running API
> 3. [kes-agent](../003-commands#kes-agent)  &emsp;&nbsp;&nbsp; - Commands for running the KES agent
> 4. [cert](../004-cert-commands)   &emsp;&nbsp; - Commands for generating various Cardano certificates
> 5. [hash](../005-hash-commands)  &nbsp;&nbsp;&nbsp; - Commands for generating cryptographic hashes used in Cardano
> 6. [script](../006-script-commands) &nbsp;&nbsp; - Commands for multi-signature operations
> 7. [address](../007-address-commands) - Commands for working with Cardano addresses
> 8. [key](#key)  &emsp;&nbsp;&nbsp; - Commands for deriving individual keys from a mnemonic
> 9. [tx](../003-commands#tx) - Commands for signing transactions and assembling witnesses
> 10. [sign](../003-commands#sign) - Commands for signing data with CIP-8
> 11. [signer](../003-commands#signer) - Commands for running the remote signer service

***


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
