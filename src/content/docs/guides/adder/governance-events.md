---
title: Governance Event Schema Reference
description: Reference for Adder input.governance events and governance deposit fields.
---

# Governance Event Schema

## Overview

This reference describes the `input.governance` event emitted for a transaction that contains Cardano governance data. The event identifies the transaction and chain position, then groups proposal, voting, certificate, and committee data in the `payload` object.

Adder emits one `input.governance` event for each transaction that contains governance data. Adder omits the event when a transaction contains no governance data. Adder can emit the same transaction again after a rollback or replay.

## Event envelope

The event contains these top-level fields:

| Field | Type | Description |
| :--- | :--- | :--- |
| `timestamp` | string | Event timestamp. |
| `type` | string | Always `input.governance`. |
| `context` | object | Transaction and chain position data. |
| `payload` | object | Block data and governance structures. |

### `context`

The `context` object identifies the transaction and its position on the chain.

| Field | Type | Description |
| :--- | :--- | :--- |
| `transactionHash` | string | 32-byte transaction hash in hexadecimal form. |
| `blockNumber` | number | Absolute block height. |
| `slotNumber` | number | Slot number of the block. |
| `transactionIdx` | number | Zero-based transaction index within the block. |
| `networkMagic` | number | Network magic value for the connected node. |

### `payload`

The `payload` object contains the block hash and governance arrays. Adder omits an array when it contains no items.

| Field | Type | Description |
| :--- | :--- | :--- |
| `blockHash` | string | Block hash in hexadecimal form. |
| `transactionCbor` | string | Transaction CBOR in hexadecimal form when `--input-chainsync-include-cbor` is enabled. |
| `proposalProcedures` | array | Governance actions proposed in the transaction. |
| `votingProcedures` | array | Votes cast in the transaction. |
| `drepCertificates` | array | DRep registration, update, and deregistration certificates. |
| `voteDelegationCertificates` | array | Stake credential to DRep vote delegation certificates. |
| `committeeCertificates` | array | Constitutional Committee authorization and resignation certificates. |

## Governance structures

### `proposalProcedures[]`

Each item represents a proposed governance action.

| Field | Type | Description |
| :--- | :--- | :--- |
| `index` | number | Proposal index within the transaction. |
| `deposit` | number (`uint64`) | Proposal deposit in Lovelaces. Adder emits the field as a non-negative unsigned 64-bit value. |
| `rewardAccount` | string | Stake or reward address that receives the deposit after completion. |
| `actionType` | string | One of `ParameterChange`, `HardForkInitiation`, `TreasuryWithdrawal`, `NoConfidence`, `UpdateCommittee`, `NewConstitution`, `Info`, or `Unknown`. |
| `actionData` | object | Data for the selected action type. |
| `anchor` | object | Governance metadata with `url` and `dataHash` strings. |

### `votingProcedures[]`

Each item represents a vote on an active proposal.

| Field | Type | Description |
| :--- | :--- | :--- |
| `voterType` | string | `DRep`, `SPO`, `CCHot`, or `Unknown`. |
| `voterHash` | string | Voter credential hash in hexadecimal form. |
| `voterId` | string | Bech32 voter identifier, such as `drep1...`. |
| `govActionTxId` | string | Transaction ID of the governance action. |
| `govActionIndex` | number | Governance action index within that transaction. |
| `vote` | string | `Yes`, `No`, `Abstain`, or `Unknown`. |
| `anchor` | object | Governance metadata with `url` and `dataHash` strings. |

### `drepCertificates[]`

Each item represents a change to a DRep status.

| Field | Type | Description |
| :--- | :--- | :--- |
| `certificateType` | string | `Registration`, `Update`, or `Deregistration`. |
| `drepHash` | string | DRep credential hash in hexadecimal form. |
| `drepId` | string | Bech32 DRep ID, such as `drep1...` or `drep_script1...`. |
| `deposit` | number (`uint64`) | Lovelace deposit for registration or deregistration. Adder emits the field as a non-negative unsigned 64-bit value when present and omits it when its value is zero. |
| `anchor` | object | DRep metadata with `url` and `dataHash` strings. |

### `voteDelegationCertificates[]`

Each item represents a stake address delegating voting power to a DRep or a predefined state.

