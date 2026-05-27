---
title: gOuroboros
description: Introduction to gOuroboros.
---

![gOuroboros-logo](/gOuroboros-logo.png)

gOuroboros is a powerful and versatile framework for building Go apps that interact with the Cardano blockchain. Quickly and easily write Go apps that communicate with Cardano nodes or manage blocks/transactions. Sync the blockchain from a local or remote node, query a local node for protocol parameters or UTxOs by address, and much more.

## Leios in v0.179.0

gOuroboros includes Leios as an experimental mini-protocol suite that is part of the CIP-0164 / Linear Leios work. In v0.179.0, the suite adds `LeiosVotes`, the new protocol with ID `20`.

- `LeiosNotify` handles block announcements and availability notifications.
- `LeiosFetch` handles block and transaction retrieval.
- `LeiosVotes` handles vote diffusion.

***

Learn more about the code documentation of gOuroboros here: <a href="https://pkg.go.dev/github.com/blinklabs-io/gouroboros" target="_blank">https://pkg.go.dev/github.com/blinklabs-io/gouroboros</a>.

Leios is an experimental node to node protocol suite in gOuroboros. In v0.179.0, the suite adds `LeiosVotes` as protocol ID `20`. The suite now splits responsibilities across `LeiosNotify` for block announcements and availability notifications, `LeiosFetch` for block and transaction retrieval, and `LeiosVotes` for vote diffusion as part of the CIP-0164 / Linear Leios work.
