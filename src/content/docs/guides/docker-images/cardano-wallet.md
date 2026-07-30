---
title: cardano-wallet
description: Run the Cardano wallet HTTP service from the Blink Labs image.
---

`cardano-wallet` is the upstream wallet executable with port `8090` exposed. The
image adds no Blink Labs-specific runtime environment; pass upstream commands and
options after the image name.

```sh
docker run --detach --name cardano-wallet \
  -p 8090:8090 -v node-ipc:/ipc -v wallet-state:/wallet \
  ghcr.io/blinklabs-io/cardano-wallet:latest \
  serve --port 8090 --node-socket /ipc/node.socket --database /wallet
```

`WALLET_VERSION` and `WALLET_REF` are build arguments selecting the source
revision, not runtime settings. Mount node IPC, database, and TLS material as
required by the upstream command.

[Source repository](https://github.com/blinklabs-io/docker-cardano-wallet) ·
[Upstream wallet](https://github.com/cardano-foundation/cardano-wallet)
