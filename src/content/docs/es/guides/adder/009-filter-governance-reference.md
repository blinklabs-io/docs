---
title: Referencia de filtros y gobernanza
description: Semántica de filtros, configuración y eventos de gobernanza de Adder.
---

# Referencia de filtros y gobernanza

## Descripción general

Esta referencia explica cómo Adder selecciona eventos, cómo expresa los filtros en la CLI, las variables de entorno y YAML, y cómo analiza el evento `input.governance`. La [referencia de comandos](./006-command_list) contiene el inventario general de indicadores.

## Filtros de la CLI

### Indicadores y eventos aplicables

| Indicador | Coincide con | Tipos de evento |
| --- | --- | --- |
| `--filter-type` | El tipo de evento de nivel superior | Todos |
| `--filter-address` | Una dirección de pago o de stake | `input.transaction`, `input.governance` |
| `--filter-policy` | Un ID de política de activo | `input.transaction` |
| `--filter-asset` | Una huella digital de activo (`asset1…`) | `input.transaction` |
| `--filter-pool` | Un ID de pool de stake (SPO) | `input.block`, `input.transaction`, `input.governance` |
| `--filter-drep` | Un ID de DRep en hexadecimal o bech32 | `input.transaction`, `input.governance` |

Un filtro que no corresponde al tipo de evento deja pasar ese evento sin cambios. Por ejemplo, `--filter-policy` no elimina eventos `input.block`, y `--filter-asset` no elimina eventos `input.governance`.

Los indicadores largos requieren dos guiones, como `--filter-type`. Adder interpreta la forma de un solo guion, `-filter-type`, como un grupo de indicadores abreviados y la rechaza.

### Valores múltiples y combinación de filtros

Cada valor del filtro acepta alternativas separadas por comas. Adder recorta los espacios que rodean cada alternativa e ignora los elementos vacíos. Por ejemplo, estas dos formas representan las mismas direcciones:

```bash
--filter-address addr1qyht4ja0zcn45qvyx477qlyp6j5ftu5ng0prt9608dxp6l2j2c79gy9l76sdg0xwhd7r0c0kna0tycz4y5s6mlenh8pq4jxtdy, addr1q88zh70hsfjkqnexte4u5ewsfpjq3dxrhlvr3ha7k99p3y8rtwtt945eg3tvmg09t8f4ug4dw24nednp598w4vlycgqsry583e
```

```bash
--filter-address addr1qyht4ja0zcn45qvyx477qlyp6j5ftu5ng0prt9608dxp6l2j2c79gy9l76sdg0xwhd7r0c0kna0tycz4y5s6mlenh8pq4jxtdy,,addr1q88zh70hsfjkqnexte4u5ewsfpjq3dxrhlvr3ha7k99p3y8rtwtt945eg3tvmg09t8f4ug4dw24nednp598w4vlycgqsry583e
```

Dentro de un mismo filtro, Adder emite el evento cuando coincide con cualquiera de sus valores. Entre filtros de clases distintas, Adder aplica `AND`: el evento debe cumplir todos los filtros configurados. La combinación de `--filter-pool` y `--filter-drep` es la excepción: Adder aplica `OR` entre ambos, por lo que basta con que el evento coincida con el pool o con el DRep. Los demás filtros continúan aplicándose con `AND` sobre ese resultado.

Los eventos `input.block` se comparan únicamente con `--filter-pool`, porque `--filter-drep` no se aplica a bloques. Configurar ambos indicadores no amplía los bloques emitidos.

### Mapeo de CLI, entorno y YAML

El nombre abreviado del indicador omite el nombre del plugin. Las variables de entorno y las claves de configuración conservan el tipo y el nombre del plugin; por tanto, el nombre abreviado del indicador no funciona como nombre de entorno o configuración. Por ejemplo, `FILTER_ADDRESS` no configura `--filter-address`.

| Indicador | Variable de entorno | Clave de configuración |
| --- | --- | --- |
| `--filter-address` | `FILTER_CARDANO_ADDRESS` | `plugins.filter.cardano.address` |
| `--filter-asset` | `FILTER_CARDANO_ASSET` | `plugins.filter.cardano.asset` |
| `--filter-policy` | `FILTER_CARDANO_POLICY` | `plugins.filter.cardano.policy` |
| `--filter-pool` | `FILTER_CARDANO_POOL` | `plugins.filter.cardano.pool` |
| `--filter-drep` | `FILTER_CARDANO_DREP` | `plugins.filter.cardano.drep` |
| `--filter-type` | `FILTER_EVENT_TYPE` | `plugins.filter.event.type` |

