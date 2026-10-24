---
title: gOuroboros の使用例
description: Cardano ノードプロトコルを使用する実行可能な Go サンプルを確認し、ダウンロードします。
---

gOuroboros リポジトリには、Go アプリケーションから Cardano ノードに接続し、Ouroboros のミニプロトコルを使用する方法を示す、実行可能なプログラムが含まれます。このページのドキュメント用スナップショットは、[gOuroboros v0.211.0](https://github.com/blinklabs-io/gouroboros/tree/v0.211.0/examples) のサンプルを基にし、バンドルの README に記載した修正を加えています。

[すべてのサンプルをダウンロード](/downloads/gouroboros/dev-guides/gouroboros-examples-v0.211.0.tar.gz)するか、[GitHub のバージョン別ソース](https://github.com/blinklabs-io/gouroboros/tree/v0.211.0/examples)を参照してください。

| サンプル | 内容 |
| --- | --- |
| [block-fetch](https://github.com/blinklabs-io/gouroboros/tree/v0.211.0/examples/block-fetch) | スロットとハッシュを指定してノードからブロックを取得します。 |
| [chain-sync](https://github.com/blinklabs-io/gouroboros/tree/v0.211.0/examples/chain-sync) | ブロックとヘッダーを同期します。任意でブロック取得と範囲クエリも使用できます。 |
| [chain-tip](https://github.com/blinklabs-io/gouroboros/tree/v0.211.0/examples/chain-tip) | 現在のチェーン先端を読み取って表示します。 |
| [peer-sharing](https://github.com/blinklabs-io/gouroboros/tree/v0.211.0/examples/peer-sharing) | peer-sharing ミニプロトコルを通してピアを要求します。 |
| [ping](https://github.com/blinklabs-io/gouroboros/tree/v0.211.0/examples/ping) | ノード接続と ChainSync の応答時間を測定します。 |
| [state-query](https://github.com/blinklabs-io/gouroboros/tree/v0.211.0/examples/state-query) | ローカルノードから台帳状態を照会します。 |
| [tx-monitor](https://github.com/blinklabs-io/gouroboros/tree/v0.211.0/examples/tx-monitor) | ノードのローカルメモリプール内のトランザクションを監視します。 |
| [tx-submission](https://github.com/blinklabs-io/gouroboros/tree/v0.211.0/examples/tx-submission) | ローカルノードにトランザクションを送信します。 |

サンプルは gOuroboros モジュール内の Go プログラムで、Go 1.26.5 以降が必要です。ダウンロードを展開した後、README に従って修正済みのサンプルを対応する v0.211.0 モジュールにコピーし、テストを実行してノード接続を設定してください。各ソースファイルの環境設定と接続設定に従い、パッケージの詳細はモジュールの [API ドキュメント](https://pkg.go.dev/github.com/blinklabs-io/gouroboros)を参照してください。
