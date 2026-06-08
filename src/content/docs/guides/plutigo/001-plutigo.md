---
title: plutigo
description: Introduction to plutigo.
---

An implementation of [Plutus](https://github.com/IntersectMBO/plutus) in pure Go.

This package aims to only support Untyped Plutus Core because that is all that is needed for a full node. The other stuff like Typed Plutus Core and Plutus IR is for Plinth.

Version 0.1.15 keeps Plutigo portable across supported Go targets, including 32-bit environments. The `unConstrData` tag guard now compares through `uint64`, which avoids platform width overflow while keeping the earlier 64-bit overflow behavior.

