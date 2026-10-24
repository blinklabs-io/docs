---
title: mithril-signer
description: Ejecuta el servicio de firma de Mithril desde la imagen de Blink Labs.
---

`mithril-signer` es el servicio de firma original. La configuración de redes Cardano está en `/opt/cardano/config`; la imagen no añade un envoltorio de ejecución ni variables de entorno personalizadas.

```sh
docker run --rm -it \
  -v signer-config:/etc/mithril \
  ghcr.io/blinklabs-io/mithril-signer:latest --help
```

Sigue las instrucciones originales de configuración del firmante y gestión de secretos. Nunca incluyas claves de firma en una capa de la imagen ni como argumento de línea de comandos. `MITHRIL_VERSION` es un argumento de compilación, no un ajuste de ejecución.

[Documentación de Mithril](https://mithril.network/doc/current/) ·
[Repositorio de código fuente](https://github.com/blinklabs-io/docker-mithril-signer)
