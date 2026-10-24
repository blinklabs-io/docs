---
title: Dingo の API とアーカイブサービス
description: アプリケーション用の Dingo API と Dingo のアーカイブ通信に用いる Bark を設定します。
---

<a id="application-apis"></a>

## アプリケーション API

Dingo は、アプリケーションクライアント向けに Blockfrost 互換 REST、Mesh/Rosetta REST、UTxO RPC、Kupo 互換 REST インターフェイスを提供します。これらには、クエリ用の過去のトランザクションデータを保存する `storageMode: api` が必要です。各リスナーは `plugins.api` で設定し、ポートを `0` にすると無効になります。

| インターフェイス | プロトコル | 既定のポート |
| --- | --- | ---: |
| Blockfrost 互換 API | HTTP/REST | `3000` |
| Mesh (Rosetta) | HTTP/REST | `8080` |
| UTxO RPC | Connect/gRPC and HTTP | `9090` |
| Kupo 互換 API | HTTP/REST | 既定値は `port: 0`（無効）、組み込みプロバイダーの例は `1442` |

Kupo は組み込みプロバイダーを使用します。`storageMode: api` と 0 以外のプロバイダーポートを設定して有効にします。次に例を示します。

```yaml
storageMode: api
plugins:
  api:
    kupo:
      provider: builtin
      config:
        port: 1442
```

`--kupo-provider=builtin` オプションは、コマンドラインから組み込みプロバイダーを選択します。YAML のポートキーは `plugins.api.kupo.config.port`、対応する環境変数は `DINGO_PLUGINS_API_KUPO_CONFIG_PORT` です。プロバイダーは、ノードの通常の起動と停止のライフサイクルに従います。

たとえば、`dingo.yaml` で組み込みの Blockfrost と UTxO RPC プロバイダーを有効にします。

```yaml
storageMode: api
plugins:
  api:
    blockfrost:
      provider: builtin
      config:
        port: 3000
        host: 127.0.0.1
        authToken: "<token>"
        maxConcurrentMutations: 4
        maxConcurrentMutationsPerClient: 1
    utxorpc:
      provider: builtin
      config:
        port: 9090
```

<a id="blockfrost-mutation-requests"></a>

### Blockfrost の変更リクエスト

組み込みの Blockfrost プロバイダーは、既定では `127.0.0.1` で待ち受けます。`plugins.api.blockfrost.config.host` を明示的に空にした場合にのみ、ルートの `bindAddr` を継承します。別のインターフェイスで公開するには、ホストを明示的に設定します。

変更リクエストを送信する前に、`plugins.api.blockfrost.config.authToken` に秘密の値を設定してください。`authToken` が空の場合、すべての変更ルートは閉じたままです。`maxConcurrentMutations` の既定値は `4`、`maxConcurrentMutationsPerClient` の既定値は `1` です。両方を正の整数に設定し、`maxConcurrentMutationsPerClient` が `maxConcurrentMutations` 以下になるようにしてください。

次のルートには、設定した変更用トークンが必要です。

| ルート | 認証と受け入れ制限の動作 |
| --- | --- |
| `POST /api/v0/tx/submit` | 有効な変更用トークンが必要で、変更リクエストの受け入れ枠を消費します。 |
| `POST /api/v0/utils/txs/evaluate` | 有効な変更用トークンが必要で、変更リクエストの受け入れ枠を消費します。 |
| `POST /api/v0/utils/txs/evaluate/utxos` | 有効な変更用トークンが必要で、変更リクエストの受け入れ枠を消費します。 |

トークンは `project_id: <token>`、`X-Blockfrost-Project-Id: <token>`、`Authorization: Bearer <token>` のいずれかで送信します。トークンがないか無効な場合、`WWW-Authenticate: Bearer` を含む HTTP `401` が返ります。認証後も、サーバー全体とリモートクライアントごとの両方の制限に空きがある場合にのみ、Dingo はリクエストを受け入れます。リクエスト本文を読み取る前に空きを確認し、制限を超える場合は `Retry-After: 1` を含む HTTP `429` を返します。

ループバック以外のホストで認証付きの変更操作を公開する前に、`plugins.api.blockfrost.config.tls` でサーバー TLS を設定します。サーバー TLS がない場合、Dingo は認証付きの変更アクセスを持つ非ループバックホストでの起動を拒否します。外部からの変更アクセスを意図的に公開する場合を除き、既定のループバックホストを維持してください。

