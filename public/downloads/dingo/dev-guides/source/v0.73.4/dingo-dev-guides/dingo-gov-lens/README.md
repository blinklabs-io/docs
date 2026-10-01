# Dingo Gov Lens

This directory contains the complete Go server, embedded HTML/CSS/JavaScript,
database role setup, unit tests, and container build file for the governance
dashboard. The shared Compose stack starts it at <http://127.0.0.1:8088>; see
the bundle root `README.md` for startup and Dingo configuration.

To run the app locally with a PostgreSQL Dingo metadata database and its
read-only role already configured:

Use Go 1.26 or later.

```sh
export DATABASE_URL='host=127.0.0.1 port=5432 user=dingo_gov_lens password=change-me dbname=dingo_metadata sslmode=disable TimeZone=UTC'
export ADDR=127.0.0.1:8088
go run .
```

Run `sql/create-readonly-user.sql` as the database administrator after editing
the role, password, database, and Dingo owner names to match your setup. The
Compose initialization script does this automatically for the bundled local
stack.

`main.go` wires HTTP routes and queries indexed governance data;
`static/app.js` renders the dashboard and calls those routes. The SQL reads
Dingo's internal metadata tables, which are not a stable public API. Review the
database design for the exact Dingo version you deploy and retest this app after
upgrades. Do not expose PostgreSQL to browsers or grant the dashboard write
access.
