---
title: cardano-db-sync
description: Blink LabsのコンテナイメージでPostgreSQLとCardano DB Syncを実行します。
---

このイメージはCardanoチェーンをPostgreSQLにインデックスします。`/var/lib/cexplorer`を永続化し、Cardanoノードのソケットを`/node-ipc`にマウントして、PostgreSQLの認証情報を指定してください。

```sh
docker run --detach --name cardano-db-sync \
  -v dbsync-state:/var/lib/cexplorer \
  -v node-ipc:/node-ipc \
  -e NETWORK=mainnet \
  -e POSTGRES_HOST=postgres -e POSTGRES_PORT=5432 \
  -e POSTGRES_DB=cexplorer -e POSTGRES_USER=cexplorer \
  -e POSTGRES_PASSWORD='use-a-secret' \
  ghcr.io/blinklabs-io/cardano-db-sync:latest
```

| 変数 | 意味 |
| --- | --- |
| `NETWORK` | 同梱ネットワーク設定：`mainnet`、`preprod`、`preview`、`sanchonet`。未設定の場合は、イメージの後に上流db-syncの引数を渡します。 |
| `CARDANO_NODE_SOCKET_PATH` | CardanoのIPCソケット。`NETWORK`が設定されている場合の既定値は`/node-ipc/node.socket`です。 |
| `RESTORE_SNAPSHOT` | db-syncスナップショットのローカルパスまたはHTTPS URL（省略可）。URLの場合はチェックサムを検証し、一度だけ復元します。 |
| `POSTGRES_HOST` / `POSTGRES_PORT` | PostgreSQLのホストとポート。 |
| `POSTGRES_DB` / `POSTGRES_USER` | PostgreSQLのデータベースとユーザー名。 |
| `POSTGRES_PASSWORD` | 代替パスワード。Dockerシークレットの`postgres_password`を優先してください。 |

エントリーポイントは`POSTGRES_*`の値、または`/run/secrets`内の`postgres_host`、`postgres_port`、`postgres_db`、`postgres_user`、`postgres_password`ファイルから`/configuration/pgpass`を生成します。`docker logs -f cardano-db-sync`で進行状況を確認できます。

[ソースリポジトリ](https://github.com/blinklabs-io/docker-cardano-db-sync) ·
[上流のdb-sync](https://github.com/IntersectMBO/cardano-db-sync)
