---
title: API Reference
description: HTTP contract for operational certificate signing and persisted wallet administration.
---

## Overview

This reference describes the HTTP requests and authorization rules for operational certificate signing and GCP persisted legacy wallet administration. It covers the exact request and response fields for the supported endpoints.

## Operational certificate signing

### `POST /v1/sign`

Set `type` to `opcert` to request a cold signature for an operational certificate. Send the KES verification key, issue counter, KES period, and cold key identifier in the JSON body:

```json
{
  "type": "opcert",
  "kes_vkey": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  "issue_counter": 42,
  "kes_period": 1234,
  "key": "0123456789abcdef0123456789abcdef0123456789abcdef01234567"
}
```

`kes_vkey` accepts hexadecimal encoding for a 32 byte KES verification key. `issue_counter` identifies the operational certificate sequence, `kes_period` identifies the KES period, and `key` identifies the cold key that signs the request.

The successful response contains the audit identifier, the cold signature, the cold verification key, and the key identifier:

```json
{
  "audit_id": "550e8400-e29b-41d4-a716-446655440000",
  "signature": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  "cold_vkey": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  "key": "0123456789abcdef0123456789abcdef0123456789abcdef01234567"
}
```

The endpoint returns `signature` and `cold_vkey` as hexadecimal values. The signature supplies the cold signature material required with the request KES verification key, issue counter, and KES period to construct the operational certificate envelope. `audit_id` correlates the response with the signing audit record.

Bursa rejects the request when any of the following conditions applies:

- The caller ACL does not authorize the cold key.
- The cold key policy does not list `opcert` in `allowed_requests`.
- The cold key does not belong to a stake pool.

Configure `allowed_requests` as described in the [operational certificate signer policy](./009-configuration-reference#operational-certificate-signer-policy).

## GCP persisted wallet administration

When GCP wallet storage is enabled, the following legacy wallet operations require administrator authorization:

| Method and path | Request body | Operation |
| --- | --- | --- |
| `GET /api/wallet/list` | None | Lists persisted wallets. |
| `POST /api/wallet/get` | `name` | Returns one persisted wallet. |
| `POST /api/wallet/update` | `name`, `description` | Updates a persisted wallet description. |
| `POST /api/wallet/delete` | `name` | Deletes a persisted wallet. |

Send a valid bearer token in the `Authorization` header for every operation:

```http
Authorization: Bearer <JWT>
```

The JWT subject must appear in the administrator subject configuration. Configure `api.jwt_admin_subjects` or `API_JWT_ADMIN_SUBJECTS` as described in the [legacy API security reference](./009-configuration-reference#legacy-api-security). Bursa also requires a configured JWT trust source and an administrator subject before it starts with authenticated GCP wallet storage.

### Legacy wallet request bodies

The `get`, `update`, and `delete` requests use these JSON shapes:

#### Get a wallet

```json
{
  "name": "wallet-name"
}
```

#### Update a wallet

```json
{
  "name": "wallet-name",
  "description": "Updated wallet description"
}
```

#### Delete a wallet

```json
{
  "name": "wallet-name"
}
```

These three legacy persisted-wallet request schemas do not accept a `password` property. Wallet creation and restoration remain separate operations; this schema change does not remove their password fields.

### Authorization responses

- Bursa returns HTTP `401 Unauthorized` when the request lacks valid bearer authentication.
- Bursa returns HTTP `403 Forbidden` when the JWT authenticates successfully but its subject does not appear in the administrator subject configuration.

Successful wallet responses and storage errors use the endpoint-specific response behavior. The authorization checks occur before Bursa performs the requested list, get, update, or delete operation.