---
title: cardano-db-sync
description: Ejecuta Cardano DB Sync con PostgreSQL desde la imagen de Blink Labs.
---

La imagen indexa una cadena Cardano en PostgreSQL. Conserva `/var/lib/cexplorer` de forma persistente, monta el socket del nodo Cardano en `/node-ipc` y proporciona las credenciales de PostgreSQL.

```sh
docker run --detach --name cardano-db-sync \
  -v dbsync-state:/var/lib/cexplorer \
  -v node-ipc:/node-ipc \
  -e NETWORK=mainnet \
  -e POSTGRES_HOST=postgres -e POSTGRES_PORT=5432 \
  -e POSTGRES_DB=cexplorer -e POSTGRES_USER=cexplorer \
  -e POSTGRES_PASSWORD='use-a-secret' \
  ghcr.io/blinklabs-io/cardano-db-sync:latest
```

| Variable | Significado |
| --- | --- |
| `NETWORK` | Configuración de red incluida: `mainnet`, `preprod`, `preview` o `sanchonet`. Si no se define, pasa los argumentos de db-sync después de la imagen. |
| `CARDANO_NODE_SOCKET_PATH` | Socket IPC de Cardano; el valor predeterminado es `/node-ipc/node.socket` cuando se define `NETWORK`. |
| `RESTORE_SNAPSHOT` | Ruta local o URL HTTPS opcional de una instantánea de db-sync. Las descargas por URL se verifican mediante suma de comprobación y se restauran una vez. |
| `POSTGRES_HOST` / `POSTGRES_PORT` | Host y puerto de PostgreSQL. |
| `POSTGRES_DB` / `POSTGRES_USER` | Base de datos y usuario de PostgreSQL. |
| `POSTGRES_PASSWORD` | Contraseña alternativa. Es preferible usar el secreto de Docker `postgres_password`. |

El punto de entrada genera `/configuration/pgpass` a partir de los valores `POSTGRES_*` o de los archivos `postgres_host`, `postgres_port`, `postgres_db`, `postgres_user` y `postgres_password` en `/run/secrets`. Sigue el progreso con `docker logs -f cardano-db-sync`.

[Repositorio de código fuente](https://github.com/blinklabs-io/docker-cardano-db-sync) ·
[db-sync original](https://github.com/IntersectMBO/cardano-db-sync)
