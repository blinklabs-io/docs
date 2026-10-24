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

> Si la misma configuración se proporciona por varios métodos, Adder usa este orden de precedencia: opciones de línea de comandos > variables de entorno > archivo de configuración YAML > valores predeterminados.

***

## Filtro:

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
> Para `--filter-address`, `--filter-asset`, `--filter-policy`, `--filter-pool`, `--filter-drep` y `--filter-type`, Adder elimina los espacios al principio y al final de cada entrada separada por comas e ignora las entradas vacías.
>
> **Tipos de Evento:**
> 1. `input.block` - Se observó un nuevo bloque.
> 2. `input.rollback` -	Ocurrió un rollback a un punto anterior de la cadena.
> 3. `input.transaction` -	Se vio una transacción en un bloque.
> 4. `input.governance` -	Un evento relacionado con gobernanza (era CIP-1694).
> 5. `input.drep-registration` - Se registró un DRep.
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
> Adder elimina los espacios al principio y al final de cada entrada separada por comas e ignora las entradas vacías.
>
> Si el valor solo contiene espacios o entradas vacías después de quitar los espacios, Adder sigue el comportamiento configurado por `--input-chainsync-intersect-tip`.
>
> Las entradas `<slot>.<hash>` no vacías y mal formadas provocan errores.
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

## Salida:

```text
  --output string
```

> plugin de salida que se usará; `notify-json` emite notificaciones NDJSON y `list` muestra los disponibles (predeterminado: "log")
<br />

```text
  --output-log-level string
```

> establece el umbral de registro de `output.log`. Acepta `debug`, `info`, `warn` y `error` (predeterminado: "info"). `debug` e `info` emiten registros de eventos; `warn` y `error` los suprimen. El umbral también filtra los diagnósticos de la aplicación Adder en stderr, incluso si se selecciona otro plugin de salida.
>
> Puedes configurar el mismo ajuste mediante YAML `plugins.output.log.level` o la variable de entorno `OUTPUT_LOG_LEVEL`. Adder ha eliminado la opción antigua `--logging-level` y el ajuste YAML de nivel superior `logging.level`, y los rechaza si se proporcionan. También ha eliminado la variable de entorno `LOGGING_LEVEL` y la ignora.
<br />

```text
  --output-log-format string
```

> especifica el formato de salida: text (legible por humanos, predeterminado) o json (parseable por máquina) (predeterminado "text")
<br />

```text
  --output-notify-json-config string
```

> ruta a la configuración JSON de notificaciones versionada que utiliza `notify-json`
>
> es obligatoria cuando se selecciona `--output notify-json`
<br />

```text
  --output-notify-title string
```

> especifica el título a usar (predeterminado "Adder")
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
> La opción `--config <path>` es obligatoria. La salida normal indica si la configuración es válida y muestra los errores.
>
> La opción `--json` emite un resultado de validación legible por máquinas.
>

### Configuración JSON de notificaciones

La configuración utiliza JSON con `schemaVersion` establecido en `1`. Adder rechaza los campos desconocidos y los archivos de configuración que contienen varios valores JSON.

| Campo | Descripción |
| --- | --- |
| `schemaVersion` | Valor obligatorio: `1`. |
| `network.name` | Red Cardano admitida obligatoria: `mainnet`, `preprod` o `preview`. |
| `network.customAddress` y `network.customPort` | Dirección y puerto de nodo personalizados opcionales. Configura ambos campos juntos; `customPort` debe estar entre `1` y `65535`. |
| `monitor.everything` | Establécelo en `true` para monitorizar todos los objetivos admitidos. Configura este campo o al menos un objetivo en `wallets`, `dreps`, `pools`, `assets` o `policies`. |
| `monitor.wallets` | Direcciones de wallets que se monitorizarán. |
| `monitor.dreps` | IDs de DRep que se monitorizarán. `monitor.drepMatch` acepta `any` o `all`. |
| `monitor.pools` | IDs de pool que se monitorizarán. `monitor.poolMatch` acepta `any` o `all`. |
| `monitor.assets` | Huellas de activos que se monitorizarán. `monitor.assetMatch` acepta `any` o `all`. |
| `monitor.policies` | IDs de política que se monitorizarán. `monitor.policyMatch` acepta `any` o `all`. |
| `alerts` | Categorías de alertas que se activarán: `incomingTransactions`, `outgoingTransactions`, `tokenTransfers`, `blocksMinted`, `chainRollbacks`, `poolParameterChanges`, `governanceProposals`, `votesCast`, `registrationChanges`, `assetActivity`, `policyActivity` y `connectionIssues`. Activa al menos una categoría. |
| `rateLimit.max` | Valor obligatorio: `-1` para desactivar el límite de frecuencia, o `0` o un valor superior. |
| `rateLimit.windowSeconds` | Duración positiva obligatoria en segundos. |
| `connectionStaleSeconds` | Intervalo obligatorio para considerar obsoleta la conexión, entre `30` y `3600` segundos. |

Las listas de objetivos deben contener direcciones de wallets, IDs de DRep, IDs de pool, huellas de activos o IDs de política válidos y sin duplicados. La red de notificaciones debe coincidir con `--input-chainsync-network`. Si se configura un nodo personalizado, su dirección y puerto deben coincidir con `--input-chainsync-address`. La salida `notify-json` requiere la entrada `chainsync`.

### Salida `notify-json`

La salida `notify-json` escribe un objeto JSON por línea en stdout. Cada registro utiliza la versión de esquema `1`. Los registros de estado indican `starting`, `connected` o `stale` e incluyen una marca de tiempo y un mensaje opcional. Los registros de notificación incluyen `ruleId`, un `eventType` opcional, `title` y `body` con el texto generado, y los campos de agrupación `batched` y `count`.

***

## Versión:

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
