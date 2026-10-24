---
title: cardano-node
description: Ejecuta y configura un nodo completo de Cardano desde la imagen cardano-node de Blink Labs.
---

Define `NETWORK` para usar el modo administrado, u omítelo y ejecuta `run` para tener control completo. Los valores administrados son `mainnet`, `preview`, `preprod` y `sanchonet`.

```sh
docker run --detach --name cardano-node \
  -v node-data:/data/db -v node-ipc:/ipc \
  -e NETWORK=preprod -p 3001:3001 \
  ghcr.io/blinklabs-io/cardano-node:latest
```

Una base de datos vacía de preprod o mainnet puede inicializarse desde una instantánea de Mithril. Conserva `/data/db` de forma persistente; define `RESTORE_SNAPSHOT=false` para desactivar esta función.

### Variables de ejecución

| Variable | Predeterminado | Significado |
| --- | --- | --- |
| `CARDANO_NETWORK` | `mainnet` | Directorio de red en el modo configurable `run`. |
| `CARDANO_CONFIG_BASE` | `/opt/cardano/config` | Directorio base de la configuración incluida. |
| `CARDANO_CONFIG` | `${CARDANO_CONFIG_BASE}/mainnet/config.json` | Ruta de configuración del nodo. |
| `CARDANO_TOPOLOGY` | `${CARDANO_CONFIG_BASE}/mainnet/topology.json` | Ruta de la topología. |
| `CARDANO_DATABASE_PATH` | `/data/db` | Base de datos persistente del ledger. |
| `CARDANO_SOCKET_PATH` | `/ipc/node.socket` | Socket IPC de Ouroboros. |
| `CARDANO_BIND_ADDR` / `CARDANO_PORT` | `0.0.0.0` / `3001` | Dirección y puerto de escucha de red. |
| `CARDANO_LOG_DIR` | `/opt/cardano/logs` | Directorio de registros. |
| `CARDANO_RTS_OPTS` | `-N2 -A64m -I0 -qg -qb --disable-delayed-os-memory-return` | Opciones de ejecución de Haskell. |
| `CARDANO_BLOCK_PRODUCER` | `false` | Define `true` para ejecutar un productor de bloques. |
| `CARDANO_SHELLEY_KES_KEY` | `${CARDANO_CONFIG_BASE}/keys/kes.skey` | Ruta de la clave KES. |
| `CARDANO_SHELLEY_VRF_KEY` | `${CARDANO_CONFIG_BASE}/keys/vrf.skey` | Ruta de la clave VRF. |
| `CARDANO_SHELLEY_OPERATIONAL_CERTIFICATE` | `${CARDANO_CONFIG_BASE}/keys/node.cert` | Ruta del certificado operativo. |
| `START_AS_NON_PRODUCING` | `false` | Inicia un productor sin generar bloques; se controla con SIGHUP. |
| `RESTORE_SNAPSHOT` | `true` | Activa la inicialización desde instantáneas de Mithril. |
| `AGGREGATOR_ENDPOINT` / `SNAPSHOT_DIGEST` | URL de la red / `latest` | Endpoint de Mithril y selección de instantánea. |
| `GENESIS_VERIFICATION_KEY` / `ANCILLARY_VERIFICATION_KEY` | archivos incluidos | Claves de verificación de Mithril. |
| `SOCAT_PORT` | `0` | Puerto opcional de reenvío TCP a IPC. |
| `DEBUG` | sin definir | Activa el rastreo del shell cuando no está vacío. |

La imagen también incluye `cardano-cli`, `mithril-client`, `mithril-signer`, `nview` y `txtop`. Monta las claves de firma en modo de solo lectura; nunca las incluyas en una capa de la imagen.

[Repositorio de código fuente](https://github.com/blinklabs-io/docker-cardano-node) ·
[Nodo original](https://github.com/IntersectMBO/cardano-node)
