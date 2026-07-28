---
title: Crear Servicio de Inicio
description: Crear Servicio de Inicio para Dingo.
---

# Dingo

Un nodo de datos de la blockchain Cardano escrito en Go que participa activamente en las comunicaciones de red en la blockchain Cardano utilizando la familia de mini-protocolos Node-to-Node de la Red Ouroboros.

⚠️ Este es un trabajo en progreso y actualmente está en desarrollo activo

<br>

***

En esta guía te guiaremos a través de la configuración de un servicio `systemd`. Usar un servicio `systemd` para ejecutar un nodo Dingo maximiza el tiempo de actividad reiniciando automáticamente el nodo Dingo cuando la computadora se reinicia. Para comenzar, sigue los pasos a continuación.

<br>

✅ Esta guía asume una configuración típica de Linux. Por favor ajusta los comandos y rutas según sea necesario.

> ✅ Para esta guía asumimos que ya has completado la guía de [inicio rápido](../002-quick-start-overview).

***

<br>

## Paso 1 - Mover binario de Dingo y configuración

Moveremos el binario de Dingo a `/usr/local/bin/` y la configuración a `/etc/dingo/` para que sean accesibles a nivel de sistema.

<br>

Copia el binario:

```bash
sudo cp ~/dingo/dingo /usr/local/bin/
```

> ✅ Puedes verificar que el binario fue copiado ejecutando `which dingo`

<br>

Crea el directorio de configuración y copia la configuración:

```bash
sudo mkdir -p /etc/dingo
sudo cp ~/dingo/dingo.yaml /etc/dingo/
```

***

<br>

## Paso 2 - Actualizar Rutas en dingo.yaml

Como el servicio se ejecutará como tu usuario pero la configuración ahora está en `/etc/dingo/`, debemos asegurarnos de que las rutas de la base de datos y el socket usen rutas absolutas. Ejecuta lo siguiente para regenerar la configuración con tu `$HOME` expandido:

```bash
sudo bash -c "cat <<EOF > /etc/dingo/dingo.yaml
databasePath: \"$HOME/dingo/.dingo\"

plugins:
  storage:
    blob:
      provider: \"badger\"
      config:
        # Directorio de datos opcional de Badger. Si no lo defines, `databasePath` aporta la ruta.
        # dataDir: \"$HOME/dingo/.dingo\"
    metadata:
      provider: \"sqlite\"
      config:
        # Directorio de datos opcional de SQLite. Si no lo defines, `databasePath` aporta la ruta.
        # dataDir: \"$HOME/dingo/.dingo\"
  mempool:
    provider: \"default\"
    config:
      # Capacidad del mempool en bytes. Déjala comentada para usar el valor predeterminado del modo.
      # capacity: 1048576
  api:
    blockfrost:
      provider: \"builtin\"
      config:
        port: 0
    mesh:
      provider: \"builtin\"
      config:
        port: 0
    utxorpc:
      provider: \"builtin\"
      config:
        port: 0

# Mithril
mithril:
  aggregatorUrl: \"\"
  cleanupAfterLoad: true
  downloadMaxTransientRetries: 10
  enabled: true
  verifyCertificates: true

# Network
bindAddr: \"0.0.0.0\"
metricsPort: 12798
debugPort: 0
network: \"preview\"
privateBindAddr: \"127.0.0.1\"
privatePort: 3002
relayPort: 3001
socketPath: \"$HOME/dingo/dingo.socket\"

# Storage
barkBaseUrl: \"\"
barkPort: 0
blockfrostPort: 0
meshPort: 0
storageMode: \"core\"
utxorpcPort: 0
EOF"
```

> 📝 Deja `debugPort` en `0` salvo que se necesite perfilado. `debugPort` controla un listener `pprof` opcional e independiente y normalmente debe permanecer deshabilitado.

> 📝 Los puertos de API solo funcionan en el modo de almacenamiento `api`. Establecer un puerto en `0` deshabilita esa API.

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
  authTokenPolicyId: ""
```

Estos puertos coinciden con el ejemplo actualizado del explorador local de Blockfrost, y los operadores pueden dejarlos deshabilitados salvo que necesiten esos servicios.

> 📝 `midnight.authTokenPolicyId` solo se aplica en el modo de almacenamiento API con indexación de Midnight. Dejarlo vacío mantiene el comportamiento predeterminado más amplio para la coincidencia de tokens de autenticación.

***

<br>

## Paso 3 - Iniciar desde Mithril (solo primera ejecución)

Antes de iniciar el servicio por primera vez, inicia la base de datos desde una instantánea de Mithril:

```bash
dingo mithril sync --config /etc/dingo/dingo.yaml
```

> 📝 `mithril.downloadMaxTransientRetries` controla los reintentos ante fallos transitorios en la descarga de arranque, como tiempos de espera de TLS, respuestas HTTP 429 y respuestas HTTP 5xx. El ejemplo usa el valor predeterminado de `10`.

Esto descarga y carga una instantánea, ahorrando horas de tiempo de sincronización. Consulta el [Paso 4 de la guía de inicio rápido](../002-quick-start-overview#paso-4---iniciar-desde-instantánea-de-mithril) para más detalles.

> 📝 Solo necesitas hacer esto una vez. Después del inicio inicial, el servicio systemd mantendrá el nodo sincronizado.

***

<br>

## Paso 4 - Crear Archivo de Unidad dingo.service

Crea el archivo de servicio systemd. Reemplaza `YOUR_USER` con tu nombre de usuario (`echo $USER`):

```bash
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

***

<br>

## Paso 5 - Habilitar e Iniciar el Servicio

Habilita el servicio para que se inicie en el arranque e inícialo ahora:

```bash
sudo systemctl enable dingo.service
sudo systemctl start dingo.service
```

***

<br>

## Paso 6 - Verificar Estado

Verifica que el servicio está ejecutándose:

```bash
sudo systemctl status dingo.service
```

Para seguir los registros en tiempo real:

```bash
sudo journalctl -u dingo -f
```

Para ver los registros recientes si hay un error:

```bash
sudo journalctl -u dingo -n 50 --no-pager
```

***

<br>

### ¡Felicidades, has configurado un servicio de inicio para Dingo!
