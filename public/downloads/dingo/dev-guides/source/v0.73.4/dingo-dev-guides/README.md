# Dingo application development bundle

This bundle contains three complete Preview application projects, their existing
Kubernetes values and helper scripts, frontend assets, lockfiles, and Gov Lens
database grants and tests. The examples target Dingo v0.73.4, using the published
`ghcr.io/blinklabs-io/dingo:0.73.4` image.

## Requirements

Use an explicitly selected Kubernetes context, Helm, kubectl, Node.js 24 or
later for the frontends, and Go 1.26 or later for Gov Lens. Dingo needs persistent
storage and enough disk space for Preview. Gov Lens also needs an existing
PostgreSQL metadata database reachable from the node and the local application.

Each project has its own node configuration. The explorer and wallet examples
use SQLite; Gov Lens requires PostgreSQL and a separate read-only application
role. Deploy these as separate Helm releases when following all three examples.
Do not point their independent nodes at the same data directory or database.

## Blockfrost Explorer

From `dingo-blockfrost-explorer/`, deploy the existing values:

```sh
helm upgrade --install dingo-explorer oci://ghcr.io/blinklabs-io/helm-charts/charts/dingo --version 0.1.3 --namespace dingo-explorer --create-namespace --values k8s/dingo-values.yaml
```

Keep a port-forward running in a separate terminal:

```sh
kubectl -n dingo-explorer port-forward svc/dingo-explorer 3000:3000 12798:12798 --address 127.0.0.1
```

Start the local frontend:

```sh
npm ci
DINGO_BLOCKFROST_URL=http://127.0.0.1:3000 DINGO_METRICS_URL=http://127.0.0.1:12798 npm run dev -- --host 127.0.0.1
```

Open <http://127.0.0.1:5173>. The node bootstraps from Mithril before serving;
wait for synchronization before expecting populated explorer results.

## Sundae Preview wallet

From `dingo-sundae-preview/`, use the existing deployment helper:

```sh
NAMESPACE=dingo-wallet RELEASE=dingo-wallet ./scripts/deploy-dingo.sh
```

In a separate terminal, forward UTxO RPC:

```sh
NAMESPACE=dingo-wallet RELEASE=dingo-wallet ./scripts/port-forward-dingo.sh
```

Then start the frontend:

```sh
npm ci
DINGO_UTXORPC_URL=http://127.0.0.1:9090 npm run dev -- --host 127.0.0.1
```

Open <http://127.0.0.1:5174> with a Preview-compatible CIP-30 wallet. The app
checks network magic and Sundae reference UTxOs before offering swaps.

## Gov Lens

From `dingo-gov-lens/`, copy the existing values before editing:

```sh
cp k8s/dingo-values.yaml gov-lens-values.local.yaml
```
Replace its PostgreSQL DSN with the connection details for your existing
metadata database, using a server certificate trusted by the Dingo image's
system CA store and a matching DNS hostname. Keep the node's database owner
credentials private and separate from the app's read-only credentials.

```sh
helm upgrade --install dingo-governance oci://ghcr.io/blinklabs-io/helm-charts/charts/dingo --version 0.1.3 --namespace dingo-governance --create-namespace --values gov-lens-values.local.yaml
```

After Dingo creates its schema, edit `sql/create-readonly-user.sql` for your
database, node owner, and application password, then set POSTGRES_ADMIN_DSN for your administrator connection and apply it:

```sh
psql "$POSTGRES_ADMIN_DSN" --set ON_ERROR_STOP=1 --file sql/create-readonly-user.sql
```

The grants cover current tables and future tables created by
the configured Dingo owner. Start Gov Lens locally with the read-only DSN:

```sh
export DATABASE_URL='host=postgres.example.com port=5432 user=dingo_gov_lens password=change-me dbname=dingo_metadata sslmode=verify-full sslrootcert=system TimeZone=UTC'
export ADDR=127.0.0.1:8088
go test ./...
./scripts/run-app.sh
```

Replace the example DSN hostname and password with your database details.
Both the node and local Go process verify the database certificate against their
system trust stores and match its DNS name; the database must be reachable from
both environments. Open <http://127.0.0.1:8088>. Historical governance backfill
can continue after the node reaches tip, and the dashboard reports that state.

For an already running PostgreSQL pod and local Gov Lens process, run the
read-only integration checks with explicit namespace and pod selection:

```sh
POSTGRES_NAMESPACE=database POSTGRES_POD=postgres-0 POSTGRES_USER=dingo POSTGRES_DB=dingo_metadata ./scripts/e2e-kubernetes.sh
```

The selected pod must provide `psql` and its database authentication. The script
checks the HTTP status endpoint, node network/storage settings, and governance
row counts. It does not deploy a node or provision a database.

## Source and configuration

The `k8s/dingo-values.yaml` files are the executable node configuration for
each example. The existing direct-binary scripts remain available in the
explorer and Gov Lens projects. Preserve the v0.73.4 node version when using
these versioned examples; API and internal metadata contracts can change.
See the [Dingo guides](https://docs.blinklabs.io/guides/dingo/001-dingo/) for
application walkthroughs and release-specific node configuration.
