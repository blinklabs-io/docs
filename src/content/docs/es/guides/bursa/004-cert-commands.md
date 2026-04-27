---
title: Guía de línea de comandos para certificados
description: Guía de línea de comandos de Bursa para generar varios certificados de Cardano.
---

<a name="cert"></a>

Bursa se puede usar para crear certificados para operaciones de stake pool, delegación de stake y gobernanza de la era Conway.

## Usar Bursa para Crear Certificados
Estos comandos de Bursa se pueden usar para generar varios certificados de Cardano.

<table>
  <tr>
    <th colspan="2" align="left">Tipos de certificados:</th>
  </tr>
<tr>
    <td><a href="#op">op-cert</a></td>
    <td>- Certificado operacional para producción de bloques</td>
</tr>
<tr>
    <td><a href="#pool-registration">pool-registration</a></td>
    <td>- Certificado de registro de pool</td>
</tr>
<tr>
    <td><a href="#pool-retirement">pool-retirement</a></td>
    <td>- Certificado de retiro de pool</td>
</tr>
<tr>
    <td><a href="#stake-registration">stake-registration</a></td>
    <td>- Registro de dirección de stake</td>
</tr>
<tr>
    <td><a href="#stake-deregistration">stake-deregistration</a></td>
    <td>- Cancelación de registro de dirección de stake</td>
</tr>
<tr>
    <td><a href="#stake-delegation">stake-delegation</a></td>
    <td>- Delegación de stake a un pool</td>
</tr>
<tr>
    <td><a href="#drep-registration">drep-registration</a></td>
    <td>- Registro de DRep (Conway)</td>
</tr>
<tr>
    <td><a href="#drep-deregistration">drep-deregistration</a></td>
    <td>- Cancelación de registro de DRep (Conway)</td>
</tr>
<tr>
    <td><a href="#vote-delegation">vote-delegation</a></td>
    <td>- Delegación de voto (Conway)</td>
</tr>
<tr>
    <td><a href="#committee-hot-auth">committee-hot-auth</a></td>
    <td>- Autorización de clave caliente del comité (Conway)</td>
</tr>
<tr>
    <td><a href="#committee-cold-resign">committee-cold-resign</a></td>
    <td>- Renuncia de clave fría del comité (Conway)</td>
</tr>
</table>

***
<a name="op"></a>

## Crear certificados para operación de stake pool

El comando `op-cert` se puede usar para generar un certificado operacional, también conocido como `node.cert`, que vincula una clave KES a una clave fría del pool. Los stake pools necesitan crear un nuevo `node.cert` al rotar su clave KES. Así que los SPOs pueden usar Bursa para crear un nuevo `node.cert` con su nueva `kes.vkey`, clave fría y período KES.

El formato de salida es compatible con los certificados operacionales de cardano-cli.

> **Entradas requeridas:** <br>
>   `--kes-vkey` &emsp; &nbsp; &nbsp; Archivo de clave de verificación KES (formato bech32 o hex) <br>
>   `--cold-skey` &emsp; &nbsp; Archivo de clave de firma fría del pool (formato bech32 o hex) <br>
>   `--counter` &emsp; &nbsp; &nbsp; &nbsp;Número de secuencia del certificado (debe incrementarse con cada nuevo certificado) <br>
>   `--kes-period` &emsp; Período KES en el momento de la creación del certificado

El valor del contador debe incrementarse cada vez que se crea un nuevo certificado operacional, si y solo si has minado un bloque con la clave KES anterior. El período KES es el slot actual dividido por los slots por período KES (típicamente 129600 slots = ~36 horas en mainnet).

El formato de salida de `node.cert` es compatible con los certificados operacionales de cardano-cli.

Para crear `node.cert` podemos ejecutar el siguiente comando.

> Por favor ajusta las rutas a tu clave KES y clave fría. También ajusta tu contador y período KES a continuación.

