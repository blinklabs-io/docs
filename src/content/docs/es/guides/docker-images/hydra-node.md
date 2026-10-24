---
title: hydra-node
description: Ejecuta el nodo de un head de Hydra desde la imagen de Blink Labs.
---

`hydra-node` incluye el ejecutable original, archivos de configuración de Cardano y `cardano-cli`. Pasa las opciones de Hydra directamente a la imagen:

```sh
docker run --rm -it \
  -v hydra-state:/state \
  ghcr.io/blinklabs-io/hydra-node:latest --help
```

La imagen no define un entorno de ejecución ni un envoltorio específico de Blink Labs. Configura los pares, el protocolo del head, la API y la persistencia con las opciones y la configuración de Hydra. `NODE_VERSION` y `RUST_ACCUMULATOR_REV` son solo argumentos de compilación.

[Documentación de Hydra](https://hydra.family/) ·
[Repositorio de código fuente](https://github.com/blinklabs-io/docker-hydra-node)
