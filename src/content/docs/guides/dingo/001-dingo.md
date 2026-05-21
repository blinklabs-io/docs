---
title: Dingo
description: Introduction to Dingo.
---

![dingo-logo](/dingo-logo-250.png)

A Cardano blockchain data node written in Go which actively participates in network communications on the Cardano blockchain using the Ouroboros Network Node-to-Node family of mini-protocols.  

## Notable sync and API changes in v0.47.0

- Configure `chainsyncStallTimeout` to tune how long Dingo waits before it treats a stalled chain sync as a problem.
- Dingo now includes the Mithril trust boundary when it selects sync intersect points, detects idle Mithril stalls, and retries or resumes after stalled snapshot downloads. This gives operators safer resume behavior after interrupted bootstrap or catch up.
- API storage mode now retains spent UTxOs for historical API queries. This gives historical API queries better completeness by intentionally keeping spent output history available.
- API mode backfill now finishes faster through lightweight input address lookup, SQLite planner statistics before backfill, and fewer duplicate Mithril UTxO offset writes.
- `WaitForTx` streams now stop at a server side timeout instead of waiting forever.
- Dingo now delivers ordering critical `ledger.chainsync` events in blocking mode so rollback and roll forward order stays intact.
- Dingo now supports reverse chain iteration for components that need backward traversal.

⚠️ This is a work in progress and is currently under heavy development

<br>

## How do I actually use Dingo?

In this guide we will walk you through getting the Dingo binary, downloading the Cardano configuration files and how to bootstrap the Dingo node using a Mithril snapshot. We will also explore how to use the Cardano CLI to interact with the Dingo node. Please note this guide will run the Dingo node using the Cardano Preview network.  

✅ Get started with our [Quick Start](../002-quick-start-overview) guide.  
