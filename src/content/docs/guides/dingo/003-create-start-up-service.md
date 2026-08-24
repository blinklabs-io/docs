---
title: Create Startup Service
description: Create Startup Service for Dingo.
---

# Dingo

A Cardano blockchain node written in Go which actively participates in network communications on the Cardano blockchain using the Ouroboros Network Node-to-Node family of mini-protocols.

⚠️ Dingo is a work in progress and is currently under heavy development

<br>

***

In this guide, we will walk you through setting up a `systemd` service. Using a `systemd` service to run a Dingo Node maximizes the uptime by automatically restarting the Dingo node when the computer reboots. To get started follow the steps below.

<br>

✅ This guide assumes a typical Linux setup. Please adjust commands and paths as needed.

> ⚠️ For this guide we assume you have already completed the [Quick Start](../002-quick-start-overview) guide.

***

<br>

## Step 1 - Move the Dingo Binary and Configuration

We will move the Dingo binary to `/usr/local/bin/` and the configuration to `/etc/dingo/` so they are accessible system-wide.

<br>

Copy the binary:

```
sudo cp ~/dingo/dingo /usr/local/bin/
```

> ✅ You can verify the binary was copied by running `which dingo`

<br>

Create the config directory and copy the configuration:

```
sudo mkdir -p /etc/dingo
sudo cp ~/dingo/dingo.yaml /etc/dingo/
```

***

<br>

## Step 2 - Update Paths in `dingo.yaml`

Since the service will run as your user but the config is now in `/etc/dingo/`, we need to make sure the database and socket paths use absolute paths. Run the following to regenerate the config with your `$HOME` expanded:

```
sudo bash -c "cat <<EOF > /etc/dingo/dingo.yaml
# Global data directory for both blob and metadata storage plugins.
# Can be overridden with CARDANO_DATABASE_PATH or --data-dir.
databasePath: \"$HOME/dingo/.dingo\"

# Plugins
plugins:
  storage:
    blob:
      provider: \"badger\"
      config:
        # Optional Badger data directory. When unset, databasePath applies.
        dataDir: \"$HOME/dingo/.dingo/badger\"
        blockCacheSize: 0
        compression: false
        gc: true
        indexCacheSize: 0
    metadata:
      provider: \"sqlite\"
      config:
        # Optional SQLite data directory. When unset, databasePath applies.
        dataDir: \"$HOME/dingo/.dingo/metadata.db\"
  mempool:
    provider: \"default\"
    config:
      # `capacity` is an optional override, not a required setting.
      # Default: 1 MiB for Praos mode and normal serve mode, and 25 MiB for Musashi mode.
      # Leave the key commented or omit it to use the mode default.
      # capacity: 1048576
      # `revalidationDeltaCap` is optional. Default: 64. The value must be positive.
      # revalidationDeltaCap: 64
  api:
    blockfrost:
      provider: \"builtin\"
      config:
        port: 3000
    mesh:
      provider: \"builtin\"
      config:
        port: 8080
    utxorpc:
      provider: \"builtin\"
      config:
        port: 9090

# Mithril
mithril:
  aggregatorUrl: \"\"
  cleanupAfterLoad: true
  enabled: true
  verifyCertificates: true

# Network
bindAddr: \"0.0.0.0\"
metricsPort: 12798
debugPort: 0
debugBindAddr: \"127.0.0.1\"
network: \"preview\"
targetNumberOfRootPeers: 0
privateBindAddr: \"127.0.0.1\"
privatePort: 3002
relayPort: 3001
socketPath: \"$HOME/dingo/dingo.socket\"

# Storage
barkBaseUrl: \"\"
barkPort: 0
storageMode: \"core\"
# Database lifecycle
databaseLifecycle:
  # Dingo captures automatic database snapshots at epoch boundaries.
  # Default: false.
  snapshotEnabled: false
  # Dingo writes automatic snapshots to this local filesystem directory.
  # Set this when snapshotEnabled is true and when Bark mounts the live service.
  snapshotDir: \"$HOME/dingo/snapshots\"
  # Keep only the most recent automatic snapshots.
  # Default: 0.
  snapshotRetention: 0
  # Optional cloud mirror for snapshots.
  # snapshotCloudDestination: \"\"
  # snapshotCloudDestinationPrefix: \"\"
  # Capture an automatic snapshot every N epoch closes.
  # CLI: --db-snapshot-every-n-epochs
  snapshotEveryNEpochs: 1
EOF"
```

> 📝 `debugPort: 0` disables pprof. Dingo exposes pprof without authentication or TLS. `debugBindAddr` defaults to `127.0.0.1` on its dedicated listener rather than inheriting `bindAddr` or `privateBindAddr`. External access requires an explicit `debugBindAddr`, `DINGO_DEBUG_BIND_ADDR`, or `--debug-bind-addr` override and firewall or equivalent network controls. This policy applies to the one-time `dingo mithril sync` and the long-running `dingo serve` systemd service.

