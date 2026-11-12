---
title: "Referencia de configuración de Dingo v0.93.0"
description: Referencia y ejemplo completo de configuración de Dingo v0.93.0.
---

Esta página describe la configuración incluida en Dingo v0.93.0. La referencia completa de campos, descripciones, valores predeterminados, variables de entorno, opciones CLI, ajustes de proveedores y patrones de despliegue está en el archivo [`dingo.yaml.example`](https://raw.githubusercontent.com/blinklabs-io/dingo/v0.93.0/dingo.yaml.example) de esa versión. También puedes consultarlo en el [código de Dingo v0.93.0](https://github.com/blinklabs-io/dingo/blob/v0.93.0/dingo.yaml.example).

El ejemplo no contiene ajustes activos. Deja los valores comentados para utilizar los valores predeterminados de Dingo; descomenta un ajuste únicamente cuando quieras sustituir su valor predeterminado. No copies la configuración de otra versión sin revisar el ejemplo correspondiente, porque los campos y su comportamiento pueden cambiar.

## Prelación de configuración

Dingo busca cada ajuste primero en la línea de comandos, después en las variables de entorno, luego en el archivo YAML y finalmente en los valores predeterminados integrados. El ejemplo documenta las opciones CLI y variables de entorno junto a cada campo. Consulta [Configuración del nodo y modos de almacenamiento](/es/guides/dingo/005-node-configuration/) para conocer las principales opciones de ejecución.

### Configuración Cardano del archivo del nodo

`TxSubmissionLogicVersion` pertenece al archivo de configuración del nodo Cardano. No es un ajuste nativo de Dingo y no tiene una opción CLI ni una variable de entorno equivalente.

| Configuración | Clave del archivo Cardano | Opción CLI de Dingo | Variable de entorno de Dingo | Valor predeterminado y comportamiento |
| --- | --- | --- | --- | --- |
| Estrategia de envío de transacciones | `TxSubmissionLogicVersion` | — | — | Cuando falta la clave, Dingo utiliza `TxSubmissionLogicV1`. Este es el único valor aceptado y corresponde a la estrategia heredada de recepción por par implementada por Dingo. Dingo rechaza `TxSubmissionLogicV2` y cualquier valor desconocido durante la carga de la configuración. |

El archivo de configuración del nodo Cardano admite tanto el formato plano existente como el formato envolvente con `Version: 2`. En el formato envolvente, `Version` debe ser el entero `2` y `Configuration` debe ser un objeto. Un ejemplo compacto es:

```yaml
Version: 2
Configuration:
  Protocol:
    ByronGenesisFile: byron-genesis.json
    ShelleyGenesisFile: shelley-genesis.json
  Testing:
    DijkstraGenesisFile: dijkstra-genesis.json
  Consensus:
    ConsensusMode: GenesisMode
  Network:
    DeadlineTargetNumberOfRootPeers: 7
    DeadlineTargetNumberOfKnownPeers: 80
    DeadlineTargetNumberOfEstablishedPeers: 30
    DeadlineTargetNumberOfActivePeers: 15
```

Dingo asigna las secciones `Protocol`, `Testing`, `Consensus` y `Network` a los campos existentes de configuración del nodo. `Protocol` contiene la configuración de los archivos y hashes de génesis; `Testing` contiene la configuración de génesis de Dijkstra y las anulaciones de épocas de bifurcación; `Consensus` contiene `ConsensusMode`; y `Network` contiene los ajustes de red, incluido `PeerSharing` y los objetivos de pares. En `Network`, Dingo asigna `DeadlineTargetNumberOfRootPeers`, `DeadlineTargetNumberOfKnownPeers`, `DeadlineTargetNumberOfEstablishedPeers` y `DeadlineTargetNumberOfActivePeers` respectivamente a `TargetNumberOfRootPeers`, `TargetNumberOfKnownPeers`, `TargetNumberOfEstablishedPeers` y `TargetNumberOfActivePeers`.

Dingo rechaza los datos del formato envolvente si falta `Version` o `Configuration`, si `Version` no es el entero `2`, si `Configuration` o una sección admitida no es un objeto, o si el archivo usa una versión no admitida. Dingo también rechaza cualquier clave duplicada, incluidas las que aparecen en distintas secciones o las que establecen el mismo campo efectivo, como un objetivo `TargetNumberOf*Peers` y su alias `DeadlineTargetNumberOf*Peers`. Dentro del formato envolvente, Dingo aplica igualmente la validación de `TxSubmissionLogicVersion`: solo acepta `TxSubmissionLogicV1` y rechaza los valores no válidos, incluido `TxSubmissionLogicV2`, durante la carga.

## Áreas de configuración

| Zona | Ajustes principales | Propósito |
| --- | --- | --- |
| Redes y rutas | `network`, `networkMagic`, `cardanoConfig`, `topology`, `databasePath`, `socketPath` | Selecciona una red Cardano y las rutas de configuración del nodo, topología y datos. |
| Servicios y diagnósticos | `bindAddr`, `privateBindAddr`, `relayPort`, `privatePort`, `metricsBindAddr`, `metricsAuthToken`, `metricsPort`, `healthPort`, `debugPort`, `debugBindAddr`, `tracing`, `tracingEndpoint`, `tracingServiceName`, `tracingSampleRatio`, `tracingAlwaysSamplePools`, `localStateQueryViewMaxLifetime` | Configura los servicios públicos y privados, métricas, sondas de estado, perfiles, trazas y duración de instantáneas LocalStateQuery. |
| Registro y TLS | `logging`, `tlsCertFilePath`, `tlsKeyFilePath`, `api.tls` | Selecciona la salida de registros y protege los servicios compatibles de API o Bark. |
| Almacenamiento y API | `storageMode`, `plugins.storage`, `plugins.mempool`, `plugins.api`, `corsAllowedOrigins` | Elige el historial almacenado, proveedores de almacenamiento, orden de transacciones y API de aplicaciones. |
| Consenso y selección de plugins | `plugins.consensus` | Seleccione el proveedor de consenso utilizado por el nodo. |
| Arranque y sincronización | `mithril`, `mithril.downloadMaxBytes`, `mithril.server`, `mithril.server.aggregator`, `genesisBootstrap`, `genesisBootstrap.corroborationPeers`, `genesisBootstrap.controlGroups`, `intersectTip`, `immutableDbPath`, `chainsync`, `validateHistorical`, `strictUtxoValidation` | Configura el arranque desde instantáneas o génesis, la sincronización y la validación histórica. |
| Gestión de los pares | `targetNumberOfKnownPeers`, `targetNumberOfEstablishedPeers`, `targetNumberOfActivePeers`, `targetNumberOfRootPeers`, `activePeersTopologyQuota`, `activePeersGossipQuota`, `activePeersLedgerQuota`, `inboundWarmTarget`, `inboundHotQuota`, `inboundMinTenure`, `inboundHotScoreThreshold`, `inboundPruneAfter`, `inboundDuplexOnlyForHot`, `inboundCooldown` | Establece objetivos de pares, cuotas de origen y políticas de pares entrantes. |
| Producción de bloques y reglas del ledger | `blockProducer`, `shelley*`, `forge*`, `validateForgedBlock`, `minPoolMargin`, `pledgeLeverage*`, `fullPotRewards*`, `delegatorInactivity*`, `ledgerApplyRowBatchingEnabled`, `ledgerPrefetchAheadEnabled`, `ledgerValidateAheadEnabled` | Configura claves de forjado, umbrales de seguridad y comportamientos opcionales del ledger. |
| Archivo y ciclo de vida de bases de datos | `bark*`, `historyExpiry`, `databaseLifecycle` | Sirve o consume datos de archivo, hace caducar el historial local y gestiona instantáneas. |
| Índices opcionales y diagnósticos | `midnight`, `midnight.authTokenPolicyId`, `midnight.authTokenAssetName`, `tokenRegistry`, `tokenRegistry.manifestUrl`, `tokenRegistry.trustedManifestKey`, `tokenRegistry.allowRollback`, `koiosParity`, `cache`, `skipRewardLiveStakeBackfillCheck` | Configura índices opcionales, actualizaciones autenticadas del registro, diagnósticos de paridad, caché y validación de inicio. |

### Proveedor de consenso

| Configuración | Clave YAML | Opción CLI | Variable de entorno | Valor predeterminado y comportamiento |
| --- | --- | --- | --- | --- |
| Proveedor de consenso | `plugins.consensus.provider` | `--consensus` | `DINGO_PLUGINS_CONSENSUS_PROVIDER` | `praos` de forma predeterminada. `tachys` también es válido para redes compatibles. Selecciona el proveedor para validar cabeceras, comparar cadenas y programar líderes. |

Dingo registra en el directorio de datos la identidad de base de datos del proveedor seleccionado. Si la identidad almacenada difiere de la del proveedor seleccionado, rechaza el inicio. `tachys` rechaza el arranque si se activa el bootstrap de Genesis o Mithril, el modo Leios, el inicio o la transición Dijkstra, si falta la configuración de génesis de Shelley, si las épocas de Shelley a Babbage no son cero o si `activeSlotsCoeff` no es `1/1`.

Praos es el proveedor predeterminado. Por compatibilidad con las bases de datos Praos existentes, una base de datos no vacía y sin identificar se acepta cuando la identidad seleccionada es `praos/v1`, y Dingo registra esa identidad si la comprobación tiene éxito. Con cualquier otra identidad seleccionada, rechaza una base de datos no vacía y sin identificar; seleccionar Tachys para una base de datos identificada como Praos también falla. Una base de datos vacía puede adoptar la identidad del proveedor seleccionado antes de importar datos de la cadena.

### Capacidad del mempool

| Configuración | Clave YAML | Opción CLI | Variable de entorno | Valor predeterminado y comportamiento |
| --- | --- | --- | --- | --- |
| Capacidad del mempool | `plugins.mempool.config.capacity` | — | — | `1 MiB` en los modos estándar y Praos. `25 MiB` cuando el modo es Leios o la red es Musashi por nombre o por magic, incluso en `serve`. Un valor explícito prevalece sobre ambos valores predeterminados. |

### Procesamiento del ledger

| Configuración | Clave YAML | Opción CLI | Variable de entorno | Valor predeterminado y comportamiento |
| --- | --- | --- | --- | --- |
| Agrupación de filas del ledger | `ledgerApplyRowBatchingEnabled` | `--ledger-apply-row-batching-enabled` | `DINGO_LEDGER_APPLY_ROW_BATCHING_ENABLED` | `false`, desactivado. En modo core, agrupa varias filas de los deltas de bloques sin validar que lo permiten. Se transmite a `serve` y `dingo load`; el modo API ya utiliza agrupación. No afecta al consenso. |
| Lectura anticipada del ledger | `ledgerPrefetchAheadEnabled` | `--ledger-prefetch-ahead-enabled` | `DINGO_LEDGER_PREFETCH_AHEAD_ENABLED` | `true`, activado. Para bloques validados, lee por adelantado los UTxO de entrada del siguiente bloque desde una transacción de solo lectura mientras se aplica el actual. Desactivarlo también desactiva la validación anticipada. No afecta al consenso. |
| Validación anticipada del ledger | `ledgerValidateAheadEnabled` | `--ledger-validate-ahead-enabled` | `DINGO_LEDGER_VALIDATE_AHEAD_ENABLED` | `true`, activado. Verifica las firmas de testigos de bloques validados antes de aplicarlos. Requiere `ledgerPrefetchAheadEnabled`; desactivar la lectura anticipada también desactiva esta validación. No afecta al consenso. |
| Umbral bajo de Blockfetch | `blockfetchLowWatermarkEnabled` | `--blockfetch-low-watermark-enabled` | `DINGO_BLOCKFETCH_LOW_WATERMARK_ENABLED` | `false`, desactivado. Si la cabecera está lejos de la punta del par, inicia blockfetch tras encolar un rango de cabeceras en lugar de esperar a cuatro. No cambia la capacidad de la cola ni afecta al consenso. |

### Servicio de métricas

| Configuración | Clave YAML | Opción CLI | Variable de entorno | Valor predeterminado y comportamiento |
| --- | --- | --- | --- | --- |
| Dirección de escucha de métricas | `metricsBindAddr` | `--metrics-bind-addr` | `DINGO_METRICS_BIND_ADDR` | `127.0.0.1`. Es independiente de `bindAddr` y utiliza loopback de forma predeterminada. Establece explícitamente una dirección comodín o accesible remotamente si el recopilador está fuera del contenedor o del host. |
| Token de autenticación de métricas | `metricsAuthToken` | — | `DINGO_METRICS_AUTH_TOKEN` | Vacío de forma predeterminada, sin autenticación. No existe opción CLI porque otros usuarios pueden ver los argumentos del proceso. Si se configura, los clientes deben enviar `Authorization: Bearer <token>` tanto a las métricas del nodo como a las de Mithril. |
| Puerto de métricas | `metricsPort` | `--metrics-port` | — | `12798` de forma predeterminada. `0` desactiva el servicio Prometheus. |

El servicio de métricas utiliza HTTP sin cifrar. Protege el token mediante un proxy inverso TLS o un túnel cifrado y autenticado cuando el tráfico atraviese una red que no sea de confianza.

### Trazas

| Configuración | Clave YAML | Opción CLI | Variable de entorno | Valor predeterminado y comportamiento |
| --- | --- | --- | --- | --- |
| Endpoint del recopilador | `tracingEndpoint` | `--tracing-endpoint` | `DINGO_TRACING_ENDPOINT` | Vacío de forma predeterminada. Establece la URL de un recopilador OTLP HTTP para activar las trazas. Si está vacío, `tracing` controla su activación y las variables estándar `OTEL_EXPORTER_OTLP_*` seleccionan el destino. |
| Nombre del servicio de trazas | `tracingServiceName` | `--tracing-service-name` | `DINGO_TRACING_SERVICE_NAME`, `OTEL_SERVICE_NAME` | Dingo utiliza primero `tracingServiceName` cuando se configura de forma explícita, después `OTEL_SERVICE_NAME` y finalmente `dingo`. Define el nombre del servicio de la telemetría exportada. |
| Proporción de muestreo | `tracingSampleRatio` | `--tracing-sample-ratio` | `DINGO_TRACING_SAMPLE_RATIO` | `1` de forma predeterminada. Admite valores de `0` a `1`, ambos incluidos. La validación rechaza los valores fuera de ese intervalo. |
| Pools que Dingo siempre muestrea | `tracingAlwaysSamplePools` | `--tracing-always-sample-pools` | `DINGO_TRACING_ALWAYS_SAMPLE_POOLS` | Lista vacía de forma predeterminada. Acepta identificadores de pool en Bech32, incluido Bech32 en mayúsculas, o hashes de clave hexadecimales de `56` caracteres. Dingo muestrea los bloques de los pools enumerados independientemente de `tracingSampleRatio`. |
| Atributos de recurso de OpenTelemetry | — | — | `OTEL_RESOURCE_ATTRIBUTES` | Dingo aplica a la telemetría exportada los atributos que puede analizar. Dingo avisa sobre las entradas que no puede analizar sin hacer fallar el inicio. |
| Exportador de registros OpenTelemetry | — | — | `OTEL_LOGS_EXPORTER` | Activa la exportación OTLP opcional de registros. Un valor vacío o `none` la desactiva. Dingo avisa sobre una configuración de exportador no válida en lugar de hacer fallar el inicio y mantiene disponibles los registros de salida estándar. |
| Exportador de métricas OpenTelemetry | — | — | `OTEL_METRICS_EXPORTER` | Activa la exportación OTLP opcional de las métricas del registro Prometheus. Un valor vacío o `none` la desactiva. Dingo avisa sobre una configuración de exportador no válida en lugar de hacer fallar el inicio; la exportación no altera el extremo Prometheus `/metrics`. |

### Configuración DMQ

| Configuración | Clave YAML | Opción CLI | Variable de entorno | Valor predeterminado | Validación y comportamiento |
| --- | --- | --- | --- | --- | --- |
| Activación | `dmq.enabled` | `--dmq-enabled` | `DINGO_DMQ_ENABLED` | `false` | Valor booleano; `false` desactiva la función. |
| Tema | `dmq.topic` | `--dmq-topic` | `DINGO_DMQ_TOPIC` | `mithril` | Si está activado, Dingo exige `mithril`; ningún otro valor es válido. |
| Identificador de red | `dmq.networkMagic` | `--dmq-network-magic` | `DINGO_DMQ_NETWORK_MAGIC` | Derivado del tema y la red Cardano si no se establece. | Si se omite, se deriva del tema y de la red Cardano. Un valor explícito lo sustituye. Debe configurarse si la red no tiene un valor predeterminado para el tema. |
| Ruta del socket | `dmq.socketPath` | `--dmq-socket-path` | `DINGO_DMQ_SOCKET_PATH` | `dingo-dmq.socket` | Si está activado, exige un valor no vacío y distinto de `socketPath` de Cardano. |
| TTL de los mensajes | `dmq.messageTtl` | `--dmq-message-ttl` | `DINGO_DMQ_MESSAGE_TTL` | `1800` segundos | Si está activado, exige un valor positivo no mayor que `9223372036` segundos. |
| Tamaño máximo del mempool | `dmq.maxMempoolSize` | `--dmq-max-mempool-size` | `DINGO_DMQ_MAX_MEMPOOL_SIZE` | `128` MB | Si está activado, exige un valor positivo no mayor que `8796093022207` MB. |
| Puerto de pares N2N | `dmq.n2nPort` | `--dmq-n2n-port` | `DINGO_DMQ_N2N_PORT` | `0` | `0` desactiva el puerto N2N. Un puerto distinto de cero activa la escucha entre nodos DMQ y la gestión de pares cuando `dmq.maxPeers` también es distinto de cero. |
| Dirección IPv4 de escucha | `dmq.listenAddress` | `--dmq-listen-address` | `DINGO_DMQ_LISTEN_ADDRESS` | `0.0.0.0` | Si `dmq.n2nPort` no es cero y se configura este campo, exige un literal IPv4. |
| Dirección IPv6 de escucha | `dmq.listenIpv6Address` | `--dmq-listen-ipv6-address` | `DINGO_DMQ_LISTEN_IPV6_ADDRESS` | `::` | Si `dmq.n2nPort` no es cero y se configura este campo, exige un literal IPv6. |
| Archivo de topología DMQ | `dmq.topologyFile` | `--dmq-topology-file` | `DINGO_DMQ_TOPOLOGY_FILE` | Sin configurar | Si se configura, la ruta no puede incluir recorridos `..` y debe identificar un archivo regular existente. Dingo lo carga y valida antes de abrir el socket DMQ. |
| Mínimo de pares DMQ | `dmq.minPeers` | `--dmq-min-peers` | `DINGO_DMQ_MIN_PEERS` | `3` | Exige `dmq.minPeers <= dmq.maxPeers`; `0` permite no requerir pares. Solo las conexiones salientes cuentan para cumplir este mínimo; las conexiones entrantes no lo satisfacen. |
| Máximo de pares DMQ | `dmq.maxPeers` | `--dmq-max-peers` | `DINGO_DMQ_MAX_PEERS` | `10` | Exige `dmq.minPeers <= dmq.maxPeers`; `0` no permite pares cuando `minPeers` también es `0`. Limita el total de conexiones y reserva espacio para las conexiones salientes según `minPeers` y la valencia total de las raíces locales. |

Dingo valida estos seis ajustes de pares al iniciar DMQ. Con `dmq.n2nPort: 0`, omite la validación de las direcciones de escucha. Si `dmq.n2nPort` no es cero, cada dirección debe utilizar su versión IP correspondiente. Cuando `dmq.n2nPort` y `dmq.maxPeers` son distintos de cero, Dingo escucha en las direcciones configuradas y el gestor mantiene los pares dentro de `dmq.minPeers` y `dmq.maxPeers`. El archivo de topología configurado proporciona pares al gestor, que intenta primero las raíces locales y después las raíces públicas. El tema activado también puede descubrir pares relay del ledger mediante registros SRV de DNS asociados al prefijo del tema.

La pila DMQ cuenta únicamente las conexiones salientes para alcanzar `dmq.minPeers`; las conexiones entrantes no satisfacen ese mínimo. Para admitir conexiones entrantes, la pila reserva el mayor valor entre `dmq.minPeers` y la valencia total de las raíces locales, sin superar `dmq.maxPeers`. La pila calcula internamente el límite de conexiones entrantes como la capacidad restante de `dmq.maxPeers`; Dingo no expone ese límite como un parámetro YAML, una opción CLI ni una variable de entorno. Cuando la reserva saliente alcanza `dmq.maxPeers`, la pila rechaza las nuevas conexiones entrantes.

Cuando se configura `dmq.topologyFile`, Dingo aplica estas reglas antes de abrir el socket DMQ:

- El archivo debe ser un objeto JSON de un máximo de `10 MiB`. Dingo rechaza el JSON mal formado, JSON `null` y las claves de objeto que solo difieran en mayúsculas y minúsculas.
- Cada punto de acceso de `localRoots` o `publicRoots` debe tener un host no vacío y un puerto entre `1` y `65535`. Dingo elimina los espacios alrededor del host y los corchetes IPv6.
- Una raíz utiliza `valency`, o `hotValency` como alias si falta `valency`. Si aparecen ambas, `valency` tiene prioridad. `warmValency` utiliza el mismo valor que `valency` de forma predeterminada y debe ser mayor o igual. La valencia puede superar el número de puntos de acceso.
- Dingo cuenta una vez cada combinación distinta de host y puerto. La comparación de nombres ignora mayúsculas, minúsculas y el punto final. Normaliza los literales IP sin resolver los nombres de host.
- Cuando `bootstrapPeers` o `peerSnapshotFile` contienen un valor, Dingo advierte y descarta ambos campos. También ignora `useLedgerAfterSlot`.

Dingo registra el número de pares distintos tras cargar el archivo y advierte si no contiene ninguno. Una topología no válida hace fallar el inicio antes de abrir el socket DMQ.

### Origen ImmutableDB

El ajuste `immutableDbPath` y el argumento posicional de `dingo load` aceptan un directorio local o una URL remota. Los orígenes remotos requieren `https://`; `http://` solo funciona con hosts de loopback. Dingo rechaza los destinos HTTPS privados o de uso especial en la URL inicial, tras cada redirección y en cada resolución DNS al conectarse. Las importaciones remotas ignoran los ajustes de proxy HTTP del entorno. Las raíces remotas deben proporcionar `tip.json` y tríadas numeradas de archivos `.chunk`, `.primary` y `.secondary`; se rechazan los datos publicados incompletos o con formato incorrecto. Dingo calcula límites agregados de transferencia, caché, datos temporales, espacio libre reservado y concurrencia según el rango de fragmentos solicitado. Si se supera un límite o falta espacio libre, la importación falla con un error y se eliminan los archivos temporales. Si la reproducción de confianza o el procesamiento fallan después de copiar bloques inmutables más allá de la punta aplicada del ledger, Dingo retrocede los bloques sin aplicar hasta esa punta antes de devolver el error original. La limpieza no deja bloques sin aplicar por delante del ledger. Si el backend rechaza el retroceso, se devuelven ambos errores y la base de datos requiere recuperación antes de otra carga. Consulta la guía de arranque y mantenimiento de datos para los requisitos de origen remoto, fragmentos e integridad.

### Corroboración de arranque Genesis

| Configuración | Clave YAML | Opción CLI | Variable de entorno | Valor predeterminado y comportamiento |
| --- | --- | --- | --- | --- |
| Pares de corroboración | `genesisBootstrap.corroborationPeers` | `--genesis-bootstrap-corroboration-peers` | `DINGO_GENESIS_BOOTSTRAP_CORROBORATION_PEERS` | `0` de forma predeterminada. El valor predeterminado desactiva la barrera de corroboración. El operador debe configurar un valor positivo explícito cuando necesite exigir pares de corroboración antes de permitir que una fuente rápida impulse la selección Genesis. |
| Grupos de control de Genesis | `genesisBootstrap.controlGroups` | — | — | Dingo ya no proporciona grupos de control específicos de red de forma implícita. Los operadores deben configurar este campo explícitamente cuando necesiten un conjunto fijo de grupos de control. |

En Musashi, una configuración Cardano con `ConsensusMode: PraosMode` desactiva la selección de cadena Genesis aunque `genesisBootstrap` esté activado y el nodo comience desde el origen sin punto de intersección. Dingo sigue la configuración Cardano en lugar de aplicar selección por densidad, corroboración o paciencia de Genesis.

### Proveedor UTxO RPC

Configura explícitamente el host cuando el proveedor deba aceptar conexiones UTxO RPC desde otro host o interfaz.

| Configuración | Clave YAML | Opción CLI | Variable de entorno | Valor predeterminado y comportamiento |
| --- | --- | --- | --- | --- |
| Host | `plugins.api.utxorpc.config.host` | — | — | `127.0.0.1` de forma predeterminada. El acceso remoto o desde fuera de loopback requiere un host explícito. |

### Proveedor Blockfrost

El proveedor integrado de Blockfrost escucha en loopback de forma predeterminada. Las solicitudes de solo lectura no están sujetas a los límites de admisión de modificaciones, aunque puede aplicarse la autenticación compartida de API si está configurada.

| Configuración | Clave YAML | Opción CLI | Variable de entorno | Valor predeterminado y validación |
| --- | --- | --- | --- | --- |
| Host | `plugins.api.blockfrost.config.host` | — | — | `127.0.0.1` de forma predeterminada. Un valor explícitamente vacío utiliza el `bindAddr` raíz. Configura un host para exponer el proveedor en otra interfaz. |
| Token de autenticación | `plugins.api.blockfrost.config.authToken` | — | — | Vacío de forma predeterminada. El envío y la evaluación de transacciones requieren este token en `project_id`, `X-Blockfrost-Project-Id` o `Authorization: Bearer <token>`. Las credenciales ausentes o no válidas devuelven HTTP `401`. |
| Modificaciones concurrentes globales | `plugins.api.blockfrost.config.maxConcurrentMutations` | — | — | `4` de forma predeterminada. Debe ser positivo y limita el envío y la evaluación de transacciones en todo el proveedor. |
| Modificaciones concurrentes por cliente | `plugins.api.blockfrost.config.maxConcurrentMutationsPerClient` | — | — | `1` de forma predeterminada. Debe ser positivo y no superar `maxConcurrentMutations`; limita el trabajo de una dirección remota. |

Cuando `authToken` está configurado y el proveedor escucha fuera de loopback, configura TLS de servidor mediante `plugins.api.blockfrost.config.tls`. Dingo rechaza el inicio del acceso autenticado de modificación sin TLS. Tras autenticar y antes de leer el cuerpo, aplica ambos límites de modificaciones. Si alguno se agota, devuelve HTTP `429` con `Retry-After: 1` sin leer el cuerpo.

### Agente de usuario HTTP saliente compartido

El agente de usuario HTTP saliente compartido no tiene clave YAML ni opción CLI.

| Configuración | Clave YAML | Opción CLI | Variable de entorno | Valor predeterminado y comportamiento |
| --- | --- | --- | --- | --- |
| Agente de usuario HTTP compartido | — | — | `DINGO_HTTP_USER_AGENT` | `dingo/<version> (<GOOS>/<GOARCH>)` de forma predeterminada. Dingo utiliza un valor válido de esta variable de entorno cuando se establece e ignora un valor no válido. Los ajustes de `userAgent` específicos de cada componente para metadatos fuera de la cadena y el registro de tokens tienen prioridad sobre este valor. |

### Duración de las instantáneas LocalStateQuery

| Configuración | Clave YAML | Opción CLI | Variable de entorno | Valor predeterminado | Validación y comportamiento |
| --- | --- | --- | --- | --- | --- |
| Duración máxima de una instantánea adquirida | `localStateQueryViewMaxLifetime` | `--local-state-query-view-max-lifetime` | `DINGO_LOCAL_STATE_QUERY_VIEW_MAX_LIFETIME` | `5m` | Usa una duración positiva, como `5m`. La validación de configuración o de inicio rechaza los valores no válidos, cero o negativos. Al alcanzar el límite, Dingo cierra la instantánea retenida. La siguiente consulta la reabre en el punto adquirido y responde desde ella; las adquisiciones de punta utilizan sus puntas capturadas. Si un retroceso o la poda eliminan el punto adquirido, Dingo no puede reabrirla y cierra la conexión. |

### Sincronización de Mithril y backend

| Configuración | Clave YAML | Opción CLI | Variable de entorno | Valor predeterminado y comportamiento |
| --- | --- | --- | --- | --- |
| Sincronización Mithril gestionada | `mithril.enabled` | `--mithril-enabled` | `DINGO_MITHRIL_ENABLED` | `false`, desactivada. En `serve` con almacenamiento core puede sincronizar desde una punta certificada de Mithril v2 y recurrir a Ouroboros si falla. Los comandos manuales funcionan independientemente de este ajuste. |
| Backend de artefactos Mithril | `mithril.backend` | `--mithril-backend` | `DINGO_MITHRIL_BACKEND` | `v2`; un valor vacío también selecciona `v2`. Dingo rechaza `v1` y sus rutas CLI. El backend v2 utiliza artefactos incrementales de bases de datos Cardano y requiere estado auxiliar del ledger y resúmenes de inmutables verificados durante el arranque. La estructura v2 es la referencia autoritativa. |
| Resumen fijado de Mithril | `mithril.pinnedDigest` | `--mithril-pinned-digest` | `DINGO_MITHRIL_PINNED_DIGEST` | Vacío de forma predeterminada. Si se configura para un arranque nuevo, debe identificar un artefacto v2 de base de datos Cardano. Dingo rechaza las fijaciones y resúmenes de instantáneas v1. |

### Límite de descarga de Mithril

| Configuración | Clave YAML | Opción CLI | Variable de entorno | Valor predeterminado y comportamiento |
| --- | --- | --- | --- | --- |
| Límite comprimido por objeto Mithril | `mithril.downloadMaxBytes` | `--mithril-download-max-bytes` | `DINGO_MITHRIL_DOWNLOAD_MAX_BYTES` | `0` utiliza los límites integrados por objeto. Un valor positivo sustituye el límite de cada objeto descargado. La validación de configuración o de inicio rechaza los valores negativos. |

Cuando `mithril.downloadMaxBytes` es `0`, Dingo utiliza estos límites integrados de tamaño comprimido:

| Objeto Mithril | Límite incorporado |
| --- | --- |
| Archivo inmutable v2 | `1 GiB` |
| Lista de resúmenes v2 | `256 MiB` |
| Datos auxiliares v2 | `64 GiB` |

### Servidor de artefactos Mithril

Los ajustes de `mithril.server` controlan `dingo mithril snapshot create` y `dingo mithril serve`. La lectura de los artefactos de instantáneas es pública. El registro de firmantes y el cierre del registro del agregador requieren el token Bearer de `mithril.server.aggregator.operatorTokenFile`. El agregador requiere TLS si escucha fuera de loopback. Establece `mithril.server.publicBaseUrl` en el origen público de las descargas; exige HTTPS salvo para un origen HTTP de loopback.

| Configuración | Clave YAML | Opción CLI | Variable de entorno | Valor predeterminado y comportamiento |
| --- | --- | --- | --- | --- |
| Puerto del servidor de artefactos | `mithril.server.port` | `--mithril-server-port` | `DINGO_MITHRIL_SERVER_PORT` | `8081`. `dingo mithril serve` escucha en este puerto y en el `bindAddr` raíz. |
| Origen público de las instantáneas | `mithril.server.publicBaseUrl` | `--mithril-server-public-base-url` | `DINGO_MITHRIL_SERVER_PUBLIC_BASE_URL` | Obligatorio para `dingo mithril serve`. Debe ser un origen sin credenciales, ruta, consulta ni fragmento. Requiere HTTPS salvo para HTTP de loopback. |
| Almacén de artefactos | `mithril.server.artifactStore` | `--mithril-server-artifact-store` | `DINGO_MITHRIL_SERVER_ARTIFACT_STORE` | Vacío. Configura un directorio, `s3://bucket/prefix` o `gcs://bucket/prefix`. Los dos últimos requieren una compilación con `dingo_extra_plugins`. |
| URL base de redirección | `mithril.server.redirectBaseUrl` | `--mithril-server-redirect-base-url` | `DINGO_MITHRIL_SERVER_REDIRECT_BASE_URL` | Vacía. Si se configura, las solicitudes de archivos se redirigen a esta URL base más la clave del objeto, en lugar de transmitir el objeto. Úsala solo si los objetos remotos son públicos. |
| Retención de instantáneas | `mithril.server.keepSnapshots` | `--mithril-server-keep-snapshots` | `DINGO_MITHRIL_SERVER_KEEP_SNAPSHOTS` | `0` conserva todas las instantáneas producidas. Un valor positivo conserva esa cantidad de las más recientes. |
| Clave de firma auxiliar | `mithril.server.ancillarySigningKeyFile` | `--mithril-server-ancillary-signing-key-file` | `DINGO_MITHRIL_SERVER_ANCILLARY_SIGNING_KEY_FILE` | Vacío. Configura la clave Ed25519 de Mithril en formato JSON hexadecimal que firma cada manifiesto auxiliar. |
| TLS del servidor de artefactos | `mithril.server.tlsEnabled` | `--mithril-server-tls-enabled` | `DINGO_MITHRIL_SERVER_TLS_ENABLED` | `false`. Si se activa, utiliza `tlsCertFilePath` y `tlsKeyFilePath` compartidos. |
| Endpoints del agregador | `mithril.server.aggregator.enabled` | `--mithril-aggregator-enabled` | `DINGO_MITHRIL_AGGREGATOR_ENABLED` | `false`. Activa el registro de firmantes, la recopilación de firmas y la certificación de instantáneas. |
| Época de registro de firmantes | `mithril.server.aggregator.epoch` | `--mithril-aggregator-epoch` | `DINGO_MITHRIL_AGGREGATOR_EPOCH` | `0` no selecciona una época utilizable; configura al menos `1` al activar el agregador. El certificado de génesis utiliza la época anterior. |
| Quórum STM | `mithril.server.aggregator.k` | `--mithril-aggregator-k` | `DINGO_MITHRIL_AGGREGATOR_K` | `0` hasta configurarlo. Debe ser positivo y no superar `m`. |
| Tamaño de la lotería STM | `mithril.server.aggregator.m` | `--mithril-aggregator-m` | `DINGO_MITHRIL_AGGREGATOR_M` | `0` hasta configurarlo. Debe ser positivo si el agregador está activo. |
| Probabilidad de victoria STM | `mithril.server.aggregator.phiF` | `--mithril-aggregator-phi-f` | `DINGO_MITHRIL_AGGREGATOR_PHI_F` | `0` hasta configurarlo. Debe ser mayor que `0` y menor o igual que `1`. |
| Clave de firma de génesis del agregador | `mithril.server.aggregator.genesisSigningKeyFile` | `--mithril-aggregator-genesis-signing-key-file` | `DINGO_MITHRIL_AGGREGATOR_GENESIS_SIGNING_KEY_FILE` | Obligatoria si el agregador está activo. Configura una clave Ed25519 de Mithril en formato JSON hexadecimal. |
| Token del operador del agregador | `mithril.server.aggregator.operatorTokenFile` | `--mithril-aggregator-operator-token-file` | `DINGO_MITHRIL_AGGREGATOR_OPERATOR_TOKEN_FILE` | Obligatorio si el agregador está activo. Configura un archivo con al menos 32 bytes aleatorios. |

### Validación del almacenamiento de metadatos SQLite

Cuando `plugins.storage.metadata.provider` es `sqlite`, o se omite y Dingo utiliza `sqlite` de forma predeterminada, la raíz `databasePath` no puede estar vacía. Dingo rechaza el inicio si está vacía en cualquiera de esos casos.

### TLS de los metadatos SQL

Las conexiones PostgreSQL generadas por el proveedor utilizan `sslMode: verify-full` de forma predeterminada para verificar el certificado y el nombre del servidor. Las conexiones MySQL generadas utilizan `tls=true` si no se establece `sslMode` y el host no es de loopback; `localhost`, `127.0.0.1` y `::1` están exentos. Un `dsn` explícito tiene prioridad y evita estos valores predeterminados generados.

Las operaciones de instantánea y restauración MySQL rechazan `tls=skip-verify` en lugar de degradar la conexión a TLS oportunista. Utiliza un modo explícito admitido, como `tls=false`, `tls=true` o `tls=preferred`, si la operación requiere otra configuración.

### Token de autorización de Midnight

Configura los campos de token de autorización de Midnight bajo `midnight` cuando el registro deba utilizar una política y un activo concretos.

| Configuración | Clave YAML | Valor predeterminado | Validación y comportamiento |
| --- | --- | --- | --- |
| Política del token de autorización | `midnight.authTokenPolicyId` | Vacío | Debe tener exactamente 56 caracteres hexadecimales y decodificar a 28 bytes. |
| Nombre de activo del token de autorización | `midnight.authTokenAssetName` | Vacío | Dingo lo utiliza junto con el identificador de política al validar el token de autorización. |

Establece ambos campos o deja ambos vacíos. Un par incompleto hace fallar la validación de configuración y de inicio. Cuando están configurados, Dingo solo acepta un token si el identificador de política y el nombre del activo coinciden exactamente.

### Recolección del registro de valores Badger

Configura estas claves YAML bajo `plugins.storage.blob.config` para el proveedor Badger. No añaden opciones CLI ni variables de entorno de nivel superior.

Dingo utiliza `1 MiB` como valor predeterminado de `plugins.storage.blob.config.valueThreshold`, salvo durante `sync` en modo core y la sincronización Mithril, donde utiliza `1 KiB`. Un valor YAML explícito sustituye cualquiera de esos valores, incluido un `0` explícito.

| Configuración | Clave YAML del proveedor | Valor predeterminado | Validación y comportamiento |
| --- | --- | --- | --- |
| Caché de bloques | `plugins.storage.blob.config.blockCacheSize` | `0` en almacenamiento `core`; `256 MiB` en modo API. | Configura el tamaño de la caché de bloques en bytes. No existen opción CLI ni variable de entorno de nivel superior. |
| Caché de índices | `plugins.storage.blob.config.indexCacheSize` | `0` en almacenamiento `core` y en modo API. | Configura el tamaño de la caché de índices en bytes. No existen opción CLI ni variable de entorno de nivel superior. |
| Compresión | `plugins.storage.blob.config.compression` | Desactivada en almacenamiento `core`; activada en modo API. | En Badger en disco, la compresión requiere un `blockCacheSize` positivo. `blockCacheSize: 0` hace fallar la carga de la configuración cuando la compresión está activada. Los valores cero de las cachés siguen siendo válidos cuando la compresión está desactivada. |
| Tamaño de memtable | `plugins.storage.blob.config.memTableSize` | `512 MiB` únicamente en almacenamiento `core` y ejecución `sync`; las demás combinaciones utilizan `128 MiB` cuando se omite o vale `0`. | Configura un número de bytes. Un valor explícito sustituye el predeterminado integrado. No existen opción CLI ni variable de entorno de nivel superior. |
| Intervalo de GC del registro de valores | `plugins.storage.blob.config.gcInterval` | `5m` | Un intervalo cero selecciona `5m`. Se rechazan los intervalos negativos. |
| Proporción de descarte de GC | `plugins.storage.blob.config.gcDiscardRatio` | `0.5` | Debe ser estrictamente mayor que `0` y menor que `1`. |

Dingo mantiene desactivada la recolección del registro de valores tanto en `load` como en `sync`, aunque `plugins.storage.blob.config.gc` esté establecido en `true`.

### Límite de pausa de las instantáneas de base de datos

| Configuración | Clave YAML | Opción CLI | Variable de entorno | Valor predeterminado | Validación y alcance |
| --- | --- | --- | --- | --- | --- |
| Límite de pausa de commit de instantáneas | `databaseLifecycle.snapshotMaxCommitPause` | `--db-snapshot-max-commit-pause` | `DINGO_DB_LIFECYCLE_SNAPSHOT_MAX_COMMIT_PAUSE` | `30s`; `0s` elimina el límite. | Admite una duración no negativa; la validación rechaza valores negativos. Un valor positivo limita las instantáneas manuales sin conexión, en vivo y automáticas de límite de época después de adquirir la barrera de commit. Si se supera, cancela la instantánea, elimina la salida parcial y devuelve un error que envuelve `ErrCommitPauseExceeded`. |

### Directorio de instantáneas de base de datos

| Configuración | Clave YAML | Opción CLI | Variable de entorno | Valor predeterminado y requisitos |
| --- | --- | --- | --- | --- |
| Directorio local de instantáneas | `databaseLifecycle.snapshotDir` | `--db-snapshot-dir` | — | Vacío de forma predeterminada. Cuando se configura, Dingo valida que el directorio sea propiedad del usuario que ejecuta el proceso o de root en Unix y que pueda escribirse; fija permisos privados `0700`. Las carpetas de instantáneas utilizan `0700` y sus archivos `0600`. En Windows, Dingo aplica una ACL protegida de propietario único. |

### Clave de confianza de las instantáneas de base de datos

| Configuración | Clave YAML | Opción CLI | Variable de entorno | Valor predeterminado y validación |
| --- | --- | --- | --- | --- |
| Archivo de clave de confianza | `databaseLifecycle.snapshotTrustKeyFile` | `--db-snapshot-trust-key-file` | `DINGO_DB_LIFECYCLE_SNAPSHOT_TRUST_KEY_FILE` | Vacío de forma predeterminada. Debe ser un archivo regular, sin enlace simbólico, de al menos 16 bytes y no más de 1024 bytes. |

En Unix, el archivo debe pertenecer al usuario actual y no conceder acceso al grupo ni a otros usuarios. Windows admite al usuario actual o a `BUILTIN\Administrators` como propietario si el proceso pertenece a ese grupo. La DACL solo puede incluir al propietario, `Administrators`, `SYSTEM`, `Creator Owner` y `Owner Rights`, además de la ACE local restringida de `Administrator` cuando `Administrators` sea el propietario. Dingo rechaza los archivos no válidos al autenticar instantáneas y en cualquier operación de ciclo de vida que necesite la clave.

Al activar la duplicación de instantáneas en la nube, proporciona una clave de confianza válida. Dingo rechaza las instantáneas heredadas no firmadas para la duplicación en la nube; no las firma automáticamente.

Las restauraciones locales sin una clave de confianza requieren un directorio de instantáneas privado y de confianza en Unix, y un manifiesto autenticado en Windows. Consulta la guía de arranque y mantenimiento de datos para realizar las comprobaciones operativas necesarias.

### Servicio remoto de ciclo de vida de Bark

El servicio remoto de ciclo de vida de Bark está desactivado de forma predeterminada. Al activarlo, ofrece `Stop`, `Restart` y `GetStatus`. Bark escucha en `127.0.0.1` de forma predeterminada cuando se monta este servicio; configura `barkHost` para exponerlo en otra interfaz.

| Configuración | Clave YAML | Opción CLI | Variable de entorno | Valor predeterminado y requisitos |
| --- | --- | --- | --- | --- |
| Activar el servicio de ciclo de vida | `barkLifecycleEnabled` | `--bark-lifecycle-enabled` | `DINGO_BARK_LIFECYCLE_ENABLED` | `false`. Requiere `barkPort` distinto de cero, `barkClientCaFilePath`, `tlsCertFilePath`, `tlsKeyFilePath` y al menos un valor en `barkLifecycleOperatorCertificateFingerprints`. |
| Certificados de operadores de ciclo de vida | `barkLifecycleOperatorCertificateFingerprints` | `--bark-lifecycle-operator-certificate-fingerprints` | `DINGO_BARK_LIFECYCLE_OPERATOR_CERTIFICATE_FINGERPRINTS` | Vacío de forma predeterminada. Cada valor es la huella SHA-256 hexadecimal de los bytes DER del certificado de cliente; admite dos puntos e ignora mayúsculas y minúsculas. Estas credenciales solo autorizan `Stop` y `Restart`. |
| Direcciones privadas o especiales para descargas | `barkBlockDownloadAllowPrivateAddresses` | `--bark-block-download-allow-private-addresses` | `DINGO_BARK_BLOCK_DOWNLOAD_ALLOW_PRIVATE_ADDRESSES` | `false`. Con `true`, permite direcciones resueltas privadas o de uso especial para las descargas de bloques Bark. Mantiene la lista de orígenes permitidos, HTTPS, la validación de redirecciones y la desactivación de proxies. Solo afecta a las descargas, no al tráfico RPC. |

Todas las operaciones de ciclo de vida requieren un certificado de cliente verificado con `barkClientCaFilePath`. `Stop` y `Restart` también requieren una huella coincidente de la lista de operadores. `GetStatus` requiere mTLS, pero no pertenecer a esa lista. Las credenciales de operadores de DatabaseService son independientes y no conceden acceso al ciclo de vida. `Restart` está disponible en Unix; las demás plataformas devuelven un error de operación no admitida.

### Presupuestos de consulta de archivos Bark

| Configuración | Clave YAML | Opción CLI | Variable de entorno | Valor predeterminado y validación |
| --- | --- | --- | --- | --- |
| Consultas globales de archivo por segundo | `barkArchiveLookupsPerSecond` | `--bark-archive-lookups-per-second` | `DINGO_BARK_ARCHIVE_LOOKUPS_PER_SECOND` | `200` cuando vale `0`. Cubre todos los llamadores anónimos de `ArchiveService`. Se rechazan los valores negativos. |
| Consultas de archivo por llamador y segundo | `barkArchiveCallerLookupsPerSecond` | `--bark-archive-caller-lookups-per-second` | `DINGO_BARK_ARCHIVE_CALLER_LOOKUPS_PER_SECOND` | `50` cuando vale `0`. Identifica a los llamadores por dirección IPv4 o prefijo IPv6 `/64`. Se rechazan los valores negativos. |

Dingo cobra en ambos presupuestos un cargo base por cada referencia de `FetchBlock`. Cuando el lote contiene referencias por altura, reserva por adelantado en ambos presupuestos, una sola vez, el coste de resolver el límite superior (`66` unidades de consulta). Después, reserva en ambos presupuestos el trabajo de búsqueda binaria de cada referencia según el límite resuelto. Los reintentos por un tramo final obsoleto del índice y los saltos de entradas interiores obsoletas también reservan por adelantado, en ambos presupuestos, el coste de cada operación. Si alguno de los dos presupuestos no cubre el siguiente trabajo, Dingo rechaza la solicitud con `RESOURCE_EXHAUSTED` antes de iniciar la resolución, búsqueda o lectura correspondiente del archivo o del almacenamiento en nube. Los lotes grandes que contienen referencias por altura pueden necesitar dividirse.

### Secretos y entradas de paridad desde archivos

Las entradas desde archivos son alternativas a los valores literales. Se aplica la misma prioridad de CLI, entorno, YAML y valores predeterminados descrita anteriormente. Dingo rechaza una fuente que establezca simultáneamente la forma literal y la forma de archivo.

| Configuración | Clave YAML | Opción CLI | Variable de entorno | Valor predeterminado y comportamiento |
| --- | --- | --- | --- | --- |
| Clave API de paridad Koios de Dingo | `koiosParity.apiKey` | Eliminada; no válida: `--koios-parity-api-key` | `DINGO_KOIOS_PARITY_API_KEY` | Vacía de forma predeterminada. YAML y esta variable de entorno siguen aceptando claves API literales. |
| Archivo de clave API de paridad Koios de Dingo | `koiosParity.apiKeyFile` | `--koios-parity-api-key-file` | `DINGO_KOIOS_PARITY_API_KEY_FILE` | Vacío de forma predeterminada. La entrada CLI utiliza esta opción respaldada por archivo. El archivo se lee como una cadena de clave API. |
| Archivo de campo genérico de configuración de plugins | — | — | `DINGO_PLUGINS_<CAPABILITY>_CONFIG_<FIELD>_FILE` | Sustituye a `DINGO_PLUGINS_<CAPABILITY>_CONFIG_<FIELD>`. Dingo lee el archivo como una cadena de texto, sin interpretarlo como YAML. |
| Archivo de clave API de `koios-parity` | — | `--api-key-file` | `KOIOS_API_KEY_FILE` | Sustituye a `--api-key` o `KOIOS_API_KEY`. Las opciones CLI tienen prioridad sobre las variables de entorno. |
| Archivo de DSN de metadatos de `koios-parity` | — | `--metadata-dsn-file` | — | Sustituye a `--metadata-dsn`. Aporta la cadena de conexión como texto. |
| Archivo de clave Koios de `node-parity from-genesis` | — | `--koios-api-key-file` | — | Sustituye a `--koios-api-key`. Aporta la clave API de la solicitud Koios. |
| Tamaño de lote de transacciones de `node-parity from-genesis` | — | `--koios-tx-info-batch-size` | — | `40` de forma predeterminada. Solo `node-parity from-genesis` admite esta opción. Controla el número de hashes de transacción por solicitud `/tx_info` y acepta valores de `1` a `999`. El host público rechaza cuerpos de solicitud de más de `5120` bytes. |
| Concurrencia de transacciones de `node-parity from-genesis` | — | `--koios-tx-info-concurrency` | — | `8` de forma predeterminada. Solo `node-parity from-genesis` admite esta opción. Controla el número de solicitudes `/tx_info` que Dingo mantiene simultáneamente y acepta valores de `1` a `64`. |
| Directorio de captura de límites de `node-parity from-genesis` | — | `--boundary-capture-dir` | — | El operador puede indicar un directorio de capturas de límites para la comparación de UTxO desde génesis. |

Cada valor respaldado por archivos debe cumplir estos requisitos:

- La ruta debe identificar un archivo regular. Dingo rechaza directorios, dispositivos y otros caminos no regulares.
- Dingo acepta como máximo `64 KiB` de contenido. Elimina los caracteres `CR` y `LF` finales y rechaza el contenido vacío o compuesto únicamente de espacios.
- El archivo y cada entrada ancestral de su ruta deben tener una propiedad confiable. En Unix, deben pertenecer al usuario que ejecuta el proceso o a root; además, Dingo rechaza los directorios no sticky que permitan escritura al grupo o a otros usuarios. Unix permite acceso al propietario y al grupo en el archivo, pero no a otros usuarios. Windows solo permite al propietario, Administrators y SYSTEM mediante la ACL correspondiente.
- Los errores identifican el valor o la ruta, pero nunca incluyen el contenido del archivo.

### Autenticación de manifiestos del registro de tokens

La sincronización del registro de tokens admite un archivo público sin manifiesto firmado y réplicas con manifiesto firmado.

| Configuración | Clave YAML | Opción CLI | Variable de entorno | Valor predeterminado y comportamiento |
| --- | --- | --- | --- | --- |
| URL del archivo del registro | `tokenRegistry.sourceUrl` | `--token-registry-source-url` | `DINGO_TOKEN_REGISTRY_SOURCE_URL` | Vacía de forma predeterminada. Dingo selecciona el archivo público correspondiente a la red. Un valor explícito debe ser una URL HTTPS absoluta. |
| URL del manifiesto firmado | `tokenRegistry.manifestUrl` | `--token-registry-manifest-url` | `DINGO_TOKEN_REGISTRY_MANIFEST_URL` | Vacía de forma predeterminada. Una réplica firmada requiere esta URL y `trustedManifestKey`; debe ser una URL HTTPS absoluta. |
| Clave de confianza del manifiesto | `tokenRegistry.trustedManifestKey` | `--token-registry-trusted-manifest-key` | `DINGO_TOKEN_REGISTRY_TRUSTED_MANIFEST_KEY` | Vacía de forma predeterminada. Una réplica firmada requiere esta clave junto con `manifestUrl`; configura una clave pública Ed25519 de 32 bytes codificada en hexadecimal. |
| Permitir retroceso del manifiesto | `tokenRegistry.allowRollback` | `--token-registry-allow-rollback` | `DINGO_TOKEN_REGISTRY_ALLOW_ROLLBACK` | `false` de forma predeterminada. Dingo aplica este ajuste solo cuando verifica la instantánea mediante un manifiesto firmado; utiliza `true` únicamente para un retroceso intencional del editor. |

Para sincronizar el archivo público, Dingo requiere que `tokenRegistry.manifestUrl` y `tokenRegistry.trustedManifestKey` permanezcan vacíos. Dingo utiliza `tokenRegistry.sourceUrl` o el archivo público predeterminado de la red sin exigir un manifiesto firmado. Para una réplica firmada, Dingo requiere ambos campos y rechaza una configuración que establezca solo uno.

En el flujo con manifiesto firmado, Dingo verifica el manifiesto frente a la URL del archivo configurada, el tamaño comprimido exacto y el resumen BLAKE2b-256. El manifiesto aporta la secuencia para las comprobaciones de retroceso. Dingo rechaza una instantánea cuando falta la autenticación, cuando sus datos no coinciden o cuando está incompleta; también rechaza una secuencia inferior salvo que `allowRollback` sea `true`, y rechaza un cambio de resumen con la misma secuencia. Una instantánea rechazada no sustituye la última aceptada.

### Credenciales de encabezados del registro de tokens

Utiliza `tokenRegistry.headerSecrets` para las credenciales de una réplica autenticada del registro de tokens. En YAML, es un mapa de nombres de encabezado a valores secretos:

```yaml
tokenRegistry:
  headerSecrets:
    Authorization: "Bearer <token>"
```

La variable de entorno es `DINGO_TOKEN_REGISTRY_HEADER_SECRETS` y utiliza pares `name:value` separados por comas. Cada par se divide en el primer signo de dos puntos; el valor puede incluir más signos de dos puntos, pero no comas. No existe opción CLI porque expondría las credenciales en la lista de procesos.

Dingo oculta los valores de los encabezados en la configuración presentada y en los errores. Las solicitudes con credenciales deben utilizar un origen HTTPS o de loopback. Rechaza los nombres y valores de encabezado mal formados y los nombres reservados para el transporte o la solicitud. Si una redirección cambia el esquema o el host, elimina las credenciales antes de seguirla.

### Producción de bloques

Dingo v0.93.0 no admite `ForgePrimaryChainTipToleranceSlots` ni `forgePrimaryChainTipToleranceSlots` en YAML, CLI o variables de entorno. Elimina esos ajustes sin sustituirlos por otro campo.

Configura opcionalmente `forgeAppliedTipStalenessSlots` en YAML, `--forge-applied-tip-staleness-slots` en CLI o `DINGO_FORGE_APPLIED_TIP_STALENESS_SLOTS` en el entorno. El valor predeterminado `0` desactiva el límite. Dingo solo lo evalúa cuando existe un objetivo de origen corroborado y lo ignora si el objetivo es desconocido.

#### Socket del agente KES de Shelley

La opción `--shelley-kes-agent-socket` admite rutas de sockets del sistema de archivos y direcciones abstractas de Linux. Dingo resuelve las rutas relativas una vez al construir el cliente y reutiliza la ruta resuelta al reconectar. Conserva las direcciones abstractas con prefijo `@`, rechaza las direcciones literales con prefijo NUL al construir el cliente y aplica los límites de longitud de sockets de la plataforma.

#### Agente KES remoto y recarga de credenciales

| Configuración | Clave YAML | Opción CLI | Variable de entorno | Valor predeterminado | Validación y comportamiento |
| --- | --- | --- | --- | --- | --- |
| Dirección del agente KES remoto | `shelleyKesAgentAddress` | `--shelley-kes-agent-address` | `CARDANO_SHELLEY_KES_AGENT_ADDRESS` | Vacía | Configura una dirección `host:port` para seleccionar el agente remoto e implica el modo `sign`. Las demás opciones remotas requieren esta dirección. No la combines con `shelleyKesKey` ni con `shelleyKesAgentSocket`. |
| Archivo del certificado de cliente | `shelleyKesAgentClientCertFile` | `--shelley-kes-agent-client-cert-file` | `CARDANO_SHELLEY_KES_AGENT_CLIENT_CERT_FILE` | Vacío | Configura un archivo PEM opcional para el certificado TLS de cliente. Configura también `shelleyKesAgentClientKeyFile`. Requiere `shelleyKesAgentAddress`. |
| Archivo de la clave de cliente | `shelleyKesAgentClientKeyFile` | `--shelley-kes-agent-client-key-file` | `CARDANO_SHELLEY_KES_AGENT_CLIENT_KEY_FILE` | Vacío | Configura un archivo PEM opcional para la clave TLS de cliente. Configura también `shelleyKesAgentClientCertFile`. Requiere `shelleyKesAgentAddress`. |
| Fijación SPKI SHA-256 del servidor | `shelleyKesAgentServerSpkiSha256` | `--shelley-kes-agent-server-spki-sha256` | `CARDANO_SHELLEY_KES_AGENT_SERVER_SPKI_SHA256` | Vacía | Configura opcionalmente la fijación TLS de la clave pública del servidor con `64` caracteres hexadecimales. Requiere `shelleyKesAgentAddress`. No combines este ajuste con `shelleyKesAgentPlaintext`. |
| Conexión de texto sin cifrar | `shelleyKesAgentPlaintext` | `--shelley-kes-agent-plaintext` | `CARDANO_SHELLEY_KES_AGENT_PLAINTEXT` | `false` | Selecciona TCP sin cifrar. Requiere `shelleyKesAgentAddress`. No combines este ajuste con `shelleyKesAgentServerSpkiSha256`, el certificado TLS ni la clave TLS de cliente. El agente remoto solo admite el modo `sign`. |
| Intervalo de observación de claves de Shelley | `shelleyKeyWatchInterval` | `--shelley-key-watch-interval` | `CARDANO_SHELLEY_KEY_WATCH_INTERVAL` | `0`, desactivado | Configura un valor distinto de cero de al menos `1s`. Dingo observa los archivos de credenciales y los recarga en su lugar con archivos de claves locales o con un agente KES en modo `sign`. En modo `serve-key`, Dingo ignora el ajuste y registra una advertencia. |

Con una dirección remota, Dingo utiliza TLS 1.3 de forma predeterminada. La fijación del servidor y el certificado y la clave PEM del cliente son opcionales; Dingo verifica el certificado del servidor cuando la configuración no incluye la fijación y exige el par completo de credenciales del cliente cuando la configuración incluye una de ellas. `shelleyKesAgentPlaintext` selecciona la alternativa TCP sin cifrar y no admite esos ajustes TLS.

Con `shelleyKeyWatchInterval`, Dingo espera dos sondeos consecutivos con el mismo cambio antes de aplicarlo. `SIGHUP` también inicia una recarga, y una oferta de certificado operativo más reciente de un agente remoto inicia la recarga en modo `sign`. Dingo valida las nuevas credenciales antes de sustituir las activas; si cambia la clave VRF, Dingo exige reiniciar el nodo. Si falla una recarga de archivos, Dingo conserva el cambio pendiente y reintenta la recarga en el siguiente sondeo.

### Proveedor Kupo

El proveedor Kupo opcional se configura bajo `plugins.api.kupo`. Utiliza `provider: "builtin"` para seleccionar el integrado. Kupo requiere `storageMode: api`; `--kupo-provider` selecciona el proveedor desde CLI. Un valor `0` en `plugins.api.kupo.config.port` desactiva el servicio.

El ejemplo también contiene patrones de despliegue comentados para nodos relay, API/datos, productores, archivos, caducidad del historial y desarrollo. Revisa sus advertencias antes de activar ajustes que alteren el consenso, el forjado o la exposición a la red.


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
