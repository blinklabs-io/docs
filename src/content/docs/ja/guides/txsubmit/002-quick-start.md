---
title: クイックスタートガイド
description: Tx Submit APIクイックスタート概要。
---

# クイックスタート

Tx Submit APIは、Go言語で書かれたCardanoトランザクション送信APIサービスです。HTTPを介してCBORエンコードされたトランザクションペイロードを受け取り、gOuroborosを使用してOuroboros NetworkのLocalTxSubmissionミニプロトコルに変換します。このプロジェクトはProject Catalyst Fund 9で資金提供されました。

Tx Submit APIはHTTPを介してトランザクションを送信するため、Cardanoブロックチェーンへのトランザクション送信をより高速に行うことができます。

blinklabs.ioからTx Submit APIのバイナリファイルをダウンロードして、ノードサーバーに配置します。その後、サーバーのコマンドラインでTx Submit APIを実行します。設定は設定ファイルまたは環境変数を使用して行うことができます。

開始するには、以下の手順に従ってください。

⚠️ このガイドは一般的なLinux Cardanoノードのセットアップを想定しています。必要に応じてコマンドとパスを調整してください。

***

## ステップ1 - Blinklabsからバイナリをダウンロード
<br>

**ステップ1-A** - まず、<a href="https://blinklabs.io/projects-open-source" target="_blank">https://blinklabs.io/projects-open-source</a>にアクセスし、Tx Submit APIまでスクロールします。

![txsubmit-blinklabs-site](/txsubmit-blinklabs-site.png)
<br>

**ステップ1-B** - ノードサーバーのオペレーティングシステムを選択します。

![txsubmit-blinklabs-site-operating-system](/txsubmit-blinklabs-site-operating-system.png)
<br>

**ステップ1-C** - バイナリファイルをダウンロードしてノードサーバーに移動するか、または...

![txsubmit-blinklabs-site-download](/txsubmit-blinklabs-site-download.png)

<br>

Blinklabsからパスをコピーし、以下のコマンドを実行してノードサーバーにバイナリファイルをダウンロードします。

![txsubmit-blinklabs-site-copy-link](/txsubmit-blinklabs-site-copy-link.png)

<br>

⚠️ ダウンロードするバージョンに応じてリンクパスを調整してください。

> 💡 ヒント: 最新のTx Submit APIリリースは<a href="https://github.com/blinklabs-io/tx-submit-api/releases" target="_blank">https://github.com/blinklabs-io/tx-submit-api/releases</a>ページからダウンロードできます。

```
wget -O - https://github.com/blinklabs-io/tx-submit-api/releases/download/v0.20.8/tx-submit-api-v0.20.8-linux-amd64 > tx-submit-api
```

***

## ステップ2 - パーミッションの変更

この例では、バイナリファイルを`tx-submit-api`という名前で`$NODE_HOME`フォルダに保存しました。ファイルを実行可能にするには、以下のコマンドを実行します：

⚠️ 必要に応じてファイルパスとファイル名を調整してください。

```
chmod +x $NODE_HOME/tx-submit-api
```

***

## ステップ3 - 選択したポートのファイアウォールを開く

選択したポートでファイアウォールが開いていることを確認してください。この例では、ポート8090を使用しました。ポート8090を開くには、以下のコマンドを実行します：

`
sudo ufw allow 8090/tcp
`

***

## ステップ4 - 設定ファイルのセットアップ

サンプルconfig.yaml：

```
node:
  network: mainnet
  port: 8090
  socketPath: /home/user/cardano-my-node/db/socket
```

***

💡 ヒント: ノードソケットのパスを見つけるには、以下のコマンドを実行します：

```
echo $CARDANO_NODE_SOCKET_PATH
```

<br>

設定ファイルの詳細な説明はこちらで確認できます: [https://github.com/blinklabs-io/tx-submit-api/blob/main/config.yaml.example](https://github.com/blinklabs-io/tx-submit-api/blob/main/config.yaml.example)

***

## ステップ5 - 設定ファイルでTx Submit APIを実行

コマンドラインフラグ`-config`を使用して設定ファイルを指定し、実行ファイルを実行します。

⚠️ 以下のファイルパスを`config.yaml`ファイルへのパスに合わせて調整してください。

```
cd $NODE_HOME
./tx-submit-api -config /path/to/config.yaml
```

![txsubmit-screen](/txsubmit-screen.png)

💡 ヒント: `control`+`z`を押してから`bg`と入力するとバックグラウンドで実行できます。`fg`を押すとフォアグラウンドに戻ります。

***



💡 ヒント: 以下のコマンドを使用してTx Submit APIが実行されていることを確認できます。必要に応じてポートを調整してください。

```
curl http://localhost:8090/healthcheck
```

### おめでとうございます！Tx Submit APIでトランザクションを送信する準備が整いました！

<br>

ウォレットを使用してTx Submit APIでトランザクションを送信するには、ウォレットの設定で`カスタム送信エンドポイント`を設定する必要があります。[Tx Submit APIを使用するためのウォレット設定](../003-setting-up-wallet-using-custom-submit-endpoint)ガイドをご覧ください。

