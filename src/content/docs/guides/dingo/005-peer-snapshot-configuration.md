---
title: Peer Snapshot Configuration
description: Configure and validate a Dingo peer snapshot reference.
---

# Peer Snapshot Configuration

## Overview

This reference describes the `peerSnapshotFile` setting in Dingo's `topology.json` and the checks that a peer snapshot must pass at startup. Dingo accepts the cardano-node `peer-snapshot.json` format with `NodeToClientVersion: 23`.

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
- Retain `Point.blockPointSlot` as part of `Point`. This validation does not impose an additional constraint on its value.
- Populate exactly one of `bigLedgerPools` or `allLedgerPools`. Populate neither or both, and Dingo rejects the snapshot.
- Ensure that the selected pool list contains at least one pool.
- Ensure that every pool contains at least one relay.

## Relay requirements

Every relay in the selected pool list must meet all of the following requirements:

- Set a non-empty address to either a valid DNS hostname or a non-unspecified IP address.
- Set an explicit TCP port from `1` through `65535`.

Dingo does not support portless SRV relays or port `0`.

## Startup behavior

Dingo validates the complete peer snapshot before its relay endpoints can replace configured bootstrap peers. A malformed or inconsistent snapshot fails node startup before Dingo uses its endpoints; Dingo does not silently accept the snapshot.