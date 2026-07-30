---
title: cardano-configs container
description: Copy Cardano network configuration files from the Blink Labs cardano-configs image.
---

`cardano-configs` delivers network configuration files to a mounted directory. Its
entrypoint expects a target directory and accepts an optional network name.

```sh
docker run --rm \
  -v "$(pwd)/configs:/output" \
  ghcr.io/blinklabs-io/cardano-configs:latest /output preprod
```

Omit `preprod` to copy every bundled network. Supported directories normally
include `mainnet`, `preprod`, `preview`, `sanchonet`, and `devnet` when devnet
files were included. An unknown network fails with available directories.

There are no runtime environment variables. The update script uses these build-time
controls:

| Variable | Meaning |
| --- | --- |
| `HAIL_HYDRA` | When `true`, include Hydra devnet configuration. |
| `LEIOS_GO_BRR` | When `true`, refresh the `musashi`/Leios configuration. |

[Source repository](https://github.com/blinklabs-io/docker-cardano-configs)
