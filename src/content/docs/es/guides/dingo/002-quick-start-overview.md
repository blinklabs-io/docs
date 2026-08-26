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

### Configuración de la comprobación de cuentas de paridad de Koios

Cuando el operador activa `koiosParity.enabled`, el observador integrado de Dingo comprueba las recompensas por cuenta mediante `koiosParity.accounts`. Dingo establece esta opción en `true` de forma predeterminada; establece el valor en `false` para conservar únicamente la comprobación por grupo:

```yaml
koiosParity:
  enabled: true
  accounts: false
```

Los equivalentes de Dingo son `--koios-parity-accounts` y `DINGO_KOIOS_PARITY_ACCOUNTS`. La precedencia de configuración es CLI, variable de entorno, YAML y valor predeterminado. A diferencia del observador integrado, el ejecutable independiente `koios-parity` no comprueba cuentas de forma predeterminada.

En `koios-parity`, activa la comprobación de cuentas con `koios-parity --accounts` o establece `KOIOS_PARITY_ACCOUNTS` en `true` o `1`. Esta fase genera un volumen de solicitudes a Koios considerablemente mayor. Si el operador especifica explícitamente `--accounts`, su valor, incluido `--accounts=false`, tiene prioridad sobre `KOIOS_PARITY_ACCOUNTS`.

El indicador independiente `--grace-hours` acepta valores no negativos. Su valor predeterminado normal es `24` horas; establece `--grace-hours=0` para desactivar explícitamente la ventana de gracia o retraso de referencia. La cobertura incompleta de cuentas produce un resultado `ERROR`.

> 📝 Las URL del agregador y de los artefactos de Mithril deben usar HTTPS de forma predeterminada. Mantén `mithril.allowInsecureHttp: false` en producción. Solo para desarrollo local o pruebas, establece este valor en `true`; las opciones equivalentes son `--mithril-allow-insecure-http` y `DINGO_MITHRIL_ALLOW_INSECURE_HTTP`. No habilites esta opción en producción.

> ⚠️ `delegatorInactivityEnabled` controla el mecanismo de inactividad que afecta al consenso para las escrituras `account_withdrawal_witness` de CIP-0163 y su valor predeterminado es `false`. Cuando esté habilitado, establece `delegatorInactivity` como un número entero de épocas entre `1` y `10000`; el ejemplo usa el valor predeterminado de `90`. Todos los nodos de la red deben usar los mismos valores. El arranque desde una instantánea de Mithril es incompatible con este mecanismo porque Mithril no puede reconstruir el estado de expiración de las cuentas de recompensas importado; las configuraciones habilitadas deben sincronizarse desde el génesis.

> 📝 El ejemplo muestra los indicadores CLI y las variables de entorno correspondientes a ambos campos de nivel superior.

> 📝 Deja `debugPort` en `0` salvo que se necesite perfilado. `debugPort` controla un listener `pprof` opcional, sigue separado de `metricsPort` y permanece deshabilitado con `0`. `pprof` no tiene autenticación ni TLS y usa la dirección de bucle local `127.0.0.1`, independientemente de `bindAddr` y `privateBindAddr`. Para exponerlo externamente, establece explícitamente `debugBindAddr` en YAML, `DINGO_DEBUG_BIND_ADDR` o `--debug-bind-addr` y aplica controles de red. La sincronización de Mithril usa la misma configuración.

> 📝 Con `plugins.storage.metadata.provider` en `postgres`, `statementTimeout` limita cada sentencia y `lockTimeout` limita la espera para adquirir bloqueos; estos campos aceptan valores de duración como `30s`. PostgreSQL convierte las duraciones positivas en los ajustes de sesión `statement_timeout` y `lock_timeout`, expresados en milisegundos. Con el proveedor `mysql`, `statementTimeout` limita las sentencias `SELECT` de solo lectura de nivel superior mediante `max_execution_time` en milisegundos, `lockTimeout` configura `innodb_lock_wait_timeout` en segundos enteros y redondea hacia arriba las duraciones inferiores a un segundo, y `readTimeout` y `writeTimeout` establecen límites de tiempo de E/S de transporte usando los valores de duración indicados. Dingo asigna `0` como valor predeterminado a todos los campos, rechaza los valores negativos e ignora todos estos campos cuando la configuración incluye un `dsn` explícito.

> 📝 Antes del inicio, Dingo conserva un `socketPath` existente. Dingo solo elimina un socket Unix obsoleto confirmado. Un archivo normal, enlace simbólico, directorio, socket activo, comprobación ambigua o error de eliminación hace que el inicio falle. La configuración debe mantener la ruta ausente o incluir únicamente un socket Unix obsoleto confirmado que Dingo pueda eliminar.


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
