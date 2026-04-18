---
title: Dingo
description: Introduction to Dingo.
---

![dingo-logo](/dingo-logo-250.png)

A Cardano blockchain data node written in Go which actively participates in network communications on the Cardano blockchain using the Ouroboros Network Node-to-Node family of mini-protocols.  

⚠️ This is a work in progress and is currently under heavy development

> **Note**
> As of v0.35.2, Dingo bounds hard-fork era history for the current open era to the current ledger tip plus the protocol safe zone. This matches the safe forecast horizon instead of implying certainty through the full epoch end. Advanced clients and operators that perform slot to time or time to slot conversions from Dingo should only expect reliable forecasts within that horizon.

<br>

## How do I actually use Dingo?

In this guide we will walk you through getting the Dingo binary, downloading the Cardano configuration files and how to bootstrap the Dingo node using a Mithril snapshot. We will also explore how to use the Cardano CLI to interact with the Dingo node. Please note this guide will run the Dingo node using the Cardano Preview network.  

✅ Get started with our [Quick Start](../002-quick-start-overview) guide.  
