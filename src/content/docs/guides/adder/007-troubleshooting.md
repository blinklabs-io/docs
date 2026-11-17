---
title: Adder Troubleshooting and Observability
description: Diagnose Adder connections, configuration, filters, delivery, health, metrics, and goroutine leaks.
---

# <ins>Adder troubleshooting and observability</ins>

This guide provides operational checks for Adder input connections, configuration, filters, push notifications, webhooks, API probes, metrics, and goroutine leak profiling.

## Prerequisites

- An Adder binary that matches the configuration and command examples.
- Access to the Cardano node, its node-to-client socket or node-to-node address, and the Adder API listener.
- A shell with `curl`, `nc`, and `grep` for the diagnostic commands.

## API diagnostics

The health and metrics endpoints are outside the versioned `/v1` route group. The default API listener is `0.0.0.0:8080`; use the configured `API_ADDRESS` and `API_PORT` when the listener differs.

### Check process health

```bash
curl -i http://127.0.0.1:8080/healthcheck
```

The response preserves the `failed` field. Adder returns HTTP `200` when every registered checker reports that it is running and HTTP `503` when any registered checker reports that it is not running. A `checks[]` entry can include the running state and sanitized diagnostics:

- `uptimeSeconds` appears only when it is finite and nonnegative.
- `terminalFailure` reports whether the component has recorded a terminal failure.
- `components` contains at most 128 entries with a capped `role`, nonnegative `index`, and allowed `state` value.

Health responses do not expose endpoint URLs, configuration, error strings, or sensitive values as diagnostic data. A `503` response identifies a failed probe state; it does not by itself identify a remote endpoint or a configuration value.

### Read Prometheus metrics

```bash
curl -i http://127.0.0.1:8080/metrics
```

The endpoint returns Prometheus text from the configured API listener. It is not under `/v1`. Restrict the listener at the network boundary when metrics must remain private.

| Metric | Meaning |
| --- | --- |
| `adder_webhook_http_attempts_total{status_class}` | Counts each webhook HTTP delivery attempt. The `status_class` label is one of `1xx`, `2xx`, `3xx`, `4xx`, `5xx`, `network`, or `other`. Redirects within one attempt use the final response class. |
| `adder_webhook_delivery_outcomes_total{outcome}` | Counts each final webhook outcome. The `outcome` label is `success`, `terminal`, or `exhausted`. |
| `adder_webhook_http_attempt_duration_seconds` | Measures each webhook HTTP attempt from request start through response-body consumption or request failure. |

These measurements run in the Adder process and reset after a process restart. They contain no URL, event, address, hash, client, or other unbounded labels. They do not identify an external endpoint, persist pending delivery state, or guarantee restart-safe delivery.

## Troubleshooting procedures

### NtC socket does not exist or cannot be opened

The NtC socket path must point to a Unix socket that the Adder process can access. Check the path and permissions before starting Adder:

```bash
SOCKET_PATH=/path/to/node.socket
test -S "$SOCKET_PATH" && ls -l "$SOCKET_PATH"
```

Configure the same path with `--input-chainsync-socket-path` or the corresponding chainsync YAML or environment setting. A missing socket, a regular file at the path, or insufficient permissions prevents the NtC connection. Grant the Adder process access to the socket without changing the path to an unrelated node socket.

When a node exposes the NtC socket through TCP, enable `--input-chainsync-ntc-tcp` and test the TCP address instead of testing the Unix socket:

```bash
nc -vz node.example.org 3001
```

### Network magic mismatch

The configured network name and the node must identify the same Cardano network. Check the selected network and, when required, set the explicit magic value:

```bash
./adder --input-chainsync-network preview
./adder --input-chainsync-network-magic 2
```

`--input-chainsync-network-magic` overrides `--input-chainsync-network`. Verify the value against the node before changing the input protocol or socket path. Apply the equivalent setting under the chainsync plugin in YAML or through its environment variable family.

### NtC and NtN selection

