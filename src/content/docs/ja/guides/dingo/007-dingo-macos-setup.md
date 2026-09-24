---
title: Dingo macOS ネイティブコンテナセットアップ
description: AppleのネイティブコンテナランタイムでDingoを実行し、macOSでAdderを使って検証します。
---

# Dingo macOS ネイティブコンテナセットアップ

## 概要

このガイドでは、AppleのネイティブコンテナランタイムでDingoを実行し、Dingoが公開するUNIXソケットを使用してmacOS上でAdderをネイティブ実行する方法を説明します。ヘルパースクリプトはコンテナとソケットのライフサイクルを管理し、`preview`ネットワークで検証を実行します。

## 前提条件

次の環境が必要です。

- macOS
- `apple/container`をインストールして動作する環境。[公式の`apple/container`ビルド手順](https://github.com/apple/container#building-from-source)を参照してください。
- `scripts/container-dingo-start.sh`および`scripts/container-dingo-stop.sh`のヘルパースクリプトを含むAdderリポジトリ

コマンドはAdderリポジトリのルートから実行します。このセットアップではリポジトリからAdderを実行するため、インストールまたはビルドのコマンドは含まれません。

## 接続トポロジー

次の接続経路を使用します。

1. DingoはLinuxコンテナ仮想マシン内で実行され、`/ipc/node.socket`を作成します。
2. `apple/container`は`--publish-socket`を使用して、そのソケットをmacOSホストの`~/dingo-ipc/node.socket`として公開します。
3. AdderはmacOS上でネイティブ実行され、公開されたホストソケットに接続します。

## Dingoを起動する

リポジトリのルートからmacOS用ヘルパーを起動します。

```bash
./scripts/container-dingo-start.sh
```

ヘルパーはAppleのコンテナサービスを起動し、以前の`dingo`コンテナを停止して削除し、`~/dingo-ipc`を作成して内容を消去した後、`ghcr.io/blinklabs-io/dingo:0.70.9`を起動します。Dingoは`/ipc/node.socket`を通じて`preview`ネットワークを提供し、ヘルパーはそのパスをmacOS上の`~/dingo-ipc/node.socket`として公開します。

ヘルパーはホストソケットの準備が完了するまで待機し、その後Adderのコマンドを表示します。

## Adderをネイティブ実行する

Dingoが接続を受け付けていることをヘルパーが報告したら、リポジトリのルートからAdderを実行します。

```bash
go run ./cmd/adder --input chainsync \
  --input-chainsync-socket-path ~/dingo-ipc/node.socket \
  --input-chainsync-network preview \
  --input-chainsync-intersect-tip=true \
  --output log
```

`preview`ネットワークと`--input-chainsync-intersect-tip=true`フラグは、このセットアップで使用する検証設定です。`--output log`フラグはAdderの出力をターミナルに書き込みます。

## セットアップを停止する

検証が完了したら、リポジトリのルートから停止ヘルパーを実行します。

```bash
./scripts/container-dingo-stop.sh
```

ヘルパーは`dingo`コンテナを停止して削除し、`~/dingo-ipc`の内容を削除して、Appleのコンテナシステムサービスを停止します。

## 起動に失敗した場合

ソケットの準備が完了する前に起動が失敗した場合、起動ヘルパーは起動途中の`dingo`コンテナを停止して削除し、公開されたソケットファイルを削除します。表示された問題を修正してから、起動ヘルパーを再実行します。