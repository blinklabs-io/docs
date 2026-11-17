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

> Si la misma configuración se proporciona por varios métodos, Adder usa este orden de precedencia: opciones de línea de comandos > archivo de configuración YAML > variables de entorno > valores predeterminados.

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

> especifica un nombre de red Cardano conocido, como `mainnet`, `preprod`, `preview` o `dijkstra` (predeterminado "mainnet")
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

```
  --input-chainsync-state-path string
```

> ruta a un archivo de base de datos SQLite para conservar el cursor de ChainSync entre reinicios; si no se establece, no se conserva ningún cursor (predeterminado "")

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

Las opciones de cada plugin de salida también se pueden establecer en YAML bajo `plugins.output.<plugin>.<option>`.

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
> El YAML `plugins.output.log.level` y la variable de entorno `OUTPUT_LOG_LEVEL` configuran el mismo ajuste. Adder migra el ajuste YAML heredado de nivel superior `logging.level` a `plugins.output.log.level` cuando no existe un nivel de `output.log`. La opción de línea de comandos antigua `--logging-level` ya no existe y provoca un error si se proporciona. Adder eliminó la variable de entorno `LOGGING_LEVEL` y la ignora.
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
  --output-telegram-settings-file string
```

> archivo YAML local con las preferencias de notificaciones de Telegram (predeterminado "")
<br />

```text
  --output-telegram-operator-user-ids string
```

> IDs de usuario de Telegram separados por comas que pueden cambiar las preferencias del grupo (predeterminado ""); cada ID debe ser un entero positivo
<br />

```text
  --output-signal-endpoint string
```

> URL HTTP JSON-RPC del daemon `signal-cli` (predeterminado `http://127.0.0.1:8081/api/v1/rpc`)
<br />

```text
  --output-signal-account string
```

> cuenta de `signal-cli` para un daemon con varias cuentas (predeterminado "")
<br />

```text
  --output-signal-recipients string
```

> números o IDs de destinatarios de Signal separados por comas (predeterminado ""); debe incluir al menos un destinatario
<br />

```text
  --output-signal-event-types string
```

> tipos de eventos seleccionados separados por comas (predeterminado "blocks,rollbacks,governance"); debe incluir al menos un tipo admitido
<br />
> Consulta la [referencia de la salida Signal](./signal.md).

```text
  --output-nats-servers string
```

> URL de servidores NATS separadas por comas (predeterminado `nats://127.0.0.1:4222`); cada URL debe usar `nats://` o `tls://`, no incluir credenciales ni ruta, y usar un puerto entre `1` y `65535` cuando se especifique
<br />

```text
  --output-nats-token string
```

> token opcional de autenticación de NATS (predeterminado "")
<br />

```text
  --output-nats-subject-prefix string
```

> prefijo de los subjects de eventos (predeterminado `adder.events`)
<br />

```text
  --output-nats-event-types string
```

> tipos de eventos separados por comas (predeterminado "blocks,rollbacks,governance")
<br />
> Consulta la [referencia de la salida NATS](./nats.md).

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

```text
  --output-webhook-state-path string
```

> ruta SQLite para las entregas pendientes persistentes y seguras frente a reinicios (predeterminado "")
<br />

```text
  --output-webhook-max-pending int
```

> máximo de entregas pendientes persistentes (predeterminado `1024`); cuando `state-path` no está vacío, debe ser al menos `11`
> Consulta la [durabilidad de webhooks](./webhook-durability.md).

### Salida `slack`

```text
  --output-slack-webhook-urls string
```

> URL de webhooks entrantes de Slack separadas por comas; debe incluir al menos una URL HTTPS
<br />

```text
  --output-slack-event-types string
```

> tipos de eventos para la entrega a Slack separados por comas (predeterminado "blocks,transactions,rollbacks,governance")

### Salida `discord`

```text
  --output-discord-bot-token string
```

> token del bot de Discord (predeterminado "")
<br />

```text
  --output-discord-application-id string
```

> ID de la aplicación de Discord (predeterminado "")
<br />

```text
  --output-discord-guild-id string
```

> ID del servidor de Discord permitido (predeterminado "")
<br />

