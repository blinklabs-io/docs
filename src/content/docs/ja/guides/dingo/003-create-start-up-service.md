---
title: スタートアップサービスの作成
description: Dingoのスタートアップサービスを作成する。
---

# Dingo

Dingoは、Go言語で書かれたCardanoブロックチェーンデータノードであり、Ouroboros Network Node-to-Nodeミニプロトコルファミリーを使用して、Cardanoブロックチェーン上のネットワーク通信に積極的に参加します。

⚠️ これは開発中のプロジェクトであり、現在活発に開発が進められています

<br>

***

このガイドでは、`systemd`サービスの設定方法について説明します。`systemd`サービスを使用してDingoノードを実行すると、コンピューターが再起動したときにDingoノードを自動的に再起動することで、稼働時間を最大化できます。以下の手順に従って始めましょう。

<br>

✅ このガイドは一般的なLinux環境を前提としています。必要に応じてコマンドとパスを調整してください。

> ✅ このガイドは、[クイックスタート](../002-quick-start-overview)ガイドをすでに完了していることを前提としています。

***

<br>

## ステップ1 - Dingoバイナリと設定の移動

Dingoバイナリを`/usr/local/bin/`に、設定を`/etc/dingo/`に移動して、システム全体からアクセスできるようにします。

<br>

バイナリをコピーします：

```bash
sudo cp ~/dingo/dingo /usr/local/bin/
```

> ✅ `which dingo`を実行して、バイナリがコピーされたことを確認できます

<br>

設定ディレクトリを作成し、設定をコピーします：

```bash
sudo mkdir -p /etc/dingo
sudo cp ~/dingo/dingo.yaml /etc/dingo/
```

***

<br>

## ステップ2 - dingo.yamlのパスの更新

サービスはあなたのユーザーとして実行されますが、設定は`/etc/dingo/`にあるため、データベースとソケットのパスが絶対パスを使用していることを確認する必要があります。以下を実行して、`$HOME`を展開した状態で設定を再生成します：

```bash
sudo bash -c "cat <<EOF > /etc/dingo/dingo.yaml
# Database
databasePath: \"$HOME/dingo/.dingo\"

# Plugins
plugins:
  storage:
    blob:
      provider: \"badger\"
      config:
        blockCacheSize: 0
        compression: false
        dataDir: \"$HOME/dingo/.dingo/badger\"
        gc: true
        indexCacheSize: 0
    metadata:
      provider: \"sqlite\"
      config:
        dataDir: \"$HOME/dingo/.dingo/metadata.db\"
  mempool:
    provider: \"default\"
    config:
      # `capacity` はモードの既定値を上書きする任意の設定です。既定値は Praos モードと通常の serve モードで 1 MiB、Musashi モードで 25 MiB です。
      # 既定値を使うには、このキーをコメントアウトするか省略します。
      # capacity: 1048576
      # `revalidationDeltaCap` は FIFO 再検証中に追随する変更量の上限です。既定値は 64 で、正の値でなければなりません。
      # revalidationDeltaCap: 64
      # `evictionWatermark` は 0 または (0,1) の値を受け付けます。0 にすると FIFO の古いトランザクションを削除せず、容量到達時に新しいトランザクションを拒否します。
      # `rejectionWatermark` は (0,1] の値を受け付けます。削除を有効にする場合は `evictionWatermark` より大きくします。
      # 既定値: `evictionWatermark: 0`、`rejectionWatermark: 1.0`。
      # CLI: `--eviction-watermark`、`--rejection-watermark`
      # 環境変数: `DINGO_MEMPOOL_EVICTION_WATERMARK`、`DINGO_MEMPOOL_REJECTION_WATERMARK`
      # evictionWatermark: 0
      # rejectionWatermark: 1.0
  api:
    blockfrost:
      provider: \"builtin\"
      config:
        port: 0
    mesh:
      provider: \"builtin\"
      config:
        port: 0
    utxorpc:
      provider: \"builtin\"
      config:
        port: 0

# API の共有 TLS / 認証設定（任意）
# api:
#   tls:
#     mode: \"server\"
#     certFilePath: \"/run/secrets/api.crt\"
#     keyFilePath: \"/run/secrets/api.key\"
#   auth:
#     mode: \"token\"
#     tokenFilePath: \"/run/secrets/api-token\"

# Mithril
mithril:
  aggregatorUrl: \"\"
  cleanupAfterLoad: true
  enabled: true
  verifyCertificates: true
  # CLI: `--mithril-allow-insecure-http`
  # 環境変数: `DINGO_MITHRIL_ALLOW_INSECURE_HTTP`
  allowInsecureHttp: false

# コンセンサス
# CLI: `--delegator-inactivity-enabled`、`--delegator-inactivity`
# 環境変数: `DINGO_DELEGATOR_INACTIVITY_ENABLED`、`DINGO_DELEGATOR_INACTIVITY`
delegatorInactivityEnabled: false
delegatorInactivity: 90

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
# `barkPort` と `databaseLifecycle.snapshotDir` を併用する場合は、`barkClientCaFilePath` と `tlsCertFilePath` / `tlsKeyFilePath` の両方が必要です。
databaseLifecycle:
  # `snapshotEnabled` を有効にすると、エポック境界で自動スナップショットを作成します。
  snapshotEnabled: false
  # 自動スナップショットの保存先です。各スナップショットは個別のサブディレクトリに書き出されます。
  snapshotDir: \"$HOME/dingo/snapshots\"
  # ローカル保存に加えて、スナップショットをクラウドにもミラーします。`s3://bucket/prefix` または `gcs://bucket/prefix` を指定します。
  # `dingo_extra_plugins` ビルドタグが必要です。
  snapshotCloudDestination: \"\"
  # 複数ノードで同じクラウド保存先を共有する場合の追加パスです。
  snapshotCloudDestinationPrefix: \"\"
  # 古い自動スナップショットの保持数です。`0` はすべて保持します。
  snapshotRetention: 0
  # N epoch ごとに自動スナップショットを作成します。`1` は毎回です。
  snapshotEveryNEpochs: 1
