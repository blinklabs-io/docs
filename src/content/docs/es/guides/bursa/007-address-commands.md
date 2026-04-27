---
title: Guía de línea de comandos de direcciones
description: Guía de línea de comandos de Bursa para trabajar con direcciones de Cardano.
---

<a name="address"></a>

Guía de línea de comandos de Bursa para trabajar con direcciones de Cardano.

## Direcciones
Bursa se puede usar para generar direcciones de billetera de Cardano a partir de una clave de verificación de pago a través del comando `build`. Bursa también se puede usar para analizar direcciones y mostrar sus componentes usando `info`.

> **Bursa soporta todos los tipos de direcciones CIP-0019:**
> - Direcciones base (credenciales de pago + stake)
> - Direcciones enterprise (solo pago)
> - Direcciones pointer (pago + puntero de stake)
> - Direcciones de recompensa (solo stake)
> - Direcciones Byron/Bootstrap (legado)

#### Construcción de dirección
- Direcciones base (credenciales de pago + stake)
```bash
./bursa address build --payment-key addr_vk1... --stake-key stake_vk1... --network mainnet
```

- Direcciones enterprise (solo pago)
Las direcciones enterprise contienen solo una credencial de pago y ninguna credencial de stake.
Son útiles para pagos simples sin delegación de staking.

```bash
./bursa address build --payment-key addr_vk1... --network mainnet --type enterprise
```

- Direcciones de recompensa (solo stake)
```bash
./bursa address build --stake-key stake_vk1... --network mainnet --type reward
```

#### Información de dirección
Podemos usar el comando `address info` para mostrar información sobre una dirección de Cardano.
Las credenciales se muestran en formatos bech32 y hex.

- Ejemplo de dirección base:
```bash
./bursa address info addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer...
  ```

- Ejemplo de dirección de stake:
```bash
./bursa address info stake1uy9ggsc9qls4pu46g9...
```

***

Explora otros comandos de Bursa

> **Categorías de comandos de Bursa**
> 1. [wallet](../003-commands) &nbsp; - Comandos para generar billetera y los archivos necesarios para administrar una billetera de Cardano
> 2. [api](../003-commands)  &emsp;&nbsp;&nbsp; - Comandos para ejecutar la API
> 3. [cert](../004-cert-commands)   &emsp;&nbsp; - Comandos para generar varios certificados de Cardano
> 4. [hash](../005-hash-commands)  &nbsp;&nbsp;&nbsp; - Comandos para generar hashes criptográficos usados en Cardano
> 5. [script](../006-script-commands) &nbsp;&nbsp; - Comandos para operaciones multifirma
> 6. [address](#address) - Comandos para trabajar con direcciones de Cardano
> 7. [key](../008-key-commands)  &emsp;&nbsp;&nbsp; - Comandos para derivar claves individuales a partir de una mnemónica

***
