---
title: cardano-wallet
description: Blink LabsのイメージでCardano WalletのHTTPサービスを実行します。
---

`cardano-wallet`は上流のウォレット実行ファイルを含み、ポート`8090`を公開します。Blink Labs固有の実行環境は追加しません。イメージ名の後に上流のコマンドとオプションを渡してください。

```sh
docker run --detach --name cardano-wallet \
  -p 8090:8090 -v node-ipc:/ipc -v wallet-state:/wallet \
  ghcr.io/blinklabs-io/cardano-wallet:latest \
  serve --port 8090 --node-socket /ipc/node.socket --database /wallet
```

`WALLET_VERSION`と`WALLET_REF`はソースのリビジョンを選択するビルド引数であり、実行時の設定ではありません。上流コマンドの要件に応じて、ノードIPC、データベース、TLSファイルをマウントしてください。

[ソースリポジトリ](https://github.com/blinklabs-io/docker-cardano-wallet) ·
[上流のウォレット](https://github.com/cardano-foundation/cardano-wallet)
