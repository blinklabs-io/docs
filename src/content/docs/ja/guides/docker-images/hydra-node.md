---
title: hydra-node
description: Blink Labsのコンテナイメージで上流のHydra Headノードを実行します。
---

`hydra-node`には上流の実行ファイル、Cardano設定ファイル、`cardano-cli`が含まれます。Hydraのフラグをイメージに直接渡してください。

```sh
docker run --rm -it \
  -v hydra-state:/state \
  ghcr.io/blinklabs-io/hydra-node:latest --help
```

Blink Labs固有の実行環境やラッパーはありません。上流Hydraのフラグと設定で、ピア、Headプロトコル、API、永続化を設定します。`NODE_VERSION`と`RUST_ACCUMULATOR_REV`はビルド引数のみです。

[Hydraのドキュメント](https://hydra.family/) ·
[ソースリポジトリ](https://github.com/blinklabs-io/docker-hydra-node)
