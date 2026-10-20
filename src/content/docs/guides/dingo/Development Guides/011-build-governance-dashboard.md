---
title: Build a Governance Dashboard
description: Run and extend the complete Go governance dashboard and its Dingo PostgreSQL configuration.
---

The bundle contains the complete Gov Lens Go server, tests, embedded frontend,
read-only database grants, and existing Kubernetes values for Dingo:

[Download the Dingo application examples for v0.73.4](/downloads/dingo/dev-guides/dingo-application-examples-v0.73.4.tar.gz)

Browse the [versioned Gov Lens source](https://github.com/blinklabs-io/docs/tree/main/public/downloads/dingo/dev-guides/source/v0.73.4/dingo-dev-guides/dingo-gov-lens).
Use Go 1.26 or later, Helm, kubectl, and a selected Kubernetes context.
Provision a private PostgreSQL metadata database accessible to Dingo and the
local app before deploying the node.

```sh
tar -xzf dingo-application-examples-v0.73.4.tar.gz
cd dingo-dev-guides/dingo-gov-lens
cp k8s/dingo-values.yaml gov-lens-values.local.yaml
```

Edit the copied values' PostgreSQL DSN for your database owner and database.
Use a server certificate trusted by the Dingo image's system CA store and a
matching DNS hostname. Keep credentials in your local configuration. The existing
values pin Dingo 0.73.4, select Preview and API storage, use PostgreSQL metadata
and Badger blocks, and disable the optional API listeners.

```sh
helm upgrade --install dingo-governance oci://ghcr.io/blinklabs-io/helm-charts/charts/dingo --version 0.1.3 --namespace dingo-governance --create-namespace --values gov-lens-values.local.yaml
```

After Dingo creates its schema, edit `sql/create-readonly-user.sql` for the
database, Dingo owner, and app password, then set POSTGRES_ADMIN_DSN for your administrator connection and run it:

```sh
psql "$POSTGRES_ADMIN_DSN" --set ON_ERROR_STOP=1 --file sql/create-readonly-user.sql
```

Gov Lens must use the separate read-only role. Run the Go app
locally using the commands below and open <http://127.0.0.1:8088>. Historical
backfill can continue after the node reaches tip; the dashboard reports this
state rather than treating missing rows as proof that no governance exists.

The bundle README documents the existing `scripts/e2e-kubernetes.sh` probes
for a running Gov Lens process and a PostgreSQL pod selected explicitly by
namespace and name. The script checks HTTP status, node settings, and governance
row counts without deploying services.

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
export DATABASE_URL='host=postgres.example.com port=5432 user=dingo_gov_lens password=change-me dbname=dingo_metadata sslmode=verify-full sslrootcert=system TimeZone=UTC'
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
