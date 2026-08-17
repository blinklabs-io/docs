---
title: Byron `ssc_proof` hash validation
description: Configure `common.VerifyConfig.EnableByronSscProofHashValidation` to compare Byron `ssc_proof` hashes instead of using structural validation only.
---

## Overview

This guide describes the Byron `ssc_proof` verification option in gOuroboros.

By default, Byron `ssc_proof` values receive structural validation only.

## Enable hash validation

Set `common.VerifyConfig.EnableByronSscProofHashValidation` to `true` to recompute the Byron `ssc_proof` hash and compare it with the block data.

Use the same verify config on any Byron decode-time or body-hash validation path that should honor this setting.

## Example

```go
verifyConfig := common.VerifyConfig{
    EnableByronSscProofHashValidation: true,
}
```

## Behavior summary

- `false` or omitted: structural validation only.
- `true`: hash recomputation and comparison against the block data.