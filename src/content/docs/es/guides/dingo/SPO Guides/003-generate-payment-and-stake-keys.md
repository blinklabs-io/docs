---
title: Generar claves de pago y stake
description: Guía para SPO de pools Dingo - Generación de claves de pago y stake.
---

# Dingo - Generar claves de pago y stake

✅ Esta guía presupone que los archivos están en `$DINGO_HOME`. Ajusta las rutas si es necesario.

## Paso 1 - Obtener los parámetros del protocolo

```
cd $DINGO_HOME
cardano-cli conway query protocol-parameters \
--testnet-magic 2 \
--out-file params.json
```

## Paso 2 - Generar un nuevo par de claves de pago

Genera el par de claves de pago `payment.skey` y `payment.vkey`.

⚠️ En una máquina aislada de la red.

```
cd $DINGO_HOME
cardano-cli conway address key-gen \
--verification-key-file payment.vkey \
--signing-key-file payment.skey
```

## Paso 3 - Generar un nuevo par de claves de dirección de stake

Genera el par de claves `stake.skey` y `stake.vkey`.

⚠️ En una máquina aislada de la red.

```
cd $DINGO_HOME
cardano-cli conway stake-address key-gen \
--verification-key-file stake.vkey \
--signing-key-file stake.skey
```

## Paso 4 - Generar la dirección de stake

Genera una dirección de stake a partir de su clave de verificación y guárdala en `stake.addr`.

⚠️ En una máquina aislada de la red.

```
cd $DINGO_HOME
cardano-cli conway stake-address build \
--stake-verification-key-file stake.vkey \
--out-file stake.addr \
--testnet-magic 2
```

## Paso 5 - Generar la dirección de pago

Genera una dirección de pago con la clave de pago `payment.vkey` y la clave de stake `stake.vkey`, y guárdala en `payment.addr`.

```
cd $DINGO_HOME
cardano-cli conway address build \
--payment-verification-key-file payment.vkey \
--stake-verification-key-file stake.vkey \
--out-file payment.addr \
--testnet-magic 2
```

Muestra la dirección de pago:

```
cat payment.addr
```

✅ **Copia únicamente `payment.addr` al entorno conectado. Conserva `payment.skey` en la máquina aislada de la red.**

## Paso 6 - Añadir fondos a la dirección de pago

En las redes de prueba puedes obtener ADA de prueba en el [faucet de Cardano](https://docs.cardano.org/cardano-testnets/tools/faucet). Selecciona la red de prueba Preview y pega tu payment.addr.

Tras añadir fondos, comprueba el saldo de la dirección de pago:

```
cardano-cli conway query utxo \
--address $(cat payment.addr) \
--testnet-magic 2
```

### ¡Enhorabuena! Ya puedes continuar con la siguiente sección.