`--filter-type` pertenece al plugin de filtro `event`, por lo que usa `event` y no `cardano` en su variable de entorno y su clave YAML.

La estructura de configuración utiliza una cadena para cada valor. Para indicar varias alternativas, use una lista separada por comas dentro de esa cadena:

```yaml
plugins:
  filter:
    cardano:
      address: addr1qyht4ja0zcn45qvyx477qlyp6j5ftu5ng0prt9608dxp6l2j2c79gy9l76sdg0xwhd7r0c0kna0tycz4y5s6mlenh8pq4jxtdy
      pool: pool1z5uqdk7dzdxaae5633fqfcu2eqzy3a3rgtuvy087fdld7yws0xt
      drep: drep1p4h4ea7y70ede2wy7x3t83x4umm63wwq68308f94cmt7szexmnr

    event:
      type: input.governance
```

### Ejemplos copiables

Los siguientes ejemplos usan valores de la red como valores de muestra.

#### Tipo de evento

Emita únicamente transacciones:

```bash
adder --filter-type input.transaction
```

Emita transacciones y bloques:

```bash
adder --filter-type input.transaction,input.block
```

#### Política de activo

Emita transacciones que incluyan un activo con la política de muestra:

```bash
adder --filter-type input.transaction \
  --filter-policy 13aa2accf2e1561723aa26871e071fdf32c867cff7e7d50ad470d62f
```

#### Huella digital de activo

Emita transacciones que incluyan el activo de muestra:

```bash
adder --filter-type input.transaction \
  --filter-asset asset108xu02ckwrfc8qs9d97mgyh4kn8gdu9w8f5sxk
```

#### Dirección de pago y dirección de stake

Una dirección de pago coincide con esa dirección exacta:

```bash
adder --filter-type input.transaction \
  --filter-address addr1qyht4ja0zcn45qvyx477qlyp6j5ftu5ng0prt9608dxp6l2j2c79gy9l76sdg0xwhd7r0c0kna0tycz4y5s6mlenh8pq4jxtdy
```

Una dirección de stake coincide con cualquier dirección construida con esa credencial de stake, incluidas otras direcciones de pago de la misma billetera:

```bash
adder --filter-type input.transaction \
  --filter-address stake1u9f9v0z5zzlldgx58n8tklphu8mf7h4jvp2j2gddluemnssjfnkzz
```

#### Varias direcciones

Una lista separada por comas coincide cuando el evento contiene cualquiera de las direcciones indicadas. La lista puede mezclar direcciones de pago y de stake:

```bash
adder --filter-type input.transaction \
  --filter-address addr1qyht4ja0zcn45qvyx477qlyp6j5ftu5ng0prt9608dxp6l2j2c79gy9l76sdg0xwhd7r0c0kna0tycz4y5s6mlenh8pq4jxtdy,addr1q88zh70hsfjkqnexte4u5ewsfpjq3dxrhlvr3ha7k99p3y8rtwtt945eg3tvmg09t8f4ug4dw24nednp598w4vlycgqsry583e
```

```bash
adder --filter-type input.transaction \
  --filter-address addr1qyht4ja0zcn45qvyx477qlyp6j5ftu5ng0prt9608dxp6l2j2c79gy9l76sdg0xwhd7r0c0kna0tycz4y5s6mlenh8pq4jxtdy,stake1u834h94j66v5g4kd58j4n567y2kh92eukes6znh2k0jvyqgfufmts
```

Adder compara ambas clases de dirección con las salidas de la transacción. También compara las entradas resueltas, por lo que gastar desde una dirección coincidente cuenta; esta comparación requiere `KUPO_URL` para resolver el destino de cada entrada. Para una dirección de stake, Adder también compara los certificados de stake de la transacción.

#### Pool de stake (SPO)

Emita bloques creados por el pool de muestra. Los IDs de pool aceptan bech32 (`pool1…`) o hexadecimal:

```bash
adder --filter-type input.block \
  --filter-pool pool1z5uqdk7dzdxaae5633fqfcu2eqzy3a3rgtuvy087fdld7yws0xt
```

