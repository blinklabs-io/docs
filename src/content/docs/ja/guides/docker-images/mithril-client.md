---
title: mithril-client
description: Blink LabsのイメージでMithrilスナップショットをダウンロード・検証します。
---

`mithril-client`は上流のスナップショットCLIです。Cardanoネットワーク設定は`/opt/cardano/config`にあります。実行時ラッパーや独自の環境変数は追加しません。

```sh
docker run --rm -it \
  -v node-data:/data \
  ghcr.io/blinklabs-io/mithril-client:latest \
  cardano-db snapshot list
```

上流Mithrilのコマンド、フラグ、環境設定を直接渡してください。`MITHRIL_VERSION`はソースのリビジョンを選択するビルド引数です。

[Mithrilのドキュメント](https://mithril.network/doc/current/) ·
[ソースリポジトリ](https://github.com/blinklabs-io/docker-mithril-client)
