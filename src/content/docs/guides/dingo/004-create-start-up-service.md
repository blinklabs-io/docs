---
title: Create Startup Service
description: Create Startup Service for Dingo.
---

# Dingo

A Cardano blockchain data node written in Go which actively participates in network communications on the Cardano blockchain using the Ouroboros Network Node-to-Node family of mini-protocols.

⚠️ This is a work in progress and is currently under heavy development

<br>

***

For this guide we will walk you through setting up a `systemd` service. Using a `systemd` service to run a Dingo Node maximizes the uptime by automatically restarting the Dingo node when the computer reboots. To get started follow the steps below.

<br>

✅ This guide assumes typical Linux setup. Please adjust commands and paths as needed.

> ✅ For this guide we assume you have already completed the [Quick Start](../002-quick-start-overview) guide.

***

<br>

## Step 1 - Move Dingo Binary and Configuration

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

## Step 2 - Update Paths in dingo.yaml

Since the service will run as your user but the config is now in `/etc/dingo/`, we need to make sure the database and socket paths use absolute paths. Run the following to regenerate the config with your `$HOME` expanded:

```
sudo bash -c "cat <<EOF > /etc/dingo/dingo.yaml
# Database
database:
  blob:
    plugin: \"badger\"
    badger:
      block-cache-size: 0
      compression: false
      data-dir: \"$HOME/dingo/.dingo/badger\"
      gc: true
      index-cache-size: 0
  metadata:
    plugin: \"sqlite\"
    sqlite:
      data-dir: \"$HOME/dingo/.dingo/metadata.db\"
databasePath: \"$HOME/dingo/.dingo\"

# Mempool
mempoolCapacity: 1048576

# Mithril
mithril:
  aggregatorUrl: \"\"
  cleanupAfterLoad: true
  enabled: true
  verifyCertificates: true

# Network
bindAddr: \"0.0.0.0\"
metricsPort: 12798
network: \"preview\"
privateBindAddr: \"127.0.0.1\"
privatePort: 3002
relayPort: 3001
socketPath: \"$HOME/dingo/dingo.socket\"

# Storage
blockfrostPort: 0
meshPort: 0
storageMode: \"core\"
utxorpcPort: 0
EOF"
```

This example keeps the service host in consensus only mode. `storageMode: "core"` fits relay and block producer deployments that do not expose client APIs.

If the same service host must expose APIs, use `storageMode: "api"` and enable the required ports:

```yaml
storageMode: "api"
blockfrostPort: 3000
utxorpcPort: 9090
```

API facing services require `api` storage mode. The Blockfrost compatible service also supports native asset lookups at `GET /api/v0/assets/{asset}`, where `{asset}` is the concatenated hex policy ID and asset name.

日本語: この例は合意専用のサービスホスト向けです。`storageMode: "core"` は、クライアント API を公開しないリレーやブロックプロデューサーに適しています。API を公開する場合は `storageMode: "api"` を設定し、必要なポートを有効にします。API を提供するサービスでは `api` ストレージモードが必要です。Blockfrost 互換サービスは `GET /api/v0/assets/{asset}` でネイティブ資産の検索も提供します。`{asset}` には、16 進数のポリシー ID と資産名を連結した識別子を指定します。

Español: Este ejemplo mantiene el host del servicio en modo solo consenso. `storageMode: "core"` encaja en relés y productores de bloques que no exponen API para clientes. Si el mismo host debe exponer API, configure `storageMode: "api"` y habilite los puertos necesarios. Los servicios con API requieren el modo de almacenamiento `api`. El servicio compatible con Blockfrost también admite búsquedas de activos nativos en `GET /api/v0/assets/{asset}`, donde `{asset}` es el identificador formado por la concatenación en hexadecimal del ID de política y el nombre del activo.

***

<br>

## Step 3 - Bootstrap from Mithril (First Run Only)

Before starting the service for the first time, bootstrap the database from a Mithril snapshot:

```
dingo mithril sync --config /etc/dingo/dingo.yaml
```

This downloads and loads a snapshot, saving hours of sync time. See [Step 4 of the Quick Start guide](../002-quick-start-overview#step-4---bootstrap-from-mithril-snapshot) for details.

> 📝 You only need to do this once. After the initial bootstrap, the systemd service will keep the node synced.

***

<br>

## Step 4 - Create dingo.service Unit File

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

<br>

## Step 5 - Enable and Start the Service

Enable the service to start on boot and start it now:

```
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

### Operational notes for v0.36.0

- Correct any missing or zero Ouroboros security parameter `K` values in the active protocol state or network configuration. Dingo now rejects those values, so startup failures or rollback problems point to configuration or protocol state that needs correction.
- Investigate fork resolution database lookup failures directly from the logs. Dingo now reports those failures as real errors instead of treating them like an ordinary missing ancestor during chain recovery.
- Review era transition logs closely during upgrades and boundary events. Dingo now reports pending transitions, impossible transitions, and exact known era boundaries more explicitly.
- Expect more reliable recovery with a single upstream relay. Dingo now handles block producer connectivity correctly in minimal relay topologies where one relay provides the upstream path.

日本語:

- アクティブなプロトコル状態またはネットワーク設定で、Ouroboros のセキュリティパラメーター `K` が未設定または `0` になっていないか修正します。Dingo は現在これらの値を拒否するため、起動失敗やロールバックの問題は設定またはプロトコル状態の修正が必要であることを示します。
- フォーク解決時のデータベース参照失敗は、ログで直接調査します。Dingo は現在、これらの失敗を通常の祖先不足として扱わず、実際のエラーとして記録します。
- アップグレード時や境界イベント時には、時代遷移のログを注意して確認します。Dingo は現在、保留中の遷移、不可能な遷移、既知の正確な時代境界をより明確に報告します。
- 単一の上流リレー構成では、より安定した復旧が期待できます。Dingo は現在、1 台のリレーだけが上流経路を提供する最小構成でも、ブロックプロデューサー接続を正しく処理します。

Español:

- Corrija cualquier valor ausente o igual a cero del parámetro de seguridad Ouroboros `K` en el estado activo del protocolo o en la configuración de red. Dingo ahora rechaza esos valores, por lo que los fallos de inicio o los problemas de reversión apuntan a una configuración o a un estado del protocolo que requiere corrección.
- Investigue directamente en los registros los fallos de consulta de base de datos durante la resolución de bifurcaciones. Dingo ahora muestra esos fallos como errores reales en lugar de tratarlos como un ancestro ausente normal durante la recuperación de cadena.
- Revise con atención los registros de transición de era durante actualizaciones y eventos de límite. Dingo ahora informa con más claridad las transiciones pendientes, las transiciones imposibles y los límites exactos de era conocidos.
- Espere una recuperación más confiable con un solo relé ascendente. Dingo ahora maneja correctamente la conectividad del productor de bloques en topologías mínimas donde un solo relé proporciona la ruta ascendente.

***

<br>

### Congratulations you have setup a startup service for Dingo!
