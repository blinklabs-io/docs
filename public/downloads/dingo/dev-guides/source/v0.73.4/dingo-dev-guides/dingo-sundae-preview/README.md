# Dingo UTxO RPC and SundaeSwap V3 Preview

This directory contains the complete TypeScript/Vite wallet frontend source.
The shared Compose stack starts it at <http://127.0.0.1:5174>; see the
bundle's root `README.md` for setup and Dingo configuration.

To run this frontend locally against a Dingo UTxO RPC listener on port 9090:

Use Node.js 24 or later.

```sh
npm ci
DINGO_UTXORPC_URL=http://127.0.0.1:9090 npm run dev -- --host 127.0.0.1
```

The app is deliberately Preview-only. It checks the network magic and required
Sundae V3 reference UTxOs before it offers a swap. Connect a Preview-compatible
CIP-30 wallet; Dingo never receives wallet keys. Review the built transaction,
sign it in the wallet, submit it through Dingo, then wait for confirmation.

Code tour:

- `src/dingo/provider.ts` constructs the UTxO RPC provider and validates the
  connected network.
- `src/sundae/dingoQueryProvider.ts` adapts Dingo UTxO queries to the
  SundaeSwap V3 query interface.
- `src/sundae/swap.ts` builds, signs, and submits the V3 order transaction.
- `src/main.ts` connects the wallet, loads a pool, and runs the user flow.

The shared stack enables UTxO RPC in Dingo's `storageMode: api` and proxies
its HTTP routes through Vite. See the root `docker-compose.yml` for the exact
service settings and the Dingo guide for release-specific configuration.
