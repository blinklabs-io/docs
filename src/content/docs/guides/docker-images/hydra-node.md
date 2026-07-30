---
title: hydra-node
description: Run the upstream Hydra head node from the Blink Labs container image.
---

`hydra-node` includes the upstream executable, Cardano configuration files, and
`cardano-cli`. Pass Hydra flags directly to the image:

```sh
docker run --rm -it \
  -v hydra-state:/state \
  ghcr.io/blinklabs-io/hydra-node:latest --help
```

The image defines no Blink Labs-specific runtime environment or wrapper. Configure
peers, the head protocol, API, and persistence with upstream Hydra flags and
configuration. `NODE_VERSION` and `RUST_ACCUMULATOR_REV` are build arguments only.

[Hydra documentation](https://hydra.family/) ·
[Source repository](https://github.com/blinklabs-io/docker-hydra-node)
