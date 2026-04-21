---
title: Quick Start Guide
description: Dingo Quick Start Overview.
---

# Dingo

A Cardano blockchain data node written in Go which actively participates in network communications on the Cardano blockchain using the Ouroboros Network Node-to-Node family of mini-protocols.

⚠️ This is a work in progress and is currently under heavy development

<br>

***

For this guide we will walk you through downloading the Dingo binary and all the steps necessary to get the Dingo node running on the Cardano Preview network. To get started follow the steps below.

<br>

✅ This guide assumes typical Linux setup. Please adjust commands and paths as needed.

***

<br>

## Step 1 - Download Dingo Binary
<br>

Download the latest release from the <a href="https://github.com/blinklabs-io/dingo/releases" target="_blank">Dingo releases</a> page.

⚠️ Adjust the version and architecture to match your system.

```
mkdir -p ~/dingo
cd ~/dingo
wget https://github.com/blinklabs-io/dingo/releases/download/v0.36.1/dingo-v0.36.1-linux-amd64.tar.gz -O - | tar -xz
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
# Database
database:
  blob:
    plugin: "badger"
    badger:
      block-cache-size: 0
      compression: false
      data-dir: "$HOME/dingo/.dingo/badger"
      gc: true
      index-cache-size: 0
  metadata:
    plugin: "sqlite"
    sqlite:
      data-dir: "$HOME/dingo/.dingo/metadata.db"
databasePath: "$HOME/dingo/.dingo"

# Mempool
mempoolCapacity: 1048576

# Mithril
mithril:
  aggregatorUrl: ""
  cleanupAfterLoad: true
  enabled: true
  verifyCertificates: true

# Network
bindAddr: "0.0.0.0"
metricsPort: 12798
network: "preview"
privateBindAddr: "127.0.0.1"
privatePort: 3002
relayPort: 3001
socketPath: "$HOME/dingo/dingo.socket"

# Storage
blockfrostPort: 0
meshPort: 0
storageMode: "core"
utxorpcPort: 0
EOF
```

> 💡 Setting `block-cache-size` and `index-cache-size` to 0 with `compression: false` uses OS page cache (mmap) instead of BadgerDB's internal caches. This dramatically reduces memory usage.

***

<br>

## Step 3 - Open Ports

We will cover how to add UFW firewall rules for the ports Dingo needs.

> 💡 Tip: UFW stands for Uncomplicated Firewall and is used for managing iptables (netfilter) firewall rules.

To see which ports are currently open:

```
sudo ufw status numbered
```

#### Add Port 3001 for Ouroboros Node to Node (NtN) Communication

```
sudo ufw allow 3001/tcp
```

***

<br>

## Step 4 - Bootstrap from Mithril Snapshot

Dingo has a built-in Mithril client that downloads and loads a snapshot automatically. This saves hours of sync time compared to replaying the chain from genesis.

Run the following command from your dingo directory:

```
cd ~/dingo
./dingo mithril sync --config ~/dingo/dingo.yaml
```

Dingo will:
1. Download the latest Mithril snapshot for your configured network
2. Verify the certificate chain
3. Load the snapshot into the database

This takes approximately 10-15 minutes depending on your system and network speed.

> 📝 If you skip this step, Dingo will sync from genesis when started, which takes significantly longer.

***

<br>

## Step 5 - Start Dingo

Once the Mithril snapshot has loaded, start the node:

```
cd ~/dingo
./dingo serve --config ~/dingo/dingo.yaml
```

If the node is still catching up after loading a Mithril snapshot, `v0.36.1` increases chainsync stall detection thresholds by `5x`. Expect longer delays before Dingo treats a peer as stalled and recycles the connection during catch up. This behavior is intentional and helps the node finish catch up more reliably by avoiding unnecessary pipeline resets and excess `TIME_WAIT` socket churn while the node remains behind tip. Once the node reaches tip, normal faster stall recovery returns.

Watch for these signs of healthy catch up in the logs:

