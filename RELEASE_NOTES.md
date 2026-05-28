# Dingo Releases

## v0.49.0 (May 27, 2026)

**Title:** DingoSwap preview example, reward persistence, and sturdier sync handling

**Date:** May 27, 2026

**Version:** v0.49.0

Hi folks! Here’s what we shipped in v0.49.0.

### ✨ What's New

* Added **try a DingoSwap preview workflow with a ready made example:** Operators and developers can now use a local preview example to build, evaluate, and submit DingoSwap orders through Dingo on preview testnet. ([#2390](https://github.com/blinklabs-io/dingo/pull/2390))
* Introduced **receive merged Leios delivery through node to client sync:** Node to client consumers can now receive merged ranking block and endorsement block delivery together, which makes Leios preview behavior easier to follow through one sync path. ([#2392](https://github.com/blinklabs-io/dingo/pull/2392))
* Expanded **keep reward state available across restarts and recovery:** Reward snapshots, pool inputs, and related epoch boundary state now persist across restarts and rollback recovery, which gives operators steadier reward tracking. ([#2426](https://github.com/blinklabs-io/dingo/pull/2426))
* Delivered **follow current stake pool reward delegation rules more closely:** Reward handling now respects CIP-1694 stake pool reward account delegation semantics more closely, which keeps delegation outcomes aligned with current governance rules. ([#2378](https://github.com/blinklabs-io/dingo/pull/2378))

### 💪 Improvements

* Refined **keep the DingoSwap preview example easier to run locally:** The preview example now uses a leaner frontend setup, which makes the local DingoSwap workflow easier to run and maintain. ([#2431](https://github.com/blinklabs-io/dingo/pull/2431))

### 🔧 Fixes

* Fixed **return transaction rejection details in a clearer client friendly shape:** Transaction submission now returns rejection details in a format that clients can interpret more reliably when validation fails. ([#2427](https://github.com/blinklabs-io/dingo/pull/2427))
* Corrected **keep long running chainsync work from holding stale header state:** Chainsync now drops stale seen header state during normal operation, which helps long running sync behavior stay steadier. ([#2428](https://github.com/blinklabs-io/dingo/pull/2428))
* Strengthened **surface async chainsync failures more reliably during recovery:** Async roll forward and roll backward failures now surface more reliably, which makes sync problems easier to detect and recover from. ([#2419](https://github.com/blinklabs-io/dingo/pull/2419))

### 📋 What You Need to Know

* Clarified **follow normal upgrade steps for this release:** Normal upgrade steps are generally sufficient for this release.
* Highlighted **review the new DingoSwap example and merged Leios delivery:** The release adds a preview DingoSwap example and brings merged Leios ranking block and endorsement block delivery to node to client sync.
* Emphasized **expect steadier reward tracking and updated reward delegation behavior:** Reward state now persists across restarts and recovery, and stake pool reward account delegation now follows CIP-1694 semantics more closely.
* Summarized **trust sturdier mempool and chainsync reliability:** Transaction rejection details are clearer, chainsync holds less stale header state during normal operation, and async sync failures surface more reliably.

### Recommended Network Compatibility ⚠️

| Network             | Compatible |
|---------------------|------------|
| mainnet             | ⛔         |
| preprod-testnet     | ⛔         |
| preview-testnet     | ✅         |

### 🙏 Thank You

Thank you for trying!

---

## v0.48.0 (May 26, 2026)

**Title:** Backfill tuning, Mithril diagnostics, and sturdier sync recovery

**Date:** May 26, 2026

**Version:** v0.48.0

Hi folks! Here’s what we shipped in v0.48.0.

### ✨ What's New

* Added **tune historical backfill batch size more directly:** Operators can now adjust backfill batch size to better balance throughput and memory usage during historical indexing. ([#2389](https://github.com/blinklabs-io/dingo/pull/2389))
* Introduced **inspect Mithril sync with a dedicated debug port:** Operators can now use a debug and profiling port during Mithril sync, which makes long running sync behavior easier to inspect and troubleshoot. ([#2413](https://github.com/blinklabs-io/dingo/pull/2413))

## v0.48.0 (May 26, 2026)

**Title:** Backfill tuning, Mithril diagnostics, and sturdier sync recovery

**Date:** May 26, 2026

**Version:** v0.48.0

Hi folks! Here’s what we shipped in v0.48.0.

### ✨ What's New

* Added **tune historical backfill batch size more directly:** Operators can now adjust backfill batch size to better balance throughput and memory usage during historical indexing. ([#2389](https://github.com/blinklabs-io/dingo/pull/2389))
* Introduced **inspect Mithril sync with a dedicated debug port:** Operators can now use a debug and profiling port during Mithril sync, which makes long running sync behavior easier to inspect and troubleshoot. ([#2413](https://github.com/blinklabs-io/dingo/pull/2413))

### 💪 Improvements

* Improved **keep architecture guidance aligned with the current system:** Refreshed architecture documentation makes contributor and operator guidance easier to follow as the system evolves. ([#2391](https://github.com/blinklabs-io/dingo/pull/2391))
* Refined **keep HTTP handling aligned with current upstream expectations:** Updated HTTP handling now stays aligned with current upstream behavior, which supports steadier service operation. ([#2417](https://github.com/blinklabs-io/dingo/pull/2417))
* Enhanced **refresh build, runtime, and release dependencies:** Routine maintenance updates keep core build and runtime components current, which supports steadier compatibility across release workflows and supported integrations. ([#2405](https://github.com/blinklabs-io/dingo/pull/2405), [#2411](https://github.com/blinklabs-io/dingo/pull/2411), [#2406](https://github.com/blinklabs-io/dingo/pull/2406), [#2407](https://github.com/blinklabs-io/dingo/pull/2407), [#2412](https://github.com/blinklabs-io/dingo/pull/2412), [#2410](https://github.com/blinklabs-io/dingo/pull/2410), [#2409](https://github.com/blinklabs-io/dingo/pull/2409), [#2345](https://github.com/blinklabs-io/dingo/pull/2345))

### 🔧 Fixes

* Fixed **make Mithril downloads recover more defensively:** Mithril download handling now responds more safely to failure conditions, which helps long running sync work recover more reliably. ([#2387](https://github.com/blinklabs-io/dingo/pull/2387))
* Corrected **reduce memory pressure during heavier backfill work:** Database backfill now uses memory more efficiently, which helps heavier historical indexing runs behave more smoothly. ([#2415](https://github.com/blinklabs-io/dingo/pull/2415))
* Strengthened **keep ledger state reads more reliable during table parsing:** Ledger UTxO table parsing now behaves more reliably, which improves ledger state correctness during recovery and indexing flows. ([#2414](https://github.com/blinklabs-io/dingo/pull/2414))
* Stabilized **extract invalid transaction indexes during streaming work:** Invalid transaction index extraction now completes more reliably during streamed processing. ([#2416](https://github.com/blinklabs-io/dingo/pull/2416))
* Hardened **avoid races near the chain tip iterator:** Near tip chain traversal now behaves more steadily, which improves stability during recovery and indexing close to the tip. ([#2422](https://github.com/blinklabs-io/dingo/pull/2422))

### 📋 What You Need to Know

* Clarified **follow normal upgrade steps for this release:** Normal upgrade steps are generally sufficient for this release.
* Highlighted **tune backfill work for smoother historical indexing:** Operators can now adjust backfill batch size to balance resource usage more directly, and reduced backfill memory pressure should help heavier historical runs stay smoother. ([#2389](https://github.com/blinklabs-io/dingo/pull/2389), [#2415](https://github.com/blinklabs-io/dingo/pull/2415))
* Emphasized **troubleshoot Mithril sync with clearer visibility:** Mithril sync is easier to inspect because a dedicated debug port is available during sync, and download handling is more defensive during recovery. ([#2413](https://github.com/blinklabs-io/dingo/pull/2413), [#2387](https://github.com/blinklabs-io/dingo/pull/2387))
* Summarized **expect steadier ledger, backfill, and near tip recovery behavior:** Iterator, ledger parsing, and invalid index extraction fixes reduce several common sources of recovery and indexing trouble. ([#2422](https://github.com/blinklabs-io/dingo/pull/2422), [#2414](https://github.com/blinklabs-io/dingo/pull/2414), [#2416](https://github.com/blinklabs-io/dingo/pull/2416))

### Recommended Network Compatibility ⚠️

| Network             | Compatible |
|---------------------|------------|
| mainnet             | ⛔         |
| preprod-testnet     | ⛔         |
| preview-testnet     | ✅         |

### 🙏 Thank You

Thank you for trying!

---

## v0.48.0 (May 26, 2026)

**Title:** Backfill tuning, Mithril diagnostics, and sturdier sync recovery

**Date:** May 26, 2026

**Version:** v0.48.0

Hi folks! Here’s what we shipped in v0.48.0.

### ✨ What's New

* Added **tune historical backfill batch size more directly:** Operators can now adjust backfill batch size to better balance throughput and memory usage during historical indexing. ([#2389](https://github.com/blinklabs-io/dingo/pull/2389))
* Introduced **inspect Mithril sync with a dedicated debug port:** Operators can now use a debug and profiling port during Mithril sync, which makes long running sync behavior easier to inspect and troubleshoot. ([#2413](https://github.com/blinklabs-io/dingo/pull/2413))

## v0.48.0 (May 26, 2026)

**Title:** Backfill tuning, Mithril diagnostics, and sturdier sync recovery

**Date:** May 26, 2026

**Version:** v0.48.0

Hi folks! Here’s what we shipped in v0.48.0.

### ✨ What's New

* Added **tune historical backfill batch size more directly:** Operators can now adjust backfill batch size to better balance throughput and memory usage during historical indexing. ([#2389](https://github.com/blinklabs-io/dingo/pull/2389))
* Introduced **inspect Mithril sync with a dedicated debug port:** Operators can now use a debug and profiling port during Mithril sync, which makes long running sync behavior easier to inspect and troubleshoot. ([#2413](https://github.com/blinklabs-io/dingo/pull/2413))

### 💪 Improvements

* Improved **keep architecture guidance aligned with the current system:** Refreshed architecture documentation keeps contributor and operator guidance aligned with the current system. ([#2391](https://github.com/blinklabs-io/dingo/pull/2391))
* Refined **keep HTTP handling aligned with current upstream expectations:** Updated HTTP handling stays aligned with current upstream expectations, which supports steadier service behavior. ([#2417](https://github.com/blinklabs-io/dingo/pull/2417))
* Enhanced **refresh build and runtime maintenance dependencies:** Dependency and CI maintenance updates keep important build and runtime components current, which supports steadier maintenance and release workflows. ([#2405](https://github.com/blinklabs-io/dingo/pull/2405), [#2411](https://github.com/blinklabs-io/dingo/pull/2411), [#2406](https://github.com/blinklabs-io/dingo/pull/2406), [#2407](https://github.com/blinklabs-io/dingo/pull/2407), [#2412](https://github.com/blinklabs-io/dingo/pull/2412), [#2410](https://github.com/blinklabs-io/dingo/pull/2410), [#2409](https://github.com/blinklabs-io/dingo/pull/2409), [#2345](https://github.com/blinklabs-io/dingo/pull/2345))

### 🔧 Fixes

* Fixed **make Mithril downloads more defensive during recovery:** Mithril download handling now behaves more defensively, which helps long running sync work recover more reliably. ([#2387](https://github.com/blinklabs-io/dingo/pull/2387))
* Corrected **reduce memory pressure during heavier backfill work:** Database backfill now uses memory more efficiently, which helps heavier historical indexing runs behave more smoothly. ([#2415](https://github.com/blinklabs-io/dingo/pull/2415))
* Strengthened **keep ledger state parsing more reliable during recovery:** Ledger UTxO table parsing now behaves more reliably, which improves ledger state correctness during recovery and indexing work. ([#2414](https://github.com/blinklabs-io/dingo/pull/2414))
* Stabilized **extract invalid transaction indexes during streamed processing:** Invalid transaction index extraction now behaves more reliably during streamed processing. ([#2416](https://github.com/blinklabs-io/dingo/pull/2416))
* Hardened **avoid races near the chain tip iterator:** Near tip chain traversal now behaves more steadily, which improves stability during recovery and indexing close to the tip. ([#2422](https://github.com/blinklabs-io/dingo/pull/2422))

### 📋 What You Need to Know

* Clarified **follow normal upgrade steps for this release:** Normal upgrade steps are generally sufficient for this release.
* Highlighted **tune backfill work to balance resource usage more directly:** Operators can now adjust backfill batch size to better balance resource usage during historical indexing, and reduced backfill memory pressure should help heavier runs behave more smoothly. ([#2389](https://github.com/blinklabs-io/dingo/pull/2389), [#2415](https://github.com/blinklabs-io/dingo/pull/2415))
* Emphasized **inspect Mithril sync with clearer troubleshooting visibility:** Mithril troubleshooting is easier because a dedicated debug and profiling port is available during sync, and download handling is more defensive during recovery. ([#2413](https://github.com/blinklabs-io/dingo/pull/2413), [#2387](https://github.com/blinklabs-io/dingo/pull/2387))
* Summarized **expect steadier near tip and ledger backfill behavior:** Iterator, parsing, and invalid-index extraction fixes reduce several common sources of recovery and indexing trouble around near tip and ledger backfill work. ([#2422](https://github.com/blinklabs-io/dingo/pull/2422), [#2414](https://github.com/blinklabs-io/dingo/pull/2414), [#2416](https://github.com/blinklabs-io/dingo/pull/2416))

### Recommended Network Compatibility ⚠️

| Network             | Compatible |
|---------------------|------------|
| mainnet             | ⛔         |
| preprod-testnet     | ⛔         |
| preview-testnet     | ✅         |

### 🙏 Thank You

Thank you for trying!

---

## v0.47.1 (May 22, 2026)

**Title:** Safer plateau recovery, correct governance refunds, and hydrated snapshot imports

**Date:** May 22, 2026

**Version:** v0.47.1

Hi folks! Here’s what we shipped in v0.47.1.

### ✨ What's New

* Noted **no new features in this patch release:** This patch release focuses on reliability and correctness updates. ([#2377](https://github.com/blinklabs-io/dingo/pull/2377))

### 💪 Improvements

* Improved **keep governance rewards and refunds on active reward accounts only:** Governance reward payouts and expired proposal deposit refunds now credit only active existing reward accounts, while unclaimed amounts return safely to treasury and treasury withdrawal capacity stays enforced across the epoch. ([#2371](https://github.com/blinklabs-io/dingo/pull/2371))

### 🔧 Fixes

* Corrected **preserve snapshot imported transaction output history during bulk import:** Snapshot imports now keep the origin and added slot details for imported transaction outputs, which makes historical lookups and ordering more accurate after bulk import. ([#2364](https://github.com/blinklabs-io/dingo/pull/2364))
* Strengthened **recover same slot fork plateaus without manual restarts:** Nodes now reconcile live ledger divergence before recycling peers, which helps same slot fork stalls recover more safely without requiring a manual restart. ([#2377](https://github.com/blinklabs-io/dingo/pull/2377))

### 📋 What You Need to Know

* Clarified **follow normal patch release upgrade steps:** Normal patch release upgrade steps are generally sufficient for this release.
* Highlighted **expect safer recovery from same slot fork plateaus:** Nodes can now recover from same slot fork plateaus more safely without manual restarts because live ledger reconciliation happens before peer recycling. ([#2377](https://github.com/blinklabs-io/dingo/pull/2377))
* Emphasized **trust corrected governance refunds and treasury handling:** Missing or inactive reward accounts no longer receive governance rewards or expired proposal deposit refunds, and unclaimed amounts return to treasury while treasury withdrawal limits stay enforced across the epoch. ([#2371](https://github.com/blinklabs-io/dingo/pull/2371))
* Summarized **expect more accurate snapshot imported history after bulk import:** Snapshot imported transaction outputs now keep provenance and added slot details more accurately, which improves historical behavior after bulk import. ([#2364](https://github.com/blinklabs-io/dingo/pull/2364))

### Recommended Network Compatibility ⚠️

| Network             | Compatible |
|---------------------|------------|
| mainnet             | ⛔         |
| preprod-testnet     | ⛔         |
| preview-testnet     | ✅         |

### 🙏 Thank You

Thank you for trying!

---
# Dingo Releases

## v0.49.0 (May 27, 2026)

**Title:** DingoSwap preview example, reward persistence, and sturdier sync handling

**Date:** May 27, 2026

**Version:** v0.49.0

Hi folks! Here’s what we shipped in v0.49.0.

### ✨ What's New

* Added **explore DingoSwap on preview with a ready made example:** Operators and developers can now try a local DingoSwap preview workflow that shows how to build and submit swaps through Dingo on preview testnet. ([#2390](https://github.com/blinklabs-io/dingo/commit/557457ed57514a84d478bde9ea2ba727181cd5e8))
* Introduced **serve merged Leios delivery through node to client sync:** Node to client consumers can now receive merged ranking and endorsement data together, which makes Leios preview flows easier to follow through a single sync path. ([#2392](https://github.com/blinklabs-io/dingo/commit/6aca1f8baf49c7e0585e2e12525e77529275da51))
* Expanded **keep reward state available across restarts:** Reward snapshots, pool inputs, and related state now persist across restarts and rollbacks, which gives operators steadier reward tracking through epoch transitions and recovery. ([#2426](https://github.com/blinklabs-io/dingo/commit/72f2f3b8bcf58d2ddab4a47be11d33bc60553aa8))
* Delivered **respect current stake pool reward delegation rules:** Reward handling now follows CIP-1694 stake pool reward account delegation semantics more closely, which keeps reward behavior aligned with current governance expectations. ([#2378](https://github.com/blinklabs-io/dingo/commit/52c50da74ecaa1f735bf7efa56aa513efea8ec40))

### 💪 Improvements

* Refined **keep the DingoSwap preview example easier to run locally:** The preview example now uses a leaner frontend setup, which makes the local DingoSwap workflow easier to run and maintain. ([#2431](https://github.com/blinklabs-io/dingo/commit/fa925c86b8c366fde3b5ecc1f534915672321b47))

### 🔧 Fixes

* Fixed **return clearer transaction rejection details during submission:** Transaction submission now returns rejection details in a shape that clients can handle more reliably when a transaction fails validation. ([#2427](https://github.com/blinklabs-io/dingo/commit/532dc7fc6787b42410aae8cbf37ea82655dece75))
* Corrected **keep chainsync header tracking from growing during normal operation:** Header tracking now clears older entries during routine sync work, which helps chainsync stay steadier over long runs. ([#2428](https://github.com/blinklabs-io/dingo/commit/1d78a8f47b614cc1c13ccf672fc777fc652c1929))
* Strengthened **surface chainsync failures more reliably during async handling:** Async roll forward and roll backward failures now propagate more reliably, which makes sync problems easier to detect and recover from. ([#2419](https://github.com/blinklabs-io/dingo/commit/d5e822d33711a23c559ee0e8eece158f1d55df1a))

### 📋 What You Need to Know

* Clarified **follow normal upgrade steps for this release:** Normal upgrade steps are generally sufficient for this release.
* Highlighted **review the new DingoSwap example and merged Leios delivery:** The release adds a preview DingoSwap example and brings merged Leios ranking and endorsement delivery to node to client sync.
* Emphasized **expect steadier reward tracking and updated reward delegation behavior:** Reward state now persists across restarts and recovery, and stake pool reward delegation handling now follows CIP-1694 semantics more closely.
* Summarized **trust sturdier mempool and chainsync reliability:** Transaction rejection details are clearer, chainsync header tracking stays leaner during normal operation, and async sync failures surface more reliably.

### Recommended Network Compatibility ⚠️

| Network             | Compatible |
|---------------------|------------|
| mainnet             | ⛔         |
| preprod-testnet     | ⛔         |
| preview-testnet     | ✅         |

### 🙏 Thank You

Thank you for trying!

---

## v0.48.0 (May 26, 2026)

**Title:** Backfill tuning, Mithril diagnostics, and sturdier sync recovery

**Date:** May 26, 2026

**Version:** v0.48.0

Hi folks! Here’s what we shipped in v0.48.0.

### ✨ What's New

* Added **tune historical backfill batch size more directly:** Operators can now adjust backfill batch size to better balance throughput and memory usage during historical indexing. ([#2389](https://github.com/blinklabs-io/dingo/pull/2389))
* Introduced **inspect Mithril sync with a dedicated debug port:** Operators can now use a debug and profiling port during Mithril sync, which makes long running sync behavior easier to inspect and troubleshoot. ([#2413](https://github.com/blinklabs-io/dingo/pull/2413))

## v0.48.0 (May 26, 2026)

**Title:** Backfill tuning, Mithril diagnostics, and sturdier sync recovery

**Date:** May 26, 2026

**Version:** v0.48.0

Hi folks! Here’s what we shipped in v0.48.0.

### ✨ What's New

* Added **tune historical backfill batch size more directly:** Operators can now adjust backfill batch size to better balance throughput and memory usage during historical indexing. ([#2389](https://github.com/blinklabs-io/dingo/pull/2389))
* Introduced **inspect Mithril sync with a dedicated debug port:** Operators can now use a debug and profiling port during Mithril sync, which makes long running sync behavior easier to inspect and troubleshoot. ([#2413](https://github.com/blinklabs-io/dingo/pull/2413))

### 💪 Improvements

* Improved **keep architecture guidance aligned with the current system:** Refreshed architecture documentation makes contributor and operator guidance easier to follow as the system evolves. ([#2391](https://github.com/blinklabs-io/dingo/pull/2391))
* Refined **keep HTTP handling aligned with current upstream expectations:** Updated HTTP handling now stays aligned with current upstream behavior, which supports steadier service operation. ([#2417](https://github.com/blinklabs-io/dingo/pull/2417))
* Enhanced **refresh build, runtime, and release dependencies:** Routine maintenance updates keep core build and runtime components current, which supports steadier compatibility across release workflows and supported integrations. ([#2405](https://github.com/blinklabs-io/dingo/pull/2405), [#2411](https://github.com/blinklabs-io/dingo/pull/2411), [#2406](https://github.com/blinklabs-io/dingo/pull/2406), [#2407](https://github.com/blinklabs-io/dingo/pull/2407), [#2412](https://github.com/blinklabs-io/dingo/pull/2412), [#2410](https://github.com/blinklabs-io/dingo/pull/2410), [#2409](https://github.com/blinklabs-io/dingo/pull/2409), [#2345](https://github.com/blinklabs-io/dingo/pull/2345))

### 🔧 Fixes

* Fixed **make Mithril downloads recover more defensively:** Mithril download handling now responds more safely to failure conditions, which helps long running sync work recover more reliably. ([#2387](https://github.com/blinklabs-io/dingo/pull/2387))
* Corrected **reduce memory pressure during heavier backfill work:** Database backfill now uses memory more efficiently, which helps heavier historical indexing runs behave more smoothly. ([#2415](https://github.com/blinklabs-io/dingo/pull/2415))
* Strengthened **keep ledger state reads more reliable during table parsing:** Ledger UTxO table parsing now behaves more reliably, which improves ledger state correctness during recovery and indexing flows. ([#2414](https://github.com/blinklabs-io/dingo/pull/2414))
* Stabilized **extract invalid transaction indexes during streaming work:** Invalid transaction index extraction now completes more reliably during streamed processing. ([#2416](https://github.com/blinklabs-io/dingo/pull/2416))
* Hardened **avoid races near the chain tip iterator:** Near tip chain traversal now behaves more steadily, which improves stability during recovery and indexing close to the tip. ([#2422](https://github.com/blinklabs-io/dingo/pull/2422))

### 📋 What You Need to Know

* Clarified **follow normal upgrade steps for this release:** Normal upgrade steps are generally sufficient for this release.
* Highlighted **tune backfill work for smoother historical indexing:** Operators can now adjust backfill batch size to balance resource usage more directly, and reduced backfill memory pressure should help heavier historical runs stay smoother. ([#2389](https://github.com/blinklabs-io/dingo/pull/2389), [#2415](https://github.com/blinklabs-io/dingo/pull/2415))
* Emphasized **troubleshoot Mithril sync with clearer visibility:** Mithril sync is easier to inspect because a dedicated debug port is available during sync, and download handling is more defensive during recovery. ([#2413](https://github.com/blinklabs-io/dingo/pull/2413), [#2387](https://github.com/blinklabs-io/dingo/pull/2387))
* Summarized **expect steadier ledger, backfill, and near tip recovery behavior:** Iterator, ledger parsing, and invalid index extraction fixes reduce several common sources of recovery and indexing trouble. ([#2422](https://github.com/blinklabs-io/dingo/pull/2422), [#2414](https://github.com/blinklabs-io/dingo/pull/2414), [#2416](https://github.com/blinklabs-io/dingo/pull/2416))

### Recommended Network Compatibility ⚠️

| Network             | Compatible |
|---------------------|------------|
| mainnet             | ⛔         |
| preprod-testnet     | ⛔         |
| preview-testnet     | ✅         |

### 🙏 Thank You

Thank you for trying!

---