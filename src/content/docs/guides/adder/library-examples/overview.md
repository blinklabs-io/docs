---
title: Go Library Examples
description: Download and run Adder library programs and managed-plugin templates.
sidebar:
  order: 1
---

Download the [complete Go examples bundle](/downloads/adder/library-examples/adder-library-examples.tar.gz) or browse the
[source files](https://github.com/blinklabs-io/docs/tree/main/public/downloads/adder/library-examples/source).
The bundle pins Adder commit `e6f733d318eb` and includes its Apache-2.0 license.
It builds independently of an Adder checkout.

## Setup

Install Go 1.26.8 or newer, then extract the bundle:

```sh
tar -xzf adder-library-examples.tar.gz
cd adder-library-examples
go mod download
export CARDANO_NODE_SOCKET_PATH=/path/to/node.socket
go run ./adder-publisher
```

The three programs require a synchronized mainnet Cardano node with a local
Unix socket. They default to `/ipc/node.socket` and mainnet magic `764824073`.
`CARDANO_NODE_MAGIC` overrides the magic; changing it alone does not replace
global genesis values. Configure both when adapting the programs to another
network. For TCP access, replace `WithSocketPath` with `WithAddress` in source.
Node-to-Node ChainSync uses bulk synchronization; connect only to nodes you control.

## Examples

- [Event publisher](/guides/adder/library-examples/adder-publisher/): receive and log ChainSync events.
- [Stake pool filter](/guides/adder/library-examples/poolid-filter/): watch either of two pool IDs.
- [Address and asset filter](/guides/adder/library-examples/event-address-filter/): combine transaction, address, and asset filters.
- [Managed plugins](/guides/adder/library-examples/plugins/): implement cancellation, restart, failure, and event ownership.

All three programs start at the current tip and enable automatic reconnection.
They handle SIGINT/SIGTERM, observe terminal `Failed()` separately from
recoverable `ErrorChan()` diagnostics, and call `Stop()` before returning.
The callback logs `received event` with an event type, and status changes log
`chainsync status update`.

## Validate the source

From the extracted bundle root:

```sh
go test -race ./...
go vet ./...
go build ./...
```

Tests use a fake local socket and in-memory plugins; they do not need a live
Cardano node. Run the programs separately to observe real ChainSync events.
