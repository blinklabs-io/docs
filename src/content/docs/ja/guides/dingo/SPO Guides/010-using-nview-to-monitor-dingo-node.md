---
title: "nview を使用して Dingo ノードを監視"
description: "Dingo プールのSPOガイド - あなたの Dingo Nodesを監視するためにnviewを使用する方法。"
---

nview は Cardano Node のローカル監視ツールで、コマンドラインから実行中のノードのローカルビューを提供することで、リモート監視ツールを補完することを目的としています。ほとんどの画面に適した TUI (ターミナルユーザーインターフェイス) です。

ノードサーバーにblinklabs.ioから`nview`バイナリファイルをダウンロードするだけです。 その後、サーバーコマンドラインで`nview`を実行します。 使いやすいですし、箱からすぐに監視します!

スタートするには、以下の手順に従ってください。

## ステップ1 - Blink Labsからnviewバイナリをダウンロード
Blink Labs GitHub からダウンロード URL をコピーし、ノード サーバーで次のコマンドを実行します。

⚠️ ダウンロードしたいバージョンとアーキテクチャに合わせてダウンロードURLを調整します。

> ◀ ヒント: <a href="https://github.com/blinklabs-io/nview/releases" target="_blank">https://github.com/blinklabs-io/nview/releases</a>ページから最新のnviewリリースをダウンロードできます。

```
cd ~/dingo
wget -O - https://github.com/blinklabs-io/nview/releases/download/v0.15.0/nview-v0.15.0-linux-amd64 > nview
```

***


## ステップ2 - 権限の変更

この例では、バイナリファイル `nview` を名前付け、`$DINGO_HOME` ディレクトリに保存します。

バイナリ実行可能にするには、次のコマンドを実行します。

⚠️ 必要に応じてファイルパスとファイル名を調整します。

```
chmod +x $DINGO_HOME/nview
```


***


## ステップ3 - `nview`を実行します

`nview`を実行します:

この例では、`nview`バイナリは`$DINGO_HOME`ディレクトリにあります。

```
cd $DINGO_HOME
./nview
```

<!-- ![nview-screen](/nview-screen.png) ONCE UPDATED I WILL INSERT DINGO SCREENSHOT -->

***


### おめでとうございます!nview を使って Dingo ノードを監視できるようになりました。

Dingo Node に対する `nview` を実行すると、デフォルトノードの設定でボックスから動作します。ただし、変更が必要な場合は、nview を構成ファイルで実行できます。

`nview`の設定をカスタマイズしたいですか? [nview設定ファイル](../../../nview/003-using-config-file)を使用してガイドを参照してください。
