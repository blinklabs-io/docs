---
title: Build a Wallet Frontend with UTxO RPC
description: Use Dingo UTxO RPC to query wallet data and submit transactions from an application.
---

Dingo's UTxO RPC is a query and transaction interface for applications that
build Cardano transactions. It supports UTxO searches, transaction evaluation
and submission, and confirmation tracking. Enable it in API storage mode:

```yaml
storageMode: api
plugins:
  api:
    utxorpc:
      provider: builtin
      config:
        port: 9090
```

The service exposes Connect/gRPC and HTTP routes. See [Dingo APIs and archive
services](/guides/dingo/006-apis-and-archive/) for authentication, TLS, and
release-specific settings. Keep the listener private or place it behind a
secured gateway.

## Wallet transaction flow

1. Connect a wallet through the browser wallet standard used by your frontend.
   Wallet APIs provide addresses and signing; Dingo does not custody wallet
   keys.
2. Query the wallet's UTxOs from Dingo. Exact-address searches return outputs
   for that serialized address; credential searches can cover multiple address
   forms associated with a stake credential. Choose the query that matches the
   view you are building and account for pagination or response limits.
3. Build the transaction using the queried UTxOs and current protocol
   parameters, then ask Dingo to evaluate it before presenting it to the user.
4. Have the wallet review and sign the transaction. Submit the signed bytes to
   Dingo and track confirmation using the transaction hash.

Treat wallet output as user-controlled input. Display the transaction details
before requesting signatures, handle rejected signatures and submission errors,
and do not claim that submission alone means a transaction has been confirmed.

UTxO RPC does not replace node-to-client queries for every ledger view. For
example, stake-address information and stake snapshots are available through
node-to-client LocalStateQuery. If your application needs delegation or reward
state, use the interface that serves those values rather than inferring them
from wallet UTxOs.

Use the [Dingo Go library reference on
pkg.go.dev](https://pkg.go.dev/github.com/blinklabs-io/dingo) for library API
documentation. The node's UTxO RPC contract is documented with the API settings
for the release you deploy.
