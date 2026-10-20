# Event publisher

Log all ChainSync events from a local Cardano node.

From the bundle root:

```sh
export CARDANO_NODE_SOCKET_PATH=/path/to/node.socket
go run ./adder-publisher
```

The default network is mainnet. See [bundle setup](../README.md) for network
and lifecycle details.
