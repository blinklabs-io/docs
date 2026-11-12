---
title: コンテナで Dingo を実行する
description: 公開された Dingo イメージを実行し、データを永続化してノードの状態を確認します。
---

Dingo は GitHub Container Registry にコンテナイメージを公開しています。バージョン付きのイメージタグは、対応する Dingo リリースタグから先頭の `v` を除いたものです。この例では Dingo `v0.92.4` を使用します。

```sh
 docker pull ghcr.io/blinklabs-io/dingo:0.92.4
```

<a id="start-a-preview-node"></a>

## Preview ノードの起動

イメージの既定値は、`serve` コマンド、Preview ネットワーク、データベースディレクトリ `/data/db` です。名前付きボリュームにより、コンテナを停止または置換してもデータベースが保持されます。

```sh
docker run --detach --name dingo-preview \
  --publish 3001:3001 \
  --publish 127.0.0.1:12798:12798 \
  --publish 127.0.0.1:12799:12799 \
  --env DINGO_METRICS_BIND_ADDR=0.0.0.0 \
  --volume dingo-preview-data:/data/db \
    ghcr.io/blinklabs-io/dingo:0.92.4
```

ポート `3001` は Ouroboros のノード間接続を受け付けます。この例では、メトリクスの `12798` とヘルスエンドポイントの `12799` をホストのループバックインターフェイスに公開します。イメージは既定でメトリクスをコンテナのループバックにバインドするため、`DINGO_METRICS_BIND_ADDR=0.0.0.0` で上書きして、ホストから公開メトリクスポートに接続できるようにします。ホスト側の公開先は `127.0.0.1` のままです。ネットワークごとに別々の名前付きボリュームを使用してください。

Preprod では、`--env CARDANO_NETWORK=preprod` を追加し、`dingo-preprod-data` などのボリュームを使用します。

<a id="use-a-configuration-file"></a>

## 設定ファイルの使用

読み取り可能な `dingo.yaml` をマウントし、`serve` コマンドの前にそのパスを指定します。

```sh
docker run --detach --name dingo-custom \
  --publish 3001:3001 \
  --volume dingo-custom-data:/data/db \
  --mount type=bind,source="$(pwd)/dingo.yaml",target=/tmp/dingo.yaml,readonly \
     ghcr.io/blinklabs-io/dingo:0.92.4 \
  --config /tmp/dingo.yaml serve
```

カスタム設定でメトリクスポートを公開する場合は、`dingo.yaml` の `metricsBindAddr: "0.0.0.0"` またはコンテナの環境変数 `DINGO_METRICS_BIND_ADDR=0.0.0.0` を設定します。設定ファイルをマウントするだけでは、ループバックのメトリクスに公開ポート経由でアクセスできるようにはなりません。

コンテナは UID `1000` で実行されます。バインドマウントした設定ファイルを、そのユーザーが読み取れるようにしてください。その他のノード設定については、[設定とストレージモード](/ja/guides/dingo/005-node-configuration/)を参照してください。

イメージは `/data/db` 配下を UID:GID `1000:1000` 向けに準備しています。`databaseLifecycle.snapshotDir` に `/data/db` とは別のホストディレクトリをバインドマウントする場合は、マウント前にホスト側の所有者を UID:GID `1000:1000` に設定してください。所有者を設定しないと、起動時の書き込み可能性の検証に失敗します。

<a id="access-published-metrics"></a>

### 公開メトリクスへのアクセス

ノードと Mithril のメトリクスエンドポイントは、匿名リクエストを受け付けます。メトリクスリスナーは平文 HTTP を使用するため、信頼できないネットワークに公開する場合は、ネットワーク層でアクセスを制御してください。

<a id="append-to-log-file"></a>

## ログファイルへの追記

既存のログファイルに追記するには、`DINGO_LOG_FILE` と `DINGO_LOG_FILE_APPEND=true` を設定します。`DINGO_LOG_FILE_APPEND` は、値が完全に `true` の場合にだけ有効です。

```sh
docker run --detach --name dingo-preview \
  --env DINGO_LOG_FILE=/data/db/dingo.log \
  --env DINGO_LOG_FILE_APPEND=true \
  ghcr.io/blinklabs-io/dingo:0.92.4
```

追記モードでは、既存の通常ファイルに追記し、存在しないファイルを作成します。既存ファイルのアクセス権を保持し、ファイルの末尾が改行で終わっていない場合は、追記前に改行を挿入します。シンボリックリンクや通常ファイル以外のパスは拒否します。`DINGO_LOG_FILE_APPEND` が未設定または `true` 以外の場合は、既定の動作（新しいファイル名が必要）を維持します。

<a id="check-and-manage-the-container"></a>

## コンテナの確認と管理

```sh
docker logs --follow dingo-preview
docker stop dingo-preview
docker start dingo-preview
```

イメージのヘルスチェックは `/health` を呼び出します。これはイベントループの応答性を含む生存性を確認します。コンテナが正常でも、同期中の場合があります。準備状態を確認するエンドポイントは `/readyz` です。チェーン先端との隔たりとデータベースの準備状態のチェックに合格する必要があり、ブロックプロデューサーでは、使用可能な資格情報を持つブロック生成処理が動作していることも必要です。アプリケーションのトラフィックを転送するか判断する際には `/readyz` を使用してください。
Mithril によるブートストラップとデータベース操作については、[ブートストラップとデータ保守](/ja/guides/dingo/007-bootstrap-and-data-maintenance/)を参照してください。


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
