# Dingo Blockfrost Explorer

This directory contains the complete TypeScript/Vite explorer source. Use the existing
Kubernetes values and local frontend setup in the bundle root `README.md`.

To run this frontend locally against a Dingo node already serving its
Blockfrost-compatible API on port 3000:

Use Node.js 24 or later.

```sh
npm ci
DINGO_BLOCKFROST_URL=http://127.0.0.1:3000 npm run dev -- --host 127.0.0.1
```

`vite.config.ts` proxies `/api/v0/*` and `/health` to Dingo, keeping browser
requests same-origin. `src/main.ts` contains the API response types, request
helpers, routing, and explorer views. Start with `blockfrostFetch` near the end
of that file and follow its callers in `refreshOverview` and `runSearch`.

Dingo must use `storageMode: api` and enable the built-in Blockfrost provider.
The node settings are in `k8s/dingo-values.yaml`.
The available endpoint set depends on Dingo's release; handle `404` responses
for routes the deployed version does not provide.
