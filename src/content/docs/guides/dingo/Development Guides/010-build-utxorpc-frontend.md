---
title: Build a Wallet Frontend with UTxO RPC
description: Run and extend the complete Dingo and SundaeSwap V3 Preview wallet frontend project.
---

The bundle contains the complete SundaeSwap V3 Preview wallet frontend,
TypeScript source and lockfile, existing Kubernetes values, and node deployment
and port-forward helpers:

[Download the Dingo application examples for v0.73.4](/downloads/dingo/dev-guides/dingo-application-examples-v0.73.4.tar.gz)

Browse the [versioned wallet source](https://github.com/blinklabs-io/docs/tree/main/public/downloads/dingo/dev-guides/source/v0.73.4/dingo-dev-guides/dingo-sundae-preview).
Use Node.js 24 or later, Helm, kubectl, and a selected Kubernetes context with
persistent storage for Preview. Deploy the existing node values:

```sh
tar -xzf dingo-application-examples-v0.73.4.tar.gz
cd dingo-dev-guides/dingo-sundae-preview
NAMESPACE=dingo-wallet RELEASE=dingo-wallet ./scripts/deploy-dingo.sh
```

The helper uses chart 0.1.3 and the existing `k8s/dingo-values.yaml`, which
pins Dingo 0.73.4, selects Preview, and enables UTxO RPC on port 9090 in API
storage mode with SQLite metadata and Badger blocks. In a separate terminal,
keep the UTxO RPC port-forward running:

```sh
NAMESPACE=dingo-wallet RELEASE=dingo-wallet ./scripts/port-forward-dingo.sh
```

Start the frontend locally:

```sh
npm ci
DINGO_UTXORPC_URL=http://127.0.0.1:9090 npm run dev -- --host 127.0.0.1
```

Open <http://127.0.0.1:5174> with a Preview-compatible CIP-30 wallet after the
node has synchronized. The app builds a V3 order, asks the wallet to sign it,
submits through Dingo, and waits up to 120 seconds for confirmation. The wallet
retains the private keys. Vite proxies UTxO RPC through the loopback
port-forward so browser requests stay on the frontend's origin.

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
