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

## ステップ1 - Blinklabsからバイナリをダウンロード
<br>

**ステップ1-A** - まず、<a href="https://blinklabs.io/projects-open-source" target="_blank">https://blinklabs.io/projects-open-source</a>にアクセスし、Dingoまでスクロールします。

![dingo-blinklabs-site](/dingo-blinklabs-site.png)
<br>


**ステップ1-B** - Dingoを実行するオペレーティングシステムを選択します。

![dingo-blinklabs-site-operating-system](/dingo-blinklabs-site-operating-system.png)
<br>

**ステップ1-C** - バイナリファイルをダウンロードして、お好みの場所に移動するか、または...

![dingo-blinklabs-site-download](/dingo-blinklabs-site-download.png)

<br>

Blinklabsからパスをコピーし、以下のコマンドを実行してバイナリファイルをダウンロードします。

<br>

⚠️ ダウンロードしたいバージョンに応じてリンクパスを調整してください。

> 💡 ヒント: 最新のDingoリリースは<a href="https://github.com/blinklabs-io/dingo/releases" target="_blank">https://github.com/blinklabs-io/dingo/releases</a>ページからダウンロードできます。


Dingoバイナリをダウンロードする前に、Dingo関連ファイル用の`dingo`ディレクトリを作成します。

```
mkdir dingo
cd dingo
wget https://github.com/blinklabs-io/dingo/releases/download/v0.15.1/dingo-v0.15.1-linux-amd64.tar.gz -O - | tar -xz
```

***

<br>

## ベストプラクティス - Dingoの実行に必要なファイル
Dingoを実行するには以下のファイルが必要です。次のいくつかのステップで、ファイルのダウンロードと編集について説明します。
1. dingo.yaml
2. Node Config
3. Node Topology
4. Byron Genesis
5. Shelley Genesis
6. Alonzo Genesis
7. Conway Genesis

## ステップ2 - dingo.yamlサンプルファイルのダウンロード

このガイドではdingo.yamlファイルを使用します。以下のコマンドを使用して、メインのdingoディレクトリにダウンロードします：
```
wget -O - https://raw.githubusercontent.com/blinklabs-io/dingo/refs/heads/main/dingo.yaml.example > dingo.yaml
```

***

<br>

## ステップ3 - ディレクトリの作成と設定ファイルのダウンロード

Cardano設定ファイルを保存するディレクトリを作成します。この例では、`dingo`ディレクトリ内で以下のコマンドを実行して、`/config/cardano/preview/`というファイル構造を作成します：

```
mkdir -p config/cardano/preview
```

次に、`config/cardano/preview`フォルダに移動し、Cardano設定ファイルをダウンロードします

```
cd config/cardano/preview
```

以下のコマンドを実行して、Cardano Preview TestnetのNon-block-producers設定ファイルをダウンロードします：

```
wget https://book.play.dev.cardano.org/environments/preview/config.json
```

次に、以下のコマンドを実行してPreview Testnetのトポロジーファイルをダウンロードします：

```
wget https://book.play.dev.cardano.org/environments/preview/topology.json
```

✅ この例では、ノードを実行して同期するために、以下に示すデフォルトのトポロジーファイルを使用します。Dingoは現行のトポロジーファイルとレガシーのトポロジーファイルの両方をサポートしています。

```
{
  "bootstrapPeers": [
    {
      "address": "preview-node.play.dev.cardano.org",
      "port": 3001
    }
  ],
  "localRoots": [
    {
      "accessPoints": [],
      "advertise": false,
      "trustable": false,
      "valency": 1
    }
  ],
  "publicRoots": [
    {
      "accessPoints": [],
      "advertise": false
    }
  ],
  "useLedgerAfterSlot": 73267000
}
```

最後に、Byron、Shelley、Alonzo、Conway Genesisファイルをダウンロードします

```
wget https://book.play.dev.cardano.org/environments/preview/byron-genesis.json \
https://book.play.dev.cardano.org/environments/preview/shelley-genesis.json \
https://book.play.dev.cardano.org/environments/preview/alonzo-genesis.json \
https://book.play.dev.cardano.org/environments/preview/conway-genesis.json
```

