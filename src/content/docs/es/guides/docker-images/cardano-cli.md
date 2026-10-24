---
title: cardano-cli
description: Ejecuta comandos de Cardano CLI desde la imagen cardano-cli de Blink Labs.
---

La imagen `cardano-cli` es ejecutable: los argumentos situados después del nombre de la imagen se pasan directamente a la CLI original.

```sh
docker run --rm -it \
  -v node-ipc:/ipc \
  ghcr.io/blinklabs-io/cardano-cli:latest \
  query tip --socket-path /ipc/node.socket --mainnet
```

La imagen no añade variables de entorno de ejecución. `CLI_VERSION` es un argumento de compilación de Docker que selecciona la etiqueta de la CLI original; no es un ajuste de ejecución. `LD_LIBRARY_PATH` y `PKG_CONFIG_PATH` se configuran internamente para las bibliotecas incluidas.

[Repositorio de código fuente](https://github.com/blinklabs-io/docker-cardano-cli) ·
[CLI original](https://github.com/IntersectMBO/cardano-cli)
