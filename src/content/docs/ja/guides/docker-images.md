---
title: Blink Labs のコンテナイメージ
description: Cardano、Hydra、Mithril 用の Blink Labs コンテナイメージを選択し、実行、設定します。
---

Blink Labs は、Cardano エコシステムの上流ソフトウェアを、再現可能な Debian または Alpine イメージにまとめて公開しています。ソフトウェア自体は上流プロジェクトのものであり、Blink Labs は Dockerfile、ビルド入力、エントリーポイント、リリース自動化を保守します。本番環境にデプロイする前に、上流のライセンスとリリースノートを確認してください。

イメージは [GitHub Container Registry](https://github.com/orgs/blinklabs-io/packages?repo_name=docker-cardano-node) に `ghcr.io/blinklabs-io/<image>` として、[Docker Hub](https://hub.docker.com/u/blinklabs) に `blinklabs/<image>` として公開されます。再現性が必要な場合はリリースタグを使用してください。`:latest` は最新の公開ビルドを意図的に追跡する場合のみ使用します。

<a id="image-catalog"></a>

## イメージ一覧

| イメージ | 用途 | 上流プロジェクト | ガイド |
| --- | --- | --- | --- |
| `cardano-cli` | Cardano のコマンドラインクエリ、トランザクション構築、署名。 | [IntersectMBO/cardano-cli](https://github.com/IntersectMBO/cardano-cli) | [ガイド](/ja/guides/docker-images/cardano-cli/) |
| `cardano-configs` | 他のコンテナやボリュームへのネットワーク設定ファイルの提供。 | [Cardano environment configs](https://book.play.dev.cardano.org/environments/) | [ガイド](/ja/guides/docker-images/cardano-configs/) |
| `cardano-db-sync` | Cardano チェーンの PostgreSQL へのインデックス化。 | [IntersectMBO/cardano-db-sync](https://github.com/IntersectMBO/cardano-db-sync) | [ガイド](/ja/guides/docker-images/cardano-db-sync/) |
| `cardano-node` | Cardano フルノード、トレーサー、送信 API の実行。 | [IntersectMBO/cardano-node](https://github.com/IntersectMBO/cardano-node) | [ガイド](/ja/guides/docker-images/cardano-node/) |
| `cardano-wallet` | Cardano ウォレット HTTP サービスの実行。 | [cardano-foundation/cardano-wallet](https://github.com/cardano-foundation/cardano-wallet) | [ガイド](/ja/guides/docker-images/cardano-wallet/) |
| `hydra-node` | Hydra head ノードの実行。 | [cardano-scaling/hydra](https://github.com/cardano-scaling/hydra) | [ガイド](/ja/guides/docker-images/hydra-node/) |
| `mithril-client` | Mithril スナップショットのダウンロードと検証。 | [input-output-hk/mithril](https://github.com/input-output-hk/mithril) | [ガイド](/ja/guides/docker-images/mithril-client/) |
| `mithril-signer` | Mithril 署名者サービスの実行。 | [input-output-hk/mithril](https://github.com/input-output-hk/mithril) | [ガイド](/ja/guides/docker-images/mithril-signer/) |

各イメージのリポジトリには、各リリースの正確な Dockerfile とビルドバージョンが含まれます。イメージタグとこのページの情報が一致しない場合は、上記リンクの内容を正としてください。

<a id="common-docker-patterns"></a>

## Docker の共通パターン

コンテナの置換後も保持する状態には名前付きボリュームを使用し、他のサービスに必要なポートだけを公開してください。秘密情報はシェル履歴に残さず、Docker secrets またはシークレットマネージャーで渡します。

```sh
docker pull ghcr.io/blinklabs-io/cardano-node:<release-tag>
docker pull blinklabs/cardano-node:<release-tag>
docker image inspect ghcr.io/blinklabs-io/cardano-node:<release-tag>
docker logs -f cardano-node
```

各ガイドは読みやすさのため GHCR と `:latest` を使用しています。Docker Hub では `blinklabs/<image>` に置き換え、スクリプトやデプロイマニフェストではタグを固定してください。

<a id="choose-an-image"></a>

## イメージの選択

- フルノードと任意の同梱ツールが必要な場合は、[cardano-node](/ja/guides/docker-images/cardano-node/)を参照してください。
- トランザクションとクエリのコマンドだけが必要な場合は、[cardano-cli](/ja/guides/docker-images/cardano-cli/)を使用します。
- 他のサービスにマウントする設定が必要な場合は、[cardano-configs](/ja/guides/docker-images/cardano-configs/)を使用します。
- PostgreSQL のインデックスが必要な場合は、[cardano-db-sync](/ja/guides/docker-images/cardano-db-sync/)を使用します。
- ウォレット API、Hydra head、Mithril サービスが必要な場合は、上記の対応するガイドを開いてください。

<a id="troubleshooting"></a>

## トラブルシューティング

- **コマンドがすぐに終了する:** イメージのエントリーポイントを確認し、必要なコマンドを渡してください。`cardano-configs` は出力先ディレクトリ、`cardano-node` は `NETWORK` または `run` が必要です。
- **ノードのソケットが見つからない:** ノードとクライアントの両コンテナに同じ名前付きボリュームをマウントし、管理モードでは `/ipc/node.socket`、設定可能モードでは `CARDANO_SOCKET_PATH` の値を使用します。
- **ノードがジェネシスから同期する:** `/data/db` を永続化するか、`RESTORE_SNAPSHOT=true` を維持し、エントリーポイントが Mithril スナップショットをダウンロードできるようにします。
- **db-sync が PostgreSQL に接続できない:** `POSTGRES_*` の値と生成された `/configuration/pgpass` を確認し、コンテナネットワークからデータベースに到達できることを確認します。
- **設定ファイルがない:** 対象ネットワークを引数にして `cardano-configs` を実行し、その出力を、利用側イメージが想定する `/opt/cardano/config` にマウントします。

イメージ固有の問題は、保守担当者が同じビルドタグで再現できるよう、そのイメージのリポジトリに報告してください。
