---
title: Quick Start Guide
description: Dingo Quick Start Overview.
---

# Dingo

A Cardano blockchain node written in Go which actively participates in network communications on the Cardano blockchain using the Ouroboros Network Node-to-Node family of mini-protocols.

⚠️ Dingo is a work in progress and is currently under heavy development

<br>

***

In this guide, we will walk you through downloading the Dingo binary and all the steps necessary to get the Dingo node running on the Cardano Preview network. To get started follow the steps below.

<br>

✅ This guide assumes a typical Linux setup. Please adjust commands and paths as needed.

***

<br>

## Step 1 - Download Dingo Binary
<br>

Download the latest release from the <a href="https://github.com/blinklabs-io/dingo/releases" target="_blank">Dingo releases</a> page.

⚠️ This example uses v0.70.0. Adjust the version and architecture to match your system.

```
mkdir -p ~/dingo
cd ~/dingo
wget https://github.com/blinklabs-io/dingo/releases/download/v0.70.0/dingo-v0.70.0-linux-amd64.tar.gz -O - | tar -xz
```

You can verify the binary works by running:

```
./dingo version
```

***

<br>

## Step 2 - Create dingo.yaml Configuration File

Dingo ships with embedded Cardano network configurations (genesis files, config.json) for preview, preprod, and mainnet. You do not need to download them separately.

Create a `dingo.yaml` file in your dingo directory. The `$HOME` variable will automatically expand to your home directory path:

```
cat <<EOF > ~/dingo/dingo.yaml
# Shared database path for the local blob and metadata stores.
databasePath: "$HOME/dingo/.dingo"

# Storage
plugins:
  storage:
    blob:
      provider: "badger"
      config:
        # Optional Badger data directory. When unset, `databasePath` applies.
        # dataDir: "$HOME/dingo/.dingo/badger"
    metadata:
      provider: "sqlite"
      config:
        # Optional SQLite data directory. When unset, `databasePath` applies.
        # dataDir: "$HOME/dingo/.dingo/metadata.db"

  api:
    blockfrost:
      provider: "builtin"
      config:
        port: 0
    mesh:
      provider: "builtin"
      config:
        port: 0
    utxorpc:
      provider: "builtin"
      config:
        port: 0

# Mempool
# `plugins.mempool.config.capacity` is an optional override.
# Default: 1 MiB for Praos mode and normal serve mode, and 25 MiB for Musashi mode.
# Leave the key commented or omit it to use the mode default.
# plugins:
#   mempool:
#     config:
#       capacity: 1048576

# Mithril
mithril:
  aggregatorUrl: ""
  cleanupAfterLoad: true
  enabled: true
  verifyCertificates: true

# Network
bindAddr: "0.0.0.0"
metricsPort: 12798
debugPort: 0
debugBindAddr: "127.0.0.1"
network: "preview"
privateBindAddr: "127.0.0.1"
privatePort: 3002
relayPort: 3001
targetNumberOfRootPeers: 0
socketPath: "$HOME/dingo/dingo.socket"

# Storage
barkBaseUrl: ""
barkPort: 0
storageMode: "core"
EOF
```

> 📝 Leave `debugPort` set to `0` unless profiling is required. A port value of `0` disables pprof. When enabled, pprof has no authentication or TLS and listens on the dedicated `debugBindAddr`, which defaults to `127.0.0.1` even when `bindAddr` or `privateBindAddr` uses a wildcard or another address. External exposure requires an explicit `debugBindAddr`, `DINGO_DEBUG_BIND_ADDR`, or `--debug-bind-addr` override and firewall or equivalent network controls. The same setting governs pprof during `mithril sync`.

> 📝 Bark now derives its near tip safety window from the current ledger state. Do not look for or set a manual `barkSecurityWindow` value in this configuration.

> 💡 API servers stay inactive outside `storageMode: "api"`, and a port value of `0` disables that API.

> 📝 Optional API security: keep `storageMode: "api"` enabled when running the built-in APIs, then configure the shared policy as follows:

