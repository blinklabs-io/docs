---
title: "クイックスタートガイド"
description: "Dingoクイックスタートの概要。"
---

<a id="dingo"></a>

# Dingo

Go に書かれている Cardano ブロックチェーンノードは、ミニプロトコルの Ouroboros Network Node-to-Node-Node 家族を使用して、Cardano ブロックチェーン上のネットワーク通信に積極的に参加しています。

⚠ Dingoは進行中の作業であり、現在重大開発中です。

<br>

***

このガイドでは、Dingoバイナリをダウンロードし、Cardanoプレビューネットワーク上でDingoノードを実行するために必要なすべてのステップについて説明します。

<br>

✅ このガイドは、典型的なLinuxのセットアップを想定しています。必要に応じて、コマンドとパスを調整してください。

***

<br>

<a id="step-1---download-dingo-binary"></a>

## ステップ1 - Dingoバイナリをダウンロード
<br>

<a href="https://github.com/blinklabs-io/dingo/releases" target="_blank">Dingoリリース</a>ページから最新のリリースをダウンロードしてください。

⚠️ バージョンとアーキテクチャを調整して、システムにマッチします。

```
mkdir -p ~/dingo
cd ~/dingo
wget https://github.com/blinklabs-io/dingo/releases/download/v0.87.1/dingo-v0.87.1-linux-amd64.tar.gz -O - | tar -xz
```

実行中のバイナリの動作を確認することができます。

```
./dingo version
```

<a id="alternative-install-with-npm"></a>

### 代替:npmでインストールする

`@blinklabs/dingo`パッケージには、Node.js 22以降と`tar`が必要です。これは、x64/amd64またはarm64上のLinux、FreeBSD、およびmacOSをサポートしています。インストール中に、パッケージは、一致するDingoリリースをダウンロードして、SHA-256チェックサムを確認します。

インストーラーは、ホストの allowlist にリリースアセットの HTTPS URL のみを受け入れます。認証情報を含む URL を拒否したり、非 443 ポートを使用する URL を拒否します。また、リダイレクトや DNS の結果は、プライベートまたは特殊な IP アドレスに解決します。

`dingo` コマンドをグローバルにインストールし、検証します。

```
npm install --global @blinklabs/dingo
dingo --help
```

グローバルインストール後、残りのクイックスタートコマンドで `./dingo` ではなく `dingo` を使用します。グローバルインストールなしで確認するには、次のコマンドを実行します。

```
npx @blinklabs/dingo --help
```

***

<br>

<a id="run-a-local-single-node-devnet"></a>

## ローカル単一ノード Devnet を実行します。

ダウンロードしたバイナリでローカルの単一ノードのdevnetを実行します。

```
./dingo devnet
```

> Dingo で生成された devnet の設定は `bindAddr` を `127.0.0.1` に設定します。そのため、devnet API とリスナーはローカル接続をデフォルトで受け入れます。生成された構成は、リモートアクセスを有効にするために意図的に変更します。

グローバルな npm インストールでは、`dingo devnet` を実行します。グローバルインストールがなければ、次のようにします。

```
npx @blinklabs/dingo devnet
```

`--data-dir` がなければ、Dingo は、設定、テストキー、チェーンデータをプライベートな一時ディレクトリに保存し、プロセスが終了したときにそのディレクトリを削除します。各実行は新しいチェーンを開始します。

`--data-dir`をチェーンを保持し、再開するように設定します。

```
./dingo devnet --data-dir ./.dingo-devnet
```

チェーンを再開するために再び同じコマンドを実行します。 `--reset`オプションは、`--data-dir`を要求し、ディレクトリに関連のないファイルを保持しながら、Dingo-managed状態を再作成します。

```
./dingo devnet --data-dir ./.dingo-devnet --reset
```

最初の永続的な実行には空のディレクトリが必要です。Dingoは、ノードが実行中に同じディレクトリを使用する別の呼び出しを拒否します。束縛されたキーとネットワークを使用してローカルテストのみを実行します。実際の資金では使用しないでください。

Dingo は `cardano/keys/` ディレクトリに `faucet.skey`、`faucet.vkey`、`faucet.addr` を用意します。同梱の `faucet.addr`（`addr_test1vztc80na8320zymhjekl40yjsnxkcvhu58x59mc2fuwvgkc332vxv`）には、ローカルトランザクション用としてジェネシス時に `900,000` テスト ADA（`900_000_000_000` lovelace）が割り当てられます。

