---
title: リファレンスガイド
description: cardano-upのコマンドリファレンスガイド。
---

# リファレンスガイド

cardano-upはCardanoサービスを管理するためのコマンドラインユーティリティです。cardano-upを使用すると、Dockerイメージを利用してCardanoサービスをインストールできます。

このガイドでは、cardano-upの仕組み、パッケージの管理、使用できるコマンドについてさらに詳しく説明します。

### クイックリンク:

[コマンドリファレンス](#1) | [一般的なcardano-upコマンド](#2) | [コンテキスト](#3)

***

<a name="1"></a>

## コマンドリファレンス

`cardano-up`コマンドは複数のサブコマンドで構成されています。引数なしで`cardano-up`を実行するか、`--help`オプションを使用すると、すべてのサブコマンドを一覧表示できます。

```
$ cardano-up
Usage:
  cardano-up [command]

Available Commands:
  completion     Generate the autocompletion script for the specified shell
  context        Manage the current context
  down           Stops all Docker containers
  help           Help about any command
  info           Show info for an installed package
  install        Install package
  list           List installed packages
  list-available List available packages
  logs           Show logs for an installed package
  uninstall      Uninstall package
  up             Starts all Docker containers
  update         Update the package registry cache
  upgrade        Upgrade package
  validate       Validate package file(s) in the given directory
  version        Displays the version

Flags:
  -D, --debug   enable debug logging
  -h, --help    help for cardano-up
  -v, --verbose Show all available versions of packages

Use "cardano-up [command] --help" for more information about a command.
```

***

<a name="2"></a>

## 一般的なcardano-upコマンド:

#### 利用可能なパッケージを一覧表示

cardano-upでインストールできる利用可能なパッケージ、つまりCardanoサービスを確認するには、以下のコマンドを実行します:

```
cardano-up list-available
```

![cardano-up-list-available](/cardano-up-list-available.png)

#### パッケージのインストール

> パッケージをインストールして操作するには、インストールされたコマンド/スクリプトをすぐに利用できるようにするため、シェルのRC/プロファイルに以下を追加して`~/.local/bin`を`$PATH`に追加する必要があります。
>
> ```
> export PATH=~/.local/bin:$PATH
> ```

パッケージをインストールするには、`cardano-up install (パッケージ名)`を実行します。この例では`cardano-node`をインストールします。

```
cardano-up install cardano-node
```

#### パッケージのアンインストール

パッケージをアンインストールするには、`cardano-up uninstall (パッケージ名)`を実行します。この例では`cardano-node`をアンインストールします。

```
cardano-up uninstall cardano-node
```

#### `down`

アクティブなコンテキスト内のパッケージの実行中のサービスをすべて停止します。

#### `help`

コマンドとサブコマンドの使用方法を表示します。

#### `info`

インストールされたパッケージの情報を表示します。名前、バージョン、コンテキスト名、インストール後のノートなどが含まれます。

#### `list`

アクティブなコンテキスト内のインストール済みパッケージを一覧表示します。`-A`オプションですべてのコンテキストを表示できます。

#### `logs`

アクティブなコンテキスト内の指定されたパッケージの実行中サービスのログを表示します。

#### `up`

アクティブなコンテキスト内のパッケージのすべてのサービスを開始します。

#### `update`

パッケージレジストリキャッシュを強制的に更新します。

#### `upgrade`

指定されたパッケージをアップグレードします。

#### `validate`

指定されたパスで定義されたパッケージを検証します。

#### `version`

バージョンを表示します。

***

<a name="3"></a>

## コンテキスト

コンテキストは、異なるネットワーク設定で同じパッケージの複数のコピーを並行してインストールすることを可能にします。これにより、同じマシン上で`preprod`と`mainnet`のCardanoノードを実行したり、異なるバージョンのノードを実行する複数の`preview` Cardanoノードインスタンスを持つことができます。

`install`、`uninstall`、`list`などのコマンドはアクティブなコンテキストで動作します。`context`コマンドを使用して、アクティブなコンテキストを変更したり、利用可能なコンテキストを管理できます。

`context`サブコマンドはコンテキストを管理します。さまざまなコンテキスト関連の機能のための独自のサブコマンドがあります。

#### `context create`

指定された名前で新しいコンテキストを作成します。オプションで説明とCardanoネットワークを指定できます。`-n`フラグでCardanoネットワークを指定し、`-d`フラグで説明を付けます。

この例では、新しいコンテキストを`dev`という名前で作成し、ネットワークを`preview`に設定し、説明を`preview test`とします。

```
cardano-up context create dev -n preview -d 'preview test'
```

![cardano-up-context-create-dev-sample](/cardano-up-context-create-dev-sample.png)

#### `context delete`

指定された名前のコンテキストが存在する場合、削除します。

```
cardano-up context delete contextName
```

この例では、コンテキストを`dev`という名前にしています。

![cardano-up-context-delete](/cardano-up-context-delete.png)

#### `context env`

アクティブなコンテキストの環境変数を出力します。

```
cardano-up context env
```

![cardano-up-context-env](/cardano-up-context-env.png)

#### `context list`

利用可能なコンテキストを一覧表示します。

```
cardano-up context list
```

![cardano-up-context-list](/cardano-up-context-list.png)


#### `context select`

アクティブなコンテキストを指定されたコンテキスト名に設定します。この例では`dev`コンテキストを選択します。

```
cardano-up context select dev
```

![cardano-up-context-select](/cardano-up-context-select.png)

***
