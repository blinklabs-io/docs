# Dingo Gov Lens

This directory contains the complete Go server, embedded HTML/CSS/JavaScript,
database role setup, unit tests, and container build file for the governance
dashboard. Use the existing Kubernetes values and local Go entry point described in
the bundle root `README.md`.

To run the app locally with a PostgreSQL Dingo metadata database and its
read-only role already configured:

Use Go 1.26 or later.

```sh
export DATABASE_URL='host=postgres.example.com port=5432 user=dingo_gov_lens password=change-me dbname=dingo_metadata sslmode=verify-full sslrootcert=system TimeZone=UTC'
export ADDR=127.0.0.1:8088
go run .
```

Run `sql/create-readonly-user.sql` as the database administrator after editing
the role, password, database, and Dingo owner names to match your setup. Apply the grants after Dingo creates its metadata schema. The existing
`scripts/e2e-kubernetes.sh` checks an already running deployment using an
explicit PostgreSQL namespace and pod.

`main.go` wires HTTP routes and queries indexed governance data;
`static/app.js` renders the dashboard and calls those routes. The SQL reads
Dingo's internal metadata tables, which are not a stable public API. Review the
database design for the exact Dingo version you deploy and retest this app after
upgrades. Do not expose PostgreSQL to browsers or grant the dashboard write
access.