Use NtC for a local node socket. Use NtN for a node address reachable over the network. NtC over TCP applies only when a separate socket forwarding mechanism exposes the node-to-client socket as TCP.

```bash
# Local Unix socket
./adder \
  --input chainsync \
  --input-chainsync-socket-path /path/to/node.socket

# Node-to-client over a forwarded TCP socket
./adder \
  --input chainsync \
  --input-chainsync-ntc-tcp \
  --input-chainsync-address node.example.org:3001

# Node-to-node over TCP
./adder \
  --input chainsync \
  --input-chainsync-address node.example.org:3000
```

Use `nc -vz` against a TCP address to distinguish a closed port from an Adder protocol or network-magic problem. A reachable port does not validate the selected protocol.

### Configuration precedence and environment diagnostics

Adder resolves settings in this order, from lowest to highest precedence:

1. Defaults
2. YAML configuration
3. Environment variables
4. Explicit CLI flags

The command reference lists the flags and their YAML and environment forms. Core environment names use families such as `INPUT_`, `OUTPUT_`, `API_`, and `DEBUG_`; plugin names follow the plugin type and name. Adder does not add a global `ADDER_` prefix.

Inspect the relevant environment names without printing unrelated variables:

```bash
env | grep -E '^(INPUT|OUTPUT|API|DEBUG|KUPO_URL|FILTER_|SHELLEY_TRANS_EPOCH|BYRON_GENESIS_|SHELLEY_GENESIS_)' | sort
```

Use `--help` to verify that a CLI option exists before adding it to a startup command. For example, Adder registers `--output-webhook-url`, `--output-webhook-username`, `--output-webhook-password`, `--output-webhook-format`, and `--output-webhook-tls-skip-verify` as webhook options. Adder does not register `--output-webhook-max-retries` or `--output-webhook-initial-backoff`; either option causes an unknown-flag error.

### Filter logic and formatting

Adder trims whitespace around comma-separated filter values and ignores empty entries. Values within one filter form an OR list. Different filter types normally form an AND expression. `--filter-pool` and `--filter-drep` form an OR pair when both are set; other configured filters still apply.

Check a policy ID before passing it to `--filter-policy`:

```bash
POLICY_ID=13aa2accf2e1561723aa26871e071fdf32c867cff7e7d50ad470d62f
test "${#POLICY_ID}" -eq 56 || {
  printf 'policy ID must contain 56 hexadecimal characters\n' >&2
  exit 1
}
./adder --filter-type input.transaction --filter-policy "$POLICY_ID"
```

Use the exact event type, such as `input.block`, `input.rollback`, `input.transaction`, or `input.governance`. A filter that does not apply to an event type passes that event through unchanged. Use the environment and YAML names from the command reference rather than deriving names from shortened CLI flags.

### FCM credentials and delivery failures

The push output requires a service-account file. Set `--output-push-serviceAccountFilePath` to the file and verify that its JSON contains a nonempty `project_id` before starting Adder:

```bash
./adder \
  --output push \
  --output-push-serviceAccountFilePath /path/to/serviceAccount.json
```

A missing file, an empty path, or a service-account JSON object without a valid `project_id` causes startup or configuration failure. Check the Adder error output before investigating remote FCM delivery.

Delete a registered FCM token through the versioned API path:

```bash
TOKEN='replace-with-fcm-token'
curl -i -X DELETE "http://localhost:8080/v1/fcm/${TOKEN}"
```

This operation requires the `/v1` segment. A response from `/fcm/<token>` does not test the registered FCM route.

### Webhook connectivity and TLS

Test the configured webhook independently of the event pipeline with a direct POST:

```bash
WEBHOOK_URL='https://webhook.example.org/adder'
curl -i --verbose \
  -H 'Content-Type: application/json' \
  --data '{}' \
  "$WEBHOOK_URL"
```

Test a self-signed certificate only when the receiver is trusted for that diagnostic:

