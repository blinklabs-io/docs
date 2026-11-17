---
title: Referencia del esquema de eventos de gobernanza
description: Estructura de los eventos `input.governance` de Adder.
---

# Eventos de gobernanza

Adder emite eventos estructurados para las acciones de gobernanza en cadena y la actividad de certificados en la cadena de bloques Cardano. Estos eventos capturan los datos de gobernanza de la era Conway y permiten supervisar los procedimientos de propuestas, la actividad de votación, los registros de DRep, las delegaciones de voto y los cambios del Comité Constitucional.

## Descripción general

El plugin de entrada de chainsync emite un evento `input.governance` por cada transacción de bloque que contiene datos de gobernanza en cadena de la era Conway. Una transacción produce exactamente un evento `input.governance`, que reúne todos los datos de gobernanza encontrados en esa transacción.

Adder emite los eventos de gobernanza además de los eventos `input.transaction` normales para la misma transacción. Una reproducción o un reprocesamiento después de un rollback puede emitir la misma transacción otra vez. Las transacciones sin datos de gobernanza no producen un evento `input.governance`.

- **Nombre del tipo de evento**: `input.governance`

---

## Estructura del evento

Un evento de gobernanza consta de un objeto JSON de nivel superior que contiene `timestamp`, `type`, `context` y `payload`.

### Campos de contexto

El objeto `context` identifica la transacción y la posición en la cadena donde Adder encontró los datos de gobernanza.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `transactionHash` | string | Hash de 32 bytes codificado en hexadecimal de la transacción que contiene los datos de gobernanza. |
| `blockNumber` | number | Altura del bloque, como número absoluto, que contiene la transacción. |
| `slotNumber` | number | Número de slot del bloque que contiene la transacción. |
| `transactionIdx` | number | Índice basado en cero de la transacción dentro del bloque. |
| `networkMagic` | number | Identificador de network magic del nodo conectado. |

### Campos de la carga útil

El objeto `payload` contiene información del bloque y matrices de elementos relacionados con la gobernanza. Adder omite cada matriz cuando está vacía.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `blockHash` | string | Hash del bloque que contiene la transacción, codificado en hexadecimal. |
| `transactionCbor` | string | CBOR sin procesar de la transacción en formato hexadecimal; aparece solo cuando se establece `--input-chainsync-include-cbor`. |
| `proposalProcedures` | array | Lista de acciones de gobernanza propuestas en esta transacción. |
| `votingProcedures` | array | Lista de votos emitidos en esta transacción. |
| `drepCertificates` | array | Lista de certificados de registro, actualización o retiro de DRep. |
| `voteDelegationCertificates` | array | Lista de certificados que delegan el voto de una credencial de participación a un DRep. |
| `committeeCertificates` | array | Lista de certificados de autorización o renuncia del Comité Constitucional. |

---

## Estructuras de datos incluidas

### `proposalProcedures[]`

Representa una acción de gobernanza propuesta, es decir, una propuesta nueva.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `index` | number | Índice de la propuesta dentro de las propuestas de la transacción. |
| `deposit` | `uint64` | Importe del depósito en Lovelace bloqueado para esta propuesta. El consumidor debe deserializarlo como un entero sin signo de 64 bits; Adder conserva valores de todo el rango `uint64` y no aplica un límite `MaxInt64`. |
| `rewardAccount` | string | Dirección de participación o recompensa donde se devolverá el depósito al finalizar. |
| `actionType` | string | Uno de `ParameterChange`, `HardForkInitiation`, `TreasuryWithdrawal`, `NoConfidence`, `UpdateCommittee`, `NewConstitution` o `Info`; los tipos no reconocidos usan `Unknown`. |
| `actionData` | object | Datos específicos de la acción; para las acciones reconocidas, un campo con la clave de la acción contiene los datos, por ejemplo `parameterChange`, `treasuryWithdrawal` o `newConstitution`. |
| `anchor` | object | `{ "url", "dataHash" }`; ambas cadenas están vacías cuando no hay metadatos. |

### `votingProcedures[]`

Representa un voto emitido sobre una propuesta activa.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `voterType` | string | Uno de `DRep` (Delegado representante), `SPO` (operador de pool de participación) o `CCHot` (credencial activa del Comité Constitucional); los tipos no reconocidos usan `Unknown`. |
| `voterHash` | string | Hash de la credencial del votante, codificado en hexadecimal. |
| `voterId` | string | Identificador Bech32 del votante, por ejemplo `drep1...`. |
| `govActionTxId` | string | ID de la transacción de la acción de gobernanza sometida a votación. |
| `govActionIndex` | number | Índice de la acción de gobernanza dentro de esa transacción. |
| `vote` | string | Voto emitido: `Yes`, `No` o `Abstain`; los valores no reconocidos usan `Unknown`. |
| `anchor` | object | `{ "url", "dataHash" }`; ambas cadenas están vacías cuando no hay metadatos del voto. |

### `drepCertificates[]`

