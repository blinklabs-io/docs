---
title: ノード設定とストレージモード
description: Dingo ノードの役割を選び、対応する設定オプションを確認します。
---

[クイックスタート](/ja/guides/dingo/002-quick-start-overview/)に従って Dingo をインストールし、ノードを起動します。このページでは主な設定の選択肢を説明します。[Dingo v0.87.0 の完全な設定リファレンス](/ja/guides/dingo/009-configuration-reference/)を読み、リリースに対応する [`dingo.yaml.example`](https://raw.githubusercontent.com/blinklabs-io/dingo/v0.87.0/dingo.yaml.example) をダウンロードしてください。

<a id="choose-a-node-role"></a>

## ノードの役割の選択

| 役割 | ストレージモード | ブロック生成 | 用途 |
| --- | --- | --- | --- |
| リレー | `core` | 無効 | チェーンを追跡して検証し、ノード間およびノードとクライアント間の接続を提供します。 |
| ブロックプロデューサー | `core` | プール鍵と運用証明書を使用して有効化 | チェーンを追跡し、選出されたときにブロックを生成します。[SPO ガイド](../spo-guides/000-spo-guide/)を参照してください。 |
| API ノード | `api` | 無効 | 過去のトランザクションデータを保持し、設定した Blockfrost、Mesh、UTxO RPC API、または任意の組み込み Kupo 互換 API を提供します。 |

`core` は既定のストレージモードで、コンセンサスに必要なデータを保存します。`api` はさらに、クエリサービス用に過去のトランザクションの詳細をインデックス化します。任意の組み込み Kupo 互換 API を含む API プロバイダーには `api` モードが必要です。各プロバイダーのポートを `0` にすると、そのリスナーは無効になります。ストレージモードの設定ではブロック生成は有効になりません。

現在のリリースにおける Dingo のブロック生成は、テストネットワークとプライベート devnet 向けです。[SPO ガイド](../spo-guides/000-spo-guide/)のプール鍵と証明書の説明に従ってください。メインネット設定が存在することを、メインネットでのブロック生成がサポートされている根拠にしないでください。

<a id="configure-dingo"></a>

## Dingo の設定

Dingo は YAML ファイル、環境変数、コマンドラインフラグから設定を読み取ります。優先順位は、コマンドラインフラグ、環境変数、YAML、組み込みの既定値の順です。基本的なローカル実行では、組み込みの Preview ネットワーク設定を使用します。

```sh
./dingo --network preview
```

継続的な運用や既定値以外の設定では、ダウンロードしたファイルを `dingo.yaml` として保存し、`--config` で渡します。設定オプションと既定値はリリースによって変わる場合があります。

プロバイダーは `plugins` の下に設定します。ストレージプロバイダーはブロックデータとメタデータを保持し、メモリプールプロバイダーは保留中のトランザクションを順序付け、API プロバイダーはクライアントリクエストを処理します。プロバイダー固有の設定は、そのプロバイダー名とともに記述します。サンプルファイルは Dingo v0.87.0 のプロバイダーとオプションを説明しています。`plugins.storage.metadata.provider` が `sqlite` の場合、ルートの `databasePath` は空にできません。プロバイダーを省略した場合の既定値も `sqlite` であり、`databasePath` が空なら起動時に設定を拒否します。環境変数は `DINGO_PLUGINS_<CAPABILITY>_<PROVIDER>_...` の形式です。現在のサンプルでは、対応する blob およびメタデータのプロバイダーと各オプションを確認できます。

メトリクスのダッシュボードについては [Grafana ガイド](../spo-guides/008-grafana-dashboard/)を参照してください。Linux サービスとして実行するには、[Dingo をサービスとして実行する](/ja/guides/dingo/003-create-start-up-service/)を参照してください。


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
