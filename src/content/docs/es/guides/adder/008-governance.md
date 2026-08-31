---
title: Eventos de gobernanza
description: Esquema de eventos de gobernanza y filtros de Adder.
---

# Eventos de gobernanza

Esta guía describe el evento `input.governance` de Adder, sus datos de gobernanza de la era Conway y los filtros que permiten seleccionar eventos relacionados con DRep, pools y direcciones.

## Cuándo se emite el evento

El componente de entrada `chainsync` emite un evento `input.governance` por cada transacción de un bloque que contiene datos de gobernanza en cadena de la era Conway. Cada transacción produce exactamente un evento de gobernanza, que reúne todos los datos de gobernanza de esa transacción.

Adder emite el evento `input.governance` además del evento `input.transaction` correspondiente. Las transacciones sin datos de gobernanza no producen un evento `input.governance`.

## Estructura del evento

El evento contiene un objeto JSON de nivel superior con `timestamp`, `type`, `context` y `payload`.

### Campos del evento

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `timestamp` | string | Marca de tiempo del evento. |
| `type` | string | Tipo del evento: `input.governance`. |
| `context` | object | Identifica la transacción y la posición en la cadena donde Adder encontró los datos de gobernanza. |
| `payload` | object | Contiene la información del bloque y los datos de gobernanza de la transacción. |

### Campos de `context`

El objeto `context` identifica la transacción y la posición en la cadena donde aparecen los datos de gobernanza.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `transactionHash` | string | Hash de 32 bytes de la transacción en formato hexadecimal. |
| `blockNumber` | number | Altura absoluta del bloque que contiene la transacción. |
| `slotNumber` | number | Número de slot del bloque que contiene la transacción. |
| `transactionIdx` | number | Índice de la transacción dentro del bloque, empezando en `0`. |
| `networkMagic` | number | Identificador `network magic` del nodo conectado. |

### Campos de `payload`

El objeto `payload` contiene la información del bloque y arreglos con los elementos de gobernanza. Adder puede omitir los arreglos vacíos.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `blockHash` | string | Hash hexadecimal del bloque que contiene la transacción. |
| `transactionCbor` | string | CBOR sin procesar de la transacción en formato hexadecimal. Adder incluye este campo únicamente cuando el proceso usa `--input-chainsync-include-cbor`. |
| `proposalProcedures` | array | Propuestas de acciones de gobernanza incluidas en la transacción. |
| `votingProcedures` | array | Votos incluidos en la transacción. |
| `drepCertificates` | array | Certificados de registro, actualización o retiro de DRep. |
| `voteDelegationCertificates` | array | Certificados que delegan el voto desde una credencial de stake a un DRep o a un estado predefinido. |
| `committeeCertificates` | array | Certificados de autorización o renuncia del Comité Constitucional. |

## Estructuras anidadas

### `proposalProcedures[]`

