---
title: cardano-node
description: Run and configure a Cardano full node from the Blink Labs cardano-node image.
---

Set `NETWORK` for the managed path, or omit it and invoke `run` for full control.
Managed values are `mainnet`, `preview`, `preprod`, and `sanchonet`.

```sh
docker run --detach --name cardano-node \
  -v node-data:/data/db -v node-ipc:/ipc \
  -e NETWORK=preprod -p 3001:3001 \
  ghcr.io/blinklabs-io/cardano-node:latest
```

An empty preprod or mainnet database can be bootstrapped from a Mithril snapshot.
Keep `/data/db` persistent and set `RESTORE_SNAPSHOT=false` to disable this.

### Runtime variables

| Variable | Default | Meaning |
| --- | --- | --- |
| `CARDANO_NETWORK` | `mainnet` | Network directory in configurable `run` mode. |
| `CARDANO_CONFIG_BASE` | `/opt/cardano/config` | Base directory for bundled config. |
| `CARDANO_CONFIG` | `${CARDANO_CONFIG_BASE}/mainnet/config.json` | Node config path. |
| `CARDANO_TOPOLOGY` | `${CARDANO_CONFIG_BASE}/mainnet/topology.json` | Topology path. |
| `CARDANO_DATABASE_PATH` | `/data/db` | Persistent ledger database. |
| `CARDANO_SOCKET_PATH` | `/ipc/node.socket` | Ouroboros IPC socket. |
| `CARDANO_BIND_ADDR` / `CARDANO_PORT` | `0.0.0.0` / `3001` | Network bind address and port. |
| `CARDANO_LOG_DIR` | `/opt/cardano/logs` | Log directory. |
| `CARDANO_RTS_OPTS` | `-N2 -A64m -I0 -qg -qb --disable-delayed-os-memory-return` | Haskell runtime options. |
| `CARDANO_BLOCK_PRODUCER` | `false` | Set `true` to run as a block producer. |
| `CARDANO_SHELLEY_KES_KEY` | `${CARDANO_CONFIG_BASE}/keys/kes.skey` | KES key path. |
| `CARDANO_SHELLEY_VRF_KEY` | `${CARDANO_CONFIG_BASE}/keys/vrf.skey` | VRF key path. |
| `CARDANO_SHELLEY_OPERATIONAL_CERTIFICATE` | `${CARDANO_CONFIG_BASE}/keys/node.cert` | Operational certificate path. |
| `START_AS_NON_PRODUCING` | `false` | Start a producer without forging; control with SIGHUP. |
| `RESTORE_SNAPSHOT` | `true` | Enable Mithril snapshot bootstrap. |
| `AGGREGATOR_ENDPOINT` / `SNAPSHOT_DIGEST` | network URL / `latest` | Mithril endpoint and snapshot selection. |
| `GENESIS_VERIFICATION_KEY` / `ANCILLARY_VERIFICATION_KEY` | bundled files | Mithril verification keys. |
| `SOCAT_PORT` | `0` | Optional TCP-to-IPC forwarding port. |
| `DEBUG` | unset | Enable shell tracing when non-empty. |

The image also includes `cardano-cli`, `mithril-client`, `mithril-signer`, `nview`,
and `txtop`. Mount signing keys read-only; never bake them into an image layer.

[Source repository](https://github.com/blinklabs-io/docker-cardano-node) ·
[Upstream node](https://github.com/IntersectMBO/cardano-node)
