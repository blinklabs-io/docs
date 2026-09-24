---
title: Filter and Governance Reference
description: Configure Adder filters and consume input.governance events.
---

# Filter and Governance Reference

This reference describes Adder filter matching, configuration names, accepted DRep identifiers, and the `input.governance` event schema.

## Filter behavior

Each filter accepts a comma separated list of values. Adder trims whitespace around each value and ignores empty entries. Values within one filter use OR semantics: an event matches when it contains any listed value.

Different filter kinds use AND semantics. An event must satisfy every configured filter that applies to its event type. The exception combines `--filter-pool` and `--filter-drep` with OR semantics: an event passes when it matches either the configured pool or the configured DRep. Any other configured filters still apply with AND semantics.

`input.block` events match `--filter-pool`, but `--filter-drep` does not apply to blocks. Configuring both filters therefore does not expand the set of matching blocks.

> **Important:** Use the double dash for long flags, such as `--filter-type`. The single dash form, such as `-filter-type`, is parsed as a shorthand flag cluster and is rejected.

### Filter reference

| Flag | Matches | Applies to event types |
| --- | --- | --- |
| `--filter-type` | Top level event type | All event types |
| `--filter-address` | Payment or stake address | `input.transaction`, `input.governance` |
| `--filter-policy` | Asset policy ID | `input.transaction` |
| `--filter-asset` | Asset fingerprint, such as `asset1…` | `input.transaction` |
| `--filter-pool` | Stake pool (SPO) ID | `input.block`, `input.transaction`, `input.governance` |
| `--filter-drep` | DRep ID in hexadecimal or bech32 form | `input.transaction`, `input.governance` |

A filter does not remove an event type to which it does not apply. For example, `--filter-policy` does not remove an `input.block` event, and `--filter-asset` does not remove an `input.governance` event.

## Filter examples

The examples use verified Cardano identifiers. Replace an identifier with a value that the target event contains when configuring a deployment.

### Event type

Output only transaction events:

```bash
adder --filter-type input.transaction
```

Output transaction and block events by providing comma separated alternatives to one flag:

```bash
adder --filter-type input.transaction,input.block
```

### Asset policy

Output transactions involving the specified policy ID:

```bash
adder --filter-type input.transaction \
  --filter-policy 13aa2accf2e1561723aa26871e071fdf32c867cff7e7d50ad470d62f
```

### Asset fingerprint

Output transactions involving the specified asset:

```bash
adder --filter-type input.transaction \
  --filter-asset asset108xu02ckwrfc8qs9d97mgyh4kn8gdu9w8f5sxk
```

### Payment or stake address

Output transactions with outputs matching a payment address:

```bash
adder --filter-type input.transaction \
  --filter-address addr1qyht4ja0zcn45qvyx477qlyp6j5ftu5ng0prt9608dxp6l2j2c79gy9l76sdg0xwhd7r0c0kna0tycz4y5s6mlenh8pq4jxtdy
```

Output transactions with outputs matching a stake address:

```bash
adder --filter-type input.transaction \
  --filter-address stake1u9f9v0z5zzlldgx58n8tklphu8mf7h4jvp2j2gddluemnssjfnkzz
```

A payment address matches only that exact address. A stake address matches any address built on that stake credential, including other payment addresses for the same wallet, and also matches stake certificates in the transaction. Adder checks both address forms against transaction outputs. When `KUPO_URL` is set, Adder also checks resolved inputs, so spending from a matching address counts as well.

### Multiple addresses

Pass multiple addresses as comma separated alternatives. An event matches when it involves any listed address:

```bash
adder --filter-type input.transaction \
  --filter-address addr1qyht4ja0zcn45qvyx477qlyp6j5ftu5ng0prt9608dxp6l2j2c79gy9l76sdg0xwhd7r0c0kna0tycz4y5s6mlenh8pq4jxtdy,addr1q88zh70hsfjkqnexte4u5ewsfpjq3dxrhlvr3ha7k99p3y8rtwtt945eg3tvmg09t8f4ug4dw24nednp598w4vlycgqsry583e
```

Payment and stake addresses can appear in the same list:

```bash
adder --filter-type input.transaction \
  --filter-address addr1qyht4ja0zcn45qvyx477qlyp6j5ftu5ng0prt9608dxp6l2j2c79gy9l76sdg0xwhd7r0c0kna0tycz4y5s6mlenh8pq4jxtdy,stake1u834h94j66v5g4kd58j4n567y2kh92eukes6znh2k0jvyqgfufmts
```

### Stake pool

Output blocks minted by the specified stake pool. Pool IDs can use bech32 or hexadecimal form:

```bash
adder --filter-type input.block \
  --filter-pool pool1z5uqdk7dzdxaae5633fqfcu2eqzy3a3rgtuvy087fdld7yws0xt
```

