---
title: ブートストラップとデータ保守
description: Mithril で Dingo をブートストラップし、ローカルデータベースを安全に保守します。
---
<a id="bootstrap-from-mithril"></a>

## Mithril からのブートストラップ

Dingo は Mithril クライアントを備え、ネットワークのスナップショットをダウンロードしてインポートした後、残りのブロックを同期します。通常は次の手順を使用します。

```sh
dingo mithril list
dingo mithril show <snapshot-hash>
dingo mithril sync --config ./dingo.yaml
dingo serve --config ./dingo.yaml
```

インストールした Dingo バージョンが対応するコマンドを使用してください。正確なフラグは `dingo mithril --help` で確認できます。Mithril スナップショット検証は、証明書チェーンと署名付きスナップショットデータを確認します。インポート後は、そのポイント以降のブロックを検証します。API ストレージモードは、さらに過去のクエリデータをバックフィルします。core モードは、過去の完全な API インデックスを持たず、コンセンサス状態とブロックデータを保持します。

初回実行の詳しい手順は[クイックスタート](/ja/guides/dingo/002-quick-start-overview/)を参照してください。スナップショットのサイズ、ディスク使用量、ロード時間はネットワークによって異なり、チェーンの進行とともに増えます。インポート中は、ダウンロードファイルとデータベースの両方に必要な空き領域を確保してください。

<a id="produce-and-serve-mithril-artifacts"></a>

### Mithril アーティファクトの作成と配信

Cardano ノードのデータベースから Mithril アーティファクトを作成し、設定した Mithril サーバーから保存済みアーティファクトを配信します。

```sh
dingo mithril snapshot create --db-dir <cardano-node db>
dingo mithril serve --config ./dingo.yaml
```

作成や配信の前に `mithril.server.artifactStore` を設定します。`mithril.server.publicBaseUrl` は公開の `https://` オリジンを指定します。`http://` はループバックのみで許可されます。配信ポートは `mithril.server.port` です。サーバーはアーティファクトの読み取りを公開し、クライアントは HTTP Range リクエストでダウンロードできます。