```text
  --output-discord-channel-id string
```

> ID del canal de Discord permitido (predeterminado "")
<br />

```text
  --output-discord-event-types string
```

> tipos de eventos separados por comas (predeterminado "blocks,rollbacks,governance")

### Salida `matrix`

```text
  --output-matrix-homeserver-url string
```

> URL base del homeserver de Matrix (predeterminado "")
<br />

```text
  --output-matrix-access-token string
```

> token de acceso de Matrix; es obligatorio
<br />

```text
  --output-matrix-room-ids string
```

> IDs de salas de Matrix separados por comas; debe incluir al menos una sala
<br />

```text
  --output-matrix-event-types string
```

> tipos de eventos separados por comas (predeterminado "blocks,rollbacks,governance")

### Salida `rabbitmq`

```text
  --output-rabbitmq-url string
```

> URL del broker AMQP (predeterminado `amqp://127.0.0.1:5672/`)
<br />

```text
  --output-rabbitmq-exchange string
```

> exchange existente; un valor vacío usa el exchange predeterminado (predeterminado "")
<br />

```text
  --output-rabbitmq-routing-key string
```

> clave de enrutamiento o nombre de cola para el exchange predeterminado (predeterminado `adder.events`); es obligatorio
<br />

```text
  --output-rabbitmq-persistent
```

> publicar mensajes persistentes (predeterminado `true`)
<br />

```text
  --output-rabbitmq-event-types string
```

> tipos de eventos seleccionados separados por comas (predeterminado "blocks,rollbacks,governance")

### Salida `mqtt`

```text
  --output-mqtt-broker string
```

> URL TCP o TLS del broker MQTT 5 (predeterminado `mqtt://127.0.0.1:1883`)
<br />

```text
  --output-mqtt-client-id string
```

> identificador del cliente MQTT (predeterminado `adder-output`); es obligatorio
<br />

```text
  --output-mqtt-username string
```

> nombre de usuario MQTT opcional (predeterminado "")
<br />

```text
  --output-mqtt-password string
```

> contraseña MQTT opcional (predeterminado "")
<br />

```text
  --output-mqtt-topic-prefix string
```

> prefijo de los topics de eventos (predeterminado `adder/events`)
<br />

```text
  --output-mqtt-qos int
```

> QoS de publicación MQTT (predeterminado `1`); los valores válidos son `0`, `1` y `2`
<br />

```text
  --output-mqtt-event-types string
```

> tipos de eventos separados por comas (predeterminado "blocks,rollbacks,governance")

### Salida `pubsub`

```text
  --output-pubsub-project-id string
```

> ID del proyecto de Google Cloud (predeterminado "")
<br />

```text
  --output-pubsub-topic-id string
```

> ID del topic de Pub/Sub (predeterminado "")
<br />

```text
  --output-pubsub-event-types string
```

> tipos de eventos separados por comas (predeterminado "blocks,rollbacks,governance")

### Salida `postgres`

```text
  --output-postgres-database-url string
```

> URL de conexión de PostgreSQL (predeterminado "")
<br />

```text
  --output-postgres-event-types string
```

> tipos de eventos seleccionados separados por comas (predeterminado "blocks,transactions,rollbacks,governance,drep-registration,drep-update,drep-retirement")

### Salida `clickhouse`

```text
  --output-clickhouse-url string
```

> origen HTTP de ClickHouse (predeterminado `http://127.0.0.1:8123`)
<br />

```text
  --output-clickhouse-database string
```

> base de datos de ClickHouse (predeterminado `default`)
<br />

```text
  --output-clickhouse-username string
```

> usuario de ClickHouse (predeterminado `default`)
<br />

```text
  --output-clickhouse-password string
```

> contraseña opcional de ClickHouse (predeterminado "")
<br />

```text
  --output-clickhouse-event-types string
```

> tipos de eventos separados por comas (predeterminado "blocks,transactions,rollbacks,governance,drep-registration,drep-update,drep-retirement")

### Salida `elasticsearch`

```text
  --output-elasticsearch-url string
```

> URL de origen de Elasticsearch (predeterminado `http://127.0.0.1:9200`)
<br />

