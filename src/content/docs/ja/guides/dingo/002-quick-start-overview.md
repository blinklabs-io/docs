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

> 📝 `debugPort` はプロファイリングが必要な場合を除き `0` のままにします。`debugPort` は任意の `pprof` リスナーを制御し、`metricsPort` とは別で、`0` のときは無効のままです。`pprof` には認証とTLSがなく、`debugBindAddr` は `bindAddr` や `privateBindAddr` とは独立して既定値 `127.0.0.1` を使用します。外部アクセスを許可する場合は、YAMLの `debugBindAddr`、`DINGO_DEBUG_BIND_ADDR`、または `--debug-bind-addr` で明示的にアドレスを指定し、ファイアウォールなどのネットワーク制御も設定します。`serve` と Mithril同期は同じ設定を使用します。

> 📝 `targetNumberOfRootPeers` はルートピアの目標数を指定します。`0` はDingo側の指定なしを表し、Cardanoの `TargetNumberOfRootPeers` をフォールバックとして使用します。Dingo側で0以外を指定するとCardano側の値より優先します。Cardano側にも0または指定がない場合の実効既定値は `60` です。正の値は選択するパブリックルートの数を制限しますが、ローカルルートは維持します。`-1` は無制限です。YAMLキーは `targetNumberOfRootPeers`、環境変数は `DINGO_TARGET_ROOT_PEERS`、CLIフラグは `--target-root-peers` です。

> 💡 API サーバーは `storageMode: "api"` のときだけ有効です。各 API の `port` を `0` にすると、その API は無効になります。

> 📝 `midnight.authTokenPolicyId` は、API ストレージモードで Midnight インデックスを使用する場合にのみ適用されます。空のままにすると、認証トークン照合のより広い既定の動作が維持されます。

APIのTLSと認証を選択したAPIプロバイダーに共通で設定する場合は、トップレベルの `api.tls` と `api.auth` を使用します。次の例では、Blockfrost、Mesh、UTxO RPCにサーバーTLSとトークン認証を適用します。

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

TLSの有効なモードは `disabled` と `server`、認証の有効なモードは `disabled` と `token` です。`server` には `certFilePath` と `keyFilePath` の両方が必要です。`token` には `token` または `tokenFilePath` のどちらか一方が必要で、両方は指定できません。`plugins.api.<name>.config.tls` と `plugins.api.<name>.config.auth` にプロバイダー単位の項目を指定すると、共通設定の各項目を上書きできます。プロバイダーで `mode: disabled` を明示すると、継承した設定も無効になります。未設定時の既定モードはどちらも `disabled` です。

認証済みAPIリクエストは `Authorization: Bearer <token>` を使用します。Blockfrostは同じトークンに対して `project_id` も受け付けます。ブラウザーのCORS preflightである `OPTIONS` は認証なしで処理しますが、それ以外のリクエストは認証が必要です。トップレベルの設定には、CLIフラグ `--api-tls-mode`、`--api-tls-cert-file-path`、`--api-tls-key-file-path`、`--api-auth-mode`、`--api-auth-token-file-path` と、環境変数 `DINGO_API_TLS_MODE`、`DINGO_API_TLS_CERT_FILE_PATH`、`DINGO_API_TLS_KEY_FILE_PATH`、`DINGO_API_AUTH_MODE`、`DINGO_API_AUTH_TOKEN_FILE_PATH` も使用できます。既存のルート設定 `tlsCertFilePath` と `tlsKeyFilePath` は UTxO RPCだけで使用する互換設定であり、BlockfrostやMeshの共通TLS既定値にはなりません。

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
