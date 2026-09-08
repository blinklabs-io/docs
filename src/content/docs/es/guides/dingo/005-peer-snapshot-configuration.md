---
title: Configuración de la instantánea de pares
description: Requisitos para configurar peerSnapshotFile en la topología de Dingo.
---

# Configuración de la instantánea de pares

Esta guía describe cómo configurar una instantánea de pares de `cardano-node` en `topology.json`. Dingo obtiene la ruta de la instantánea mediante `peerSnapshotFile`.

## Referenciar la instantánea desde topology.json

Añade `peerSnapshotFile` a `topology.json`:

```json
{
  "peerSnapshotFile": "peer-snapshot.json"
}
```

Dingo resuelve una ruta relativa con respecto al archivo de topología. La instantánea debe contener el formato de instantánea de pares de `cardano-node`.

## Requisitos de la instantánea

Dingo valida la instantánea antes de iniciar las conexiones de salida. La configuración debe cumplir todos estos requisitos:

- `NodeToClientVersion` debe ser `23`.
- `NetworkMagic` debe estar especificado y coincidir con el `NetworkMagic` configurado para el nodo.
- `Point.blockPointHash` debe contener exactamente 64 caracteres hexadecimales, que representan 32 bytes.
- La instantánea debe tener exactamente uno de estos campos poblado: `bigLedgerPools` o `allLedgerPools`.
- El modo seleccionado debe contener al menos un grupo.
- Cada grupo seleccionado debe contener al menos un relay.

`bigLedgerPools` y `allLedgerPools` son mutuamente excluyentes. Una instantánea que pueble ambos campos, o que no pueble ninguno, no es válida.

## Requisitos de los relays

Cada relay del modo seleccionado debe cumplir estas condiciones:

- `address` no puede estar vacío.
- `address` debe ser un nombre de host DNS válido o una dirección IP especificada; las direcciones IP `unspecified` no son válidas.
- `port` debe estar especificado y debe ser un puerto TCP entre `1` y `65535`.

Los relays SRV sin puerto explícito, incluidos los relays con `port` igual a `0`, no son compatibles. Dingo detiene el inicio cuando la instantánea está mal formada o cuando incumple cualquiera de estos requisitos.