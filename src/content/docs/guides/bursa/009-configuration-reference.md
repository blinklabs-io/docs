---
title: Bursa Configuration Reference
description: Configure the Bursa PKCS#11 signer backend.
---

## Overview

This guide describes the `signer.backends` configuration for the `PKCS#11` signer backend. The backend uses a `PKCS#11` module, keeps private keys on the token, and has the token produce `Ed25519` signatures.

## Configuration reference

Add a backend entry under `signer.backends` and set its `type` to `pkcs11`. Use the following fields:

| Configuration path | Purpose | Validation |
| --- | --- | --- |
| `signer.backends[].type` | Selects the signer backend. | Set to `pkcs11`. |
| `signer.backends[].module` | Specifies the path to the `PKCS#11` module, including the `.so` file. | Set this field. Bursa rejects an empty value. |
| `signer.backends[].token_label` | Selects the token or slot by its label. | Set this field or `slot`. Bursa requires at least one selection field. |
| `signer.backends[].slot` | Selects a slot by its explicit slot ID. | Set this field or `token_label`. Bursa requires at least one selection field. |
| `signer.backends[].pin_env` | Names the environment variable that contains the user PIN. | Set this field and populate the named environment variable with a nonempty value. Bursa does not read the PIN from plaintext configuration. |
| `signer.backends[].keys[]` | Defines an optional allowlist of token objects. | When present, give every entry a `name` and `type`. |
| `signer.backends[].keys[].name` | Matches the token object's `CKA_LABEL`. | Set this field for each `keys` entry. |
| `signer.backends[].keys[].type` | Assigns a Cardano key type to the matching token object. | Set this field for each `keys` entry. Use `payment`, `stake`, `drep`, `cc-hot`, `cc-cold`, `pool`, or `policy`. |

## Build requirements

Compile Bursa with `CGO` enabled and the `pkcs11` build tag to include the `PKCS#11` backend. Without that build tag, Bursa fails fast when a configuration selects this backend and returns:

```text
pkcs11 backend not compiled in (build with -tags pkcs11)
```

The default build does not silently enable `PKCS#11` support.

## Signing constraints

The `PKCS#11` backend keeps private keys on the token and asks the token to produce `Ed25519` signatures. `CIP-8` `COSE` signing does not support this backend. Bursa returns `CodeUnsupported` for `CIP-8` requests that use `PKCS#11` keys.

## Troubleshooting

- If Bursa reports that `module` is required, set `signer.backends[].module` to the `PKCS#11` module path.
- If Bursa reports that `token_label` or `slot` is required, provide at least one token selection field.
- If Bursa reports that `pin_env` is required or that its environment variable is empty, set `signer.backends[].pin_env` to the name of an environment variable and provide the user PIN through that variable.
- If Bursa reports an invalid key type, set each `signer.backends[].keys[].type` value to one of the supported values in the configuration reference.
