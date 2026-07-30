---
title: mithril-signer
description: Run the Mithril signer service from the Blink Labs image.
---

`mithril-signer` is the upstream signer service. Cardano network configuration is
available under `/opt/cardano/config`; the image adds no runtime wrapper or custom
environment variables.

```sh
docker run --rm -it \
  -v signer-config:/etc/mithril \
  ghcr.io/blinklabs-io/mithril-signer:latest --help
```

Use the upstream signer configuration and secret-management instructions. Never put
signer keys in an image layer or command-line argument. `MITHRIL_VERSION` is a
build argument, not a runtime setting.

[Mithril documentation](https://mithril.network/doc/current/) ·
[Source repository](https://github.com/blinklabs-io/docker-mithril-signer)