Cada elemento representa una acción de gobernanza propuesta.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `index` | number | Índice de la propuesta dentro de las propuestas de la transacción. |
| `deposit` | number | Depósito en Lovelace bloqueado para la propuesta. |
| `rewardAccount` | string | Dirección de stake o recompensa que recibe el depósito cuando finaliza la propuesta. |
| `actionType` | string | Tipo de acción de gobernanza. Consulte [Acciones de gobernanza admitidas](#acciones-de-gobernanza-admitidas). |
| `actionData` | object | Datos específicos de la acción. El objeto contiene exactamente un campo, identificado por la acción, como `parameterChange`, `treasuryWithdrawal` o `newConstitution`. |
| `anchor` | object | Referencia opcional a metadatos externos mediante `url` y `dataHash`. |

### `votingProcedures[]`

Cada elemento representa un voto sobre una propuesta activa.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `voterType` | string | Tipo de votante: `DRep`, `SPO` o `CCHot`. `DRep` identifica a un representante delegado, `SPO` a un operador de pool y `CCHot` a una credencial hot del Comité Constitucional. |
| `voterHash` | string | Hash hexadecimal de la credencial del votante. |
| `voterId` | string | Identificador Bech32 del votante, como `drep1...`. |
| `govActionTxId` | string | Identificador de la transacción que contiene la acción de gobernanza votada. |
| `govActionIndex` | number | Índice de la acción de gobernanza dentro de esa transacción. |
| `vote` | string | Voto emitido: `Yes`, `No` o `Abstain`. |
| `anchor` | object | Referencia opcional a los metadatos externos de la justificación del voto mediante `url` y `dataHash`. |

### `drepCertificates[]`

Cada elemento representa un cambio en el estado de un DRep.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `certificateType` | string | Tipo de certificado: `Registration`, `Update` o `Deregistration`. |
| `drepHash` | string | Hash hexadecimal de la credencial del DRep. |
| `drepId` | string | Identificador Bech32 del DRep, con formato `drep1...` o `drep_script1...`. |
| `deposit` | number | Depósito en Lovelace requerido para el registro o reembolsado al retirar el DRep. |
| `anchor` | object | Referencia opcional a metadatos externos mediante `url` y `dataHash`. |

### `voteDelegationCertificates[]`

Cada elemento representa la delegación del poder de voto de una dirección de stake a un DRep o a un estado predefinido.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `certificateType` | string | Tipo de certificado: `VoteDelegation`, `StakeVoteDelegation`, `VoteRegistrationDelegation` o `StakeVoteRegistrationDelegation`. |
| `stakeCredential` | string | Hash hexadecimal de la credencial de stake del delegante. |
| `drepType` | string | Destino de la delegación: `KeyHash`, `ScriptHash`, `Abstain` o `NoConfidence`. |
| `drepHash` | string | Hash hexadecimal de la credencial del DRep. Adder omite este campo para `Abstain` y `NoConfidence`. |
| `drepId` | string | Identificador Bech32 del DRep. Adder omite este campo para `Abstain` y `NoConfidence`. |
| `poolKeyHash` | string | Hash hexadecimal de la clave del pool. Adder incluye este campo únicamente para los tipos combinados de delegación de stake y voto. |
| `deposit` | number | Depósito en Lovelace. Adder incluye este campo únicamente para los tipos de delegación con registro. |

### `committeeCertificates[]`

Cada elemento representa un cambio en las credenciales del Comité Constitucional.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `certificateType` | string | Tipo de certificado: `AuthHot` para autorizar una credencial hot o `ResignCold` para renunciar a una credencial cold. |
| `coldCredential` | string | Hash hexadecimal de la credencial cold del comité. |
| `hotCredential` | string | Hash hexadecimal de la credencial hot del comité. Adder incluye este campo únicamente para `AuthHot`. |
| `anchor` | object | Metadatos opcionales mediante `url` y `dataHash`. Adder incluye este campo únicamente para `ResignCold`. |

## Acciones de gobernanza admitidas

La era Conway admite los siguientes tipos de acción de propuesta:

1. `ParameterChange`: propone actualizar uno o más parámetros del protocolo de red.
2. `HardForkInitiation`: propone una actualización de protocolo a una versión posterior.
3. `TreasuryWithdrawal`: propone retirar fondos en Lovelace de la tesorería y enviarlos a direcciones de recompensa específicas.
4. `NoConfidence`: propone retirar la confianza del Comité Constitucional actual.
5. `UpdateCommittee`: propone cambiar los miembros, el umbral o las condiciones del Comité Constitucional.
6. `NewConstitution`: propone actualizar la Constitución de la red y su referencia externa.
7. `Info`: registra una acción sin efecto en el libro mayor, normalmente para conocer la opinión de la comunidad o publicar anuncios.

## Ejemplo de salida JSON

El siguiente ejemplo combina una propuesta, un voto y certificados de gobernanza para mostrar los nombres de campo actuales:

```json
{
  "timestamp": "2026-07-17T21:40:00Z",
  "type": "input.governance",
  "context": {
    "transactionHash": "58200a1ad4abcd7290bc9831d102e34fa9de1e0287a98bcdef1238b1f20a67bc",
    "blockNumber": 10528430,
    "slotNumber": 68493120,
    "transactionIdx": 3,
    "networkMagic": 764824073
  },
  "payload": {
    "blockHash": "13aa2accf2e1561723aa26871e071fdf32c867cff7e7d50ad470d62fdeadbeef",
    "proposalProcedures": [
      {
        "index": 0,
        "deposit": 500000000,
        "rewardAccount": "stake_test1u9f9v0z5zzlldgx58n8tklphu8mf7h4jvp2j2gddluemnssjfnkzz",
        "actionType": "ParameterChange",
        "actionData": {
          "parameterChange": {}
        },
        "anchor": {
          "url": "https://example.com/governance-proposal.json",
          "dataHash": "58200a1ad4abcd7290bc9831d102e34fa9de1e0287a98bcdef1238b1f20a67bc"
        }
      }
    ],
    "votingProcedures": [
      {
        "voterType": "SPO",
        "voterHash": "81f156d98e1f02123abccdef5439a89d71fa9d8b76c8db028c7df0e1",
        "voterId": "pool1pu5jlj6k8f5x5z7z0v9m5c6g4q2w3e8r7t6y5u4i3o2p1a",
        "govActionTxId": "58200a1ad4abcd7290bc9831d102e34fa9de1e0287a98bcdef1238b1f20a67bc",
        "govActionIndex": 0,
        "vote": "Yes",
        "anchor": {
          "url": "https://example.com/vote-rationale.json",
          "dataHash": "13aa2accf2e1561723aa26871e071fdf32c867cff7e7d50ad470d62fdeadbeef"
        }
      }
    ],
    "drepCertificates": [
      {
        "certificateType": "Registration",
        "drepHash": "81f156d98e1f02123abccdef5439a89d71fa9d8b76c8db028c7df0e1",
        "drepId": "drep1p4h4ea7y70ede2wy7x3t83x4umm63wwq68308f94cmt7szexmnr",
        "deposit": 500000000,
        "anchor": {
          "url": "https://example.com/drep-metadata.json",
          "dataHash": "58200a1ad4abcd7290bc9831d102e34fa9de1e0287a98bcdef1238b1f20a67bc"
        }
      }
    ],
    "voteDelegationCertificates": [
      {
        "certificateType": "VoteDelegation",
        "stakeCredential": "81f156d98e1f02123abccdef5439a89d71fa9d8b76c8db028c7df0e1",
        "drepType": "KeyHash",
        "drepHash": "81f156d98e1f02123abccdef5439a89d71fa9d8b76c8db028c7df0e1",
        "drepId": "drep1p4h4ea7y70ede2wy7x3t83x4umm63wwq68308f94cmt7szexmnr"
      }
    ],
    "committeeCertificates": [
      {
        "certificateType": "AuthHot",
        "coldCredential": "81f156d98e1f02123abccdef5439a89d71fa9d8b76c8db028c7df0e1",
        "hotCredential": "13aa2accf2e1561723aa26871e071fdf32c867cff7e7d50ad470d62fdeadbeef"
      }
    ]
  }
}
```

## Filtros de gobernanza

Los eventos de gobernanza admiten tres filtros específicos de Cardano. Combine cada filtro con `--filter-type input.governance` para limitar la salida a eventos de gobernanza.

- `--filter-drep`: busca eventos relacionados con un DRep específico. El filtro cubre certificados de registro, actualización y retiro de DRep, certificados de delegación de voto dirigidos a ese DRep y procedimientos de votación en los que el DRep actúa como votante. El valor admite formatos hexadecimal y Bech32, incluidos los identificadores de DRep de script.
- `--filter-pool`: busca eventos relacionados con un pool. El filtro coincide con procedimientos de votación `SPO` emitidos por el pool y con certificados de delegación de voto que contienen el hash de la clave del pool.
- `--filter-address`: busca direcciones relacionadas con la acción de gobernanza. El filtro cubre las cuentas de recompensa de las propuestas, las direcciones de destino de retiros de tesorería y las credenciales de stake que delegan su voto.

### Ejemplos de línea de comandos

```bash
# Filtrar por un DRep mediante Bech32
./adder --filter-type input.governance \
  --filter-drep drep1p4h4ea7y70ede2wy7x3t83x4umm63wwq68308f94cmt7szexmnr

# Filtrar por un pool mediante su identificador
./adder --filter-type input.governance \
  --filter-pool pool1pu5jlj6k8f5x5z7z0v9m5c6g4q2w3e8r7t6y5u4i3o2p1a

# Filtrar por varias direcciones; la coincidencia usa OR
./adder --filter-type input.governance \
  --filter-address stake1u9f9v0z5zzlldgx58n8tklphu8mf7h4jvp2j2gddluemnssjfnkzz,stake1ux7abcd...
```

### Ejemplo de configuración YAML

```yaml
filter:
  cardano:
    type: "input.governance"
    drep: "drep1p4h4ea7y70ede2wy7x3t83x4umm63wwq68308f94cmt7szexmnr"
    pool: "pool1pu5jlj6k8f5x5z7z0v9m5c6g4q2w3e8r7t6y5u4i3o2p1a"
    address: "stake1u9f9v0z5zzlldgx58n8tklphu8mf7h4jvp2j2gddluemnssjfnkzz"
```

Consulte la [referencia de comandos](./006-command_list.md) para conocer las opciones generales y la lista completa de indicadores.

## Valores de eventos DRep

Los eventos independientes de actividad DRep usan los siguientes valores en el campo `type`:

| Actividad | Tipo de certificado | Valor de cableado |
| :--- | :--- | :--- |
| Registro | `Registration` | `input.drep-registration` |
| Actualización | `Update` | `input.drep-update` |
| Retiro | `Deregistration` | `input.drep-retirement` |

`Deregistration` sigue siendo el valor del tipo de certificado. El evento independiente correspondiente usa `input.drep-retirement` como valor de cableado.

Adder ya no emite los valores anteriores `chainsync.drep.registration`, `chainsync.drep.update` ni `chainsync.drep.deregistration`. Actualice los filtros y consumidores que todavía buscan esos valores.
