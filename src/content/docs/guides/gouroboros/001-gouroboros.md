---
title: gOuroboros
description: Introduction to gOuroboros.
---

![gOuroboros-logo](/gOuroboros-logo.png)

gOuroboros is a powerful and versatile framework for building Go apps that interact with the Cardano blockchain. Quickly and easily write Go apps that communicate with Cardano nodes or manage blocks/transactions. Sync the blockchain from a local or remote node, query a local node for protocol parameters or UTxOs by address, and much more. 

## What changed in v0.165.3

- `Connection.shutdown()` cleanup now runs only once because `sync.Once` guards repeated teardown paths. Duplicate shutdown triggers now become safe no-ops instead of risking `panic: close of closed channel` during shutdown races or partial initialization failures.
- Applications that embed gOuroboros can now tolerate duplicate shutdown triggers during error handling or connection teardown without crashing from double-close panics.
- The built in Sanchonet bootstrap peer default now points to `sancho-testnet.able-pool.io:6002`.
- Applications that rely on the built in Sanchonet network definition can now bootstrap successfully again without overriding a stale peer address.

***

Learn more about the code documentation of gOuroboros here: <a href="https://pkg.go.dev/github.com/blinklabs-io/gouroboros" target="_blank">https://pkg.go.dev/github.com/blinklabs-io/gouroboros</a>.  
