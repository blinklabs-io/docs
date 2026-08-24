---
title: Guía de inicio rápido
description: Descripción general del inicio rápido de Dingo.
---

# Dingo

Un nodo de datos de la blockchain Cardano escrito en Go que participa activamente en las comunicaciones de red en la blockchain Cardano utilizando la familia de mini-protocolos Node-to-Node de la Red Ouroboros.

⚠️ Este es un trabajo en progreso y actualmente está en desarrollo activo

<br>

***

En esta guía te guiaremos a través de la descarga del binario de Dingo y todos los pasos necesarios para ejecutar el nodo Dingo en la red Cardano Preview. Para comenzar, sigue los pasos a continuación.

<br>

✅ Esta guía asume una configuración típica de Linux. Por favor ajusta los comandos y rutas según sea necesario.

***

<br>

## Paso 1 - Descargar Binario de Dingo
<br>

Descarga la última versión desde la página de <a href="https://github.com/blinklabs-io/dingo/releases" target="_blank">versiones de Dingo</a>.

⚠️ Ajusta la versión y la arquitectura para que coincidan con tu sistema.

```bash
mkdir -p ~/dingo
cd ~/dingo
wget https://github.com/blinklabs-io/dingo/releases/download/v0.70.0/dingo-v0.70.0-linux-amd64.tar.gz -O - | tar -xz
```

Puedes verificar que el binario funciona ejecutando:

```bash
./dingo version
```

***

<br>

## Paso 2 - Crear archivo de configuración dingo.yaml

Dingo incluye configuraciones de red de Cardano integradas (archivos de génesis, config.json) para preview, preprod y mainnet. No necesitas descargarlas por separado.

Crea un archivo `dingo.yaml` en tu directorio dingo. La variable `$HOME` se expandirá automáticamente a la ruta de tu directorio de inicio:

```bash
cat <<EOF > ~/dingo/dingo.yaml
# Ruta de datos compartida para los almacenes locales de blob y metadata.
databasePath: "$HOME/dingo/.dingo"

# Plugins de almacenamiento y API
plugins:
  storage:
    blob:
      provider: "badger"
      config:
        # Directorio de datos opcional de Badger. Cuando no se define, se usa databasePath.
        # dataDir: "$HOME/dingo/.dingo/badger"
    metadata:
      provider: "sqlite"
      config:
        # Directorio de datos opcional de SQLite. Cuando no se define, se usa databasePath.
        # dataDir: "$HOME/dingo/.dingo/metadata.db"

  api:
    blockfrost:
      provider: "builtin"
      config:
        port: 0
    mesh:
      provider: "builtin"
      config:
        port: 0
    utxorpc:
      provider: "builtin"
      config:
        port: 0

# Mempool
# `plugins.mempool.config.capacity` es una anulación opcional, no un ajuste requerido.
# Predeterminado: 1 MiB para el modo Praos y el modo serve normal, y 25 MiB para el modo Musashi.
# Deja la clave comentada o omítela para usar el valor predeterminado del modo.
# plugins:
#   mempool:
#     config:
#       capacity: 1048576

# Mithril
mithril:
  aggregatorUrl: ""
  cleanupAfterLoad: true
  enabled: true
  verifyCertificates: true

# Network
bindAddr: "0.0.0.0"
metricsPort: 12798
debugPort: 0
debugBindAddr: "127.0.0.1"
targetNumberOfRootPeers: 0
network: "preview"
privateBindAddr: "127.0.0.1"
privatePort: 3002
relayPort: 3001
socketPath: "$HOME/dingo/dingo.socket"

# Storage
barkBaseUrl: ""
barkPort: 0
storageMode: "core"
EOF
```

> 📝 Deja `debugPort` en `0` salvo que se necesite perfilado. `debugPort` controla un listener `pprof` opcional, sigue separado de `metricsPort` y permanece deshabilitado con `0`. `pprof` no tiene autenticación ni TLS y usa la dirección de bucle local `127.0.0.1`, independientemente de `bindAddr` y `privateBindAddr`. Para exponerlo externamente, establece explícitamente `debugBindAddr` en YAML, `DINGO_DEBUG_BIND_ADDR` o `--debug-bind-addr` y aplica controles de red. La sincronización de Mithril usa la misma configuración.

