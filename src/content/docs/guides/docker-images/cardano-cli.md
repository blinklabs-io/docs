---
title: cardano-cli
description: Run Cardano CLI commands from the Blink Labs cardano-cli image.
---

The `cardano-cli` image is an executable image: arguments after the image name go
directly to the upstream CLI.

```sh
docker run --rm -it \
  -v node-ipc:/ipc \
  ghcr.io/blinklabs-io/cardano-cli:latest \
  query tip --socket-path /ipc/node.socket --mainnet
```

The image does not add runtime environment variables. `CLI_VERSION` is a Docker
build argument selecting the upstream CLI tag; it is not a runtime setting.
`LD_LIBRARY_PATH` and `PKG_CONFIG_PATH` are set internally for packaged libraries.

[Source repository](https://github.com/blinklabs-io/docker-cardano-cli) ·
[Upstream CLI](https://github.com/IntersectMBO/cardano-cli)