storageMode: \"core\"
EOF"
```

> 📝 MithrilのアグリゲーターURLとアーティファクトURLは、既定でHTTPSを使用する必要があります。本番環境では `mithril.allowInsecureHttp: false` を維持します。ローカル開発またはテストに限り `true` を設定できます。対応するオプションは `--mithril-allow-insecure-http` と `DINGO_MITHRIL_ALLOW_INSECURE_HTTP` です。本番環境ではこの設定を有効にしないでください。

> ⚠️ `delegatorInactivityEnabled` は、CIP-0163 の `account_withdrawal_witness` 書き込みに適用するコンセンサスに影響する非アクティブ期間の制御で、既定値は `false` です。有効にする場合は、`delegatorInactivity` に `1` から `10000` までの整数のエポック範囲を設定します。例では既定値の `90` を使用します。ネットワーク上のすべてのノードで同じ値にする必要があります。Mithrilブートストラップは、インポートした報酬アカウントの有効期限状態を再構築できないため、この制御と互換性がありません。有効な設定ではgenesisから同期します。

> 📝 この例では、両方の最上位フィールドに対応するCLIフラグと環境変数を示します。

> 📝 `plugins.storage.metadata.provider` に `postgres` を指定すると、`statementTimeout` は各ステートメントを、`lockTimeout` はロック取得待機を制限します。これらのフィールドは `30s` のような期間値を受け取ります。PostgreSQLは正の期間値を、ミリ秒単位の `statement_timeout` と `lock_timeout` のセッション設定に変換します。プロバイダーに `mysql` を指定すると、`statementTimeout` は `max_execution_time` によりトップレベルの読み取り専用 `SELECT` をミリ秒単位で制限し、`lockTimeout` は `innodb_lock_wait_timeout` を整数秒で設定して1秒未満の期間を切り上げ、`readTimeout` と `writeTimeout` は指定した期間値を使用して転送ソケットの読み書き期限を設定します。Dingoは各フィールドの既定値を `0` とし、負の値を拒否し、設定に明示的な `dsn` がある場合はこれらのフィールドをすべて無視します。

> 📝 起動前、Dingoは既存の `socketPath` を保持します。Dingoは確認済みの古いUnixソケットだけを削除します。通常ファイル、シンボリックリンク、ディレクトリ、稼働中のソケット、判定があいまいなプローブ、または削除エラーがあると起動に失敗します。設定したパスは存在しない状態にするか、Dingoが削除できる確認済みの古いUnixソケットだけを置いてください。

> 📝 APIポートはAPIストレージモードでのみ有効です。`0` を設定すると、そのAPIは無効になります。

> 📝 `debugPort` は `0` で無効になります。`pprof` の待受は認証も TLS も使用せず、既定の `debugBindAddr: \"127.0.0.1\"` でループバックにバインドします。`debugBindAddr` は `bindAddr` や `privateBindAddr` から独立しています。外部公開には `debugBindAddr`、`--debug-bind-addr`、または `DINGO_DEBUG_BIND_ADDR` の明示的な上書きが必要で、ファイアウォールなどのネットワーク保護も設定してください。この注意事項は Mithril の同期処理と systemd の `dingo serve` の両方に適用されます。


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

これらのポートは、更新後のローカル Blockfrost エクスプローラーの例に合わせた値です。これらのサービスが必要な場合にのみ有効にできます。

