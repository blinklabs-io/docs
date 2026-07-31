---
title: Mainnet replay corpus
description: Use `plutigo-replay` to run the mainnet replay corpus and compare results with cardano-node reference data.
---

`plutigo-replay` evaluates normalized Plutus validation cases from a corpus file and compares each case's outcome and execution units with cardano-node reference data.

## Run the replay corpus

Run the CLI from a plutigo checkout with:

```sh
go run ./cmd/plutigo-replay -corpus ./mainnet-corpus.json -pretty
```

- `-corpus` is required and points to the corpus JSON file.
- `-pretty` only formats the JSON report.
- The command exits with these codes:
  - `0` when every case matches the reference data
  - `1` when one or more cases differ
  - `2` when the corpus cannot load, the runner fails, or JSON encoding fails

## Corpus contract

The corpus uses schema version `1` and includes these root fields:

- `schema_version`
- `network`
- `reference`
- `cases`

The `reference` object records the reference implementation name and version. Each case includes the data needed to reproduce one evaluation:

- `transaction`: transaction ID, slot, block, and redeemer metadata
- `language`: the ledger Plutus language
- `protocol_version`: the protocol major and minor version
- `flat_program_hex`: the raw FLAT-encoded program
- `arguments_cbor_hex`: the ordered CBOR arguments applied to the script
- `cost_model`: exactly one of `use_default` or `parameters`
- `budget_limit`: the CPU and memory budget limit
- `expected`: the expected success result and execution units

The corpus loader rejects malformed input before execution starts. It also rejects cases that do not select exactly one cost model source.

## Report output

The CLI writes a JSON report with one result per case and summary timing statistics, including total duration, median duration, p95 duration, and throughput.

`-pretty` only changes the JSON formatting; it does not change the report content.