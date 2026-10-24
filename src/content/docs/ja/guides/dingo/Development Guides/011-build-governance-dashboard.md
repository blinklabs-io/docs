---
title: ガバナンスダッシュボードの構築
description: 完全な Go ガバナンスダッシュボードと Dingo PostgreSQL 設定を実行し、拡張します。
---
バンドルには、完全な Gov Lens Go サーバー、テスト、組み込みフロントエンド、読み取り専用データベース権限、および既存の Dingo Kubernetes 設定が含まれます。

[Dingo v0.73.4 のアプリケーションサンプルをダウンロード](/downloads/dingo/dev-guides/dingo-application-examples-v0.73.4.tar.gz)

[バージョン固定の Gov Lens ソース](https://github.com/blinklabs-io/docs/tree/main/public/downloads/dingo/dev-guides/source/v0.73.4/dingo-dev-guides/dingo-gov-lens)を参照できます。Go 1.26 以降、Helm、kubectl と選択済み Kubernetes コンテキストを使用します。ノードのデプロイ前に、Dingo とローカルアプリがアクセスできる非公開の PostgreSQL メタデータデータベースを用意してください。

```sh
tar -xzf dingo-application-examples-v0.73.4.tar.gz
cd dingo-dev-guides/dingo-gov-lens
cp k8s/dingo-values.yaml gov-lens-values.local.yaml
```

コピーした設定の PostgreSQL DSN を、データベース所有者とデータベースに合わせて編集します。Dingo イメージのシステム CA が信頼するサーバー証明書と、一致する DNS ホスト名を使用してください。認証情報はローカル設定に保持します。既存の設定は Dingo 0.73.4 に固定し、Preview と API ストレージを選択し、PostgreSQL メタデータと Badger ブロックを使用して、任意の API リスナーを無効にします。

```sh
helm upgrade --install dingo-governance oci://ghcr.io/blinklabs-io/helm-charts/charts/dingo --version 0.1.3 --namespace dingo-governance --create-namespace --values gov-lens-values.local.yaml
```

Dingo がスキーマを作成した後、`sql/create-readonly-user.sql` のデータベース名、Dingo 所有者、アプリのパスワードを編集します。管理者接続用の POSTGRES_ADMIN_DSN を設定し、実行します。

```sh
psql "$POSTGRES_ADMIN_DSN" --set ON_ERROR_STOP=1 --file sql/create-readonly-user.sql
```

Gov Lens には独立した読み取り専用ロールを使用してください。下記のコマンドで Go アプリをローカル実行し、<http://127.0.0.1:8088> を開きます。ノードが先端に達した後も過去のデータのバックフィルは続く場合があります。ダッシュボードはその状態を報告し、行がないことをガバナンスが存在しない根拠とは扱いません。

バンドルの README は、稼働中の Gov Lens と、名前空間および名前で明示的に選択した PostgreSQL Pod に対する `scripts/e2e-kubernetes.sh` の確認方法を説明します。スクリプトはサービスをデプロイせず、HTTP ステータス、ノード設定、ガバナンスの行数を確認します。

## Go サーバーと SQL

`dingo-gov-lens/main.go` のサーバーはデータベースを開き、JSON API ルートを登録し、組み込みフロントエンドを提供します。次は実際のルート登録です。

```go
mux := http.NewServeMux()
mux.HandleFunc("GET /api/status", a.handleStatus)
mux.HandleFunc("GET /api/proposals", a.handleProposals)
mux.HandleFunc("GET /api/proposals/{txHash}/{index}", a.handleProposalDetail)
mux.HandleFunc("GET /api/dreps", a.handleDreps)
mux.HandleFunc("GET /api/dreps/{credential}", a.handleDrepDetail)
mux.HandleFunc("GET /api/stake/{credential}", a.handleStakeLookup)
mux.HandleFunc("GET /api/epochs", a.handleEpochs)
```

たとえば、`handleStatus` は Dingo のメタデータテーブルからネットワークとストレージモードを直接読み取ります。

```go
err := a.db.QueryRowContext(ctx, `
    SELECT COALESCE(network, ''), COALESCE(storage_mode, '')
    FROM node_settings
    ORDER BY id ASC
    LIMIT 1
`).Scan(&ret.Network, &ret.StorageMode)
```

`main.go` は完全なハンドラーと、パラメーター化された提案、DRep、ステーク、エポックのクエリを含みます。`static/app.js` がエンドポイントを呼び出して結果を表示します。アプリをコピー、変更する場合はダウンロードしたソースを使用してください。ここでの断片はサーバーの接続関係を示しますが、周辺の型とハンドラーに依存します。

稼働中の対応する Postgres データベースに接続して Go アプリを開発するには、次を使用します。

```sh
cd dingo-gov-lens
export DATABASE_URL='host=postgres.example.com port=5432 user=dingo_gov_lens password=change-me dbname=dingo_metadata sslmode=verify-full sslrootcert=system TimeZone=UTC'
export ADDR=127.0.0.1:8088
go test ./...
go run .
```

このアプリは、安定した公開 API ではない Dingo の内部メタデータスキーマを照会します。使用する Dingo バージョンのデータベース設計を確認し、アップグレード後に再テストしてください。バックフィル中は履歴が不完全な場合があり、保持設定や機能フラグによって存在するレコードが変わります。PostgreSQL は非公開にし、アプリには読み取り専用アクセスを与えてください。提案や投票の署名と送信には、対応するガバナンスアプリを使用してください。Go ライブラリのドキュメントは [pkg.go.dev](https://pkg.go.dev/github.com/blinklabs-io/dingo) にあります。