- 一時的な `./dingo devnet` の操業のために、 Dingo は一時的な操業を印刷します
  ディレクトリ。その`cardano/keys/`ディレクトリには、プロセスが終了するまでの蛇口ファイルが含まれています。
- `./dingo devnet --data-dir ./.dingo-devnet` の場合、 Dingo はファイルを保存する
  `./.dingo-devnet/cardano/keys/`の特長
- Dingoは、ファセットファイルとディレクトリを所有者のみのアクセスに制限します。

`--reset`なしで永続的なdevnetが再開すると、Dingoは、蛇口ファイルだけを復元または更新し、ローカル設定を書き換えます。 これにより、プロデューサーの資格情報、既存の創世記割り当て、チェーンデータが保存されます。

***

<br>

<a id="step-2---create-dingoyaml-configuration-file"></a>

## ステップ2 - dingo.yaml構成ファイルを作成する

すべての Dingo v0.87.1 の設定、デフォルト、および環境、またはコマンドラインのオーバーライドについては、[構成リファレンス](/ja/guides/dingo/009-configuration-reference/)を参照してください。 リリースマッチした [`dingo.yaml.example`](https://raw.githubusercontent.com/blinklabs-io/dingo/v0.87.1/dingo.yaml.example)をダウンロードし、自分の設定の開始点として使用してください。

Dingoは、プレビュー、プリプロド、メインネット用の組み込みのCardanoネットワーク構成(genesisファイル、config.json)で出荷します。 それらを別々にダウンロードする必要はありません。

dingo ディレクトリに `dingo.yaml` ファイルを作成します。`$HOME` 変数は、自動的にホームディレクトリパスに展開します。

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
        # Optional Badger data directory. When unset, databasePath applies.
        # dataDir: "$HOME/dingo/.dingo/badger"
    metadata:
      provider: "sqlite"
      config:
        # Optional SQLite data directory. When unset, databasePath applies.
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
# plugins.mempool.config.capacity is an optional override.
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
  # Optional exact artifact identity for a fresh bootstrap only.
  # Mithril v1 uses a snapshot digest; Mithril v2 uses a Cardano database artifact hash.
  # pinnedDigest: ""

# Network
bindAddr: "0.0.0.0"
# Prometheus uses this independent address and defaults to loopback; it does
# not inherit bindAddr. Use --metrics-bind-addr or DINGO_METRICS_BIND_ADDR to
# override it. Set metricsPort to 0 to disable the metrics listener.
metricsBindAddr: "127.0.0.1"
metricsPort: 12798
healthPort: 12799
healthReadyGapSlots: 1000
debugPort: 0
network: "preview"
privateBindAddr: "127.0.0.1"
privatePort: 3002
relayPort: 3001
socketPath: "$HOME/dingo/dingo.socket"
# Total NtC connection limit. Dingo ignores non-positive values.
# CLI: --max-ntc-conns; environment: DINGO_MAX_NTC_CONNS
maxNtCConns: 100
# Per-IP NtC connection limit. Dingo ignores non-positive values.
# CLI: --max-ntc-connections-per-ip; environment: DINGO_MAX_NTC_CONNECTIONS_PER_IP
maxNtCConnectionsPerIP: 5

# Storage
barkBaseUrl: ""
barkPort: 0
storageMode: "core"

EOF
```

> `debugPort`を`0`に置き、profilingが要求されなければ残して下さい。`debugPort`は任意pprofのリスナーを制御し、`metricsPort`と別々にとどまり、`0`で無効に残ります。

> `healthPort` は `--health-port` か `DINGO_HEALTH_PORT` を使用します; `healthPort: 0` を健康のリスナーを無効にするために置きました。 `healthReadyGapSlots` は `--health-ready-gap-slots` か `DINGO_HEALTH_READY_GAP_SLOTS` を使用します。

> 現在、Barkは、現在のレジャー状態から近いチップ安全ウィンドウを導き出します。この設定では、マニュアル`barkSecurityWindow`値を探し、設定しないでください。

> REST API サーバーは、`storageMode: "api"` の外部に非アクティブにとどまり、`0` のポート値がその API を無効にします。

```yaml
midnight:
  # Enable the Midnight gRPC server independently of Midnight indexing.
  # Default: false.
  serverEnabled: false
  # Expose gRPC reflection. Requires serverEnabled. Default: false.
  reflectionEnabled: false
  # Permit plaintext listening on a non-loopback host. A configured TLS
  # certificate and key allow remote TLS exposure without this setting.
  # Default: false.
  allowInsecureRemote: false
  # Must be nonzero when serverEnabled is true. Default: 50051.
  port: 50051
  # Defaults to loopback; an empty value also uses 127.0.0.1.
  host: "127.0.0.1"
  authTokenPolicyId: ""
  authTokenAssetName: ""
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

> `midnight.serverEnabled: false` は、ミッドナイト gRPC リスナーを無効に保ちます。`midnight.port` を単独で設定することはそれを露出しません。

> `midnight.authTokenPolicyId` と `midnight.authTokenAssetName` を一緒に設定するか、unset を両方残します。 部分的なペアは、設定と起動の検証を失敗します。 設定されたポリシー ID は、正確に 56 個の 16 個の 16 個の 16 個の 16 個の 16 個のデコードされたバイト (28 個のデコードされたバイト) でなければなりません。 一致は、正確なポリシー ID とアセット名を使用します。

> `block-cache-size` と `index-cache-size` を 0 に設定すると、`compression: false` は、BadgerDB の内部キャッシュの代わりに OS ページのキャッシュ (mmap) を使用します。これによりメモリ使用量が劇的に低下します。

***

<br>

<a id="step-3---open-network-ports"></a>

## ステップ3 - ネットワーKupoートを開く

UFWファイアウォールのルールを設定して、Dingoで必要なポートを許可します。

> ▷ ヒント: UFW は、未コンパイルファイアウォールの略で、iptables (netfilter) ファイアウォールのルールを管理するために使用されます。

現在開いているポートを参照するには:

```
sudo ufw status numbered
```

<a id="add-port-3001-for-ouroboros-node-to-node-ntn-communication"></a>

#### Ouroboros Node-to-Node (NtN) 通信用ポート 3001 を追加

```
sudo ufw allow 3001/tcp
```

***

<br>

<a id="step-4---bootstrap-from-mithril-snapshot"></a>

## ステップ4 - MithrilスナップショットからBootstrap

Dingoは、自動的にスナップショットをダウンロードし、ロードする組み込みのMithrilクライアントを持っています。 これは、Genesisからチェーンを再生すると比較して、同期時間の時間を節約します。

`~/dingo`ディレクトリから次のコマンドを実行します。

```
cd ~/dingo
./dingo mithril sync --config ~/dingo/dingo.yaml
```

> 📝 生存性は `http://127.0.0.1:12799/health` または `http://127.0.0.1:12799/healthz`、準備状態は `http://127.0.0.1:12799/readyz` で確認します。`/health` と `/healthz` は、準備状態だけでなくイベントループの応答性を含む生存性を確認します。`/readyz` には設定した先端との隔たりの条件と、データベースの準備状態を満たす必要があります。ブロックプロデューサーでは、使用可能な生成資格情報を持つブロック生成処理が動作し、該当する場合はリモート KES も準備できている必要があります。先端との隔たりが不明または `healthReadyGapSlots` の範囲外なら未準備を報告します。コンテナのヘルスチェックはメトリクスではなく `/health` を使用します。`dingo mithril sync` の実行中もヘルスリスナーは利用可能です。

> リリース `mithril.downloadMaxTransientRetries` は、TLS のタイムアウト、HTTP 429 応答、HTTP 5xx 応答などのトランジェントのブートストラップのダウンロードの失敗をコントロールします。 例では、`10` のデフォルト値を使用します。

Dingo:
1. 設定されたネットワークで最新のMithrilスナップショットをダウンロード
2. 証明書チェーンの確認
3. スナップショットをデータベースにロードする

システムやネットワーク速度により約20～30分かかります。

> このステップをスキップすると、 Dingo は genesis から同期します。

***

<br>

<a id="step-5---start-dingo"></a>

## ステップ5 - Dingoを開始

Mithrilのスナップショットがロードされると、ノードを開始します。

```
cd ~/dingo
./dingo serve --config ~/dingo/dingo.yaml
```

ノードがピアに接続し、残りのブロックを同期してチェーンチップに到達するログ出力が表示されます。

***

<br>

<a id="interested-in-running-dingo-as-a-systemd-service"></a>

#### システムサービスとしてDingoを実行することに興味がありますか?

システムサービスを利用すると、システムが起動したときに自動的に Dingo を起動し、予期しないと再起動します。 [Dingo の起動サービスを作成するガイドを参照してください](../003-create-start-up-service)。

***

<br>

<a id="congratulations-your-dingo-node-is-now-running"></a>

### おめでとうございます! Dingo ノードが稼働中です。

[Cardano CLI](../004-using-dingo-with-cardano-cli)を使って Dingoとやり取りする方法を学びます。


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