```yaml
storageMode: "api"
api:
  tls:
    mode: server
    certFilePath: "/run/secrets/api.crt"
    keyFilePath: "/run/secrets/api.key"
  auth:
    mode: token
    tokenFilePath: "/run/secrets/api-token"
```

The shared policy applies to selected built-in Blockfrost, Mesh, and UTxO RPC APIs. TLS accepts `disabled` or `server`, and authentication accepts `disabled` or `token`. Provider-level `plugins.api.<name>.config.tls` and `plugins.api.<name>.config.auth` fields override the corresponding shared fields independently; a provider-level `mode: disabled` explicitly opts that provider out of the inherited policy.

With token authentication, ordinary API requests require `Authorization: Bearer <token>`. Blockfrost also accepts the same token in its `project_id` header. Browser CORS preflight `OPTIONS` requests do not require a credential, but other requests still authenticate. Dingo reports invalid modes, incomplete certificate and key pairs, and token authentication without a `token` or `tokenFilePath` as startup configuration errors. The token file is the preferred credential source.

Top-level shared policy bindings are `--api-tls-mode` / `DINGO_API_TLS_MODE`, `--api-tls-cert-file-path` / `DINGO_API_TLS_CERT_FILE_PATH`, `--api-tls-key-file-path` / `DINGO_API_TLS_KEY_FILE_PATH`, `--api-auth-mode` / `DINGO_API_AUTH_MODE`, and `--api-auth-token-file-path` / `DINGO_API_AUTH_TOKEN_FILE_PATH`. The legacy root `tlsCertFilePath` and `tlsKeyFilePath` fields remain UTxO RPC compatibility settings only; they do not provide shared Blockfrost or Mesh TLS defaults.

```yaml
midnight:
  authTokenPolicyId: ""
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
```

> 📝 `midnight.authTokenPolicyId` only applies in API storage mode with Midnight indexing. Leaving it empty keeps the broader default auth token matching behavior.

> 💡 Setting `block-cache-size` and `index-cache-size` to 0 with `compression: false` uses OS page cache (mmap) instead of BadgerDB's internal caches. This dramatically reduces memory usage.

***

<br>

## Step 3 - Open Network Ports

Configure UFW firewall rules to allow the ports required by Dingo.

> 💡 Tip: UFW stands for Uncomplicated Firewall and is used for managing iptables (netfilter) firewall rules.

To see which ports are currently open:

```
sudo ufw status numbered
```

#### Add Port 3001 for Ouroboros Node-to-Node (NtN) Communication

```
sudo ufw allow 3001/tcp
```

***

<br>

## Step 4 - Bootstrap from Mithril Snapshot

Dingo has a built-in Mithril client that downloads and loads a snapshot automatically. This saves hours of sync time compared to replaying the chain from genesis.

Run the following command from your `~/dingo` directory:

```
cd ~/dingo
./dingo mithril sync --config ~/dingo/dingo.yaml
```

> 📝 `mithril.downloadMaxTransientRetries` controls retries for transient bootstrap download failures such as TLS timeouts, HTTP 429 responses, and HTTP 5xx responses. The example uses the default value of `10`.

Dingo will:
1. Download the latest Mithril snapshot for your configured network
2. Verify the certificate chain
3. Load the snapshot into the database

This takes approximately 20-30 minutes depending on your system and network speed.

> 📝 If you skip this step, Dingo will sync from genesis when started, which takes significantly longer.

***

<br>

## Step 5 - Start Dingo

Once the Mithril snapshot has loaded, start the node:

```
cd ~/dingo
./dingo serve --config ~/dingo/dingo.yaml
```

You should see log output showing the node connecting to peers and syncing the remaining blocks to reach the chain tip.

***

<br>

#### Interested in running Dingo as a systemd service?

Using a systemd service automatically starts Dingo when your system boots and restarts it if it exits unexpectedly.
[See our guide on how to create a startup service for Dingo](../003-create-start-up-service).

***

<br>

### Congratulations! Your Dingo node is now running.

[Learn how to interact with Dingo using the Cardano CLI](../004-using-dingo-with-cardano-cli).
