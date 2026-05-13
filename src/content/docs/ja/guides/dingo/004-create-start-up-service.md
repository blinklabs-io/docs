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
# `mempoolCapacity` はモードの既定値を上書きする任意の設定です。
# 既定値: Praos モードと通常の serve モードでは 1 MiB、Leios モードでは 25 MiB です。
# モードの既定値を使うには、このキーをコメントアウトするか省略します。
# mempoolCapacity: 1048576

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

> 📝 Blockfrost互換のHTTPエンドポイントを必要とするオペレーターは、API対応のストレージに切り替え、`blockfrostPort`をゼロ以外の値に設定する必要があります。

```yaml
storageMode: "api"
blockfrostPort: 3000
```

***

<br>

## ステップ3 - Mithrilからのブートストラップ（初回実行のみ）

サービスを初めて起動する前に、Mithrilスナップショットからデータベースをブートストラップします：

```bash
dingo mithril sync --config /etc/dingo/dingo.yaml
```

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
