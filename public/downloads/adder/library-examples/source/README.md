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
programs. All three default to mainnet magic 764824073. For preview, set
`CARDANO_NODE_MAGIC=2` and point `CARDANO_NODE_SOCKET_PATH` at a preview node;
for preprod, use magic `1` and a preprod node. ChainSync infers the status epoch
history from these known network magic values.

For a custom network, add `input_chainsync.WithEraHistory` to `inputOpts` in
`main.go`. Pass an `input_chainsync.EraHistory` with `ByronEpochLength`,
`ShelleyStartSlot`, `ShelleyStartEpoch`, and `ShelleyEpochLength` derived from
that network's genesis and era boundaries. These programs parse only the two
`CARDANO_NODE_*` environment variables, so set custom era history in source.
TCP access can use `WithAddress` instead of `WithSocketPath`; Node-to-Node ChainSync uses bulk synchronization and should
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
