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

Consulta la [referencia de filtros y gobernanza](../009-filter-governance-reference) para ver ejemplos y el esquema detallado.

Los indicadores de filtro aceptan varios valores separados por comas. Adder recorta los espacios de cada valor e ignora los elementos vacíos. Dentro de un mismo indicador, los valores funcionan como alternativas: el evento debe coincidir con al menos uno. Adder combina los filtros de tipos distintos con `AND`, por lo que el evento debe cumplir todos los filtros configurados. La excepción combina `--filter-pool` y `--filter-drep` con `OR`: basta que el evento coincida con el pool o con el DRep. Adder aplica los demás filtros configurados con `AND` a esa combinación.

Usa la forma larga con dos guiones, como `--filter-type`. Adder interpreta la forma con un solo guion, como `-filter-type`, como un grupo de indicadores abreviados y la rechaza.

### Aplicabilidad de los filtros

| Indicador | Filtra por | Tipos de evento aplicables |
| --- | --- | --- |
| `--filter-type` | Tipo de evento de nivel superior | Todos |
| `--filter-address` | Dirección de pago o de stake | `input.transaction`, `input.governance` |
| `--filter-policy` | ID de política del activo | `input.transaction` |
| `--filter-asset` | Huella digital del activo (`asset1…`) | `input.transaction` |
| `--filter-pool` | ID del pool de stake (SPO) | `input.block`, `input.transaction`, `input.governance` |
| `--filter-drep` | ID de DRep, en hexadecimal o bech32 | `input.transaction`, `input.governance` |

Un filtro no afecta los tipos de evento a los que no se aplica. Por ejemplo, `--filter-policy` no elimina eventos `input.block`, y `--filter-asset` no elimina eventos `input.governance`.

### Indicadores, variables de entorno y claves YAML

Los indicadores omiten el nombre del plugin, pero las variables de entorno y las claves YAML conservan el tipo y el nombre del plugin. Usa los nombres exactos de la tabla; `FILTER_ADDRESS` y `plugins.filter.address`, entre otros nombres abreviados, no configuran estos plugins.

| Indicador | Variable de entorno | Clave YAML |
| --- | --- | --- |
| `--filter-address` | `FILTER_CARDANO_ADDRESS` | `plugins.filter.cardano.address` |
| `--filter-asset` | `FILTER_CARDANO_ASSET` | `plugins.filter.cardano.asset` |
| `--filter-policy` | `FILTER_CARDANO_POLICY` | `plugins.filter.cardano.policy` |
| `--filter-pool` | `FILTER_CARDANO_POOL` | `plugins.filter.cardano.pool` |
| `--filter-drep` | `FILTER_CARDANO_DREP` | `plugins.filter.cardano.drep` |
| `--filter-type` | `FILTER_EVENT_TYPE` | `plugins.filter.event.type` |

`--filter-type` usa el plugin de filtro `event`, mientras que los demás indicadores de esta tabla usan el plugin `cardano`.

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

> especifica la ruta a una configuración JSON de notificaciones versionada. La opción de salida `notify-json` utiliza esta configuración.
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
> Cada solicitud HTTP a FCM finaliza como máximo en 10 segundos. Los fallos de credenciales o token, y los fallos al crear o enviar un mensaje, llegan al canal de errores del pipeline de Adder y la CLI los registra; Adder no los muestra como entregas exitosas silenciosas.
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
