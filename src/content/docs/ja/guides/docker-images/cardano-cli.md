---
title: cardano-cli
description: Blink Labsのcardano-cliイメージでCardano CLIコマンドを実行します。
---

`cardano-cli`は実行可能イメージです。イメージ名の後の引数は、上流のCLIに直接渡されます。

```sh
docker run --rm -it \
  -v node-ipc:/ipc \
  ghcr.io/blinklabs-io/cardano-cli:latest \
  query tip --socket-path /ipc/node.socket --mainnet
```

このイメージは実行時の環境変数を追加しません。`CLI_VERSION`は上流CLIのタグを選択するDockerビルド引数であり、実行時の設定ではありません。`LD_LIBRARY_PATH`と`PKG_CONFIG_PATH`は同梱ライブラリ用に内部で設定されます。

[ソースリポジトリ](https://github.com/blinklabs-io/docker-cardano-cli) ·
[上流のCLI](https://github.com/IntersectMBO/cardano-cli)
