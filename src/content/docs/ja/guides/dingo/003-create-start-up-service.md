---
title: "スタートアップサービスを作成する"
description: "Dingoのスタートアップサービスを作成します。"
---

<a id="dingo"></a>

# Dingo

Go に書かれている Cardano ブロックチェーンノードは、ミニプロトコルの Ouroboros Network Node-to-Node-Node 家族を使用して、Cardano ブロックチェーン上のネットワーク通信に積極的に参加しています。

⚠ Dingoは進行中の作業であり、現在重大開発中です。

<br>

***

このガイドでは、`systemd`サービスを設定します。`systemd`サービスを使用して、Dingo Nodeを実行すると、コンピュータの再起動時に Dingo ノードを自動的に再起動することにより、稼働時間を最大にします。 開始するには、以下の手順を実行します。

<br>

✅ このガイドは、典型的なLinuxのセットアップを想定しています。必要に応じて、コマンドとパスを調整してください。

> このガイドでは、既に[クイックスタート](../002-quick-start-overview)ガイドを完了していると仮定しています。

***

<br>

<a id="step-1---move-the-dingo-binary-and-configuration"></a>

## ステップ1 - Dingoバイナリと構成を移動する

Dingo バイナリを `/usr/local/bin/` に移動し、`/etc/dingo/` に設定すると、システム全体でアクセス可能です。

<br>

バイナリをコピーする:

```
sudo cp ~/dingo/dingo /usr/local/bin/
```

> ✅ `which dingo`を実行してバイナリがコピーされたことを確認することができます

<br>

config ディレクトリを作成し、設定をコピーします。

```
sudo mkdir -p /etc/dingo
sudo cp ~/dingo/dingo.yaml /etc/dingo/
```

***

<br>

<a id="step-2---update-paths-in-dingoyaml"></a>

## ステップ2 - `dingo.yaml`でパスを更新する

サービスはユーザーとして実行されますが、 config は `/etc/dingo/` で実行されるので、データベースとソケットパスは絶対必要です。以下のコマンドを実行して、`$HOME` でコンフィグを再生成します。

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
  # Cloud mirroring requires an acceptable trust key and an already authenticated manifest.
  # Unsigned legacy snapshots are rejected and are not automatically signed or mirrored.
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

> 📝 既定で Mithril は `HTTPS` を必須とし、ローカル、プライベート、その他の非公開の接続先を拒否します。Mithril v2 ブートストラップは、設定したアグリゲーターまたは公式 Mithril GCS オリジン（`storage.googleapis.com`）からのアーティファクトとリダイレクトのみを受け入れます。ダウンロード全体と展開の安全性を検査し、展開前に署名付き付属データの事前検証を行い、認証済みの台帳内容のみを使用します。`mithril.allowInsecureHttp: true` はローカル開発やテストに限って設定し、本番環境では有効にしないでください。

> `debugPort`を`0`に置きます プロファイリングが要求されなければ。 `debugPort`は別の任意pprofのリスナーを制御し、プロファイリングが要求されなければ無効にとどまるべきです。

> 📝 `databaseLifecycle.snapshotEnabled` はエポック境界の自動スナップショットを制御します。主 blob プロバイダーが `badger`、`s3`、`gcs` の場合も、手動の `dingo database snapshot` と Bark の `CreateSnapshot` は利用できます。Bark でライブの復元または切り詰めも提供する場合は、`barkPort`、`databaseLifecycle.snapshotDir`、`barkClientCaFilePath`、`tlsCertFilePath`/`tlsKeyFilePath` を設定します。

> `databaseLifecycle.snapshotRetention` は、最新の自動スナップショットだけを維持するために設定します。 `databaseLifecycle.snapshotCloudDestination` は、Dingo が `dingo_extra_plugins` で実行したときに、各スナップショットを S3 または GCS にミラーリングします。 このミラーの宛先は、プライマリブロブプロバイダとは別です。

> `databaseLifecycle.snapshotCloudDestination` を設定する場合は、受け入れ可能な `snapshotTrustKeyFile` を設定し、マニフェストをあらかじめ認証しておく必要があります。未署名の従来のスナップショットは拒否され、自動的に署名またはミラーリングされません。

> `dingo database snapshot`、`dingo database restore <snapshot-dir>`、`dingo database truncate --slot <slot>`、`--hash <hash>`、または`--block-number <n>`をオフラインデータディレクトリに使用。 `restore`は、`snapshotCloudDestination`が使用し、修復前に一時ディレクトリにダウンロードする同じクラウドURIも受け入れます。

> `barkPort` が `databaseLifecycle.snapshotDir` と共に動くとき、Bark はまた生きている `Restore` および `Truncate` アクセスをexposes します。

