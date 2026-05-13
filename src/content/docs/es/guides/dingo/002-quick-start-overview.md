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
wget https://github.com/blinklabs-io/dingo/releases/download/v0.35.1/dingo-v0.35.1-linux-amd64.tar.gz -O - | tar -xz
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
# Database
database:
  blob:
    plugin: "badger"
    badger:
      block-cache-size: 0
      compression: false
      data-dir: "$HOME/dingo/.dingo/badger"
      gc: true
      index-cache-size: 0
  metadata:
    plugin: "sqlite"
    sqlite:
      data-dir: "$HOME/dingo/.dingo/metadata.db"
databasePath: "$HOME/dingo/.dingo"

# Mempool
# `mempoolCapacity` es una anulación opcional del valor predeterminado del modo.
# Predeterminado: 1 MiB para el modo Praos y el modo serve normal, y 25 MiB para el modo Leios.
# Deja la clave comentada o omítela para usar el valor predeterminado del modo.
# mempoolCapacity: 1048576

# Mithril
mithril:
  aggregatorUrl: ""
  cleanupAfterLoad: true
  enabled: true
  verifyCertificates: true

# Network
bindAddr: "0.0.0.0"
metricsPort: 12798
network: "preview"
privateBindAddr: "127.0.0.1"
privatePort: 3002
relayPort: 3001
socketPath: "$HOME/dingo/dingo.socket"

# Storage
blockfrostPort: 0
meshPort: 0
storageMode: "core"
utxorpcPort: 0
EOF
```

> 💡 Para servir endpoints HTTP compatibles con Blockfrost, cambia `storageMode` a una configuración compatible con API y asigna un valor distinto de cero a `blockfrostPort`.

```yaml
blockfrostPort: 3000
storageMode: "api"
utxorpcPort: 0
```

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
[Consulta nuestra guía sobre cómo crear un servicio de inicio para Dingo](../004-create-start-up-service).

***

<br>

### ¡Felicidades, estás listo para comenzar a usar el nodo Dingo!

[Aprende cómo interactuar con Dingo usando la CLI de Cardano](../003-using-dingo-with-cardano-cli).
