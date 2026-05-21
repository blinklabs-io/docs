---
title: Dingo
description: Introduction to Dingo.
---

![dingo-logo](/dingo-logo-250.png)

A Cardano blockchain data node written in Go which actively participates in network communications on the Cardano blockchain using the Ouroboros Network Node-to-Node family of mini-protocols.  

## Notable sync and API changes in v0.47.0

- Configure `chainsyncStallTimeout` to tune how long Dingo waits before it treats a stalled chain sync as a problem.
- Dingo now includes the Mithril trust boundary when it selects sync resume points, detects idle Mithril snapshot stalls, and retries or resumes stalled downloads. This gives operators safer resume behavior after interrupted bootstrap or catch up.
- API storage mode now retains spent UTxOs for historical API queries. This gives historical API queries better completeness by intentionally keeping spent output history available.
- API mode backfill now finishes faster through lighter input address lookup, refreshed SQLite planning data before backfill, and fewer repeated Mithril spent output position writes.
- `WaitForTx` streams now stop at a server side timeout instead of waiting forever.
- Dingo now preserves rollback and roll forward order for `ledger.chainsync` events by waiting for delivery when order matters.
- Dingo now supports reverse chain iteration for components that need backward traversal.

⚠️ This is a work in progress and is currently under heavy development

<br>

## How do I actually use Dingo?

In this guide we will walk you through getting the Dingo binary, downloading the Cardano configuration files and how to bootstrap the Dingo node using a Mithril snapshot. We will also explore how to use the Cardano CLI to interact with the Dingo node. Please note this guide will run the Dingo node using the Cardano Preview network.  

✅ Get started with our [Quick Start](../002-quick-start-overview) guide.  
