---
title: Blink Labs container images
description: Choose, run, and configure Blink Labs container images for Cardano, Hydra, and Mithril.
---

Blink Labs publishes container images that package upstream Cardano ecosystem
software into reproducible Debian or Alpine images. The software remains the
upstream project's software; Blink Labs maintains the Dockerfiles, build inputs,
entrypoints, and release automation. Read the upstream license and release notes
before deploying an image in production.

Images are published to both the [GitHub Container Registry](https://github.com/orgs/blinklabs-io/packages?repo_name=docker-cardano-node)
as `ghcr.io/blinklabs-io/<image>` and [Docker Hub](https://hub.docker.com/u/blinklabs)
as `blinklabs/<image>`. Use a release tag when you need reproducibility; use
`:latest` only when you intentionally track the newest published build.

## Image catalog

| Image | Use it for | Upstream project | Guide |
| --- | --- | --- | --- |
| `cardano-cli` | Cardano command-line queries, transaction construction, and signing. | [IntersectMBO/cardano-cli](https://github.com/IntersectMBO/cardano-cli) | [Guide](/guides/docker-images/cardano-cli/) |
| `cardano-configs` | Supplying network configuration files to another container or volume. | [Cardano environment configs](https://book.play.dev.cardano.org/environments/) | [Guide](/guides/docker-images/cardano-configs/) |
| `cardano-db-sync` | Indexing a Cardano chain into PostgreSQL. | [IntersectMBO/cardano-db-sync](https://github.com/IntersectMBO/cardano-db-sync) | [Guide](/guides/docker-images/cardano-db-sync/) |
| `cardano-node` | Running a Cardano full node, tracer, or submit API. | [IntersectMBO/cardano-node](https://github.com/IntersectMBO/cardano-node) | [Guide](/guides/docker-images/cardano-node/) |
| `cardano-wallet` | Running the Cardano wallet HTTP service. | [cardano-foundation/cardano-wallet](https://github.com/cardano-foundation/cardano-wallet) | [Guide](/guides/docker-images/cardano-wallet/) |
| `hydra-node` | Running a Hydra head node. | [cardano-scaling/hydra](https://github.com/cardano-scaling/hydra) | [Guide](/guides/docker-images/hydra-node/) |
| `mithril-client` | Downloading and verifying Mithril snapshots. | [input-output-hk/mithril](https://github.com/input-output-hk/mithril) | [Guide](/guides/docker-images/mithril-client/) |
| `mithril-signer` | Running the Mithril signer service. | [input-output-hk/mithril](https://github.com/input-output-hk/mithril) | [Guide](/guides/docker-images/mithril-signer/) |

The image repositories contain the exact Dockerfiles and build versions for each
release. The links above are the source of truth when an image tag and this page
get out of sync.

## Common Docker patterns

Use a named volume for state that must survive container replacement, publish only
the ports that other services need, and pass secrets through Docker secrets or a
secret manager instead of putting them in a shell history.

```sh
docker pull ghcr.io/blinklabs-io/cardano-node:<release-tag>
docker pull blinklabs/cardano-node:<release-tag>
docker image inspect ghcr.io/blinklabs-io/cardano-node:<release-tag>
docker logs -f cardano-node
```

The individual guides use GHCR and `:latest` for readability. Substitute
`blinklabs/<image>` for Docker Hub, and pin the tag in scripts and deployment
manifests.

## Choose an image

- Need a full node and optional bundled tools? Start with [cardano-node](/guides/docker-images/cardano-node/).
- Need only transaction and query commands? Use [cardano-cli](/guides/docker-images/cardano-cli/).
- Need configs to mount into another service? Use [cardano-configs](/guides/docker-images/cardano-configs/).
- Need a PostgreSQL index? Use [cardano-db-sync](/guides/docker-images/cardano-db-sync/).
- Need a wallet API, Hydra head, or Mithril service? Open the corresponding focused guide above.

## Troubleshooting

- **The command exits immediately:** check the image's entrypoint and pass a
  command where the image expects one. `cardano-configs` requires a target
  directory; `cardano-node` requires `NETWORK` or `run`.
- **The node cannot find its socket:** mount the same named volume into the node
  and client containers, and use `/ipc/node.socket` (managed mode) or the value of
  `CARDANO_SOCKET_PATH` (configurable mode).
- **The node starts from genesis:** keep `/data/db` persistent or leave
  `RESTORE_SNAPSHOT=true` so the entrypoint can download a Mithril snapshot.
- **db-sync cannot connect to PostgreSQL:** check `POSTGRES_*` values and the
  generated `/configuration/pgpass`; ensure the database is reachable from the
  container network.
- **A configuration file is missing:** run `cardano-configs` with the desired
  network argument and mount its output where the consuming image expects
  `/opt/cardano/config`.

Report image-specific problems in that image's repository so maintainers can
reproduce the exact build tag.