> 💡 ヒント: Cardano設定ファイルは<a href="https://book.play.dev.cardano.org/environments.html" target="_blank">https://book.play.dev.cardano.org/environments.html</a>で見つけることができます

***

<br>

## ステップ4 - dingo.yamlファイルの編集

必要な設定ファイルが揃ったので、dingo.yamlファイルを編集して正しいディレクトリとファイルを指定します。このファイルを編集するには、以下を実行します：

```
cd ~/dingo
nano dingo.yaml
```

> ✅ この例では、dingo.yamlファイルをメインのdingoディレクトリに保存しているため、`cd ~/dingo`を使用してそのディレクトリに戻ります。必要に応じてパスとファイル名を調整してください。

#### dingo.yamlにパスを追加
トポロジーファイルへのパスを追加し、Cardano config.jsonファイルへのパスを確認します。`./config/cardano/preview`以外のパスを使用した場合は、必要に応じて調整してください。

```
# Example config file for dingo
# The values shown below correspond to the in-code defaults

# Public bind address for the Dingo server
bindAddr: "0.0.0.0"

# Path to the Cardano node configuration file
#
# Can be overridden with the config environment variable
cardanoConfig: "./config/cardano/preview/config.json"

# A directory which contains the ledger database files
databasePath: ".dingo"

# Path to the UNIX domain socket file used by the server
socketPath: "dingo.socket"

# Name of the Cardano network
network: "preview"

# TLS certificate file path (for HTTPS)
#
# Can be overridden with the TLS_CERT_FILE_PATH environment variable
tlsCertFilePath: ""

# TLS key file path (for HTTPS)
#
# Can be overridden with the TLS_KEY_FILE_PATH environment variable
tlsKeyFilePath: ""

# Path to the topology configuration file for Cardano node
topology: "./config/cardano/preview/topology.json"

# TCP port to bind for Prometheus metrics endpoint
metricsPort: 12798

# Internal/private address to bind for listening for Ouroboros NtC
privateBindAddr: "127.0.0.1"

# TCP port to bind for listening for Ouroboros NtC
privatePort: 3002

# TCP port to bind for listening for Ouroboros NtN
#
# Can be overridden with the port environment variable
relayPort: 3001

# TCP port to bind for listening for UTxO RPC
utxorpcPort: 9090

# Ignore prior chain history and start from current tip (default: false)
# This is experimental and may break — use with caution
intersectTip: false

# Maximum cache size in bytes used by BadgerDB for block/index cache
# Default: 1073741824 (1 GB)
badgerCacheSize: 1073741824

# Maximum total size (in bytes) of all transactions allowed in the mempool.
# Transactions exceeding this limit will be rejected.
# Default: 1048576 (1 MB)
mempoolCapacity: 1048576
```

***

<br>

## ステップ5 - ポートの開放
UFWファイアウォールルールのリストと追加方法について説明します。必要に応じて調整してください。

> 💡ヒント: UFWはUncomplicated Firewallの略で、iptables（netfilter）ファイアウォールルールの管理に使用されます。

現在開いているポートを確認するには、以下を実行します：

```
sudo ufw status numbered
```

#### Ouroboros Node to Node（NtN）通信用のポート3001を追加
チェーンを同期し、ノード間でデータを渡すために、ポート3001（または選択したポート）を開く必要があります。ポート3001を開くには、以下を実行します：

```
sudo ufw allow 3001/tcp
```
<!--

#### Prometheusメトリクス用のポート12798を追加（オプション）
Grafanaなどのツールを使用してメトリクスを追跡したい場合は、ポート12798（または選択したポート）を開く必要があります。ポート12798を開くには、以下を実行します：

```
sudo ufw allow 12798/tcp
```

-->

#### UTxO RPC用のポート9090を追加（オプション）
チェーンデータやトランザクションにアクセスしたい場合は、UTxO RPC用のポート9090（または選択したポート）も追加することをお勧めします。ポート9090を開くには、以下を実行します：

