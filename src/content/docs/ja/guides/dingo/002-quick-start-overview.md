---
title: クイックスタートガイド
description: Dingoクイックスタート概要。
---

# Dingo

Dingoは、Go言語で書かれたCardanoブロックチェーンデータノードであり、Ouroboros Network Node-to-Nodeミニプロトコルファミリーを使用して、Cardanoブロックチェーン上のネットワーク通信に積極的に参加します。

⚠️ これは開発中のプロジェクトであり、現在活発に開発が進められています

<br>

***

このガイドでは、Dingoバイナリのダウンロードと、Cardano PreviewネットワークでDingoノードを実行するために必要なすべての手順を説明します。以下の手順に従って始めましょう。

<br>

✅ このガイドは一般的なLinux環境を前提としています。必要に応じてコマンドとパスを調整してください。

***

<br>

## ステップ1 - Dingoバイナリのダウンロード
<br>

<a href="https://github.com/blinklabs-io/dingo/releases" target="_blank">Dingoリリース</a>ページから最新リリースをダウンロードします。

⚠️ お使いのシステムに合わせて、バージョン（以下の例ではv0.70.0）とアーキテクチャを調整してください。

```
mkdir -p ~/dingo
cd ~/dingo
wget https://github.com/blinklabs-io/dingo/releases/download/v0.70.0/dingo-v0.70.0-linux-amd64.tar.gz -O - | tar -xz
```

以下を実行してバイナリが動作することを確認できます：

```
./dingo version
```

***

<br>

## ステップ2 - dingo.yaml設定ファイルの作成

Dingoには、preview、preprod、mainnet向けのCardanoネットワーク設定（genesisファイル、config.json）が組み込まれています。これらを別途ダウンロードする必要はありません。

dingoディレクトリに`dingo.yaml`ファイルを作成します。`$HOME`変数は自動的にホームディレクトリのパスに展開されます：

```
cat <<EOF > ~/dingo/dingo.yaml
# Storage
databasePath: "$HOME/dingo/.dingo"

plugins:
  storage:
    blob:
      provider: "badger"
      config:
        # `dataDir` は任意で、指定しなければ `databasePath` を使います。
        # dataDir: "$HOME/dingo/.dingo"
        blockCacheSize: 0
        compression: false
        gc: true
        indexCacheSize: 0
    metadata:
      provider: "sqlite"
      config:
        # `dataDir` は任意で、指定しなければ `databasePath` を使います。
        # dataDir: "$HOME/dingo/.dingo"
  mempool:
    provider: "default"
    config:
      # `capacity` は任意で、コメントアウトするとモードの既定値を使います。
      # 既定値: 通常のモードでは 1048576 (1 MiB)、leios モードでは 26214400 (25 MiB) です。
      # capacity: 1048576
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
targetNumberOfRootPeers: 0
privateBindAddr: "127.0.0.1"
privatePort: 3002
relayPort: 3001
socketPath: "$HOME/dingo/dingo.socket"

# API and Bark
barkBaseUrl: ""
barkPort: 0
storageMode: "core"
midnight:
  authTokenPolicyId: ""
EOF
```

> 📝 `debugPort` はプロファイリングが必要な場合を除き `0` のままにします。`debugPort` は任意の `pprof` リスナーを制御し、`metricsPort` とは別で、`0` のときは無効のままです。`pprof` には認証機能とTLSがなく、`debugBindAddr` は `bindAddr` や `privateBindAddr` から独立して既定値 `127.0.0.1` を使います。外部アクセスを許可する場合は、YAMLの `debugBindAddr`、`DINGO_DEBUG_BIND_ADDR`、または `--debug-bind-addr` でアドレスを明示的に指定し、ファイアウォールなどのネットワーク制御も設定します。`serve` モードとMithril同期の両方で同じ設定を使います。

> 📝 `plugins.storage.metadata.provider` に `postgres` を指定すると、`statementTimeout` は各ステートメントを、`lockTimeout` はロック取得待機を制限します。これらのフィールドは `30s` のような期間値を受け取ります。PostgreSQLは正の期間値を、ミリ秒単位の `statement_timeout` と `lock_timeout` のセッション設定に変換します。プロバイダーに `mysql` を指定すると、`statementTimeout` は `max_execution_time` によりトップレベルの読み取り専用 `SELECT` をミリ秒単位で制限し、`lockTimeout` は `innodb_lock_wait_timeout` を整数秒で設定して1秒未満の期間を切り上げ、`readTimeout` と `writeTimeout` は指定した期間値を使用して転送ソケットの読み書き期限を設定します。Dingoは各フィールドの既定値を `0` とし、負の値を拒否し、設定に明示的な `dsn` がある場合はこれらのフィールドをすべて無視します。

