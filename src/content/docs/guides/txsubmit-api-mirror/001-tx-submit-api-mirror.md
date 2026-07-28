---
title: Tx Submit API Mirror
description: Run a compatible mirror of the Cardano transaction submit API.
---

A simple Cardano transaction submission API service which mirrors all incoming requests asynchronously to configured backend submission API services.

A simple HTTP API which accepts a CBOR encoded Cardano transaction as a payload body and submits it to one or more configured backend transaction submission API services.

## How do I actually use Tx Submit API Mirror?
Simply download the Tx Submit API Mirror binary file from blinklabs.io on to your node server. Configuration can be done using a config file or setting environment variables. 💡 Tip: Don't have a Cardano Node yet? Try [cardano-up](../../cardano-up/001-cardano-up)

✅ Get started with our [Quick Start](../002-quick-start) guide to start submitting transactions using Tx Submit API Mirror.
