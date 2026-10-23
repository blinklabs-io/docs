---
title: Create Startup Service
description: Create Startup Service for Dingo.
---

# Dingo

A Cardano blockchain node written in Go which actively participates in network communications on the Cardano blockchain using the Ouroboros Network Node-to-Node family of mini-protocols.

⚠️ Dingo is a work in progress and is currently under heavy development

<br>

***

This guide sets up a `systemd` service. Using a `systemd` service to run a Dingo Node maximizes the uptime by automatically restarting the Dingo node when the computer reboots. To get started follow the steps below.

<br>

✅ This guide assumes a typical Linux setup. Please adjust commands and paths as needed.

> ⚠️ This guide assumes you have already completed the [Quick Start](../002-quick-start-overview) guide.

***

<br>

## Step 1 - Move the Dingo Binary and Configuration

Move the Dingo binary to `/usr/local/bin/` and the configuration to `/etc/dingo/` so they are accessible system-wide.

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

Since the service will run as your user but the config is now in `/etc/dingo/`, the database and socket paths must be absolute. Run the following to regenerate the config with your `$HOME` expanded:

```
sudo tee /etc/dingo/dingo.yaml > /dev/null <<EOF
# Global data directory for both blob and metadata storage plugins.
# Can be overridden with CARDANO_DATABASE_PATH or --data-dir.
databasePath: "$HOME/dingo/.dingo"

# Plugins
plugins:
  storage:
    blob:
      provider: "badger"
      config:
        # Optional Badger data directory. When unset, databasePath applies.
        dataDir: "$HOME/dingo/.dingo/badger"
        blockCacheSize: 0
        compression: false
        gc: true
        indexCacheSize: 0
    metadata:
      provider: "sqlite"
      config:
        # Optional SQLite data directory. When unset, databasePath applies.
        dataDir: "$HOME/dingo/.dingo/metadata.db"
  mempool:
    provider: "default"
    config:
      # capacity is an optional override, not a required setting.
      # Default: 1 MiB for Praos mode and normal serve mode, and 25 MiB for Musashi mode.
      # Leave the key commented or omit it to use the mode default.
      # capacity: 1048576
      # revalidationDeltaCap is optional. Default: 64. The value must be positive.
      # revalidationDeltaCap: 64
  api:
    blockfrost:
      provider: "builtin"
      config:
        port: 3000
        # Blockfrost uses this provider-specific host independently of bindAddr.
        # Default: 127.0.0.1. Set host for access from a service network or a remote host.
        host: "127.0.0.1"
        # Set authToken to protect transaction submission and evaluation mutations.
        # authToken: ""
        # Authenticated mutation access on a non-loopback host requires server TLS.
        # Global concurrent mutation limit. Default: 4.
        maxConcurrentMutations: 4
        # Per-client concurrent mutation limit. Default: 1.
        maxConcurrentMutationsPerClient: 1
    mesh:
      provider: "builtin"
      config:
        port: 8080
    utxorpc:
      provider: "builtin"
      config:
        port: 9090

# Mithril
mithril:
  aggregatorUrl: ""
  cleanupAfterLoad: true
  enabled: true
  verifyCertificates: true
  # CLI: --mithril-allow-insecure-http; environment: DINGO_MITHRIL_ALLOW_INSECURE_HTTP.
  # When true, Dingo permits HTTP and local or private destinations for local development or testing only.
  allowInsecureHttp: false
  # Optional exact artifact identity for a fresh bootstrap:
  # v1 snapshot digest or v2 Cardano database artifact hash.
  # pinnedDigest: "<digest>"

# Network
# Health probes. CLI: --health-port; environment: DINGO_HEALTH_PORT.
# Set healthPort to 0 to disable the health listener.
healthPort: 12799
# CLI: --health-ready-gap-slots; environment: DINGO_HEALTH_READY_GAP_SLOTS.
healthReadyGapSlots: 1000
bindAddr: "0.0.0.0"
metricsPort: 12798
debugPort: 0
network: "preview"
# Total NtC admission limit. Default: 100. Non-positive values are ignored.
# CLI: --max-ntc-conns; environment: DINGO_MAX_NTC_CONNS.
maxNtCConns: 100
# Per-IP NtC admission limit. Default: 5. Non-positive values are ignored.
# CLI: --max-ntc-connections-per-ip; environment: DINGO_MAX_NTC_CONNECTIONS_PER_IP.
maxNtCConnectionsPerIP: 5
privateBindAddr: "127.0.0.1"
privatePort: 3002
relayPort: 3001
socketPath: "$HOME/dingo/dingo.socket"

# Storage
barkBaseUrl: ""
barkPort: 0
storageMode: "core"
# Database lifecycle
databaseLifecycle:
  # Automatic database snapshots run at epoch boundaries.
  # Do not enable automatic snapshots when the primary blob provider is "badger", "s3", or "gcs".
  # Select a local primary blob provider instead.
  # Default: false.
  snapshotEnabled: false
  # Dingo writes automatic snapshots to this local filesystem directory.
  # Set this when snapshotEnabled is true and when Bark mounts the live service.
  snapshotDir: "$HOME/dingo/snapshots"
  # Optional snapshot trust key used by snapshot authentication operations.
  # When set, this must be a regular, non-symlink file no larger than 1 KiB.
  # Unix: the node user must own it, with no group or other permissions.
  # Windows: the current user or BUILTIN\\Administrators must own it; the process
  # must belong to Administrators when applicable, and the DACL must restrict access.
  # snapshotTrustKeyFile: "$HOME/dingo/snapshot-trust-key"
  # Keep only the most recent automatic snapshots.
  # Default: 0.
  snapshotRetention: 0
  # Optional cloud mirror for snapshots.
  # snapshotCloudDestination: ""
  # snapshotCloudDestinationPrefix: ""
  # Capture an automatic snapshot every N epoch closes.
  # CLI: --db-snapshot-every-n-epochs
  snapshotEveryNEpochs: 1
EOF
```

