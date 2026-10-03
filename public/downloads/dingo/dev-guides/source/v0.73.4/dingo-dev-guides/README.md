# Dingo application development bundle

This bundle contains three complete Preview application projects, the shared
Docker Compose stack that runs them, and the Dingo configuration expressed by
that stack. The app implementations, build files, lockfiles, frontend assets,
Gov Lens database grants, and Gov Lens tests are included in their directories.
The application sources are preserved from the Dingo v0.73.4 development
examples, and the stack uses the matching published Dingo image by default.

## Run all three applications

Requirements: Docker with the Compose plugin and a machine with enough disk
space for a Preview node and PostgreSQL database. The first start downloads the
Dingo image and Mithril snapshot; Dingo then backfills historical metadata.

```sh
cp .env.example .env
docker compose up -d
docker compose ps
```

Wait for `dingo-sync` to finish successfully before `dingo` becomes healthy.
Historical governance backfill continues after Mithril brings the node near
tip, so the governance dashboard can initially report that historical rows are
not ready.

Open the apps after their services start:

- Gov Lens: <http://127.0.0.1:8088>
- Blockfrost Explorer: <http://127.0.0.1:5173>
- Sundae Preview: <http://127.0.0.1:5174>

The stack binds the node APIs and web applications to localhost by default.
Edit `.env` only if you intend to expose this Preview test environment to other
hosts. The credentials in `.env.example` are for local development; change them
before any shared deployment.

The stack uses `ghcr.io/blinklabs-io/dingo:v0.73.4` by default. Set
`DINGO_IMAGE` in `.env` to another compatible published Dingo image when
testing a different release. API settings and storage mode are passed to both
the one-shot sync service and the node via environment variables in
`docker-compose.yml`.

Stop the applications while retaining node data with `docker compose down`.
To delete the local Preview chain and database data as well, use
`docker compose down -v`.

## Dingo configuration used by the stack

The `dingo-sync` and `dingo` services share these settings:

```yaml
databasePath: /data/db
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
      config: { port: 3000 }
    utxorpc:
      provider: builtin
      config: { port: 9090 }
    mesh:
      provider: builtin
      config: { port: 8080 }
```

Compose invokes Dingo with `-n preview serve` (and `-n preview mithril sync`)
and passes the settings as environment variables, not by loading a YAML file.
`DINGO_STORAGE_MODE=api` enables historical API indexes, PostgreSQL stores
Dingo metadata for Gov Lens, and Badger stores the node's block data. The YAML
above shows the corresponding node settings; the environment variables
immediately above each service in `docker-compose.yml` are the executable
configuration for this bundle.

## Application projects

- `dingo-blockfrost-explorer/` is a TypeScript/Vite explorer. It queries Dingo's
  Blockfrost-compatible API through the Vite proxy configured in `vite.config.ts`.
- `dingo-sundae-preview/` is a TypeScript/Vite wallet frontend. It reads Preview
  UTxOs, builds and evaluates a SundaeSwap V3 order, requests a CIP-30 wallet
  signature, submits through Dingo UTxO RPC, and waits for confirmation.
- `dingo-gov-lens/` is a Go web application with embedded frontend assets. It
  uses a read-only PostgreSQL role to query indexed governance metadata.

Each application directory contains its complete source, local development
commands, and dependencies. See the matching [Dingo developer guide](https://docs.blinklabs.io/guides/dingo/001-dingo/) for code walkthroughs.