Representa cambios en el estado de un DRep.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `certificateType` | string | Uno de `Registration`, `Update` o `Deregistration`. |
| `drepHash` | string | Hash de la credencial del DRep, codificado en hexadecimal. |
| `drepId` | string | ID Bech32 del DRep (`drep1...` o `drep_script1...`). |
| `deposit` | `uint64` | Depósito en Lovelace requerido para el registro o reembolsado al retirar el registro; Adder omite el campo cuando su valor es cero. El consumidor debe deserializarlo como un entero sin signo de 64 bits y no aplicar un límite `MaxInt64`. |
| `anchor` | object | `{ "url", "dataHash" }`; ambas cadenas están vacías cuando no hay metadatos del DRep. |

### `voteDelegationCertificates[]`

Representa una delegación del poder de voto de una dirección de participación a un DRep o a un estado predefinido.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `certificateType` | string | Uno de `VoteDelegation`, `StakeVoteDelegation`, `VoteRegistrationDelegation` o `StakeVoteRegistrationDelegation`. |
| `stakeCredential` | string | Hash de la credencial de participación del delegante, codificado en hexadecimal. |
| `drepType` | string | Destino de la delegación: `KeyHash`, `ScriptHash`, `Abstain` o `NoConfidence`. |
| `drepHash` | string | Hash de la credencial del DRep, codificado en hexadecimal; se omite para `Abstain` y `NoConfidence`. |
| `drepId` | string | ID Bech32 del DRep; se omite para `Abstain` y `NoConfidence`. |
| `poolKeyHash` | string | Hash de la clave del pool, codificado en hexadecimal; aparece solo para los tipos combinados de delegación de participación y voto. |
| `deposit` | `uint64` | Importe del depósito en Lovelace para los tipos de registro y delegación; Adder omite el campo cuando su valor es cero. El consumidor debe deserializarlo como un entero sin signo de 64 bits y no aplicar un límite `MaxInt64`. |

### `committeeCertificates[]`

Representa cambios en las credenciales del Comité Constitucional.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `certificateType` | string | `AuthHot` para autorizar una credencial activa o `ResignCold` para renunciar a una credencial fría. |
| `coldCredential` | string | Hash de la credencial fría del comité, codificado en hexadecimal. |
| `hotCredential` | string | Hash de la credencial activa del comité, codificado en hexadecimal; aparece solo para `AuthHot`. |
| `anchor` | object | Siempre se serializa; las cadenas están vacías salvo cuando un certificado `ResignCold` proporciona metadatos. |

---

## Acciones de gobernanza compatibles

El libro mayor de Conway define siete tipos de acciones de propuesta:

1. **`ParameterChange`**: propone actualizar uno o más parámetros del protocolo de red.
2. **`HardForkInitiation`**: propone actualizar el protocolo a una versión más reciente mediante un hard fork.
3. **`TreasuryWithdrawal`**: propone retirar fondos en Lovelace de la tesorería hacia cuentas de recompensa específicas.
4. **`NoConfidence`**: propone declarar falta de confianza en el Comité Constitucional actual.
5. **`UpdateCommittee`**: propone cambiar la membresía, el umbral o los mandatos del Comité Constitucional.
6. **`NewConstitution`**: propone actualizar la Constitución de la red y su ancla fuera de la cadena.
7. **`Info`**: acción sin efecto en el libro mayor, normalmente usada para medir la opinión de la comunidad o publicar anuncios.

---

## Filtrado de eventos de gobernanza

Los eventos de gobernanza admiten tres filtros específicos de Cardano para el pipeline:

- **Filtro de DRep (`--filter-drep`)**: coincide con eventos que implican un DRep específico: certificados de registro, actualización o retiro de DRep; certificados de delegación de voto dirigidos a ese DRep; y procedimientos de votación en los que ese DRep actúa como votante. Admite formatos hexadecimal o Bech32, incluidos los ID de DRep de script.
- **Filtro de pool (`--filter-pool`)**: coincide con eventos que implican un pool de participación: procedimientos de votación emitidos por el pool como SPO y certificados de delegación de voto que hacen referencia al hash de clave del pool.
- **Filtro de dirección (`--filter-address`)**: coincide con las direcciones implicadas en la acción de gobernanza: cuentas de recompensa de las propuestas, direcciones de destino de retiros de tesorería o credenciales de participación delegantes.

### Ejemplos de filtrado

#### Línea de comandos
```bash
# Filter on a DRep using Bech32
./adder --filter-type input.governance \
  --filter-drep drep1p4h4ea7y70ede2wy7x3t83x4umm63wwq68308f94cmt7szexmnr

# Filter on a stake address (multiple comma-separated addresses use OR)
./adder --filter-type input.governance \
  --filter-address stake1u9f9v0z5zzlldgx58n8tklphu8mf7h4jvp2j2gddluemnssjfnkzz
```

#### Configuración YAML
```yaml
plugins:
  filter:
    event:
      type: "input.governance"
    cardano:
      drep: "drep1p4h4ea7y70ede2wy7x3t83x4umm63wwq68308f94cmt7szexmnr"
      address: "stake1u9f9v0z5zzlldgx58n8tklphu8mf7h4jvp2j2gddluemnssjfnkzz"
```

---

## Ejemplo de salida JSON

El siguiente ejemplo muestra la carga útil de un evento `input.governance` que representa un **certificado de registro de DRep**:

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
    ]
  }
}
```

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>