> 📝 起動前、Dingoは既存の `socketPath` を保持します。Dingoは確認済みの古いUnixソケットだけを削除します。通常ファイル、シンボリックリンク、ディレクトリ、稼働中のソケット、判定があいまいなプローブ、または削除エラーがあると起動に失敗します。設定したパスは存在しない状態にするか、Dingoが削除できる確認済みの古いUnixソケットだけを置いてください。

> 📝 `targetNumberOfRootPeers` はルートピアの目標数を指定します。`0` はDingo側の指定なしを表し、Cardanoの `TargetNumberOfRootPeers` をフォールバックとして使います。Dingo側で0以外の値を指定すると、Cardano側の値より優先します。Cardano側に非0の目標値がない場合の実効既定値は `60` です。正の値は選択するパブリックルートの数を制限しますが、ローカルルートは維持します。`-1` は無制限です。YAMLキーは `targetNumberOfRootPeers`、環境変数は `DINGO_TARGET_ROOT_PEERS`、CLIフラグは `--target-root-peers` です。

### APIのトークンレジストリ設定（任意）

APIストレージでは、BlockfrostのアセットレスポンスにローカルのCIP-26メタデータを使用するため、トップレベルに次のブロックを追加します：

```yaml
tokenRegistry:
  enabled: false
```

Dingoは `tokenRegistry.enabled` を既定で `false` に設定し、トークンレジストリを `storageMode: "api"` の場合にだけ使用します。`true` に設定する前に、データベースのマイグレーション v3（`token-registry-metadata`）を適用します。メインネットでの初回同期では約240 MBをダウンロードし、それ以降の確認では条件付きリクエストを使用します。

その他の `tokenRegistry` フィールドは次のように設定します：

- `sourceUrl`：空の場合は設定したネットワーク用のレジストリを選択します。ミラーを使用する場合はURLを設定します。
- `interval`：再確認の間隔です。既定値は `6h` で、`1m` 未満の値は最小値の `1m` として扱います。
- `requestTimeout`：ダウンロード全体のタイムアウトです。既定値は `15m` です。
- `userAgent`：HTTPユーザーエージェントです。空の場合は `dingo-token-registry/1` を使用します。
- `maxBytes`：圧縮されたダウンロードの上限です。既定値は `768 MiB` です。
- `maxEntryBytes`：1つのマッピングエントリの上限です。既定値は `4 MiB` です。
- `storeLogos`：`true` にするとレジストリのロゴを保存します。既定値は `false` です。ロゴはレジストリのバイト数の約90%を占めます。
- `allowPrivateAddresses`：`true` にするとプライベート、ループバック、リンクローカルアドレスへのレジストリリクエストを許可します。SSRF保護のため既定値は `false` です。プライベートなレジストリソースが必要な場合にだけ有効にします。

次の環境変数も使用できます：

`DINGO_TOKEN_REGISTRY_ENABLED`、`DINGO_TOKEN_REGISTRY_SOURCE_URL`、`DINGO_TOKEN_REGISTRY_INTERVAL`、`DINGO_TOKEN_REGISTRY_REQUEST_TIMEOUT`、`DINGO_TOKEN_REGISTRY_USER_AGENT`、`DINGO_TOKEN_REGISTRY_MAX_BYTES`、`DINGO_TOKEN_REGISTRY_MAX_ENTRY_BYTES`、`DINGO_TOKEN_REGISTRY_STORE_LOGOS`、`DINGO_TOKEN_REGISTRY_ALLOW_PRIVATE_ADDRESSES`。

対応するCLIフラグは `--token-registry-enabled`、`--token-registry-source-url`、`--token-registry-interval`、`--token-registry-request-timeout`、`--token-registry-user-agent`、`--token-registry-max-bytes`、`--token-registry-max-entry-bytes`、`--token-registry-store-logos`、`--token-registry-allow-private-addresses` です。

> 💡 API サーバーは `storageMode: "api"` のときだけ有効です。各 API の `port` を `0` にすると、その API は無効になります。

> 📝 `midnight.authTokenPolicyId` は、API ストレージモードで Midnight インデックスを使用する場合にのみ適用されます。空のままにすると、認証トークン照合のより広い既定の動作が維持されます。

