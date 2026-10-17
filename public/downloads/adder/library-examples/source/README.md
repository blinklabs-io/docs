# Adder library examples

Go programs and managed-plugin templates migrated from Adder commit
`e6f733d318ebcc7d810c779d7c040d084eeef6a2`. The module pins that snapshot.
The programs use a local Cardano node socket; customize the filters in source.

## Requirements

- Go 1.26.8 or newer
- A synchronized mainnet Cardano node with a local Unix socket (for the three programs)

```sh
go mod download
export CARDANO_NODE_SOCKET_PATH=/path/to/node.socket
go run ./adder-publisher
```

Run `go run ./poolid-filter` or `go run ./event-address-filter` for the filter
programs. All three default to mainnet magic 764824073. Changing
`CARDANO_NODE_MAGIC` alone does not replace the global genesis values; configure
both for another network. TCP access can use `WithAddress` instead of
`WithSocketPath`; Node-to-Node ChainSync uses bulk synchronization and should
connect only to nodes you control.

The callback logs `received event`, and the status callback logs
`chainsync status update`. SIGINT and SIGTERM cancel the pipeline, and each
program calls `Stop` on shutdown or terminal failure. Diagnostics and terminal
failures are observed separately.

## Validation

```sh
go test -race ./...
go vet ./...
go build ./...
```

The publisher test uses a local fake socket; plugin tests need no external
services. Running the programs against a real node is separate from these tests.

See https://docs.blinklabs.io/guides/adder/library-examples/overview/ for the guides.
These sources retain Adder's Apache-2.0 license; see LICENSE.
