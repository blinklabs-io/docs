---
title: Integración de Dingo y Adder
description: Valida Adder con Dingo en la red Cardano preview mediante Docker Compose.
---

# Integración de Dingo y Adder

## Descripción general

Esta guía describe la validación del flujo de eventos de Adder con un nodo Dingo en la red Cardano `preview`. Docker Compose inicia ambos servicios y los conecta mediante un socket UNIX compartido.

## Arquitectura

La pila de validación contiene dos servicios:

- `dingo` ejecuta `ghcr.io/blinklabs-io/dingo:0.70.9`, sincroniza la red Cardano `preview` mediante la comunicación Node-to-Node (NtN) y crea `/ipc/node.socket`.
- `adder` lee `config-preview.yaml`, se conecta a Dingo mediante el protocolo Node-to-Client (N2C) y escribe eventos de bloques y retrocesos en sus registros.

Docker Compose monta el volumen nombrado `dingo-ipc` en `/ipc` dentro de ambos contenedores y monta `dingo-data` en `/data` dentro de Dingo. El volumen compartido `dingo-ipc` permite que Adder acceda a `/ipc/node.socket`, mientras `dingo-data` conserva los datos de Dingo entre reinicios de los contenedores.

## Requisitos previos

- Docker con compatibilidad con Docker Compose
- Una copia local del repositorio de Adder
- `docker-compose.yml` y `config-preview.yaml` en la raíz del repositorio de Adder

Ejecuta todos los comandos de esta guía desde la raíz del repositorio de Adder.

## Configuración de preview

El archivo `config-preview.yaml` configura Adder con estos valores de validación:

```yaml
input: chainsync
output: log

plugins:
  input:
    chainsync:
      network: preview
      socket-path: /ipc/node.socket
      intersect-tip: true
      include-cbor: false
      auto-reconnect: true
      delay-confirmations: 0
```

Para Adder, Compose proporciona `config-preview.yaml` en `/config/config-preview.yaml`.

## Inicia la pila de validación

Construye e inicia ambos contenedores en segundo plano:

```bash
docker compose up --build -d
```

Docker inicia primero el servicio `dingo` y después el servicio `adder` con el volumen del socket compartido.

## Verifica la conexión

Revisa los registros de Adder para verificar la conexión N2C y la salida de eventos de bloques:

```bash
docker compose logs adder
```

Comprueba que la salida muestre que Adder se conecta mediante `/ipc/node.socket` y emite eventos de bloques. Dingo también informa eventos de retroceso cuando la cadena retrocede.

Un volumen de validación limpio inicia Dingo desde el génesis. Por tanto, Adder realiza la intersección en el génesis y procesa los bloques desde el bloque 1 mientras Dingo sincroniza.

Cuando Dingo haya sincronizado bloques, reinicia solo Adder para probar la intersección en la punta activa de Dingo:

```bash
docker compose restart adder
docker compose logs adder
```

La configuración `intersect-tip: true` hace que Adder continúe desde la punta activa de Dingo en lugar de reiniciar desde el bloque 1.

Busca anomalías operativas en los registros combinados de los servicios:

```bash
docker compose logs | grep -iE "error|panic|warn|reconnect"
```

## Detén y limpia la pila

Detén los servicios y elimina los volúmenes de validación nombrados:

```bash
docker compose down -v
```

Este comando elimina los volúmenes `dingo-ipc` y `dingo-data`, por lo que el siguiente inicio de la pila comienza con un estado de validación limpio. Como detalle de configuración, Docker usa el controlador de registros `json-file`, con un tamaño máximo de archivo de `5m` y un máximo de dos archivos de registro por servicio.

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