```text
  --output-elasticsearch-index string
```

> nombre versionado del índice (predeterminado `adder-events-v1`)
<br />

```text
  --output-elasticsearch-api-key string
```

> clave API opcional de Elasticsearch (predeterminado "")
<br />

```text
  --output-elasticsearch-event-types string
```

> tipos de eventos separados por comas (predeterminado "blocks,transactions,rollbacks,governance,drep-registration,drep-update,drep-retirement")

### Salida `s3`

```text
  --output-s3-region string
```

> región de AWS (predeterminado "")
<br />

```text
  --output-s3-bucket string
```

> bucket de S3 (predeterminado "")
<br />

```text
  --output-s3-prefix string
```

> prefijo relativo de la clave del objeto (predeterminado `adder/events`)
<br />

```text
  --output-s3-event-types string
```

> tipos de eventos seleccionados separados por comas (predeterminado "blocks,transactions,rollbacks,governance,drep-registration,drep-update,drep-retirement")

### Salida `sqs`

```text
  --output-sqs-region string
```

> región de AWS (predeterminado "")
<br />

```text
  --output-sqs-group-id string
```

> ID del grupo de mensajes, obligatorio para una cola FIFO (predeterminado "")
<br />

```text
  --output-sqs-event-types string
```

> tipos de eventos separados por comas (predeterminado "blocks,rollbacks,governance")
<br />

```text
  --output-sqs-queue-url string
```

> URL de la cola SQS (predeterminado "")

### Salida `sns`

```text
  --output-sns-region string
```

> región de AWS (predeterminado "")
<br />

```text
  --output-sns-group-id string
```

> ID del grupo de mensajes, obligatorio para un topic FIFO (predeterminado "")
<br />

```text
  --output-sns-event-types string
```

> tipos de eventos separados por comas (predeterminado "blocks,rollbacks,governance")
<br />

```text
  --output-sns-topic-arn string
```

> ARN del topic SNS (predeterminado "")
<br />

```text
  --output-sns-max-message-bytes int
```

> límite configurado de tamaño de mensaje del topic SNS (predeterminado `262144`)

### Salida `redis`

```text
  --output-redis-address string
```

> host:port TCP de Redis (predeterminado `127.0.0.1:6379`)
<br />

```text
  --output-redis-username string
```

> nombre de usuario ACL opcional de Redis (predeterminado "")
<br />

```text
  --output-redis-password string
```

> contraseña opcional de Redis (predeterminado "")
<br />

```text
  --output-redis-tls
```

> usar TLS para la conexión a Redis (predeterminado `false`)
<br />

```text
  --output-redis-stream string
```

> clave del Stream de Redis (predeterminado `adder.events`); es obligatoria
<br />

```text
  --output-redis-event-types string
```

> tipos de eventos separados por comas (predeterminado "blocks,rollbacks,governance")

### Salida `kafka`

```text
  --output-kafka-brokers string
```

> direcciones host:port de bootstrap de Kafka separadas por comas (predeterminado `127.0.0.1:9092`)
<br />

```text
  --output-kafka-topic string
```

> topic de Kafka (predeterminado `adder.events`)
<br />

```text
  --output-kafka-username string
```

> nombre de usuario SASL PLAIN opcional (predeterminado "")
<br />

```text
  --output-kafka-password string
```

> contraseña SASL PLAIN opcional (predeterminado "")
<br />

```text
  --output-kafka-tls
```

> usar TLS para las conexiones con los brokers (predeterminado `false`)
<br />

```text
  --output-kafka-event-types string
```

> tipos de eventos separados por comas (predeterminado "blocks,rollbacks,governance")

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
| `network.name` | Red Cardano admitida obligatoria: `mainnet`, `preprod`, `preview` o `dijkstra`. |
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

La salida `notify-json` escribe un objeto JSON por línea en stdout. Cada registro debe utilizar la versión de esquema `1`. Los registros de estado deben indicar `starting`, `connected` o `stale` e incluir una marca de tiempo y un mensaje opcional. Los registros de notificación deben incluir `ruleId`, un `eventType` opcional, `title` y `body` con el texto generado, y los campos de agrupación `batched` y `count`.

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
