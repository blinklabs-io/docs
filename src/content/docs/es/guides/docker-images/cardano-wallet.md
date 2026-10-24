---
title: cardano-wallet
description: Ejecuta el servicio HTTP de Cardano Wallet desde la imagen de Blink Labs.
---

`cardano-wallet` es el ejecutable de wallet original con el puerto `8090` expuesto. La imagen no añade un entorno de ejecución específico de Blink Labs; pasa los comandos y opciones originales después del nombre de la imagen.

```sh
docker run --detach --name cardano-wallet \
  -p 8090:8090 -v node-ipc:/ipc -v wallet-state:/wallet \
  ghcr.io/blinklabs-io/cardano-wallet:latest \
  serve --port 8090 --node-socket /ipc/node.socket --database /wallet
```

`WALLET_VERSION` y `WALLET_REF` son argumentos de compilación que seleccionan la revisión del código fuente, no ajustes de ejecución. Monta el IPC del nodo, la base de datos y el material TLS según requiera el comando original.

[Repositorio de código fuente](https://github.com/blinklabs-io/docker-cardano-wallet) ·
[Wallet original](https://github.com/cardano-foundation/cardano-wallet)