> 📝 `midnight.authTokenPolicyId` は、API ストレージモードで Midnight インデックスを使用する場合にのみ適用されます。空のままにすると、認証トークン照合のより広い既定の動作が維持されます。

> 📝 `api.tls` と `api.auth` は、選択した Blockfrost、Mesh、UTxO RPC の `plugins.api.*` に共通して適用する既定の設定です。`plugins.api.<name>.config.tls` と `plugins.api.<name>.config.auth` は、各APIで対応するフィールドを個別に上書きできます。各API側で `mode: \"disabled\"` を明示すると、共通設定をそのAPIだけ無効にできます。
>
> TLS の有効なモードは `disabled` と `server` です。`server` を指定する場合は、`certFilePath` と `keyFilePath` の両方に証明書とキーのパスを設定します。認証の有効なモードは `disabled` と `token` です。`token` では `token` と `tokenFilePath` のどちらか一方だけを指定し、推奨される `tokenFilePath` を使用します。`server` でTLSパスを片方だけ指定した場合、または `token` で認証トークンフィールドをどちらも指定しないか両方を指定した場合、Dingoは待受を開始する前の起動時検証でエラーを返します。
>
> 認証トークンは `Authorization: Bearer <token>` で送信します。Blockfrost は互換性のため `project_id: <token>` も受け付けます。認証を有効にした場合、認証を省略できるのはブラウザーの CORS preflight にあたる `OPTIONS` だけです。preflight ではない `OPTIONS` を含むその他のすべてのリクエストには認証が必要です。
>
> トップレベルの共有設定は、`--api-tls-mode` / `DINGO_API_TLS_MODE`、`--api-tls-cert-file-path` / `DINGO_API_TLS_CERT_FILE_PATH`、`--api-tls-key-file-path` / `DINGO_API_TLS_KEY_FILE_PATH`、`--api-auth-mode` / `DINGO_API_AUTH_MODE`、`--api-auth-token-file-path` / `DINGO_API_AUTH_TOKEN_FILE_PATH` からも設定できます。既存のルート設定 `tlsCertFilePath` / `tlsKeyFilePath` は UTxO RPC だけで使う互換性フィールドであり、Blockfrost や Mesh には適用されません。

> 📝 停止中のデータディレクトリには `dingo database snapshot`、`dingo database restore <snapshot-dir>`、`dingo database truncate --slot <slot>`、`--hash <hash>`、`--block-number <n>` を使えます。`restore` は `snapshotCloudDestination` と同じクラウドURIも受け付け、一時ディレクトリにダウンロードしてから復元します。`barkPort` と `databaseLifecycle.snapshotDir` を併用した実行中ノードでは、Bark の `DatabaseService` が `Restore` と `Truncate` をライブで実行します。これらの機能を使う場合は `barkClientCaFilePath` と `tlsCertFilePath` / `tlsKeyFilePath` の両方を設定してください。


***

<br>

## ステップ3 - Mithrilからのブートストラップ（初回実行のみ）

サービスを初めて起動する前に、Mithrilスナップショットからデータベースをブートストラップします：

```bash
dingo mithril sync --config /etc/dingo/dingo.yaml
```

> 📝 `mithril.downloadMaxTransientRetries` は、TLS タイムアウト、HTTP 429 応答、HTTP 5xx 応答などの一時的なブートストラップダウンロード障害に対する再試行回数を制御します。例では既定値の `10` を使用しています。

これによりスナップショットがダウンロードおよびロードされ、数時間の同期時間を節約できます。詳細は[クイックスタートガイドのステップ4](../002-quick-start-overview#ステップ4---mithrilスナップショットからのブートストラップ)を参照してください。

> 📝 これは一度だけ行う必要があります。初回ブートストラップ後は、systemdサービスがノードの同期を維持します。

***

<br>

## ステップ4 - dingo.serviceユニットファイルの作成

systemdサービスファイルを作成します。`YOUR_USER`をあなたのユーザー名（`echo $USER`）に置き換えてください：

```bash
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

## ステップ5 - サービスの有効化と開始

起動時にサービスが実行されるように有効化し、すぐに開始します：

```bash
sudo systemctl daemon-reload
sudo systemctl enable dingo.service
sudo systemctl start dingo.service
```

***

<br>

## ステップ6 - ステータスの確認

サービスが実行中であることを確認します：

```bash
sudo systemctl status dingo.service
```

ログをリアルタイムで追跡するには：

```bash
sudo journalctl -u dingo -f
```

エラーが発生した場合に最近のログを確認するには：

```bash
sudo journalctl -u dingo -n 50 --no-pager
```

***

<br>

### おめでとうございます。Dingoのスタートアップサービスを設定しました！


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