Para varios pools, use una lista separada por comas. Adder aplica `OR` entre los IDs y permite mezclar bech32 con hexadecimal:

```bash
adder --filter-type input.block \
  --filter-pool pool1z5uqdk7dzdxaae5633fqfcu2eqzy3a3rgtuvy087fdld7yws0xt,a81f156d98e1f02123abccdef5439a89d71fa9d8b76c8db028c7df0e
```

#### DRep

Emita eventos de gobernanza relacionados con el DRep de muestra:

```bash
adder --filter-type input.governance \
  --filter-drep drep1p4h4ea7y70ede2wy7x3t83x4umm63wwq68308f94cmt7szexmnr
```

`--filter-drep` acepta estos formatos:

- **Bech32:** cualquier valor que comience por `drep`, incluidos los prefijos `drep1…` para un hash de clave y `drep_script1…` para un hash de script. Adder decodifica el valor y espera una credencial de 28 bytes. Si el payload decodificado tiene 29 bytes, Adder elimina el byte inicial como encabezado sin inspeccionarlo ni validarlo. Adder ignora los payloads de cualquier otra longitud y descarta silenciosamente ese ID del filtro.
- **Hexadecimal:** la credencial sin procesar de 28 bytes, expresada como 56 caracteres hexadecimales. Adder no elimina ningún byte inicial del valor hexadecimal; un valor que incluya un byte de encabezado no coincide.

Adder emite los IDs de DRep como bech32 de la credencial sin procesar de 28 bytes: usa el prefijo `drep` para credenciales de hash de clave y `drep_script` para credenciales de hash de script. Un `drepId` emitido por Adder se puede pasar a `--filter-drep` sin cambios.

## Evento de gobernanza

### Cuándo se emite

La entrada `chainsync` emite un evento `input.governance` por cada transacción que contiene datos de gobernanza en cadena de la era Conway. Una transacción produce exactamente un evento `input.governance`, que reúne todos los datos de gobernanza de esa transacción.

Adder emite `input.governance` cuando la transacción contiene uno o más de estos elementos:

- procedimientos de propuesta, que representan nuevas acciones de gobernanza;
- procedimientos de voto, que representan votos sobre acciones de gobernanza;
- certificados de gobernanza: registro, actualización o retiro de DRep; delegación de voto; autorización de una hot key o renuncia de una cold key del Comité Constitucional.

Las transacciones sin datos de gobernanza no generan `input.governance`. Adder emite el evento de gobernanza además del evento `input.transaction` normal de la misma transacción.

### `context`

El objeto `context` identifica la transacción y su posición en la cadena:

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `transactionHash` | string | Hash hexadecimal de la transacción |
| `blockNumber` | number | Altura del bloque que contiene la transacción |
| `slotNumber` | number | Slot del bloque que contiene la transacción |
| `transactionIdx` | number | Índice de la transacción dentro del bloque |
| `networkMagic` | number | Network magic del nodo conectado |

### `payload`

El objeto `payload` siempre contiene `blockHash`. Adder incluye `transactionCbor` cuando ejecuta la entrada con `--input-chainsync-include-cbor` y omite cada uno de los cinco arrays de gobernanza cuando está vacío.

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `blockHash` | string | Hash hexadecimal del bloque que contiene la transacción |
| `transactionCbor` | string | CBOR hexadecimal sin procesar de la transacción; aparece únicamente con `--input-chainsync-include-cbor` |
| `proposalProcedures` | array | Acciones de gobernanza propuestas en la transacción |
| `votingProcedures` | array | Votos emitidos en la transacción |
| `drepCertificates` | array | Certificados de registro, actualización o retiro de DRep |
| `voteDelegationCertificates` | array | Certificados de delegación de voto |
| `committeeCertificates` | array | Certificados de autorización de hot key o renuncia de cold key del Comité Constitucional |

#### `proposalProcedures[]`

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `index` | number | Índice de la propuesta dentro de la transacción |
| `deposit` | number | Depósito bloqueado para la propuesta, en lovelace |
| `rewardAccount` | string | Dirección de stake o recompensa a la que se devuelve el depósito |
| `actionType` | string | Uno de `ParameterChange`, `HardForkInitiation`, `TreasuryWithdrawal`, `NoConfidence`, `UpdateCommittee`, `NewConstitution`, `Info` |
| `actionData` | object | Datos específicos de la acción; exactamente un campo contiene el valor, con una clave como `parameterChange`, `treasuryWithdrawal`, `newConstitution`, `updateCommittee`, `hardForkInitiation`, `noConfidence` o `info` |
| `anchor` | object | Objeto opcional `{ "url", "dataHash" }` que apunta a metadatos fuera de la cadena |

