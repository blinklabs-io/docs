---
title: Build a Governance Dashboard
description: Run and extend the complete Go governance dashboard and its Dingo PostgreSQL configuration.
---

The download contains the complete Gov Lens app: Go server, tests, embedded
HTML/CSS/JavaScript, SQL for a read-only database role, Postgres initialization,
Dockerfile, and the shared Compose stack with Dingo configuration.

[Download the Dingo application examples for v0.73.3](/downloads/dingo/dev-guides/dingo-application-examples-v0.73.3.tar.gz)

Extract the bundle, set local credentials, and start the stack:

```sh
tar -xzf dingo-application-examples-v0.73.3.tar.gz
cd dingo-dev-guides
cp .env.example .env
# Edit POSTGRES_PASSWORD and DINGO_GOV_LENS_PASSWORD in .env.
docker compose up -d
docker compose ps
```

The Compose file starts PostgreSQL, a one-shot Dingo Mithril sync, Dingo on
Preview, Gov Lens, the Blockfrost explorer, and the wallet frontend. PostgreSQL
initialization creates a separate `dingo_gov_lens` role with `SELECT` access;
the app does not connect as Dingo's database owner. Open
<http://127.0.0.1:8088>. The stack binds services to localhost by default.

## Dingo configuration for indexed governance data

The node and sync services use `-n preview`, API storage mode, PostgreSQL
metadata, and Badger block storage. The governance app reads metadata from that
PostgreSQL database:

```yaml
DINGO_STORAGE_MODE: api
DINGO_PLUGINS_STORAGE_METADATA_PROVIDER: postgres
DINGO_PLUGINS_STORAGE_METADATA_CONFIG_DSN: "host=postgres port=5432 user=dingo password=dingo dbname=dingo_metadata sslmode=disable TimeZone=UTC"
DINGO_PLUGINS_STORAGE_BLOB_PROVIDER: badger
```

`dingo-sync` imports the Mithril snapshot and then Dingo backfills historical
metadata. The node can reach tip before governance history is fully indexed;
the dashboard reports its backfill state so an empty result is not mistaken
for proof that no votes exist. The full Dingo, Postgres, sync, and app settings
are in the downloaded `docker-compose.yml` and `.env.example`.

## Go server and SQL

The server in `dingo-gov-lens/main.go` opens the database, registers JSON API
routes, and serves the embedded frontend. These are the app's actual route
registrations:

```go
mux := http.NewServeMux()
mux.HandleFunc("GET /api/status", a.handleStatus)
mux.HandleFunc("GET /api/proposals", a.handleProposals)
mux.HandleFunc("GET /api/proposals/{txHash}/{index}", a.handleProposalDetail)
mux.HandleFunc("GET /api/dreps", a.handleDreps)
mux.HandleFunc("GET /api/dreps/{credential}", a.handleDrepDetail)
mux.HandleFunc("GET /api/stake/{credential}", a.handleStakeLookup)
mux.HandleFunc("GET /api/epochs", a.handleEpochs)
```

For example, `handleStatus` reads network and storage mode directly from Dingo's
metadata table:

```go
err := a.db.QueryRowContext(ctx, `
    SELECT COALESCE(network, ''), COALESCE(storage_mode, '')
    FROM node_settings
    ORDER BY id ASC
    LIMIT 1
`).Scan(&ret.Network, &ret.StorageMode)
```

`main.go` contains the complete handlers and parameterized proposal, DRep,
stake, and epoch queries. `static/app.js` calls those endpoints and renders the
results. Use the downloaded source files when copying or adapting the app; the
fragments here show how the server is wired but depend on the surrounding app
types and handlers.

To develop the Go app against an already running compatible Postgres database:

```sh
cd dingo-gov-lens
export DATABASE_URL='host=127.0.0.1 port=5432 user=dingo_gov_lens password=change-me dbname=dingo_metadata sslmode=disable TimeZone=UTC'
export ADDR=127.0.0.1:8088
go test ./...
go run .
```

This app queries Dingo's internal metadata schema, which is not a stable public
API. Review the database design for the Dingo version you deploy and retest
after upgrades. History can be incomplete during backfill, and retention and
feature flags affect which records exist. Keep PostgreSQL private, give the app
read-only access, and use a supported governance application for signing and
submitting proposals or votes. Go library documentation is at
[pkg.go.dev](https://pkg.go.dev/github.com/blinklabs-io/dingo).
