---
title: mithril-client
description: Download and verify Mithril snapshots from the Blink Labs image.
---

`mithril-client` is the upstream snapshot CLI. Cardano network configuration is
available under `/opt/cardano/config`; the image adds no runtime wrapper or custom
environment variables.

```sh
docker run --rm -it \
  -v node-data:/data \
  ghcr.io/blinklabs-io/mithril-client:latest \
  cardano-db snapshot list
```

Pass upstream Mithril commands, flags, and environment configuration directly.
`MITHRIL_VERSION` is a build argument selecting the source revision.

[Mithril documentation](https://mithril.network/doc/current/) ·
[Source repository](https://github.com/blinklabs-io/docker-mithril-client)
