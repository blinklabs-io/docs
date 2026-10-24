---
title: Configuración de instantáneas de pares
description: Configura y valida una referencia de instantánea de pares de Dingo.
---

# Configuración de instantáneas de pares

## Descripción general

Esta referencia describe `peerSnapshotFile` en `topology.json` de Dingo y las comprobaciones que debe superar la instantánea al inicio. El formato admitido es `peer-snapshot.json` de cardano-node con `NodeToClientVersion` establecido en `23`.

## Configurar peerSnapshotFile

Añade `peerSnapshotFile` a `topology.json` para referenciar una instantánea:

```json
{
  "peerSnapshotFile": "peer-snapshot.json"
}
```

Dingo resuelve su ruta de forma relativa al archivo `topology.json`.

## Requisitos de la instantánea

Debe cumplir todos estos requisitos:

- Establecer `NodeToClientVersion` en `23`.
- Especificar `NetworkMagic` con el identificador de red configurado en el nodo.
- Establecer `Point.blockPointHash` en exactamente 64 caracteres hexadecimales, que representan 32 bytes.
- Incluir `Point.blockPointSlot` dentro de `Point`. Dingo no impone otra restricción a su valor.
- Rellenar exactamente una de las listas `bigLedgerPools` o `allLedgerPools`. Dingo rechaza la instantánea si ambas están vacías o ambas contienen datos.
- Incluir al menos un pool en la lista utilizada.
- Incluir al menos un relay en cada pool.

## Requisitos de los relays

Cada relay de la lista de pools debe cumplir estos requisitos:

- Tener una dirección no vacía que sea un nombre DNS válido o una dirección IP distinta de la dirección no especificada.
- Las entradas DNS o de nombre de host pueden omitir el puerto TCP o establecer `port` en `0`; Dingo las conserva como relays `MultiHostName` para resolución SRV.
- Las entradas IP deben especificar un puerto TCP distinto de cero, entre `1` y `65535`. Dingo rechaza las entradas sin puerto o con `port` igual a `0`.

## Comportamiento al inicio

Dingo valida la instantánea completa antes de permitir que sus relays sustituyan los pares de arranque configurados. Si la instantánea tiene un formato incorrecto o es incoherente, detiene el inicio antes de utilizar los relays y no la acepta silenciosamente.

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