> 📝 When switching `plugins.storage.metadata.provider` to `postgres`, `statementTimeout` limits each statement and `lockTimeout` limits lock acquisition waits; both use nonnegative millisecond values. For `mysql`, `statementTimeout` limits top-level read-only `SELECT` statements through `max_execution_time` in milliseconds, `lockTimeout` sets `innodb_lock_wait_timeout` in whole seconds and rounds subsecond values up, and `readTimeout` and `writeTimeout` set transport socket I/O deadlines. Each field defaults to `0`; negative values are rejected, and all these fields are ignored when an explicit `dsn` is set.

> 📝 Before startup, Dingo preserves an existing `socketPath` unless it confirms a stale Unix socket and removes it. A regular file, symlink, directory, live socket, ambiguous probe, or removal error causes startup to fail. Keep the configured path absent or ensure that it contains only a removable confirmed stale Unix socket.

> 📝 `targetNumberOfRootPeers` controls public root selection. A nonzero Dingo value takes precedence over Cardano's target; `0` uses Cardano's target fallback, and Dingo uses an effective default of `60` when Cardano supplies no nonzero target. A positive value limits newly selected public roots while retaining configured local roots. Set `targetNumberOfRootPeers` to `-1` for unlimited selection. The setting maps to `DINGO_TARGET_ROOT_PEERS` and `--target-root-peers`.

> 📝 `databaseLifecycle.snapshotEnabled` controls automatic snapshots, and `dingo database snapshot|restore|truncate` handles offline maintenance. When Bark also serves live restore or truncate operations, set `barkPort`, `databaseLifecycle.snapshotDir`, `barkClientCaFilePath`, and `tlsCertFilePath`/`tlsKeyFilePath`.

> 📝 Set `databaseLifecycle.snapshotRetention` to keep only the most recent automatic snapshots. Set `databaseLifecycle.snapshotCloudDestination` to mirror each snapshot to S3 or GCS when Dingo runs with `dingo_extra_plugins`.

> 📝 Use `dingo database snapshot`, `dingo database restore <snapshot-dir>`, and `dingo database truncate --slot <slot>`, `--hash <hash>`, or `--block-number <n>` on an offline data directory. `restore` also accepts the same cloud URI that `snapshotCloudDestination` uses and downloads it to a temporary directory before restoration.

> 📝 When `barkPort` runs together with `databaseLifecycle.snapshotDir`, Bark also exposes live `Restore` and `Truncate` access.

```yaml
storageMode: "api"
plugins:
  api:
    blockfrost:
      provider: "builtin"
      config:
        port: 3000
    mesh:
      provider: "builtin"
      config:
        port: 8080
    utxorpc:
      provider: "builtin"
      config:
        port: 9090
midnight:
  authTokenPolicyId: ""
```

### Optional API token registry configuration

For API storage, add this top-level block to use local CIP-26 metadata in Blockfrost asset responses:

```yaml
tokenRegistry:
  enabled: false
```

Dingo sets `tokenRegistry.enabled` to `false` by default and uses the token registry only with `storageMode: "api"`. Apply database migration v3, `token-registry-metadata`, before setting it to `true`. The first mainnet sync downloads roughly 240 MB; later checks use conditional requests.

Configure the remaining `tokenRegistry` fields as follows:

- `sourceUrl`: An empty value selects the registry for the configured network. Set a URL to use a mirror.
- `interval`: The recheck interval. The default is `6h`, and values below `1m` use the `1m` minimum.
- `requestTimeout`: The whole download timeout. The default is `15m`.
- `userAgent`: The HTTP user agent. An empty value uses `dingo-token-registry/1`.
- `maxBytes`: The compressed download limit. The default is `768 MiB`.
- `maxEntryBytes`: The limit for one mapping entry. The default is `4 MiB`.
- `storeLogos`: Stores registry logos when `true`; the default is `false` because logos account for roughly 90% of registry bytes.
- `allowPrivateAddresses`: Allows registry requests to private, loopback, and link-local addresses when `true`; the default is `false` for SSRF protection. Enable it only when a private registry source is required.

The configuration also accepts these environment variables:

`DINGO_TOKEN_REGISTRY_ENABLED`, `DINGO_TOKEN_REGISTRY_SOURCE_URL`, `DINGO_TOKEN_REGISTRY_INTERVAL`, `DINGO_TOKEN_REGISTRY_REQUEST_TIMEOUT`, `DINGO_TOKEN_REGISTRY_USER_AGENT`, `DINGO_TOKEN_REGISTRY_MAX_BYTES`, `DINGO_TOKEN_REGISTRY_MAX_ENTRY_BYTES`, `DINGO_TOKEN_REGISTRY_STORE_LOGOS`, and `DINGO_TOKEN_REGISTRY_ALLOW_PRIVATE_ADDRESSES`.

