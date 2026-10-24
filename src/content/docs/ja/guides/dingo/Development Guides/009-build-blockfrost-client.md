---
title: Blockfrost API クライアントの構築
description: Dingo の Blockfrost 互換 API を使用する完全な TypeScript エクスプローラーをダウンロードして実行します。
---
完全な TypeScript エクスプローラー、既存の Kubernetes ノード設定、および他の 2 つのアプリケーションプロジェクトをダウンロードします。

[Dingo v0.73.4 のアプリケーションサンプルをダウンロード](/downloads/dingo/dev-guides/dingo-application-examples-v0.73.4.tar.gz)

[バージョン固定のエクスプローラーソース](https://github.com/blinklabs-io/docs/tree/main/public/downloads/dingo/dev-guides/source/v0.73.4/dingo-dev-guides/dingo-blockfrost-explorer)を参照できます。Node.js 24 以降、Helm、kubectl と、Preview ノード用の永続ストレージが利用できる明示的に選択した Kubernetes コンテキストを使用してください。

```sh
tar -xzf dingo-application-examples-v0.73.4.tar.gz
cd dingo-dev-guides/dingo-blockfrost-explorer
helm upgrade --install dingo-explorer oci://ghcr.io/blinklabs-io/helm-charts/charts/dingo --version 0.1.3 --namespace dingo-explorer --create-namespace --values k8s/dingo-values.yaml
```

既存の設定は `ghcr.io/blinklabs-io/dingo:0.73.4` に固定し、Preview を選択し、SQLite メタデータと Badger ブロックによる API ストレージを有効にして、ポート 3000 で Blockfrost を提供します。チャートは配信前に Mithril でブートストラップします。別の端末で、ループバックのポート転送を実行したままにします。

```sh
kubectl -n dingo-explorer port-forward svc/dingo-explorer 3000:3000 12798:12798 --address 127.0.0.1
```

フロントエンドをローカルで起動し、<http://127.0.0.1:5173> を開きます。

```sh
npm ci
DINGO_BLOCKFROST_URL=http://127.0.0.1:3000 DINGO_METRICS_URL=http://127.0.0.1:12798 npm run dev -- --host 127.0.0.1
```

完全なノード設定は `k8s/dingo-values.yaml` にあり、バンドルのルート README は他のアプリケーションの起動方法も説明します。この設定は Dingo v0.73.4 と組み合わせて使用してください。新しいリリースでは [API アクセスと設定](/ja/guides/dingo/006-apis-and-archive/)を参照してください。

## ブラウザーからノードまでのリクエスト経路

完全なエクスプローラーは `dingo-dev-guides/dingo-blockfrost-explorer/` にあります。`vite.config.ts` は `/api/v0/*` を Dingo サービスにプロキシし、ブラウザーのリクエストを同一オリジンに保ちます。

```ts
import { defineConfig } from "vite";

const dingoTarget = process.env.DINGO_BLOCKFROST_URL ?? "http://127.0.0.1:3000";
const dingoMetricsTarget = process.env.DINGO_METRICS_URL ?? "http://127.0.0.1:12798";

const blockfrostProxy = {
  target: dingoTarget,
  changeOrigin: true,
  ws: false,
};

const metricsProxy = {
  target: dingoMetricsTarget,
  changeOrigin: true,
  ws: false,
};

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    proxy: {
      "/api/v0": blockfrostProxy,
      "/health": blockfrostProxy,
      "/metrics": metricsProxy,
    },
  },
});
```

`src/main.ts` には、ダッシュボード、検索、詳細画面で使用する型付きリクエストヘルパーがあります。

```ts
async function blockfrostFetch<T>(path: string): Promise<T> {
  const response = await fetch(path, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new HTTPError(response.status, await responseErrorMessage(response));
  }
  return (await response.json()) as T;
}

async function fetchLatestBlock(): Promise<BlockResponse> {
  return await blockfrostFetch<BlockResponse>("/api/v0/blocks/latest");
}
```

これらはアプリケーションが実際に使用するリクエスト関数です。完全な `main.ts` は、応答型、ルート処理、ダッシュボード画面、詳細の描画処理を含みます。完全なファイルをコピーして実行するにはバンドルをダウンロードしてください。上記の抜粋だけでは、プロジェクトの依存関係や HTML/CSS アセットを代替できません。

既存ノードに接続してフロントエンドを開発するには、プロジェクトディレクトリに入り、ロック済みの依存関係をインストールし、Vite プロキシを稼働中の Dingo API に向けます。

```sh
cd dingo-blockfrost-explorer
npm ci
DINGO_BLOCKFROST_URL=http://127.0.0.1:3000 npm run dev -- --host 127.0.0.1
```

エクスプローラーは、接続する Dingo リリースが提供するエンドポイントを使用します。未対応ルートの `404` 応答を処理してください。Go ライブラリのドキュメントは [pkg.go.dev](https://pkg.go.dev/github.com/blinklabs-io/dingo)を参照してください。
