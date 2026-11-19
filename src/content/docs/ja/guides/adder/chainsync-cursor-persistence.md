---
title: "ChainSyncカーソル永続化リファレンス"
description: "ChainSyncカーソルをSQLiteに保存し、再起動後の同期位置を復元する方法を説明します。"
---

# ChainSyncカーソル永続化リファレンス

## 概要

ChainSyncのカーソル永続化は任意の機能です。このページでは、SQLiteファイルの設定、再起動とロールバック時の動作、Go APIの利用方法を説明します。

## オペレーター設定

### CLIで有効にする

SQLiteファイルの保存先を`--input-chainsync-state-path`で指定します。

```sh
adder \
  --input chainsync \
  --input-chainsync-state-path /var/lib/adder/chainsync-state.db
```

運用環境では、Adderの実行ユーザーが読み書きでき、再起動後も保持されるローカルパスを使用します。1つのSQLiteファイルを複数のChainSyncインスタンスで共有する場合は、各インスタンスに固有の状態キーを設定してください。

### YAMLで有効にする

YAML設定では、`plugins.input.chainsync.state-path`にSQLiteファイルのパスを指定します。

```yaml
plugins:
  input:
    chainsync:
      state-path: "/var/lib/adder/chainsync-state.db"
```

`state-path`を設定しない場合、または空の値を指定した場合、ChainSyncはカーソルを保存しません。無効な状態では、再起動時に永続化されたカーソルを読み込まず、通常の交差点設定を使用します。

### 起動時の優先順位

保存済みカーソルがある場合、ChainSyncはノードへの接続前にそのカーソルを読み込みます。保存済みカーソルは、次の交差点設定より優先されます。

- `--input-chainsync-intersect-tip`
- `--input-chainsync-intersect-point`

保存済みカーソルがない場合、設定した交差点がそのまま使用されます。

設定の優先順位は、CLIフラグ > 環境変数 > YAML設定 > デフォルト値です。ChainSyncの各入力設定については、[コマンドリファレンスガイド](/ja/guides/adder/006-command_list/#input-chainsync)を参照してください。

## 再起動とロールバック

### 保存対象とフラッシュ

ChainSyncは、ブロックに関連するすべてのイベントを正常に出力した後で、そのブロックのカーソルを保存対象にします。まだ出力していないブロックのカーソルは保存しません。

ChainSyncは次のタイミングで保存対象のカーソルをSQLiteファイルへフラッシュします。

- 通常の実行中は5秒ごと
- シャットダウン時

この動作により、再起動後の開始位置は最後に出力したブロックを基準にします。

### ロールバック

ロールバックが発生すると、ChainSyncは保留中のカーソルをロールバック後も残る最後の出力済みブロックまで巻き戻します。次回のフラッシュでは、ロールバックされたブロックより先のカーソルを保存しません。

### 再起動

再起動時、ChainSyncは保存済みカーソルを読み込み、そのブロックから同期を再開します。保存済みカーソルは設定済みの`--input-chainsync-intersect-tip`または`--input-chainsync-intersect-point`より優先されます。永続化を無効にした場合、この読み込みと保存は発生せず、従来どおり設定済みの交差点から開始します。

カーソルの永続化は同期位置を保存する機能であり、出力配信を正確に一度だけ実行する機能ではありません。カーソルのフラッシュと出力先への配信は同時に確定する仕組みではないため、出力側では再起動後の重複イベントを処理できるようにします。

## Go API

Goインテグレーションでは、`WithStateStore`を使用して`state.Store`を実装するカスタムまたは共有ストアをChainSyncに渡します。

```go
WithStateStore(store)
```

同じストアファイルを複数のChainSyncインスタンスで共有する場合は、`WithStateKey`で各インスタンスに固有のキーを指定します。

```go
WithStateKey("chainsync-cursor-worker-a")
```

`WithStateKey`を指定しない場合のデフォルトキーは`chainsync-cursor`です。共有ファイル内でキーが重複するとカーソルが衝突するため、インスタンスごとに異なるキーを使用します。

ChainSyncは状態ストアの所有権を次のように扱います。

- `--input-chainsync-state-path`からChainSyncが開いたSQLiteストアは、ChainSyncが所有します。ChainSyncは実行終了時にそのストアを閉じ、次の実行時に再び開きます。
- `WithStateStore`で呼び出し側が渡した共有ストアは、呼び出し側が所有します。ChainSyncは`Stop`または`StartRun`の終了時に共有ストアを閉じません。

この所有権の区別により、複数のChainSyncインスタンスが同じカスタムストアを使用しながら、それぞれのカーソルを`WithStateKey`で分離できます。

## 関連情報

- [ChainSync入力設定とコマンド一覧](/ja/guides/adder/006-command_list/#input-chainsync)

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
