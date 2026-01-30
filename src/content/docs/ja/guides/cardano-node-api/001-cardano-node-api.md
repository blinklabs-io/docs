---
title: Cardano Node API
description: Cardano Node APIに関するガイド。
---

![cardano-node-api-logo](/cardano-node-api-logo.png)

ローカルのCardanoノードとインターフェースし、ノード内部データをHTTPクライアントに提供するHTTP APIです。このサービスは、UNIXソケットを介してOuroborosネットワークプロトコルを使用してCardanoフルノードと通信し、基盤となるNode-to-Client（NtC）Ouroborosミニプロトコルをクライアントに対してREST APIまたはUTxO RPC gRPC APIとして公開します。

<br>

Cardano Node APIは、Goで記述されたサービスで、プライベートインターフェースを介してCardanoノードと通信し、協調標準に基づいた機能豊富なHTTP APIセットを提供します。

<br>

## Cardano Node APIはどのように使用しますか？
blinklabs.ioからCardano Node APIのバイナリファイルをノードサーバーにダウンロードするだけです。その後、サーバーのコマンドラインでCardano Node APIを実行します。設定は、設定ファイルまたは環境変数を使用して行うことができます。

<br>

✅ [クイックスタート](../002-quick-start)ガイドでCardano Node APIの使用を開始しましょう。


