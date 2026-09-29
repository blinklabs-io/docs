---
title: Build a Blockfrost API Client
description: Download and run a complete TypeScript explorer backed by Dingo's Blockfrost-compatible API.
---

This guide walks through the working Blockfrost explorer source and its Dingo
configuration. Download the complete project bundle, including both frontend
applications, Gov Lens, the shared database initialization, and the Compose
stack:

[Download the Dingo application examples for v0.73.3](/downloads/dingo/dev-guides/dingo-application-examples-v0.73.3.tar.gz)

Extract it and start the full stack:

```sh
tar -xzf dingo-application-examples-v0.73.3.tar.gz
cd dingo-dev-guides
cp .env.example .env
docker compose up -d
docker compose ps
```

The first start downloads the Dingo image and Preview snapshot. The `dingo`
service waits for `dingo-sync` to finish the Mithril import before serving.
Open <http://127.0.0.1:5173> when the frontend is ready. The stack binds its
published ports to localhost by default; the sample database credentials are
for local development only.

## What the Compose stack configures

Both `dingo-sync` and `dingo` in the downloaded `docker-compose.yml` use
`-n preview` and the same environment settings:

```yaml
DINGO_STORAGE_MODE: api
DINGO_PLUGINS_STORAGE_METADATA_PROVIDER: postgres
DINGO_PLUGINS_STORAGE_METADATA_CONFIG_DSN: "host=postgres port=5432 user=dingo password=dingo dbname=dingo_metadata sslmode=disable TimeZone=UTC"
DINGO_PLUGINS_STORAGE_BLOB_PROVIDER: badger
DINGO_PLUGINS_API_BLOCKFROST_CONFIG_PORT: 3000
DINGO_PLUGINS_API_UTXORPC_CONFIG_PORT: 9090
DINGO_PLUGINS_API_MESH_CONFIG_PORT: 8080
```

This selects API storage mode, keeps metadata in PostgreSQL, keeps block data
in Badger, and enables the three application APIs used across the bundle. The
Blockfrost explorer calls port `3000`. The full Compose service definitions,
health checks, volumes, and port mappings are in the downloaded file.

The equivalent core of the Dingo YAML configuration is:

```yaml
storageMode: api
plugins:
  storage:
    blob:
      provider: badger
    metadata:
      provider: postgres
      config:
        host: postgres
        port: 5432
        user: dingo
        password: dingo
        database: dingo_metadata
        sslMode: disable
        timeZone: UTC
  api:
    blockfrost:
      provider: builtin
      config:
        port: 3000
```

Use the environment form in this bundle as the executable configuration. See
[API access and Dingo configuration](/guides/dingo/006-apis-and-archive/) for
release-specific options, authentication, and TLS.

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

For local frontend iteration without the shared stack, enter the project
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
