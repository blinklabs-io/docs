---
title: Referencia de notificaciones JSON
description: Configuración, validación y salida NDJSON de notificaciones sin interfaz gráfica para Adder.
---

# Referencia de notificaciones JSON

## Descripción general

Esta guía describe la salida `notify-json` de Adder, el comando para validar su configuración y el formato JSON versionado que controla las notificaciones orientadas a objetivos. La salida no requiere una interfaz gráfica y escribe un registro JSON por línea en `stdout`.

La referencia general de indicadores está disponible en la [guía de referencia de comandos](./006-command_list).

## Comandos de notificación y validación

### Ejecutar la salida `notify-json`

Configure `notify-json` con una entrada `chainsync` y proporcione una ruta no vacía a una configuración JSON válida:

```console
adder \
  --input chainsync \
  --input-chainsync-network mainnet \
  --output notify-json \
  --output-notify-json-config ./notifications.json
```

`--output-notify-json-config` identifica el archivo de configuración JSON versionado. Adder rechaza una ruta vacía, un archivo que no puede leer o una configuración que no supera la validación. `notify-json` requiere `--input chainsync`; no funciona con `mempool` ni con otra entrada.

La salida aplica las mismas reglas de notificación orientadas a objetivos y la misma limitación de tasa que las notificaciones de Adder, pero entrega solicitudes en formato JSON para que otro proceso las consuma.

### Validar una configuración

Ejecute el subcomando `notifications validate` para validar el archivo antes de iniciar el flujo:

```console
adder notifications validate --config ./notifications.json
```

`--config` es obligatorio y debe contener la ruta al archivo JSON de notificaciones. Sin `--json`, una configuración válida imprime el siguiente mensaje:

```text
notification configuration is valid
```

Para una configuración inválida, Adder imprime cada problema en una línea con el formato `campo: mensaje` y termina con un error:

```text
network.name: must be mainnet, preprod, or preview
notification configuration is invalid
```

El mensaje final indica que la configuración no es válida y el comando devuelve un estado de fallo. Los mensajes de validación identifican la propiedad que requiere corrección.

Use `--json` para integrar la validación con herramientas automatizadas:

```console
adder notifications validate --config ./notifications.json --json
```

Una respuesta válida contiene `schemaVersion` y `valid`:

```json
{"schemaVersion":1,"valid":true}
```

Una respuesta inválida incluye `valid: false` y, cuando existen problemas, un arreglo `errors`. Cada objeto de `errors` contiene `field` y `message`:

```json
{
  "schemaVersion": 1,
  "valid": false,
  "errors": [
    {
      "field": "monitor.wallets[0]",
      "message": "invalid address"
    }
  ]
}
```

El comando devuelve un estado de fallo aunque emita el resultado JSON de validación. Un error de lectura o de análisis se representa como un problema cuyo campo es `config`.

## Esquema JSON versionado

La configuración usa JSON estricto con `schemaVersion: 1`. Los nombres de propiedades y los valores enumerados que aparecen en los bloques de código distinguen mayúsculas y minúsculas y deben conservarse exactamente.

### Propiedades de nivel superior

| Propiedad | Tipo | Descripción |
| --- | --- | --- |
| `schemaVersion` | entero | Debe ser `1`. |
| `network` | objeto | Define la red Cardano y, opcionalmente, un nodo personalizado. |
| `monitor` | objeto | Define los objetivos que activan las reglas de notificación. |
| `alerts` | objeto | Asocia cada categoría de alerta conocida con `true` o `false`. |
| `rateLimit` | objeto | Define el número máximo de notificaciones y la ventana de tiempo. |
| `connectionStaleSeconds` | entero | Define cuántos segundos sin eventos hacen que la conexión pase a `stale`. Debe estar entre `30` y `3600`, inclusive. |

La configuración debe contener al menos un objetivo en `monitor`, salvo que `monitor.everything` sea `true`. También debe habilitar al menos una categoría de alerta conocida.

### Red

`network` contiene las siguientes propiedades:

| Propiedad | Tipo | Descripción |
| --- | --- | --- |
| `name` | cadena | Nombre de red. Los valores admitidos son `mainnet`, `preprod` y `preview`. |
| `customAddress` | cadena | Dirección de host opcional para un nodo personalizado. Debe aparecer junto con `customPort`. |
| `customPort` | entero sin signo | Puerto opcional del nodo personalizado. Cuando se configura, debe estar entre `1` y `65535`. |

Si se especifica `customPort`, `customAddress` también debe estar presente. Si se especifica `customAddress`, `customPort` debe ser válido.

### Objetivos de monitorización

`monitor` contiene los grupos de objetivos y el modo de combinación de cada grupo:

| Propiedad | Tipo | Descripción |
| --- | --- | --- |
| `everything` | booleano | Cuando vale `true`, monitoriza todos los eventos y no requiere objetivos en las listas. |
| `wallets` | arreglo de cadenas | Direcciones de pago o de stake. Cada valor debe comenzar por `addr` o `stake`. |
| `dreps` | arreglo de cadenas | Identificadores de DRep. Cada valor debe comenzar por `drep1` o ser bytes hexadecimales. |
| `pools` | arreglo de cadenas | Identificadores de stake pool. Cada valor debe comenzar por `pool1` o ser bytes hexadecimales. |
| `assets` | arreglo de cadenas | Huellas digitales de activos CIP-14. Cada valor debe comenzar por `asset1`. |
| `policies` | arreglo de cadenas | Identificadores de política de acuñación en hexadecimal de 56 caracteres. |
| `drepMatch` | cadena | Conecta el grupo `dreps` con el grupo anterior usando `any` o `all`. |
| `poolMatch` | cadena | Conecta el grupo `pools` con el grupo anterior usando `any` o `all`. |
| `assetMatch` | cadena | Conecta el grupo `assets` con el grupo anterior usando `any` o `all`. |
| `policyMatch` | cadena | Conecta el grupo `policies` con el grupo anterior usando `any` o `all`. |

Los grupos de objetivos aceptan valores únicos dentro de cada lista. Adder rechaza duplicados sin distinguir mayúsculas y minúsculas. `wallets` no tiene una propiedad `walletMatch`; el grupo de wallets se combina con los conectores de los grupos siguientes.

`any` y `all` son los únicos modos válidos cuando se proporciona una propiedad de coincidencia. `any` conecta grupos con una condición OR y `all` los conecta con una condición AND. Las propiedades de coincidencia también pueden omitirse cuando no se necesita un conector explícito.

### Categorías de alerta

`alerts` admite únicamente las siguientes claves. Cada clave debe tener un valor booleano:

| Clave | Controla |
| --- | --- |
| `incomingTransactions` | Transacciones entrantes. |
| `outgoingTransactions` | Transacciones salientes. |
| `tokenTransfers` | Transferencias de tokens. |
| `blocksMinted` | Bloques acuñados. |
| `chainRollbacks` | Retrocesos de la cadena. |
| `poolParameterChanges` | Cambios en los parámetros de un pool. |
| `governanceProposals` | Propuestas de gobernanza. |
| `votesCast` | Votos emitidos. |
| `registrationChanges` | Cambios de registro. |
| `assetActivity` | Actividad de los activos monitorizados. |
| `policyActivity` | Actividad de las políticas monitorizadas. |
| `connectionIssues` | Problemas de conexión. |

`alerts.chainRollbacks` controla los avisos de retroceso de la cadena de forma independiente de `alerts.blocksMinted`. Desactivar `blocksMinted` no desactiva `chainRollbacks`, y desactivar `chainRollbacks` no desactiva `blocksMinted`.

### Limitación de tasa

`rateLimit` contiene estas propiedades:

| Propiedad | Tipo | Descripción |
| --- | --- | --- |
| `max` | entero | Número máximo de notificaciones durante la ventana. `-1` desactiva la limitación; `0` o cualquier valor mayor define un límite. |
| `windowSeconds` | entero | Duración de la ventana en segundos. Debe ser mayor que `0`. |

### Ejemplo válido

El siguiente ejemplo incluye todos los campos del esquema, todos los grupos de objetivos, todos los modos de coincidencia y todas las categorías de alerta:

```json
{
  "schemaVersion": 1,
  "network": {
    "name": "preprod",
    "customAddress": "node.example.org",
    "customPort": 3001
  },
  "monitor": {
    "everything": false,
    "wallets": [
      "addr_test1vxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    ],
    "dreps": [
      "drep1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    ],
    "pools": [
      "pool1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    ],
    "assets": [
      "asset1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    ],
    "policies": [
      "0123456789abcdef0123456789abcdef0123456789abcdef01234567"
    ],
    "drepMatch": "any",
    "poolMatch": "all",
    "assetMatch": "any",
    "policyMatch": "all"
  },
  "alerts": {
    "incomingTransactions": true,
    "outgoingTransactions": true,
    "tokenTransfers": true,
    "blocksMinted": true,
    "chainRollbacks": true,
    "poolParameterChanges": true,
    "governanceProposals": true,
    "votesCast": true,
    "registrationChanges": true,
    "assetActivity": true,
    "policyActivity": true,
    "connectionIssues": true
  },
  "rateLimit": {
    "max": 10,
    "windowSeconds": 60
  },
  "connectionStaleSeconds": 90
}
```

### Decodificación y normalización

Adder rechaza propiedades desconocidas mediante una decodificación JSON estricta. El archivo debe contener exactamente un valor JSON; un segundo valor, aunque también sea válido, hace que el análisis falle. El JSON mal formado y los valores con tipos incorrectos también hacen que la configuración sea inválida.

Antes de validar, Adder elimina los espacios iniciales y finales de:

- `network.name`.
- `network.customAddress`.
- Cada elemento de `wallets`, `dreps`, `pools`, `assets` y `policies`.
- `drepMatch`, `poolMatch`, `assetMatch` y `policyMatch`.