```
./bursa cert op-cert --kes-vkey /path/kes.vkey --cold-skey /path/cold.skey --counter 0 --kes-period 200 --out node.cert
```

***

<a name="pool-registration"></a>

## Generar un certificado de registro de pool

El certificado de registro de pool registra un nuevo stake pool o actualiza un registro existente en la blockchain de Cardano.

> Entradas requeridas:
> -  `--cold-vkey`       Archivo de clave de verificación fría del pool
> -  `--vrf-vkey`        Archivo de clave de verificación VRF
> -  `--pledge`          Cantidad de pledge en lovelace
> -  `--cost`            Costo fijo por época en lovelace
> -  `--margin`          Margen del pool (0.0 a 1.0)
> -  `--reward-account`  Dirección de cuenta de recompensa (dirección de stake bech32)

>Entradas opcionales:
> -  `--metadata-url`    URL de metadata del pool
> -  `--metadata-hash`   Hash de metadata del pool (hex)

El formato de salida es compatible con certificados de cardano-cli.

> Por favor ajusta las rutas a continuación.

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

## Generar un certificado de retiro de pool
El certificado de retiro de pool indica que un stake pool se retirará en el límite de época especificado.

> Entradas requeridas:
> -  `--cold-vkey`  Archivo de clave de verificación fría del pool
> -  `--epoch`      Época de retiro

El formato de salida es compatible con certificados de cardano-cli.

> Por favor ajusta las rutas a tu clave fría.
```
./bursa cert pool-retirement --cold-vkey /path/cold.vkey \
    --epoch 300 --out pool-retire.cert
```

***

<a name="stake-registration"></a>

## Crear un certificado de registro de dirección de stake

Este certificado registra una dirección de stake on-chain, lo cual es requerido antes de que la clave de stake pueda usarse para delegación o retiro de recompensas.

El formato de salida es un sobre de texto JSON compatible con cardano-cli.

> Por favor ajusta la ruta a continuación.

```
./bursa cert stake-registration \
    --stake-vkey /path/stake.vkey --out stake-reg.cert
```

***

<a name="stake-deregistration"></a>

## Crear un certificado de cancelación de registro de dirección de stake

Este certificado cancela el registro de una dirección de stake, devolviendo el depósito y eliminando la clave de stake del registro on-chain.

El formato de salida es un sobre de texto JSON compatible con cardano-cli.

> Por favor ajusta la ruta a continuación.

```
 ./bursa cert stake-deregistration \
    --stake-vkey /path/stake.vkey --out stake-dereg.cert
```

***

<a name="stake-delegation"></a>

## Crear un certificado de delegación de stake

Este certificado delega stake desde una clave de stake a un stake pool específico identificado por su pool ID (formato bech32 o hex).

El formato de salida es un sobre de texto JSON compatible con cardano-cli.

> Por favor ajusta la ruta a continuación.

```
./bursa cert stake-delegation \
    --stake-vkey /path/stake.vkey \
    --pool-id pool1... \
    --out stake-deleg.cert
```

***

<a name="drep-registration"></a>

## Crear un certificado de registro de DRep (Conway)

Este certificado registra a un Representante Delegado (DRep) on-chain, lo que permite al DRep recibir delegaciones de voto y participar en acciones de gobernanza.

Se requiere una cantidad de depósito en lovelace. Se puede proporcionar una URL de anclaje opcional y un hash para los metadatos del DRep.

El formato de salida es un sobre de texto JSON compatible con cardano-cli.

**Ejemplo de registro de DRep con metadatos de anclaje**

> Por favor ajusta la ruta a continuación.

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

## Crear un certificado de cancelación de registro de DRep (Conway)

Este certificado cancela el registro de un DRep de la gobernanza on-chain, devolviendo la cantidad de reembolso del depósito.

El formato de salida es un sobre de texto JSON compatible con cardano-cli.

> Por favor ajusta la ruta a continuación.

