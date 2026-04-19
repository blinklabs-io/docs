---
title: gOuroboros
description: Introduction to gOuroboros.
---

![gOuroboros-logo](/gOuroboros-logo.png)

gOuroboros is a powerful and versatile framework for building Go apps that interact with the Cardano blockchain. Quickly and easily write Go apps that communicate with Cardano nodes or manage blocks/transactions. Sync the blockchain from a local or remote node, query a local node for protocol parameters or UTxOs by address, and much more. 

Starting in v0.35.3, gOuroboros-based peer discovery checks whether a remote peer advertised peer sharing support before it sends a peer sharing request. It skips peers with peer sharing disabled and peers that use a negotiated version without the peer sharing mini protocol, which avoids `UnknownMiniProtocol` errors and prevents unnecessary connection resets during networking.

***

Learn more about the code documentation of gOuroboros here: <a href="https://pkg.go.dev/github.com/blinklabs-io/gouroboros" target="_blank">https://pkg.go.dev/github.com/blinklabs-io/gouroboros</a>.  
