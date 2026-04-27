---
title: Dingo
description: Introduction to Dingo.
---

![dingo-logo](/dingo-logo-250.png)

A Cardano blockchain data node written in Go which participates in network communications on Cardano and supports Ouroboros Genesis bootstrap for from origin sync, Mithril snapshot bootstrap, Conway and CIP-1694 governance state handling, Blockfrost compatible API endpoints, and operator facing peer governor policies and observability.  

⚠️ This is a work in progress and is currently under heavy development

<br>

- During initial sync, Genesis mode prefers observed density and returns to Praos automatically when bootstrap completes.
- Mithril bootstrap and resume behavior is more reliable, and API capable storage mode now makes backfill and checkpoint state after snapshot import more important.
- Governance support now covers committee and quorum state, proposal and vote processing, and richer delegation and reward account queries.
- Blockfrost support now covers block lookup by hash or height plus `/network`, `/network/eras`, and `/genesis`.

Operators now have broader control and observability over peer governor behavior, including inbound budgeting, admission identity and metadata, intentional inbound hot promotion, and inbound prune and cooldown policies.

## How do I actually use Dingo?

This guide covers getting the Dingo binary, creating configuration, bootstrapping with Mithril, understanding API capable storage mode, and using Cardano CLI and local state style queries against Dingo on the Cardano Preview network.  

✅ Start with the [Quick Start](../002-quick-start-overview) guide for setup, then use the CLI guide for querying and inspection.  
