---
title: Guía de línea de comandos de claves
description: Guía de línea de comandos de Bursa para derivar claves individuales a partir de una mnemónica.
---

<a name="key"></a>

## Crear Claves
Bursa se puede usar para derivar claves individuales a partir de una mnemónica.

<table>
  <tr>
    <th colspan="3" align="left">Tipos de claves:</th>
  </tr>
<tr>
  <td><a href="#root">Clave raíz</a></td>
  <td><a href="#account">Clave de Cuenta</a></td>
  <td><a href="#payment">Clave de Pago</a></td>
</tr>
<tr>
  <td><a href="#stake">Clave de Stake</a></td>
  <td><a href="#pool-cold">Clave fría de pool</a></td>
  <td><a href="#policy">Clave de política</a></td>
</tr>
<tr>
  <td><a href="#calidus">Clave Calidus</a></td>
  <td><a href="#vrf">Claves VRF</a></td>
  <td><a href="#kes">Par de Claves KES</a></td>
</tr>
<tr>
  <td><a href="#drep">Clave DRep </a></td>
  <td><a href="#committee-cold">Clave fría del Comité Constitucional</a></td>
  <td><a href="#committee-hot">Clave caliente del Comité Constitucional</a></td>
</tr>
</table>

***

Guía de línea de comandos de Bursa para derivar claves individuales a partir de una mnemónica.

**La mnemónica se puede proporcionar mediante:**
  1. Bandera --mnemonic
  2. Variable de entorno MNEMONIC
  3. Bandera --mnemonic-file
  4. Archivo por defecto "seed.txt"
<br>

