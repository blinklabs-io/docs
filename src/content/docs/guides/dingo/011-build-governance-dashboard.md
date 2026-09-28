---
title: Build a Governance Dashboard
description: Choose a supported Dingo interface for Cardano governance data and understand metadata database risks.
---

A governance dashboard can combine proposal and vote information with live
chain state. First decide which data your product needs and which Dingo
interface exposes it. Dingo's [Blockfrost-compatible API and other application
interfaces](/guides/dingo/006-apis-and-archive/) are the preferred starting
point for supported client integrations.

## Reading indexed metadata

Some deployments may choose to query Dingo's PostgreSQL metadata database when
they need indexed fields that are not available from a supported API. This is
an implementation-specific integration: database tables and columns are not a
stable public API, can change between releases, and may be incomplete while
historical metadata backfill is running. Consult the [Dingo database
design](https://github.com/blinklabs-io/dingo/blob/main/DATABASE.md) for the
release you operate, pin your integration to a tested Dingo version, and
revalidate it after upgrades.

If you use this approach:

- Give the dashboard a database role with read-only access. Never expose the
  database to a browser or public network.
- Show data freshness and backfill status. A fast Mithril bootstrap can make
  the node usable before historical governance metadata has finished filling
  in.
- Treat absent rows as potentially unavailable or not yet indexed, rather than
  proof that an on-chain action did not happen.
- Verify retention and feature-flag behavior for every field you display;
  some history is intentionally pruned, and optional tracking may need to be
  enabled before the relevant chain events occur.
- Use a supported governance application for proposing, voting, and signing.
  A read-only dashboard should not request wallet keys or submit governance
  transactions.

For Go library API documentation, use
[pkg.go.dev](https://pkg.go.dev/github.com/blinklabs-io/dingo). The Go library
reference does not make internal database tables a supported integration
contract.
