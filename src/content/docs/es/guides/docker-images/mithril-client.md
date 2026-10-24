---
title: mithril-client
description: Descarga y verifica instantáneas de Mithril desde la imagen de Blink Labs.
---

`mithril-client` es la CLI original para instantáneas. La configuración de redes Cardano está en `/opt/cardano/config`; la imagen no añade un envoltorio de ejecución ni variables de entorno personalizadas.

```sh
docker run --rm -it \
  -v node-data:/data \
  ghcr.io/blinklabs-io/mithril-client:latest \
  cardano-db snapshot list
```

Pasa directamente los comandos, opciones y configuración de entorno de Mithril. `MITHRIL_VERSION` es un argumento de compilación que selecciona la revisión del código fuente.

[Documentación de Mithril](https://mithril.network/doc/current/) ·
[Repositorio de código fuente](https://github.com/blinklabs-io/docker-mithril-client)
