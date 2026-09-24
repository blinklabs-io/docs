---
title: Dingo macOS Native Container Setup
description: Run Dingo in Apple's native container runtime and validate it with Adder on macOS.
---

# Dingo macOS Native Container Setup

## Overview

This guide describes how to run Dingo in Apple's native container runtime and run Adder natively on macOS against Dingo's published UNIX socket. The helper scripts manage the container and socket lifecycle for a `preview` network validation run.

## Prerequisites

The setup requires:

- macOS
- A working `apple/container` installation. Follow the official [`apple/container` build instructions](https://github.com/apple/container#building-from-source).
- The Adder repository with the `scripts/container-dingo-start.sh` and `scripts/container-dingo-stop.sh` helper scripts

Run the commands in this guide from the Adder repository root. The guide does not install or build Adder; it runs Adder from the repository.

## Connection topology

The setup uses this connection path:

1. Dingo runs inside the Linux container virtual machine and creates `/ipc/node.socket`.
2. Apple container publishes that socket to the macOS host at `~/dingo-ipc/node.socket`.
3. Adder runs natively on macOS and connects to the published host socket.

## Start Dingo

From the repository root, start Dingo with the macOS helper:

```bash
./scripts/container-dingo-start.sh
```

The helper starts the Apple container services, stops and removes a previous `dingo` container, creates and clears `~/dingo-ipc`, and starts `ghcr.io/blinklabs-io/dingo:0.70.9`. Dingo serves the `preview` network through `/ipc/node.socket`, and the helper publishes that path as `~/dingo-ipc/node.socket` on macOS.

The helper waits for the host socket before it completes and prints the Adder command when Dingo is ready.

## Run Adder natively

After the start helper reports that Dingo is listening, run Adder from the repository root:

```bash
go run ./cmd/adder --input chainsync \
  --input-chainsync-socket-path ~/dingo-ipc/node.socket \
  --input-chainsync-network preview \
  --input-chainsync-intersect-tip=true \
  --output log
```

The `preview` network and `--input-chainsync-intersect-tip=true` flag provide the intended validation settings for this setup. The `--output log` flag writes Adder output to the terminal.

## Stop the setup

When validation is complete, run the stop helper from the repository root:

```bash
./scripts/container-dingo-stop.sh
```

The helper stops and removes the `dingo` container, removes the contents of `~/dingo-ipc`, and stops the Apple container system services.

## Startup failures

If startup fails before the socket becomes ready, the start helper stops and removes the partially started `dingo` container and removes the published socket files. Run the start helper again after correcting the reported problem.