このサイトでは、完全な v0.87.0 設定リファレンスと、リリースに対応する [`dingo.yaml.example`](https://raw.githubusercontent.com/blinklabs-io/dingo/v0.87.0/dingo.yaml.example) を参照できます。プロバイダーのオプションはバージョンによって変わるため、設定ファイルは対応するリリースと組み合わせて使用してください。

<a id="secure-api-access"></a>

## API アクセスの保護

共有 API バインドアドレスは、Kupo を含む選択された API プロバイダーに適用されます。`api.tls` と `api.auth` は共有の既定値を定義します。各プロバイダーは、自身の `plugins.api.<name>.config` ブロックでどちらのポリシーも上書きできます。プロバイダー固有の TLS 設定は共有の TLS 既定値より優先されます。共有 API 認証は既定では無効です。組み込みの Blockfrost の変更ポリシーは独立しており、共有 API 認証が無効でも、変更ルートにはプロバイダーの `authToken` が必要です。変更リクエストの受け入れ制限は、これらの Blockfrost 変更ルートにのみ適用され、リスナー上のすべてのルートには適用されません。
トークン認証を有効にした場合は `Authorization: Bearer <token>` を送信します。Blockfrost クライアントは `project_id` ヘッダーも使用できます。UTxO RPC の HTTP および Connect/gRPC ルートでも Bearer トークンを使用します。

認証は、ヘルスチェックを含む、そのリスナーのすべてのルートに適用されます。プローブがトークンを送信するよう設定するか、認証情報を付加できないプローブでは TCP チェックを使用してください。Dingo は不完全な TLS 証明書と鍵の組を起動時に拒否し、トークンや鍵の内容をログに出力しません。

API リスナーをリバースプロキシや API ゲートウェイの背後に配置することもできます。TLS の終端とリクエスト認証を行う場所を 1 つに定め、その構成に合わせて Dingo のリスナーポリシーを設定してください。

<a id="bark-archive-traffic"></a>

## Bark のアーカイブ通信

Bark は、アプリケーション API とは独立した Dingo 間のアーカイブプロトコルです。アーカイブノードは、署名付き URL に対応するオブジェクトストレージから過去のブロックを配信できます。履歴の有効期限切れを利用するノードは、古いローカルブロックファイルの期限が切れた後、Bark アーカイブを代替の取得先として使用できます。[ブートストラップとデータ保守](/ja/guides/dingo/007-bootstrap-and-data-maintenance/)を参照してください。

通常のアーカイブ通信には、Bark の組み込み認証はありません。信頼できるネットワーク内で使用してください。通常のアーカイブ通信は、RPC に相互 TLS を必要とするオプションの LifecycleService とは独立しています。

<a id="bark-lifecycleservice"></a>

### Bark LifecycleService

Bark は、ノードのライフサイクル操作用にリモートの `LifecycleService` を任意で公開できます。このサービスは既定では無効です。`barkLifecycleEnabled: true`、`--bark-lifecycle-enabled`、`DINGO_BARK_LIFECYCLE_ENABLED=true` のいずれかで有効にします。

ノードを起動する前に、次の項目を設定します。

- `--bark-port` または `DINGO_BARK_PORT` で `barkPort` を 0 以外のポートに設定します。
- `--bark-client-ca-file-path` または `DINGO_BARK_CLIENT_CA_FILE_PATH` で、クライアント証明書を検証する PEM 形式の CA バンドルを `barkClientCaFilePath` に設定します。
- Bark サーバーの証明書と秘密鍵として、`tlsCertFilePath` と `tlsKeyFilePath` の両方を設定します。`--tls-cert-file-path` と `--tls-key-file-path`、または環境変数 `TLS_CERT_FILE_PATH` と `TLS_KEY_FILE_PATH` を使用します。
- `--bark-lifecycle-operator-certificate-fingerprints` または `DINGO_BARK_LIFECYCLE_OPERATOR_CERTIFICATE_FINGERPRINTS` で、SHA-256 クライアント証明書フィンガープリントを 1 つ以上 `barkLifecycleOperatorCertificateFingerprints` に追加します。この許可リストは DatabaseService のオペレーター許可リストとは別です。

すべての LifecycleService RPC で、設定された CA によるクライアント証明書の検証が必要です。`GetStatus` は読み取り専用であり、この検証済み証明書のみが必要です。`Stop` と `Restart` は破壊的操作です。`Stop` は正常な停止を要求し、`Restart` は正常な停止に続く再起動を要求します。どちらにも `barkLifecycleOperatorCertificateFingerprints` に含まれる証明書フィンガープリントが必要です。Unix 以外のプラットフォームでは `Restart` はサポートされません。

サービスが有効で `barkHost` が空の場合、Bark は既定でループバックにバインドします。別のインターフェイスで公開するには、`barkHost`、`--bark-host`、`DINGO_BARK_HOST` のいずれかを設定します。より広いバインドアドレスを指定しても、クライアント証明書の検証とライフサイクルオペレーター許可リストは必要です。

Bark が署名付きブロックダウンロード URL を受け入れるのは、正規化された HTTPS オリジンが、設定済みの正規化された HTTPS オリジンまたは明示的に許可されたダウンロードオリジンと一致する場合のみです。正規化されたオリジンには、スキーム、小文字化したホスト、有効なポートが含まれます。リダイレクト先にも同じポリシーを適用します。既定の `barkBlockDownloadAllowPrivateAddresses` は `false` であり、名前解決後のアドレスがプライベートまたは特殊用途のブロックダウンロード先は拒否されます。ブロックダウンロード先に限りこれらのアドレスを許可するには、`barkBlockDownloadAllowPrivateAddresses` を `true` にするか、`--bark-block-download-allow-private-addresses` または `DINGO_BARK_BLOCK_DOWNLOAD_ALLOW_PRIVATE_ADDRESSES=true` を使用します。このオプションを有効にしても、設定されたオリジン許可リスト、HTTPS の要件、リダイレクトの検証は維持されます。ブロックダウンロードリクエストでは、Bark は環境の HTTP プロキシ設定や呼び出し元が提供するダイヤラーを使用しません。これらの規則はブロックダウンロードにのみ適用され、別途設定された Bark RPC クライアントが引き続きアーカイブ RPC 呼び出しを処理します。


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