Pass multiple pool IDs as comma separated alternatives. The list can mix bech32 and hexadecimal forms:

```bash
adder --filter-type input.block \
  --filter-pool pool1z5uqdk7dzdxaae5633fqfcu2eqzy3a3rgtuvy087fdld7yws0xt,a81f156d98e1f02123abccdef5439a89d71fa9d8b76c8db028c7df0e
```

### DRep

Output governance events involving the specified DRep, including votes cast by that DRep, DRep registration, update, and retirement certificates, and vote delegations to that DRep:

```bash
adder --filter-type input.governance \
  --filter-drep drep1p4h4ea7y70ede2wy7x3t83x4umm63wwq68308f94cmt7szexmnr
```

## Filter configuration names

The command line uses shortened filter flags. Environment variables and configuration keys retain the plugin type and plugin name. A shortened flag name does not produce a shortened environment variable or configuration key; for example, `FILTER_ADDRESS` has no effect.

| Flag | Environment variable | Configuration key |
| --- | --- | --- |
| `--filter-address` | `FILTER_CARDANO_ADDRESS` | `plugins.filter.cardano.address` |
| `--filter-asset` | `FILTER_CARDANO_ASSET` | `plugins.filter.cardano.asset` |
| `--filter-policy` | `FILTER_CARDANO_POLICY` | `plugins.filter.cardano.policy` |
| `--filter-pool` | `FILTER_CARDANO_POOL` | `plugins.filter.cardano.pool` |
| `--filter-drep` | `FILTER_CARDANO_DREP` | `plugins.filter.cardano.drep` |
| `--filter-type` | `FILTER_EVENT_TYPE` | `plugins.filter.event.type` |

`--filter-type` belongs to the separate `event` filter plugin, so its environment variable and configuration key use `event` rather than `cardano`.

The equivalent YAML configuration has one string value for each filter. Use a comma separated list within a value when a filter needs multiple alternatives:

```yaml
plugins:
  filter:
    cardano:
      address: addr1qyht4ja0zcn45qvyx477qlyp6j5ftu5ng0prt9608dxp6l2j2c79gy9l76sdg0xwhd7r0c0kna0tycz4y5s6mlenh8pq4jxtdy
      pool: pool1z5uqdk7dzdxaae5633fqfcu2eqzy3a3rgtuvy087fdld7yws0xt
      drep: drep1p4h4ea7y70ede2wy7x3t83x4umm63wwq68308f94cmt7szexmnr

    event:
      type: input.governance
```

### DRep identifier formats

`--filter-drep` accepts these forms:

- **Bech32:** Values beginning with `drep` use either the `drep1...` key hash prefix or the `drep_script1...` script hash prefix. Adder decodes the value and expects a 28 byte credential hash. If the decoded payload has 29 bytes, Adder removes the leading byte as a header without inspecting or validating it. Adder ignores payloads with any other length and drops those identifiers from the filter.
- **Hexadecimal:** Values contain the raw 28 byte credential hash as 56 hexadecimal characters. Adder performs no header removal for hexadecimal input, so a value that includes a header byte does not match.

Adder emits DRep IDs as bech32 encodings of the raw 28 byte credential hash, using `drep` for key hash credentials and `drep_script` for script hash credentials. A `drepId` value emitted by Adder can be passed to `--filter-drep` unchanged.

## Governance events

The chainsync input emits an `input.governance` event for each transaction that contains Conway era on chain governance data. One transaction produces one governance event, and that event collects all governance data in the transaction.

### When it fires

Adder emits an `input.governance` event when a transaction contains at least one of the following:

- One or more proposal procedures, which introduce governance actions.
- One or more voting procedures, which record votes on governance actions.
- One or more governance certificates: DRep registration, update, or retirement; vote delegation; or Constitutional Committee hot key authorization or cold key resignation.

A transaction with no governance data does not produce an `input.governance` event. Adder emits the governance event in addition to the regular `input.transaction` event for the same transaction.

### Context

The `context` object identifies the transaction and the chain position where Adder found the governance data:

| Field | Type | Description |
| --- | --- | --- |
| `transactionHash` | string | Transaction hash in hexadecimal form |
| `blockNumber` | number | Block height containing the transaction |
| `slotNumber` | number | Slot of the containing block |
| `transactionIdx` | number | Transaction index within the block |
| `networkMagic` | number | Network magic of the connected node |

### Payload

The `payload` object always contains `blockHash`. It can contain `transactionCbor` when the input runs with `--input-chainsync-include-cbor`. It can also contain up to five governance data arrays. Adder omits each array when the array is empty.

