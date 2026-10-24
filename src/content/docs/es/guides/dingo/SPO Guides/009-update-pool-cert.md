---
title: Actualizar el certificado del pool
description: Guía para SPO de pools Dingo - Actualización del certificado del pool.
---

# Dingo - Actualizar el certificado del pool

Con el tiempo, puede que necesites actualizar el certificado del pool (`pool.cert`) para cambiar la cantidad comprometida, las comisiones o la información de los relays. Esta guía explica el proceso.

✅ Se presupone que generaste el `pool.cert` original mediante la guía [Registrar el stake pool](../005-register-pool).

⚠️ Si modificas preview-pool-metadata.json, vuelve a calcular el hash de los metadatos y publica el archivo actualizado antes de continuar. Sigue los pasos de [Registrar el stake pool](../005-register-pool).

## Paso 1 - Editar el archivo env

Actualiza los valores de `env` con la nueva información del pool.

⚠️ En una máquina aislada de la red.

```
sudo nano $DINGO_HOME/pool-scripts/env
```

Ejemplo de archivo `env`:

```
PLEDGE=25000000000  # 25,000 ADA
COST=170000000     #  170 ADA
MARGIN=0.01        #    1 %

NET="--testnet-magic 2"  #preview
RELAY1_HOST=55.209.117.58
RELAY1_PORT=6000
RELAY2_HOST=55.23.123.206
RELAY2_PORT=6000
METADATA_URL=https://website.com/preview-pool-metadata.json
METADATA_HASH=$(cat $DINGO_HOME/previewPoolMetaDataHash.txt)
```

## Paso 2 - Ejecutar el script

Ejecuta el script para generar el nuevo certificado de registro del pool, que después deberás enviar en una transacción:

```
cd $DINGO_HOME/pool-scripts
./pool-registration.sh
```

## Paso 3 - Copiar pool.cert al entorno conectado

Copia `pool.cert` al directorio `$DINGO_HOME` del entorno conectado, ya sea el productor de bloques o un relay.

## Paso 4 - Enviar el certificado del pool

Crea y firma la transacción para enviar el `pool.cert` actualizado a la cadena.

### Paso 4.1 - Consultar el slot actual

```
currentSlot=$(cardano-cli conway query tip --testnet-magic 2 | jq -r '.slot')
echo Current Slot: $currentSlot
```

### Paso 4.2 - Crear la transacción

```
cd $DINGO_HOME
cardano-cli conway transaction build \
    --tx-in $(cardano-cli query utxo --address $(cat payment.addr) --out-file /dev/stdout | jq -r 'keys[0]') \
    --change-address $(cat payment.addr) \
    --certificate-file pool.cert \
    --invalid-hereafter $(( ${currentSlot} + 1000 )) \
    --witness-override 2 \
    --out-file tx.raw
```

💡 OPCIONAL: comprueba que los valores de pool.cert sean correctos:

> ```
> cardano-cli debug transaction view \
> --tx-body-file tx.raw
> ```

### Paso 4.3 - Firmar la transacción

Copia `tx.raw` al directorio `$DINGO_HOME` del entorno frío.

⚠️ En una máquina aislada de la red.

```
cd $DINGO_HOME
cardano-cli conway transaction sign \
--tx-body-file tx.raw \
--signing-key-file payment.skey \
--signing-key-file $DINGO_HOME/cold-keys/node.skey \
--out-file tx.signed
```

### Paso 4.4 - Enviar la transacción

Copia `tx.signed` al directorio `$DINGO_HOME` del entorno conectado, ya sea el productor de bloques o un relay.

```
cd $DINGO_HOME
cardano-cli conway transaction submit --tx-file tx.signed
```

## Paso 5 - Verificar el registro

Los cambios entran en vigor en dos épocas. Tras la próxima transición de época, comprueba que la configuración del pool sea correcta.

Espera unos minutos a que la transacción llegue a la cadena y comprueba que haya tenido éxito con tu explorador de Cardano preferido, por ejemplo [Cardanoscan Preview](https://preview.cardanoscan.io/).
