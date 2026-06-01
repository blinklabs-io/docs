---
title: plutigo
description: Overview of Plutigo, a pure Go Untyped Plutus Core runtime for Cardano use cases.
---

Plutigo is a pure Go implementation of Untyped Plutus Core for Cardano use cases. It focuses on practical script evaluation without CGO dependencies, which keeps deployment simple across different environments.

Core capabilities include:

- An optimized CEK evaluation engine for fast and efficient script execution.
- Support for Plutus V1, V2, V3, and initial V4 support.
- Version aware cost models and builtin behavior, with automatic selection based on the Plutus program version.
- Strong conformance and correctness coverage through comprehensive conformance testing, property based testing, and fuzz testing.

## Runtime budgeting

For restricting validation mode, successful evaluation can skip the final slippage flush when `EvalContext.SkipFinalSlippageFlush = true`. Leave this option disabled when exact cost evaluation matters, because the final unbudgeted batch must still flush and charge against the budget.

