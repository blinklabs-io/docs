---
title: Latest Releases
description: Dingo Release Notes
---

## v0.62.0 (July 9, 2026)

**Title:** Improved Mithril catch-up, operational certificate validation, and database lookups

**Date:** July 9, 2026

**Version:** v0.62.0

This release improves core catch-up safety, tightens block validation, speeds up transaction lookups, and expands Blockfrost asset holder coverage.

### Recommended Network Compatibility ⚠️

| Network             | Compatible |
|---------------------|------------|
| mainnet             | ⛔         |
| preprod-testnet     | ⛔         |
| preview-testnet     | ✅         |

### ✨ Highlights

* Improved core mode Mithril v2 catch-up so Dingo preserves immutable markers, detects divergence earlier, and reconciles stale ledger state without forcing a full resync when the chain still matches.

* Added inbound operational certificate validation for block headers and block apply so forged, expired, stale, or gapped certificate counters fail fast.

* Accelerated `SetTransaction` lookups in MySQL and Postgres by batching UTxO reads and indexing reference-input addresses for faster database access.

* Validated MySQL database names before `CREATE DATABASE` runs so startup failures from invalid target names surface earlier.

* Expanded the Blockfrost API with asset holder address lookup support.

### 🧪 Testing, Docs, and Tooling

* Created direct tests for `LedgerDelta.apply` to cover ledger delta application behavior.

* Updated the `gouroboros` dependency and aligned Dijkstra and Leios compatibility with upstream behavior.

* Refreshed the previous release note entry for `v0.61.4` to keep the release history current.

## Keep your Dingo Node current to ensure you're always running the latest performance boosts💪, new features✨, and critical fixes🔧. 

<br>

☑️ Select a version below to view the full release notes.

- Version: v0.61.4 - *[View Release Notes](../v0-61-4)*

- Version: v0.61.3 - *[View Release Notes](../v0-61-3)*

- Version: v0.61.2 - *[View Release Notes](../v0-61-2)*

- Version: v0.61.1 - *[View Release Notes](../v0-61-1)*

- Version: v0.61.0 - *[View Release Notes](../v0-61-0)*

- Version: v0.60.1 - *[View Release Notes](../v0-60-1)*

- Version: v0.60.0 - *[View Release Notes](../v0-60-0)*

- Version: v0.59.1 - *[View Release Notes](../v0-59-1)*

- Version: v0.59.0 - *[View Release Notes](../v0-59-0)*

- Version: v0.58.0 - *[View Release Notes](../v0-58-0)*
- Version: v0.57.0 - *[View Release Notes](../v0-57-0)*

- Version: v0.56.0 - *[View Release Notes](../v0-56-0)*

- Version: v0.55.0 - *[View Release Notes](../v0-55-0)*

- Version: v0.54.0 - *[View Release Notes](../v0-54-0)*

- Version: v0.53.0 - *[View Release Notes](../v0-53-0)*

- Version: v0.52.1 - *[View Release Notes](../v0-52-1)*

- Version: v0.52.0 - *[View Release Notes](../v0-52-0)*

- Version: v0.51.0 - *[View Release Notes](../v0-51-0)*

- Version: v0.50.2 - *[View Release Notes](../v0-50-2)*

- Version: v0.50.1 - *[View Release Notes](../v0-50-1)*

- Version: v0.50.0 - *[View Release Notes](../v0-50-0)*

- Version: v0.49.1 - *[View Release Notes](../v0-49-1)*

- Version: v0.49.0 - *[View Release Notes](../v0-49-0)*
- Version: v0.48.0 - *[View Release Notes](../v0-48-0)*

- Version: v0.47.1 - *[View Release Notes](../v0-47-1)*
- Version: v0.47.0 - *[View Release Notes](../v0-47-0)*
- Version: v0.46.4 - *[View Release Notes](../v0-46-4)*
- Version: v0.46.3 - *[View Release Notes](../v0-46-3)*
- Version: v0.46.2 - *[View Release Notes](../v0-46-2)*
- Version: v0.46.1 - *[View Release Notes](../v0-46-1)*
- Version: v0.39.1 - *[View Release Notes](../v0-39-1)*
