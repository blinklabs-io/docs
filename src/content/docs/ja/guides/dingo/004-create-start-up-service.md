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

***

<br>

## ステップ1 - Dingoとdingo.yamlファイルの移動

ベストプラクティス: Dingoを起動するために`systemd`を使用するため、Dingoバイナリを`/usr/local/bin/`に、dingo.yamlを`/etc/dingo/`ディレクトリに移動します。以下を実行してください：

<br>

> ⚠️ 以下のパスを調整してください。パスは[クイックスタート](../002-quick-start-overview)ガイドと`USER=test`に基づいています。
>
> 💡 ヒント: Dingoバイナリへのパスを見つけるには、Dingoバイナリディレクトリに移動し、`realpath dingo`コマンドを実行します。

```
sudo mv /home/test/dingo/dingo /usr/local/bin/
```
<br>

> ✅ `which dingo`を実行して、Dingoバイナリが移動されたことを確認できます

<br>

次に、`/etc/dingo/`ディレクトリを作成します：

```
sudo mkdir /etc/dingo/
```

<br>

その後、dingo.yamlファイルを`/etc/dingo/`に移動します：

```
sudo mv /home/test/dingo/dingo.yaml /etc/dingo/
```

***

<br>

## ステップ2 - dingo.yamlファイルのパスを編集

次に、dingo.yamlファイルを編集して、yamlを`/etc/dingo/`に移動したため、以下のパスを更新します。

<br>

以下のパスを編集する必要があります：`cardanoConfig:`、`databasePath:`、`socketPath:`、`topology:`。

✅ ユーザー名とディレクトリに一致する正しいパスに必要に応じて調整してください。

```
# Example config file for dingo
# The values shown below correspond to the in-code defaults

# Public bind address for the Dingo server
bindAddr: "0.0.0.0"

# Path to the Cardano node configuration file
#
# Can be overridden with the config environment variable
cardanoConfig: "/home/test/dingo/config/cardano/preview/config.json"

# A directory which contains the ledger database files
databasePath: "/home/test/dingo/dingo"

# Path to the UNIX domain socket file used by the server
socketPath: "/home/test/dingo.socket"

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
topology: "/home/test/dingo/config/cardano/preview/topology.json"

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

## ステップ3 - dingo.serviceユニット設定ファイルの作成

次に、`systemd`によって実行されるdingo.serviceユニット設定ファイル（「サービス」ファイル）を作成します。

> ⚠️ 以下の`User=`行を調整してください。
> [クイックスタート](../002-quick-start-overview)ガイドではユーザー`test`を使用しました。これをあなたのユーザー名に調整してください。
>
> 💡 ヒント: `echo $USER`コマンドを実行してユーザー名を確認できます。

```
cat <<'ENDFILE' >> /tmp/dingo.service
[Unit]
Description=Dingo Node
After=network-online.target

[Service]
Type=simple
Restart=on-failure
RestartSec=10
User=test
ExecStart=/usr/local/bin/dingo
SyslogIdentifier=dingo
TimeoutStopSec=3

[Install]
WantedBy=multi-user.target
ENDFILE
```

***

<br>

## ステップ4 - dingo.serviceの移動

dingo.serviceを`/etc/systemd/system/`に移動して、systemd経由で操作できるようにします：

```
sudo mv /tmp/dingo.service /etc/systemd/system/
```

***

<br>



## ステップ5 - サービスの有効化と開始

次に、起動時にサービスが実行されるように有効化し、サービスを開始します：

```
sudo systemctl enable dingo.service
```

次に：

```
sudo systemctl start dingo.service
```

***

<br>

## ステップ6 - ステータスの確認

以下を実行して、dingo.serviceがアクティブであることを確認できます：

```
sudo systemctl status dingo.service
```

エラーが発生した場合は、以下のコマンドを使用してエラーログを確認できます：

```
journalctl -u dingo.service
```

***

<br>

### おめでとうございます。Dingoのスタートアップサービスを設定しました！