> 📝 `targetNumberOfRootPeers` define el objetivo de nodos raíz de Dingo. Cuando el operador establece un valor distinto de `0`, Dingo sustituye el objetivo de Cardano; con `0`, Dingo usa el objetivo de Cardano como alternativa. Sin un objetivo de Cardano distinto de cero, Dingo usa `60` como valor efectivo predeterminado. Un valor positivo limita los nodos raíz públicos seleccionados y conserva los nodos raíz locales; `-1` no aplica ningún límite. Dingo también acepta `DINGO_TARGET_ROOT_PEERS` y `--target-root-peers` para establecer este valor.

> 💡 Las APIs solo arrancan dentro de `storageMode: "api"`, y asignar `0` a un puerto desactiva esa API.

```yaml
midnight:
  authTokenPolicyId: ""
storageMode: "api"
plugins:
  api:
    blockfrost:
      provider: "builtin"
      config:
        port: 3000
    mesh:
      provider: "builtin"
      config:
        port: 8080
    utxorpc:
      provider: "builtin"
      config:
        port: 9090
```

### Configuración opcional del registro de tokens de la API

En el modo de almacenamiento API, añade este bloque de nivel superior para usar metadatos CIP-26 locales en las respuestas de activos de Blockfrost:

```yaml
tokenRegistry:
  enabled: false
```

Dingo establece `tokenRegistry.enabled` en `false` de forma predeterminada y solo lo aplica con `storageMode: "api"`. Aplica la migración de base de datos v3, `token-registry-metadata`, antes de establecerlo en `true`. La primera sincronización de mainnet descarga aproximadamente 240 MB; las comprobaciones posteriores usan solicitudes condicionales.

Configura los demás campos de `tokenRegistry` de la siguiente manera:

- `sourceUrl`: Un valor vacío selecciona el registro de la red configurada. Establece una URL para usar un espejo.
- `interval`: El intervalo de comprobación. El valor predeterminado es `6h`; los valores inferiores a `1m` usan el mínimo de `1m`.
- `requestTimeout`: El tiempo de espera para la descarga completa. El valor predeterminado es `15m`.
- `userAgent`: El agente de usuario HTTP. Un valor vacío usa `dingo-token-registry/1`.
- `maxBytes`: El límite de la descarga comprimida. El valor predeterminado es `768 MiB`.
- `maxEntryBytes`: El límite para una entrada de mapeo. El valor predeterminado es `4 MiB`.
- `storeLogos`: Guarda los logotipos del registro cuando vale `true`; el valor predeterminado es `false` porque los logotipos representan aproximadamente el 90 % de los bytes del registro.
- `allowPrivateAddresses`: Permite solicitudes del registro a direcciones privadas, de bucle local y de enlace local cuando vale `true`; el valor predeterminado es `false` para la protección contra SSRF. Actívalo solo cuando se necesite una fuente privada del registro.

La configuración también acepta estas variables de entorno:

`DINGO_TOKEN_REGISTRY_ENABLED`, `DINGO_TOKEN_REGISTRY_SOURCE_URL`, `DINGO_TOKEN_REGISTRY_INTERVAL`, `DINGO_TOKEN_REGISTRY_REQUEST_TIMEOUT`, `DINGO_TOKEN_REGISTRY_USER_AGENT`, `DINGO_TOKEN_REGISTRY_MAX_BYTES`, `DINGO_TOKEN_REGISTRY_MAX_ENTRY_BYTES`, `DINGO_TOKEN_REGISTRY_STORE_LOGOS` y `DINGO_TOKEN_REGISTRY_ALLOW_PRIVATE_ADDRESSES`.

Los indicadores CLI equivalentes son `--token-registry-enabled`, `--token-registry-source-url`, `--token-registry-interval`, `--token-registry-request-timeout`, `--token-registry-user-agent`, `--token-registry-max-bytes`, `--token-registry-max-entry-bytes`, `--token-registry-store-logos` y `--token-registry-allow-private-addresses`.

> 📝 `midnight.authTokenPolicyId` solo se aplica en el modo de almacenamiento API con indexación de Midnight. Dejarlo vacío mantiene el comportamiento predeterminado más amplio para la coincidencia de tokens de autenticación.

### Seguridad opcional de la API

La configuración permite aplicar valores predeterminados compartidos de TLS y autenticación a cada proveedor seleccionado en `plugins.api.*` mediante `api.tls` y `api.auth`:

```yaml
api:
  tls:
    mode: server
    certFilePath: "/run/secrets/api.crt"
    keyFilePath: "/run/secrets/api.key"
  auth:
    mode: token
    tokenFilePath: "/run/secrets/api-token"
```

