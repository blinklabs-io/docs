---
title: Topology Configuration Validation
description: Validate Dingo topology.json access points and root valencies.
---

# Topology Configuration Validation

## Overview

This reference describes the validation Dingo applies while loading `topology.json`. Dingo validates the decoded topology before the loader returns the configuration. When a rule fails, the loader returns an error instead of a topology configuration.

## Validated topology collections

Dingo validates access points in these JSON paths:

- `localRoots[*].accessPoints[*]`
- `publicRoots[*].accessPoints[*]`
- `bootstrapPeers[*]`

The `[*]` segments represent the root and access point array indexes. Each `bootstrapPeers[*]` entry directly contains an address and port.

## Access point validation

Every access point in the three collections must meet both requirements:

- `address` must contain at least one non-whitespace character. An empty or whitespace-only value fails validation.
- `port` must use the inclusive TCP range from `1` through `65535`.

Validation errors identify the affected collection and array indexes. Errors for root access points identify the root and access point, such as `localRoots[index].accessPoints[index]` or `publicRoots[index].accessPoints[index]`. Errors for bootstrap peers identify the peer, such as `bootstrapPeers[index]`.

## Root valency rules

Dingo applies the following rules to every entry in `localRoots` and `publicRoots`:

- When `warmValency` is nonzero, `warmValency` must be less than or equal to `valency` (`warmValency <= valency`).
- When `accessPoints` contains one or more entries, `valency` must be less than or equal to the number of access points (`valency <= len(accessPoints)`).

An empty `accessPoints` list is valid. Dingo skips the access point count comparison for an empty list, but it still applies the `warmValency <= valency` rule when `warmValency` is nonzero.

## Bootstrap peer scope

Dingo applies only the address and port requirements to `bootstrapPeers`. Bootstrap peers do not use the `warmValency` or `valency` rules that apply to local and public roots.

For `peerSnapshotFile` and peer snapshot relay validation, see [Peer Snapshot Configuration](./005-peer-snapshot-configuration).

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>