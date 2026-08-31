---
title: Governance Events
description: Reference for Adder governance events, filters, and DRep event values.
---

# Governance Events

## Overview

This guide describes how Adder's chainsync input plugin emits the `input.governance` event. The event contains Conway-era governance data from a transaction, including proposal procedures, voting procedures, DRep activity, vote delegations, and Constitutional Committee changes.

Adder emits one `input.governance` event for each block transaction that contains governance data. The event appears in addition to the regular `input.transaction` event for the same transaction. Adder does not emit an `input.governance` event for a transaction without governance data.

For general flag syntax and the complete list of commands, see the [Command Reference Guide](./006-command_list).

## Event envelope

The event uses a top-level JSON object with these fields:

| Field | Type | Meaning |
| :--- | :--- | :--- |
| `timestamp` | string | Event timestamp. |
| `type` | string | Event type, always `input.governance`. |
| `context` | object | Transaction and chain position information. |
| `payload` | object | Block information and governance data. |

### Context fields

The `context` object identifies the transaction and its position in the chain.

| Field | Type | Meaning |
| :--- | :--- | :--- |
| `transactionHash` | string | 32-byte hexadecimal hash of the transaction containing the governance data. |
| `blockNumber` | number | Absolute height of the block containing the transaction. |
| `slotNumber` | number | Slot number of the block containing the transaction. |
| `transactionIdx` | number | Zero-based position of the transaction within the block. |
| `networkMagic` | number | Network magic identifier of the connected node. |

### Payload fields

The `payload` object contains the block hash and governance data arrays. Adder omits an array when that array has no items.

| Field | Type | Meaning |
| :--- | :--- | :--- |
| `blockHash` | string | Hexadecimal hash of the block containing the transaction. |
| `transactionCbor` | string | Raw transaction CBOR in hexadecimal form. Adder includes this field only when `--input-chainsync-include-cbor` is enabled. |
| `proposalProcedures` | array | Governance actions proposed in the transaction. |
| `votingProcedures` | array | Votes cast in the transaction. |
| `drepCertificates` | array | DRep registration, update, or retirement certificates. |
| `voteDelegationCertificates` | array | Stake credential to DRep vote delegation certificates. |
| `committeeCertificates` | array | Constitutional Committee authorization or resignation certificates. |

## Embedded governance structures

### `proposalProcedures[]`

Each item represents a proposed governance action.

