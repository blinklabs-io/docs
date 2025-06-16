---
title: Tx Submit API
description: A guide about Tx Submit API.
---

![txsubmit-logo](/txsubmit-logo.png)

Tx Submit API is a Cardano transaction submit API service written in Go which takes CBOR encoded transaction payloads over HTTP and converts it to the Ouroboros Network LocalTxSubmission mini-protocol via gOuroboros. This project was funded in Project Catalyst Fund 9.

Tx Submit API submits transactions over HTTP making it a faster option for submitting transaction to the Cardano blockchain.

## How do I actually use Tx Submit API?
Simply download the Tx Submit API binary file from blinklabs.io on to your node server. Then run Tx Submit API in the server command line. Configuration can be done using a config file or setting environment variables

✅ Get started with our [Quick Start](../002-quick-start) guide to start submitting transactions over HTTP using Tx Submit API.
