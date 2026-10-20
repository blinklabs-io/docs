---
title: LocalMessageSubmission replay protection
description: Configure replay protection and duplicate handling for authenticated LocalMessageSubmission messages.
---

# LocalMessageSubmission Replay Protection

This guide explains replay protection for the authenticated `LocalMessageSubmission` path available in gOuroboros `v0.213.7`. It covers the runtime submission sequence and the configuration required to deduplicate message IDs across connections.

## Overview

The server uses a `Config`-scoped replay cache to prevent an authenticated local DMQ message ID from being processed more than once while its original `ExpiresAt` value remains active. The server prunes expired IDs as it processes new reservations.

This behavior is available in [gOuroboros `v0.213.7`](https://github.com/blinklabs-io/gouroboros/releases/tag/v0.213.7). The [gOuroboros API documentation](https://pkg.go.dev/github.com/blinklabs-io/gouroboros) provides the package reference.

## Configuration

Create the `Config` with `localmessagesubmission.NewConfig` and set the server callback, message authentication, TTL validation, and replay capacity explicitly:

```go
cfg := localmessagesubmission.NewConfig(
	localmessagesubmission.WithSubmitMessageFunc(submitMessage),
	localmessagesubmission.WithAuthenticator(authenticator),
	localmessagesubmission.WithTTLValidator(ttlValidator),
	localmessagesubmission.WithMaxReplayEntries(10000),
)
```

The `WithMaxReplayEntries` option controls the maximum number of authenticated message IDs that the server retains until their expiration. It does not limit callback concurrency or the number of active connections.

### Use one configuration across connections

Construct one `Config` outside the connection accept loop and pass that configuration to every `LocalMessageSubmission` server. Copies of the same `Config` share its replay state. Separate calls to `localmessagesubmission.NewConfig` create separate replay state, so those configurations do not deduplicate the same message ID.

```go
cfg := localmessagesubmission.NewConfig(
	localmessagesubmission.WithSubmitMessageFunc(submitMessage),
	localmessagesubmission.WithAuthenticator(authenticator),
	localmessagesubmission.WithTTLValidator(ttlValidator),
	localmessagesubmission.WithMaxReplayEntries(10000),
)

// Create each connection's LocalMessageSubmission server with &cfg.
// Do not call NewConfig inside this loop.
for {
	conn := acceptConnection()
	startLocalMessageSubmission(conn, &cfg)
}
```

The connection setup functions in the example represent the host application's connection management. The important requirement is that every server receives the same `Config` value created before the loop.

### Capacity and expiration

- `MaxReplayEntries` defaults to `10,000` when it is zero or unset.
- `localmessagesubmission.WithMaxReplayEntries(...)` changes the bound on retained authenticated message IDs.
- The server removes IDs whose `ExpiresAt` value has passed while it processes a new reservation.
- When the cache reaches its capacity, the server rejects a new message ID until an existing entry expires and the server prunes it.
- A negative value is invalid. The server rejects the submission before it calls `SubmitMessageFunc`.

Capacity and invalid configuration failures do not use a separate error code. The server returns a protocol rejection with `pcommon.OtherReason` for these conditions.

## Submission behavior

For an authenticated local DMQ submission, the server follows this order:

1. Validate the message TTL.
2. Prepare and authenticate the message.
3. Validate the TTL again using the submission time.
4. Reserve the message ID in the replay cache.
5. Call `SubmitMessageFunc` only after the reservation succeeds.

Only a submission that passes authentication and TTL validation enters the replay cache. The reservation occurs before `SubmitMessageFunc`, and the mutex makes the reservation atomic for concurrent submissions that share the same configuration.

### Duplicate submissions

The first valid submission reserves its message ID and can reach `SubmitMessageFunc`. A sequential duplicate receives `pcommon.AlreadyReceivedReason`, and the server does not call the callback for that duplicate.

Concurrent submissions with the same ID follow the same rule. The first submission to reserve the ID can reach `SubmitMessageFunc`; every other submission receives `pcommon.AlreadyReceivedReason` and does not reach the callback. This rule also applies when the submissions arrive through different connections that reuse one `Config`.

The server keeps the ID reserved until its original `ExpiresAt` value passes. If `SubmitMessageFunc` rejects the first submission, that callback result does not release the reservation. A later submission cannot immediately reuse the same ID; it must wait for expiration.

## Rejection behavior

The server produces the following observable outcomes:

| Condition | Result | Callback invocation |
| --- | --- | --- |
| Valid, authenticated, non-expired ID with available capacity | The server reserves the ID and processes the submission. | `SubmitMessageFunc` runs once. |
| ID already reserved and not expired | The server rejects the submission with `pcommon.AlreadyReceivedReason`. | The callback does not run. |
| Cache at `MaxReplayEntries` for a new ID | The server rejects the submission with `pcommon.OtherReason`. | The callback does not run. |
| Negative `MaxReplayEntries` | The server rejects the submission with `pcommon.OtherReason`. | The callback does not run. |
| TTL validation or authentication failure | The server rejects the submission according to the validation or authentication result. | The callback does not run. |

An expired ID can enter the cache again after the server prunes its previous reservation. A duplicate ID that remains active never reaches the application callback, regardless of whether the original callback accepted or rejected the message.

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
