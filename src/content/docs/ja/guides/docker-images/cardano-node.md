---
title: cardano-node
description: Blink Labsのcardano-nodeイメージでCardanoフルノードを実行・設定します。
---

管理モードを使用するには`NETWORK`を設定します。細かく制御する場合は省略して`run`を呼び出してください。管理モードの値は`mainnet`、`preview`、`preprod`、`sanchonet`です。

```sh
docker run --detach --name cardano-node \
  -v node-data:/data/db -v node-ipc:/ipc \
  -e NETWORK=preprod -p 3001:3001 \
  ghcr.io/blinklabs-io/cardano-node:latest
```

空のpreprodまたはmainnetデータベースはMithrilスナップショットから初期化できます。`/data/db`を永続化してください。この機能を無効にするには`RESTORE_SNAPSHOT=false`を設定します。

<a id="runtime-variables"></a>

### 実行時の変数

| 変数 | 既定値 | 意味 |
| --- | --- | --- |
| `CARDANO_NETWORK` | `mainnet` | 設定可能な`run`モードのネットワークディレクトリ。 |
| `CARDANO_CONFIG_BASE` | `/opt/cardano/config` | 同梱設定のベースディレクトリ。 |
| `CARDANO_CONFIG` | `${CARDANO_CONFIG_BASE}/mainnet/config.json` | ノード設定のパス。 |
| `CARDANO_TOPOLOGY` | `${CARDANO_CONFIG_BASE}/mainnet/topology.json` | トポロジーのパス。 |
| `CARDANO_DATABASE_PATH` | `/data/db` | 永続的な台帳データベース。 |
| `CARDANO_SOCKET_PATH` | `/ipc/node.socket` | OuroborosのIPCソケット。 |
| `CARDANO_BIND_ADDR` / `CARDANO_PORT` | `0.0.0.0` / `3001` | ネットワークのバインドアドレスとポート。 |
| `CARDANO_LOG_DIR` | `/opt/cardano/logs` | ログディレクトリ。 |
| `CARDANO_RTS_OPTS` | `-N2 -A64m -I0 -qg -qb --disable-delayed-os-memory-return` | Haskellランタイムのオプション。 |
| `CARDANO_BLOCK_PRODUCER` | `false` | ブロックプロデューサーとして実行するには`true`を設定します。 |
| `CARDANO_SHELLEY_KES_KEY` | `${CARDANO_CONFIG_BASE}/keys/kes.skey` | KESキーのパス。 |
| `CARDANO_SHELLEY_VRF_KEY` | `${CARDANO_CONFIG_BASE}/keys/vrf.skey` | VRFキーのパス。 |
| `CARDANO_SHELLEY_OPERATIONAL_CERTIFICATE` | `${CARDANO_CONFIG_BASE}/keys/node.cert` | 運用証明書のパス。 |
| `START_AS_NON_PRODUCING` | `false` | ブロック生成を停止した状態でプロデューサーを起動します。SIGHUPで制御します。 |
| `RESTORE_SNAPSHOT` | `true` | Mithrilスナップショットによる初期化を有効にします。 |
| `AGGREGATOR_ENDPOINT` / `SNAPSHOT_DIGEST` | ネットワークURL / `latest` | Mithrilのエンドポイントとスナップショットの選択。 |
| `GENESIS_VERIFICATION_KEY` / `ANCILLARY_VERIFICATION_KEY` | 同梱ファイル | Mithrilの検証キー。 |
| `SOCAT_PORT` | `0` | TCPからIPCへの転送ポート（省略可）。 |
| `DEBUG` | 未設定 | 空でない場合はシェルトレースを有効にします。 |

イメージには`cardano-cli`、`mithril-client`、`mithril-signer`、`nview`、`txtop`も含まれます。署名キーは読み取り専用でマウントし、イメージレイヤーには絶対に含めないでください。

[ソースリポジトリ](https://github.com/blinklabs-io/docker-cardano-node) ·
[上流のノード](https://github.com/IntersectMBO/cardano-node)
