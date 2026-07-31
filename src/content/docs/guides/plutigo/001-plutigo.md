---
title: plutigo
description: Work with Plutus data and scripts from Go using the pure-Go plutigo implementation.
---

An implementation of [Plutus](https://github.com/IntersectMBO/plutus) in pure Go.

This package aims to only support Untyped Plutus Core because that is all that is needed for a full node. The other stuff like Typed Plutus Core and Plutus IR is for Plinth.

## Replay

Use `plutigo-replay` to run normalized mainnet parity corpora and replay cases. The [mainnet replay corpus guide](/guides/plutigo/002-mainnet-replay-corpus/) describes the corpus format and execution steps.

