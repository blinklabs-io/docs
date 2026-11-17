---
title: Validación N2C de Dingo–Adder en preview
description: Cómo configurar y verificar la conexión N2C de Adder con Dingo en la red preview.
---

## Objetivo

Esta guía describe cómo validar la canalización de eventos de Adder con el nodo Dingo de Cardano en la red `preview`. Incluye la ejecución conjunta mediante Docker Compose, la comprobación de la intersección de ChainSync y la ejecución nativa de Adder en macOS mediante un puente de socket.

## Configuración de preview

La configuración conecta Adder con Dingo mediante el socket UNIX `/ipc/node.socket`.

- El servicio `dingo` utiliza la imagen `ghcr.io/blinklabs-io/dingo:0.70.9` y ejecuta `serve --socket-path /ipc/node.socket --network preview`.
- El servicio `adder` utiliza `config-preview.yaml`, que define `network: preview`, `socket-path: /ipc/node.socket` e `intersect-tip: true` para ChainSync.
- El volumen compartido `dingo-ipc` monta `/ipc` en ambos servicios. Dingo crea `/ipc/node.socket` y Adder utiliza ese mismo socket para conectarse mediante N2C.
- La configuración de Compose limita los registros de `dingo` y `adder` a `max-size: "5m"` y `max-file: "2"`.

## Validación con Docker Compose

### Iniciar los servicios

Desde el directorio raíz del repositorio, iniciar los contenedores en segundo plano:

```bash
docker compose up --build -d
```

### Verificar la conexión y la intersección

La configuración activa la intersección de ChainSync en la punta actual de Dingo. Adder utiliza esa punta en lugar de comenzar desde el génesis, en el slot 0.

Comprobar que Dingo se inició, que Adder se conectó al socket UNIX, que completó el protocolo de intersección y que procesa bloques:

```bash
docker compose logs adder
```

Buscar una conexión correcta y registros `BLOCK`. La salida también puede incluir eventos `TX`, `GOVERNANCE` y `ROLLBACK` cuando estén presentes. El nivel de registro `info` o `debug` permite mostrar los registros de eventos.

Para verificar la intersección con una punta distinta del génesis, dejar que los servicios se ejecuten y sincronicen algunos bloques, por ejemplo hasta el slot 100 o superior. Reiniciar solo el servicio `adder`:

```bash
docker compose restart adder
```

Volver a consultar los registros:

```bash
docker compose logs adder
```

Adder solicita una nueva intersección en la punta que informa el nodo. Comparar los slots recientes anteriores y posteriores al reinicio. Los eventos pueden no llegar de inmediato y un rollback puede producir legítimamente un slot inferior.

### Buscar anomalías

En cualquier momento, filtrar la salida operativa para localizar errores de deserialización, ciclos de desconexión de red o reinicios:

```bash
docker compose logs | grep -iE "error|panic|warn|reconnect"
```

### Detener y limpiar los servicios

Al finalizar la validación, detener los contenedores y eliminar los volúmenes con nombre, incluida la base de datos de Dingo:

```bash
docker compose down -v
```

Omitir `-v` para conservar los volúmenes.

## Validación nativa de Adder en macOS

`apple/container` utiliza `--publish-socket` para exponer `/ipc/node.socket` desde el contenedor Dingo como `~/dingo-ipc/node.socket` en macOS. Adder se ejecuta como un proceso Go nativo en macOS y se conecta al archivo de socket compartido mediante ese puente.

### Instalar `apple/container`

Compilar e instalar la herramienta siguiendo las instrucciones oficiales de [compilación desde el código fuente de apple/container](https://github.com/apple/container#building-from-source).

### Iniciar Dingo con el puente de socket

El script `./scripts/container-dingo-start.sh`, ubicado en la raíz del repositorio, inicia los servicios de `apple/container`, crea los directorios de socket del host y lanza el contenedor Dingo:

```bash
./scripts/container-dingo-start.sh
```

### Ejecutar Adder de forma nativa

Ejecutar Adder directamente como proceso Go de macOS y apuntarlo al socket UNIX conectado:

```bash
# Ejecutar Adder en Mac desde la raíz del repositorio y conectar directamente
# con el archivo de socket puenteado (el script de inicio también imprime este comando)
go run ./cmd/adder --config config-preview.yaml --input chainsync \
  --input-chainsync-socket-path ~/dingo-ipc/node.socket \
  --input-chainsync-network preview \
  --input-chainsync-intersect-tip=true \
  --output log
```

La opción `--input-chainsync-socket-path` apunta a `~/dingo-ipc/node.socket`, mientras que `--input-chainsync-network preview` y `--input-chainsync-intersect-tip=true` conservan la configuración de preview y la intersección en la punta.

### Detener y limpiar el entorno de macOS

Detener Dingo, eliminar los archivos de socket locales y detener los servicios en segundo plano de `apple/container` mediante el script de limpieza:

```bash
./scripts/container-dingo-stop.sh
```