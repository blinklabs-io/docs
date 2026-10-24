---
title: UTxO RPC ウォレットフロントエンドの構築
description: 完全な Dingo と SundaeSwap V3 Preview ウォレットフロントエンドを実行し、拡張します。
---
バンドルには、完全な SundaeSwap V3 Preview ウォレットフロントエンド、TypeScript ソースとロックファイル、既存の Kubernetes 設定、およびノードのデプロイとポート転送のヘルパーが含まれます。

[Dingo v0.73.4 のアプリケーションサンプルをダウンロード](/downloads/dingo/dev-guides/dingo-application-examples-v0.73.4.tar.gz)

[バージョン固定のウォレットソース](https://github.com/blinklabs-io/docs/tree/main/public/downloads/dingo/dev-guides/source/v0.73.4/dingo-dev-guides/dingo-sundae-preview)を参照できます。Node.js 24 以降、Helm、kubectl と、Preview 用の永続ストレージがある選択済み Kubernetes コンテキストを使用します。既存のノード設定でデプロイします。

```sh
tar -xzf dingo-application-examples-v0.73.4.tar.gz
cd dingo-dev-guides/dingo-sundae-preview
NAMESPACE=dingo-wallet RELEASE=dingo-wallet ./scripts/deploy-dingo.sh
```

ヘルパーはチャート 0.1.3 と既存の `k8s/dingo-values.yaml` を使用します。設定は Dingo 0.73.4 に固定し、Preview、SQLite メタデータ、Badger ブロックの API ストレージモードで、ポート 9090 の UTxO RPC を有効にします。別の端末で UTxO RPC のポート転送を実行したままにします。

```sh
NAMESPACE=dingo-wallet RELEASE=dingo-wallet ./scripts/port-forward-dingo.sh
```

フロントエンドをローカルで起動します。

```sh
npm ci
DINGO_UTXORPC_URL=http://127.0.0.1:9090 npm run dev -- --host 127.0.0.1
```

ノードの同期後、Preview 対応の CIP-30 ウォレットで <http://127.0.0.1:5174> を開きます。アプリは V3 注文を構築し、ウォレットに署名を要求し、Dingo 経由で送信して最大 120 秒確認を待ちます。秘密鍵はウォレットが保持します。Vite はループバックのポート転送を通して UTxO RPC をプロキシするため、ブラウザーのリクエストはフロントエンドと同じオリジンを使用します。

## トランザクションのコード

`dingo-dev-guides/dingo-sundae-preview/src/sundae/swap.ts` の `buildSwapOrder` は、ウォレットに接続した Blaze プロバイダーと Dingo クエリプロバイダーで V3 注文を構築し、CBOR トランザクションに署名して送信する関数を返します。

```ts
import { Blaze, Core, type Wallet } from "@blaze-cardano/sdk";
import { AssetAmount } from "@sundaeswap/asset";
import {
  ADA_METADATA,
  EDatumType,
  ESwapType,
  TxBuilderV3,
  type IPoolData,
  type IPoolDataAsset,
} from "@sundaeswap/core";
import type { U5C } from "@utxorpc/blaze-provider";
import { parseAssetAmount } from "./assets";
import type { DingoSundaeQueryProvider } from "./dingoQueryProvider";

export type SwapDirection = "adaToToken" | "tokenToAda";

export type BuildSwapArgs = {
  blaze: Blaze<U5C, Wallet>;
  queryProvider: DingoSundaeQueryProvider;
  pool: IPoolData;
  amount: string;
  direction: SwapDirection;
  slippagePercent: string;
};

export type BuiltSwap = {
  unsignedCbor: string;
  signedCbor?: string;
  txFee: bigint;
  deposit: bigint;
  scooperFee: bigint;
  signAndSubmit(): Promise<string>;
};

export async function buildSwapOrder({
  blaze,
  queryProvider,
  pool,
  amount,
  direction,
  slippagePercent,
}: BuildSwapArgs): Promise<BuiltSwap> {
  const changeAddress = (await blaze.wallet.getChangeAddress()).toBech32();
  const suppliedAsset = assetForDirection(pool, direction);
  const suppliedAmount = parseAssetAmount(
    amount,
    suppliedAsset.decimals ?? 0,
    labelForAsset(suppliedAsset),
  );
  if (suppliedAmount <= 0n) {
    throw new Error(`Enter a positive ${labelForAsset(suppliedAsset)} amount.`);
  }

  const slippage = Number(slippagePercent) / 100;
  if (!Number.isFinite(slippage) || slippage < 0 || slippage > 0.5) {
    throw new Error("Slippage must be between 0 and 50 percent.");
  }

  const builder = new TxBuilderV3(blaze, queryProvider);
  const composed = await builder.swap({
    pool,
    suppliedAsset: new AssetAmount(suppliedAmount, suppliedAsset),
    swapType: {
      type: ESwapType.MARKET,
      slippage,
    },
    ownerAddress: changeAddress,
    orderAddresses: {
      DestinationAddress: {
        address: changeAddress,
        datum: {
          type: EDatumType.NONE,
        },
      },
    },
  });

  const built = await composed.build();
  const txFee = BigInt(built.builtTx.body().fee()?.toString() ?? "0");

  return {
    unsignedCbor: built.cbor,
    txFee,
    deposit: composed.fees.deposit.amount,
    scooperFee: composed.fees.scooperFee.amount,
    async signAndSubmit() {
      const signed = await built.sign();
      const tx = Core.Transaction.fromCbor(Core.TxCBOR(signed.cbor));
      const txId = await blaze.provider.postTransactionToChain(tx);
      return txId.toString();
    },
  };
}

function assetForDirection(
  pool: IPoolData,
  direction: SwapDirection,
): IPoolDataAsset {
  if (!poolHasAda(pool)) {
    throw new Error("The selected pool is not an ADA pair.");
  }

  if (direction === "adaToToken") {
    return ADA_METADATA;
  }

  return pool.assetA.assetId === ADA_METADATA.assetId ? pool.assetB : pool.assetA;
}

function poolHasAda(pool: IPoolData): boolean {
  return (
    pool.assetA.assetId === ADA_METADATA.assetId ||
    pool.assetB.assetId === ADA_METADATA.assetId
  );
}

function labelForAsset(asset: IPoolDataAsset): string {
  if (asset.assetId === ADA_METADATA.assetId) {
    return "ADA";
  }
  return "token";
}
```

これはダウンロードに含まれる完全な `src/sundae/swap.ts` モジュールです。2 つのローカルインポートは同じプロジェクトに含まれます。Dingo クエリプロバイダー（`src/sundae/dingoQueryProvider.ts`）、ネットワーク検証（`src/dingo/provider.ts`）、CIP-30 ウォレット処理、UI、固定された依存関係も含まれます。

ローカルホスト上の既存の Dingo UTxO RPC リスナーに接続し、フロントエンドだけを実行するには、次を使用します。

```sh
cd dingo-sundae-preview
npm ci
DINGO_UTXORPC_URL=http://127.0.0.1:9090 npm run dev -- --host 127.0.0.1
```

アプリは、プール操作を有効にする前に Preview ネットワークマジック（`2`）と必要な Sundae V3 参照 UTxO を検証します。設定したスクリプト参照とプールは Preview 専用なので、Preview で使用してください。Go ライブラリ API は [pkg.go.dev](https://pkg.go.dev/github.com/blinklabs-io/dingo)を参照してください。
