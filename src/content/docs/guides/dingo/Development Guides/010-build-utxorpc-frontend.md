---
title: Build a Wallet Frontend with UTxO RPC
description: Run and extend the complete Dingo and SundaeSwap V3 Preview wallet frontend project.
---

The downloadable bundle contains the complete SundaeSwap V3 Preview wallet
frontend, its TypeScript source and lockfile, the Dingo configuration, and a
Compose stack that runs it with a Preview node:

[Download the Dingo application examples for v0.73.4](/downloads/dingo/dev-guides/dingo-application-examples-v0.73.4.tar.gz)

The bundle is generated from the versioned [SundaeSwap Preview source on GitHub](https://github.com/blinklabs-io/docs/tree/main/public/downloads/dingo/dev-guides/source/v0.73.4/dingo-dev-guides/dingo-sundae-preview), where you can browse or copy individual files.

Start the Dingo node and both frontend apps:

```sh
tar -xzf dingo-application-examples-v0.73.4.tar.gz
cd dingo-dev-guides
cp .env.example .env
docker compose up -d
docker compose ps
```

Wait for `dingo-sync` to complete, then open
<http://127.0.0.1:5174> in a browser with a Preview-compatible CIP-30 wallet
installed. Select a pool, connect the wallet, choose a direction and amount,
build the order, review it, and approve the signature in the wallet. The app
submits through Dingo and waits up to 120 seconds for confirmation. Signing is
performed by the wallet; the web app and node do not handle the wallet's
private keys.

## Dingo configuration

The `dingo` and `dingo-sync` Compose services run Dingo with `-n preview` and
share API mode, PostgreSQL metadata, and Badger block storage. The UTxO RPC
listener the frontend uses is enabled on port `9090`:

```yaml
DINGO_STORAGE_MODE: api
DINGO_PLUGINS_STORAGE_METADATA_PROVIDER: postgres
DINGO_PLUGINS_STORAGE_METADATA_CONFIG_DSN: "host=postgres port=5432 user=dingo password=dingo dbname=dingo_metadata sslmode=disable TimeZone=UTC"
DINGO_PLUGINS_STORAGE_BLOB_PROVIDER: badger
DINGO_PLUGINS_API_UTXORPC_CONFIG_PORT: 9090
```

The node and frontend communicate on the Compose network. The frontend's
`DINGO_UTXORPC_URL` targets `http://dingo:9090`; its Vite server proxies the
UTxO RPC HTTP routes so the browser calls the frontend's same origin. The
complete service definitions and ports are in the downloaded
`docker-compose.yml`.

## Transaction code

In `dingo-dev-guides/dingo-sundae-preview/src/sundae/swap.ts`,
`buildSwapOrder` uses the wallet-backed Blaze provider and the Dingo query
provider to build a V3 order, then returns a function that signs and submits
the CBOR transaction:

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

This is the complete `src/sundae/swap.ts` module from the download. Its two
local imports are part of that project. The download also contains the Dingo
query provider (`src/sundae/dingoQueryProvider.ts`), network validation
(`src/dingo/provider.ts`), CIP-30 wallet handling, UI, and pinned dependencies.

To run just the frontend against a Dingo UTxO RPC listener already available on
the local host:

```sh
cd dingo-sundae-preview
npm ci
DINGO_UTXORPC_URL=http://127.0.0.1:9090 npm run dev -- --host 127.0.0.1
```

The app verifies Preview network magic (`2`) and required Sundae V3 reference
UTxOs before enabling pool operations. Keep this app on Preview: its configured
script references and pools are Preview-specific. For Go library API
documentation, see [pkg.go.dev](https://pkg.go.dev/github.com/blinklabs-io/dingo).
