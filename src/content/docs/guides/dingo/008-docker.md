---
title: Run Dingo in a Container
description: Run the published Dingo image, persist its data, and check node health.
---

Dingo publishes container images to GitHub Container Registry. The versioned
  image tag omits the leading `v` from the matching Dingo release tag. This
  example uses Dingo `v0.88.0`:

```sh
 docker pull ghcr.io/blinklabs-io/dingo:0.88.0
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
  --env DINGO_METRICS_BIND_ADDR=0.0.0.0 \
  --volume dingo-preview-data:/data/db \
    ghcr.io/blinklabs-io/dingo:0.88.0
```

Port `3001` accepts Ouroboros node-to-node connections. Metrics on `12798` and
the health endpoint on `12799` are published on the host loopback interface in
this example. The image keeps metrics on container loopback by default, so the
`DINGO_METRICS_BIND_ADDR=0.0.0.0` override makes the published metrics port
reachable from the host while the host side remains local to `127.0.0.1`. Keep
a separate named volume for each network.

For Preprod, add `--env CARDANO_NETWORK=preprod` and use a volume such as
`dingo-preprod-data`.

## Use a configuration file

Mount a readable `dingo.yaml` and pass its path before the `serve` command:

```sh
docker run --detach --name dingo-custom \
  --publish 3001:3001 \
  --volume dingo-custom-data:/data/db \
  --mount type=bind,source="$(pwd)/dingo.yaml",target=/tmp/dingo.yaml,readonly \
     ghcr.io/blinklabs-io/dingo:0.87.0 \
  --config /tmp/dingo.yaml serve
```

If the custom configuration publishes the metrics port, set
`metricsBindAddr: "0.0.0.0"` in `dingo.yaml` or set
`DINGO_METRICS_BIND_ADDR=0.0.0.0` in the container environment. Mounting a
configuration file alone does not make loopback metrics reachable through a
published port.

The container runs as UID `1000`. Make sure a bind-mounted configuration file
is readable by that user. For other node settings, see [configuration and
storage modes](/guides/dingo/005-node-configuration/).

### Protect published metrics

Add the following option to the `docker run` command to require a Bearer token
for the node and Mithril metrics endpoints:

```sh
--env DINGO_METRICS_AUTH_TOKEN='replace-with-secret' \
```

Configure Prometheus with `authorization.credentials_file` containing the same
token. See the [Grafana dashboards guide](/guides/dingo/spo-guides/008-grafana-dashboard/)
for the Prometheus configuration. The token-protected listener still uses
plain HTTP, so remote transport requires a TLS reverse proxy or an
authenticated encrypted tunnel.

## Check and manage the container

```sh
docker logs --follow dingo-preview
docker stop dingo-preview
docker start dingo-preview
```

The image health check calls `/health`, which reports liveness and includes
event-loop responsiveness. A healthy container may still be syncing. The
`/readyz` endpoint is the readiness check: it requires the tip-gap and database
readiness checks to pass, and a block-producer deployment also requires a
running forger with usable credentials. Use `/readyz` when deciding whether to
route application traffic.
See [bootstrap and data
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
