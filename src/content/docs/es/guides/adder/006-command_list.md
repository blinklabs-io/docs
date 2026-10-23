---
title: Guía de referencia de comandos
description: Lista de Comandos de Adder.
---

# <ins>Lista de comandos:</ins>

<br />

## Configuración:


```text
 --config string
```

> ruta al archivo de configuración a cargar

> Si la misma configuración se proporciona por varios métodos, Adder usa este orden de precedencia: indicadores de CLI > archivo de configuración YAML > variables de entorno.

***

## Filtro:

> Para `--filter-address`, `--filter-asset`, `--filter-policy`, `--filter-pool`, `--filter-drep` y `--filter-type`, Adder recorta los espacios en blanco que rodean cada entrada separada por comas e ignora las entradas vacías.

```text
  --filter-address string
```

> especifica la dirección para filtrar
<br />


```text
  --filter-asset string
```

> especifica la huella digital del activo (asset1xxx) para filtrar
<br />


```text
  --filter-drep string
```

> especifica el(los) ID(s) de DRep para filtrar (separados por coma, hex o bech32)
<br />


```text
  --filter-policy string
```

> especifica el ID de política del activo para filtrar
<br />

```text
  --filter-pool string
```

> especifica el ID del Pool para filtrar
<br />

```text
  --filter-type string
```

> especifica el tipo de evento para filtrar
>
> **Tipos de Evento:**
> 1. `input.block` - Se observó un nuevo bloque.
> 2. `input.rollback` -	Ocurrió un rollback a un punto anterior de la cadena.
> 3. `input.transaction` -	Se vio una transacción en un bloque.
> 4. `input.governance` -	Un evento relacionado con gobernanza (era CIP-1694).
> 5. `input.drep-registration` - Adder registra un DRep.
>


***

## Entrada:

```text
  --input string
```

> plugin de entrada a usar, 'list' para mostrar disponibles (predeterminado "chainsync")
>
> **Tipos de Entrada:**
> 1. `chainsync` - sincroniza bloques desde un nodo Cardano usando NtC (nodo-a-cliente) o NtN (nodo-a-nodo)
> 2. `mempool` - lee transacciones no confirmadas desde el mempool de un nodo Cardano vía LocalTxMonitor (NtC)
<br />

### input-chainsync:

```text
  --input-chainsync-address string
```

> especifica la dirección TCP del nodo al que conectarse en el formato 'host:puerto'
<br />

 ```text
  --input-chainsync-auto-reconnect
```

> reconectar automáticamente si la conexión se interrumpe (predeterminado true)
<br />

```text
  --input-chainsync-delay-confirmations uint
```

> número de confirmaciones requeridas antes de emitir eventos
<br />

```text
  --input-chainsync-include-cbor
```

> incluir CBOR original para bloque/transacción en eventos
<br />

```text
  --input-chainsync-intersect-point string
```

> comenzar la sincronización en los puntos de cadena especificados, separados por comas, en formato '<slot>.<hash>'
>
<br />

```text
  --input-chainsync-intersect-tip
```

> comenzar la sincronización en la punta de la cadena (predeterminado: génesis de la cadena) (predeterminado true)
<br />

```text
  --input-chainsync-network string
```

> especifica un nombre de red Cardano conocido (predeterminado "mainnet")
<br />

```text
  --input-chainsync-network-magic uint
```

> especifica el valor magic de red a usar, anula 'network'
<br />

```text
  --input-chainsync-ntc-tcp
```

> usar el protocolo NtC (nodo-a-cliente) sobre TCP, para usar cuando se expone el socket UNIX de un nodo via socat o similar
<br />

```text
  --input-chainsync-socket-path string
```

> especifica la ruta al socket UNIX al que conectarse

***

```text
  --input-chainsync-kupo-url string
```

> URL de la API de Kupo
<br />


### input-mempool:

```text
  --input-mempool-address string
```

> dirección TCP (host:puerto); requiere ntc-tcp=true
<br />

```text
  --input-mempool-include-cbor
```

> incluir CBOR de la transacción en eventos
<br />

```text
  --input-mempool-kupo-url string
```