> ⚠️ このポートをローカルマシン外に公開する場合は注意してください。

```
sudo ufw allow 9090/tcp
```

***

<br>

## ステップ6 - Mithrilクライアントを使用したブロックチェーン同期のブートストラップ（オプション）
Mithrilクライアントを使用してMithrilスナップショットをダウンロードすることで、ブロックリプレイとも呼ばれるブロックの初期同期を高速化できます。これにより、数時間の同期時間を節約できます。

<br>

#### ステップ6.1 - Mithrilフォルダの作成
dingoフォルダ内にmithrilバイナリをダウンロードするためのフォルダを作成します。dingoフォルダ内にフォルダを作成するには、以下を実行します：

```
cd ~/dingo
mkdir mithril
```

<br>

#### ステップ6.2 - Mithrilクライアントのダウンロード
以下のコマンドを実行してMithrilクライアントバイナリをダウンロードできます：

⚠️ ダウンロードしたいバージョンに応じてリンクパスを調整してください。

> 💡 ヒント: 最新のMithrilリリースは<a href="https://github.com/input-output-hk/mithril/releases" target="_blank">https://github.com/input-output-hk/mithril/releases</a>ページからダウンロードできます。

```
cd mithril
wget https://github.com/input-output-hk/mithril/releases/download/2524.0/mithril-2524.0-linux-x64.tar.gz -O - | tar -xz
```

<br>

#### ステップ6.3 - 環境変数のエクスポート
Mithrilスナップショットをダウンロードするために、以下の環境変数をエクスポートします。これらのコマンドを実行してください：

Previewネットワーク変数：

```
export NETWORK=preview
```

エンドポイント変数：

```
export AGGREGATOR_ENDPOINT=https://aggregator.pre-release-preview.api.mithril.network/aggregator
```

Genesis検証キー変数：
```
export GENESIS_VERIFICATION_KEY=$(curl -s https://raw.githubusercontent.com/input-output-hk/mithril/main/mithril-infra/configuration/pre-release-preview/genesis.vkey)
```

<br>

#### ステップ6.4 - 最新スナップショットの検索とダウンロード

> 💡 ヒント: Mithrilは現在のフォルダにdb/ディレクトリを作成します。この場合、作成した`mithril`フォルダ内に作成されます。

まず、以下を実行して現在のスナップショット一覧を取得します

```
./mithril-client cardano-db snapshot list
```

現在のスナップショットを確認するには、以下を実行します：

```
./mithril-client cardano-db snapshot show latest
```

以下を実行して現在のスナップショットをダウンロードします：

```
./mithril-client cardano-db download latest
```

これには時間がかかります。システムによっては、previewネットワークで最大10分程度かかる場合があります。画面で進行状況を確認できます。

<br>

#### ステップ6.5 - スナップショットをDingo dbにロード
以下を実行してdingoディレクトリに戻ります：

```
cd ~/dingo
```

以下のコマンドを実行して、MithrilスナップショットをDingoにロードします：

```
./dingo load ~/dingo/mithril/db/immutable
```

Dingoは、レジャーリプレイを実行してブロックをコピーしてロードすることにより、ブロックをdingoデータベースにロードします。システムによっては、これにも時間がかかります（最大2時間程度）。

![dingo-load-snapshot](/dingo-load-snapshot.png)

> 📝 Mithrilスナップショットをロードしない場合は、`./dingo`コマンドでDingoを起動し、通常のchainsyncプロセスを開始できます。Mithrilスナップショットを使用する場合よりも、チェーンの同期に数時間長くかかります。

***

<br>

#### コンピューターが再起動したときにDingoノードを自動的に再起動して稼働時間を最大化するためのsystemdサービスの使用に興味がありますか？
[Dingoのスタートアップサービスを作成する方法についてのガイドを参照してください](../004-create-start-up-service)。

***

<br>

### おめでとうございます。Dingoノードを使用する準備が整いました！

[Cardano CLIを使用してDingoと対話する方法を学ぶ](../003-using-dingo-with-cardano-cli)。