公開オブジェクトストアへのアーカイブリクエストのリダイレクトには `mithril.server.redirectBaseUrl`、共有 Dingo 証明書による HTTPS の有効化には `mithril.server.tlsEnabled`、最新のスナップショットの保持数には `mithril.server.keepSnapshots` を使用します。Dingo が署名を収集してスナップショットを認証する必要がある場合は、任意の `mithril.server.aggregator` 設定を有効にします。登録と署名操作に用いる Bearer トークンを `mithril.server.aggregator.operatorTokenFile` で指定してください。ループバック以外へのアグリゲーターのバインドには TLS も必要です。`server` と `aggregator` の全設定は、[`mithril` の設定リファレンス](https://raw.githubusercontent.com/blinklabs-io/dingo/v0.87.0/dingo.yaml.example)を参照してください。

Mithril v2 ブートストラップは、設定されたアグリゲーターのオリジンまたは公式の `storage.googleapis.com` Mithril オリジンからの取得先とリダイレクトのみを受け入れます。`https://` の要件と、ループバック宛てのローカル開発例外は維持されます。各ブートストラップは、アーティファクトとリダイレクトのリクエスト数およびバイト数をまとめて全体予算に計上し、24 時間のダウンロード期限を適用します。immutable アーカイブは 100000 個に制限し、アーティファクトの各構成要素の取得先を重複排除して最大 4 個に制限します。展開時もエントリー数と展開後のバイト数を制限し、必要な空き領域を予約します。これらの保護には組み込みの上限を適用します。

展開前に、署名付き付属マニフェストと、その許可されたパスおよびダイジェストを検証します。immutable アーカイブから未認証の台帳ツリーを受け入れることはなく、台帳状態は署名付き付属アーカイブからのみ復元します。

<a id="load-an-immutabledb-from-a-local-or-remote-source"></a>

## ローカルまたはリモートからの ImmutableDB のロード

`dingo load` はローカルの ImmutableDB ディレクトリまたはリモートの ImmutableDB ルートを受け入れます。設定の `immutableDbPath`、環境変数 `DINGO_IMMUTABLE_DB_PATH`、または `dingo load` の位置引数で取得元を指定します。ローカルデータにはディレクトリパスを使用します。リモートには `https://` URL を使用してください。`http://` はループバックのみで許可され、それ以外の HTTP は拒否されます。HTTPS では、最初の URL、各リダイレクト、各接続時の DNS 応答で、プライベートまたは特殊用途の接続先を拒否します。リモートインポート通信に環境の HTTP プロキシ設定は使用しません。

要求範囲に基づき、インポート全体の転送バイト数、アクティブキャッシュとステージングデータ、予約する空き領域、並行処理に合計上限を適用します。上限や空き領域の予約を超えると、リソースを無制限に消費せず、明示的に失敗します。セットアップや予算初期化の失敗を含め、インポートが失敗するとステージングファイルを削除します。信頼済みの再実行や処理で台帳に未適用のまま残ったコピー済み immutable ブロックは、台帳適用済みの先端まで巻き戻します。バックエンドが巻き戻しを拒否した場合は、元の失敗と巻き戻しの失敗を両方報告します。次のロードの前にデータベースを復旧してください。すべてのロード失敗が自動復旧されるわけではありません。

リモートのルートは `tip.json` と、番号付きチャンクの完全な 3 ファイル組を提供する必要があります。各組の全ファイルには同じ 5 桁の番号を使用します。

```text
tip.json
NNNNN.chunk
NNNNN.primary
NNNNN.secondary
```

`<databasePath>/immutable-download/` 内のステージングおよび準備済みキャッシュに先行ダウンロードします。中断したダウンロードは `.part` として保存し、HTTP Range で再開し、失敗したリクエストを再試行します。完全な 3 ファイル組をチャンク番号順に準備済みキャッシュへ移し、連続する範囲を再実行します。`tip.json` のスロットを含むチャンクの後、または最初の未公開チャンクに到達した時点で停止します。

ロードした先端のスロットとブロックハッシュを `tip.json` と照合し、不一致なら失敗します。公開された `.chunk` に対応する `.primary` または `.secondary` がない場合も失敗します。先端まで処理できるよう、連続範囲の公開チャンクをすべてリモートのルートに配置してください。

<a id="ledger-state-import-validation"></a>

### 台帳状態のインポート検証

インポートした台帳状態を永続化する前に、先端ハッシュと nonce の幅、証明書とステークスナップショット、プール分布とガバナンス状態、プロトコルパラメーター、手数料ポット間の関係などのコンセンサス入力を検証します。事前検証が入力を拒否すると、UTxO フェーズの前に失敗し、部分的な UTxO 状態は永続化しません。

<a id="snapshot-restore-and-truncate"></a>

## スナップショット、復元、切り詰め

`dingo database` は、設定されたデータベースのスナップショット、復元、巻き戻しを行います。これらはオフラインの保守操作です。最初にノードを停止し、ほかの Dingo プロセスがデータディレクトリを開いていないことを確認してください。

```sh
dingo database snapshot --dir /backups/dingo-preview
dingo database restore /backups/dingo-preview
dingo database truncate --slot 12345678
```

`snapshot` の出力先は、まだ存在しないディレクトリである必要があります。復元前に設定済みのデータディレクトリを別の場所に移し、元のパスを存在しない状態または空にしてください。データのあるディレクトリへの復元は失敗します。スナップショット認証を行う操作では、`databaseLifecycle.snapshotTrustKeyFile` は 1024 バイト以下の通常ファイルを指定し、パス末尾の要素はシンボリックリンクにできません。Unix ではノードのユーザーが所有し、所有者のみにアクセスを許可する必要があります。Windows では所有者がノードのユーザーまたは `BUILTIN\Administrators` であり、後者の場合はプロセスが管理者グループに所属する必要があります。DACL は許可された主体のみにアクセスを制限する必要があります。どれかを満たさないファイルはスナップショット認証で拒否されます。

MySQL のスナップショットと復元は `tls=skip-verify` を拒否します。プロバイダーの TLS 既定値は Dingo 設定リファレンスを参照してください。`truncate` は、`--slot`、`--hash`、`--block-number` のちょうど 1 つを対象に指定します。そのポイント以降のブロックとメタデータを削除し、新しい先端から再同期できるようにします。復旧操作の前に `dingo database --help` で全オプションを確認してください。記録済みの Mithril 信頼境界より前には必要な UTxO 履歴がローカルにないため、そのような対象は拒否します。また、対象までの巻き戻しに必要な消費済み UTxO 履歴がデータベースに残っていない場合も失敗します。ローカル履歴が不足する場合は、必要な履歴を保持する完全同期済みピアからのデータベーススナップショットを使用してください。

<a id="history-expiry-and-archives"></a>

## 履歴の期限切れとアーカイブ

履歴の期限切れ処理は、台帳のインデックスとメタデータを保持したまま、古い immutable ブロックファイルをローカルストレージから削除します。そのブロックを読むには設定済みの [Bark アーカイブ](/ja/guides/dingo/006-apis-and-archive/)が必要で、なければ履歴期限切れエラーを返します。アーカイブサービスは、署名付きダウンロード URL を発行できるオブジェクトストレージプロバイダーを使用します。期限切れ処理の頻度、アーカイブストレージ、ダウンロードホストの許可リストは、Dingo v0.87.0 の[設定サンプル](https://raw.githubusercontent.com/blinklabs-io/dingo/v0.87.0/dingo.yaml.example)で設定してください。設定オプションはバージョン間で変わる場合があるため、このサンプルは Dingo v0.87.0 でのみ使用してください。

Mithril オブジェクトごとの圧縮ダウンロードサイズ上限は、`dingo.yaml` の `mithril.downloadMaxBytes`、CLI の `--mithril-download-max-bytes`、環境変数の `DINGO_MITHRIL_DOWNLOAD_MAX_BYTES` で設定します。`0` は組み込み上限を使用します。`v1` は `512 GiB`、`v2` は immutable アーカイブに `1 GiB`、ダイジェスト一覧に `256 MiB`、付属データに `64 GiB` です。正のバイト数を設定すると、各ダウンロードオブジェクトで組み込み上限をその値に置き換えます。負の値は無効で、設定検証に失敗します。


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