> 📝 By default, Mithril requires `HTTPS` and rejects local, private, or otherwise non-public destinations. Mithril v2 bootstrap accepts artifact origins and redirects only from the configured aggregator or the official Mithril GCS origin (`storage.googleapis.com`), enforces aggregate download and extraction safety checks, performs signed ancillary preflight before extraction, and uses only authenticated ledger content. Set `mithril.allowInsecureHttp: true` only for local development or testing. Do not enable it in production.

> 📝 Leave `debugPort` set to `0` unless profiling is required. `debugPort` controls a separate optional pprof listener and should stay disabled unless profiling is needed.

> 📝 The `databaseLifecycle.snapshotEnabled` setting controls automatic epoch boundary snapshots. Manual `dingo database snapshot` and Bark `CreateSnapshot` remain available with `badger`, `s3`, or `gcs` as the primary blob provider. When Bark also serves live restore or truncate operations, set `barkPort`, `databaseLifecycle.snapshotDir`, `barkClientCaFilePath`, and `tlsCertFilePath`/`tlsKeyFilePath`.

> 📝 Set `databaseLifecycle.snapshotRetention` to keep only the most recent automatic snapshots. Set `databaseLifecycle.snapshotCloudDestination` to mirror each snapshot to S3 or GCS when Dingo runs with `dingo_extra_plugins`. This mirror destination is separate from the primary blob provider.

> 📝 Use `dingo database snapshot`, `dingo database restore <snapshot-dir>`, and `dingo database truncate --slot <slot>`, `--hash <hash>`, or `--block-number <n>` on an offline data directory. `restore` also accepts the same cloud URI that `snapshotCloudDestination` uses and downloads it to a temporary directory before restoration.

> 📝 When `barkPort` runs together with `databaseLifecycle.snapshotDir`, Bark also exposes live `Restore` and `Truncate` access.

> 📝 In core storage mode, Dingo rejects an offline `dingo database truncate` target or a live Bark `Truncate` target older than `consumed_utxo_prune_floor` before any mutation because Dingo already pruned consumed UTxO history below that floor. Dingo allows a target exactly at the floor, and API storage mode remains unchanged. Choose a shallower target or recover from a fully synced peer snapshot when the requested rewind is older than the floor.

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
  # Enable the Midnight gRPC server. Default: false.
  serverEnabled: false
  # Expose gRPC reflection. Requires serverEnabled. Default: false.
  reflectionEnabled: false
  # Allow plaintext on a wildcard, hostname, or non-loopback listener. Default: false.
  allowInsecureRemote: false
  # gRPC listen port. Required and nonzero when serverEnabled is true.
  port: 50051
  # gRPC listen host. An empty host defaults to 127.0.0.1.
  host: "127.0.0.1"
  authTokenPolicyId: ""
  authTokenAssetName: ""
```

> 📝 Dingo starts the Blockfrost, Mesh, and UTxO RPC listeners only in API storage mode. Midnight `gRPC` serving also requires `API` storage mode, `midnight.serverEnabled: true`, and a nonzero `midnight.port`. Set any listener port to `0` to disable that API.

> 📝 `midnight.serverEnabled` explicitly controls the Midnight `gRPC` server and keeps it off when false. `midnight.enabled` controls indexing separately; the server can serve persisted Midnight rows without running the indexer. `midnight.reflectionEnabled` requires `midnight.serverEnabled`.

> 📝 The Midnight listener defaults to `127.0.0.1` when `midnight.host` is empty. For non-loopback plaintext, set `midnight.allowInsecureRemote: true`; for remote `TLS` exposure, configure `tlsCertFilePath` and `tlsKeyFilePath` instead.

> 📝 Set `midnight.authTokenPolicyId` and `midnight.authTokenAssetName` together, or leave both unset. A partial pair causes configuration and startup validation to reject the settings. A configured policy ID must contain exactly 56 hexadecimal characters (28 decoded bytes). Matching uses the exact policy ID and asset name.

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

You can view and verify your `dingo.yaml` file by running:

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

You can view and verify your `dingo.service` file by running:

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

Check `/health` or `/healthz` for liveness and `/readyz` for readiness on port `12799`:

```
curl http://127.0.0.1:12799/health
curl http://127.0.0.1:12799/healthz
curl http://127.0.0.1:12799/readyz
```

`/health` and `/healthz` use liveness checks, including event-loop responsiveness. `/readyz` reports readiness only when the configured tip-gap condition and database readiness are satisfied. For block producers, `/readyz` also requires a running forger and usable forging credentials, including remote KES readiness where applicable.

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
