---
title: Configuración nativa de Dingo en macOS
description: Ejecuta Dingo en el runtime de contenedores nativo de Apple y valídalo con Adder en macOS.
---

# Configuración nativa de Dingo en macOS

## Descripción general

Esta guía explica cómo ejecutar Dingo en el entorno de contenedores nativo de Apple y ejecutar Adder de forma nativa en macOS contra el socket UNIX que Dingo crea. Los scripts auxiliares administran el ciclo de vida del contenedor y del socket para una ejecución de validación en la red `preview`.

## Requisitos previos

La configuración requiere:

- macOS
- Una instalación funcional de `apple/container`. Siga las [instrucciones oficiales de compilación de `apple/container`](https://github.com/apple/container#building-from-source).
- El repositorio de Adder con los scripts auxiliares `scripts/container-dingo-start.sh` y `scripts/container-dingo-stop.sh`

Ejecute los comandos desde la raíz del repositorio de Adder. Esta configuración ejecuta Adder desde el repositorio y no incluye un comando de instalación o compilación.

## Topología de conexión

Use esta ruta de conexión:

1. Dingo se ejecuta dentro de la máquina virtual Linux del contenedor y crea `/ipc/node.socket`.
2. Apple container publica ese socket en el host macOS mediante `--publish-socket` y lo expone en `~/dingo-ipc/node.socket`.
3. Adder se ejecuta de forma nativa en macOS y se conecta al socket que Apple container publica en el host.

## Iniciar Dingo

Desde la raíz del repositorio, inicie Dingo con el script auxiliar de macOS:

```bash
./scripts/container-dingo-start.sh
```

El script auxiliar inicia los servicios de Apple container, detiene y elimina un contenedor `dingo` anterior, crea y vacía `~/dingo-ipc` e inicia `ghcr.io/blinklabs-io/dingo:0.70.9`. Dingo sirve la red `preview` mediante `/ipc/node.socket`, y el script auxiliar publica esa ruta como `~/dingo-ipc/node.socket` en macOS.

El script auxiliar espera hasta que el socket del host esté listo y después muestra el comando de Adder.

## Ejecutar Adder de forma nativa

Después de que el script auxiliar indique que Dingo está escuchando, ejecute Adder desde la raíz del repositorio:

```bash
go run ./cmd/adder --input chainsync \
  --input-chainsync-socket-path ~/dingo-ipc/node.socket \
  --input-chainsync-network preview \
  --input-chainsync-intersect-tip=true \
  --output log
```

La red `preview` y la bandera `--input-chainsync-intersect-tip=true` establecen la configuración de validación prevista. La bandera `--output log` escribe la salida de Adder en el terminal.

## Detener la configuración

Cuando termine la validación, ejecute el helper de detención desde la raíz del repositorio:

```bash
./scripts/container-dingo-stop.sh
```

El script auxiliar detiene y elimina el contenedor `dingo`, elimina el contenido de `~/dingo-ipc` y detiene los servicios del sistema de Apple container.

## Fallos de inicio

Si el inicio falla antes de que el socket esté listo, el script auxiliar detiene y elimina el contenedor `dingo` iniciado parcialmente y elimina los archivos del socket que publica.