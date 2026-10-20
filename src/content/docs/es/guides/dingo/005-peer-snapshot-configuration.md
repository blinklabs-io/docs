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
- Los relays cuya `address` sea un nombre de host DNS pueden omitir `port` o especificar `port: 0` para la resolución SRV.
- Los relays cuya `address` sea una dirección IP deben especificar un puerto TCP distinto de cero entre `1` y `65535`; `port: 0` no es válido para relays IP.

Dingo detiene el inicio cuando la instantánea está mal formada o cuando incumple cualquiera de estos requisitos.

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
