---
title: cardano-upの使い方
description: cardano-upの使い方ガイド。
---

# cardano-upを使用してCardanoサービスをインストール

cardano-upはCardanoサービスを管理するためのコマンドラインユーティリティです。cardano-upを使用すると、Dockerイメージを利用してCardanoサービスをインストールできます。

cardano-upを開いて、必要なCardanoサービスをインストールする方法を見ていきましょう。

> このガイドでは、すでにcardano-upバイナリをダウンロードし、Ubuntuアプリを開いていることを前提としています。まだの場合は、[クイックスタート](../002-quick-start-docker-desktop)ガイドをご覧ください。

***

## コンテキスト

パッケージのインストールを始める前に、`コンテキスト`とは何か、cardano-upがどのように使用するかを理解する必要があります。

コンテキストは、異なるネットワーク設定で同じパッケージの複数のコピーを並行してインストールすることを可能にします。これにより、同じマシン上で`preprod`と`mainnet`のCardanoノードを実行したり、異なるバージョンのノードを実行する複数の`preview` Cardanoノードインスタンスを持つことができます。

`install`、`uninstall`、`list`などのコマンドはアクティブなコンテキストで動作します。`context`コマンドを使用して、アクティブなコンテキストを変更したり、利用可能なコンテキストを管理できます。

`context`サブコマンドはコンテキストを管理します。さまざまなコンテキスト関連の機能のための独自のサブコマンドがあります。

このガイドでは、preprodネットワークに設定されているデフォルトコンテキストにインストールします。独自のコンテキストを作成する方法やネットワークを変更する方法については、[リファレンスガイド](../004-reference-guide)をご覧ください。

***

## パッケージのインストール

> パッケージをインストールして操作するには、インストールされたコマンド/スクリプトをすぐに利用できるようにするため、シェルのRC/プロファイルに以下を追加して`~/.local/bin`を`$PATH`に追加する必要があります。
>
> ```
> export PATH=~/.local/bin:$PATH
> ```

この例では、preprodネットワークに設定されているデフォルトコンテキストにパッケージをインストールします。

![cardano-up-context-list](/cardano-up-context-list.png)

インストールするパッケージはCardanoノードです。cardano-upを使用してCardanoノードをインストールするには、以下のコマンドを実行します:

```
cardano-up install cardano-node
```

![cardano-up-install-cardano-node](/cardano-up-install-cardano-node.png)

インストールが完了すると、「successfully installed」メッセージが表示されます。Cardanoノードに必要な以下のパッケージがインストールされたことがわかります: cardano-config、cardano-cli、mithril-client、およびcardano-node。

![cardano-up-install-cardano-node-success-message](/cardano-up-install-cardano-node-success-message.png)

> ヒント: Docker Desktopのコンテナの下にCardanoノードが表示されるようになりました。
>
> ![cardano-up-docker-desktop-cardano-node](/cardano-up-docker-desktop-cardano-node.png)

### おめでとうございます！cardano-upで初めてのCardanoパッケージをインストールし、使用できるDockerイメージの準備ができました！

コンテキスト内のパッケージを表示し、環境変数を出力し、cardano-cliを使用して現在のブロックチェーンチップを見つけてCardanoノードをテストしましょう。また、Cardanoノードと一緒に使用する別のパッケージをインストールしたい場合に備えて、インストール可能なパッケージも確認します。

## コンテキスト内のパッケージを表示

`cardano-up list`コマンドを使用して、デフォルトコンテキストにインストールされているパッケージを確認できます。

```
cardano-up list
```

![cardano-up-default-context-list](/cardano-up-default-context-list.png)

***

## 環境変数の出力

インストールされたパッケージによってエクスポートされた環境変数を環境に追加するには、シェルのRC/プロファイルに以下を追加します:

```
eval $(cardano-up context env)
```

これで`cardano-cli`を通常どおり実行できるようになります。Cardanoノードのチップを確認するには、以下を実行します:

```
cardano-cli query tip --testnet-magic 1
```

![cardano-up-eval-env-plus-tip](/cardano-up-eval-env-plus-tip.png)

> 注意: エラーが発生した場合は、Cardanoノードの同期が完了するまで待ってから実行する必要があるかもしれません。

***

## インストール可能なパッケージを表示

必要な、またはインストールしたい他のパッケージを確認しましょう。以下のコマンドを実行して、利用可能なパッケージを確認できます:

```
cardano-up list-available
```

![cardano-up-list-available](/cardano-up-list-available.png)

> ヒント: 特定のパッケージをインストールした場合にインストールされる必要なパッケージを確認できます。たとえば、Cardanoノードをインストールすると`Requires: cardano-config, cardano-cli and mithril-client`が必要であることがわかります。

![cardano-up-list-available-tip](/cardano-up-list-available-tip.png)

他に何ができるか、またはセットアップを微調整する方法については、[リファレンスガイド](../004-reference-guide)をご覧ください。
