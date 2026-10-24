---
title: Guía de inicio rápido
description: Resumen del inicio rápido de Dingo.
---

# Dingo

Dingo es un nodo de la blockchain de Cardano escrito en Go que participa activamente en las comunicaciones de la red mediante la familia de miniprotocolos Ouroboros de nodo a nodo.

⚠️ Dingo sigue en desarrollo intensivo.

Esta guía explica cómo descargar el binario y poner en marcha un nodo Dingo en la red Cardano Preview.

✅ Se presupone una instalación Linux típica. Ajusta los comandos y las rutas según sea necesario.

## Paso 1 - Descargar el binario de Dingo

Descarga la última versión desde [GitHub](https://github.com/blinklabs-io/dingo/releases).

⚠️ Ajusta la versión y la arquitectura a tu sistema.

```
mkdir -p ~/dingo
cd ~/dingo
wget https://github.com/blinklabs-io/dingo/releases/download/v0.87.1/dingo-v0.87.1-linux-amd64.tar.gz -O - | tar -xz
```

Comprueba que el binario funcione:

```
./dingo version
```

### Alternativa: instalar con npm

El paquete `@blinklabs/dingo` requiere Node.js 22 o posterior y `tar`. Admite Linux, FreeBSD y macOS en x64/amd64 o arm64. Durante la instalación, descarga la versión correspondiente de Dingo y verifica su suma SHA-256.

El instalador solo acepta URL HTTPS de archivos de publicación en su lista de hosts permitidos. Rechaza las URL con credenciales o puertos distintos de 443. También rechaza las redirecciones y las respuestas DNS que resuelvan a direcciones IP privadas o de uso especial.

Instálalo globalmente y comprueba el comando `dingo`:

```
npm install --global @blinklabs/dingo
dingo --help
```

Después de instalarlo globalmente, utiliza `dingo` en lugar de `./dingo` en los demás comandos. Para comprobarlo sin instalación global:

```
npx @blinklabs/dingo --help
```

## Ejecutar una devnet local de un solo nodo

Ejecuta una devnet local de un nodo con el binario descargado:

```
./dingo devnet
```

📝 La configuración de devnet generada por Dingo establece `bindAddr` en `127.0.0.1`, por lo que sus API y servicios aceptan conexiones locales de forma predeterminada. Modifica expresamente la configuración generada si quieres permitir acceso remoto.

Con una instalación global de npm, ejecuta `dingo devnet`. Sin instalación global:

```
npx @blinklabs/dingo devnet
```

Sin `--data-dir`, Dingo guarda la configuración, las claves de prueba y los datos de la cadena en un directorio temporal privado que elimina al terminar el proceso. Cada ejecución inicia una cadena nueva.

Usa `--data-dir` para conservar y reanudar una cadena:

```
./dingo devnet --data-dir ./.dingo-devnet
```

Repite el mismo comando para reanudarla. `--reset` requiere `--data-dir` y vuelve a crear el estado gestionado por Dingo sin eliminar los archivos ajenos de ese directorio:

```
./dingo devnet --data-dir ./.dingo-devnet --reset
```

La primera ejecución persistente requiere un directorio vacío. Dingo rechaza otra ejecución que utilice el mismo directorio mientras el nodo esté activo. Usa las claves y la red incluidas únicamente para pruebas locales, nunca con fondos reales.

Dingo proporciona `faucet.skey`, `faucet.vkey` y `faucet.addr` en `cardano/keys/`. La dirección incluida en `faucet.addr`, `addr_test1vztc80na8320zymhjekl40yjsnxkcvhu58x59mc2fuwvgkc332vxv`, recibe `900,000` ADA de prueba (`900_000_000_000` lovelace) en la génesis para realizar transacciones locales.

- En una ejecución temporal de `./dingo devnet`, Dingo muestra el directorio temporal. Su carpeta `cardano/keys/` contiene los archivos del faucet hasta que termina el proceso.
- Con `./dingo devnet --data-dir ./.dingo-devnet`, los archivos se guardan en `./.dingo-devnet/cardano/keys/`.
- Dingo restringe el acceso a los archivos del faucet y su directorio al propietario.

Al reanudar una devnet persistente sin `--reset`, Dingo solo restaura o actualiza los archivos del faucet y reescribe la configuración local. Conserva las credenciales del productor, la asignación de génesis existente y los datos de la cadena.

## Paso 2 - Crear dingo.yaml

Consulta la [referencia de configuración](/es/guides/dingo/009-configuration-reference/) para conocer todos los ajustes, valores predeterminados y sustituciones mediante entorno o línea de comandos de Dingo v0.87.1. Descarga el archivo [`dingo.yaml.example`](https://raw.githubusercontent.com/blinklabs-io/dingo/v0.87.1/dingo.yaml.example) de esa versión como punto de partida.

Dingo incorpora las configuraciones de red de Cardano, incluidos los archivos de génesis y config.json, para preview, preprod y mainnet. No necesitas descargarlas por separado.

Crea `dingo.yaml` en el directorio de Dingo. `$HOME` se expande automáticamente a tu directorio personal:

```
cat <<EOF > ~/dingo/dingo.yaml
# Shared database path for the local blob and metadata stores.
databasePath: "$HOME/dingo/.dingo"

# Storage
plugins:
  storage:
    blob:
      provider: "badger"
      config:
        # Optional Badger data directory. When unset, databasePath applies.
        # dataDir: "$HOME/dingo/.dingo/badger"
    metadata:
      provider: "sqlite"
      config:
        # Optional SQLite data directory. When unset, databasePath applies.
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
# plugins.mempool.config.capacity is an optional override.
# Default: 1 MiB for Praos mode and normal serve mode, and 25 MiB for Musashi mode.
# Leave the key commented or omit it to use the mode default.
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
  # Optional exact artifact identity for a fresh bootstrap only.
  # Mithril v1 uses a snapshot digest; Mithril v2 uses a Cardano database artifact hash.
  # pinnedDigest: ""

# Network
bindAddr: "0.0.0.0"
# Prometheus uses this independent address and defaults to loopback; it does
# not inherit bindAddr. Use --metrics-bind-addr or DINGO_METRICS_BIND_ADDR to
# override it. Set metricsPort to 0 to disable the metrics listener.
metricsBindAddr: "127.0.0.1"
metricsPort: 12798
healthPort: 12799
healthReadyGapSlots: 1000
debugPort: 0
network: "preview"
privateBindAddr: "127.0.0.1"
privatePort: 3002
relayPort: 3001
socketPath: "$HOME/dingo/dingo.socket"
# Total NtC connection limit. Dingo ignores non-positive values.
# CLI: --max-ntc-conns; environment: DINGO_MAX_NTC_CONNS
maxNtCConns: 100
# Per-IP NtC connection limit. Dingo ignores non-positive values.
# CLI: --max-ntc-connections-per-ip; environment: DINGO_MAX_NTC_CONNECTIONS_PER_IP
maxNtCConnectionsPerIP: 5

# Storage
barkBaseUrl: ""
barkPort: 0
storageMode: "core"

EOF
```

📝 Deja `debugPort` en `0` salvo que necesites perfiles. Controla un servicio pprof opcional, independiente de `metricsPort`, y permanece desactivado con `0`.

📝 `healthPort` utiliza `--health-port` o `DINGO_HEALTH_PORT`; establece `healthPort: 0` para desactivar el servicio de estado. `healthReadyGapSlots` utiliza `--health-ready-gap-slots` o `DINGO_HEALTH_READY_GAP_SLOTS`.

📝 Bark calcula su ventana de seguridad cerca de la punta a partir del estado actual del ledger. No busques ni establezcas manualmente `barkSecurityWindow` en esta configuración.

💡 Los servidores de API permanecen inactivos fuera de `storageMode: "api"`, y un puerto `0` desactiva esa API.

```yaml
midnight:
  # Enable the Midnight gRPC server independently of Midnight indexing.
  # Default: false.
  serverEnabled: false
  # Expose gRPC reflection. Requires serverEnabled. Default: false.
  reflectionEnabled: false
  # Permit plaintext listening on a non-loopback host. A configured TLS
  # certificate and key allow remote TLS exposure without this setting.
  # Default: false.
  allowInsecureRemote: false
  # Must be nonzero when serverEnabled is true. Default: 50051.
  port: 50051
  # Defaults to loopback; an empty value also uses 127.0.0.1.
  host: "127.0.0.1"
  authTokenPolicyId: ""
  authTokenAssetName: ""
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

💡 `midnight.serverEnabled: false` mantiene desactivado el servicio gRPC de Midnight; configurar únicamente `midnight.port` no lo expone.

📝 Establece conjuntamente `midnight.authTokenPolicyId` y `midnight.authTokenAssetName` o deja ambos sin configurar. Un par incompleto hace fallar la validación de configuración y de inicio. Un identificador de política configurado debe tener exactamente 56 caracteres hexadecimales, 28 bytes decodificados. La comparación utiliza el identificador y el nombre de activo exactos.

💡 Establecer `block-cache-size` e `index-cache-size` en 0 con `compression: false` utiliza la caché de páginas del sistema operativo (mmap) en lugar de las cachés internas de BadgerDB, reduciendo mucho el uso de memoria.

## Paso 3 - Abrir los puertos de red

Configura las reglas del cortafuegos UFW para permitir los puertos necesarios de Dingo. UFW significa Uncomplicated Firewall y permite gestionar las reglas de iptables (netfilter).

Consulta los puertos abiertos:

```
sudo ufw status numbered
```

### Añadir el puerto 3001 para la comunicación Ouroboros de nodo a nodo, NtN

```
sudo ufw allow 3001/tcp
```

<a id="step-4---bootstrap-from-mithril-snapshot"></a>

## Paso 4 - Arrancar desde una instantánea de Mithril

El cliente Mithril integrado descarga y carga una instantánea automáticamente, ahorrando horas frente a reproducir la cadena desde la génesis.

Ejecuta desde `~/dingo`:

```
cd ~/dingo
./dingo mithril sync --config ~/dingo/dingo.yaml
```

📝 Consulta `http://127.0.0.1:12799/health` o `http://127.0.0.1:12799/healthz` para comprobar la actividad y `http://127.0.0.1:12799/readyz` para comprobar la disponibilidad. `/health` y `/healthz` incluyen la capacidad de respuesta del bucle de eventos y no se limitan a la disponibilidad. `/readyz` exige satisfacer la distancia a la punta configurada y la disponibilidad de la base de datos. Para productores, también exige un proceso de forjado en ejecución y credenciales utilizables, incluida la disponibilidad de KES remoto cuando corresponda. Informa de falta de disponibilidad si la distancia a la punta es desconocida o supera `healthReadyGapSlots`. La comprobación de estado del contenedor utiliza `/health`, no las métricas. El servicio de estado permanece disponible durante `dingo mithril sync`.

📝 `mithril.downloadMaxTransientRetries` controla los reintentos de descargas de arranque con fallos transitorios, como tiempos de espera TLS, HTTP 429 y HTTP 5xx. El ejemplo utiliza el valor predeterminado `10`.

Dingo realizará estos pasos:

1. Descargar la última instantánea de Mithril de la red configurada.
2. Verificar la cadena de certificados.
3. Cargar la instantánea en la base de datos.

Tarda aproximadamente 20-30 minutos, según el sistema y la velocidad de red. Si omites este paso, Dingo se sincronizará desde la génesis al iniciarse, lo que tarda bastante más.

## Paso 5 - Iniciar Dingo

Cuando termine la carga de la instantánea:

```
cd ~/dingo
./dingo serve --config ~/dingo/dingo.yaml
```

Los registros mostrarán las conexiones con los pares y la sincronización de los bloques restantes hasta alcanzar la punta.

### Ejecutar Dingo como servicio systemd

Un servicio systemd inicia Dingo al arrancar el sistema y lo reinicia si termina inesperadamente. Consulta la [guía de creación del servicio](../003-create-start-up-service).

### ¡Enhorabuena! El nodo Dingo ya está en ejecución.

[Aprende a interactuar con Dingo mediante Cardano CLI](../004-using-dingo-with-cardano-cli).

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
