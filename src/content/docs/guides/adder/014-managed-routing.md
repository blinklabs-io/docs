---
title: Managed Customer Routing and Configuration Reference
description: Configure Adder managed customer routing, reload its configuration, and interpret routing status and delivery evidence.
---

# Managed customer routing and configuration

## Overview

This reference describes Adder's opt-in managed mode. Managed mode reads one
ChainSync stream, applies independent filter lanes for named customers, and
sends matching events to customer destinations. The [operating mode
overview](./002-operating-mode-overview) explains how managed mode fits with
Adder's other operating modes. The [command reference](./006-command_list)
lists the complete CLI; this page describes the managed flags and their
runtime behavior.

Managed mode does not change ordinary CLI or embedded pipelines when
`--managed-config-dir` is absent. Those pipelines retain their existing
filters, output backpressure, configuration precedence, HTTP API, and public
`/events` stream.

## Activation and prerequisites

Set `--managed-config-dir` to select managed mode. Adder then requires the
`chainsync` input with the following settings:

- `intersect-tip=true`
- `auto-reconnect=true`
- no `state-path`
- no explicit `intersect-point`
- no global filter options

Managed mode uses the ChainSync source as a live tail. The ordinary HTTP API
and public `/events` stream do not start. A process restart can lose events
between runs because Adder starts at the then current tip. During an
in-process reconnect, Adder can replay recent events or emit a rollback. Neither the
router nor its enabled plugins persists a delivery queue.

The source can connect to Dingo or a public Cardano peer. All customer lanes
share this one input; the configuration assigns each matching event to its
destinations.

## Operator flags and prerequisites

The managed flags are:

| Flag | Default | Purpose |
| --- | --- | --- |
| `--managed-config-dir` | Empty | Enables managed mode and identifies the directory containing `manifest.json` and customer files. |
| `--managed-credentials-dir` | Empty | Identifies the directory containing restricted credential files. |
| `--managed-log-dir` | Empty | Identifies the trusted local directory for managed `log` destinations. |
| `--managed-token-file` | Empty | Identifies the restricted file containing the operator API token. |
| `--managed-address` | `127.0.0.1:8081` | Sets the private managed API listener address. Adder accepts only a literal loopback address. |
| `--managed-allow-hosts` | Empty | Lists operator-approved webhook hostnames. |
| `--managed-allow-local-targets` | `false` | Allows loopback webhook receivers for local tests. |

The managed API listener accepts only a literal loopback address. Provide
remote operator access through a separately administered secure tunnel. The
`--managed-allow-local-targets` flag is an explicit exception for loopback
webhook receivers used in local tests. Other webhook targets require HTTPS,
an approved hostname, and a public destination address.

The operator must store the token in a restricted regular file that contains one line
with at least 32 characters, and remain outside URLs. On Unix, credential and
operator token files require mode `0600` or stricter. On Windows, ownership
must belong to the running account, `LocalSystem`, or `Administrators`, and
the Windows access control list can grant access only to those identities.

## Publish configuration files

The operator owns the configuration and credential files. Adder never writes
these files. Publish a complete bundle by atomic replacement in this order:

1. Publish credential files.
2. Publish customer files.
3. Publish `manifest.json` last.

Increment the manifest `generation` for a full publication and increment each
changed customer `revision`. Use private operator-owned directories. Keep a
protected known-good bundle outside the live publication directory so a
rejected update can be restored or replaced with a corrected revision.

The initial bundle must contain at least one customer before Adder starts.
Adder confines every manifest and customer file reference to its configured
directory and accepts only safe basenames. Customer IDs must remain unique
when compared without ASCII letter case, including identities removed earlier
in the same run. Manifest file references must also remain unique without
ASCII letter case. Restart clears the in-memory history of applied identities
and revisions.

### Manifest

The manifest contains a positive generation and at least one customer
reference. Each reference repeats the customer's ID and revision and names a
customer file:

```json
{
  "generation": 1,
  "customers": [
    {
      "id": "u1",
      "revision": 1,
      "file": "u1.json"
    }
  ]
}
```

The manifest file must contain one valid JSON value. Unknown fields and
additional JSON values cause validation to fail. A customer file must repeat
the referenced `id` and `revision` exactly.

### Customer rules and destinations

A customer needs at least one destination and one filter rule. Each rule has
an identifier, one canonical input event type, and either `all` or one named
destination. The supported canonical event types are:

- `input.block`
- `input.transaction`
- `input.rollback`
- `input.governance`
- `input.drep-registration`
- `input.drep-update`
- `input.drep-retirement`

Optional `criteria` can contain arrays named `addresses`, `policies`,
`asset_fingerprints`, `pool_ids`, and `drep_ids`. Address, policy, and asset
criteria combine with AND. Pool and DRep identities combine with OR when both
appear. The matcher accepts pool criteria for block rules, all criteria for
transaction rules, address, pool, and DRep criteria for governance rules,
DRep criteria for DRep certificate rules, and no Cardano criteria for
rollback rules.

This customer sends blocks and rollbacks to every destination and
transactions to the `local` destination:

