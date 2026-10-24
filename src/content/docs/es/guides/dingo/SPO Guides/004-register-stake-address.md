---
title: Registrar la dirección de stake
description: Guía para SPO de pools Dingo - Registro de la dirección de stake.
---

# Dingo - Registrar la dirección de stake

La dirección de stake debe registrarse en la cadena antes de utilizarla. Esto requiere las comisiones de la transacción y un depósito, actualmente de 2 ADA según los parámetros del protocolo de la red. El depósito se devuelve al dar de baja la dirección de stake.

✅ Esta guía presupone que los archivos están en `$DINGO_HOME`. Ajusta las rutas si es necesario.

## Paso 1 - Generar el certificado de registro de stake

⚠️ En una máquina aislada de la red.

```
cd $DINGO_HOME
cardano-cli conway stake-address registration-certificate \
--stake-verification-key-file stake.vkey \
--key-reg-deposit-amt "$(jq -r '.stakeAddressDeposit' params.json)" \
--out-file stake.cert
```

## Paso 2 - Crear la transacción

Copia `stake.cert` al directorio `$DINGO_HOME` del entorno conectado.

Consulta el slot actual, que se utiliza en `--invalid-hereafter`:

```
currentSlot=$(cardano-cli conway query tip --testnet-magic 2 | jq -r '.slot')
echo Current Slot: $currentSlot
```

Después crea la transacción. El comando `transaction build` calcula automáticamente las comisiones y el cambio:

```
cd $DINGO_HOME
cardano-cli conway transaction build \
--tx-in $(cardano-cli query utxo --address $(cat payment.addr) --out-file /dev/stdout | jq -r 'keys[0]') \
--change-address $(cat payment.addr) \
--certificate-file stake.cert \
--invalid-hereafter $(( ${currentSlot} + 1000 )) \
--witness-override 2 \
--out-file tx.raw
```

`--witness-override 2` indica al estimador de comisiones que firmarán dos claves: pago y stake.

## Paso 3 - Firmar la transacción

Copia `tx.raw` al directorio `$DINGO_HOME` de la máquina aislada de la red. Firma la transacción con las claves de firma de pago y de stake.

⚠️ En una máquina aislada de la red.

```
cd $DINGO_HOME
cardano-cli conway transaction sign \
--tx-body-file tx.raw \
--signing-key-file payment.skey \
--signing-key-file stake.skey \
--out-file tx.signed
```

## Paso 4 - Enviar la transacción

Copia `tx.signed` al directorio `$DINGO_HOME` del entorno conectado.

```
cd $DINGO_HOME
cardano-cli conway transaction submit --tx-file tx.signed
```

### ¡Enhorabuena! Ya puedes continuar con la siguiente sección.
