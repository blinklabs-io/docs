---
title: mithril-signer
description: Blink LabsのイメージでMithril署名サービスを実行します。
---

`mithril-signer`は上流の署名サービスです。Cardanoネットワーク設定は`/opt/cardano/config`にあります。実行時ラッパーや独自の環境変数は追加しません。

```sh
docker run --rm -it \
  -v signer-config:/etc/mithril \
  ghcr.io/blinklabs-io/mithril-signer:latest --help
```

上流の署名サービス設定とシークレット管理の手順に従ってください。署名キーをイメージレイヤーやコマンドライン引数に含めないでください。`MITHRIL_VERSION`はビルド引数であり、実行時の設定ではありません。

[Mithrilのドキュメント](https://mithril.network/doc/current/) ·
[ソースリポジトリ](https://github.com/blinklabs-io/docker-mithril-signer)
