---
title: API y servicios de archivo de Dingo
description: Configura las API de aplicaciones de Dingo y el tráfico de archivo entre nodos mediante Bark.
---

## API de aplicaciones

Las interfaces REST compatibles con Blockfrost, Mesh/Rosetta, UTxO RPC y Kupo de Dingo atienden a clientes de aplicaciones. Requieren `storageMode: api`, que conserva el historial de transacciones para las consultas. Configura cada servicio bajo `plugins.api`; establece su puerto en `0` para desactivarlo.

| Interfaz | Protocolo | Puerto predeterminado |
| --- | --- | ---: |
| API compatible con Blockfrost | HTTP/REST | `3000` |
| Mesh (Rosetta) | HTTP/REST | `8080` |
| UTxO RPC | Connect/gRPC y HTTP | `9090` |
| API compatible con Kupo | HTTP/REST | Predeterminado: `port: 0` (desactivado); ejemplo del proveedor integrado: `1442` |

Kupo utiliza el proveedor integrado. Actívalo con `storageMode: api` y un puerto distinto de cero. Por ejemplo:

```yaml
storageMode: api
plugins:
  api:
    kupo:
      provider: builtin
      config:
        port: 1442
```

La opción `--kupo-provider=builtin` selecciona el proveedor integrado desde la línea de comandos. La clave YAML del puerto es `plugins.api.kupo.config.port`; la variable de entorno correspondiente es `DINGO_PLUGINS_API_KUPO_CONFIG_PORT`. El proveedor sigue el ciclo normal de inicio y parada del nodo.

Por ejemplo, activa los proveedores integrados de Blockfrost y UTxO RPC en `dingo.yaml`:

```yaml
storageMode: api
plugins:
  api:
    blockfrost:
      provider: builtin
      config:
        port: 3000
        host: 127.0.0.1
        authToken: "<token>"
        maxConcurrentMutations: 4
        maxConcurrentMutationsPerClient: 1
    utxorpc:
      provider: builtin
      config:
        port: 9090
```

### Solicitudes de modificación de Blockfrost

El proveedor integrado de Blockfrost escucha en `127.0.0.1` de forma predeterminada. No hereda el `bindAddr` raíz salvo que `plugins.api.blockfrost.config.host` esté explícitamente vacío. Establece un host concreto para exponerlo en otra interfaz.

Configura un secreto en `plugins.api.blockfrost.config.authToken` antes de enviar solicitudes de modificación. Un `authToken` vacío mantiene cerradas todas las rutas de modificación. Los valores predeterminados son `4` para `maxConcurrentMutations` y `1` para `maxConcurrentMutationsPerClient`. Establece ambos valores en enteros positivos y mantén `maxConcurrentMutationsPerClient` menor o igual que `maxConcurrentMutations`.

Las siguientes rutas requieren el token de modificación configurado:

| Ruta | Autenticación y admisión |
| --- | --- |
| `POST /api/v0/tx/submit` | Requiere un token de modificación válido y consume capacidad de admisión de modificaciones. |
| `POST /api/v0/utils/txs/evaluate` | Requiere un token de modificación válido y consume capacidad de admisión de modificaciones. |
| `POST /api/v0/utils/txs/evaluate/utxos` | Requiere un token de modificación válido y consume capacidad de admisión de modificaciones. |

Envía el token mediante uno de estos encabezados: `project_id: <token>`, `X-Blockfrost-Project-Id: <token>` o `Authorization: Bearer <token>`. Si el token falta o no es válido, se devuelve HTTP `401` con `WWW-Authenticate: Bearer`. Tras la autenticación, Dingo solo acepta la solicitud cuando existe capacidad tanto en el límite global del servidor como en el del cliente remoto. Comprueba la capacidad antes de leer el cuerpo de la solicitud; si se supera, devuelve HTTP `429` con `Retry-After: 1`.

Antes de exponer modificaciones autenticadas en un host ajeno a loopback, configura TLS en el servidor mediante `plugins.api.blockfrost.config.tls`. Sin TLS de servidor, Dingo rechaza el inicio de un host ajeno a loopback con acceso autenticado a modificaciones. Conserva el host de loopback predeterminado salvo que decidas expresamente permitir el acceso externo a estas operaciones.

