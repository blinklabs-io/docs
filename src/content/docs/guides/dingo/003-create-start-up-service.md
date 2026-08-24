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

> 📝 `debugPort: 0` disables pprof. When pprof runs, it has no authentication or TLS. `debugBindAddr` defaults to `127.0.0.1` on its dedicated listener rather than inheriting `bindAddr` or `privateBindAddr`. External access requires an explicit `debugBindAddr`, `DINGO_DEBUG_BIND_ADDR`, or `--debug-bind-addr` override and firewall or equivalent network controls. This policy applies to the one-time `dingo mithril sync` and the long-running `dingo serve` systemd service.

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

> 📝 Dingo starts the Blockfrost, Mesh, and UTxO RPC listeners only in API storage mode. Set any listener port to `0` to disable that API.

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