- Confirm that log output shows peer connections.
- Confirm that log output continues to show sync progress as Dingo works through the remaining blocks toward tip.
- Treat slower peer recycling during catch up in `v0.36.1` as expected behavior, not as a failure signal by itself.

If rollback transaction undo decoding fails during sync, Dingo now emits a `LedgerErrorEvent` with the `rollback_tx_undo_decode` operation and logs structured ledger error details that include the rollback point. This makes rollback related inconsistencies easier to diagnose instead of leaving the problem mostly silent. A separate internal ledger fix also improves shutdown and result delivery in the database worker pool, which supports more reliable ledger processing during startup and recovery.

**日本語**

Mithril スナップショットの読み込み後もノードが追いつき中の場合、`v0.36.1` は chainsync の stall 検知しきい値を `5x` に引き上げます。そのため、Dingo がピアを stalled と判断して接続を再作成するまでの待ち時間は、追いつき中は長くなります。これは意図した動作であり、ノードが tip に遅れている間の不要なパイプラインのリセットや過剰な `TIME_WAIT` ソケット増加を避け、より安定して追いつきを完了しやすくします。ノードが tip に到達すると、通常のより速い stall 回復に戻ります。

ログでは次の点を確認してください。

- ピア接続を示すログ出力が続いていることを確認します。
- Dingo が tip に向けて残りブロックを同期し続けていることを示すログ出力を確認します。
- `v0.36.1` で追いつき中のピア再作成が遅くなることだけを、障害の兆候と判断しないでください。

同期中に rollback transaction undo のデコードに失敗した場合、Dingo は `rollback_tx_undo_decode` を操作名として持つ `LedgerErrorEvent` を発行し、rollback point を含む構造化された ledger エラー詳細をログに出力します。これにより、これまで見えにくかった rollback 関連の不整合を診断しやすくなります。加えて、database worker pool の shutdown と結果配信に関する内部修正により、起動時と回復時の ledger 処理の安定性も向上します。

**Español**

Si el nodo todavía se está poniendo al día después de cargar una instantánea de Mithril, `v0.36.1` aumenta los umbrales de detección de bloqueo de chainsync en `5x`. Por eso, Dingo tarda más en considerar que un par quedó bloqueado y en reciclar la conexión durante la puesta al día. Este comportamiento es intencional y ayuda a que el nodo complete la puesta al día con más fiabilidad al evitar reinicios innecesarios de la canalización y un exceso de sockets en estado `TIME_WAIT` mientras el nodo sigue detrás del tip. Cuando el nodo alcanza el tip, vuelve el comportamiento normal de recuperación más rápida ante bloqueos.

En los registros, conviene observar estas señales de una puesta al día sana:

- Confirmar que la salida de los registros muestra conexiones con pares.
- Confirmar que la salida de los registros sigue mostrando progreso de sincronización mientras Dingo avanza por los bloques restantes hacia el tip.
- Considerar que un reciclado más lento de pares durante la puesta al día en `v0.36.1` es un comportamiento esperado y no una señal de fallo por sí sola.

Si falla la decodificación de rollback transaction undo durante la sincronización, Dingo ahora emite un `LedgerErrorEvent` con la operación `rollback_tx_undo_decode` y registra detalles estructurados del error del ledger que incluyen el punto de rollback. Esto ayuda a diagnosticar inconsistencias relacionadas con rollback en lugar de dejar el problema casi en silencio. Además, una corrección interna en el database worker pool mejora el apagado y la entrega de resultados, lo que respalda un procesamiento del ledger más fiable durante el arranque y la recuperación.

***

<br>

#### Interested in using a systemd service to run a Dingo Node to maximize the uptime by automatically restarting the Dingo node when the computer reboots?
[See our guide on how to create a startup service for Dingo](../004-create-start-up-service).

***

<br>

### Congratulations you are ready to start using the Dingo node!

[Learn how to interact with Dingo using the Cardano CLI](../003-using-dingo-with-cardano-cli).
