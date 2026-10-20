# Stake pool filter

Match blocks, transactions, and governance events for either configured pool. Rollback events pass through; a matching block does not imply finality.

From the bundle root:

```sh
export CARDANO_NODE_SOCKET_PATH=/path/to/node.socket
go run ./poolid-filter
```

The default network is mainnet. See [bundle setup](../README.md) for network
and lifecycle details. Edit the filter values in `main.go` for your targets.
