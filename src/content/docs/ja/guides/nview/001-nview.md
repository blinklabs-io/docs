---
title: nview
description: nviewでローカルCardanoノードの状態とメトリクスをターミナルから監視します。
---

![nview-screen](/nview-screen.png)

nviewは、Cardanoノード（cardano-node）のローカル監視ツールで、リモート監視ツールを補完し、コマンドラインから実行中のノードのローカルビューを提供することを目的としています。これは、ほとんどの画面に収まるように設計されたTUI（ターミナルユーザーインターフェース）です。

実行中のCardanoノードに対してnviewを実行すると、デフォルトのCardanoノード設定でそのまま動作します。デフォルト設定では、特定のポートでPrometheus形式のメトリクスが公開されます。ただし、変更が必要な場合は、設定ファイルを使用してnviewを実行できます。

<a id="how-do-i-actually-use-nview"></a>

## nviewの使い方

blinklabs.ioからnviewのバイナリファイルをノードサーバーにダウンロードするだけです。そして、サーバーのコマンドラインでnviewを実行します。使い方はとても簡単で、すぐに監視を開始できます！

✅ [クイックスタート](../002-quick-start)ガイドで始めて、nviewでノードの監視を始めましょう。
