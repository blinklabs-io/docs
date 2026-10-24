---
title: Crear un servicio de inicio
description: Crear un servicio de inicio para Dingo.
---

# Dingo

Dingo es un nodo de la blockchain de Cardano escrito en Go que participa activamente en las comunicaciones de la red mediante la familia de miniprotocolos Ouroboros de nodo a nodo.

⚠️ Dingo sigue en desarrollo intensivo.

Esta guía configura un servicio `systemd` que inicia automáticamente el nodo después de reiniciar el equipo para maximizar su tiempo de actividad.

✅ Se presupone una instalación Linux típica. Ajusta los comandos y las rutas según sea necesario.

⚠️ Completa primero la [guía de inicio rápido](../002-quick-start-overview).

## Paso 1 - Mover el binario y la configuración

Mueve el binario a `/usr/local/bin/` y la configuración a `/etc/dingo/` para que estén disponibles en todo el sistema.

Copia el binario:

```
sudo cp ~/dingo/dingo /usr/local/bin/
```

✅ Compruébalo con `which dingo`.

Crea el directorio de configuración y copia el archivo:

```
sudo mkdir -p /etc/dingo
sudo cp ~/dingo/dingo.yaml /etc/dingo/
```

## Paso 2 - Actualizar las rutas de dingo.yaml

El servicio se ejecuta con tu usuario, pero la configuración está ahora en `/etc/dingo/`, por lo que las rutas de la base de datos y del socket deben ser absolutas. Vuelve a generar la configuración expandiendo `$HOME`:

```
sudo tee /etc/dingo/dingo.yaml > /dev/null <<EOF
# Global data directory for both blob and metadata storage plugins.
# Can be overridden with CARDANO_DATABASE_PATH or --data-dir.
databasePath: "$HOME/dingo/.dingo"

# Plugins
plugins:
  storage:
    blob:
      provider: "badger"
      config:
        # Optional Badger data directory. When unset, databasePath applies.
        dataDir: "$HOME/dingo/.dingo/badger"
        blockCacheSize: 0
        compression: false
        gc: true
        indexCacheSize: 0
    metadata:
      provider: "sqlite"
      config:
        # Optional SQLite data directory. When unset, databasePath applies.
        dataDir: "$HOME/dingo/.dingo/metadata.db"
  mempool:
    provider: "default"
    config:
      # capacity is an optional override, not a required setting.
      # Default: 1 MiB for Praos mode and normal serve mode, and 25 MiB for Musashi mode.
      # Leave the key commented or omit it to use the mode default.
      # capacity: 1048576
      # revalidationDeltaCap is optional. Default: 64. The value must be positive.
      # revalidationDeltaCap: 64
  api:
    blockfrost:
      provider: "builtin"
      config:
        port: 3000
        # Blockfrost uses this provider-specific host independently of bindAddr.
        # Default: 127.0.0.1. Set host for access from a service network or a remote host.
        host: "127.0.0.1"
        # Set authToken to protect transaction submission and evaluation mutations.
        # authToken: ""
        # Authenticated mutation access on a non-loopback host requires server TLS.
        # Global concurrent mutation limit. Default: 4.
        maxConcurrentMutations: 4
        # Per-client concurrent mutation limit. Default: 1.
        maxConcurrentMutationsPerClient: 1
    mesh:
      provider: "builtin"
      config:
        port: 8080
    utxorpc:
      provider: "builtin"
      config:
        port: 9090

# Mithril
mithril:
  aggregatorUrl: ""
  cleanupAfterLoad: true
  enabled: true
  verifyCertificates: true
  # CLI: --mithril-allow-insecure-http; environment: DINGO_MITHRIL_ALLOW_INSECURE_HTTP.
  # When true, Dingo permits HTTP and local or private destinations for local development or testing only.
  allowInsecureHttp: false
  # Optional exact artifact identity for a fresh bootstrap:
  # v1 snapshot digest or v2 Cardano database artifact hash.
  # pinnedDigest: "<digest>"

# Network
# Health probes. CLI: --health-port; environment: DINGO_HEALTH_PORT.
# Set healthPort to 0 to disable the health listener.
healthPort: 12799
# CLI: --health-ready-gap-slots; environment: DINGO_HEALTH_READY_GAP_SLOTS.
healthReadyGapSlots: 1000
bindAddr: "0.0.0.0"
metricsPort: 12798
debugPort: 0
network: "preview"
# Total NtC admission limit. Default: 100. Non-positive values are ignored.
# CLI: --max-ntc-conns; environment: DINGO_MAX_NTC_CONNS.
maxNtCConns: 100
# Per-IP NtC admission limit. Default: 5. Non-positive values are ignored.
# CLI: --max-ntc-connections-per-ip; environment: DINGO_MAX_NTC_CONNECTIONS_PER_IP.
maxNtCConnectionsPerIP: 5
privateBindAddr: "127.0.0.1"
privatePort: 3002
relayPort: 3001
socketPath: "$HOME/dingo/dingo.socket"

# Storage
barkBaseUrl: ""
barkPort: 0
storageMode: "core"
# Database lifecycle
databaseLifecycle:
  # Automatic database snapshots run at epoch boundaries.
  # Do not enable automatic snapshots when the primary blob provider is "badger", "s3", or "gcs".
  # Select a local primary blob provider instead.
  # Default: false.
  snapshotEnabled: false
  # Dingo writes automatic snapshots to this local filesystem directory.
  # Set this when snapshotEnabled is true and when Bark mounts the live service.
  snapshotDir: "$HOME/dingo/snapshots"
  # Optional snapshot trust key used by snapshot authentication operations.
  # When set, this must be a regular, non-symlink file no larger than 1 KiB.
  # Unix: the node user must own it, with no group or other permissions.
  # Windows: the current user or BUILTIN\\Administrators must own it; the process
  # must belong to Administrators when applicable, and the DACL must restrict access.
  # snapshotTrustKeyFile: "$HOME/dingo/snapshot-trust-key"
  # Keep only the most recent automatic snapshots.
  # Default: 0.
  snapshotRetention: 0
  # Optional cloud mirror for snapshots.
  # snapshotCloudDestination: ""
  # snapshotCloudDestinationPrefix: ""
  # Capture an automatic snapshot every N epoch closes.
  # CLI: --db-snapshot-every-n-epochs
  snapshotEveryNEpochs: 1
EOF
```

