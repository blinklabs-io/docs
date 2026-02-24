---
title: Key Command Line Guide
description: Bursa Command Line Guide for Deriving Individual Keys from a Mnemonic.
---

<a name="key"></a>

Bursa Command Line Guide for Deriving Individual Keys from a Mnemonic.

## Create Keys
Bursa can be used to derive individual keys from a mnemonic. 

**The mnemonic can be provided via:**
  1. --mnemonic flag
  2. MNEMONIC environment variable
  3. --mnemonic-file flag
  4. Default file "seed.txt"
<br>

> Keys are derived following Cardano CIP standards and output in bech32 format suitable for use with cardano-cli and other tools.
> 
> **Derivation paths by key type:**
> -  CIP-1852: root, account, payment, stake (m/1852'/1815'/...)
> -  CIP-1853: pool-cold (m/1853'/1815'/...)
> -  CIP-1855: policy (m/1855'/1815'/...)
> -  CIP-0105: drep, committee-cold, committee-hot (m/1852'/1815'/account'/role/...)
> -  CIP-88/151: calidus (m/1852'/1815'/account'/0/index, SPO authentication)

***

#### Root Key
The root key is the master key from which all other keys are derived.  
Output is in bech32 format (root_xsk prefix) unless --signing-key-file is specified.
```
./bursa key root --mnemonic "word1 word2 ..."
```

**Root Key with Signing Key File Example:**

> ⚠️ Please adjust path below.

```
./bursa key root --signing-key-file /path/root.skey
```

***

#### Account Key
The account key follows CIP-1852 path: m/1852'/1815'/account'  
Output is in bech32 format (acct_xsk prefix) unless --signing-key-file is specified.

```
./bursa key account --mnemonic "word1 word2 ..." --index 0
```

***

#### Payment Key
The payment key follows CIP-1852 path: m/1852'/1815'/account'/0/index  
Output is in bech32 format (addr_xsk prefix) unless key files are specified.
```
./bursa key payment --mnemonic "word1 word2 ..." --account-index 0 --index 0
```

***

#### Stake Key
The stake key follows CIP-1852 path: m/1852'/1815'/account'/2/index  
Output is in bech32 format (stake_xsk prefix) unless key files are specified.
```
./bursa key stake --mnemonic "word1 word2 ..." --account-index 0 --index 0
```

***

#### Pool Cold Key
The pool cold key follows CIP-1853 path: m/1853'/1815'/0'/index'  
These keys are used as the long-term identity keys for stake pool operators.  
Output is in bech32 format (pool_xsk prefix) unless key files are specified.
```
./bursa key pool-cold --mnemonic "word1 word2 ..." --index 0
```

***

#### Policy Key
The policy key follows CIP-1855 path: m/1855'/1815'/policy_ix'  
These keys are used for native asset minting/burning policies.  
Output is in bech32 format (policy_xsk prefix) unless key files are specified.
```
./bursa key policy --mnemonic "word1 word2 ..." --index 0
```

***

#### Calidus Key
The Calidus key is the SPO on-chain authentication hot key defined by CIP-88/CIP-151. It uses the same derivation path as the payment key:  
m/1852'/1815'/account'/0/index  

The key is functionally identical to the payment key but uses different bech32 prefixes (calidus_xsk/calidus_xvk) and different cardano-cli text envelope types for SPO identity purposes.  

Output is in bech32 format (calidus_xsk prefix) unless key files are specified.
```
./bursa key calidus --mnemonic "word1 word2 ..." --account-index 0 --index 0
```

**Calidus Key with Key Files Example**

> ⚠️ Please adjust path below.

```
./bursa key calidus --signing-key-file /path/calidus.skey --verification-key-file /path/calidus.vkey
```

***

#### VRF (Verifiable Random Function) Key Pair
VRF keys are used by stake pool operators for leader election in the Praos consensus protocol. The seed is derived deterministically from the mnemonic, allowing for key recovery.

Output includes both signing key (vrf_sk) and verification key (vrf_vk) in bech32 format unless key files are specified.

```
./bursa key vrf --mnemonic "word1 word2 ..." --index 0
```

**VRF with Key Files Example**

> ⚠️ Please adjust path below.

```
./bursa key vrf --signing-key-file /path/vrf.skey --verification-key-file /path/vrf.vkey
```

***

#### KES Key Pair
KES keys are used by stake pool operators for block signing in the Praos consensus protocol. KES provides forward-secure signatures where compromising the current key does not compromise past signatures.  

This implementation uses Cardano's depth 6, providing 64 time periods.  
The seed is derived deterministically from the mnemonic, allowing for key recovery.  

Output includes both signing key (kes_sk, 608 bytes) and verification key (kes_vk, 32 bytes) in bech32 format unless key files are specified.

```
./bursa key kes --mnemonic "word1 word2 ..." --index 0
```

**KES Key with Key Files Example**

> ⚠️ Please adjust path below.

```
./bursa key kes --signing-key-file /path/kes.skey --verification-key-file /path/kes.vkey
```

***

#### drep Key
The DRep key follows CIP-0105 path: m/1852'/1815'/account'/3/index  
These keys are used for governance participation as a Delegated Representative.  
Output is in bech32 format (drep_xsk prefix) unless key files are specified.  

```
./bursa key drep --mnemonic "word1 word2 ..." --account-index 0 --index 0
```

**DRep Key with Key Files Example**

> ⚠️ Please adjust path below.

```
./bursa key drep --signing-key-file /path/drep.skey --verification-key-file /path/drep.vkey
```

***

#### Constitutional Committee Cold Key
The committee cold key follows CIP-0105 path: m/1852'/1815'/account'/4/index  
These keys are used for Constitutional Committee membership (long-term identity).  
Output is in bech32 format (cc_cold_xsk prefix) unless key files are specified.  

```
./bursa key committee-cold --mnemonic "word1 word2 ..." --account-index 0 --index 0
```

**Constitutional Committee Cold Key with Key Files Example**

> ⚠️ Please adjust path below.

```
./bursa key committee-cold --signing-key-file /path/committee-cold.skey --verification-key-file /path/committee-cold.vkey
```

***

#### Constitutional Committee Hot Key
The committee hot key follows CIP-0105 path: m/1852'/1815'/account'/5/index  
These keys are used for Constitutional Committee voting (operational key).  
Output is in bech32 format (cc_hot_xsk prefix) unless key files are specified.  

```
./bursa key committee-hot --mnemonic "word1 word2 ..." --account-index 0 --index 0
```

**Constitutional Committee Cold Key with Key Files Example**

> ⚠️ Please adjust path below.

```
./bursa key committee-hot --signing-key-file /path/committee-hot.skey --verification-key-file /path/committee-hot.vkey
```

***

Explore other Bursa Commands

> **Bursa Command Categories**
> 1. [wallet](../003-commands) &nbsp; - Commands for generating wallet and the files needed to manage a Cardano wallet
> 2. [api](../003-commands)  &emsp;&nbsp;&nbsp; - Commands for running API
> 3. [cert](../004-cert-commands)   &emsp;&nbsp; - Commands for generating various Cardano certificates
> 4. [hash](../005-hash-commands)  &nbsp;&nbsp;&nbsp; - Commands for generating cryptographic hashes used in Cardano
> 5. [script](../006-script-commands) &nbsp;&nbsp; - Commands for multi-signature operations
> 6. [address](../007-address-commands) - Commands for working with Cardano addresses
> 7. [key](#key)  &emsp;&nbsp;&nbsp; - Commands for deriving individual keys from a mnemonic

***
