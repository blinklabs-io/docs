---
title: Troubleshooting Guide
description: Diagnose Adder connections, configuration, filters, push notifications, and webhooks.
---

# Troubleshooting Adder

This guide covers verified command line, configuration, and API checks for Adder. Complete the checks for the affected input or output before changing other settings.

## Connection diagnostics

### Check a local NtC socket

The `chainsync` input uses the Cardano node's Unix socket for a local Node-to-Client (NtC) connection. Verify that the socket exists at the configured path:

```bash
test -S /path/to/cardano-node.socket && echo "socket exists" || echo "socket not found"
ls -l /path/to/cardano-node.socket
```

Configure the socket path with either the CLI flag or the custom environment variable:

```bash
./adder --input-chainsync-socket-path /path/to/cardano-node.socket
```

```bash
export CARDANO_NODE_SOCKET_PATH=/path/to/cardano-node.socket
```

The CLI flag is `--input-chainsync-socket-path`. The supported custom environment variable is `CARDANO_NODE_SOCKET_PATH`.

### Resolve a network mismatch

Set the network to the same Cardano network that the node serves. Use the network name or the node's numeric network magic:

```bash
./adder --input-chainsync-network preview
```

Use `--input-chainsync-network-magic` instead of `--input-chainsync-network` when the node configuration requires a numeric network magic. The CLI network flag takes precedence over values from YAML and the environment.

The supported environment variables for the network name are:

```bash
export INPUT_CHAINSYNC_NETWORK=preview
```

```bash
export CARDANO_NETWORK=preview
```

Use only one network name variable for a setting. The generated variable for the network magic is `INPUT_CHAINSYNC_NETWORK_MAGIC`; set it to the node's numeric network magic when required.

### Distinguish NtN and NtC over TCP

Use the connection form that matches the protocol exposed by the Cardano node:

- For the default remote Node-to-Node (NtN) connection, set `--input-chainsync-address` to `host:port`:

  ```bash
  ./adder --input-chainsync-address host:port
  ```

- When the Cardano node exposes a Node-to-Client (NtC) socket through TCP, set the same address and add `--input-chainsync-ntc-tcp`:

  ```bash
  ./adder --input-chainsync-address host:port --input-chainsync-ntc-tcp
  ```

The two TCP modes use different protocols. Check basic TCP reachability separately from the protocol handshake:

```bash
nc -zv host port
```

## Configuration and filter diagnostics

### Check configuration precedence

Adder applies settings in this order:

1. CLI flags
2. YAML configuration file
3. Environment variables
4. Built-in defaults

Use the documented `--config` flag to select a YAML file:

```bash
./adder --config ./config.yaml
```

Root configuration environment variables use names such as `INPUT`, `OUTPUT`, `API_PORT`, `LOGGING_LEVEL`, and `DEBUG_PORT`. Plugin options generate names from the plugin type, plugin name, and option name. For example, the chainsync network option uses `INPUT_CHAINSYNC_NETWORK`.

Do not add an `ADDER_` prefix to any environment variable name. Use the exact names shown in the connection procedures.

When a YAML file configures plugin options, use the documented plugin nesting and the option's expected YAML type. For example, `network` and `socket-path` accept strings, while `ntc-tcp` accepts a Boolean:

```yaml
plugins:
  input:
    chainsync:
      network: preview
      socket-path: /path/to/cardano-node.socket
      ntc-tcp: false
```

### Isolate a filter

Run Adder with only an event type filter to determine whether the input emits transaction events:

```bash
./adder --filter-type input.transaction
```

If the type-only command emits events, add other filters one at a time to identify the setting that excludes the expected events.

## Push and FCM diagnostics

### Verify push credentials

The `push` output requires a readable service account JSON file. The file must contain a non-empty string `project_id` value. Configure the file with `--output-push-serviceAccountFilePath`:

```bash
test -r /path/to/service-account.json && echo "credential file is readable" || echo "credential file is not readable"
grep -n '"project_id"' /path/to/service-account.json
./adder --output push --output-push-serviceAccountFilePath /path/to/service-account.json
```

Confirm that the displayed `project_id` has a non-empty value. Adder rejects an empty path, an unreadable or invalid JSON file, and a service account file without a non-empty `project_id`.

### Remove an invalid FCM token

Delete an expired or unregistered token through the FCM API route:

```bash
curl -X DELETE "http://localhost:8080/v1/fcm/<token>"
```

Replace the host and port when the API uses a different address. The executable registers the route at `/v1/fcm/<token>`; `/fcm/<token>` without `/v1` is not a registered route.

## Webhook diagnostics

### Test webhook delivery

Start the webhook output with the supported controls:

```bash
./adder \
  --output webhook \
  --output-webhook-url https://example.com/webhook \
  --output-webhook-format adder \
  --output-webhook-username username \
  --output-webhook-password password
```

For a webhook endpoint that uses a self-signed certificate, add `--output-webhook-tls-skip-verify`:

```bash
./adder \
  --output webhook \
  --output-webhook-url https://example.com/webhook \
  --output-webhook-tls-skip-verify
```

Send a manual request to check whether the endpoint accepts an HTTP POST:

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"type":"test"}' \
  https://example.com/webhook
```

The supported controls above do not include retry or backoff values. Adder keeps those settings as internal defaults, so CLI and YAML cannot configure them.

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>