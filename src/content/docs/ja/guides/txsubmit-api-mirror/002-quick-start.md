---
title: クイックスタートガイド
description: Tx Submit API Mirrorクイックスタートガイド。
---

# クイックスタート

Tx Submit API Mirrorは、設定されたバックエンドの送信APIサービスにすべての受信リクエストを非同期でミラーリングする、シンプルなCardanoトランザクション送信APIサービスです。

CBORエンコードされたCardanoトランザクションをペイロードボディとして受け取り、1つ以上の設定されたバックエンドトランザクション送信APIサービスに送信するシンプルなHTTP APIです。

blinklabs.ioからTx Submit API Mirrorのバイナリファイルをダウンロードし、ノードサーバーに配置します。設定は設定ファイルまたは環境変数を使用して行えます。

開始するには、以下の手順に従ってください。

⚠️ このガイドは一般的なLinux Cardano Nodeの構成を前提としています。必要に応じてコマンドやパスを調整してください。

<br>

> 💡 ヒント: まだCardano Nodeをお持ちでない場合は、[cardano-up](../../cardano-up/001-cardano-up)をお試しください。

***

## ステップ1 - Blinklabsからバイナリをダウンロード
<br>

**ステップ1-A** - まず、<a href="https://blinklabs.io/projects-open-source" target="_blank">https://blinklabs.io/projects-open-source</a>にアクセスし、Tx Submit API Mirrorまでスクロールしてください。

![txsubmit-mirror-blinklabs-site](/txsubmit-mirror-blinklabs-site.png)
<br>

**ステップ1-B** - ノードサーバーのオペレーティングシステムを選択してください。

![txsubmit-mirror-blinklabs-site-operating-system](/txsubmit-mirror-blinklabs-site-operating-system.png)
<br>

**ステップ1-C** - バイナリファイルをダウンロードしてノードサーバーに移動するか、または...

![txsubmit-mirror-blinklabs-site-download](/txsubmit-mirror-blinklabs-site-download.png)

<br>

Blinklabsからパスをコピーし、以下のコマンドを実行してノードサーバーにバイナリファイルをダウンロードしてください。

<br>

⚠️ ダウンロードしたいバージョンの正しいパスにリンクを調整してください。

> 💡 ヒント: 最新のTx Submit API Mirrorリリースは<a href="https://github.com/blinklabs-io/tx-submit-api-mirror/releases" target="_blank">https://github.com/blinklabs-io/tx-submit-api-mirror/releases</a>ページからダウンロードできます。

```
wget -O - https://github.com/blinklabs-io/tx-submit-api-mirror/releases/download/v0.8.1/tx-submit-api-mirror-v0.8.1-linux-amd64 > tx-submit-api-mirror
```

***

## ステップ2 - パーミッションの変更

この例では、バイナリファイルを`tx-submit-api-mirror`という名前で`$NODE_HOME`フォルダに保存しました。ファイルを実行可能にするには、以下のコマンドを実行してください:

⚠️ 必要に応じてファイルパスとファイル名を調整してください。

```
chmod +x $NODE_HOME/tx-submit-api-mirror
```

***

## ステップ3 - 選択したポートでファイアウォールを開放

選択したポートでファイアウォールが開いていることを確認してください。この例ではポート8090を使用しています。ポート8090を開くには、以下のコマンドを実行します:

`
sudo ufw allow 8090/tcp
`

***

## ステップ4 - 設定ファイルのセットアップ

config.yamlのサンプル:

```
node:
  network: mainnet
  port: 8090
  socketPath: /home/user/cardano-my-node/db/socket
  backends: http://tx1, http://tx2, http://tx3
```

✅ `BACKENDS`はCardanoトランザクション送信サービスAPIのURIをカンマ区切りで指定したリストです。

***

💡 ヒント: ノードソケットのパスを見つけるには、以下のコマンドを実行してください:

```
echo $CARDANO_NODE_SOCKET_PATH
```

<br>

設定ファイルや環境変数の詳細については、こちらをご覧ください: [https://github.com/blinklabs-io/tx-submit-api-mirror](https://github.com/blinklabs-io/tx-submit-api-mirror)

***

## ステップ5 - 設定ファイルを使用してTx Submit Mirror APIを実行

実行ファイルを実行する際に、コマンドラインフラグ`-config`を使用して設定ファイルを指定します。

⚠️ 以下のファイルパスを`config.yaml`ファイルのパスに合わせて調整してください。

```
cd $NODE_HOME
./tx-submit-api-mirror -config /path/to/config.yaml
```

💡 ヒント: `control`+`z`を押してから`bg`と入力するとバックグラウンドで実行できます。`fg`でフォアグラウンドに戻せます。

***

<br>

💡 ヒント: 以下のコマンドを使用して、Tx Submit Mirror APIが実行されていることを確認できます。必要に応じてポートを調整してください。

```
curl http://localhost:8090/healthcheck
```

### おめでとうございます！Tx Submit Mirror APIを使用してトランザクションを送信する準備が整いました！

<br>

## ステップ6 - Tx Submit Mirror URLにトランザクションを送信

Tx Submit Mirror APIのURLにトランザクションを送信してください。URLは`http://192.0.2.0:8090/api/submit/tx`のようになります。⚠️ 必要に応じてIPアドレスとポートを調整してください。

この実装はIOHKのHaskell実装とAPIスペックを共有しています。同じ手順が適用されます。[トランザクションのビルドと送信](https://github.com/input-output-hk/cardano-node/tree/master/cardano-submit-api#build-and-submit-a-transaction)の手順に従ってください。
