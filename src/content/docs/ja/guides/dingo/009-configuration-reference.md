---
title: Dingo v0.87.1 設定リファレンス
description: Dingo v0.87.1 に対応する完全な設定リファレンスとサンプル。
---
このページは Dingo v0.87.1 の設定を対象とします。説明、既定値、環境変数、コマンドラインフラグ、プロバイダー設定、デプロイ構成を含む完全なフィールドリファレンスは、リリースに対応する [`dingo.yaml.example` ファイル](https://raw.githubusercontent.com/blinklabs-io/dingo/v0.87.1/dingo.yaml.example)にあります。同じファイルは [Dingo v0.87.1 のソース](https://github.com/blinklabs-io/dingo/blob/v0.87.1/dingo.yaml.example)にも含まれます。

サンプルでは設定値がすべてコメントアウトされています。Dingo の組み込みの既定値を使用するには、そのままにしてください。既定値を変更する項目だけコメントを解除します。利用可能なフィールドや動作は変わる場合があるため、リリースに対応するサンプルを確認せずに別の Dingo リリースの設定ファイルをコピーしないでください。

<a id="configuration-precedence"></a>

## 設定の優先順位

設定の優先順位は、コマンドライン、環境変数、YAML ファイル、組み込みの既定値の順です。CLI フラグと環境変数の名前は、サンプルの各フィールドとともに記載されています。主要な実行時の選択については、[ノード設定とストレージモード](/ja/guides/dingo/005-node-configuration/)を参照してください。

<a id="configuration-areas"></a>

## 設定分野

| 分野 | 主な設定 | 用途 |
| --- | --- | --- |
| ネットワークとパス | `network`, `networkMagic`, `cardanoConfig`, `topology`, `databasePath`, `socketPath` | Cardano ネットワークを選択し、ノード、トポロジー、データの各ファイルの場所を指定します。 |
| リスナーと診断 | `bindAddr`, `privateBindAddr`, `relayPort`, `privatePort`, `metricsBindAddr`, `metricsAuthToken`, `metricsPort`, `healthPort`, `debugPort`, `debugBindAddr`, `tracing`, `tracingEndpoint`, `tracingServiceName`, `tracingSampleRatio`, `localStateQueryViewMaxLifetime` | ノードとプライベートリスナー、メトリクス、ヘルスプローブ、プロファイリング、トレーシング、LocalStateQuery スナップショットの有効期間を設定します。 |
| ログと TLS | `logging`, `tlsCertFilePath`, `tlsKeyFilePath`, `api.tls` | ログ出力を選択し、対応する API または Bark リスナーを保護します。 |
| ストレージと API | `storageMode`, `plugins.storage`, `plugins.mempool`, `plugins.api`, `corsAllowedOrigins` | 保存する履歴、ストレージプロバイダー、トランザクションの順序、アプリケーション API を選択します。 |
| コンセンサスとプラグインの選択 | `plugins.consensus` | ノードで使用するコンセンサスプロバイダーを選択します。 |
| ブートストラップと同期 | `mithril`, `mithril.downloadMaxBytes`, `mithril.server`, `mithril.server.aggregator`, `genesisBootstrap`, `genesisBootstrap.corroborationPeers`, `intersectTip`, `immutableDbPath`, `chainsync`, `validateHistorical`, `strictUtxoValidation` | スナップショットまたはジェネシスからのブートストラップ、同期、過去のデータの検証を設定します。 |
| ピア管理 | `targetNumberOfKnownPeers`, `targetNumberOfEstablishedPeers`, `targetNumberOfActivePeers`, `targetNumberOfRootPeers`, `activePeersTopologyQuota`, `activePeersGossipQuota`, `activePeersLedgerQuota`, `inboundWarmTarget`, `inboundHotQuota`, `inboundMinTenure`, `inboundHotScoreThreshold`, `inboundPruneAfter`, `inboundDuplexOnlyForHot`, `inboundCooldown` | ピア数の目標、取得元ごとの割り当て、着信ピアのポリシーを設定します。 |
| ブロック生成と台帳ルール | `blockProducer`, `shelley*`, `forge*`, `validateForgedBlock`, `minPoolMargin`, `pledgeLeverage*`, `fullPotRewards*`, `delegatorInactivity*`, `ledgerApplyRowBatchingEnabled`, `ledgerPrefetchAheadEnabled`, `ledgerValidateAheadEnabled` | ブロック生成鍵、安全性のしきい値、オプションの台帳動作を設定します。 |
| アーカイブとデータベースのライフサイクル | `bark*`, `historyExpiry`, `databaseLifecycle` | アーカイブデータの配信や取得、ローカル履歴の期限切れ、スナップショットの管理を設定します。 |
| 任意のインデックスと診断 | `midnight`, `midnight.authTokenPolicyId`, `midnight.authTokenAssetName`, `tokenRegistry`, `tokenRegistry.manifestUrl`, `tokenRegistry.trustedManifestKey`, `tokenRegistry.allowRollback`, `koiosParity`, `cache`, `skipRewardLiveStakeBackfillCheck` | 任意のインデックス作成、認証付きレジストリ更新、パリティ診断、キャッシュ、起動時検証を設定します。 |

<a id="consensus-provider"></a>

### コンセンサスプロバイダー

| 設定 | YAML キー | CLI フラグ | 環境変数 | 既定値と動作 |
| --- | --- | --- | --- | --- |
| コンセンサスプロバイダー | `plugins.consensus.provider` | `--consensus` | `DINGO_PLUGINS_CONSENSUS_PROVIDER` | 既定値は `praos` です。ヘッダー検証、チェーン比較、リーダースケジューリングに使用するコンセンサスプロバイダーを選択します。 |

Dingo は、選択したプロバイダーのデータベース識別子をデータディレクトリに記録します。保存された識別子が選択したプロバイダーと異なる場合は起動を拒否します。識別子のないデータベースは、組み込みの Praos プロバイダー識別子 `praos/v1` の場合にのみ受け入れ、その識別子を以降の確認用に記録します。

<a id="ledger-processing"></a>

### 台帳処理

| 設定 | YAML キー | CLI フラグ | 環境変数 | 既定値と動作 |
| --- | --- | --- | --- | --- |
| 台帳行の一括処理 | `ledgerApplyRowBatchingEnabled` | `--ledger-apply-row-batching-enabled` | `DINGO_LEDGER_APPLY_ROW_BATCHING_ENABLED` | `false`（無効）。core ストレージモードでは、対象となる未検証のブロック差分に複数行の一括処理を適用します。`serve` と `dingo load` にこの設定を渡します。API モードは既に一括処理を使用します。コンセンサスには影響しません。 |
| 台帳の先行読み取り | `ledgerPrefetchAheadEnabled` | `--ledger-prefetch-ahead-enabled` | `DINGO_LEDGER_PREFETCH_AHEAD_ENABLED` | `true`（有効）。検証済みブロックでは、現在のブロックの適用中に、読み取り専用トランザクションから次のブロックの入力 UTxO を先行読み取りします。無効にすると先行検証も無効になります。コンセンサスには影響しません。 |
| 台帳の先行検証 | `ledgerValidateAheadEnabled` | `--ledger-validate-ahead-enabled` | `DINGO_LEDGER_VALIDATE_AHEAD_ENABLED` | `true`（有効）。検証済みブロックのウィットネス署名を、ブロック適用で使用する前に検証します。`ledgerPrefetchAheadEnabled` が必要であり、先行読み取りを無効にすると先行検証も無効になります。コンセンサスには影響しません。 |
| Blockfetch の低水位開始 | `blockfetchLowWatermarkEnabled` | `--blockfetch-low-watermark-enabled` | `DINGO_BLOCKFETCH_LOW_WATERMARK_ENABLED` | `false`（無効）。ヘッダーがピアの先端から遠いときに有効にすると、4 つのヘッダー範囲がキューに入るのを待たず、1 つが入った時点で blockfetch を開始します。ヘッダーキューの容量は変わらず、コンセンサスにも影響しません。 |

<a id="metrics-listener"></a>

### メトリクスリスナー

| 設定 | YAML キー | CLI フラグ | 環境変数 | 既定値と動作 |
| --- | --- | --- | --- | --- |
| メトリクスのバインドアドレス | `metricsBindAddr` | `--metrics-bind-addr` | `DINGO_METRICS_BIND_ADDR` | `127.0.0.1`。`bindAddr` とは独立しており、既定ではループバックです。スクレーパーがコンテナまたはホストの外で動作する場合は、ワイルドカードまたはリモートから到達できるアドレスを明示的に設定します。 |
| メトリクスの認証トークン | `metricsAuthToken` | — | `DINGO_METRICS_AUTH_TOKEN` | 既定では空で、メトリクス認証は行いません。プロセス引数が他のユーザーに見える可能性があるため、CLI フラグはありません。設定した場合、クライアントはノードと Mithril の両方のメトリクスエンドポイントに `Authorization: Bearer <token>` を送信する必要があります。 |
| メトリクスポート | `metricsPort` | `--metrics-port` | — | 既定値は `12798` です。`0` にすると Prometheus リスナーが無効になります。 |

メトリクスリスナーは平文 HTTP を使用します。信頼できないネットワークを通過する場合は、TLS リバースプロキシまたは認証付きの暗号化トンネルでトークンを保護してください。

<a id="tracing"></a>

### トレーシング

| 設定 | YAML キー | CLI フラグ | 環境変数 | 既定値と動作 |
| --- | --- | --- | --- | --- |
| トレースコレクターのエンドポイント | `tracingEndpoint` | `--tracing-endpoint` | `DINGO_TRACING_ENDPOINT` | 既定では空です。OTLP HTTP コレクターの URL を設定するとトレーシングが有効になります。空の場合は `tracing` 設定で有効化を制御し、標準の `OTEL_EXPORTER_OTLP_*` 環境変数で送信先を選択します。 |
| トレースのサービス名 | `tracingServiceName` | `--tracing-service-name` | `DINGO_TRACING_SERVICE_NAME` | 既定値は `dingo` です。エクスポートするトレースのサービス名を設定します。 |
| トレースのサンプリング率 | `tracingSampleRatio` | `--tracing-sample-ratio` | `DINGO_TRACING_SAMPLE_RATIO` | 既定値は `1` です。`0` 以上 `1` 以下に設定します。範囲外の値は設定検証で拒否されます。 |

<a id="dmq-configuration"></a>

### DMQ の設定

| 設定 | YAML キー | CLI フラグ | 環境変数 | 既定値 | 検証と動作 |
| --- | --- | --- | --- | --- | --- |
| 有効化 | `dmq.enabled` | `--dmq-enabled` | `DINGO_DMQ_ENABLED` | `false` | 真偽値です。`false` はこの設定を無効にします。 |
| トピック | `dmq.topic` | `--dmq-topic` | `DINGO_DMQ_TOPIC` | `mithril` | 有効な場合、値は `mithril` である必要があります。それ以外は無効です。 |
| ネットワークマジック | `dmq.networkMagic` | `--dmq-network-magic` | `DINGO_DMQ_NETWORK_MAGIC` | 未設定の場合、トピックと Cardano ネットワークから導出します。 | 省略すると、トピックと Cardano ネットワークから値を導出します。明示した値は導出した値に優先します。ネットワークにそのトピックの既定値がない場合に設定してください。 |
| ソケットパス | `dmq.socketPath` | `--dmq-socket-path` | `DINGO_DMQ_SOCKET_PATH` | `dingo-dmq.socket` | 有効な場合、空ではなく、Cardano の `socketPath` とは異なる値が必要です。 |
| メッセージの TTL | `dmq.messageTtl` | `--dmq-message-ttl` | `DINGO_DMQ_MESSAGE_TTL` | `1800` 秒 | 有効な場合、`9223372036` 秒以下の正の値が必要です。 |
| メモリプールの最大サイズ | `dmq.maxMempoolSize` | `--dmq-max-mempool-size` | `DINGO_DMQ_MAX_MEMPOOL_SIZE` | `128` MB | 有効な場合、`8796093022207` MB 以下の正の値が必要です。 |
| N2N ピアポート | `dmq.n2nPort` | `--dmq-n2n-port` | `DINGO_DMQ_N2N_PORT` | `0` | `0` は N2N ポートを無効にします。現在の DMQ スタックでは、0 以外の値を設定してもピアの待ち受けや接続は有効になりません。 |
| IPv4 ピアリスナーのアドレス | `dmq.listenAddress` | `--dmq-listen-address` | `DINGO_DMQ_LISTEN_ADDRESS` | `0.0.0.0` | `dmq.n2nPort` が 0 以外で、このフィールドを設定する場合は、IPv4 リテラルが必要です。 |
| IPv6 ピアリスナーのアドレス | `dmq.listenIpv6Address` | `--dmq-listen-ipv6-address` | `DINGO_DMQ_LISTEN_IPV6_ADDRESS` | `::` | `dmq.n2nPort` が 0 以外で、このフィールドを設定する場合は、IPv6 リテラルが必要です。 |
| DMQ ピアトポロジーファイル | `dmq.topologyFile` | `--dmq-topology-file` | `DINGO_DMQ_TOPOLOGY_FILE` | 未設定 | 設定する場合、パスには `..` による移動を含めず、既存の通常ファイルを指定します。DMQ ソケットを開く前に読み込み、検証します。 |
| DMQ ピアの最小数 | `dmq.minPeers` | `--dmq-min-peers` | `DINGO_DMQ_MIN_PEERS` | `3` | `dmq.minPeers <= dmq.maxPeers` が必要です。`0` は必要なピア数を 0 にします。現在の DMQ スタックでは最小ピア数は強制されません。 |
| DMQ ピアの最大数 | `dmq.maxPeers` | `--dmq-max-peers` | `DINGO_DMQ_MAX_PEERS` | `10` | `dmq.minPeers <= dmq.maxPeers` が必要です。`minPeers` も `0` の場合、`0` はピアを許可しません。現在の DMQ スタックでは最大ピア数は強制されません。 |

DMQ の起動時に、これら 6 つのピア設定を検証します。`dmq.n2nPort: 0` の場合はリスナーアドレスの検証を省略します。0 以外の場合、各リスナーアドレスは対応する IP バージョンである必要があります。ピアマネージャーとトランスポートは、まだトポロジーファイルを接続に使用しません。

`dmq.topologyFile` を設定した場合、DMQ ソケットを開く前に次のトポロジールールを適用します。

- ファイルは `10 MiB` 以下の JSON オブジェクトである必要があります。不正な JSON、JSON の `null`、大文字と小文字だけが異なるオブジェクトキーは拒否されます。
- `localRoots` または `publicRoots` の各アクセスポイントには、空でないホストと `1` から `65535` のポートが必要です。ホストの前後の空白と IPv6 の角括弧は除去されます。
- ルートには `valency` を使用します。省略した場合は別名として `hotValency` を使用でき、両方がある場合は `valency` が優先されます。`warmValency` の既定値は `valency` であり、それ以上である必要があります。valency はアクセスポイント数を超えてもかまいません。
- 異なるホストとポートの組を 1 回ずつ数えます。ホスト名は大文字と小文字や末尾のドットを区別せず、名前解決せずに IP リテラルを正規化します。
- `bootstrapPeers` または `peerSnapshotFile` に値がある場合は警告し、両フィールドを無視します。`useLedgerAfterSlot` も無視します。

ファイルの読み込み後に異なるピアの数をログに記録し、ピアが 1 つもない場合は警告します。不正なトポロジーの場合、DMQ ソケットを開く前に起動に失敗します。

<a id="immutabledb-source"></a>

### ImmutableDB の取得元

`immutableDbPath` と `dingo load` の位置引数には、ローカルディレクトリまたはリモート URL を指定できます。リモート取得元には `https://` が必要です。`http://` はループバックホストでのみ使用でき、それ以外の HTTP は拒否されます。HTTPS では、最初の URL、すべてのリダイレクト、各接続時の DNS 解決について、プライベートまたは特殊用途の接続先を拒否します。リモートインポートでは環境の HTTP プロキシ設定を無視します。リモートのルートは `tip.json` と、番号付きの `.chunk`、`.primary`、`.secondary` の 3 ファイル組を提供します。不一致または不完全な公開チャンクデータは拒否されます。要求したチャンク範囲から、転送バイト数、キャッシュとステージング、空き領域の予約、並行処理の合計上限を導出します。上限を超えるか空き領域が不足すると、エラーを報告してインポートに失敗し、ステージングファイルを削除します。リモートインポートで、コピー済み immutable ブロックが台帳適用済みの先端を越えた後に信頼済み再実行または処理が失敗した場合、元のエラーを返す前に未適用ブロックをその先端まで巻き戻します。このため、ステージングの後処理だけが行われて未適用の immutable ブロックが台帳の先端より先に残ることはありません。ストレージバックエンドが巻き戻しを拒否した場合は、元のエラーと巻き戻しエラーの両方を返し、次のロード前にデータベースの復旧が必要になります。取得元、チャンク、整合性の要件はブートストラップとデータ保守ガイドを参照してください。

<a id="genesis-bootstrap-corroboration"></a>

### Genesis ブートストラップの裏付け確認

| 設定 | YAML キー | CLI フラグ | 環境変数 | 既定値と動作 |
| --- | --- | --- | --- | --- |
| 裏付け確認用ピア | `genesisBootstrap.corroborationPeers` | `--genesis-bootstrap-corroboration-peers` | `DINGO_GENESIS_BOOTSTRAP_CORROBORATION_PEERS` | 既定値は `1` です。高速な取得元が Genesis 選択を駆動するには、独立した 1 つのピアから同じ最近のブロックが報告される必要があります。意図的な単一ピアまたはテスト構成でこの確認を無効にするには、明示的に `0` を設定します。 |

Musashi では、Cardano ノード設定の `ConsensusMode: PraosMode` が Genesis チェーン選択を無効にします。`genesisBootstrap` が有効で、交差ポイントなしに起点から起動した場合も同じです。この場合、Dingo は Genesis の密度、裏付け確認、patience による選択を適用せず、Cardano の設定に従います。

<a id="blockfrost-provider"></a>

### Blockfrost プロバイダー

組み込みの Blockfrost プロバイダーは、既定でループバックで待ち受けます。読み取り専用 API リクエストには Blockfrost の変更操作の受け入れ制限は適用されませんが、設定されていれば共有 API 認証は適用されます。

| 設定 | YAML キー | CLI フラグ | 環境変数 | 既定値と検証 |
| --- | --- | --- | --- | --- |
| ホスト | `plugins.api.blockfrost.config.host` | — | — | 既定値は `127.0.0.1` です。明示的に空にするとルートの `bindAddr` を使用します。別のインターフェイスで公開するにはホストを設定します。 |
| 認証トークン | `plugins.api.blockfrost.config.authToken` | — | — | 既定では空です。トランザクションの送信と評価には、`project_id`、`X-Blockfrost-Project-Id`、`Authorization: Bearer <token>` のいずれかでこのトークンを送信します。認証情報がないか無効な場合は HTTP `401` を返します。 |
| 変更操作全体の同時実行数 | `plugins.api.blockfrost.config.maxConcurrentMutations` | — | — | 既定値は `4` です。正の値が必要で、プロバイダー全体のトランザクション送信と評価を制限します。 |
| クライアントごとの変更操作の同時実行数 | `plugins.api.blockfrost.config.maxConcurrentMutationsPerClient` | — | — | 既定値は `1` です。正の値かつ `maxConcurrentMutations` 以下である必要があり、1 つのリモートアドレスからの処理を制限します。 |

`authToken` を設定し、ループバック以外で待ち受ける場合は、`plugins.api.blockfrost.config.tls` でサーバー TLS を設定します。Dingo はサーバー TLS なしの認証付き変更アクセスでの起動を拒否します。認証後、本文を読む前に両方の変更操作制限を適用し、どちらかの空きがない場合は、本文を読まずに `Retry-After: 1` を含む HTTP `429` を返します。

<a id="localstatequery-snapshot-lifetime"></a>

### LocalStateQuery スナップショットの有効期間

| 設定 | YAML キー | CLI フラグ | 環境変数 | 既定値 | 検証と動作 |
| --- | --- | --- | --- | --- | --- |
| 取得した台帳スナップショットの最大有効期間 | `localStateQueryViewMaxLifetime` | `--local-state-query-view-max-lifetime` | `DINGO_LOCAL_STATE_QUERY_VIEW_MAX_LIFETIME` | `5m` | `5m` などの正の期間文字列を指定します。不正な値、0、負の値は起動時または設定検証で拒否されます。有効期間を過ぎると、保持中のスナップショットを閉じます。次のクエリは取得済みのポイントで再度開き、そのスナップショットから回答します。先端を取得した場合は、取得時の先端を使用します。ロールバックまたは保持期間によるプルーニングで取得済みのポイントが削除された場合は、再度開けないため接続を閉じます。 |

<a id="mithril-synchronization-and-backend"></a>

### Mithril の同期とバックエンド

| 設定 | YAML キー | CLI フラグ | 環境変数 | 既定値と動作 |
| --- | --- | --- | --- | --- |
| 自動管理の Mithril 同期 | `mithril.enabled` | `--mithril-enabled` | `DINGO_MITHRIL_ENABLED` | `false`（無効）。core ストレージでの `serve` では、認証済み Mithril v2 の先端から同期でき、自動管理の Mithril 同期が失敗すると Ouroboros 同期に切り替えます。手動の Mithril 同期コマンドはこの設定に関係なく使用できます。 |
| Mithril アーティファクトのバックエンド | `mithril.backend` | `--mithril-backend` | `DINGO_MITHRIL_BACKEND` | `v2`（空の場合も `v2`）。`v1` と v1 CLI パスは拒否されます。v2 は増分 Cardano データベースアーティファクトを使用し、ブートストラップ時に検証済みの付属台帳状態と immutable ダイジェストを要求します。v2 アーティファクトの配置を正とします。 |
| Mithril の固定ダイジェスト | `mithril.pinnedDigest` | `--mithril-pinned-digest` | `DINGO_MITHRIL_PINNED_DIGEST` | 既定では空です。新規ブートストラップで設定する場合は、v2 Cardano データベースアーティファクトを識別する値が必要です。v1 スナップショットの固定値やダイジェストは拒否されます。 |

<a id="mithril-download-limit"></a>

### Mithril のダウンロード制限

| 設定 | YAML キー | CLI フラグ | 環境変数 | 既定値と動作 |
| --- | --- | --- | --- | --- |
| Mithril オブジェクトごとの圧縮サイズ上限 | `mithril.downloadMaxBytes` | `--mithril-download-max-bytes` | `DINGO_MITHRIL_DOWNLOAD_MAX_BYTES` | `0` は組み込みのオブジェクト別圧縮サイズ上限を使用します。正の値を設定すると、すべてのダウンロードオブジェクトでその上限を使用します。負の値は起動時または設定検証で拒否されます。 |

`mithril.downloadMaxBytes` が `0` の場合、次の組み込み圧縮サイズ上限を使用します。

| Mithril オブジェクト | 組み込み上限 |
| --- | --- |
| v2 immutable アーカイブ | `1 GiB` |
| v2 ダイジェスト一覧 | `256 MiB` |
| v2 付属データ | `64 GiB` |

<a id="mithril-artifact-server"></a>

### Mithril アーティファクトサーバー

`mithril.server` は `dingo mithril snapshot create` と `dingo mithril serve` を制御します。スナップショットアーティファクトの読み取りは公開されます。アグリゲーターの署名者登録と登録締め切りには、`mithril.server.aggregator.operatorTokenFile` の Bearer トークンが必要です。ループバック以外へのアグリゲーターのバインドには TLS が必要です。スナップショットのダウンロード場所に現れる公開オリジンを `mithril.server.publicBaseUrl` に設定します。HTTP ループバックオリジンを除き、HTTPS を使用してください。

| 設定 | YAML キー | CLI フラグ | 環境変数 | 既定値と動作 |
| --- | --- | --- | --- | --- |
| アーティファクトサーバーのポート | `mithril.server.port` | `--mithril-server-port` | `DINGO_MITHRIL_SERVER_PORT` | `8081`。`dingo mithril serve` はこのポートとルートの `bindAddr` で待ち受けます。 |
| スナップショットの公開オリジン | `mithril.server.publicBaseUrl` | `--mithril-server-public-base-url` | `DINGO_MITHRIL_SERVER_PUBLIC_BASE_URL` | `dingo mithril serve` で必須です。認証情報、パス、クエリ、フラグメントを含まないオリジンを指定します。ループバック HTTP を除き HTTPS が必要です。 |
| アーティファクトストア | `mithril.server.artifactStore` | `--mithril-server-artifact-store` | `DINGO_MITHRIL_SERVER_ARTIFACT_STORE` | 空です。ファイルシステムのディレクトリ、`s3://bucket/prefix`、`gcs://bucket/prefix` を指定します。後者 2 つには `dingo_extra_plugins` を有効にしたビルドが必要です。 |
| リダイレクト先の基底 URL | `mithril.server.redirectBaseUrl` | `--mithril-server-redirect-base-url` | `DINGO_MITHRIL_SERVER_REDIRECT_BASE_URL` | 空です。設定すると、アーカイブリクエストはオブジェクトをストリーム配信せず、この URL にオブジェクトキーを加えた場所へリダイレクトします。リモートオブジェクトが公開読み取り可能な場合のみ使用します。 |
| スナップショットの保持数 | `mithril.server.keepSnapshots` | `--mithril-server-keep-snapshots` | `DINGO_MITHRIL_SERVER_KEEP_SNAPSHOTS` | `0` は生成したすべてのスナップショットを保持します。正の値は、最新のスナップショットをその件数だけ保持します。 |
| 付属データの署名鍵 | `mithril.server.ancillarySigningKeyFile` | `--mithril-server-ancillary-signing-key-file` | `DINGO_MITHRIL_SERVER_ANCILLARY_SIGNING_KEY_FILE` | 空です。各付属マニフェストに署名する Ed25519 Mithril JSON hex 鍵を設定します。 |
| アーティファクトサーバーの TLS | `mithril.server.tlsEnabled` | `--mithril-server-tls-enabled` | `DINGO_MITHRIL_SERVER_TLS_ENABLED` | `false`。有効な場合は共有の `tlsCertFilePath` と `tlsKeyFilePath` を使用します。 |
| アグリゲーターのエンドポイント | `mithril.server.aggregator.enabled` | `--mithril-aggregator-enabled` | `DINGO_MITHRIL_AGGREGATOR_ENABLED` | `false`。署名者登録、署名収集、スナップショット認証を有効にします。 |
| 署名者の登録エポック | `mithril.server.aggregator.epoch` | `--mithril-aggregator-epoch` | `DINGO_MITHRIL_AGGREGATOR_EPOCH` | `0` では有効なエポックを選択しません。アグリゲーターを有効にする場合は `1` 以上を設定します。ジェネシス証明書は前のエポックを使用します。 |
| STM 定足数 | `mithril.server.aggregator.k` | `--mithril-aggregator-k` | `DINGO_MITHRIL_AGGREGATOR_K` | 設定されるまでは `0` です。`m` 以下の正の定足数を指定します。 |
| STM 抽選数 | `mithril.server.aggregator.m` | `--mithril-aggregator-m` | `DINGO_MITHRIL_AGGREGATOR_M` | 設定されるまでは `0` です。アグリゲーターを有効にする場合は正の値を指定します。 |
| STM 当選確率 | `mithril.server.aggregator.phiF` | `--mithril-aggregator-phi-f` | `DINGO_MITHRIL_AGGREGATOR_PHI_F` | 設定されるまでは `0` です。`0` より大きく `1` 以下の値を指定します。 |
| アグリゲーターのジェネシス署名鍵 | `mithril.server.aggregator.genesisSigningKeyFile` | `--mithril-aggregator-genesis-signing-key-file` | `DINGO_MITHRIL_AGGREGATOR_GENESIS_SIGNING_KEY_FILE` | アグリゲーターを有効にする場合は必須です。Ed25519 Mithril JSON hex 鍵を指定します。 |
| アグリゲーターのオペレータートークン | `mithril.server.aggregator.operatorTokenFile` | `--mithril-aggregator-operator-token-file` | `DINGO_MITHRIL_AGGREGATOR_OPERATOR_TOKEN_FILE` | アグリゲーターを有効にする場合は必須です。32 バイト以上のランダム値を含むファイルを指定します。 |

<a id="sqlite-metadata-storage-validation"></a>

### SQLite メタデータストレージの検証

`plugins.storage.metadata.provider` が `sqlite` の場合、または省略して既定の `sqlite` が使用される場合、ルートの `databasePath` を空でない値に設定します。いずれの場合も `databasePath` が空なら起動を拒否します。

<a id="sql-metadata-tls"></a>

### SQL メタデータの TLS

プロバイダーが生成する PostgreSQL 接続は、既定で `sslMode: verify-full` を使用し、サーバー証明書とホスト名を検証します。プロバイダーが生成する MySQL 接続は、`sslMode` が未設定でホストがループバック以外の場合、`tls=true` を使用します。`localhost`、`127.0.0.1`、`::1` は、このリモート TLS の自動既定値の対象外です。明示的な `dsn` がある場合はそれを優先し、プロバイダーが生成する既定値を適用しません。

MySQL のスナップショットと復元は、接続を機会的 TLS に弱めず、`tls=skip-verify` を拒否します。ライフサイクル操作で別の設定が必要な場合は、`tls=false`、`tls=true`、`tls=preferred` など、対応するモードを明示してください。

<a id="midnight-auth-token-configuration"></a>

### Midnight 認証トークンの設定

登録の認可で特定のポリシーとアセットを使用する場合は、`midnight` の下に Midnight 認証トークンのフィールドを設定します。

| 設定 | YAML キー | 既定値 | 検証と動作 |
| --- | --- | --- | --- |
| 認証トークンのポリシー ID | `midnight.authTokenPolicyId` | 空 | 56 文字ちょうどの 16 進数で、デコードすると 28 バイトになる値が必要です。 |
| 認証トークンのアセット名 | `midnight.authTokenAssetName` | 空 | 認証トークンの検証時に、設定されたポリシー ID とともに使用します。 |

両方のフィールドを設定するか、両方とも空にします。片方だけでは設定と起動時の検証に失敗します。設定した場合、認証トークンのポリシー ID とアセット名が、設定値と完全に一致する場合にのみ受け入れます。

<a id="badger-value-log-garbage-collection"></a>

### Badger 値ログのガベージコレクション

Badger プロバイダーでは、`plugins.storage.blob.config` の下にこれらの YAML キーを設定します。対応するトップレベルの CLI フラグや環境変数はありません。

`plugins.storage.blob.config.valueThreshold` の既定値は `1 MiB` です。ただし、Core モードの `sync` と Mithril 同期では `1 KiB` を使用します。明示した YAML 値は、`0` も含め、どちらのモードの既定値にも優先します。

| 設定 | プロバイダーの YAML キー | 既定値 | 検証と動作 |
| --- | --- | --- | --- |
| Memtable のサイズ | `plugins.storage.blob.config.memTableSize` | ストレージモードが `core` で実行モードが `sync` の場合のみ `512 MiB`。それ以外のモードの組み合わせで、この設定を省略または `0` にした場合は `128 MiB`。 | バイト数を指定します。明示した値は組み込みの既定値に優先します。トップレベルの CLI フラグや環境変数はありません。 |
| 値ログ GC の間隔 | `plugins.storage.blob.config.gcInterval` | `5m` | 0 の間隔は既定値 `5m` を選択します。負の間隔は拒否されます。 |
| 値ログ GC の破棄率 | `plugins.storage.blob.config.gcDiscardRatio` | `0.5` | `0` より大きく `1` より小さい値が必要です。 |

Badger プロバイダーで `plugins.storage.blob.config.gc` を `true` に設定しても、一括インポートモードの `load` と `sync` では値ログ GC は無効のままです。

<a id="database-lifecycle-snapshot-pause-bound"></a>

### データベーススナップショットの停止時間上限

| 設定 | YAML キー | CLI フラグ | 環境変数 | 既定値 | 検証と対象範囲 |
| --- | --- | --- | --- | --- | --- |
| スナップショットのコミット停止時間上限 | `databaseLifecycle.snapshotMaxCommitPause` | `--db-snapshot-max-commit-pause` | `DINGO_DB_LIFECYCLE_SNAPSHOT_MAX_COMMIT_PAUSE` | `30s`。`0s` は上限なし。 | 0 以上の期間を指定します。負の値は設定検証で拒否されます。正の値は、手動のオフライン、ライブ、自動エポック境界スナップショットのすべてで、コミットバリア取得後の処理時間を制限します。上限を超えるとスナップショットをキャンセルし、部分的な出力を削除し、`ErrCommitPauseExceeded` をラップしたエラーを返します。 |

<a id="database-lifecycle-snapshot-trust-key"></a>

### データベーススナップショットの信頼鍵

| 設定 | YAML キー | CLI フラグ | 環境変数 | 既定値と検証 |
| --- | --- | --- | --- | --- |
| スナップショット信頼鍵ファイル | `databaseLifecycle.snapshotTrustKeyFile` | `--db-snapshot-trust-key-file` | `DINGO_DB_LIFECYCLE_SNAPSHOT_TRUST_KEY_FILE` | 既定では空です。指定するファイルは 16 バイト以上 1024 バイト以下の通常ファイルで、シンボリックリンクではない必要があります。 |

Unix では、ファイルは現在のユーザーの所有で、グループや他のユーザーに権限を付与していない必要があります。Windows では、所有者は現在のユーザー、またはプロセスが所属する `BUILTIN\Administrators` である必要があります。DACL に含められるのは、所有者、`Administrators`、`SYSTEM`、`Creator Owner`、`Owner Rights` のみです。`Administrators` が所有する場合は、制限されたローカル `Administrator` ACE も含められます。スナップショット認証時、および信頼鍵が必要なライフサイクル操作時に、不正なファイルを拒否します。

<a id="bark-remote-lifecycle-service"></a>

### Bark のリモートライフサイクルサービス

Bark のリモートライフサイクルサービスは既定で無効です。有効にすると、Bark 経由で `Stop`、`Restart`、`GetStatus` を提供します。サービスをマウントした場合の既定のアドレスは `127.0.0.1` です。別のインターフェイスで公開するには `barkHost` を設定します。

| 設定 | YAML キー | CLI フラグ | 環境変数 | 既定値と要件 |
| --- | --- | --- | --- | --- |
| ライフサイクルサービスの有効化 | `barkLifecycleEnabled` | `--bark-lifecycle-enabled` | `DINGO_BARK_LIFECYCLE_ENABLED` | `false`。有効にするには、0 以外の `barkPort`、`barkClientCaFilePath`、`tlsCertFilePath` と `tlsKeyFilePath` の両方、および 1 つ以上の `barkLifecycleOperatorCertificateFingerprints` が必要です。 |
| ライフサイクルオペレーターの証明書 | `barkLifecycleOperatorCertificateFingerprints` | `--bark-lifecycle-operator-certificate-fingerprints` | `DINGO_BARK_LIFECYCLE_OPERATOR_CERTIFICATE_FINGERPRINTS` | 既定では空です。各値はクライアント証明書の DER バイト列の SHA-256 フィンガープリントを 16 進数で指定します。コロンを含めることができ、大文字と小文字は区別しません。この認証情報が認可するのは `Stop` と `Restart` のみです。 |
| ブロックダウンロードのプライベートまたは特殊用途アドレス | `barkBlockDownloadAllowPrivateAddresses` | `--bark-block-download-allow-private-addresses` | `DINGO_BARK_BLOCK_DOWNLOAD_ALLOW_PRIVATE_ADDRESSES` | `false`。`true` にすると、Bark のブロックダウンロード先で、名前解決後のプライベートまたは特殊用途アドレスを許可します。オリジン許可リスト、HTTPS 要件、リダイレクト検証、プロキシ無効化は維持されます。ブロックダウンロードにのみ影響し、Bark RPC 通信には影響しません。 |

すべてのライフサイクル操作に、`barkClientCaFilePath` に対して検証されたクライアント証明書が必要です。`Stop` と `Restart` には、さらにオペレーターリスト内のフィンガープリントとの一致が必要です。`GetStatus` には mTLS が必要ですが、この許可リストは不要です。DatabaseService のオペレーター認証情報は独立しており、ライフサイクルアクセスを認可しません。`Restart` は Unix で使用でき、それ以外では未対応操作のエラーを返します。

<a id="bark-archive-lookup-budgets"></a>

### Bark アーカイブ検索の制限

| 設定 | YAML キー | CLI フラグ | 環境変数 | 既定値と検証 |
| --- | --- | --- | --- | --- |
| アーカイブ検索全体の毎秒上限 | `barkArchiveLookupsPerSecond` | `--bark-archive-lookups-per-second` | `DINGO_BARK_ARCHIVE_LOOKUPS_PER_SECOND` | `0` の場合は `200`。すべての匿名 `ArchiveService` 呼び出し元に適用します。負の値は拒否されます。 |
| 呼び出し元ごとのアーカイブ検索の毎秒上限 | `barkArchiveCallerLookupsPerSecond` | `--bark-archive-caller-lookups-per-second` | `DINGO_BARK_ARCHIVE_CALLER_LOOKUPS_PER_SECOND` | `0` の場合は `50`。IPv4 アドレスまたは IPv6 `/64` を呼び出し元の識別に使用します。負の値は拒否されます。 |

Dingo は `FetchBlock` の参照バッチ全体を両方の制限に計上します。どちらかの枠が不足する場合は、アーカイブやクラウドを検索する前に、リクエスト全体を `RESOURCE_EXHAUSTED` で拒否します。

<a id="file-backed-secret-and-parity-inputs"></a>

### ファイルによる秘密情報とパリティ入力

ファイル入力は、値を直接指定する代わりに使用できます。CLI、環境変数、YAML、組み込みの既定値の優先順位は前述と同じです。同じ設定元で直接指定とファイル指定の両方を設定すると拒否されます。

| 設定 | YAML キー | CLI フラグ | 環境変数 | 既定値と動作 |
| --- | --- | --- | --- | --- |
| Dingo Koios パリティ API 鍵ファイル | `koiosParity.apiKeyFile` | `--koios-parity-api-key-file` | `DINGO_KOIOS_PARITY_API_KEY_FILE` | 既定では空です。`koiosParity.apiKey`、`--koios-parity-api-key`、`DINGO_KOIOS_PARITY_API_KEY` の代わりに使用します。ファイルを API 鍵の文字列として読み取ります。 |
| 汎用プラグイン設定フィールドのファイル | — | — | `DINGO_PLUGINS_<CAPABILITY>_CONFIG_<FIELD>_FILE` | `DINGO_PLUGINS_<CAPABILITY>_CONFIG_<FIELD>` の代わりに使用します。ファイルを通常の文字列として読み取り、YAML として解析しません。 |
| `koios-parity` API 鍵ファイル | — | `--api-key-file` | `KOIOS_API_KEY_FILE` | `--api-key` または `KOIOS_API_KEY` の代わりに使用します。CLI フラグは環境変数より優先されます。 |
| `koios-parity` メタデータ DSN ファイル | — | `--metadata-dsn-file` | — | `--metadata-dsn` の代わりに使用します。ファイルは接続文字列を通常のテキストで指定します。 |
| `node-parity from-genesis` Koios API 鍵ファイル | — | `--koios-api-key-file` | — | `--koios-api-key` の代わりに使用します。Koios リクエストに使用する API 鍵をファイルで指定します。 |

ファイルから読み取る値は、次の要件を満たす必要があります。

- パスは通常ファイルを指定する必要があります。ディレクトリ、デバイス、その他の通常ファイル以外は拒否されます。
- ファイル内容は最大 `64 KiB` です。末尾の `CR` と `LF` を除去し、空または空白のみの内容を拒否します。
- 権限または ACL はプラットフォームのセキュリティポリシーを満たす必要があります。Unix では所有者とグループのアクセスを許可できますが、その他のユーザーには許可できません。Windows の ACL では所有者、Administrators、SYSTEM のみを許可できます。
- エラーでは値またはパスを示しますが、ファイル内容は含めません。

<a id="token-registry-manifest-authentication"></a>

### トークンレジストリのマニフェスト認証

トークンレジストリの同期を有効にする場合、署名付きマニフェスト URL と、その検証に用いる信頼する公開鍵が必要です。

| 設定 | YAML キー | CLI フラグ | 環境変数 | 既定値と動作 |
| --- | --- | --- | --- | --- |
| 署名付きマニフェスト URL | `tokenRegistry.manifestUrl` | `--token-registry-manifest-url` | `DINGO_TOKEN_REGISTRY_MANIFEST_URL` | 既定では空です。トークンレジストリの同期を有効にする場合は必須です。絶対 HTTPS URL を指定します。 |
| 信頼するマニフェスト鍵 | `tokenRegistry.trustedManifestKey` | `--token-registry-trusted-manifest-key` | `DINGO_TOKEN_REGISTRY_TRUSTED_MANIFEST_KEY` | 既定では空です。トークンレジストリの同期を有効にする場合は必須です。32 バイトの Ed25519 公開鍵を 16 進数で指定します。 |
| マニフェストのロールバックを許可 | `tokenRegistry.allowRollback` | `--token-registry-allow-rollback` | `DINGO_TOKEN_REGISTRY_ALLOW_ROLLBACK` | 既定値は `false`。公開者による意図的なロールバックの場合のみ `true` にします。 |

`tokenRegistry.sourceUrl` を明示する場合、それも絶対 HTTPS URL である必要があります。スナップショットの適用前に、署名付きマニフェストを、設定したアーカイブ URL、正確な圧縮サイズ、BLAKE2b-256 ダイジェストに対して検証します。ロールバック検査に用いるシーケンス番号もマニフェストから取得します。

未認証、不一致、不完全なスナップショットは拒否されます。`allowRollback` が `true` でない限り、小さいシーケンス番号も拒否し、同じシーケンス番号でダイジェストが変わる場合も拒否します。拒否されたスナップショットが最後に受け入れたものを置き換えることはありません。

<a id="token-registry-header-credentials"></a>

### トークンレジストリのヘッダー認証情報

認証付きトークンレジストリミラーの認証情報には `tokenRegistry.headerSecrets` を使用します。YAML ではヘッダー名から秘密の値へのマップを指定します。

```yaml
tokenRegistry:
  headerSecrets:
    Authorization: "Bearer <token>"
```

環境変数は `DINGO_TOKEN_REGISTRY_HEADER_SECRETS` で、`name:value` の組をカンマで区切ります。最初のコロンで各組を分割するため、値は追加のコロンを含められますが、カンマは含められません。プロセス一覧で認証情報が見えるため、CLI フラグはありません。

Dingo は出力する設定とエラーからヘッダー値を秘匿します。ヘッダー認証情報を持つリクエストは、HTTPS の取得元 URL またはループバックの取得元を使用する必要があります。不正なヘッダー名や値、およびトランスポートやリクエストで使用する予約済みヘッダー名は拒否されます。リダイレクトでスキームまたはホストが変わる場合は、追従前に設定した認証情報を削除します。

<a id="block-production"></a>

### ブロック生成

Dingo v0.77.1 は `ForgePrimaryChainTipToleranceSlots` と `forgePrimaryChainTipToleranceSlots` を YAML、CLI、環境変数から削除しました。別のフィールドに置き換えるのではなく、これらの設定を削除してください。

任意の `forgeAppliedTipStalenessSlots` は、YAML、CLI フラグ `--forge-applied-tip-staleness-slots`、環境変数 `DINGO_FORGE_APPLIED_TIP_STALENESS_SLOTS` で設定します。既定値の `0` は上限を無効にします。裏付け確認済みの上流ターゲットがある場合のみ評価し、ターゲットが不明な場合は無視します。

<a id="shelley-kes-agent-socket"></a>

#### Shelley KES エージェントソケット

`--shelley-kes-agent-socket` はファイルシステムのソケットパスと Linux の抽象ソケットアドレスに対応します。相対パスはクライアント構築時に一度解決し、再接続でもそのパスを再利用します。`@` で始まる抽象アドレスは保持し、NUL 文字で始まるアドレスは構築時に拒否します。プラットフォームのソケット長制限も適用します。

<a id="kupo-provider"></a>

### Kupo プロバイダー

任意の Kupo プロバイダーは `plugins.api.kupo` の下に設定します。組み込みプロバイダーには `provider: "builtin"` を使用します。Kupo には `storageMode: api` が必要です。CLI では `--kupo-provider` でプロバイダーを選択します。`plugins.api.kupo.config.port` を `0` にすると Kupo リスナーを無効にします。

サンプルには、リレー、API/データ、ブロックプロデューサー、アーカイブ、履歴期限切れ、開発用ノードの構成例もコメントとして含まれます。コンセンサス、ブロック生成、ネットワーク公開範囲を変更する設定を有効にする前に、各構成例の注意事項を確認してください。


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
