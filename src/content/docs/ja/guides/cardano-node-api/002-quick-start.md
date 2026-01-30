---
title: クイックスタートガイド
description: Cardano Node APIクイックスタート概要。
---

# クイックスタート

ローカルのCardanoノードとインターフェースし、ノード内部データをHTTPクライアントに提供するHTTP APIです。このサービスは、UNIXソケットを介してOuroborosネットワークプロトコルを使用してCardanoフルノードと通信し、基盤となるNode-to-Client（NtC）Ouroborosミニプロトコルをクライアントに対してREST APIまたはUTxO RPC gRPC APIとして公開します。

<br>

Cardano Node APIは、Goで記述されたサービスで、プライベートインターフェースを介してCardanoノードと通信し、協調標準に基づいた機能豊富なHTTP APIセットを提供します。

<br>

blinklabs.ioからCardano Node APIのバイナリファイルをノードサーバーにダウンロードするだけです。その後、サーバーのコマンドラインでCardano Node APIを実行します。設定は、設定ファイルまたは環境変数を使用して行うことができます。この例では、設定ファイルを使用して実行します。

<br>

以下の手順に従って開始してください

<br>

⚠️ このガイドは、一般的なLinux Cardanoノードのセットアップを想定しています。必要に応じてコマンドとパスを調整してください。

***

<br>

## ステップ 1 - Blinklabsからバイナリをダウンロード
<br>

**ステップ 1-A** - まず、<a href="https://blinklabs.io/projects-open-source" target="_blank">https://blinklabs.io/projects-open-source</a>にアクセスし、Cardano Node APIまでスクロールダウンします。

![cardano-node-api-blinklabs-site](/cardano-node-api-blinklabs-site.png)
<br>

**ステップ 1-B** - ノードサーバーのオペレーティングシステムを選択します。

![cardano-node-api-blinklabs-site-operating-system](/cardano-node-api-blinklabs-site-operating-system.png)
<br>

**ステップ 1-C** - バイナリファイルをダウンロードしてノードサーバーに移動するか、または...

![cardano-node-api-blinklabs-site-download](/cardano-node-api-blinklabs-site-download.png)

<br>

Blinklabsからパスをコピーして、以下のコマンドを実行し、ノードサーバーにバイナリファイルをダウンロードします

![cardano-node-api-blinklabs-site-copy-link](/cardano-node-api-blinklabs-site-copy-link.png)

<br>

⚠️ ダウンロードするバージョンに合わせてリンクパスを調整してください。

> 💡 ヒント: 最新のCardano Node APIリリースは、<a href="https://github.com/blinklabs-io/cardano-node-api/releases" target="_blank">https://github.com/blinklabs-io/cardano-node-api/releases</a>ページからダウンロードできます。

```
wget -O - https://github.com/blinklabs-io/cardano-node-api/releases/download/v0.9.0/cardano-node-api-v0.9.0-linux-amd64 > cardano-node-api
```

***

<br>

## ステップ 2 - パーミッションの変更

<br>

この例では、バイナリファイルを`cardano-node-api`という名前にして、`$NODE_HOME`フォルダに保存しました。ファイルを実行可能にするには、以下のコマンドを実行します：

<br>

⚠️ 必要に応じてファイルパスとファイル名を調整してください。

```
chmod +x $NODE_HOME/cardano-node-api
```

***

<br>

## ステップ 3 - 選択したポートでファイアウォールを開放

<br>

選択したポートでファイアウォールが開いていることを確認してください。この例では、ポート8080を使用しました。ポート8080を開放するには、以下のコマンドを実行します：

```
sudo ufw allow 8080/tcp
```

***

<br>

## ステップ 4 - 設定ファイルのセットアップ

<br>

サンプルconfig.yaml:

```
node:
  network: mainnet
  port: 8080
  socketPath: /home/user/cardano-my-node/db/socket
```

<br>

***

💡 ヒント: ノードソケットへのパスを見つけるには、以下のコマンドを実行します：

```
echo $CARDANO_NODE_SOCKET_PATH
```

<br>

設定ファイルの詳細な説明はこちらにあります: [https://github.com/blinklabs-io/cardano-node-api/blob/main/config.yaml.example](https://github.com/blinklabs-io/cardano-node-api/blob/main/config.yaml.example)


***

<br>

## ステップ 5 - 設定ファイルを使用してCardano Node APIを実行

<br>

コマンドラインフラグ`-config`を使用して、設定として読み込むファイルを指定し、実行ファイルを実行します。

⚠️ 以下のファイルパスを、`config.yaml`ファイルへのパスに合わせて調整してください。

```
cd $NODE_HOME
./cardano-node-api -config /path/to/config.yaml
```

<br>

💡 ヒント: `control`+`z`を押してから`bg`と入力すると、バックグラウンドで実行できます。`fg`を押すとフォアグラウンドに戻ります。

***

<br>


💡 ヒント: IP:port/swagger/index.htmlにアクセスして、Cardano Node APIを確認できます。必要に応じてIPとポートを調整してください。

```
http://192.0.2.0:8080/swagger/index.html
```

<br>

![cardano-node-api-swagger](/cardano-node-api-swagger.png)

<br>

### おめでとうございます、Cardano Node APIを使用する準備ができました！

<br>

UTxO RPCについて詳しくはこちら [https://utxorpc.org](https://utxorpc.org/)


