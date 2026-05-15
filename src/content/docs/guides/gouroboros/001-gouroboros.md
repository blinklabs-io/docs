---
title: gOuroboros
description: Introduction to gOuroboros.
---

![gOuroboros-logo](/gOuroboros-logo.png)

gOuroboros is a powerful and versatile framework for building Go apps that interact with the Cardano blockchain. Version `v0.170.1` applies stricter block local validation and protocol handling so malformed data and unsupported edge cases fail earlier and more explicitly. It now rejects reward withdrawals that use key credentials without a matching witness, rejects unknown Conway redeemer tags immediately, rejects duplicate CBOR map keys during decoding, and expects the canonical `Blake2b-256` VRF key hash for registered VRF keys. It also handles node to client server setup more defensively by defaulting `nil` configs and returning a clear error when a peer accepts an unsupported handshake version. `VerifyBlock` and validation stage checks remain block local only and do not provide full consensus or chain state validation.

***

Learn more about the code documentation of gOuroboros here: <a href="https://pkg.go.dev/github.com/blinklabs-io/gouroboros" target="_blank">https://pkg.go.dev/github.com/blinklabs-io/gouroboros</a>.  