| Field | Type | Description |
| :--- | :--- | :--- |
| `certificateType` | string | One of `VoteDelegation`, `StakeVoteDelegation`, `VoteRegistrationDelegation`, or `StakeVoteRegistrationDelegation`. |
| `stakeCredential` | string | Delegator stake credential hash in hexadecimal form. |
| `drepType` | string | `KeyHash`, `ScriptHash`, `Abstain`, or `NoConfidence`. |
| `drepHash` | string | DRep credential hash in hexadecimal form; Adder omits it for `Abstain` and `NoConfidence`. |
| `drepId` | string | Bech32 DRep ID; Adder omits it for `Abstain` and `NoConfidence`. |
| `poolKeyHash` | string | Pool key hash in hexadecimal form for combined stake and vote delegation types. |
| `deposit` | number (`uint64`) | Lovelace deposit for registration and delegation types. Adder emits the field as a non-negative unsigned 64-bit value when present and omits it when its value is zero. |

### `committeeCertificates[]`

Each item represents a Constitutional Committee credential change.

| Field | Type | Description |
| :--- | :--- | :--- |
| `certificateType` | string | `AuthHot` for hot credential authorization or `ResignCold` for cold credential resignation. |
| `coldCredential` | string | Committee cold credential hash in hexadecimal form. |
| `hotCredential` | string | Committee hot credential hash in hexadecimal form for `AuthHot`. |
| `anchor` | object | Metadata with `url` and `dataHash` strings. |

## Deposit values and deserialization

JSON represents the three `deposit` fields as numeric values. The JSON format does not enforce a language-specific integer type. Consumers must deserialize each present value as a non-negative unsigned 64-bit integer and preserve the full range from `0` through `18,446,744,073,709,551,615`.

Values greater than `9,223,372,036,854,775,807` exceed the signed 64-bit maximum. Consumers must not convert these values to signed integers or clamp them at that maximum.

The following example shows the three deposit fields, including values above the signed 64 bit maximum:

```json
{
  "timestamp": "2026-07-17T21:40:00Z",
  "type": "input.governance",
  "context": {
    "transactionHash": "58200a1ad4abcd7290bc9831d102e34fa9de1e0287a98bcdef1238b1f20a67bc",
    "blockNumber": 10528430,
    "slotNumber": 68493120,
    "transactionIdx": 3,
    "networkMagic": 764824073
  },
  "payload": {
    "blockHash": "13aa2accf2e1561723aa26871e071fdf32c867cff7e7d50ad470d62fdeadbeef",
    "proposalProcedures": [
      {
        "index": 0,
        "deposit": 18446744073709551615,
        "rewardAccount": "stake_test1u9f9v0z5zzlldgx58n8tklphu8mf7h4jvp2j2gddluemnssjfnkzz",
        "actionType": "Info",
        "actionData": {},
        "anchor": { "url": "", "dataHash": "" }
      }
    ],
    "drepCertificates": [
      {
        "certificateType": "Registration",
        "drepHash": "81f156d98e1f02123abccdef5439a89d71fa9d8b76c8db028c7df0e1",
        "drepId": "drep1p4h4ea7y70ede2wy7x3t83x4umm63wwq68308f94cmt7szexmnr",
        "deposit": 9223372036854775808,
        "anchor": { "url": "", "dataHash": "" }
      }
    ],
    "voteDelegationCertificates": [
      {
        "certificateType": "VoteRegistrationDelegation",
        "stakeCredential": "81f156d98e1f02123abccdef5439a89d71fa9d8b76c8db028c7df0e1",
        "drepType": "Abstain",
        "deposit": 42
      }
    ]
  }
}
```

## Filtering governance events

Use the following filters with `--filter-type input.governance`:

| Flag | Description |
| :--- | :--- |
| `--filter-drep` | Matches DRep registration, update, and deregistration certificates; vote delegation certificates targeting the DRep; and votes cast by the DRep. The value accepts hexadecimal or Bech32 form, including script DRep IDs. |
| `--filter-pool` | Matches votes cast by a stake pool as an SPO and vote delegation certificates that reference the pool key hash. |
| `--filter-address` | Matches proposal reward accounts, treasury withdrawal destination addresses, and delegating stake credentials. |

For example, filter governance events for a DRep with:

```bash
./adder --filter-type input.governance \
  --filter-drep drep1p4h4ea7y70ede2wy7x3t83x4umm63wwq68308f94cmt7szexmnr
```

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>