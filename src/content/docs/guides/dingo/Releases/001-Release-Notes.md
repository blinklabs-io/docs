---
title: Latest Releases
description: Dingo Release Notes
---

## Keep your Dingo Node current to ensure you're always running the latest performance boosts💪, new features✨, and critical fixes🔧.

<br>

☑️ Select a version below to view the full release notes.

## v0.68.0 (July 28, 2026)

**Title:** Expand Blockfrost coverage, harden recovery, and update dependencies

**Date:** July 28, 2026

**Version:** v0.68.0

This release expands Blockfrost coverage, tightens UTxO and snapshot handling, improves recovery and startup safety, and updates core dependencies.

### Recommended Network Compatibility ⚠️

| Network             | Compatible |
|---------------------|------------|
| mainnet             | ⛔         |
| preprod-testnet     | ✅         |
| preview-testnet     | ✅         |
| musashi             | ✅         |

### ✨ Highlights

* Recorded the v0.67.1 release entry so the release index stays complete.

* Preserved the live stake index during API backfill so backfilled data keeps stake history available.

* Aligned the DRep list and response with Blockfrost expectations so governance lookups return the same shape across endpoints.

* Added Blockfrost support for `GET /addresses/{address}` so address lookups return Blockfrost compatible responses.

* Bumped `bark` to keep the release dependency set current.

* Fixed pointer snapshot UTxO handling so snapshots stay consistent during pointer based queries.

* Enabled `stake-address-info` LSQ queries so stake address lookups can return the expected ledger state.

* Updated the example `@blaze-cardano/sdk` dependency to keep the sample app current.

* Refined the AWS SDK for Go v2 dependency to the newer release.

* Upgraded `cloud.google.com/go/storage` to the newer release.

* Renewed DRep activity from certificates so governance lookups stay current.

* Corrected the AWS SDK for Go v2 credentials dependency to the newer release.

* Matched exact-address UTxO lookups across Blockfrost and UTxO-RPC so both interfaces return the same outputs.

* Refactored the plugin system and kept configuration migration compatible with existing setups.

* Synced the AWS SDK for Go v2 config dependency to the newer release.

* Improved rollback ordering in Ouroboros so rollback observation happens before the apply gate advances.

- Version: v0.67.1 - *[View Release Notes](../v0-67-1)*

- Version: v0.67.0 - *[View Release Notes](../v0-67-0)*

- Version: v0.66.2 - *[View Release Notes](../v0-66-2)*

- Version: v0.66.1 - *[View Release Notes](../v0-66-1)*

- Version: v0.66.0 - *[View Release Notes](../v0-66-0)*

- Version: v0.65.1 - *[View Release Notes](../v0-65-1)*

- Version: v0.65.0 - *[View Release Notes](../v0-65-0)*

- Version: v0.64.0 - *[View Release Notes](../v0-64-0)*

- Version: v0.63.1 - *[View Release Notes](../v0-63-1)*

- Version: v0.63.0 - *[View Release Notes](../v0-63-0)*

- Version: v0.62.0 - *[View Release Notes](../v0-62-0)*

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