Dingo combina los campos de `plugins.api.<name>.config.tls` y `plugins.api.<name>.config.auth` por proveedor, de modo que cada campo puede anular el valor compartido. Un proveedor puede establecer explícitamente `mode: disabled` para desactivar una política heredada. Los modos TLS válidos son `disabled` y `server`; `server` requiere `certFilePath` y `keyFilePath` completos. Los modos de autenticación válidos son `disabled` y `token`; `token` requiere exactamente una fuente, `token` o `tokenFilePath`. El ejemplo usa `tokenFilePath` para evitar incluir el secreto en la configuración.

Las solicitudes autenticadas deben incluir `Authorization: Bearer <token>`. Blockfrost también acepta `project_id`. La solicitud previa CORS `OPTIONS` no requiere autenticación, pero todas las demás solicitudes requieren autenticación. Dingo acepta estos enlaces de configuración de nivel superior mediante `--api-tls-mode`, `--api-tls-cert-file-path`, `--api-tls-key-file-path`, `--api-auth-mode` y `--api-auth-token-file-path`, o mediante `DINGO_API_TLS_MODE`, `DINGO_API_TLS_CERT_FILE_PATH`, `DINGO_API_TLS_KEY_FILE_PATH`, `DINGO_API_AUTH_MODE` y `DINGO_API_AUTH_TOKEN_FILE_PATH`.

Los campos raíz heredados `tlsCertFilePath` y `tlsKeyFilePath` solo proporcionan compatibilidad para UTxO RPC. No establecen valores predeterminados compartidos para Blockfrost ni Mesh.

> 💡 Configurar `block-cache-size` e `index-cache-size` a 0 con `compression: false` usa la caché de páginas del SO (mmap) en lugar de las cachés internas de BadgerDB. Esto reduce drásticamente el uso de memoria.

***

<br>

## Paso 3 - Abrir Puertos

Cubriremos cómo agregar reglas de firewall UFW para los puertos que Dingo necesita.

> 💡 Consejo: UFW significa Uncomplicated Firewall y se usa para administrar reglas de firewall iptables (netfilter).

Para ver qué puertos están actualmente abiertos:

```bash
sudo ufw status numbered
```

### Agregar puerto 3001 para comunicación Ouroboros Node to Node (NtN)

```bash
sudo ufw allow 3001/tcp
```

***

<br>

## Paso 4 - Iniciar desde instantánea de Mithril

Dingo tiene un cliente Mithril integrado que descarga y carga una instantánea automáticamente. Esto ahorra horas de tiempo de sincronización en comparación con reproducir la cadena desde el génesis.

Ejecuta el siguiente comando desde tu directorio dingo:

```bash
cd ~/dingo
./dingo mithril sync --config ~/dingo/dingo.yaml
```

> 📝 `mithril.downloadMaxTransientRetries` controla los reintentos ante fallos transitorios en la descarga de arranque, como tiempos de espera de TLS, respuestas HTTP 429 y respuestas HTTP 5xx. El ejemplo usa el valor predeterminado de `10`.

Dingo:
1. Descargará la última instantánea de Mithril para tu red configurada
2. Verificará la cadena de certificados
3. Cargará la instantánea en la base de datos

Esto toma aproximadamente 10-15 minutos dependiendo de tu sistema y velocidad de red.

> 📝 Si omites este paso, Dingo se sincronizará desde el génesis al iniciarse, lo que toma significativamente más tiempo.

***

<br>

## Paso 5 - Iniciar Dingo

Una vez que la instantánea de Mithril se haya cargado, inicia el nodo:

```bash
cd ~/dingo
./dingo serve --config ~/dingo/dingo.yaml
```

Deberías ver la salida del registro mostrando el nodo conectándose a los pares y sincronizando los bloques restantes para alcanzar la punta de la cadena.

***

<br>

### ¿Interesado en usar un servicio systemd para ejecutar un nodo Dingo y maximizar el tiempo de actividad reiniciando automáticamente el nodo Dingo cuando la computadora se reinicia?
[Consulta nuestra guía sobre cómo crear un servicio de inicio para Dingo](../003-create-start-up-service).

***

<br>

### ¡Felicidades, estás listo para comenzar a usar el nodo Dingo!

[Aprende cómo interactuar con Dingo usando la CLI de Cardano](../004-using-dingo-with-cardano-cli).


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
