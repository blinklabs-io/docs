---
title: Run Dingo in a Container
description: Run the published Dingo image, persist its data, and check node health.
---

Dingo publishes container images to GitHub Container Registry. The versioned
image tag omits the leading `v` from the matching Dingo release tag. This
example uses Dingo `v0.75.0`:

```sh
docker pull ghcr.io/blinklabs-io/dingo:0.75.0
```

## Start a Preview node

The image defaults to the `serve` command, the Preview network, and the
database directory `/data/db`. A named volume preserves the database when the
container is stopped or replaced.

```sh
docker run --detach --name dingo-preview \
  --publish 3001:3001 \
  --publish 127.0.0.1:12798:12798 \
  --publish 127.0.0.1:12799:12799 \
  --volume dingo-preview-data:/data/db \
  ghcr.io/blinklabs-io/dingo:0.75.0
```

Port `3001` accepts Ouroboros node-to-node connections. Metrics on `12798` and
the health endpoint on `12799` are published on the host loopback interface in
this example. Keep a separate named volume for each network.

For Preprod, add `--env CARDANO_NETWORK=preprod` and use a volume such as
`dingo-preprod-data`.

## Use a configuration file

Mount a readable `dingo.yaml` and pass its path before the `serve` command:

```sh
docker run --detach --name dingo-custom \
  --publish 3001:3001 \
  --volume dingo-custom-data:/data/db \
  --mount type=bind,source="$(pwd)/dingo.yaml",target=/tmp/dingo.yaml,readonly \
  ghcr.io/blinklabs-io/dingo:0.75.0 \
  --config /tmp/dingo.yaml serve
```

The container runs as UID `1000`. Make sure a bind-mounted configuration file
is readable by that user. For other node settings, see [configuration and
storage modes](/guides/dingo/005-node-configuration/).

## Check and manage the container

```sh
docker logs --follow dingo-preview
docker stop dingo-preview
docker start dingo-preview
```

The image health check calls `/health`, which reports liveness. A healthy
container may still be syncing; use `/readyz` when deciding whether to route
application traffic. See [bootstrap and data
maintenance](/guides/dingo/007-bootstrap-and-data-maintenance/) for Mithril
bootstrap and database operations.


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