#### `votingProcedures[]`

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `voterType` | string | Uno de `DRep`, `SPO`, `CCHot` |
| `voterHash` | string | Hash hexadecimal de la credencial del votante |
| `voterId` | string | Identificador del votante, en bech32 cuando corresponde |
| `govActionTxId` | string | ID de la transacción de la acción de gobernanza votada |
| `govActionIndex` | number | Índice de la acción de gobernanza dentro de esa transacción |
| `vote` | string | Uno de `Yes`, `No`, `Abstain` |
| `anchor` | object | Objeto opcional `{ "url", "dataHash" }` con metadatos de la justificación del voto |

#### `drepCertificates[]`

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `certificateType` | string | Uno de `Registration`, `Update`, `Deregistration` |
| `drepHash` | string | Hash hexadecimal de la credencial del DRep |
| `drepId` | string | ID del DRep en bech32 (`drep1…` o `drep_script1…`) |
| `deposit` | number | Depósito en lovelace; aparece en el registro y el retiro |
| `anchor` | object | Objeto opcional `{ "url", "dataHash" }` con metadatos |

#### `voteDelegationCertificates[]`

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `certificateType` | string | Uno de `VoteDelegation`, `StakeVoteDelegation`, `VoteRegistrationDelegation`, `StakeVoteRegistrationDelegation` |
| `stakeCredential` | string | Hash hexadecimal de la credencial de stake que delega |
| `drepType` | string | Uno de `KeyHash`, `ScriptHash`, `Abstain`, `NoConfidence` |
| `drepHash` | string | Hash hexadecimal de la credencial del DRep; aparece con `KeyHash` o `ScriptHash` |
| `drepId` | string | ID del DRep en bech32; aparece con `KeyHash` o `ScriptHash` |
| `poolKeyHash` | string | Hash hexadecimal de la clave del pool; aparece con los tipos combinados de delegación de stake y voto |
| `deposit` | number | Depósito en lovelace; aparece con los tipos de delegación de registro |

#### `committeeCertificates[]`

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `certificateType` | string | `AuthHot` para autorización de hot key o `ResignCold` |
| `coldCredential` | string | Hash hexadecimal de la credencial cold del comité |
| `hotCredential` | string | Hash hexadecimal de la credencial hot del comité; aparece con `AuthHot` |
| `anchor` | object | Objeto opcional `{ "url", "dataHash" }`; aparece con `ResignCold` |

## Filtrado de eventos de gobernanza

Adder aplica tres filtros de Cardano a los eventos `input.governance`. Adder compara cada filtro con las referencias de datos correspondientes del evento.

- **`--filter-drep`** compara los certificados del DRep, los certificados de delegación de voto que delegan en el DRep y los procedimientos de voto cuyo votante es el DRep.
- **`--filter-pool`** compara los procedimientos de voto emitidos por el pool como SPO y los certificados de delegación de voto que contienen el hash de la clave del pool.
- **`--filter-address`** depende de la dirección proporcionada:
  - una dirección de stake (`stake1…`) coincide con `rewardAccount` de una propuesta, las direcciones de destino de retiros de tesorería y la credencial de stake de los certificados de delegación de voto;
  - una dirección de pago (`addr1…`) coincide únicamente con las direcciones de destino de retiros de tesorería. `rewardAccount` y las credenciales de delegación de voto son credenciales de stake y Adder solo las compara con direcciones de stake.

Para seguir la actividad de gobernanza de una cuenta, use su dirección de stake.

Adder no aplica `--filter-policy` ni `--filter-asset` a los eventos de gobernanza. Un evento `input.governance` pasa sin cambios por esos filtros.

Este ejemplo emite únicamente eventos de gobernanza relacionados con el DRep de muestra:

```bash
adder --filter-type input.governance \
  --filter-drep drep1p4h4ea7y70ede2wy7x3t83x4umm63wwq68308f94cmt7szexmnr
```