---
title: Configuration Reference
description: YAML and environment-variable reference for Bursa `kes-agent` and legacy API security.
---

## Overview

This guide describes Bursa signer and KES-agent configuration, including the `signer.backends` configuration for the `PKCS#11` signer backend. The backend uses a `PKCS#11` module, keeps private keys on the token, and has the token produce `Ed25519` signatures.

## Load a configuration file

The `kes-agent` command accepts a YAML file with `--config`. When the flag is not set, the command reads the path from `BURSA_CONFIG`. If neither source provides a path, Bursa loads environment variables and built-in defaults without a YAML file. Environment variables override matching YAML values.

```bash
bursa kes-agent --config /etc/bursa/config.yaml
```

The command validates the loaded values before it opens either Unix socket. For command usage, see the [API section of the CLI guide](../003-commands#api) and the [kes-agent section of the CLI guide](../003-commands#kes-agent).

## Wallet environment variable

| Environment variable | Default | Behavior |
| --- | --- | --- |
| `BURSA_CONNECTOR` | `false` | Enables the dApp connector backend. |
| `BURSA_LEAN` | `false` | Seeds the lean-node history-expiry setting that Bursa persists on first run only. If `BURSA_LEAN` is unset or cannot be interpreted as a boolean, Bursa uses `false`; after Bursa persists a value, changing or setting this variable does not override the persisted choice. |

## History-expiry API

The ungated history-expiry endpoints read and update the lean-node setting that Bursa persists.

### Get the history-expiry setting

```http
GET /wallet/settings/history-expiry
```

The response has this shape:

```json
{ "enabled": boolean, "restart_required": boolean }
```

### Update the history-expiry setting

```http
PUT /wallet/settings/history-expiry
```

Send the required `enabled` field as a JSON boolean:

```json
{ "enabled": boolean }
```

Malformed JSON or a request without `enabled` returns HTTP `400`. A successful update returns the same `enabled` and `restart_required` response shape as `GET`. Bursa applies history expiry when it constructs the node, so `restart_required` is `true` when the running node has not yet adopted the persisted setting and needs a restart.

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

Building Bursa from source requires Go `1.26.0` or newer, in addition to `CGO` and the `pkcs11` build tag for the `PKCS#11` backend.

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

## `kes_agent`

Configure the daemon under the `kes_agent` YAML key. Each field also accepts the corresponding `KESAGENT_*` environment variable.

| YAML key | Environment variable | Purpose | Default or requirement |
| --- | --- | --- | --- |
| `kes_agent.mode` | `KESAGENT_MODE` | Select `serve-key` to provide the current KES signing key to the producer, or `sign` to sign block headers without releasing the key. | Set to `serve-key` or `sign`. |
| `kes_agent.service_socket` | `KESAGENT_SERVICE_SOCKET` | Connect the block producer through this Unix socket. | Set a service socket path. |
| `kes_agent.control_socket` | `KESAGENT_CONTROL_SOCKET` | Run KES key management commands through this Unix socket. | Set a control socket path different from `service_socket`. |
| `kes_agent.service_socket_mode` | `KESAGENT_SERVICE_SOCKET_MODE` | Octal permission mode for the service socket. Group access can support a producer that runs under a different user ID. | Use `0600` by default; do not grant write access to other users. |
| `kes_agent.control_socket_mode` | `KESAGENT_CONTROL_SOCKET_MODE` | Octal permission mode for the control socket. | Use `0600` by default; do not grant group or other write access. |
| `kes_agent.cold_vkey_file` | `KESAGENT_COLD_VKEY_FILE` | Load the pool cold verification key from a `cardano-cli` text envelope, raw bytes, or hex input. | Provide this field or `cold_vkey_hex`. |
| `kes_agent.cold_vkey_hex` | `KESAGENT_COLD_VKEY_HEX` | Load the pool cold verification key from inline hexadecimal input. | Provide this field or `cold_vkey_file`; Bursa uses inline hex when both are set. |
| `kes_agent.system_start` | `KESAGENT_SYSTEM_START` | Set the Shelley genesis system start. | Set an RFC3339 timestamp. |
| `kes_agent.slot_length` | `KESAGENT_SLOT_LENGTH` | Set the wall clock length of one slot in seconds. | Bursa uses `1` by default; set a positive value. |
| `kes_agent.slots_per_kes_period` | `KESAGENT_SLOTS_PER_KES_PERIOD` | Set the number of slots in one KES period. | Set a value greater than `0`. |
| `kes_agent.max_kes_evolutions` | `KESAGENT_MAX_KES_EVOLUTIONS` | Limit the number of operational certificate evolutions. | Bursa uses `62` by default. |
| `kes_agent.evolve_interval` | `KESAGENT_EVOLVE_INTERVAL` | Set the scheduler interval as a Go duration, such as `1m`. | Bursa uses `1m` by default; set a Go duration. |
| `kes_agent.guard_file` | `KESAGENT_GUARD_FILE` | Store the monotonic KES period guard at this durable path. | Set a durable path. |

The daemon requires different service and control socket paths. It accepts octal socket modes and defaults both modes to owner-only `0600` access. A service socket can grant group access when the producer needs a different user ID, but it cannot grant write access to other users. The control socket must remain owner-only for write access because it accepts commands that can install or remove KES keys.

The daemon requires one cold verification key from `cold_vkey_file` or `cold_vkey_hex`. The key must resolve to 32 bytes. It requires `system_start` in RFC3339 format, a positive `slot_length`, a nonzero `slots_per_kes_period`, and a durable `guard_file` path before startup can continue.

Bursa refuses KES-agent startup when `kes_agent.guard_file` is empty. The period guard persists the highest KES period that the agent authorizes, restores that period after a restart, and refuses a period rollback. The daemon does not support an in-memory fallback for this guard.

```yaml
kes_agent:
  mode: sign
  service_socket: /run/bursa/kes-agent.sock
  control_socket: /run/bursa/kes-agent-control.sock
  service_socket_mode: "0660"
  control_socket_mode: "0600"
  cold_vkey_file: /etc/bursa/pool-cold.vkey
  system_start: "2022-03-31T00:00:00Z"
  slot_length: 1
  slots_per_kes_period: 129600
  max_kes_evolutions: 62
  evolve_interval: 1m
  guard_file: /var/lib/bursa/kes-period.guard
```

### Migrate socket permissions

Replace the former `kes_agent.socket_mode` key with both `kes_agent.service_socket_mode` and `kes_agent.control_socket_mode`. The old key is not valid. Keep the control socket at `0600`; widen only the service socket when the producer requires group access.

## Legacy API security

Configure the legacy API under the `api` YAML key.

| YAML key | Environment variable | Purpose | Default or requirement |
| --- | --- | --- | --- |
| `api.tls_cert_file` | `API_TLS_CERT_FILE` | Present the server TLS certificate from this file. | Set for a non-loopback listener. |
| `api.tls_key_file` | `API_TLS_KEY_FILE` | Present the server TLS private key from this file. | Set for a non-loopback listener. |
| `api.jwt_secret` | `API_JWT_SECRET` | Authenticate bearer tokens with an HS256 secret. | Use instead of `api.jwks_url`; provide at least 32 bytes. |
| `api.jwks_url` | `API_JWKS_URL` | Authenticate bearer tokens through a JWKS endpoint. | Use instead of `api.jwt_secret`; Bursa requires HTTPS except for loopback development. |
| `api.jwt_issuer` | `API_JWT_ISSUER` | Constrain the issuer that bearer tokens can contain. | Set to constrain the accepted issuer. |
| `api.jwt_audience` | `API_JWT_AUDIENCE` | Constrain the audience that bearer tokens can contain. | Set to constrain the accepted audience. |

A non-loopback legacy API listener must provide both readable TLS files and exactly one bearer trust source: `api.jwt_secret` or `api.jwks_url`. Bursa rejects startup when it receives neither source or both sources. An HS256 secret must contain at least 32 bytes. A JWKS URL must use HTTPS, while loopback development can use HTTP.

The default API listener uses loopback. Bursa can keep loopback development in plaintext when operators omit TLS files, but Bursa requires TLS and bearer authentication for a non-loopback listener.

```yaml
api:
  address: 0.0.0.0
  port: 8080
  tls_cert_file: /run/secrets/bursa-api-cert.pem
  tls_key_file: /run/secrets/bursa-api-key.pem
  jwks_url: https://identity.example.com/.well-known/jwks.json
  jwt_issuer: https://identity.example.com
  jwt_audience: bursa-api
```

Keep `api.jwt_secret` in an environment variable or deployment secret rather than in a committed YAML file.

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
