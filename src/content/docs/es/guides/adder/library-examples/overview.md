---
title: Ejemplos de la biblioteca Go
description: Descarga y ejecuta programas de la biblioteca Adder y plantillas de plugins gestionados.
sidebar:
  order: 1
---

Descarga el [paquete completo de ejemplos Go](/downloads/adder/library-examples/adder-library-examples.tar.gz) o consulta los [archivos de código fuente](https://github.com/blinklabs-io/docs/tree/main/public/downloads/adder/library-examples/source). El paquete utiliza el commit `e6f733d318eb` de Adder e incluye su licencia Apache-2.0. Se compila independientemente de una copia del repositorio de Adder.

## Preparación

Instala Go 1.26.8 o posterior y extrae el paquete:

```sh
tar -xzf adder-library-examples.tar.gz
cd adder-library-examples
go mod download
export CARDANO_NODE_SOCKET_PATH=/path/to/node.socket
go run ./adder-publisher
```

Los tres programas requieren un nodo Cardano de mainnet sincronizado y con un socket Unix local. Utilizan de forma predeterminada `/ipc/node.socket` y el identificador de red mainnet `764824073`. Para preview, establece `CARDANO_NODE_MAGIC=2` y apunta `CARDANO_NODE_SOCKET_PATH` a un nodo de preview. Para preprod, utiliza el identificador `1` y un nodo de preprod. ChainSync deduce el historial de épocas de sus estados a partir de estos identificadores de red conocidos.

Para una red personalizada, añade `input_chainsync.WithEraHistory` a `inputOpts` en `main.go`. Proporciona un `input_chainsync.EraHistory` cuyos valores `ByronEpochLength`, `ShelleyStartSlot`, `ShelleyStartEpoch` y `ShelleyEpochLength` coincidan con la génesis y los límites de eras de esa red. Los programas solo procesan las dos variables `CARDANO_NODE_*`; configura el historial de eras personalizado en el código fuente.

Para acceder por TCP, sustituye `WithSocketPath` por `WithAddress` en el código. ChainSync de nodo a nodo utiliza sincronización masiva; conecta únicamente con nodos que controles.

## Ejemplos

- [Publicador de eventos](/es/guides/adder/library-examples/adder-publisher/): recibe y registra eventos de ChainSync.
- [Filtro de stake pools](/es/guides/adder/library-examples/poolid-filter/): observa cualquiera de dos identificadores de pool.
- [Filtro de direcciones y activos](/es/guides/adder/library-examples/event-address-filter/): combina filtros de transacciones, direcciones y activos.
- [Plugins gestionados](/es/guides/adder/library-examples/plugins/): implementa cancelación, reinicio, fallos y propiedad de los eventos.

Los tres programas comienzan en la punta actual y activan la reconexión automática. Gestionan SIGINT/SIGTERM, observan el fallo terminal de `Failed()` por separado de los diagnósticos recuperables de `ErrorChan()` y llaman a `Stop()` antes de terminar tras un inicio correcto. Los errores de inicio terminan sin llamar a `Stop()`, porque `StartContext` limpia los recursos de un inicio fallido. El callback registra `received event` con el tipo de evento, y los cambios de estado registran `chainsync status update`.

## Validar el código fuente

Desde la raíz del paquete extraído:

```sh
go test -race ./...
go vet ./...
go build ./...
```

Las pruebas utilizan un socket local simulado y plugins en memoria; no necesitan un nodo Cardano activo. Ejecuta los programas por separado para observar eventos reales de ChainSync.
