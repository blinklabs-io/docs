---
title: plutigo
description: Overview of Plutigo, a pure Go Untyped Plutus Core runtime for Cardano use cases.
---

Plutigo is a pure Go implementation of Untyped Plutus Core for Cardano use cases. It delivers portable script evaluation without CGO dependencies.

Core capabilities include:

- An optimized CEK evaluation engine for fast and efficient script execution.
- Support for Plutus V1, V2, V3, and initial V4 support.
- Version aware cost models and builtin behavior, with automatic selection based on the Plutus program version.
- Strong conformance coverage through comprehensive conformance testing, property based testing, and fuzz testing.

## Runtime budgeting

In restricting validation mode, successful evaluation can skip the final slippage flush when `EvalContext.SkipFinalSlippageFlush = true`. Keep this option disabled when exact cost evaluation matters so the final unbudgeted batch still flushes and counts against the budget.

