---
title: node-parity CLIリファレンス
description: Dingoのnode-parity CLIでノードの台帳状態を比較する方法を説明する。
---

# node-parity CLIリファレンス

このページでは、`node-parity` CLIを使用して、Dingoと参照用の`cardano-node`の台帳状態を比較する方法を説明します。

## 前提条件

- Dingoと`cardano-node`のNode-to-Clientエンドポイントを、比較の前に起動しておきます。`node-parity`はどちらのノードも起動または管理しません。
- `--network`には`preview`または`preprod`を指定します。
- `--dingo-addr`と`--cardano-addr`を必ず指定します。各値には`host:port`形式のTCPエンドポイント、または`/`で始まるUnixソケットパスを指定できます。

## 共通フラグ

`check`と`watch`では、次のフラグを使用します。

- `--network`（必須）: `preview`または`preprod`を指定します。
- `--dingo-addr`（必須）: DingoのNode-to-Clientエンドポイントを指定します。
- `--cardano-addr`（必須）: `cardano-node`のNode-to-Clientエンドポイントを指定します。
- `--metrics-addr`: `watch`のPrometheusメトリクス提供アドレスを指定します。既定値は`:9464`です。空の値を指定するとメトリクスを無効にします。このフラグは`check`では使用しません。

## `watch`コマンド

`watch`は、いずれかのノードのチェーン先端が変化したときに比較を実行します。次の例では、環境に合わせてプレースホルダーを置き換えます。

```bash
./node-parity watch \
  --network <preview-or-preprod> \
  --dingo-addr <dingo-host>:<port> \
  --cardano-addr <cardano-host>:<port> \
  --mode incremental \
  --cursor-file <cursor-file-path>
```

### 比較モード

`--mode`には`full`または`incremental`を指定します。既定値は`incremental`です。従来どおり全体比較を使用する場合は、`--mode full`を明示的に指定します。これ以外の値を指定すると、`watch`はエラーを返します。

### `incremental`モード

`incremental`モードでは、次のフラグを指定します。

- `--cursor-file`（必須）: 検証済みの位置を再起動後も保持する運用ファイルのパスを指定します。指定しない場合、`watch`はエラーを返します。
- `--full-check-interval`: 全体比較を実行する間隔をブロック数で指定します。既定値は`1000`ブロックです。`0`または負の値は指定できません。
- `--full-check-timeout`: 起動時または定期的に実行する全体比較の制限時間を指定します。既定値は`20m`です。正の値を指定する必要があります。

```bash
./node-parity watch \
  --network preview \
  --dingo-addr 127.0.0.1:3002 \
  --cardano-addr /var/lib/cardano/node.socket \
  --mode incremental \
  --cursor-file /var/lib/node-parity/cursor \
  --full-check-interval 1000 \
  --full-check-timeout 20m
```

### `full`モード

`full`モードでは、全体比較を実行する間隔と、1回の比較に許可する時間を次のフラグで指定します。どちらも正の値を指定する必要があります。

- `--fallback-interval`: ブロックの変化がない場合にも安全策として比較を実行する間隔を指定します。既定値は`2m`です。
- `--check-timeout`: 1回の全体比較の制限時間を指定します。既定値は`20m`です。

```bash
./node-parity watch \
  --network preprod \
  --dingo-addr 127.0.0.1:3002 \
  --cardano-addr 127.0.0.1:3003 \
  --mode full \
  --fallback-interval 2m \
  --check-timeout 20m
```

> **重要:** `--at-slot`と`--at-hash`は`watch`では使用できません。`watch`は過去の位置を指定した比較を拒否するため、履歴上の位置を比較する場合は`check`を使用します。

## `check`コマンドと過去の位置

`check`は1回の比較を実行します。`--at-slot`と`--at-hash`を省略すると、両ノードの現在のチェーン先端を比較します。

過去の位置を指定する場合は、`--at-slot`と`--at-hash`を必ず一緒に指定します。片方だけを指定すると、`check`はエラーを返します。`--at-hash`には16進数のブロックハッシュを指定し、デコード後の長さを正確に32バイトにします。つまり、64桁の16進数が必要です。

```bash
./node-parity check \
  --network preview \
  --dingo-addr 127.0.0.1:3002 \
  --cardano-addr /var/lib/cardano/node.socket \
  --at-slot <slot> \
  --at-hash <64桁の16進数>
```

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>