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

⚠️ お使いのシステムに合わせて、バージョン（以下の例ではv0.35.1）とアーキテクチャを調整してください。

```
mkdir -p ~/dingo
cd ~/dingo
wget https://github.com/blinklabs-io/dingo/releases/download/v0.35.1/dingo-v0.35.1-linux-amd64.tar.gz -O - | tar -xz
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
# `mempoolCapacity` はモードの既定値を上書きします。
# 既定値: Praos / 通常の serve モードでは 1 MiB、Leios モードでは 25 MiB。
# モードの既定値を使うには、このキーをコメントアウトしたままにするか省略します。
# mempoolCapacity: 1048576

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

> 💡 Blockfrost互換のHTTPエンドポイントを提供するには、`storageMode`をAPI対応の設定に切り替え、ゼロ以外の`blockfrostPort`を割り当てます。

```yaml
blockfrostPort: 3000
storageMode: "api"
utxorpcPort: 0
```

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
[Dingoのスタートアップサービスを作成する方法についてのガイドを参照してください](../004-create-start-up-service)。

***

<br>

### おめでとうございます。Dingoノードを使用する準備が整いました！

[Cardano CLIを使用してDingoと対話する方法を学ぶ](../003-using-dingo-with-cardano-cli)。
