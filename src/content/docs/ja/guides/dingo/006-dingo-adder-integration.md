---
title: DingoとAdderの統合
description: Docker Composeを使用してCardanoのpreviewネットワーク上でAdderをDingoに対して検証します。
---

# DingoとAdderの統合

## 概要

このガイドでは、Cardanoの`preview`ネットワーク上でDingoノードに対するAdderのイベントストリームを検証します。Docker Composeは両サービスを起動し、共有UNIXソケットで接続します。

## アーキテクチャ

検証スタックには次の2つのサービスがあります。

- `dingo`は`ghcr.io/blinklabs-io/dingo:0.70.9`を実行し、Node-to-Node（NtN）通信でCardanoの`preview`ネットワークを同期して、`/ipc/node.socket`を作成します。
- `adder`は`config-preview.yaml`を読み込み、Node-to-Client（N2C）プロトコルでDingoに接続し、ブロックイベントとロールバックイベントをログに出力します。

Docker Composeは名前付き`dingo-ipc`ボリュームを両コンテナの`/ipc`にマウントし、`dingo-data`をDingoの`/data`にマウントします。共有`dingo-ipc`ボリュームによって`/ipc/node.socket`をAdderから利用でき、`dingo-data`はコンテナの再起動間でDingoデータを保持します。

## 前提条件

- Docker ComposeをサポートするDocker
- Adderリポジトリのチェックアウト
- Adderリポジトリのルートにある`docker-compose.yml`と`config-preview.yaml`

このガイドのすべてのコマンドは、Adderリポジトリのルートから実行します。

## Preview設定

`config-preview.yaml`ファイルは、次の検証値でAdderを設定します。

```yaml
input: chainsync
output: log

plugins:
  input:
    chainsync:
      network: preview
      socket-path: /ipc/node.socket
      intersect-tip: true
      include-cbor: false
      auto-reconnect: true
      delay-confirmations: 0
```

Adderでは、Composeが`config-preview.yaml`を`/config/config-preview.yaml`として渡します。

## 検証スタックの起動

次のコマンドで両コンテナをビルドしてバックグラウンドで起動します。

```bash
docker compose up --build -d
```

Dockerは最初に`dingo`サービスを起動し、その後、共有ソケットボリュームを使用して`adder`を起動します。

## 接続の確認

Adderのログを確認し、N2C接続とブロックイベントの出力を検証します。

```bash
docker compose logs adder
```

出力で、Adderが`/ipc/node.socket`を介して接続し、ブロックイベントを出力していることを確認します。チェーンがロールバックすると、Dingoもロールバックイベントを出力します。

空の検証ボリュームでは、Dingoがgenesisから起動します。そのため、Adderはgenesisでintersectionを実行し、Dingoの同期に合わせてblock 1からブロックを処理します。

Dingoがブロックを同期した後、`adder`だけを再起動して、アクティブなDingo tipでのintersectionを検証します。

```bash
docker compose restart adder
docker compose logs adder
```

`intersect-tip: true`設定により、Adderはblock 1から再開せず、アクティブなDingo tipから処理を再開します。

統合したサービスログで運用上の異常を検索します。

```bash
docker compose logs | grep -iE "error|panic|warn|reconnect"
```

## 停止とクリーンアップ

次のコマンドでサービスを停止し、名前付き検証ボリュームを削除します。

```bash
docker compose down -v
```

このコマンドは`dingo-ipc`と`dingo-data`のボリュームを削除します。そのため、次回のスタック起動ではクリーンな検証状態が始まります。Dockerは各サービスに`json-file`ログドライバー、最大ファイルサイズ`5m`、最大2個のログファイルを設定します。