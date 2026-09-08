---
title: Peer Snapshot Configuration
description: Configure and validate a Dingo peer snapshot reference.
---

# Peer Snapshot Configuration

## Overview

This reference describes the `peerSnapshotFile` setting in Dingo's `topology.json` and the checks that a peer snapshot must pass at startup. The supported snapshot format is cardano-node's `peer-snapshot.json` with `NodeToClientVersion` set to `23`.

## Configure `peerSnapshotFile`

Add `peerSnapshotFile` to `topology.json` to reference a peer snapshot:

```json
{
  "peerSnapshotFile": "peer-snapshot.json"
}
```

Dingo resolves the `peerSnapshotFile` path relative to the `topology.json` file.

## Snapshot requirements

The snapshot must meet all of the following requirements:

- Set `NodeToClientVersion` to `23`.
- Specify `NetworkMagic` and set it to the node's configured network magic.
- Set `Point.blockPointHash` to exactly 64 hexadecimal characters, representing 32 bytes.
- Include `Point.blockPointSlot` as part of `Point`. Dingo applies no additional constraint to its value.
- Populate exactly one of `bigLedgerPools` or `allLedgerPools`. Leave both lists empty or populate both lists, and Dingo rejects the snapshot.
- Add at least one pool to the populated list.
- Add at least one relay to every pool.

## Relay requirements

Apply all of the following requirements to every relay in the populated pool list:

- Give each relay a non-empty address that names either a valid DNS hostname or a non-unspecified IP address.
- Give each relay an explicit TCP port from `1` through `65535`.

Dingo rejects portless SRV relays and port `0`.

## Startup behavior

Dingo validates the complete peer snapshot before its relay endpoints can replace configured bootstrap peers. If the snapshot is malformed or inconsistent, Dingo stops node startup before it uses the relay endpoints and does not silently accept the snapshot.

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
