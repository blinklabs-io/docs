---
title: Consultar el calendario de bloques
description: Guía para SPO de pools Dingo - Consultar el liderazgo de slots y el calendario de bloques.
---

Puedes consultar si tienes asignada la producción de un bloque mediante la comprobación de liderazgo de slots de `cardano-cli`.

Puedes hacerlo para la época actual o la siguiente. El calendario de la próxima época está disponible cuando la época actual se ha completado al menos en un 70%.

<img src="/dingo-epoch-70-percent-over.png"
     alt="Época de Dingo completada en más de un 70%"
     style="max-width:100%; height:auto; max-height:350px; object-fit:contain; border:1px solid #ccc;" />

## Consultar el liderazgo de slots de la época actual

Ejecuta el siguiente comando para consultar si el pool tiene asignado producir un bloque en la época actual.

✅ Se presupone que tienes stakepoolid.txt en el productor de bloques. Si no es así, sigue [estos pasos](../005-register-pool/#step-81---create-stakepoolidtxt-file).

⚠️ Ajusta las rutas si es necesario.

```
cd $DINGO_HOME
cardano-cli query leadership-schedule \
   --genesis $DINGO_HOME/config/shelley-genesis.json \
   --stake-pool-id $(cat stakepoolid.txt) \
   --vrf-signing-key-file vrf.skey \
   --testnet-magic 2 \
   --current
```

## Consultar el liderazgo de slots de la próxima época

Ejecuta el siguiente comando para consultar si el pool tiene asignado producir un bloque en la próxima época. Hazlo únicamente cuando la época actual se haya completado en más de un 70%.

✅ Se presupone que tienes stakepoolid.txt en el productor de bloques. Si no es así, sigue [estos pasos](../005-register-pool/#step-81---create-stakepoolidtxt-file).

⚠️ Ajusta las rutas si es necesario.

```
cd $DINGO_HOME
cardano-cli query leadership-schedule \
   --genesis $DINGO_HOME/config/shelley-genesis.json \
   --stake-pool-id $(cat stakepoolid.txt) \
   --vrf-signing-key-file vrf.skey \
   --testnet-magic 2 \
   --next
```

### ¡Enhorabuena!

¡Esperamos que tu pool tenga asignados bloques de **Cardano** para producir con Dingo!