> Dingoは、コアストレージモードでは、オフラインの`dingo database truncate`ターゲットまたはライブBark`Truncate`ターゲットを`consumed_utxo_prune_floor`よりも古いため、Dingoは既にその床下で消費されたUTxO履歴を消費しました。 Dingoは、ターゲットを正確にフロアで許可し、APIストレージモードは変更されません。リクエストされた巻き戻しが床よりも古い場合、完全に同期されたピアスナップショットから、浅いターゲットを選択するか、または回復します。

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

> Dingoは、APIストレージモードでのみ、Blockfrost、Mesh、およびUTxO RPCリスナーを開始します。 Midnight `gRPC`サービングには、`API`ストレージモード、`midnight.serverEnabled: true`、およびnonzero `midnight.port`が必要です。 そのAPIを無効にするには、`0`にリスナーポートを設定してください。

> リリース `midnight.serverEnabled` は、Midnight `gRPC`サーバーを明示的に制御し、偽りのときにオフに保ちます。 `midnight.enabled` は、別々にインデックスを管理します。サーバーは、インデックスを実行せずに一晩中行を持続させることができます。 `midnight.reflectionEnabled` は `midnight.serverEnabled` が必要です。

> `midnight.host`が空いているとき、ミッドナイトのリスナーのデフォルトは`127.0.0.1`です。非ループバックのプレーンテキストのために、`midnight.allowInsecureRemote: true`を置いて下さい;リモート`TLS`の露出のために、代わりに`tlsCertFilePath`および`tlsKeyFilePath`を構成して下さい。

> `midnight.authTokenPolicyId` と `midnight.authTokenAssetName` を一緒に設定するか、または、両方の unset を残します。 部分的なペアは、設定と起動の検証を引き起こし、設定を拒否します。 設定されたポリシー ID は、正確に 56 個の 16 個の 16 個の重小文字 (28 のデコードバイト) を含まなければなりません。 一致は、正確なポリシー ID と資産名を使用します。

<br>

REST ヒント: `network` 設定は、次の値をサポートしています。

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

`dingo.yaml`ファイルを実行して確認することができます:

```
cd /etc/dingo/
sudo nano dingo.yaml
```

<br>

<a id="step-3---bootstrap-from-mithril-first-run-only"></a>

## ステップ3 - MithrilからBootstrap(最初の実行のみ)

初めてサービスを始める前に、Mithrilのスナップショットからデータベースをブートストラップします。

```
dingo mithril sync --config /etc/dingo/dingo.yaml
```

> リリース `mithril.downloadMaxTransientRetries` は、TLS のタイムアウト、HTTP 429 応答、HTTP 5xx 応答などのトランジェントのブートストラップのダウンロードの失敗をコントロールします。 例では、`10` のデフォルト値を使用します。

これは、スナップショットをダウンロードし、同期時間の保存時間をロードします。 [クイックスタートガイドのステップ4](../002-quick-start-overview#step-4---bootstrap-from-mithril-snapshot)を参照してください。

> 初期起動後、システム化されたサービスはノードを同期させるだけです。

***

<br>

<a id="step-4---create-dingoservice-unit-file"></a>

## ステップ4 - `dingo.service`ユニットファイルを作成する

systemd のサービスファイルを作成します。 `YOUR_USER`をユーザー名(`echo $USER`)に置き換えてください。

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

`dingo.service`ファイルを実行して確認することができます:

```
sudo nano /etc/systemd/system/dingo.service
```

<br>

<a id="step-5---enable-and-start-the-service"></a>

## ステップ5 - サービスの有効化と開始

起動時にサービスを起動し、起動できるようにします。

```bash
sudo systemctl daemon-reload
sudo systemctl enable dingo.service
sudo systemctl start dingo.service
```

***

<br>

<a id="step-6---check-status"></a>

## ステップ6 - ステータスの確認

サービスが実行されていることを確認します。

```
sudo systemctl status dingo.service
```

`/health` または `/healthz` は、ポート `12799` の読みやすさを `/readyz` にチェックします。

```
curl http://127.0.0.1:12799/health
curl http://127.0.0.1:12799/healthz
curl http://127.0.0.1:12799/readyz
```

`/health`と`/healthz`は、イベントループの応答性を含むライブネスチェックを使用します。 `/readyz`は、設定されたチップギャップの状態とデータベースの信頼性が満たされた場合のみ、読みやすさを報告します。 ブロックプロデューサーの場合、`/readyz`は、実行中のフォアと使用可能な鍛造資格を必要とします。

ログをリアルタイムでフォローするには:

```
sudo journalctl -u dingo -f
```

エラーがある場合、最近のログを表示するには:

```
sudo journalctl -u dingo -n 50 --no-pager
```

***

<br>

<a id="congratulations-you-have-successfully-set-up-a-systemd-service-for-dingo"></a>

### おめでとうございます!Dingoの`systemd`サービスを正常に設定しました。


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
