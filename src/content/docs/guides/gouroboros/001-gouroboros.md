---
title: gOuroboros
description: Build Go applications that communicate with Cardano nodes using the gOuroboros framework.
---

![gOuroboros-logo](/gOuroboros-logo.png)

gOuroboros is a powerful and versatile framework for building Go apps that interact with the Cardano blockchain. Quickly and easily write Go apps that communicate with Cardano nodes or manage blocks/transactions. Sync the blockchain from a local or remote node, query a local node for protocol parameters or UTxOs by address, and much more.

## API compatibility and input validation

### Byron block decoding and validation

Remove `EnableByronSscProofHashValidation` and `EnableByronPayloadValidation` from any `common.VerifyConfig` setup. The `consensus/byron.ValidateBodyHash(block)` function and the `(*ledger/byron.ByronMainBlock).ValidateBodyProof()` method no longer accept a `VerifyConfig` argument.

Byron main block decoding authenticates SSC proof hashes and delegation or update payload signatures by default. To request parse only behavior, pass `common.VerifyConfig{SkipBodyHashValidation: true}` to `NewByronMainBlockFromCbor`, then perform the desired validation before trusting the result.

### Strict CBOR and transaction input handling

Public CBOR constructors reject trailing top level CBOR data and malformed headers, blocks, transactions, bodies, or outputs. Shelley transaction inputs must contain a 32 byte hash and an output index from `0` through `65535`; the decoder returns errors for malformed input, trailing data, and out of range indexes, and it does not panic. Callers that process external CBOR or constructor input must handle these errors.

***

Learn more about the code documentation of gOuroboros here: <a href="https://pkg.go.dev/github.com/blinklabs-io/gouroboros" target="_blank">https://pkg.go.dev/github.com/blinklabs-io/gouroboros</a>.  