The equivalent CLI flags are `--token-registry-enabled`, `--token-registry-source-url`, `--token-registry-interval`, `--token-registry-request-timeout`, `--token-registry-user-agent`, `--token-registry-max-bytes`, `--token-registry-max-entry-bytes`, `--token-registry-store-logos`, and `--token-registry-allow-private-addresses`.

> 📝 Dingo starts the Blockfrost, Mesh, and UTxO RPC listeners only in API storage mode. Set any listener port to `0` to disable that API.

For optional shared API TLS and token authentication, add the following to the configuration:

```yaml
api:
  tls:
    mode: server
    certFilePath: "/run/secrets/api.crt"
    keyFilePath: "/run/secrets/api.key"
  auth:
    mode: token
    tokenFilePath: "/run/secrets/api-token"
```

> 📝 `api.tls` accepts `disabled` or `server`; `server` requires both `certFilePath` and `keyFilePath`. `api.auth` accepts `disabled` or `token`; `token` requires exactly one of `token` or `tokenFilePath`, with `tokenFilePath` preferred for operators. Provider settings under `plugins.api.<name>.config.tls` and `plugins.api.<name>.config.auth` override shared fields independently. Set a provider's `mode: disabled` to turn off an inherited policy for that provider.

> 📝 Authenticated clients send `Authorization: Bearer <token>`. Blockfrost also accepts `project_id: <token>`. Dingo exempts CORS preflight `OPTIONS` requests from authentication; all other requests, including non-preflight `OPTIONS`, remain authenticated.

> 📝 Configure shared API security with `--api-tls-mode`, `--api-tls-cert-file-path`, `--api-tls-key-file-path`, `--api-auth-mode`, and `--api-auth-token-file-path`, or with `DINGO_API_TLS_MODE`, `DINGO_API_TLS_CERT_FILE_PATH`, `DINGO_API_TLS_KEY_FILE_PATH`, `DINGO_API_AUTH_MODE`, and `DINGO_API_AUTH_TOKEN_FILE_PATH`. The root `tlsCertFilePath` and `tlsKeyFilePath` fields remain UTxO RPC compatibility fields only; they do not provide shared defaults for Blockfrost or Mesh.

> 📝 `midnight.authTokenPolicyId` only applies in API storage mode with Midnight indexing. Leaving it empty keeps the broader default auth token matching behavior.

<br>

💡 Tip: The `network` setting supports the following values:

```yaml
# Musashi (Leios) testnet
network: musashi

# Preview testnet
network: preview

# Pre-production testnet
network: preprod

# Mainnet - NOT CURRENTLY RECOMMENDED
network: mainnet
```

***

You can view and verify our `dingo.yaml` file by running:

```
cd /etc/dingo/
sudo nano dingo.yaml
```

<br>

## Step 3 - Bootstrap from Mithril (First Run Only)

Before starting the service for the first time, bootstrap the database from a Mithril snapshot:

```
dingo mithril sync --config /etc/dingo/dingo.yaml
```

> 📝 `mithril.downloadMaxTransientRetries` controls retries for transient bootstrap download failures such as TLS timeouts, HTTP 429 responses, and HTTP 5xx responses. The example uses the default value of `10`.

This downloads and loads a snapshot, saving hours of sync time. See [Step 4 of the Quick Start guide](../002-quick-start-overview#step-4---bootstrap-from-mithril-snapshot) for details.

> 📝 You only need to do this once. After the initial bootstrap, the systemd service will keep the node synced.

***

<br>

## Step 4 - Create `dingo.service` Unit File

Create the systemd service file. Replace `YOUR_USER` with your username (`echo $USER`):

```
cat <<ENDFILE | sudo tee /etc/systemd/system/dingo.service > /dev/null
[Unit]
Description=Dingo Node
After=network-online.target

[Service]
Type=simple
Restart=on-failure
RestartSec=10
User=YOUR_USER
ExecStart=/usr/local/bin/dingo serve --config /etc/dingo/dingo.yaml
SyslogIdentifier=dingo
TimeoutStopSec=5

[Install]
WantedBy=multi-user.target
ENDFILE
```

***

We can view and verify our `dingo.service` file by running:

```
sudo nano /etc/systemd/system/dingo.service
```

<br>

## Step 5 - Enable and Start the Service

Enable the service to start on boot and start it now:

```bash
sudo systemctl daemon-reload
sudo systemctl enable dingo.service
sudo systemctl start dingo.service
```

***

<br>

## Step 6 - Check Status

Verify the service is running:

```
sudo systemctl status dingo.service
```

To follow the logs in real time:

```
sudo journalctl -u dingo -f
```

To see recent logs if there is an error:

```
sudo journalctl -u dingo -n 50 --no-pager
```

***

<br>

### Congratulations! You have successfully set up a `systemd` service for Dingo.


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
