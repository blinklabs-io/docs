---
title: Tx Submit API
description: Tx Submit APIについてのガイド。
---

![txsubmit-logo](/txsubmit-logo.png)

Tx Submit APIは、Go言語で書かれたCardanoトランザクション送信APIサービスです。HTTPを介してCBORエンコードされたトランザクションペイロードを受け取り、gOuroborosを使用してOuroboros NetworkのLocalTxSubmissionミニプロトコルに変換します。このプロジェクトはProject Catalyst Fund 9で資金提供されました。

Tx Submit APIはHTTPを介してトランザクションを送信するため、Cardanoブロックチェーンへのトランザクション送信をより高速に行うことができます。

## Tx Submit APIを実際にどのように使用しますか？
blinklabs.ioからTx Submit APIのバイナリファイルをダウンロードして、ノードサーバーに配置します。その後、サーバーのコマンドラインでTx Submit APIを実行します。設定は設定ファイルまたは環境変数を使用して行うことができます。

✅ [クイックスタート](../002-quick-start)ガイドを参照して、Tx Submit APIを使用したHTTP経由でのトランザクション送信を始めましょう。
