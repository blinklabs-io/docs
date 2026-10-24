---
title: Referencia de configuración
description: Referencia de YAML y variables de entorno de cDNSd.
---

cDNSd lee un archivo YAML opcional y después aplica las variables de entorno, que tienen prioridad sobre los valores YAML.

## Registros, DNS y observabilidad

| Clave YAML | Variable de entorno | Propósito | Predeterminado |
| --- | --- | --- | --- |
| `logging.debug` | `LOGGING_DEBUG` | Activa los registros de depuración. | `false` |
| `logging.queryLog` | `LOGGING_QUERY_LOG` | Registra cada consulta DNS. | `true` |
| `dns.address` | `DNS_LISTEN_ADDRESS` | Dirección de escucha DNS; vacío significa todas las interfaces. | vacío |
| `dns.port` | `DNS_LISTEN_PORT` | Puerto DNS UDP/TCP. | `8053` |
| `dns.tlsPort` | `DNS_LISTEN_TLS_PORT` | Puerto DNS-over-TLS; TLS requiere las rutas tanto de la clave como del certificado. | `8853` |
| `dns.recursionEnabled` | `DNS_RECURSION` | Permite consultas recursivas de nombres ajenos a la blockchain. | `false` |
| `dns.rootHints` | `DNS_ROOT_HINTS` | Contenido de pistas de servidores raíz proporcionado directamente. | integrado |
| `dns.rootHintsFile` | `DNS_ROOT_HINTS_FILE` | Archivo con las pistas de servidores raíz. | vacío |
| `dns.retryCount` | `DNS_RETRY_COUNT` | Número de reintentos de consulta al servidor superior. | `3` |
| `dns.retryDelayMs` | `DNS_RETRY_DELAY_MS` | Espera entre reintentos en milisegundos. | `100` |
| `dns.queryTimeoutMs` | `DNS_QUERY_TIMEOUT_MS` | Tiempo límite de consulta al servidor superior en milisegundos. | `5000` |
| `dns.soa.mname` | `DNS_SOA_MNAME` | Servidor de nombres principal del registro SOA. | `ns1.cdnsd.localhost.` |
| `dns.soa.rname` | `DNS_SOA_RNAME` | Buzón responsable del registro SOA. | `hostmaster.cdnsd.localhost.` |
| `dns.soa.refresh` | `DNS_SOA_REFRESH` | Intervalo de actualización de SOA. | `3600` |
| `dns.soa.retry` | `DNS_SOA_RETRY` | Intervalo de reintento de SOA. | `900` |
| `dns.soa.expire` | `DNS_SOA_EXPIRE` | Intervalo de caducidad de SOA. | `604800` |
| `dns.soa.minimum` | `DNS_SOA_MINIMUM` | Valor mínimo/TTL de SOA. | `86400` |
| `metrics.address` | `METRICS_LISTEN_ADDRESS` | Dirección de escucha de métricas de Prometheus. | vacío |
| `metrics.port` | `METRICS_LISTEN_PORT` | Puerto de métricas de Prometheus. | `8081` |
| `debug.address` | `DEBUG_ADDRESS` | Dirección de escucha HTTP de depuración y pprof. | `localhost` |
| `debug.port` | `DEBUG_PORT` | Puerto HTTP de depuración y pprof; `0` lo desactiva. | `0` |

`METRICS_LISTEN_ADDRESS=127.0.0.1` es el ajuste más seguro para uso local. Una dirección vacía expone el endpoint `/metrics` sin autenticación en todas las interfaces.

## Indexación, estado y TLS

| Clave YAML | Variable de entorno | Propósito | Predeterminado |
| --- | --- | --- | --- |
| `indexer.network` | `INDEXER_NETWORK` | Nombre de red Cardano, como `preprod` o `mainnet`. | según el perfil |
| `indexer.networkMagic` | `INDEXER_NETWORK_MAGIC` | Magic de red Cardano cuando sea necesario. | `0` |
| `indexer.address` | `INDEXER_TCP_ADDRESS` | Dirección TCP del nodo Cardano. | vacío |
| `indexer.socketPath` | `INDEXER_SOCKET_PATH` | Ruta del socket IPC del nodo Cardano. | vacío |
| `indexer.interceptHash` | `INDEXER_INTERCEPT_HASH` | Hash del bloque donde comenzar o reanudar la sincronización. | según el perfil |
| `indexer.interceptSlot` | `INDEXER_INTERCEPT_SLOT` | Slot donde comenzar o reanudar la sincronización. | según el perfil |
| `indexer.verify` | `INDEXER_VERIFY` | Activa la verificación adicional del indexador. | `true` |
| `indexer.handshakeAddress` | `INDEXER_HANDSHAKE_ADDRESS` | Dirección del par Handshake. | vacío |
| `state.dir` | `STATE_DIR` | Directorio persistente de estado de BadgerDB. | `./.state` |
| `tls.certFilePath` | `TLS_CERT_FILE_PATH` | Certificado TLS para DNS-over-TLS. | vacío |
| `tls.keyFilePath` | `TLS_KEY_FILE_PATH` | Clave privada TLS para DNS-over-TLS. | vacío |
| `profiles` | `PROFILES` | Nombres de perfiles activos separados por comas. | `ada-preprod,auto-preprod` |

DNS-over-TLS solo se inicia si `TLS_CERT_FILE_PATH` y `TLS_KEY_FILE_PATH` apuntan a archivos legibles. Los perfiles pueden proporcionar una red y un punto de inicio de sincronización; consulta la lista actual en el [código de los perfiles](https://github.com/blinklabs-io/cdnsd/blob/main/internal/config/profile.go).
