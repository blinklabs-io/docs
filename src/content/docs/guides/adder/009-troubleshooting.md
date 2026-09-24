---
title: Adder Troubleshooting Guide
description: Diagnose Adder connections, configuration, filters, FCM push, and webhook delivery.
---
# Adder Troubleshooting Guide
This guide provides a practical sequence for diagnosing Adder connection, configuration, filter, FCM push, and webhook delivery problems.
## Before troubleshooting
1. Confirm the executable responds to `./adder --help`.
2. Add `--logging-level debug` while investigating a startup or delivery problem. The CLI logs pipeline errors and continues running when a background plugin reports an error.
3. Record the active input, output, endpoint, and configuration file before changing settings.
## 1. Connection problems
### Socket path problems for NtC
Use a UNIX socket for a local node-to-client connection. A missing socket or insufficient permissions prevents the `chainsync` input from connecting.
1. Confirm that the Cardano node is running and that its socket exists:
```bash
ls -l /path/to/cardano-node.socket
```
2. Confirm that the Adder process can access the socket:
```bash
test -r /path/to/cardano-node.socket && test -w /path/to/cardano-node.socket
```
3. Start Adder with the socket path:
```bash
./adder \
  --input chainsync \
  --input-chainsync-socket-path /path/to/cardano-node.socket
```
If the command reports `no such file or directory`, correct the path or start the node that owns the socket. If it reports a permission error, grant the Adder process the required socket access.
### Network selection and network magic
The configured network must match the network used by the Cardano node. A mismatch causes the handshake to fail even when the socket or TCP endpoint is reachable.
1. Set a well known network name when the node uses one of the supported network names:
```bash
./adder \
  --input chainsync \
  --input-chainsync-network preview
```
2. Set the network magic explicitly when the node requires a value that differs from the selected network name:
```bash
./adder \
  --input chainsync \
  --input-chainsync-network-magic <network-magic>
```
Check the node startup configuration and make the Adder network name or network magic match it. The explicit network magic takes precedence over the network name.
### TCP and NtC or NtN selection
Use `--input-chainsync-address` for a node endpoint in `host:port` form:
```bash
./adder \
  --input chainsync \
  --input-chainsync-address node.example:3001
```
For NtC over TCP, also set `--input-chainsync-ntc-tcp`. Use a socket path instead for a local UNIX socket connection. Check that the configured port accepts connections:
```bash
nc -zv node.example 3001
```
An open TCP port does not verify the Cardano protocol or network magic. Review the Adder log after the connectivity check to diagnose a protocol handshake failure.
## 2. Configuration problems
Adder resolves a setting in this order:
1. An explicitly supplied CLI flag.
2. The value in the YAML file named by `--config`.
3. The supported environment variable for that setting.
4. The built in default.
For example, set the chainsync network through a supported environment variable:
```bash
INPUT_CHAINSYNC_NETWORK=preview ./adder --input chainsync
```
Do not add an `ADDER_` prefix unless a specific setting documents that environment variable. Use the exact environment name supported by the setting, or use the CLI and YAML forms instead. If a CLI flag and a YAML value disagree, the CLI flag wins; if neither is present, the YAML value wins over the environment value.
### Environment values have no effect
1. Check the exact variable name and value in the shell:
```bash
env | grep '^INPUT_CHAINSYNC_NETWORK='
```
2. Check whether the command line supplies the same setting. A CLI value overrides the environment value.
3. Check the YAML file passed to `--config`. A YAML value also overrides the environment value.
4. Remove conflicting values or set the intended value at the highest required precedence.
### YAML errors
Malformed YAML, an unreadable configuration path, or a value with the wrong type prevents configuration loading. Check the startup error for the path or setting, then correct the YAML indentation, key name, or value type. Supply the file explicitly when testing:
```bash
./adder --config ./config.yaml
```
## 3. Filter problems
Filters can make a healthy pipeline appear idle when the selected event does not match the filter values. Start with one event type, confirm that events arrive, and add other filters one at a time:
```bash
./adder \
  --filter-type input.transaction
```
The `--filter-type` flag accepts these event types:
- `input.block`
- `input.rollback`
- `input.transaction`
- `input.governance`
- `input.drep-registration`
Use the corresponding filter for the value being investigated:
- `--filter-address` accepts a payment or stake address in Bech32 form.
- `--filter-asset` accepts an asset fingerprint such as `asset1...`.
- `--filter-policy` accepts a 56 character hexadecimal policy ID.
- `--filter-pool` accepts a pool ID.
- `--filter-drep` accepts comma separated DRep IDs in hexadecimal or Bech32 form, including `drep1...` and `drep_script1...` values.
- `--filter-type` accepts comma separated event types.
Adder trims surrounding whitespace from comma separated filter values and ignores empty values. Check the spelling, value format, and event applicability before adding another filter. For example, policy and asset filters do not apply to `input.block` or `input.governance` events.
## 4. FCM push problems
### Credentials and service account
The push output requires a readable service account file with a non empty `project_id` value.
1. Confirm that the file exists and can be read:
```bash
test -r /path/to/service-account.json
grep '"project_id"' /path/to/service-account.json
```
2. Start the push output with the service account path:
```bash
./adder \
  --output push \
  --output-push-serviceAccountFilePath /path/to/service-account.json
```
An unreadable file, malformed JSON, or missing or empty `project_id` prevents the push output from starting or obtaining an access token. Check the logged error before replacing credentials.
### Token registration and removal
The FCM token API uses the `/v1/fcm` route. A token registration request must contain a non empty `fcmToken` JSON field:
```bash
curl -i -X POST http://localhost:8080/v1/fcm \
  -H 'Content-Type: application/json' \
  -d '{"fcmToken":"<token>"}'
```
The server returns `201 Created` for a stored token and `400 Bad Request` when the JSON is invalid or `fcmToken` is missing or empty.
When FCM reports an expired or unregistered token, remove it with the token specific route:
```bash
curl -i -X DELETE 'http://localhost:8080/v1/fcm/<token>'
```
The server returns `204 No Content` when it removes an existing token and `404 Not Found` when the token does not exist. Do not use the root `/fcm` path.
## 5. Webhook problems
### Verify the receiving endpoint
Verify that the receiving service accepts an HTTP `POST` with JSON before diagnosing Adder delivery:
```bash
curl -i -X POST 'https://webhook-host.example/events' \
  -H 'Content-Type: application/json' \
  -d '{"type":"input.rollback","payload":{"blockHash":"test-hash","slotNumber":1}}'
```
Require the receiving service to return a `2xx` status. A connection error, an invalid URL, or any non `2xx` status causes webhook delivery to fail.
Configure the webhook output with the registered options:
```bash
./adder \
  --output webhook \
  --output-webhook-url 'https://webhook-host.example/events' \
  --output-webhook-format adder \
  --logging-level debug
```
The webhook options are:
- `--output-webhook-url` sets the destination URL. The default is `http://localhost:3000`.
- `--output-webhook-format` selects `adder` or `discord` payload formatting. The default is `adder`.
- `--output-webhook-username` and `--output-webhook-password` provide HTTP Basic Authentication credentials.
- `--output-webhook-tls-skip-verify` disables TLS certificate verification.
### Retries and delivery errors
Adder retries a failed webhook delivery up to three times. The first retry waits one second, each subsequent delay doubles, and the delay stops increasing at 30 seconds. These retry values are built in; the webhook output does not register CLI flags for changing the retry count or initial backoff.
The webhook plugin reports these errors through its error path and the CLI logs them as pipeline errors:
- The destination cannot be reached or returns a non `2xx` status.
- Adder cannot create a request from the webhook URL.
- The selected format cannot serialize the event.
- An event has a missing or malformed payload or context.
- The event type is unknown.
Malformed events and unknown event types produce errors instead of runtime crashes. A shutdown signal interrupts a pending retry delay, so stopping Adder does not wait for the full backoff period.
### TLS certificate errors
Install or trust the certificate authority that issued the receiving service certificate. Use `--output-webhook-tls-skip-verify` only for a controlled test with a self signed certificate; it disables certificate verification and does not repair an invalid certificate or hostname. Do not use it as a general certificate fix.
After correcting the endpoint, credentials, payload format, or certificate, repeat the manual `POST` test and then run Adder with `--logging-level debug` to confirm successful delivery.

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
