---
title: クイックスタートガイド
description: nviewクイックスタートの概要。
---

# クイックスタート

nviewは、Cardanoノード（cardano-node）のローカル監視ツールで、リモート監視ツールを補完し、コマンドラインから実行中のノードのローカルビューを提供することを目的としています。これは、ほとんどの画面に収まるように設計されたTUI（ターミナルユーザーインターフェース）です。

blinklabs.ioからnviewのバイナリファイルをノードサーバーにダウンロードするだけです。そして、サーバーのコマンドラインでnviewを実行します。使い方はとても簡単で、すぐに監視を開始できます！

以下の手順に従って始めましょう

***


## ステップ1 - Blinklabsからバイナリをダウンロード
<br>

**ステップ1-A** - まず、<a href="https://blinklabs.io/projects-open-source" target="_blank">https://blinklabs.io/projects-open-source</a>にアクセスし、nviewまでスクロールします。

![nview-blinklabs-site](/nview-blinklabs-site.png)
<br>

**ステップ1-B** - ノードサーバーのオペレーティングシステムを選択します。

![nview-blinklabs-site-operating-system](/nview-blinklabs-site-operating-system.png)
<br>

**ステップ1-C** - バイナリファイルをダウンロードしてノードサーバーに移動するか、または...

![nview-blinklabs-site-download](/nview-blinklabs-site-download.png)

<br>

Blinklabsからパスをコピーし、以下のコマンドを実行してノードサーバーにバイナリファイルをダウンロードします

![nview-blinklabs-site-copy-link](/nview-blinklabs-site-copy-link.png)
<br>

⚠️ ダウンロードしたいバージョンに合わせてリンクパスを調整してください。

> 💡 ヒント：最新のnviewリリースは<a href="https://github.com/blinklabs-io/nview/releases" target="_blank">https://github.com/blinklabs-io/nview/releases</a>ページからダウンロードできます。

```
wget -O - https://github.com/blinklabs-io/nview/releases/download/v0.10.7/nview-v0.10.7-linux-amd64 > nview
```

***


## ステップ2 - 権限の変更

この例では、バイナリファイルを`nview`と名付け、`$NODE_HOME`フォルダに保存しました。ファイルを実行可能にするには、以下のコマンドを実行します：

⚠️ 必要に応じてファイルパスとファイル名を調整してください。

```
chmod +x $NODE_HOME/nview
```


***


## ステップ3 - nviewの実行

以下のコマンドを実行して実行可能ファイルを実行します。

⚠️ この例では、バイナリファイルを`nview`と名付け、`$NODE_HOME`フォルダに保存しました。

```
cd $NODE_HOME
./nview
```

![nview-screen](/nview-screen.png)

***


### おめでとうございます！nviewを使用してノードの監視を開始する準備ができました！

実行中のCardanoノードに対してnviewを実行すると、デフォルトのCardanoノード設定でそのまま動作します。ただし、変更が必要な場合は、設定ファイルを使用してnviewを実行できます。

nviewの設定ファイルを調整したいですか？nviewの[設定ファイルガイド](../003-using-config-file)をご覧ください。
