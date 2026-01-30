---
title: クイックスタートガイド
description: TxTopクイックスタート概要。
---

# クイックスタート

TxTopはCardano Nodeソフトウェア用のmempoolインスペクターです。

TxTopは、Cardano Node（cardano-node）のローカル監視ツールとして使用でき、実行中のノードのmempoolトランザクションをローカルで表示し、シンプルなアイコンレジェンドによって一目でトランザクションを分類できます。

blinklabs.ioからTxTopのバイナリファイルをノードサーバーにダウンロードするだけです。その後、サーバーのコマンドラインでTxTopを実行します。これだけでCardano Nodeのmempoolをシンプルなアイコンで一目で確認できます！

開始するには、以下の手順に従ってください

***

## ステップ1 - Blinklabsからバイナリをダウンロード
<br>

**ステップ1-A** - まず、<a href="https://blinklabs.io/projects-open-source" target="_blank">https://blinklabs.io/projects-open-source</a> にアクセスし、TxTopまでスクロールします。

![txtop-blinklabs-site](/txtop-blinklabs-site.png)
<br>

**ステップ1-B** - ノードサーバーのオペレーティングシステムを選択します。

![txtop-blinklabs-site-operating-system](/txtop-blinklabs-site-operating-system.png)
<br>

**ステップ1-C** - バイナリファイルをダウンロードしてノードサーバーに移動するか、または...

![txtop-blinklabs-site-download](/txtop-blinklabs-site-download.png)

<br>

Blinklabsからパスをコピーし、以下のコマンドを実行してノードサーバーにバイナリファイルをダウンロードします

![txtop-blinklabs-site-copy-link](/txtop-blinklabs-site-copy-link.png)
<br>

⚠️ ダウンロードするバージョンに合わせてリンクパスを調整してください。

> 💡 ヒント: 最新のTxTopリリースは <a href="https://github.com/blinklabs-io/txtop/releases" target="_blank">https://github.com/blinklabs-io/txtop/releases</a> ページからダウンロードできます。

```
wget -O - https://github.com/blinklabs-io/txtop/releases/download/v0.13.0/txtop-v0.13.0-linux-amd64 > txtop
```

***

## ステップ2 - パーミッションの変更

この例では、バイナリファイルを`txtop`という名前で`$NODE_HOME`フォルダに保存しました。ファイルを実行可能にするには、以下のコマンドを実行します：

⚠️ 必要に応じてファイルパスとファイル名を調整してください。

```
chmod +x $NODE_HOME/txtop
```

***

## ステップ3 - txtopを実行

以下のコマンドを実行して、実行可能ファイルを起動します。

⚠️ この例では、バイナリファイルを`txtop`という名前で`$NODE_HOME`フォルダに保存しました。

```
cd $NODE_HOME
./txtop
```

![txtop-screen](/txtop-screen.png)

***

### おめでとうございます！TxTopでmempoolトランザクションの検査を開始する準備が整いました！

<br>

#### 💡 ヒント: TxTopはソケットを使用してCardanoノードに接続します。
ユーザーは環境変数を通じてこれらの変数を設定し、動作を変更できます。

- `NETWORK`, `CARDANO_NETWORK` - ネットワーク名を設定します。両方が指定された場合、NETWORKが優先されるため、`cardano-node`コンテナでそのまま動作します。デフォルトはmainnetです
- `CARDANO_NODE_NETWORK_MAGIC` - （オプション）ネットワークマジックを手動で設定
- `CARDANO_NODE_SOCKET_PATH` - ノードのUNIXソケットへのパスを設定します。NETWORKが設定されていない場合は/opt/cardano/ipc/socket、設定されている場合は/ipc/node.socketがデフォルトです
- `CARDANO_NODE_SOCKET_TCP_HOST` - NtC通信（socat）用のTCPホストを設定します。デフォルトは空です
- `CARDANO_NODE_SOCKET_TCP_PORT` - NtC通信（socat）用のTCPポートを設定します。デフォルトは30001です