📝 Mithril exige `HTTPS` de forma predeterminada y rechaza los destinos locales, privados o no públicos. El arranque Mithril v2 solo acepta orígenes de artefactos y redirecciones del agregador configurado o del origen GCS oficial de Mithril, `storage.googleapis.com`. Aplica comprobaciones agregadas de seguridad de descarga y extracción, verifica el archivo auxiliar firmado antes de extraer y utiliza únicamente contenido autenticado del ledger. Establece `mithril.allowInsecureHttp: true` solo para desarrollo o pruebas locales; no lo actives en producción.

📝 Mantén `debugPort` en `0` salvo que necesites perfiles. Controla un servicio pprof opcional e independiente.

📝 `databaseLifecycle.snapshotEnabled` controla las instantáneas automáticas en los límites de época. Las instantáneas manuales mediante `dingo database snapshot` y `CreateSnapshot` de Bark siguen disponibles con `badger`, `s3` o `gcs` como proveedor principal de blobs. Si Bark también sirve restauraciones o truncados en vivo, configura `barkPort`, `databaseLifecycle.snapshotDir`, `barkClientCaFilePath` y `tlsCertFilePath`/`tlsKeyFilePath`.

📝 Configura `databaseLifecycle.snapshotRetention` para conservar únicamente las instantáneas automáticas más recientes. `databaseLifecycle.snapshotCloudDestination` copia cada instantánea a S3 o GCS cuando Dingo se ejecuta con `dingo_extra_plugins`. Ese destino es independiente del proveedor principal de blobs.

📝 Usa `dingo database snapshot`, `dingo database restore <snapshot-dir>` y `dingo database truncate --slot <slot>`, `--hash <hash>` o `--block-number <n>` sobre un directorio de datos sin conexión. `restore` también acepta el mismo URI de nube que `snapshotCloudDestination` y lo descarga a un directorio temporal antes de restaurarlo.

📝 Cuando `barkPort` se ejecuta junto con `databaseLifecycle.snapshotDir`, Bark también expone acceso en vivo a `Restore` y `Truncate`.

📝 En modo core, Dingo rechaza cualquier destino de `dingo database truncate` sin conexión o `Truncate` de Bark en vivo anterior a `consumed_utxo_prune_floor`, antes de modificar datos: el historial de UTxO consumidos por debajo de ese límite ya se ha podado. Se permite un destino exactamente en el límite; el modo API no cambia. Elige un destino menos antiguo o recupera una instantánea de un par completamente sincronizado cuando necesites retroceder más allá del límite.

```yaml
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
midnight:
  # Enable the Midnight gRPC server. Default: false.
  serverEnabled: false
  # Expose gRPC reflection. Requires serverEnabled. Default: false.
  reflectionEnabled: false
  # Allow plaintext on a wildcard, hostname, or non-loopback listener. Default: false.
  allowInsecureRemote: false
  # gRPC listen port. Required and nonzero when serverEnabled is true.
  port: 50051
  # gRPC listen host. An empty host defaults to 127.0.0.1.
  host: "127.0.0.1"
  authTokenPolicyId: ""
  authTokenAssetName: ""
```

