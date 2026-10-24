---
title: Crear un frontend de billetera con UTxO RPC
description: Ejecuta y amplía el proyecto completo de frontend de billetera Preview con Dingo y SundaeSwap V3.
---

El paquete contiene el frontend completo de billetera SundaeSwap V3 para Preview, el código TypeScript y su archivo de bloqueo de dependencias, los valores Kubernetes y las herramientas auxiliares de despliegue y redirección de puertos del nodo:

[Descargar los ejemplos de aplicaciones de Dingo para v0.73.4](/downloads/dingo/dev-guides/dingo-application-examples-v0.73.4.tar.gz)

Consulta el [código versionado de la billetera](https://github.com/blinklabs-io/docs/tree/main/public/downloads/dingo/dev-guides/source/v0.73.4/dingo-dev-guides/dingo-sundae-preview). Utiliza Node.js 24 o posterior, Helm, kubectl y un contexto Kubernetes seleccionado con almacenamiento persistente para Preview. Despliega los valores del nodo suministrados:

```sh
tar -xzf dingo-application-examples-v0.73.4.tar.gz
cd dingo-dev-guides/dingo-sundae-preview
NAMESPACE=dingo-wallet RELEASE=dingo-wallet ./scripts/deploy-dingo.sh
```

La herramienta auxiliar utiliza el chart 0.1.3 y el archivo `k8s/dingo-values.yaml`, que fija Dingo 0.73.4, selecciona Preview y activa UTxO RPC en el puerto 9090 con modo de almacenamiento API, metadatos SQLite y bloques Badger. En otra terminal, mantén en ejecución la redirección de puerto de UTxO RPC:

```sh
NAMESPACE=dingo-wallet RELEASE=dingo-wallet ./scripts/port-forward-dingo.sh
```

Inicia el frontend localmente:

```sh
npm ci
DINGO_UTXORPC_URL=http://127.0.0.1:9090 npm run dev -- --host 127.0.0.1
```

Cuando el nodo esté sincronizado, abre <http://127.0.0.1:5174> con una billetera CIP-30 compatible con Preview. La aplicación crea una orden V3, solicita a la billetera que la firme, la envía mediante Dingo y espera hasta 120 segundos a la confirmación. Las claves privadas permanecen en la billetera. Vite redirige UTxO RPC mediante el puerto de loopback para que las solicitudes del navegador conserven el origen del frontend.

## Código de la transacción

En `dingo-dev-guides/dingo-sundae-preview/src/sundae/swap.ts`, `buildSwapOrder` utiliza el proveedor Blaze respaldado por la billetera y el proveedor de consultas de Dingo para crear una orden V3. Después devuelve una función que firma y envía la transacción CBOR:

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

Este es el módulo `src/sundae/swap.ts` completo de la descarga. Sus dos importaciones locales forman parte del proyecto. La descarga también incluye el proveedor de consultas de Dingo (`src/sundae/dingoQueryProvider.ts`), la validación de red (`src/dingo/provider.ts`), la gestión de billeteras CIP-30, la interfaz y las dependencias fijadas.

Para ejecutar únicamente el frontend con un servicio UTxO RPC de Dingo ya disponible en el host local:

```sh
cd dingo-sundae-preview
npm ci
DINGO_UTXORPC_URL=http://127.0.0.1:9090 npm run dev -- --host 127.0.0.1
```

La aplicación verifica el identificador de la red Preview (`2`) y los UTxO de referencia necesarios de Sundae V3 antes de permitir las operaciones de pools. Mantén esta aplicación en Preview: sus referencias de scripts y pools son específicas de esa red. Para la documentación de la API de la biblioteca Go, consulta [pkg.go.dev](https://pkg.go.dev/github.com/blinklabs-io/dingo).
