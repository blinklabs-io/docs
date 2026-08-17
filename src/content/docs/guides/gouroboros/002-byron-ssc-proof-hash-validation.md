---
title: Byron ssc_proof hash validation
description: Configure `common.VerifyConfig.EnableByronSscProofHashValidation` to compare Byron `ssc_proof` hashes instead of using structural validation only.
---

## Overview

This page covers the Byron `ssc_proof` validation option in gOuroboros.

## Default behavior

By default, Byron `ssc_proof` values receive structural validation only.

## Enable hash validation

Set `common.VerifyConfig.EnableByronSscProofHashValidation` to `true` to recompute the Byron `ssc_proof` hash and compare it with the block data.

Pass the same verify config through any Byron decode-time or body-hash validation path that should honor this setting.

## Example

```go
verifyConfig := common.VerifyConfig{
    EnableByronSscProofHashValidation: true,
}
```