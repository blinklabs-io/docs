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

## Large ledger derived data

`EvaluateContext` passes ledger derived datum, redeemer, and script context values as execution arguments. The evaluator keeps those values separate from the UPLC program term, so their Plutus data nodes do not increase the structural node count of the UPLC program.

This behavior allows evaluation of contexts that contain very large inline datums without the ledger data itself causing a structural node limit failure. V3 regression coverage includes a ledger context with more than 1,000,000 `PlutusData` nodes.

The trusted argument treatment applies only to the finite data values supplied through the `EvaluateContext` arguments. The evaluator still decodes and validates the UPLC program, and structural limits still apply to that program. The behavior does not make ledger data unlimited or remove execution budget enforcement.

## Input validity and errors

The caller must provide finite, valid Plutus data sourced from ledger state for each data argument. The trusted argument path does not provide a way to bypass data validation.

The evaluator rejects malformed or unknown script terms that caller code constructs and returns an error instead of proceeding into evaluation. The caller should treat any such error as a rejected program or input and correct the supplied term before retrying.