```bash
curl -i --verbose --insecure \
  -H 'Content-Type: application/json' \
  --data '{}' \
  "$WEBHOOK_URL"
```

If the insecure request succeeds while the normal request fails, repair the certificate chain or hostname configuration. Do not use `--output-webhook-tls-skip-verify` as a general TLS fix; that Adder option disables certificate verification for the webhook output.

Configure the webhook with registered options only:

```bash
./adder \
  --output webhook \
  --output-webhook-url "$WEBHOOK_URL" \
  --output-webhook-format adder
```

Adder does not expose retry count or backoff duration as CLI flags. The retry policy is runtime behavior described in [Webhook delivery behavior](#webhook-delivery-behavior), not a pair of command-line options.

## Webhook delivery behavior

### Retry classification

Adder makes one initial request and, by default, permits three retries. It retries only transient transport failures and these HTTP responses:

- `408 Request Timeout`
- `429 Too Many Requests`
- Any `5xx` response

Adder does not retry a nonretryable response. Permanent transport failures, including certificate and hostname validation failures, become `terminal` outcomes. An invalid webhook URL also becomes `terminal`.

### Backoff and `Retry-After`

The default retry schedule waits `1` second, `2` seconds, and `4` seconds after the first three retryable failures. The policy uses a factor of `2` and caps each wait at `30` seconds. A valid `Retry-After` value can extend the calculated wait when it remains within the maximum. Adder accepts an integer number of seconds or an HTTP date. A value beyond the maximum makes the delivery `terminal`; an invalid value does not replace the bounded exponential delay.

When the retry budget is reached, Adder records an `exhausted` outcome and discards the event after the final attempt. The retry loop and its measurements exist in process; they do not by themselves provide restart-safe delivery.

### Redirects

The HTTP client follows up to 10 redirects. A `301`, `302`, or `303` redirect changes the POST to a GET and drops the event body. A final `2xx` response after that redirect counts as success. Use `307` or `308` when a redirect must preserve the POST method and body. A redirect that does not reach a final response fails the delivery.

## Common error strings

| Error text | Likely cause and action |
| --- | --- |
| `error reading config file` | Adder cannot read the configured YAML file. Check the path and file permissions. |
| `error parsing config file` | The YAML structure or value is invalid. Check indentation, keys, and value types. |
| `error processing environment` | An environment value cannot be converted to the configured type. Check the variable name and value format. |
| `invalid webhook URL` | The webhook value is not an absolute `http` or `https` URL with a host. Check `--output-webhook-url` and its environment or YAML equivalent. |
| `server returned status: <status>` | The receiver returned a non-2xx response. Use the status code to determine whether Adder retries it. |
| `webhook exceeded 10 redirects` | The receiver exceeded the supported redirect limit. Test the URL and redirect chain with `curl -i --verbose`. |
| `webhook redirect discarded POST body` | A redirect did not preserve the POST body under the configured delivery policy. Use a body-preserving redirect or the final receiver URL. |
| `webhook delivery to <url> failed after <n> attempts` | Adder reached a terminal failure or exhausted its retry budget. Check the webhook metrics and receiver logs. |

## Go 1.26+ goroutine leak profiling

Go 1.26 or later can enable goroutine leak profiling with `GOEXPERIMENT=goroutineleakprofile`. Start Adder with the debug listener enabled:

```bash
GOEXPERIMENT=goroutineleakprofile ./adder \
  --debug-address 127.0.0.1 \
  --debug-port 6060
```

Capture the leak profile from the debug listener:

```bash
go tool pprof http://127.0.0.1:6060/debug/pprof/goroutineleak
```

The default debug port is `0`, which disables a reachable debug listener for this procedure. Set `--debug-port` or the corresponding `DEBUG_PORT` environment variable explicitly, and restrict the debug listener to an appropriate address.

Stop the profiling process after collecting the profile. Compare repeated profiles during a controlled start and stop cycle; a goroutine that remains after shutdown requires investigation in the component that owns it.

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>