> URL de la API de Kupo para resolver entradas de transacciones (ej. http://localhost:1442). Kupo debe indexar las salidas que necesitas (ej. ejecutar con --match "*") o la resolución estará vacía.
<br />

```text
  --input-mempool-network string
```

> nombre de red Cardano conocido (ej. mainnet, preprod) (predeterminado "mainnet")
<br />

```text
  --input-mempool-network-magic uint
```

> valor magic de red (anula el nombre de red)
<br />

```text
  --input-mempool-ntc-tcp
```

> usar NtC sobre TCP (ej. cuando se expone el socket vía socat)
<br />

```text
  --input-mempool-poll-interval string
```

> con qué frecuencia consultar el mempool (ej. 5s, 1m) (predeterminado "5s")
<br />

```text
  --input-mempool-socket-path string
```

> ruta al socket UNIX del nodo (NtC)

***

## Logging:

```text
  --logging-level string
```

> nivel de logging (debug, info, warn, error) (predeterminado "info")
<br />

***

## Salida:

```text
  --output string
```

> plugin de salida que se va a usar; `list` muestra los disponibles (predeterminado "log"). `notify-json` escribe notificaciones en formato NDJSON.

<br />

```text
  --output-log-format string
```

> especifica el formato de salida: text (legible por humanos, predeterminado) o json (parseable por máquina) (predeterminado "text")
<br />

```text
  --output-notify-title string
```

> especifica el título a usar (predeterminado "Adder")
<br />

```text
  --output-notify-json-config string
```

> especifica la ruta a la configuración JSON versionada de notificaciones que usa `notify-json`.
> `--output notify-json` requiere esta ruta.
<br />

```text
  --output-push-accessTokenUrl string
```

> especifica la url para obtener token de acceso (predeterminado `https://www.googleapis.com/auth/firebase.messaging`)
<br />

```text
  --output-push-serviceAccountFilePath string
```

> especifica la ruta al archivo de cuenta de servicio
> Cuando se selecciona `--output push`, `--output-push-serviceAccountFilePath` debe especificar una ruta no vacía. El JSON de cuenta de servicio indicado debe incluir `project_id` como una cadena no vacía. La configuración falla cuando falta `project_id`, no es una cadena o está vacío.
<br />

```text
  --output-telegram-bot-token string
```

> token de la API de Telegram Bot (de @BotFather)
<br />

```text
  --output-telegram-chat-id string
```

> ID de chat de Telegram al que enviar mensajes (usuario, grupo o canal)
<br />

```text
  --output-telegram-disable-preview
```

> deshabilitar la vista previa de enlaces en mensajes
<br />

```text
  --output-telegram-parse-mode string
```

> modo de parseo de mensajes (HTML, Markdown, MarkdownV2) (predeterminado "HTML")
<br />

```text
  --output-webhook-format string
```

> especifica el formato de carga del webhook a usar (predeterminado "adder")
<br />

```text
  --output-webhook-password string
```

> especifica la contraseña para autenticación básica
<br />

```text
  --output-webhook-tls-skip-verify
```

> omitir verificación TLS (para certificados autofirmados)
<br />

```text
  --output-webhook-url string
```

> especifica la url a usar (predeterminado `http://localhost:3000`)
<br />

```text
  --output-webhook-username string
```

> especifica el nombre de usuario para autenticación básica

***

## Notificaciones:

```text
  adder notifications validate --config <path> [--json]
```

> valida una configuración JSON de notificaciones.
>
> La opción `--config` es obligatoria y requiere la ruta del archivo.
>
> La opción `--json` emite un resultado de validación legible por máquinas.
>
> La salida normal informa si la configuración es válida y muestra los errores.
>

***

### Configuración JSON de notificaciones:

`notify-json` acepta una configuración JSON con los siguientes campos:

- `schemaVersion`: versión del esquema; debe ser `1`.
- `network.name`: nombre de red; admite `mainnet`, `preprod` o `preview`.
- La configuración puede incluir `network.customAddress` y `network.customPort` como par para un nodo personalizado. Si incluye `customAddress`, debe establecer `customPort` entre `1` y `65535`; no puede establecer `customPort` sin `customAddress`.
- `monitor.everything`: indica si se supervisan todos los objetivos.
- `monitor.wallets`, `monitor.dreps`, `monitor.pools`, `monitor.assets` y `monitor.policies`: listas opcionales de objetivos de wallets, DReps, pools, assets y políticas.
- `monitor.drepMatch`, `monitor.poolMatch`, `monitor.assetMatch` y `monitor.policyMatch`: modos de coincidencia opcionales; cada valor debe ser `any` o `all`.
- `alerts`: mapa de categorías habilitadas. Admite `incomingTransactions`, `outgoingTransactions`, `tokenTransfers`, `blocksMinted`, `chainRollbacks`, `poolParameterChanges`, `governanceProposals`, `votesCast`, `registrationChanges`, `assetActivity`, `policyActivity` y `connectionIssues`.
- `rateLimit.max`: máximo de notificaciones; debe ser `-1` para deshabilitar el límite o un valor igual o mayor que cero.
- `rateLimit.windowSeconds`: duración de la ventana del límite en segundos; debe ser mayor que cero.
- `connectionStaleSeconds`: tiempo de espera de una conexión inactiva; debe estar entre `30` y `3600` segundos.

La validación rechaza campos desconocidos y archivos con más de un valor JSON. La configuración debe usar `schemaVersion` `1`, incluir al menos un objetivo o activar `monitor.everything`, y activar al menos una categoría de `alerts`. Cada objetivo debe tener un identificador válido para su tipo: una dirección de wallet, un ID de DRep, un ID de pool, una huella de asset o un ID de política.

Al iniciar, `notify-json` requiere la entrada `chainsync`. `network.name` debe coincidir con `--input-chainsync-network`. Si la configuración incluye un nodo personalizado, su dirección y puerto también deben coincidir con `--input-chainsync-address`.

### Salida `notify-json`:

`notify-json` escribe en la salida estándar un objeto JSON por línea. Cada registro usa la versión de esquema `1`.

- Los registros `status` informan los estados `starting`, `connected` y `stale`, junto con la marca de tiempo y, cuando corresponde, un mensaje.
- Los registros `notification` incluyen la notificación renderizada mediante `title` y `body`, además de `ruleId`, `eventType` cuando existe, `batched` y `count` para describir la agrupación.

***

## Version:

```text
  --version
```

> mostrar versión y salir


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
