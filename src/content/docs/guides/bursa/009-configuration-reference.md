---
title: Bursa Configuration Reference
description: Configure Bursa signer, KES-agent, and PKCS#11 settings.
---

## Overview

This guide describes Bursa signer and KES-agent configuration, including the `signer.backends` configuration for the `PKCS#11` signer backend. The backend uses a `PKCS#11` module, keeps private keys on the token, and has the token produce `Ed25519` signatures.

## Wallet environment variables

| Environment variable | Default | Behavior |
| --- | --- | --- |
| `BURSA_CONNECTOR` | `false` | Enables the dApp connector backend. |

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

## Signer startup safety

The `software`/`file` signer backend loads plaintext private key material into process memory. Bursa protects this backend when the signer listens beyond the local machine:

| Configuration path | Environment variable | Default | Behavior |
| --- | --- | --- | --- |
| `signer.allow_insecure_file_backend` | `SIGNER_ALLOW_INSECURE_FILE_BACKEND` | `false` | Explicitly permits a `software`/`file` backend on a non-loopback signer listener. |
| `signer.listen_address` | `SIGNER_LISTEN_ADDRESS` | `""` | Determines whether the signer listener uses a loopback address. |

For a configured `software`/`file` backend, Bursa refuses startup when `signer.listen_address` is non-loopback unless `signer.allow_insecure_file_backend` is `true`. The empty `signer.listen_address` value means all interfaces and counts as non-loopback for this check. A loopback listener or an explicit `true` opt-in permits startup, but Bursa emits a warning whenever the backend is in use. Use a custody backend such as `Vault` or `SOPS` instead of plaintext key material in production.

## KES-agent period guard

The KES agent requires a durable path for its monotonic period guard:

| Configuration path | Environment variable | Requirement |
| --- | --- | --- |
| `kes_agent.guard_file` | `KESAGENT_GUARD_FILE` | Set a non-empty durable file path that the KES-agent daemon can open. |

Bursa refuses KES-agent startup when `kes_agent.guard_file` is empty. The period guard persists the highest KES period that the agent authorizes, restores that period after a restart, and refuses a period rollback. The daemon does not support an in-memory fallback for this guard.

## Signer transaction policies

Configure operation-aware transaction permissions below `signer.keys[].tx_policy`. The coarse `allow_certificates` and `allow_votes` settings remain available, but a non-empty `allowed_certificates` list takes precedence over `allow_certificates`. A non-empty `allowed_voter_kinds` or `allowed_drep_ids` list selects allowlist mode instead of `allow_votes`. Bursa denies the operation by default when no applicable allowlist or boolean permission is set.

```yaml
signer:
  keys:
    - hash: "0000000000000000000000000000000000000000000000000000000000"
      tx_policy:
        allow_certificates: false
        allowed_certificates:
          - stake_registration
        allow_votes: false
        allowed_voter_kinds:
          - drep_key
        allowed_drep_ids:
          - "hex-credential-id"
```

The accepted `allowed_certificates` values are:

`stake_registration`, `stake_deregistration`, `stake_delegation`, `pool_registration`, `pool_retirement`, `genesis_key_delegation`, `move_instantaneous_rewards`, `registration`, `deregistration`, `vote_delegation`, `stake_vote_delegation`, `stake_registration_delegation`, `vote_registration_delegation`, `stake_vote_registration_delegation`, `auth_committee_hot`, `resign_committee_cold`, `drep_registration`, `drep_deregistration`, and `drep_update`.

The accepted `allowed_voter_kinds` values are:

`committee_hot_key`, `committee_hot_script`, `drep_key`, `drep_script`, and `staking_pool_key`.

Set `allowed_drep_ids` to hex credential IDs to restrict DRep voters to the listed credentials. A DRep ID list also denies voters without a DRep credential ID. Bursa accepts only the listed certificate and voter kinds. If Bursa cannot decode an operation kind or the details required by an active allowlist, it denies signing.

### Per-caller transaction restrictions

Use `signer.caller_policies` as a map from caller subject to key hash to subtractive transaction overrides:

```yaml
signer:
  caller_policies:
    "caller-subject":
      "0000000000000000000000000000000000000000000000000000000000":
        networks: ["mainnet"]
        allowed_outputs: ["addr1example"]
        max_output_ada: 100
        max_total_out_ada: 500
        max_fee_ada: 2
        allowed_certificates: ["stake_registration"]
        allowed_voter_kinds: ["drep_key"]
        allowed_drep_ids: ["hex-credential-id"]
        forbid_certificates: true
        forbid_mint: true
        forbid_withdrawals: true
        forbid_votes: true
        forbid_proposals: true
        forbid_treasury: true
```

Each key under `signer.caller_policies` identifies a caller subject. Each nested key identifies a key hash. The supported override fields are `networks`, `allowed_outputs`, `max_output_ada`, `max_total_out_ada`, `max_fee_ada`, `allowed_certificates`, `allowed_voter_kinds`, `allowed_drep_ids`, `forbid_certificates`, `forbid_mint`, `forbid_withdrawals`, `forbid_votes`, `forbid_proposals`, and `forbid_treasury`.

Bursa intersects each caller override with the key's base policy, so an override can only narrow authority and cannot grant a permission that the base policy denies. Unknown override fields and invalid key hashes prevent Bursa from constructing a valid policy.

### External policy hook

Set `signer.policy_hook_url` to enable an external policy check after the static policy approves a request. The environment variable `SIGNER_POLICY_HOOK_URL` overrides this setting. Set `signer.policy_hook_timeout_ms` to configure the request timeout in milliseconds; `SIGNER_POLICY_HOOK_TIMEOUT_MS` overrides it. A value of `0` uses the five-second default. Bursa limits configured values to one day.

Bursa sends the transaction summary as a JSON `POST` request. The summary uses these fields:

```json
{
  "type": "tx",
  "caller": "caller-subject",
  "key": "key-hash",
  "tx_id": "transaction-id",
  "fee": "1000000",
  "outputs": [
    {
      "address": "addr1example",
      "lovelace": "5000000",
      "has_assets": true
    }
  ],
  "certificates": ["stake_registration"],
  "voter_kinds": ["drep_key"],
  "drep_ids": ["hex-credential-id"]
}
```

The hook permits signing only when it returns HTTP `200` with the JSON response `{"allow": true}`. Transport errors, timeouts, non-`200` responses, unreadable or malformed JSON, and any `allow` value other than `true` deny signing.

## Troubleshooting

- If Bursa reports that `module` is required, set `signer.backends[].module` to the `PKCS#11` module path.
- If Bursa reports that `token_label` or `slot` is required, provide at least one token selection field.
- If Bursa reports that `pin_env` is required or that its environment variable is empty, set `signer.backends[].pin_env` to the name of an environment variable and provide the user PIN through that variable.
- If Bursa reports an invalid key type, set each `signer.backends[].keys[].type` value to one of the supported values in the configuration reference.


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
