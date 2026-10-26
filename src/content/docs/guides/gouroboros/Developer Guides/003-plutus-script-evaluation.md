---
title: Plutus script evaluation
description: Understand EvaluateContext data arguments, large ledger contexts, and input validation in gOuroboros.
---

## Overview

This page describes how `EvaluateContext` evaluates Plutus V1 through V4 scripts with ledger data, execution budgets, and evaluation contexts.

## EvaluateContext argument shapes

Each `EvaluateContext` method receives the script's ledger data together with the execution budget and evaluation context. The method also accepts a Go `context.Context` that can stop evaluation.

| Script version | Data arguments | Method shape |
| --- | --- | --- |
| Plutus V1 | `datum`, `redeemer`, `scriptContext` | `EvaluateContext(ctx, datum, redeemer, scriptContext, budget, evalContext)` |
| Plutus V2 | `datum`, `redeemer`, `scriptContext` | `EvaluateContext(ctx, datum, redeemer, scriptContext, budget, evalContext)` |
| Plutus V3 | `scriptContext` | `EvaluateContext(ctx, scriptContext, budget, evalContext)` |
| Plutus V4 | `scriptContext` | `EvaluateContext(ctx, scriptContext, budget, evalContext)` |

Plutus V1 and V2 apply the `datum`, `redeemer`, and `scriptContext` arguments in that order. Plutus V3 and V4 receive the `scriptContext`; the context carries the data that those script versions require.

The caller supplies the execution `budget` and `evalContext` for every version. The evaluator enforces the supplied budget, including a zero budget.

## Large data from ledger contexts

`EvaluateContext` passes datum, redeemer, and script context values from ledger state as execution arguments. The evaluator keeps those values separate from the UPLC program term, so their Plutus data nodes do not increase the structural node count of the UPLC program.

This behavior lets the evaluator process contexts with very large inline datums without the ledger data itself causing a structural node limit failure. V3 regression coverage includes a ledger context with more than 1,000,000 `PlutusData` nodes.

The trusted argument treatment applies only to the finite data values supplied through the `EvaluateContext` arguments. The evaluator still decodes and validates the UPLC program, and structural limits still apply to that program. The behavior does not make ledger data unlimited or remove execution budget enforcement.

## Evaluator integration

Use `RunScriptContext` to evaluate a script and report whether its result is unit without expanding or discharging the final result.

Use `RunContextWithTrustedDataArguments` when the integration needs the full evaluated result. That path discharges the result and can return `ErrCodeResultTooLarge` after evaluation succeeds when the result exceeds the discharge limits. `RunScriptContext` avoids this separate discharge error when only unit status is required.

Before evaluation, call `data.Normalize` on decoded datum and redeemer values that become visible to the script. Normalization deep copies container values and resets their definite or indefinite CBOR encoding style to the package defaults; without it, decoded encoding metadata can produce serialized bytes that differ from the reference behavior.

## Input validity and errors

Callers must validate every trusted argument tree at its source before passing it to `EvaluateContext`. `EvaluateContext` forwards those trees to `RunContextWithTrustedDataArguments`, whose validation intentionally skips the forwarded trees. Callers must ensure that every tree is finite, contains valid Plutus data, and is acyclic.

By default, `data.Decode` rejects CBOR tag `1401` and long-head bignum tags. `Integer` and `ByteString` CBOR unmarshalling also applies stricter validity checks, so inputs accepted by earlier versions can now fail decoding.

When evaluation exceeds its budget, `BudgetError.Requested` contains the charge that caused the overrun, and `BudgetError.Available` contains the budget remaining immediately before that charge. The evaluator deducts the requested charge before returning the failure, so the post-failure budget reflects `Available - Requested`.

The evaluator rejects malformed or unknown script terms that caller code constructs and returns an error instead of evaluating them. Correct the supplied term before retrying after such an error.