📝 Dingo inicia los servicios Blockfrost, Mesh y UTxO RPC únicamente en modo de almacenamiento API. El servicio `gRPC` de Midnight también requiere modo `API`, `midnight.serverEnabled: true` y un `midnight.port` distinto de cero. Un puerto `0` desactiva esa API.

📝 `midnight.serverEnabled` controla explícitamente el servidor `gRPC` y lo mantiene apagado cuando vale false. `midnight.enabled` controla la indexación de forma independiente: el servidor puede servir filas Midnight persistidas sin ejecutar el indexador. `midnight.reflectionEnabled` requiere `midnight.serverEnabled`.

📝 Si `midnight.host` está vacío, Midnight escucha en `127.0.0.1`. Para usar texto sin cifrar fuera de loopback, establece `midnight.allowInsecureRemote: true`; para exponerlo remotamente con `TLS`, configura `tlsCertFilePath` y `tlsKeyFilePath`.

📝 Configura conjuntamente `midnight.authTokenPolicyId` y `midnight.authTokenAssetName` o deja ambos sin establecer. Un par incompleto hace fallar las validaciones de configuración y de inicio. El identificador de política debe tener exactamente 56 caracteres hexadecimales, 28 bytes decodificados. La comparación utiliza el identificador y el nombre de activo exactos.

💡 `network` admite estos valores:

```yaml
# Musashi (Leios) testnet
network: musashi

# Preview testnet
network: preview

# Pre-production testnet
network: preprod

# Mainnet - NOT CURRENTLY RECOMMENDED
network: mainnet
```

Visualiza y verifica `dingo.yaml`:

```
cd /etc/dingo/
sudo nano dingo.yaml
```

## Paso 3 - Arrancar desde Mithril, solo la primera vez

Antes de iniciar el servicio por primera vez, prepara la base de datos desde una instantánea de Mithril:

```
dingo mithril sync --config /etc/dingo/dingo.yaml
```

📝 `mithril.downloadMaxTransientRetries` controla los reintentos por fallos transitorios, como tiempos de espera TLS, HTTP 429 y HTTP 5xx. El ejemplo utiliza el valor predeterminado `10`.

Esto descarga y carga una instantánea y ahorra horas de sincronización. Consulta el [paso 4 del inicio rápido](../002-quick-start-overview#step-4---bootstrap-from-mithril-snapshot).

📝 Solo es necesario una vez. Después del arranque inicial, systemd mantiene el nodo sincronizado.

## Paso 4 - Crear la unidad dingo.service

Crea el archivo de servicio systemd. Sustituye `YOUR_USER` por tu nombre de usuario, que puedes consultar con `echo $USER`:

```
cat <<ENDFILE | sudo tee /etc/systemd/system/dingo.service > /dev/null
[Unit]
Description=Dingo Node
After=network-online.target

[Service]
Type=simple
Restart=on-failure
RestartSec=10
User=YOUR_USER
ExecStart=/usr/local/bin/dingo serve --config /etc/dingo/dingo.yaml
SyslogIdentifier=dingo
TimeoutStopSec=5

[Install]
WantedBy=multi-user.target
ENDFILE
```

Visualiza y verifica `dingo.service`:

```
sudo nano /etc/systemd/system/dingo.service
```

## Paso 5 - Activar e iniciar el servicio

Activa el inicio al arrancar el sistema e inicia el servicio ahora:

```bash
sudo systemctl daemon-reload
sudo systemctl enable dingo.service
sudo systemctl start dingo.service
```

## Paso 6 - Comprobar el estado

Comprueba que el servicio esté en ejecución:

```
sudo systemctl status dingo.service
```

Consulta `/health` o `/healthz` para comprobar la actividad y `/readyz` para comprobar la disponibilidad en el puerto `12799`:

```
curl http://127.0.0.1:12799/health
curl http://127.0.0.1:12799/healthz
curl http://127.0.0.1:12799/readyz
```

`/health` y `/healthz` incluyen la capacidad de respuesta del bucle de eventos. `/readyz` solo informa de disponibilidad cuando se cumplen la distancia a la punta configurada y la disponibilidad de la base de datos. Los productores también requieren un proceso de forjado activo y credenciales utilizables, incluida la disponibilidad de KES remoto cuando corresponda.

Para seguir los registros en tiempo real:

```
sudo journalctl -u dingo -f
```

Para ver los registros recientes si ocurre un error:

```
sudo journalctl -u dingo -n 50 --no-pager
```

### ¡Enhorabuena! Has configurado el servicio systemd de Dingo.

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
