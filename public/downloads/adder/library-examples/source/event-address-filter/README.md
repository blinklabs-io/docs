# Address and asset filter

Emit only transactions matching both the configured payment address and DJED asset fingerprint. The event-type filter runs before the Cardano filter.

From the bundle root:

```sh
export CARDANO_NODE_SOCKET_PATH=/path/to/node.socket
go run ./event-address-filter
```

The default network is mainnet. See [bundle setup](../README.md) for network
and lifecycle details. Edit the filter values in `main.go` for your targets.