```json
{
  "id": "u1",
  "revision": 1,
  "destinations": [
    {
      "id": "local",
      "plugin": "log",
      "options": {
        "path": "u1.events.jsonl",
        "format": "json"
      }
    }
  ],
  "filters": [
    {
      "id": "blocks",
      "event_type": "input.block",
      "destination": "all"
    },
    {
      "id": "transactions",
      "event_type": "input.transaction",
      "destination": "local"
    },
    {
      "id": "rollbacks",
      "event_type": "input.rollback",
      "destination": "all"
    }
  ]
}
```

Managed `log` destinations write trusted local JSON append files. The
basename must start with the owning customer ID followed by a period, and
Adder confines the opened file and verifies its regular-file identity. A
managed log destination cannot use an arbitrary path or stdout as a payload
destination.

### Webhook destinations and credentials

Webhook destinations use versioned references to restricted files for the URL
and optional basic authentication values:

```json
{
  "id": "alerts",
  "plugin": "webhook",
  "options": {
    "format": "adder"
  },
  "credentials": {
    "url": {
      "file": "u1-alert-url-v1.json",
      "version": 1
    }
  },
  "limit_group": "alerts.example.com",
  "interval_ms": 1000
}
```

The referenced credential file contains the owning customer, its credential
version, and the value:

```json
{
  "customer_id": "u1",
  "version": 1,
  "value": "https://alerts.example.com/incoming/SECRET"
}
```

Credential references are instance-owned, confined to the credentials
directory, and cannot be shared across customers. Adder does not allow the
contents of an applied reference version to change, even when the customer
revision advances. Publish a new version to rotate a credential. Credential
the operator must restrict credential files in the same way as the operator token file.

Adder validates webhook targets, credential bindings, formats, approved
hosts, local target exceptions, redirects, and provider quota groups. It
rejects redirects, environment proxies, private or reserved destination
addresses, DNS changes into denied addresses, `state-path`, TLS verification
bypass, and undeclared options. `format=discord` requires an interval of at
least two seconds.

## Authenticated configuration API

Every managed route, including status, health, and metrics, requires this
header:

```http
Authorization: Bearer <operator token>
```

Adder returns `401 Unauthorized` for a missing or invalid bearer token and
sets `WWW-Authenticate: Bearer`. Requests use the loaded token and read the
published files; reload requests do not accept replacement configuration
bodies.

| Request | Body | Result |
| --- | --- | --- |
| `POST /v1/config/reload` | `{"generation":2}` | Validates and prepares the complete manifest, then switches it at one dispatch boundary. Use this route for customer additions and removals. |
| `POST /v1/config/customers/{id}/reload` | `{"revision":2}` | Reloads one existing customer while the manifest roster remains unchanged. Other customers retain their applied revisions. |
| `GET /v1/config/status` | None | Returns observed and applied generations, customer revisions and cutovers, validation errors, destination state, counters, capabilities, and source state. |
| `GET /healthcheck` | None | Returns router readiness. Source connectivity and destination degradation remain separate status signals. |
| `GET /metrics` | None | Returns aggregate managed counters without customer or credential labels. |

The authenticated managed `/metrics` endpoint is separate from the ordinary
pipeline metrics described in the [metrics reference](./010-metrics). The
ordinary output plugins and their normal configuration appear in the
[output integrations guide](./008-output-integrations); managed mode does
not enable those adapters.

## Reload and cutover semantics

Adder serializes reloads and validates and stages the new configuration
before switching it. The default preparation deadline is 10 seconds. A
failed preparation leaves the existing configuration active and cleans up
staged plugins. Cleanup can take up to five seconds; unfinished cleanup stays
charged to the managed work budget and can produce a cleanup-pending error.

The full reload route requires the expected manifest `generation`. A targeted
reload requires the expected customer `revision`, an existing customer, and
an unchanged manifest roster. Stale generations and revisions, content
changes without an increment, identity mismatches, invalid files, and
resource reservations that exceed the limits fail the reload. Repeating
identical content at an applied generation or revision is idempotent. A
targeted reload can leave customer revisions mixed. A removed customer's
latest applied identity and revision remain reserved for the life of the
process; a restart clears that history.

A successful reload response includes `cutover_occurrence_id`. Adder assigns
monotonically increasing occurrence IDs to source events, including
rollbacks and repeated identical events. The value identifies the last source
occurrence assigned before the configuration switch. It can appear even when
no event arrives afterward, and an idempotent repeat returns the original
cutover value.

`cutover_occurrence_id` is not a drain acknowledgement, does not assert that
the revision handled an event, and does not confirm external delivery.
Events already admitted to a customer retain their configuration revision.
Removing a customer or destination, or rotating credentials, revokes the old
destination generation even when old revision events remain in a customer
queue. Already submitted work can have an uncertain outcome.

## Queue isolation, limits, and counters

Managed dispatch uses bounded per-customer and per-destination queues. Each
customer has one filter worker that preserves input order, while destination
workers operate independently. A slow customer does not consume another
customer's queue allowance. Overlapping rules coalesce into one submission
per occurrence and destination, with sorted matching rule IDs. Adder offers a
match immediately and does not use a periodic flush timer.