> Las claves se derivan siguiendo los estándares CIP de Cardano y se generan en formato bech32 adecuado para usar con cardano-cli y otras herramientas.
>
> **Rutas de derivación por tipo de clave:**
> -  CIP-1852: root, account, payment, stake (m/1852'/1815'/...)
> -  CIP-1853: pool-cold (m/1853'/1815'/...)
> -  CIP-1855: policy (m/1855'/1815'/...)
> -  CIP-0105: drep, committee-cold, committee-hot (m/1852'/1815'/account'/role/...)
> -  CIP-88/151: calidus (m/1852'/1815'/account'/0/index, autenticación SPO)

***

<a name="root"></a>

### Clave raíz
La clave raíz es la clave maestra a partir de la cual se derivan todas las demás claves.
La salida es en formato bech32 (prefijo root_xsk) a menos que se especifique --signing-key-file.
```bash
./bursa key root --mnemonic "word1 word2 ..."
```

**Ejemplo de clave raíz con archivo de clave de firma:**

> Por favor ajusta la ruta a continuación.

```bash
./bursa key root --signing-key-file /path/root.skey
```

***

<a name="account"></a>

### Clave de Cuenta
La clave de cuenta sigue la ruta CIP-1852: m/1852'/1815'/account'
La salida es en formato bech32 (prefijo acct_xsk) a menos que se especifique --signing-key-file.

```bash
./bursa key account --mnemonic "word1 word2 ..." --index 0
```

***

<a name="payment"></a>

### Clave de Pago
La clave de pago sigue la ruta CIP-1852: m/1852'/1815'/account'/0/index
La salida es en formato bech32 (prefijo addr_xsk) a menos que se especifiquen archivos de clave.
```bash
./bursa key payment --mnemonic "word1 word2 ..." --account-index 0 --index 0
```

***

<a name="stake"></a>

### Clave de Stake
La clave de stake sigue la ruta CIP-1852: m/1852'/1815'/account'/2/index
La salida es en formato bech32 (prefijo stake_xsk) a menos que se especifiquen archivos de clave.
```bash
./bursa key stake --mnemonic "word1 word2 ..." --account-index 0 --index 0
```

***

<a name="pool-cold"></a>

### Clave fría de pool
La clave fría de pool sigue la ruta CIP-1853: m/1853'/1815'/0'/index'
Estas claves se usan como las claves de identidad a largo plazo para los operadores de stake pool.
La salida es en formato bech32 (prefijo pool_xsk) a menos que se especifiquen archivos de clave.
```bash
./bursa key pool-cold --mnemonic "word1 word2 ..." --index 0
```

***

<a name="policy"></a>

### Clave de política
La clave de política sigue la ruta CIP-1855: m/1855'/1815'/policy_ix'
Estas claves se usan para políticas de acuñación/quema de activos nativos.
La salida es en formato bech32 (prefijo policy_xsk) a menos que se especifiquen archivos de clave.
```bash
./bursa key policy --mnemonic "word1 word2 ..." --index 0
```

***

<a name="calidus"></a>

### Clave Calidus
La clave Calidus es la clave caliente de autenticación on-chain de SPO definida por CIP-88/CIP-151. Usa la misma ruta de derivación que la clave de pago:
m/1852'/1815'/account'/0/index

La clave es funcionalmente idéntica a la clave de pago, pero usa diferentes prefijos bech32 (calidus_xsk/calidus_xvk) y diferentes tipos de sobre de texto de cardano-cli para propósitos de identidad SPO.

La salida es en formato bech32 (prefijo calidus_xsk) a menos que se especifiquen archivos de clave.

```bash
./bursa key calidus --mnemonic "word1 word2 ..." --account-index 0 --index 0
```

**Ejemplo de Clave Calidus con Archivos de Clave**

> Por favor ajusta la ruta a continuación.

```bash
./bursa key calidus --signing-key-file /path/calidus.skey --verification-key-file /path/calidus.vkey
```

***

<a name="vrf"></a>

### Par de claves VRF (función aleatoria verificable)
Las claves VRF son usadas por los operadores de stake pool para la elección de líder en el protocolo de consenso Praos. La semilla se deriva determinísticamente de la mnemónica, lo que permite la recuperación de la clave.

La salida incluye tanto la clave de firma (vrf_sk) como la clave de verificación (vrf_vk) en formato bech32, a menos que se especifiquen archivos de clave.

```bash
./bursa key vrf --mnemonic "word1 word2 ..." --index 0
```

**Ejemplo de VRF con Archivos de Clave**

> Por favor ajusta la ruta a continuación.

```bash
./bursa key vrf --signing-key-file /path/vrf.skey --verification-key-file /path/vrf.vkey
```

***

<a name="kes"></a>

### Par de Claves KES
Las claves KES son usadas por los operadores de stake pool para firma de bloques en el protocolo de consenso Praos. KES proporciona firmas con seguridad hacia adelante donde comprometer la clave actual no compromete las firmas anteriores.

Esta implementación usa la profundidad 6 de Cardano, proporcionando 64 períodos de tiempo.
La semilla se deriva determinísticamente de la mnemónica, lo que permite la recuperación de la clave.

La salida incluye tanto la clave de firma (kes_sk, 608 bytes) como la clave de verificación (kes_vk, 32 bytes) en formato bech32, a menos que se especifiquen archivos de clave.

```bash
./bursa key kes --mnemonic "word1 word2 ..." --index 0
```

**Ejemplo de Clave KES con Archivos de Clave**

> Por favor ajusta la ruta a continuación.

```bash
./bursa key kes --signing-key-file /path/kes.skey --verification-key-file /path/kes.vkey
```

***

<a name="drep"></a>

### Clave DRep
La clave DRep sigue la ruta CIP-0105: m/1852'/1815'/account'/3/index
Estas claves se usan para participación en gobernanza como Representante Delegado.
La salida es en formato bech32 (prefijo drep_xsk) a menos que se especifiquen archivos de clave.

```bash
./bursa key drep --mnemonic "word1 word2 ..." --account-index 0 --index 0
```

**Ejemplo de Clave DRep con Archivos de Clave**

> Por favor ajusta la ruta a continuación.

```bash
./bursa key drep --signing-key-file /path/drep.skey --verification-key-file /path/drep.vkey
```

***

<a name="committee-cold"></a>

### Clave fría del Comité Constitucional
La clave fría del comité sigue la ruta CIP-0105: m/1852'/1815'/account'/4/index
Estas claves se usan para la membresía en el Comité Constitucional (identidad a largo plazo).
La salida es en formato bech32 (prefijo cc_cold_xsk) a menos que se especifiquen archivos de clave.

```bash
./bursa key committee-cold --mnemonic "word1 word2 ..." --account-index 0 --index 0
```

**Ejemplo de clave fría del Comité Constitucional con archivos de clave**

> Por favor ajusta la ruta a continuación.

```bash
./bursa key committee-cold --signing-key-file /path/committee-cold.skey --verification-key-file /path/committee-cold.vkey
```

***

<a name="committee-hot"></a>

### Clave caliente del Comité Constitucional
La clave caliente del comité sigue la ruta CIP-0105: m/1852'/1815'/account'/5/index
Estas claves se usan para votación del Comité Constitucional (clave operacional).
La salida es en formato bech32 (prefijo cc_hot_xsk) a menos que se especifiquen archivos de clave.

```bash
./bursa key committee-hot --mnemonic "word1 word2 ..." --account-index 0 --index 0
```

**Ejemplo de clave caliente del Comité Constitucional con archivos de clave**

> Por favor ajusta la ruta a continuación.

```bash
./bursa key committee-hot --signing-key-file /path/committee-hot.skey --verification-key-file /path/committee-hot.vkey
```

***

Explora otros comandos de Bursa

> **Categorías de comandos de Bursa**
> 1. [wallet](../003-commands) &nbsp; - Comandos para generar billetera y los archivos necesarios para administrar una billetera de Cardano
> 2. [api](../003-commands)  &emsp;&nbsp;&nbsp; - Comandos para ejecutar la API
> 3. [cert](../004-cert-commands)   &emsp;&nbsp; - Comandos para generar varios certificados de Cardano
> 4. [hash](../005-hash-commands)  &nbsp;&nbsp;&nbsp; - Comandos para generar hashes criptográficos usados en Cardano
> 5. [script](../006-script-commands) &nbsp;&nbsp; - Comandos para operaciones multifirma
> 6. [address](../007-address-commands) - Comandos para trabajar con direcciones de Cardano
> 7. [key](#key)  &emsp;&nbsp;&nbsp; - Comandos para derivar claves individuales a partir de una mnemónica

***
