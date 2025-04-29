---
title: Overview
description: A guide about Cardano Node API.
---

# Cardano Node API

An HTTP API for interfacing with a local Cardano Node and providing the node internal data for HTTP clients. This service communicates with a Cardano full node using the Ouroboros network protocol via a UNIX socket and exposes the underlying Node-to-Client (NtC) Ouroboros mini-protocols to clients via a REST API or UTxO RPC gRPC API.  

<br>

Cardano Node API is a service written in Go which communicates with a Cardano Node over its private interface and provides a featureful set of HTTP APIs built on collaborative standards.

## How do I actually use Cardano Node API?
Simply download the Cardano Node API binary file from blinklabs.io on to your node server. Then run Cardano Node API in the server command line. Configuration can be done using a config file or setting environment variables

<br>

✅ Get started with our [Quick Start](../002-quick-start) guide to start using Cardano Node API.

![node-api-logo](/node-api-logo.png)
