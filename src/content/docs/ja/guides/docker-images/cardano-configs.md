---
title: cardano-configs
description: Blink Labsのcardano-configsイメージからCardanoネットワーク設定をコピーします。
---

`cardano-configs`はマウントしたディレクトリにネットワーク設定ファイルをコピーします。エントリーポイントには出力先ディレクトリが必要で、ネットワーク名は省略できます。

```sh
docker run --rm \
  -v "$(pwd)/configs:/output" \
  ghcr.io/blinklabs-io/cardano-configs:latest /output preprod
```

`preprod`を省略すると同梱されているすべてのネットワークをコピーします。通常は`mainnet`、`preprod`、`preview`、`sanchonet`を含み、devnetファイルがある場合は`devnet`も利用できます。不明なネットワークを指定すると、利用可能なディレクトリを示してエラーになります。

実行時の環境変数はありません。更新スクリプトでは次のビルド時設定を使用します。

| 変数 | 意味 |
| --- | --- |
| `HAIL_HYDRA` | `true`の場合、Hydra devnetの設定を含めます。 |
| `LEIOS_GO_BRR` | `true`の場合、`musashi`/Leios設定を更新します。 |

[ソースリポジトリ](https://github.com/blinklabs-io/docker-cardano-configs)