選択したAPIプロバイダーすべてにTLSと認証を共通で適用する場合は、トップレベルの `api.tls` と `api.auth` を使用します。次の例では、Blockfrost、Mesh、UTxO RPCにサーバーTLSとトークン認証を適用します。

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

- TLSで指定できるモードは `disabled` と `server` です。TLSの `server` モードには `certFilePath` と `keyFilePath` の両方が必要です。
- 認証で指定できるモードは `disabled` と `token` です。`token` モードには `token` または `tokenFilePath` のどちらか一方が必要で、両方は指定できません。
- `plugins.api.<name>.config.tls` と `plugins.api.<name>.config.auth` にプロバイダー単位の項目を指定すると、共通設定の各項目を上書きできます。プロバイダーで `mode: disabled` を明示すると、継承した設定も無効になります。未設定時の既定モードはどちらも `disabled` です。

- 認証済みAPIリクエストは `Authorization: Bearer <token>` を使用します。Blockfrostは同じトークンに対して `project_id` も受け付けます。
- ブラウザーのCORS preflightである `OPTIONS` リクエストは認証なしで処理しますが、それ以外のリクエストには認証が必要です。
- トップレベルの設定には、CLIフラグ `--api-tls-mode`、`--api-tls-cert-file-path`、`--api-tls-key-file-path`、`--api-auth-mode`、`--api-auth-token-file-path` と、環境変数 `DINGO_API_TLS_MODE`、`DINGO_API_TLS_CERT_FILE_PATH`、`DINGO_API_TLS_KEY_FILE_PATH`、`DINGO_API_AUTH_MODE`、`DINGO_API_AUTH_TOKEN_FILE_PATH` も使用できます。
- 既存のルート設定 `tlsCertFilePath` と `tlsKeyFilePath` は UTxO RPCだけで使う互換設定であり、BlockfrostやMeshの共通TLS既定値にはなりません。

> 💡 `block-cache-size`と`index-cache-size`を0に設定し、`compression: false`にすると、BadgerDBの内部キャッシュの代わりにOSのページキャッシュ（mmap）が使用されます。これによりメモリ使用量が大幅に削減されます。


***

<br>

## ステップ3 - ポートの開放

Dingoに必要なポートに対するUFWファイアウォールルールの追加方法について説明します。

> 💡 ヒント: UFWはUncomplicated Firewallの略で、iptables（netfilter）ファイアウォールルールの管理に使用されます。

現在開いているポートを確認するには：

```
sudo ufw status numbered
```

#### Ouroboros Node to Node（NtN）通信用のポート3001を追加

```
sudo ufw allow 3001/tcp
```

***

<br>

## ステップ4 - Mithrilスナップショットからのブートストラップ

Dingoには、スナップショットを自動的にダウンロードしてロードする組み込みのMithrilクライアントがあります。これにより、genesisからチェーンをリプレイする場合と比較して、数時間の同期時間を節約できます。

dingoディレクトリから以下のコマンドを実行します：

```
cd ~/dingo
./dingo mithril sync --config ~/dingo/dingo.yaml
```

> 📝 `mithril.downloadMaxTransientRetries` は、TLS タイムアウト、HTTP 429 応答、HTTP 5xx 応答などの一時的なブートストラップダウンロード障害に対する再試行回数を制御します。例では既定値の `10` を使用しています。


Dingoは次の処理を行います：
1. 設定したネットワークの最新Mithrilスナップショットをダウンロード
2. 証明書チェーンを検証
3. スナップショットをデータベースにロード

これにはシステムとネットワーク速度によって、約10〜15分かかります。

> 📝 このステップをスキップした場合、Dingoは起動時にgenesisから同期するため、はるかに長い時間がかかります。

***

<br>

## ステップ5 - Dingoの起動

Mithrilスナップショットがロードされたら、ノードを起動します：

```
cd ~/dingo
./dingo serve --config ~/dingo/dingo.yaml
```

ノードがピアに接続し、チェーン先端に到達するために残りのブロックを同期するログ出力が表示されるはずです。

***

<br>

#### コンピューターが再起動したときにDingoノードを自動的に再起動して稼働時間を最大化するためのsystemdサービスの使用に興味がありますか？
[Dingoのスタートアップサービスを作成する方法についてのガイドを参照してください](../003-create-start-up-service)。

***

<br>

### おめでとうございます。Dingoノードを使用する準備が整いました！

[Cardano CLIを使用してDingoと対話する方法を学ぶ](../004-using-dingo-with-cardano-cli)。


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