```
./bursa cert drep-deregistration \
    --drep-vkey /path/drep.vkey \
    --deposit-refund 500000000 \
    --out drep-dereg.cert
```

***

<a name="vote-delegation"></a>

## Crear un certificado de delegación de voto (Conway)

Este certificado delega el poder de voto desde una clave de stake a un DRep, o a opciones de voto especiales (siempre-abstener o siempre-no-confianza).

<table>
  <tr>
    <th colspan="2" align="left">Debe especificarse exactamente un objetivo de delegación:</th>
  </tr>
<tr>
    <td>--drep-vkey-hash</td>
    <td>Delegar a un DRep por hash de clave (hex)</td>
</tr>
<tr>
    <td>--drep-id</td>
    <td>Delegar a un DRep por ID (bech32 o hex)</td>
</tr>
<tr>
    <td>--always-abstain</td>
    <td>Siempre abstenerse de votar</td>
</tr>
<tr>
    <td>--always-no-confidence</td>
    <td>Siempre votar no confianza</td>
</tr>
</table>

El formato de salida es un sobre de texto JSON compatible con cardano-cli.

> Por favor ajusta la ruta a continuación.

#### Delegar a un DRep específico
```
  ./bursa cert vote-delegation \
    --stake-vkey /path/stake.vkey \
    --drep-id drep1... \
    --out vote-deleg.cert
```

#### Abstenerse siempre
```
  ./bursa cert vote-delegation \
    --stake-vkey /path/stake.vkey \
    --always-abstain \
    --out vote-deleg.cert
```

***

<a name="committee-hot-auth"></a>

## Crear un certificado de autorización de clave caliente del comité (Conway)

Este certificado autoriza a una clave caliente para actuar en nombre de una clave fría del comité para votación de gobernanza. La clave fría permanece offline mientras la clave caliente participa en la gobernanza.

El formato de salida es un sobre de texto JSON compatible con cardano-cli.

> Por favor ajusta las rutas a continuación.

```
./bursa cert committee-hot-auth \
    --cold-vkey /path/cc-cold.vkey \
    --hot-vkey /path/cc-hot.vkey \
    --out cc-hot-auth.cert
```

***

<a name="committee-cold-resign"></a>

## Crear un certificado de renuncia de clave fría del comité (Conway)

Este certificado hace que un miembro del comité renuncie mediante su clave fría. Se puede proporcionar una URL de anclaje opcional y un hash para hacer referencia a un documento de justificación.

El formato de salida es un sobre de texto JSON compatible con cardano-cli.

> Por favor ajusta las rutas a continuación.

#### Renunciar sin anclaje
```
  ./bursa cert committee-cold-resign \
    --cold-vkey /path/cc-cold.vkey \
    --out cc-resign.cert
```

#### Renunciar con justificación de anclaje
```
  ./bursa cert committee-cold-resign \
    --cold-vkey /path/cc-cold.vkey \
    --anchor-url https://example.com/resign.json \
    --anchor-hash abc123... \
    --out cc-resign.cert
```

***

Explora otros comandos de Bursa

> **Categorías de comandos de Bursa**
> 1. [wallet](../003-commands) &nbsp; - Comandos para generar billetera y los archivos necesarios para administrar una billetera de Cardano
> 2. [api](../003-commands)  &emsp;&nbsp;&nbsp; - Comandos para ejecutar la API
> 3. [cert](#cert)   &emsp;&nbsp; - Comandos para generar varios certificados de Cardano
> 4. [hash](../005-hash-commands)  &nbsp;&nbsp;&nbsp; - Comandos para generar hashes criptográficos usados en Cardano
> 5. [script](../006-script-commands) &nbsp;&nbsp; - Comandos para operaciones multifirma
> 6. [address](../007-address-commands) - Comandos para trabajar con direcciones de Cardano
> 7. [key](../008-key-commands)  &emsp;&nbsp;&nbsp; - Comandos para derivar claves individuales a partir de una mnemónica

***
