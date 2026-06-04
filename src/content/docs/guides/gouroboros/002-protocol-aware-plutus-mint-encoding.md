---
title: Protocol aware Plutus mint encoding
description: Understand how gOuroboros encodes Plutus V1 and V2 txInfoMint across protocol versions.
---

## Overview

gOuroboros introduced protocol aware `txInfoMint` encoding in release `v0.180.1`. The change affects Plutus V1 and Plutus V2 script contexts only. It changes how `txInfoMint` is encoded inside the script context so the encoded result follows the active protocol major version.

This guide covers script context encoding behavior. It does not describe a general transaction format change. It also does not target Plutus V3, because the referenced change applies specifically to Plutus V1 and Plutus V2 mint handling.

## Behavior by protocol version

gOuroboros now checks the active protocol major version when it builds `txInfoMint` for Plutus V1 and Plutus V2 script contexts.

- For protocol versions before PV10, gOuroboros keeps the previous mint encoding behavior.
- For PV10 and later, gOuroboros prepends a zero ADA mint entry to `txInfoMint` so the encoded result matches `cardano-ledger` behavior.
- The PV10 and later rule also applies when nothing is minted. The script context still includes the zero ADA mint entry in the encoded `txInfoMint` value.

In practical terms, the same transaction can produce different script context CBOR when the protocol version changes. Before PV10, `txInfoMint` omits the extra zero ADA mint entry. On PV10 and later, `txInfoMint` includes that entry first.

## Where gOuroboros applies the rule

gOuroboros now carries `ProtocolMajor` into `TxInfoV1` and `TxInfoV2`. It uses that value when it builds script contexts under Conway rules and under Dijkstra rules.

That means the behavior follows the ledger rules that apply at the time of script context construction:

- Conway path builds Plutus V1 and V2 script contexts with the active protocol major version.
- Dijkstra path builds Plutus V1 and V2 script contexts with the active protocol major version.
- Both paths use that version to decide whether `txInfoMint` keeps the earlier encoding or receives the zero ADA entry for PV10 and later.

## What to check when CBOR differs

When script context CBOR differs during inspection, diffing, or parity checks, confirm the protocol major version first.

1. Check whether the transaction ran under a protocol version before PV10 or under PV10 and later.
2. Expect the extra zero ADA mint entry only on PV10 and later for Plutus V1 and Plutus V2 `txInfoMint`.
3. Treat a pre PV10 versus PV10 and later difference as a protocol version effect, not as a transaction content mismatch.
4. Compare results against node or ledger tooling with the same protocol version in mind.

This matters most when an integration compares raw CBOR bytes or validates script context parity against node or ledger tooling. Without the protocol version check, a comparison can report a mismatch even when the transaction content is the same.

## Summary

Release `v0.180.1` makes gOuroboros encode Plutus V1 and Plutus V2 `txInfoMint` in a protocol aware way. Pre PV10 behavior stays the same, while PV10 and later prepend a zero ADA mint entry so script context encoding matches `cardano-ledger`, including the case where nothing is minted. Integrations that compare CBOR should account for the active protocol major version before treating mint encoding differences as regressions.