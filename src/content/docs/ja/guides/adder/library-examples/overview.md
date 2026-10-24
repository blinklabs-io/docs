---
title: Go ライブラリの使用例
description: Adder ライブラリのプログラムとマネージドプラグインのテンプレートをダウンロードして実行します。
sidebar:
  order: 1
---

[Go サンプルの完全なバンドル](/downloads/adder/library-examples/adder-library-examples.tar.gz)をダウンロードするか、
[ソースファイル](https://github.com/blinklabs-io/docs/tree/main/public/downloads/adder/library-examples/source)を参照してください。
バンドルは Adder のコミット `e6f733d318eb` に固定されており、Apache-2.0 ライセンスを含みます。
Adder のチェックアウトとは独立してビルドできます。

<a id="setup"></a>

## セットアップ

Go 1.26.8 以降をインストールし、バンドルを展開します。

```sh
tar -xzf adder-library-examples.tar.gz
cd adder-library-examples
go mod download
export CARDANO_NODE_SOCKET_PATH=/path/to/node.socket
go run ./adder-publisher
```

3 つのプログラムには、ローカルの Unix ソケットを備え、メインネットに同期した Cardano ノードが必要です。
既定値は `/ipc/node.socket` とメインネットのマジック値 `764824073` です。
Preview では `CARDANO_NODE_MAGIC=2` を設定し、`CARDANO_NODE_SOCKET_PATH` で Preview ノードを指定します。
Preprod ではマジック値 `1` と Preprod ノードを使用します。ChainSync はこれらの既知のマジック値から、
ステータス計算に用いるエポック履歴を判断します。

カスタムネットワークでは、`main.go` の `inputOpts` に `input_chainsync.WithEraHistory` を追加します。
ネットワークのジェネシスと時代の境界に一致する `ByronEpochLength`、`ShelleyStartSlot`、
`ShelleyStartEpoch`、`ShelleyEpochLength` を持つ `input_chainsync.EraHistory` を渡してください。
プログラムが読み取るのは 2 つの `CARDANO_NODE_*` 変数のみです。カスタムの時代履歴はソースで設定します。

TCP で接続するには、ソース内の `WithSocketPath` を `WithAddress` に置き換えます。
Node-to-Node ChainSync は一括同期を使用するため、自分で管理するノードにのみ接続してください。

<a id="examples"></a>

## 使用例

- [イベントの発行](/ja/guides/adder/library-examples/adder-publisher/): ChainSync イベントを受信し、ログに記録します。
- [ステークプールフィルター](/ja/guides/adder/library-examples/poolid-filter/): 2 つのプール ID のいずれかを監視します。
- [アドレスとアセットのフィルター](/ja/guides/adder/library-examples/event-address-filter/): トランザクション、アドレス、アセットのフィルターを組み合わせます。
- [マネージドプラグイン](/ja/guides/adder/library-examples/plugins/): キャンセル、再起動、障害処理、イベントの所有権を実装します。

3 つのプログラムはいずれも現在のチェーン先端から開始し、自動再接続を有効にします。
SIGINT/SIGTERM を処理し、終了を伴う `Failed()` と回復可能な `ErrorChan()` の診断を別々に監視します。
起動に成功した場合は、戻る前に `Stop()` を呼び出します。起動エラーの場合は、
`StartContext` が失敗した起動の後処理を行うため、`Stop()` を呼ばずに戻ります。
コールバックはイベントの種類とともに `received event` を記録し、ステータスの変更時は
`chainsync status update` を記録します。

<a id="validate-the-source"></a>

## ソースの検証

展開したバンドルのルートで実行します。

```sh
go test -race ./...
go vet ./...
go build ./...
```

テストは模擬ローカルソケットとメモリ内のプラグインを使用するため、稼働中の Cardano ノードは不要です。
実際の ChainSync イベントを確認するには、プログラムを別途実行してください。
