---
title: cardano-db-sync container
description: Run Cardano DB Sync with PostgreSQL from the Blink Labs container image.
---

The image indexes a Cardano chain into PostgreSQL. Persist `/var/lib/cexplorer`,
mount the Cardano node socket at `/node-ipc`, and provide PostgreSQL credentials.

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

| Variable | Meaning |
| --- | --- |
| `NETWORK` | Bundled network config: `mainnet`, `preprod`, `preview`, or `sanchonet`. If unset, pass upstream db-sync arguments after the image. |
| `CARDANO_NODE_SOCKET_PATH` | Cardano IPC socket; defaults to `/node-ipc/node.socket` when `NETWORK` is set. |
| `RESTORE_SNAPSHOT` | Optional local path or HTTPS URL for a db-sync snapshot. URLs are checksum-checked and restored once. |
| `POSTGRES_HOST` / `POSTGRES_PORT` | PostgreSQL host and port. |
| `POSTGRES_DB` / `POSTGRES_USER` | PostgreSQL database and username. |
| `POSTGRES_PASSWORD` | Password fallback. Prefer the `postgres_password` Docker secret. |

The entrypoint generates `/configuration/pgpass` from `POSTGRES_*` values or
`postgres_host`, `postgres_port`, `postgres_db`, `postgres_user`, and
`postgres_password` files in `/run/secrets`. Follow progress with
`docker logs -f cardano-db-sync`.

[Source repository](https://github.com/blinklabs-io/docker-cardano-db-sync) ·
[Upstream db-sync](https://github.com/IntersectMBO/cardano-db-sync)
