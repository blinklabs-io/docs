---
title: Dingo
description: Introduction to Dingo.
---

![dingo-logo](/dingo-logo-250.png)

A Cardano blockchain data node written in Go which actively participates in network communications on the Cardano blockchain using the Ouroboros Network Node-to-Node family of mini-protocols.  

⚠️ This is a work in progress and is currently under heavy development

<br>

## How do I actually use Dingo?

In this guide we will walk you through getting the Dingo binary, downloading the Cardano configuration files and how to bootstrap the Dingo node using a Mithril snapshot. We will also explore how to use the Cardano CLI to interact with the Dingo node. Please note this guide will run the Dingo node using the Cardano Preview network.  

## Operator notes for v0.36.0

- Dingo now serves Blockfrost compatible native asset lookups at `GET /api/v0/assets/{asset}` when Blockfrost and API storage are enabled.
- Dingo now reports ledger era rollovers more precisely by tracking transition boundaries and confirmed safe epoch ends more explicitly.
- Dingo now keeps the network protocol major version from on chain parameters and sets the forged block header minor version to `69`, which makes Dingo produced blocks identifiable without changing era selection.
- Dingo now rejects unset, zero, and other non positive `K` values and stops immediately when the Ouroboros security parameter `K` is not configured.
- Single relay block producer deployments no longer hang when the trusted relay reconnects inbound first after a restart or crash.

✅ Get started with our [Quick Start](../002-quick-start-overview) guide.  
