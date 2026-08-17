---
title: Byron ssc_proof hash validation
description: Configure `common.VerifyConfig.EnableByronSscProofHashValidation` to keep Byron `ssc_proof` validation structural by default and enable full hash comparison when needed.
---

## Overview

Byron `ssc_proof` validation stays structural unless `common.VerifyConfig.EnableByronSscProofHashValidation` is `true`.

## Default behavior

When the flag is absent or `false`, gOuroboros validates the `ssc_proof` structure only.

## Opt in to hash validation

Set `common.VerifyConfig.EnableByronSscProofHashValidation` to `true` to recompute the Byron `ssc_proof` hash and compare it with the block data.

Pass the same verify config through any Byron decode-time or body-hash validation path that should honor this setting.

## Example

```go
verifyConfig := common.VerifyConfig{
    EnableByronSscProofHashValidation: true,
}
```