---
title: Bluefin
description: Bluefinの紹介。
---

![bluefin-logo](/bluefin-logo.png)

Bluefinは、Goで書かれたスタンドアロンのFortuna（TUNA）マイナーです。チェーンを同期し、TUNAをマイニングし、他のインフラストラクチャなしでリモートノードにトランザクションを送信します。

***

## $TUNAとは何か、Bluefinはどのように動作するのか？

TUNAはFortunaのトークンですが、Fortunaとは何でしょうか？FortunaはCardanoスマートコントラクト上に構築されたプルーフオブワークトークンプロジェクトです。FortunaマイナーはLucidを使用してTypescriptで書かれており、動作するためにKupoとOgmios、またはAPIプロバイダーへのアクセスが必要でした。Blinklabsでは、外部サービスに依存しないマイナーを望んでおり、ここでBluefinが登場します。

BluefinはパブリックCardanoノードを使用してブロックチェーンを追跡し、興味深いUTxOをディスクに保存します。ブロックをマイニングした後、NtN（node-to-node）TxSubmissionプロトコルを使用してパブリックノードに直接トランザクションを送信します。Blinklabsの他のすべてのGoプロジェクトと同様に、複数のプラットフォームとアーキテクチャで単一のバイナリとして実行されます。Bluefinは$TUNA v2のマイニングもサポートしています。

Fortunaについて詳しくは<a href="https://minefortuna.com/" target="_blank">minefortuna.com/</a>をご覧ください。

***

## Bluefinの実際の使い方は？

Bluefinは自己完結型で、外部依存関係なしで実行できます。<a href="https://github.com/blinklabs-io/bluefin/pkgs/container/bluefin" target="_blank">Dockerイメージ</a>または<a href="https://github.com/blinklabs-io/bluefin/releases" target="_blank">リリースページ</a>のバイナリで実行できます。

✅ [クイックスタート](../002-quick-start-overview)ガイドで始めましょう。
