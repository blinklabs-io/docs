---
title: Tx Submit API Mirror
description: Tx Submit API Mirrorに関するガイド。
---

設定されたバックエンドの送信APIサービスにすべての受信リクエストを非同期でミラーリングする、シンプルなCardanoトランザクション送信APIサービスです。

CBORエンコードされたCardanoトランザクションをペイロードボディとして受け取り、1つ以上の設定されたバックエンドトランザクション送信APIサービスに送信するシンプルなHTTP APIです。

## Tx Submit API Mirrorの使い方

blinklabs.ioからTx Submit API Mirrorのバイナリファイルをダウンロードし、ノードサーバーに配置します。設定は設定ファイルまたは環境変数を使用して行えます。💡 ヒント: まだCardano Nodeをお持ちでない場合は、[cardano-up](../../cardano-up/001-cardano-up)をお試しください。

✅ Tx Submit API Mirrorを使用してトランザクションの送信を開始するには、[クイックスタート](../002-quick-start)ガイドをご覧ください。
