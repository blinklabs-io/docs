---
title: 設定ファイルガイド
description: nview - 設定（YAML）ファイルの使い方。
---

# 設定（YAML）ファイルの使用

実行中のCardanoノードに対してnviewを実行すると、デフォルトのCardanoノード設定でそのまま動作します。デフォルト設定では、特定のポートでPrometheus形式のメトリクスが公開されます。ただし、変更が必要な場合は、設定ファイルを使用してnviewを実行できます。

***

設定ファイルを使用するには、`-config`コマンドラインフラグを付けて`nview`を実行し、設定として読み込むファイルを指定します。

⚠️ 以下のファイルパスを`config.yml`ファイルへのパスに合わせて調整してください。

```
./nview -config /path/to/config.yml
```

***

<br>

サンプルconfig.yaml：

```
app:
  nodeName: Cardano Node
  network:
node:
  network: mainnet
  port: 3001
prometheus:
  host: 127.0.0.1
  port: 12798
  timeout: 3
```

***

<br>

設定ファイルの詳細な説明：

```

---
# nviewの設定ファイル例
# 以下に示す値はコード内のデフォルト値に対応しています

app:
  # ノードの表示名
  #
  # NODE_NAME環境変数でも設定できます
  nodeName: Cardano Node

  # cardano-nodeのCardanoネットワーク名
  #
  # これはNetworkMagicを選択するためのショートカットで、
  # mainnet、preprod、preview、またはsanchoネットワークを
  # 選択するために使用できます。
  #
  # NETWORK環境変数でも設定でき、以下のノード固有の設定を上書きします
  network:

node:
  # cardano-nodeのCardanoネットワーク名
  #
  # これはNetworkMagicを選択するためのショートカットで、
  # mainnet、preprod、preview、またはsanchoネットワークを
  # 選択するために使用できます。
  #
  # CARDANO_NETWORK環境変数でも設定できます
  network: mainnet

  # cardano-nodeのネットワーク用NetworkMagic
  #
  # これは操作用の正しいネットワークを選択し、
  # 名前付きネットワークだけでなく任意のネットワークに設定できます。
  #
  # CARDANO_NODE_NETWORK_MAGIC環境変数でも設定できます
  networkMagic:

  # cardano-nodeのポート
  #
  # NtN通信用のcardano-nodeのリスニングポート。
  #
  # CARDANO_PORT環境変数でも設定できます
  port: 3001

  # cardano-nodeのソケットパス
  #
  # NtC通信用のcardano-nodeのリスニングUNIXソケットパスとファイル名。
  #
  # CARDANO_NODE_SOCKET_PATH環境変数でも設定できます
  socketPath:

prometheus:
  # cardano-node Prometheusメトリクス用のホスト/ポート
  #
  # PROM_HOSTおよびPROM_PORT環境変数でも設定できます
  host: 127.0.0.1
  port: 12798

  # cardano-nodeへの接続タイムアウト
  #
  # PROM_TIMEOUT環境変数でも設定できます
  timeout: 3

```

<br>

### おめでとうございます！独自の設定ファイルを使用してnviewでノードの監視を開始する準備ができました！
