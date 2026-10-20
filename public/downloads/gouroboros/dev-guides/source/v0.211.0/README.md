# gOuroboros examples v0.211.0

This directory contains examples based on the `examples/` directory at the
[gOuroboros v0.211.0 tag](https://github.com/blinklabs-io/gouroboros/tree/v0.211.0/examples).
The docs snapshot fixes environment-based boolean flags, environment variable
names, output formatting, connection cleanup, and timing assumptions in tests.
The examples are part of the root Go module; they do not have separate module
files.

## Run the examples

Install Go 1.26.5 or newer. From the directory containing this README and
`examples/`, download the matching gOuroboros source and copy the corrected
examples into its root module:

```sh
curl --fail --location https://github.com/blinklabs-io/gouroboros/archive/refs/tags/v0.211.0.tar.gz --output gouroboros-v0.211.0.tar.gz
tar -xzf gouroboros-v0.211.0.tar.gz
cp -R examples/. gouroboros-0.211.0/examples/
cd gouroboros-0.211.0
go test ./examples/...
```

Run each example from that module directory. For example, measure the response
time of a local preview node:

```sh
CARDANO_NODE_NETWORK=preview CARDANO_NODE_SOCKET_PATH=/path/to/node.socket go run ./examples/ping
```

Replace the socket path with the node's actual path. Each example's `Config`
struct and `envconfig.Process` prefix define its environment variables. For
example, `ping` also accepts `CARDANO_NODE_ADDRESS` for a TCP connection;
`block-fetch` uses the `BLOCK_FETCH_` prefix instead of `CARDANO_NODE_`.

The bundled source is distributed under the included Apache 2.0 `LICENSE`.