La validación usa esos valores normalizados. Las claves de `alerts` siguen siendo claves de máquina exactas; no deben traducirse ni modificarse.

## Contrato de salida NDJSON

La salida `notify-json` escribe un objeto JSON completo por línea en `stdout`. Cada objeto contiene `schemaVersion: 1` y `kind`. Los registros de estado usan `kind: "status"`; las notificaciones usan `kind: "notification"`. Los consumidores deben leer cada línea de forma independiente y no esperar un arreglo JSON envolvente.

### Registros de estado

Los registros de estado contienen:

| Campo | Presencia | Descripción |
| --- | --- | --- |
| `schemaVersion` | Obligatorio | Versión del contrato. Su valor es `1`. |
| `kind` | Obligatorio | Su valor es `status`. |
| `status` | Obligatorio | Estado `starting`, `connected` o `stale`. |
| `timestamp` | Obligatorio | Marca de tiempo UTC en formato JSON de fecha y hora. |
| `message` | Opcional | Mensaje descriptivo del estado. |

Al iniciar correctamente la salida, Adder emite:

```json
{"schemaVersion":1,"kind":"status","status":"starting","timestamp":"2026-01-01T12:00:00Z","message":"waiting for the first chain event"}
```

El estado `starting` indica que Adder espera el primer evento de la cadena. Si transcurre `connectionStaleSeconds` sin recibir un evento, Adder emite `stale` con el mensaje `no chain events received before startup timeout`.

Cuando llega el primer evento, Adder emite `connected` antes de procesar ese evento. El mensaje usa el nombre de red configurado, por ejemplo:

```json
{"schemaVersion":1,"kind":"status","status":"connected","timestamp":"2026-01-01T12:00:05Z","message":"receiving chain events from preprod"}
```

Después de establecer la conexión, si no llegan eventos durante el intervalo configurado, Adder emite `stale` con el mensaje `no chain events received recently`. Cada evento reinicia el temporizador. Un evento posterior a `stale` vuelve a producir `connected` y reinicia el temporizador.

### Registros de notificación

Los registros de notificación contienen:

| Campo | Presencia | Descripción |
| --- | --- | --- |
| `schemaVersion` | Obligatorio | Versión del contrato. Su valor es `1`. |
| `kind` | Obligatorio | Su valor es `notification`. |
| `timestamp` | Obligatorio | Marca de tiempo UTC de la notificación. |
| `ruleId` | Obligatorio | Identificador de la regla que generó la notificación. |
| `eventType` | Opcional | Tipo de evento que originó la notificación. |
| `title` | Obligatorio | Título renderizado. Adder usa `Adder` si la regla no proporciona título. |
| `body` | Obligatorio | Cuerpo renderizado de la notificación. |
| `batched` | Obligatorio | Indica si la notificación agrupa eventos. |
| `count` | Obligatorio | Número de eventos incluidos en la notificación. |

Ejemplo de un registro:

```json
{"schemaVersion":1,"kind":"notification","timestamp":"2026-01-01T12:00:05Z","ruleId":"incoming-tx","eventType":"input.transaction","title":"Adder","body":"Incoming transaction detected","batched":false,"count":1}
```

Adder normaliza los eventos nativos antes de aplicar las reglas para que la coincidencia de objetivos use la misma forma de datos que los eventos ya normalizados. Los errores de ejecución se comunican como errores del proceso y no forman parte de los registros NDJSON de `stdout`.

## Comprobaciones antes del inicio

Adder ejecuta las comprobaciones de `notify-json` antes de iniciar el flujo de procesamiento:

1. Configure `--input chainsync`. La salida falla si se selecciona otra entrada.
2. Proporcione una ruta no vacía mediante `--output-notify-json-config`.
3. Use una configuración que pueda leerse, analizarse y validarse con el esquema `schemaVersion` `1`.
4. Haga coincidir `network.name` con `--input-chainsync-network`.
5. Si la configuración define `network.customAddress` y `network.customPort`, haga coincidir su valor normalizado `host:port` con `--input-chainsync-address`.

La comparación de direcciones separa el host y el puerto, normaliza los nombres de host a minúsculas, normaliza las direcciones IP y compara el puerto numérico. Por tanto, las diferencias de mayúsculas en un nombre de host o las diferencias de representación de un puerto no impiden la coincidencia cuando ambos valores representan el mismo `host:port`.

Si la red configurada no coincide, si el nodo personalizado no coincide o si falla cualquiera de las comprobaciones anteriores, Adder devuelve un error y no inicia la canalización. La configuración de un nodo personalizado activa la comprobación de dirección; sin `customAddress`, Adder no compara una dirección personalizada.

La salida `notify-json` solo acepta eventos de `chainsync` y conserva el estado `stale` cuando no recibe eventos antes del primer evento o entre eventos posteriores. Esta combinación permite que un supervisor distinga la espera inicial, la conexión activa y la falta de eventos sin interpretar mensajes de registro no estructurados.
