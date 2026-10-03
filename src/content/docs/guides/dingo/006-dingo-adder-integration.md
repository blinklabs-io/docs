---
title: Dingo and Adder Integration
description: Validate Adder against Dingo on the Cardano preview network with Docker Compose.
---

# Dingo and Adder Integration

## Overview

This guide describes how to validate the Adder event stream against a Dingo node on the Cardano `preview` network. Docker Compose starts both services and connects them through a shared UNIX socket.

## Architecture

The validation stack contains two services:

- `dingo` runs `ghcr.io/blinklabs-io/dingo:0.70.9`, syncs the Cardano `preview` network through Node-to-Node (NtN) communication, and creates `/ipc/node.socket`.
- `adder` reads `config-preview.yaml`, connects to Dingo through the Node-to-Client (N2C) protocol, and writes block and rollback events to its logs.

Docker Compose mounts the named `dingo-ipc` volume at `/ipc` in both containers and mounts `dingo-data` at `/data` in Dingo. The shared `dingo-ipc` volume makes `/ipc/node.socket` available to Adder, while `dingo-data` stores Dingo data between container restarts.

## Prerequisites

- Docker with Docker Compose support
- A checkout of the Adder repository
- `docker-compose.yml` and `config-preview.yaml` in the Adder repository root

Run every command in this guide from the Adder repository root.

## Preview configuration

The `config-preview.yaml` file configures Adder with these validation values:

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

For Adder, Compose supplies `config-preview.yaml` at `/config/config-preview.yaml`.

## Start the validation stack

Start and build both containers in the background:

```bash
docker compose up --build -d
```

Docker starts the `dingo` service first and then starts `adder` with the shared socket volume.

## Verify the connection

Review Adder's logs to verify the N2C connection and block event output:

```bash
docker compose logs adder
```

Review the output for Adder connecting through `/ipc/node.socket` and emitting block events. Dingo also reports rollback events when the chain rolls back.

A clean validation volume starts Dingo at genesis. Adder therefore intersects at genesis and processes blocks from block 1 as Dingo syncs.

After Dingo syncs blocks, restart only Adder to test intersection at the active Dingo tip:

```bash
docker compose restart adder
docker compose logs adder
```

The `intersect-tip: true` setting makes Adder resume from the active Dingo tip instead of restarting from block 1.

Search the combined service logs for operational anomalies:

```bash
docker compose logs | grep -iE "error|panic|warn|reconnect"
```

## Stop and clean up

Stop the services and remove the named validation volumes:

```bash
docker compose down -v
```

This command removes the `dingo-ipc` and `dingo-data` volumes, so the next stack start begins with clean validation state. Docker configures each service with the `json-file` logging driver, a maximum file size of `5m`, and a maximum of two log files.


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
