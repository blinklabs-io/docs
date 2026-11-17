---
title: Dingo preview N2C 検証
description: Dingo と Adder を Cardano preview ネットワークで接続して検証する方法。
---

# Dingo preview N2C 検証

このガイドでは、`preview` ネットワーク上の Dingo Go Cardano ノードに Adder のイベントストリーミングパイプラインを接続し、Node-to-Client（N2C）接続と ChainSync の動作を検証する方法を説明します。Docker Compose を使用する方法と、macOS で `apple/container` を使用して Dingo のソケットを Adder に公開する方法を扱います。

## 1. Docker と Compose のローカル環境を準備

Docker Compose は、Dingo と Adder の両方を実行します。Dingo は `ghcr.io/blinklabs-io/dingo:0.70.9` イメージで `preview` ネットワークに接続し、`/ipc/node.socket` に UNIX ソケットを作成します。Dingo と Adder は、`dingo-ipc` という名前付きボリュームを `/ipc` にマウントするため、Adder は同じ `/ipc/node.socket` を使用して Dingo に接続できます。

各コンテナのログは、ホストのディスク使用量が無制限に増加しないように、1 ファイルあたり 5MB、最大 2 ファイルに制限されています。

### スタックを起動

リポジトリのワークツリーで次のコマンドを実行し、コンテナをバックグラウンドで起動します。

```bash
docker compose up --build -d
```

---

## 2. Docker でリアルタイム検証を実行

### ステップ A: 接続と intersection を確認

`config-preview.yaml` のデフォルト設定では、`intersect-tip: true` を有効にしています。この設定により、Adder は Genesis（slot 0）から開始する代わりに、Dingo ノードが現在報告している tip で ChainSync intersection を実行します。

1. **初回同期を確認します。** 空のノードは genesis を報告する場合があり、同期中のノードはより古い tip を報告する場合があります。最初の slot は Dingo の現在の同期状態によって異なります。

   Dingo が起動し、Adder が UNIX ドメインソケットに正常に接続し、intersection handshake を完了してブロックを処理していることを確認します。

   ```bash
   docker compose logs adder | tail -n 20
   ```

   接続成功の記録と `BLOCK` レコードを確認します。README には [テキストイベント形式](../README.md#log-output-plugin) が記載されています。`TX`、`GOVERNANCE`、`ROLLBACK` もイベント形式に含まれます。イベントレコードを出力するには、ログレベルに `info` または `debug` が必要です。

2. **ChainSync intersection（active tip）を検証します。** スタックを起動したまま、Dingo がいくつかのブロックを同期するまで待ちます（例: slot 100 以上）。その後、`adder` サービスだけを再起動します。

   ```bash
   docker compose restart adder
   ```

   ログを再度確認します。

   ```bash
   docker compose logs adder | tail -n 20
   ```

   Adder が Dingo ノードの報告した tip で新しい intersection を要求することを確認します。再起動の前後で直近の slot を比較してください。イベントが直ちに到着するとは限りません。また、rollback によって slot が小さくなる場合があります。

### ステップ B: 「通常と異なる状態」を確認

必要な時点で次の 1 行コマンドを実行すると、通常の運用出力を絞り込み、デシリアライズの失敗、ネットワーク切断のループ、再起動などの異常を確認できます。

```bash
docker compose logs | grep -iE "error|panic|warn|reconnect"
```

---

## 3. Docker の終了とクリーンアップ

検証が完了したら、コンテナを停止します。次のコマンドは Dingo のデータベースを含む名前付きボリュームも削除します。ボリュームを保持する場合は `-v` を省略します。

```bash
docker compose down -v
```

---

## 4. macOS で Adder をネイティブ実行

ヘルパーは [apple/container](https://github.com/apple/container) の `--publish-socket` を使用して、Dingo の `/ipc/node.socket` を `~/dingo-ipc/node.socket` として公開します。Adder は Mac 上でネイティブな Go プロセスとして動作するため、ローカルデバッガーを接続できます。

![ネイティブの Adder がホストのソケットリレーを通じて Dingo のゲストソケットに接続](diagrams/dingo-macos.svg)

```text
 ┌────────────────────────── macOS Host ──────────────────────────┐
 │                                                                │
 │  ┌───────────────── Container VM (Linux) ─────────────────┐    │
 │  │                                                        │    │
 │  │  ┌──────────────┐                                      │    │
 │  │  │  Dingo Node  │                                      │    │
 │  │  └──────┬───────┘                                      │    │
 │  └─────────┼──────────────────────────────────────────────┘    │
 │            │ (Creates Socket at /ipc/node.socket)              │
 │            ▼                                                   │
 │    [ ~/dingo-ipc/node.socket File ]  ◄── Host UNIX Socket      │
 │                                          Exposed by            │
 │            ▲                             Hypervisor Socket     │
 │            │                             Relay Path            │
 │            │ (Connects/Dials UNIX Socket)                      │
 │  ┌─────────┴─────────┐                                         │
 │  │  Adder Pipeline   │  ◄── Running natively as standard Go    │
 │  │  (Standard Go)    │      process on Mac (e.g. in VS Code)   │
 │  └───────────────────┘                                         │
 └────────────────────────────────────────────────────────────────┘
```

### macOS でネイティブ実行する手順

#### ステップ A: `apple/container` をインストール

macOS システムにツールをコンパイルしてインストールします。[apple/container Building from Source](https://github.com/apple/container#building-from-source) の公式手順に従ってください。

#### ステップ B: ネイティブソケットブリッジで Dingo を起動

リポジトリのルートには `./scripts/container-dingo-start.sh` ヘルパースクリプトがあります。このスクリプトは Apple のネイティブコンテナサービスを起動し、ホスト側のソケットディレクトリを作成して、Dingo コンテナを自動的に起動します。

```bash
./scripts/container-dingo-start.sh
```

#### ステップ C: macOS ホストで Adder をネイティブ実行

Mac 上のディスクにあるブリッジ済み UNIX ソケットファイルを指定し、macOS の Go プロセスとして Adder を直接実行します。

```bash
# Execute Adder on Mac from the repository root, connecting directly to the
# bridged socket file (this command is also printed by the start script!)
go run ./cmd/adder --config config-preview.yaml --input chainsync \
  --input-chainsync-socket-path ~/dingo-ipc/node.socket \
  --input-chainsync-network preview \
  --input-chainsync-intersect-tip=true \
  --output log
```

#### ステップ D: 終了とクリーンアップ

Dingo を正常に停止し、ローカルのソケットファイルを削除して、Apple のバックグラウンドコンテナデーモンを停止するには、停止用ヘルパースクリプトを実行します。

```bash
./scripts/container-dingo-stop.sh
```

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
