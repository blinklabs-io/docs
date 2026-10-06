---
title: gOuroboros examples
description: Explore and download runnable Go examples for Cardano node protocols.
---

The gOuroboros repository includes runnable programs that demonstrate how Go
applications connect to Cardano nodes and use Ouroboros mini-protocols. This
page includes the examples from [gOuroboros v0.211.0](https://github.com/blinklabs-io/gouroboros/tree/v0.211.0/examples).

[Download all examples](/downloads/gouroboros/dev-guides/gouroboros-examples-v0.211.0.tar.gz) or browse the [versioned source files on GitHub](https://github.com/blinklabs-io/gouroboros/tree/v0.211.0/examples).

| Example | Demonstrates |
| --- | --- |
| [block-fetch](https://github.com/blinklabs-io/gouroboros/tree/v0.211.0/examples/block-fetch) | Fetch a block by slot and hash from a node. |
| [chain-sync](https://github.com/blinklabs-io/gouroboros/tree/v0.211.0/examples/chain-sync) | Synchronize blocks and headers, with optional block fetching and range queries. |
| [chain-tip](https://github.com/blinklabs-io/gouroboros/tree/v0.211.0/examples/chain-tip) | Read and display the current chain tip. |
| [peer-sharing](https://github.com/blinklabs-io/gouroboros/tree/v0.211.0/examples/peer-sharing) | Request peers through the peer-sharing mini-protocol. |
| [ping](https://github.com/blinklabs-io/gouroboros/tree/v0.211.0/examples/ping) | Measure node connection and ChainSync response times. |
| [state-query](https://github.com/blinklabs-io/gouroboros/tree/v0.211.0/examples/state-query) | Query ledger state from a local node. |
| [tx-monitor](https://github.com/blinklabs-io/gouroboros/tree/v0.211.0/examples/tx-monitor) | Monitor transactions in the node's local mempool. |
| [tx-submission](https://github.com/blinklabs-io/gouroboros/tree/v0.211.0/examples/tx-submission) | Submit a transaction to a local node. |

The examples are Go programs in the gOuroboros module. Follow the environment
and connection settings in each source file, and use the module's [API
documentation](https://pkg.go.dev/github.com/blinklabs-io/gouroboros) for
additional package details.
