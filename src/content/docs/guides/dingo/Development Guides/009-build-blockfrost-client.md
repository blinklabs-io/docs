---
title: Build a Blockfrost API Client
description: Download and run a complete TypeScript explorer backed by Dingo's Blockfrost-compatible API.
---

Download the complete TypeScript explorer, its existing Kubernetes node values,
and the other two application projects:

[Download the Dingo application examples for v0.73.4](/downloads/dingo/dev-guides/dingo-application-examples-v0.73.4.tar.gz)

Browse the [versioned explorer source](https://github.com/blinklabs-io/docs/tree/main/public/downloads/dingo/dev-guides/source/v0.73.4/dingo-dev-guides/dingo-blockfrost-explorer).
Use Node.js 24 or later, Helm, kubectl, and an explicitly selected Kubernetes
context with persistent storage available for a Preview node.

```sh
tar -xzf dingo-application-examples-v0.73.4.tar.gz
cd dingo-dev-guides/dingo-blockfrost-explorer
helm upgrade --install dingo-explorer oci://ghcr.io/blinklabs-io/helm-charts/charts/dingo --version 0.1.3 --namespace dingo-explorer --create-namespace --values k8s/dingo-values.yaml
```

The existing values pin `ghcr.io/blinklabs-io/dingo:0.73.4`, select Preview,
enable API storage with SQLite metadata and Badger blocks, and serve Blockfrost
on port 3000. The chart bootstraps from Mithril before serving. In a separate
terminal, keep this loopback port-forward running:

```sh
kubectl -n dingo-explorer port-forward svc/dingo-explorer 3000:3000 12798:12798 --address 127.0.0.1
```

Start the frontend locally and open <http://127.0.0.1:5173>:

```sh
npm ci
DINGO_BLOCKFROST_URL=http://127.0.0.1:3000 DINGO_METRICS_URL=http://127.0.0.1:12798 npm run dev -- --host 127.0.0.1
```

The full node settings are in `k8s/dingo-values.yaml`; the bundle root README
covers the other application entry points. Use the versioned node settings with
Dingo v0.73.4. For newer releases, consult [API access and configuration](/guides/dingo/006-apis-and-archive/).

## Follow the request from browser to node

The complete explorer is in
`dingo-dev-guides/dingo-blockfrost-explorer/`. Its `vite.config.ts` proxies
`/api/v0/*` to the Dingo service so browser requests stay same-origin:

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

`src/main.ts` has the typed request helper used by the dashboard, search, and
detail views:

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

These are the application's actual request functions. The full `main.ts`
contains the response types, route handling, dashboard views, and detail
renderers. Download the bundle to copy the complete files and run the app; the
excerpts above alone are not a replacement for the project dependencies and
HTML/CSS assets.

For local frontend iteration against an existing node, enter the project
directory, install its locked dependencies, and point the Vite proxy at a
running Dingo API:

```sh
cd dingo-blockfrost-explorer
npm ci
DINGO_BLOCKFROST_URL=http://127.0.0.1:3000 npm run dev -- --host 127.0.0.1
```

The explorer uses endpoints present in the Dingo release it connects to.
Handle `404` responses for routes that release does not provide. For Go
library documentation, see [pkg.go.dev](https://pkg.go.dev/github.com/blinklabs-io/dingo).
