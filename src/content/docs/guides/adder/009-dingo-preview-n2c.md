---
title: Validate Adder with Dingo on Cardano Preview
description: Run Adder against Dingo through the preview network N2C UNIX socket.
---

## Overview

This guide describes how to validate Adder against Dingo on the Cardano `preview` network through the Node-to-Client (N2C) UNIX socket. Use the Docker Compose workflow for a fully containerized validation, or use the macOS workflow to run Adder natively while Dingo runs in a Linux container.

## Prerequisites

- A checkout of the Adder repository.
- Docker with Docker Compose support for the containerized workflow.
- Install [`apple/container`](https://github.com/apple/container) on macOS by following the official [Building from Source](https://github.com/apple/container#building-from-source) instructions for the native workflow.

## Preview N2C configuration

The `config-preview.yaml` file selects the `chainsync` input and the `preview` network. Adder connects to `/ipc/node.socket`, requests an intersection at the node's current tip, omits CBOR data, reconnects automatically, and applies no confirmation delay:

```yaml
input: chainsync
output: log

plugins:
  input:
    chainsync:
      network: preview
      socket-path: /ipc/node.socket
      intersect-tip: true
      include-cbor: false
      auto-reconnect: true
      delay-confirmations: 0
```

## Validate with Docker Compose

### Start the stack

1. Change to the repository worktree.
2. Start the Dingo and Adder services in the background:

   ```bash
   docker compose up --build -d
   ```

The `dingo` service runs `ghcr.io/blinklabs-io/dingo:0.70.9` with `serve --socket-path /ipc/node.socket --network preview`. Both services mount the named `dingo-ipc` volume at `/ipc`, so Dingo creates `/ipc/node.socket` and Adder connects to the same path. Both services use `restart: unless-stopped`.

Each service uses Docker's `json-file` logging driver with `max-size: "5m"` and `max-file: "2"`.

### Verify the connection

Inspect the most recent Adder output:

```bash
docker compose logs adder | tail -n 20
```

Confirm that the output shows a successful connection to the UNIX socket, completion of the ChainSync intersection, and `BLOCK` records.

### Verify intersection at the tip after a restart

1. Allow the stack to run until it has processed some blocks, such as slot `100` or higher.
2. Restart only Adder:

   ```bash
   docker compose restart adder
   ```

3. Inspect the Adder output again:

   ```bash
   docker compose logs adder | tail -n 20
   ```

Adder requests a new intersection at the node's reported tip after the restart. Compare recent slots before and after the restart. Immediate event arrival is not guaranteed, and a rollback can produce a lower slot.

### Stop the stack

Stop the services and remove the named volumes, including Dingo's database:

```bash
docker compose down -v
```

Omit `-v` to retain the named volumes.

## Run Adder natively on macOS

The macOS workflow keeps Dingo in a Linux container and runs Adder as a native Go process on macOS. `apple/container --publish-socket` bridges Dingo's `/ipc/node.socket` to `~/dingo-ipc/node.socket` on the host.

### Start Dingo and the socket bridge

Run the provided helper from the repository root:

```bash
./scripts/container-dingo-start.sh
```

The helper starts the Apple container services, creates the host socket directory, launches Dingo, and exposes the container socket at `~/dingo-ipc/node.socket`.

### Run Adder against the bridged socket

Run Adder from the repository root as a native macOS process:

```bash
go run ./cmd/adder --config config-preview.yaml --input chainsync \
  --input-chainsync-socket-path ~/dingo-ipc/node.socket \
  --input-chainsync-network preview \
  --input-chainsync-intersect-tip=true \
  --output log
```

The command uses the host socket bridge, selects the `preview` network, and enables intersection at the node's current tip.

### Stop the native workflow

Run the stop helper from the repository root:

```bash
./scripts/container-dingo-stop.sh
```

The helper stops Dingo, removes the host socket, and stops the Apple container services.