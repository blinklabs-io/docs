---
title: DingoでCardano CLIを使用する
description: Dingo - DingoでCardano CLIを使用する方法。
---

Dingoは、Go言語で書かれたCardanoブロックチェーンデータノードであり、Ouroboros Network Node-to-Nodeミニプロトコルファミリーを使用して、Cardanoブロックチェーン上のネットワーク通信に積極的に参加します。

⚠️ これは開発中のプロジェクトであり、現在活発に開発が進められています

<br>

***

このガイドでは、Cardano CLIバイナリのダウンロードと実行、およびいくつかのCardano CLIコマンドの実行方法について説明します。以下の手順に従って始めましょう。

<br>

> ✅ このガイドでは、すでにDingoをダウンロードしてチェーンを同期していることを前提としています。まだの場合は、[クイックスタート](../002-quick-start-overview)ガイドを参照してください。

***

<br>

## ステップ1 - 最新のCardano CLIバイナリをダウンロード

まず、Cardano CLIリポジトリの<a href="https://github.com/IntersectMBO/cardano-cli/releases" target="_blank">https://github.com/IntersectMBO/cardano-cli/releases</a>ページにアクセスします。

バイナリファイルをダウンロードして、お好みの場所に移動するか、または...

<br>

最新のCardano CLIバイナリファイルへのパスをコピーし、以下のコマンドを実行してバイナリファイルをダウンロードします。

<br>

⚠️ この例では、Cardano-cliバイナリを`dingo`フォルダに配置します。ダウンロードしたいバージョンに応じてリンクパスを調整してください。

```
cd ~/dingo
wget https://github.com/IntersectMBO/cardano-cli/releases/download/cardano-cli-10.11.1.0/cardano-cli-10.11.1.0-x86_64-linux.tar.gz -O - | tar -xz
```

***

<br>

## ステップ2 - ファイル名の変更とCardano CLIの権限変更

この例では、バイナリファイルを`cardano-cli`という名前にします。バイナリの名前を変更するには、以下を実行します：

⚠️ 必要に応じてファイルパスとファイル名を調整してください。

```
mv cardano-cli-x86_64-linux cardano-cli
```

<br>

ファイルを実行可能にするには、以下のコマンドを実行します：

```
chmod +x cardano-cli
```

***

<br>

#### おめでとうございます。これでcardano-cliを使用してノードと通信できます。

<br>

## ステップ3 - Cardano CLIコマンドを実行してTipをクエリ
Dingoノードを使用してデータを提供し、previewブロックチェーンのTipをクエリする最初のCardano CLIコマンドを実行しましょう。

以下のコマンドを実行してTipをクエリします：

```
./cardano-cli query tip \
--testnet-magic 2 \
--socket-path dingo.socket
```
> ⚠️ 上記のsocket-pathは、Cardano CLIをdingoフォルダにダウンロードしたことを前提としています。cardano-cliバイナリを別の場所に配置した場合は、パスを調整してください。`realpath dingo.socket`を使用して、dingo.socketへの絶対パスを見つけることができます。

![dingo-query-tip](/dingo-query-tip.png)

***

<br>

## ステップ4 - 環境変数の使用（オプション）
cardano-cliコマンドを実行するたびにCardanoノードネットワークとCardanoノードソケットを指定する代わりに、環境変数を使用できます。

<br>

### 現在のセッションの環境変数を設定（オプション1）

以下のコマンドを実行して、現在のセッションの変数をエクスポートできます。

ソケットパス：

```
export CARDANO_NODE_SOCKET_PATH=~/dingo/dingo.socket
```

ノードネットワーク：

```
export CARDANO_NODE_NETWORK_ID=2
```

<br>

### 環境変数を永続的に設定（オプション2）
セッション間で環境変数を永続化するには、シェルの設定ファイルに追加する必要があります。

ソケットパス：

```
echo CARDANO_NODE_SOCKET_PATH=~/dingo/dingo.socket >> ~/.bashrc
```

ノードネットワーク：

```
echo export CARDANO_NODE_NETWORK_ID=2 >> ~/.bashrc
```

***

<br>

> 💡 ヒント: 以下は現在のネットワークIDです
> ```
> # SanchoNet testnet
> export CARDANO_NODE_NETWORK_ID=4
>
> # Preview testnet
> export CARDANO_NODE_NETWORK_ID=2
>
> # Pre-production testnet
> export CARDANO_NODE_NETWORK_ID=1
>
> # Mainnet
> export CARDANO_NODE_NETWORK_ID=mainnet
> ```

***

<br>

### おめでとうございます。Cardano CLIでDingoノードを使用する準備が整いました！
Cardano CLIの詳細については、[https://developers.cardano.org](https://developers.cardano.org/docs/get-started/cli-operations/basic-operations/get-started/)を参照してください。
