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

#### Account Key
```
./bursa key account --mnemonic "word1 word2 ..." --index 0
```

#### Payment Key
```
./bursa key payment --mnemonic "word1 word2 ..."
```

#### Stake Key
```
./bursa key stake --mnemonic "word1 word2 ..."
```

#### Pool Cold Key
```
./bursa key pool-cold --mnemonic "word1 word2 ..."
```

#### Policy Key
```
./bursa key policy --mnemonic "word1 word2 ..."
```

#### Calidus Key
```
./bursa key calidus --mnemonic "word1 word2 ..."
```

#### VRF Key Pair
```
./bursa key vrf --mnemonic "word1 word2 ... word24"
```

#### KES Key Pair
```
./bursa key kes --mnemonic "word1 word2 ... word24"
```

#### drep Key
```
./bursa key drep --mnemonic "word1 word2 ..."
```

#### Constitutional Committee Cold Key
```
./bursa key committee-cold --mnemonic "word1 word2 ..."
```

#### Constitutional Committee Hot Key
```
./bursa key committee-hot --mnemonic "word1 word2 ..."
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
