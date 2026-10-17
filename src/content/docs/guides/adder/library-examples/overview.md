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
For preview, set `CARDANO_NODE_MAGIC=2` and point `CARDANO_NODE_SOCKET_PATH` at
a preview node. For preprod, use magic `1` and a preprod node. ChainSync infers
its status epoch history from these known magic values.

For a custom network, add `input_chainsync.WithEraHistory` to `inputOpts` in
`main.go`. Supply an `input_chainsync.EraHistory` whose `ByronEpochLength`,
`ShelleyStartSlot`, `ShelleyStartEpoch`, and `ShelleyEpochLength` match that
network's genesis and era boundaries. The programs parse only the two
`CARDANO_NODE_*` variables; configure custom era history in source.

For TCP access, replace `WithSocketPath` with `WithAddress` in source.
Node-to-Node ChainSync uses bulk synchronization; connect only to nodes you control.

## Examples

- [Event publisher](/guides/adder/library-examples/adder-publisher/): receive and log ChainSync events.
- [Stake pool filter](/guides/adder/library-examples/poolid-filter/): watch either of two pool IDs.
- [Address and asset filter](/guides/adder/library-examples/event-address-filter/): combine transaction, address, and asset filters.
- [Managed plugins](/guides/adder/library-examples/plugins/): implement cancellation, restart, failure, and event ownership.

All three programs start at the current tip and enable automatic reconnection.
They handle SIGINT/SIGTERM, observe terminal `Failed()` separately from
recoverable `ErrorChan()` diagnostics, and call `Stop()` before returning after
a successful start. Startup errors return without a `Stop()` call because
`StartContext` cleans up a failed start.
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
