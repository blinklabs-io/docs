---
title: Release notes
---

# Release notes

## v0.180.0 - Dijkstra era support and Leios reliability fixes

- **Date:** 2026-06-02
- **Version:** 0.180.0

### Summary

This release introduces initial Dijkstra era support as the headline change, fixes `CIP-0164` Leios vote and endorser block certificate handling for stake based committees, corrects Leios stake and parameter handling, fixes rewards calculation for pools whose total rewards fall below the fixed fee, resolves `BlockFetch` invalid configuration panics, and includes dependency, formatting, test, and `RELEASE_NOTES.md` maintenance updates.

### New Features

* Added initial Dijkstra era support so applications can handle the new era more reliably.

### Bug Fixes

* Fixed `CIP-0164` Leios vote and endorser block certificate handling so stake based committees now process votes and certificates correctly.
* Corrected Leios stake and parameter handling so Dijkstra era settings stay consistent during startup and updates.
* Resolved rewards calculation for stake pools whose total rewards are lower than the fixed fee so reward distribution stays correct.
* Prevented `BlockFetch` invalid configuration panics so invalid settings now fail with clear errors.

### Additional Changes

* Refined rewards formatting cleanup around ledger reward calculation output.
* Tidied minor ledger test cleanups and coverage updates.
* Updated `github.com/blinklabs-io/plutigo` from `v0.1.13` to `v0.1.14`.
* Documented `RELEASE_NOTES.md` maintenance to add the prior `v0.179.0` entry.

## v0.179.0 - LeiosVotes mini-protocol

- **Date:** 2026-05-27
- **Version:** 0.179.0

### Summary

This release adds the LeiosVotes mini-protocol as the primary change for `CIP-0164` vote diffusion, connects it to library level protocol handling, expands embedded protocol references and limits guidance, and includes a release-history clarification update in `RELEASE_NOTES.md`.

### New Features

* Added the `LeiosVotes` mini-protocol so node to node integrations can diffuse `CIP-0164` votes through dedicated client and server handling.
* Expanded connection setup and embedded protocol references so `Connection.LeiosVotes()` and `WithLeiosVotesConfig` expose the new vote diffusion flow alongside updated limits, protocol documentation, and validation coverage.

### Additional Changes

* Documented the mistagging clarification in `RELEASE_NOTES.md` so release history now states that no versions were published between `v0.171.0` and `v0.178.0`.