| Field | Type | Meaning |
| :--- | :--- | :--- |
| `index` | number | Position of the proposal within the transaction's proposals. |
| `deposit` | number | Lovelace amount that the ledger locks for the proposal. |
| `rewardAccount` | string | Stake or reward address that receives the deposit when the proposal completes. |
| `actionType` | string | Governance action type. See [supported action types](#supported-governance-actions). |
| `actionData` | object | Action-specific data. The object contains exactly one field keyed by the action, such as `parameterChange`, `treasuryWithdrawal`, or `newConstitution`. |
| `anchor` | object | Optional off-chain metadata reference with `url` and `dataHash` fields. |

### `votingProcedures[]`

Each item represents a vote on an active governance proposal.

| Field | Type | Meaning |
| :--- | :--- | :--- |
| `voterType` | string | Voter category: `DRep`, `SPO`, or `CCHot`. |
| `voterHash` | string | Hexadecimal credential hash of the voter. |
| `voterId` | string | Bech32 identifier of the voter, such as `drep1...`. |
| `govActionTxId` | string | Transaction ID of the governance action receiving the vote. |
| `govActionIndex` | number | Position of the governance action within that transaction. |
| `vote` | string | Vote value: `Yes`, `No`, or `Abstain`. |
| `anchor` | object | Optional off-chain vote rationale reference with `url` and `dataHash` fields. |

### `drepCertificates[]`

Each item represents a change to a DRep's status.

| Field | Type | Meaning |
| :--- | :--- | :--- |
| `certificateType` | string | Certificate type: `Registration`, `Update`, or `Deregistration`. |
| `drepHash` | string | Hexadecimal DRep credential hash. |
| `drepId` | string | Bech32 DRep identifier, such as `drep1...` or `drep_script1...`. |
| `deposit` | number | Lovelace deposit that registration requires or deregistration refunds. |
| `anchor` | object | Optional off-chain DRep metadata reference with `url` and `dataHash` fields. |

### `voteDelegationCertificates[]`

Each item represents a stake address delegating voting power to a DRep or a predefined state.

| Field | Type | Meaning |
| :--- | :--- | :--- |
| `certificateType` | string | Certificate type: `VoteDelegation`, `StakeVoteDelegation`, `VoteRegistrationDelegation`, or `StakeVoteRegistrationDelegation`. |
| `stakeCredential` | string | Hexadecimal stake credential hash of the delegator. |
| `drepType` | string | Delegation target: `KeyHash`, `ScriptHash`, `Abstain`, or `NoConfidence`. |
| `drepHash` | string | Hexadecimal DRep credential hash. Adder omits this field for `Abstain` and `NoConfidence`. |
| `drepId` | string | Bech32 DRep identifier. Adder omits this field for `Abstain` and `NoConfidence`. |
| `poolKeyHash` | string | Hexadecimal pool key hash. Adder includes this field only for combined stake and vote delegation types. |
| `deposit` | number | Lovelace deposit for registration delegation types. |

### `committeeCertificates[]`

Each item represents a Constitutional Committee credential change.

| Field | Type | Meaning |
| :--- | :--- | :--- |
| `certificateType` | string | Certificate type: `AuthHot` or `ResignCold`. |
| `coldCredential` | string | Hexadecimal committee cold credential hash. |
| `hotCredential` | string | Hexadecimal committee hot credential hash, present only for `AuthHot`. |
| `anchor` | object | Metadata with `url` and `dataHash` fields, present only for `ResignCold`. |

## Supported governance actions

The `actionType` field accepts these values:

| Value | Meaning |
| :--- | :--- |
| `ParameterChange` | Proposal to update one or more network protocol parameters. |
| `HardForkInitiation` | Proposal to upgrade to a newer protocol version. |
| `TreasuryWithdrawal` | Proposal to withdraw Lovelace from the treasury to specified reward accounts. |
| `NoConfidence` | Proposal expressing no confidence in the current Constitutional Committee. |
| `UpdateCommittee` | Proposal to change Constitutional Committee membership, threshold, or terms. |
| `NewConstitution` | Proposal to update the network Constitution and its off-chain anchor. |
| `Info` | Proposal with no ledger effect, typically used to gauge community opinion or publish an announcement. |

## Corrected event example

The following example uses the current field names for proposal indexes, action data, anchor hashes, governance action identifiers, and voter identifiers:

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
        "deposit": 500000000,
        "rewardAccount": "stake1u9f9v0z5zzlldgx58n8tklphu8mf7h4jvp2j2gddluemnssjfnkzz",
        "actionType": "ParameterChange",
        "actionData": {
          "parameterChange": {}
        },
        "anchor": {
          "url": "https://example.com/proposal.json",
          "dataHash": "58200a1ad4abcd7290bc9831d102e34fa9de1e0287a98bcdef1238b1f20a67bc"
        }
      }
    ],
    "votingProcedures": [
      {
        "voterType": "DRep",
        "voterHash": "81f156d98e1f02123abccdef5439a89d71fa9d8b76c8db028c7df0e1",
        "voterId": "drep1p4h4ea7y70ede2wy7x3t83x4umm63wwq68308f94cmt7szexmnr",
        "govActionTxId": "58200a1ad4abcd7290bc9831d102e34fa9de1e0287a98bcdef1238b1f20a67bc",
        "govActionIndex": 0,
        "vote": "Yes",
        "anchor": {
          "url": "https://example.com/vote.json",
          "dataHash": "13aa2accf2e1561723aa26871e071fdf32c867cff7e7d50ad470d62fdeadbeef"
        }
      }
    ],
    "drepCertificates": [
      {
        "certificateType": "Registration",
        "drepHash": "81f156d98e1f02123abccdef5439a89d71fa9d8b76c8db028c7df0e1",
        "drepId": "drep1p4h4ea7y70ede2wy7x3t83x4umm63wwq68308f94cmt7szexmnr",
        "deposit": 500000000,
        "anchor": {
          "url": "https://example.com/drep-metadata.json",
          "dataHash": "58200a1ad4abcd7290bc9831d102e34fa9de1e0287a98bcdef1238b1f20a67bc"
        }
      }
    ]
  }
}
```

## Filter governance events

Use `--filter-type input.governance` with the governance filters below.

### Filter by DRep

`--filter-drep` matches the following governance data for the specified DRep:

- DRep `Registration`, `Update`, and `Deregistration` certificates.
- Vote delegation certificates that target the DRep.
- Voting procedures where the DRep casts the vote.

The value accepts hexadecimal or Bech32 form, including script DRep identifiers.

```bash
./adder --filter-type input.governance \
  --filter-drep drep1p4h4ea7y70ede2wy7x3t83x4umm63wwq68308f94cmt7szexmnr
```

### Filter by pool

`--filter-pool` matches the following governance data for the specified stake pool:

- Voting procedures where the pool votes as an SPO.
- Vote delegation certificates that reference the pool's key hash.

```bash
./adder --filter-type input.governance \
  --filter-pool pool1pu5jlj7m7m6d7q8h0y6f5q2k4m3n2p1r0s9t8u7v6w5x4y3z2
```

### Filter by address

`--filter-address` matches addresses involved in a governance action, including proposal reward accounts, treasury withdrawal destination addresses, and delegating stake credentials.

```bash
./adder --filter-type input.governance \
  --filter-address stake1u9f9v0z5zzlldgx58n8tklphu8mf7h4jvp2j2gddluemnssjfnkzz
```

### YAML configuration

The following configuration filters governance events for a DRep and an address:

```yaml
filter:
  cardano:
    type: "input.governance"
    drep: "drep1p4h4ea7y70ede2wy7x3t83x4umm63wwq68308f94cmt7szexmnr"
    address: "stake1u9f9v0z5zzlldgx58n8tklphu8mf7h4jvp2j2gddluemnssjfnkzz"
```

## Standalone DRep event values

Adder emits standalone events for DRep certificates with these event type values:

| Certificate type | Event type |
| :--- | :--- |
| `Registration` | `input.drep-registration` |
| `Update` | `input.drep-update` |
| `Deregistration` | `input.drep-retirement` |

These values replace `chainsync.drep.registration`, `chainsync.drep.update`, and `chainsync.drep.deregistration`. The certificate type remains `Deregistration`, while the emitted standalone event value is `input.drep-retirement`.