Este sitio incluye la referencia de configuración completa de v0.87.0 y el archivo [`dingo.yaml.example`](https://raw.githubusercontent.com/blinklabs-io/dingo/v0.87.0/dingo.yaml.example) correspondiente. Utiliza archivos de configuración de la misma versión que el programa; las opciones de los proveedores pueden cambiar entre versiones.

## Acceso seguro a las API

La dirección de escucha compartida de las API se aplica a los proveedores seleccionados, incluido Kupo. Los ajustes `api.tls` y `api.auth` definen valores predeterminados compartidos. Cada proveedor puede sustituir cualquiera de estas políticas en su bloque `plugins.api.<name>.config`. La configuración TLS específica del proveedor tiene prioridad sobre la compartida.

La autenticación compartida de las API está desactivada de forma predeterminada. La política de modificación del proveedor integrado de Blockfrost es independiente: sus rutas de modificación requieren el `authToken` del proveedor incluso cuando la autenticación compartida está desactivada. Los límites de admisión de modificaciones solo se aplican a esas rutas de Blockfrost, no a todas las rutas del servicio.

Cuando actives la autenticación por token, envía `Authorization: Bearer <token>`; los clientes de Blockfrost también pueden usar el encabezado `project_id`. Las rutas HTTP y Connect/gRPC de UTxO RPC también utilizan el token Bearer.

La autenticación se aplica a todas las rutas del servicio, incluidas las comprobaciones de estado. Configura las sondas para enviar el token o utiliza una comprobación TCP si no pueden adjuntar credenciales. Dingo rechaza al inicio los pares de certificado y clave TLS incompletos y no registra el contenido de tokens ni claves.

También puedes situar las API detrás de un proxy inverso o una pasarela de API. Elige un único lugar para terminar TLS y autenticar las solicitudes, y ajusta la política del servicio de Dingo a esa implementación.

## Tráfico de archivo de Bark

Bark es un protocolo de archivo entre nodos Dingo, independiente de las API de aplicaciones. Un nodo de archivo puede servir bloques históricos desde almacenamiento de objetos compatible con URL firmadas. Un nodo con caducidad del historial puede recurrir a un archivo Bark cuando caduquen sus archivos de bloques locales antiguos; consulta [Arranque y mantenimiento de datos](/es/guides/dingo/007-bootstrap-and-data-maintenance/).

Bark no incorpora autenticación para el tráfico de archivo ordinario. Mantenlo en una red de confianza. Ese tráfico sigue separado del `LifecycleService` opcional, cuyas llamadas RPC requieren TLS mutuo.

### LifecycleService de Bark

Bark puede exponer un `LifecycleService` remoto para gestionar el ciclo de vida del nodo. Está desactivado de forma predeterminada. Actívalo con `barkLifecycleEnabled: true`, `--bark-lifecycle-enabled` o `DINGO_BARK_LIFECYCLE_ENABLED=true`.

Antes de iniciar el nodo, configura estos ajustes:

- Establece `barkPort` en un puerto distinto de cero mediante `--bark-port` o `DINGO_BARK_PORT`.
- Establece `barkClientCaFilePath` en el paquete de CA en formato PEM que verifica los certificados de cliente, mediante `--bark-client-ca-file-path` o `DINGO_BARK_CLIENT_CA_FILE_PATH`.
- Configura `tlsCertFilePath` y `tlsKeyFilePath` con el certificado y la clave privada del servidor Bark. Utiliza `--tls-cert-file-path` y `--tls-key-file-path`, o las variables de entorno `TLS_CERT_FILE_PATH` y `TLS_KEY_FILE_PATH`.
- Añade una o más huellas SHA-256 de certificados de cliente a `barkLifecycleOperatorCertificateFingerprints` mediante `--bark-lifecycle-operator-certificate-fingerprints` o `DINGO_BARK_LIFECYCLE_OPERATOR_CERTIFICATE_FINGERPRINTS`. Esta lista de operadores permitidos es independiente de la de DatabaseService.

La CA configurada debe verificar el certificado de cliente en cada llamada RPC de LifecycleService. `GetStatus` es de solo lectura y únicamente necesita ese certificado verificado. `Stop` y `Restart` son operaciones destructivas: `Stop` solicita una parada ordenada y `Restart` solicita una parada ordenada seguida de un reinicio. Ambas requieren una huella de certificado de `barkLifecycleOperatorCertificateFingerprints`. `Restart` no está disponible en plataformas que no sean Unix.

Cuando el servicio está activado y `barkHost` está vacío, Bark escucha en loopback de forma predeterminada. Configura `barkHost`, `--bark-host` o `DINGO_BARK_HOST` para exponerlo en otra interfaz. Una dirección de escucha más amplia no sustituye la verificación del certificado de cliente ni la lista de operadores permitidos.

Bark solo acepta URL firmadas de descarga de bloques cuando su origen HTTPS normalizado coincide con el origen HTTPS normalizado configurado o con un origen de descarga permitido explícitamente. El origen normalizado incluye el esquema, el host en minúsculas y el puerto efectivo. Bark aplica la misma política a los destinos de las redirecciones.

De forma predeterminada, `barkBlockDownloadAllowPrivateAddresses` es `false`, por lo que Bark rechaza los destinos de descarga de bloques cuya dirección resuelta sea privada o de uso especial. Establece `barkBlockDownloadAllowPrivateAddresses` en `true`, usa `--bark-block-download-allow-private-addresses` o configura `DINGO_BARK_BLOCK_DOWNLOAD_ALLOW_PRIVATE_ADDRESSES=true` para permitir esas direcciones únicamente en los destinos de descarga de bloques. Esta opción no desactiva la lista de orígenes permitidos, la exigencia de HTTPS ni la validación de redirecciones.

Para las solicitudes de descarga de bloques, Bark no utiliza los ajustes de proxy HTTP del entorno ni las funciones de conexión proporcionadas por el llamador. Estas reglas solo se aplican a las descargas de bloques; el cliente RPC de Bark, configurado por separado, sigue gestionando las llamadas RPC de archivo.

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