| Field | Type | Description |
| --- | --- | --- |
| `blockHash` | string | Hash of the containing block in hexadecimal form |
| `transactionCbor` | string | Raw transaction CBOR in hexadecimal form; present only with `--input-chainsync-include-cbor` |
| `proposalProcedures` | array | Governance actions proposed in the transaction |
| `votingProcedures` | array | Votes cast in the transaction |
| `drepCertificates` | array | DRep registration, update, or retirement certificates |
| `voteDelegationCertificates` | array | Vote delegation certificates |
| `committeeCertificates` | array | Constitutional Committee hot key authorization or cold key resignation certificates |

#### `proposalProcedures[]`

| Field | Type | Description |
| --- | --- | --- |
| `index` | number | Proposal index within the transaction |
| `deposit` | number | Deposit in lovelace locked for the proposal |
| `rewardAccount` | string | Stake or reward address to which the deposit returns |
| `actionType` | string | One of `ParameterChange`, `HardForkInitiation`, `TreasuryWithdrawal`, `NoConfidence`, `UpdateCommittee`, `NewConstitution`, `Info` |
| `actionData` | object | Action specific data; exactly one field is populated and keyed by the action, such as `parameterChange`, `treasuryWithdrawal`, `newConstitution`, `updateCommittee`, `hardForkInitiation`, `noConfidence`, or `info` |
| `anchor` | object | Optional `{ "url", "dataHash" }` object that points to off chain metadata |

#### `votingProcedures[]`

| Field | Type | Description |
| --- | --- | --- |
| `voterType` | string | One of `DRep`, `SPO`, `CCHot` |
| `voterHash` | string | Voter credential hash in hexadecimal form |
| `voterId` | string | Voter identifier in bech32 form where applicable |
| `govActionTxId` | string | Transaction ID of the governance action receiving the vote |
| `govActionIndex` | number | Governance action index within that transaction |
| `vote` | string | One of `Yes`, `No`, `Abstain` |
| `anchor` | object | Optional `{ "url", "dataHash" }` vote rationale metadata |

#### `drepCertificates[]`

| Field | Type | Description |
| --- | --- | --- |
| `certificateType` | string | One of `Registration`, `Update`, `Deregistration` |
| `drepHash` | string | DRep credential hash in hexadecimal form |
| `drepId` | string | DRep ID in bech32 form, using `drep1...` or `drep_script1...` |
| `deposit` | number | Deposit in lovelace; present for registration and deregistration |
| `anchor` | object | Optional `{ "url", "dataHash" }` metadata |

#### `voteDelegationCertificates[]`

| Field | Type | Description |
| --- | --- | --- |
| `certificateType` | string | One of `VoteDelegation`, `StakeVoteDelegation`, `VoteRegistrationDelegation`, `StakeVoteRegistrationDelegation` |
| `stakeCredential` | string | Delegating stake credential hash in hexadecimal form |
| `drepType` | string | One of `KeyHash`, `ScriptHash`, `Abstain`, `NoConfidence` |
| `drepHash` | string | DRep credential hash in hexadecimal form; present for `KeyHash` and `ScriptHash` |
| `drepId` | string | DRep ID in bech32 form; present for `KeyHash` and `ScriptHash` |
| `poolKeyHash` | string | Pool key hash in hexadecimal form; present for the combined stake and vote delegation types |
| `deposit` | number | Deposit in lovelace; present for the registration delegation types |

#### `committeeCertificates[]`

| Field | Type | Description |
| --- | --- | --- |
| `certificateType` | string | `AuthHot` for hot key authorization or `ResignCold` for cold key resignation |
| `coldCredential` | string | Committee cold credential hash in hexadecimal form |
| `hotCredential` | string | Committee hot credential hash in hexadecimal form; present for `AuthHot` |
| `anchor` | object | Optional `{ "url", "dataHash" }`; present for `ResignCold` |

## Filtering governance events

Three Cardano filters apply to `input.governance` events. An event matches a filter when any listed governance data reference contains the filtered value.

- **`--filter-drep`** matches DRep certificates, vote delegation certificates that delegate to the DRep, and voting procedures where the DRep casts the vote.
- **`--filter-pool`** matches voting procedures cast by the pool as an SPO and vote delegation certificates that reference the pool key hash.
- **`--filter-address`** matches different governance fields according to the address type:
  - A **stake address** (`stake1...`) matches a proposal `rewardAccount`, treasury withdrawal destination addresses, and the stake credential in vote delegation certificates.
  - A **payment address** (`addr1...`) matches treasury withdrawal destination addresses only. Reward accounts and vote delegation credentials are stake credentials, so Adder compares them only with stake addresses.

Use a stake address to follow an account's governance activity.

`--filter-policy` and `--filter-asset` do not apply to governance events. An `input.governance` event passes through both filters unaffected.

To emit only governance events involving a specific DRep, run:

```bash
adder --filter-type input.governance \
  --filter-drep drep1p4h4ea7y70ede2wy7x3t83x4umm63wwq68308f94cmt7szexmnr
```