The default managed routing bounds are:

| Resource | Default |
| --- | ---: |
| Customers | `32` |
| Rules per customer | `32` |
| Destinations per customer | `8` |
| Active, staged, or retiring plugin instances | `512` |
| Input queue per customer | `256` items |
| Destination queue | `256` items |
| Event JSON representation | `1 MiB` |
| Accounted retained data per queue | `16 MiB` |
| Process-wide managed reservation budget | `512 MiB` |

Adder reserves queue capacity before a configuration switch. Each queue uses
a conservative charge of eight times the encoded event size plus fixed
overhead. Configuration objects, matched rule metadata, plugin channel
slots, decoded credentials, and retired configurations with queued events
also consume the process-wide budget. These are routing work bounds, not a
total process memory guarantee; Go runtime overhead, input plugin buffers, and transient
encoder allocations remain outside the guarantee.

A full queue drops the new item and increments that lane's drop counters. A
reload that cannot reserve resources fails before the switch. The managed
work budget also accounts for diagnostic metadata. Its asynchronous queue
holds at most 1,024 entries, with a lower limit for smaller process budgets;
`diagnostic_dropped` counts diagnostic overflow separately from event loss.

Status and process totals distinguish these counters:

| Counter | Meaning |
| --- | --- |
| `input_dropped` | Counts events that a customer lane rejects during admission. |
| `matched` | Rule matches, counted per rule. |
| `destination_dropped` | Counts items that a destination queue rejects. |
| `submitted_to_plugin` | Items accepted by a managed plugin channel. |
| `plugin_errors` | Plugin processing errors. |
| `unknown_outcomes` | Submissions whose external result remains uncertain. |
| `canceled` | Work canceled during revocation or shutdown. |
| `diagnostic_dropped` | Counts metadata diagnostics that overflow the diagnostic queue. |

Customer counters cover admission and matching. Destination counters cover
submissions and outcomes. Process totals retain counts from removed
destinations. Diagnostics use `component=managed.router` and include opaque
customer and rule IDs, revisions, and occurrence IDs, but never credentials
or event payloads.

## Delivery evidence, errors, and shutdown

Managed delivery is neither durable nor exactly once. The plugin channel
reports processing completion, not external delivery. The completion observer
handles one outstanding plugin event at a time and only observes that the
plugin finished processing. Plugin channel acceptance therefore never proves
that a provider accepted, stored, or delivered the event.

External outcomes remain unknown, including an accept-then-disconnect failure
that can cause a retry and a duplicate send. HTTP and log write errors remain
separate diagnostics. A destination that fails or exhausts its active work
budget remains degraded, while another customer's destination continues
independently.

HTTP attempts have a five-second deadline. Managed destination processing has
a 15-second active work budget, excluding time waiting for its shared quota.
Webhook retries remain bounded. A provider's `429` response and
`Retry-After` value delay every destination in the canonical target
authority's shared limit group; another origin progresses independently. The
configured `interval_ms` sets the minimum spacing between attempts, including
retries. All destinations in one authority group must use the same interval.
Pending provider delays survive route removal and interval changes at the
configuration cutover. The pilot supports authority-scoped quotas; an output
that needs quotas shared across distinct authorities requires a dedicated
adapter.

Shutdown follows this sequence:

1. Stop source admission.
2. Drain admitted routing work for up to 20 seconds by default.
3. Cancel remaining work.
4. Join canceled workers for up to five additional seconds, or the shorter
   configured shutdown timeout.

An unfinished plugin returns a cleanup-pending error, retains its resource
reservations, and prevents the same router from restarting until its worker
finishes. Log files close only after their writer joins. Submitted operations
can remain uncertain even when plugin processing finishes. Readiness is false
during startup and shutdown. One degraded destination does not terminate
another customer's route or reconnect the input.

## Managed adapter capabilities

Managed mode restricts destinations to `log` and `webhook`:

| Adapter | Managed disposition |
| --- | --- |
| `log` | Enabled for trusted local JSON append files whose basename starts with the owning customer ID followed by a period. |
| `webhook` | Enabled for one target using `adder` or `discord` format, instance-owned credentials, confined transport, authority quota, and bounded retries. |
| `slack`, `telegram`, `discord`, `matrix`, `signal`, `push` | Managed mode rejects these adapters because bot or server lifecycle, multi-target sending, or provider account quotas require a dedicated adapter. |
| `sns`, `sqs`, `pubsub`, `s3`, `kafka`, `nats`, `mqtt`, `rabbitmq`, `redis`, `postgres`, `clickhouse`, `elasticsearch` | Managed mode rejects these adapters because SDK or broker buffers, retries, endpoint discovery, credentials, and quota boundaries require a dedicated adapter. |
| `notify`, `notify-json` | Managed mode rejects these adapters because desktop and file side effects are not customer-isolated. |

The output registry alone does not make an adapter available in managed mode.
An adapter must define its lifecycle, allowed events, delivery to multiple destinations, retained
buffers, rate limits, credentials, target restrictions, and observable
outcomes before managed mode can enable it.

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>