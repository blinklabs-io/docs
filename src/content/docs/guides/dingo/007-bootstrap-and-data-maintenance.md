---
title: Bootstrap and Data Maintenance
description: Bootstrap Dingo with Mithril and maintain its local database safely.
---

## Bootstrap from Mithril

Dingo includes a Mithril client for downloading and importing a network
snapshot before syncing the remaining blocks. The normal flow is:

```sh
dingo mithril list
dingo mithril show <snapshot-hash>
dingo mithril sync --config ./dingo.yaml
dingo serve --config ./dingo.yaml
```

Use the snapshot commands supported by your installed Dingo version; run
`dingo mithril --help` for the exact flags. Mithril snapshot verification
checks the certificate chain and signed snapshot data. After import, Dingo
validates blocks from the imported point onward. API storage mode also
backfills historical query data after loading the snapshot; core mode keeps
the consensus state and block data without the full historical API index.

See the [quick start](/guides/dingo/002-quick-start-overview/) for a complete
first-run walkthrough. Snapshot size, disk use, and load time vary by network
and grow as the chain advances; leave space for both downloaded files and the
database during import.

### Produce and serve Mithril artifacts

Create a Mithril artifact from a Cardano node database, then serve the stored
artifacts with the configured Mithril server:

```sh
dingo mithril snapshot create --db-dir <cardano-node db>
dingo mithril serve --config ./dingo.yaml
```

Configure `mithril.server.artifactStore` before creating or serving artifacts.
Set `mithril.server.publicBaseUrl` to a public `https://` origin; Dingo accepts
an `http://` origin only on loopback. Set `mithril.server.port` for the serving
port. The server exposes artifact reads publicly, and clients can use HTTP range
requests for artifact downloads.

Use `mithril.server.redirectBaseUrl` to redirect archive requests to a public
object store, `mithril.server.tlsEnabled` to enable HTTPS with the shared Dingo
certificate, and `mithril.server.keepSnapshots` to retain a defined number of
newest snapshots. Enable the optional `mithril.server.aggregator` settings when Dingo
must collect signatures and certify snapshots. Configure
`mithril.server.aggregator.operatorTokenFile` for the bearer token used by registration
and signature operations; non-loopback aggregator binds also require TLS. See
 the [`mithril` configuration reference](https://raw.githubusercontent.com/blinklabs-io/dingo/v0.87.0/dingo.yaml.example)
for the complete `server` and `aggregator` settings.

Mithril v2 bootstrap accepts artifact locations and redirects only from the configured
aggregator origin or the official `storage.googleapis.com` Mithril origin. Dingo
retains the existing `https://` requirement and the local development exception for
loopback destinations. Each bootstrap applies a bootstrap-wide budget to artifact and redirect requests
and bytes together, enforces a 24-hour download deadline, limits immutable archives
to 100000 and deduplicates locations to at most four per artifact component. Archive
extraction also limits entries and expanded bytes and reserves required free space;
Dingo applies built-in limits for these protections.

Before extraction, Dingo verifies the signed ancillary manifest and its permitted
paths and digests. Immutable archives do not provide unauthenticated ledger trees;
Dingo restores ledger state only from the signed ancillary archive.

## Load an ImmutableDB from a local or remote source

`dingo load` accepts a local ImmutableDB directory or a remote ImmutableDB
root. Set `immutableDbPath` in the configuration or
`DINGO_IMMUTABLE_DB_PATH`, or pass the source as the positional input to
`dingo load`. Use a local directory path for local data. Use an `https://` URL
for a remote source; Dingo accepts `http://` only for loopback destinations and
rejects non-loopback HTTP sources. Dingo rejects private or special-use HTTPS
destinations at the initial URL, after every redirect, and for every dial-time
DNS answer. Dingo does not route remote import traffic through ambient HTTP
proxy settings.

Dingo applies aggregate limits to transfer bytes, active cache and staging
data, reserved free space, and concurrency for the complete import based on the
requested range. If the import exceeds an available limit or free-space
reserve, Dingo fails it explicitly instead of allowing unbounded resource use.
Dingo cleans up staging files when an import fails, including setup and budget
initialization failures.
Dingo rewinds copied immutable blocks that trusted replay or processing left unapplied
to the ledger-applied tip. If the storage backend refuses that rewind,
the load reports both the original failure and the rewind failure. Recover the
database before attempting another load; Dingo does not automatically recover every
load failure.

A remote root must provide `tip.json` and complete numbered chunk triads. Each
triad must use the same five-digit number for all three files:

```text
tip.json
NNNNN.chunk
NNNNN.primary
NNNNN.secondary
```

Dingo downloads ahead into staging and ready caches under
`<databasePath>/immutable-download/`. It stores interrupted downloads as
`.part` files, resumes them with HTTP Range requests, and retries failed
requests. Dingo moves complete triads to the ready cache in chunk number order
and replays the contiguous range. It stops after the chunk containing the slot
in `tip.json`, or earlier when it reaches the first unpublished chunk.

Dingo checks that the loaded tip's slot and block hash match the values in
`tip.json`; a mismatch fails the load. If a published `.chunk` lacks its
matching `.primary` or `.secondary`, the load also fails. Provide every
published chunk in the contiguous range at the remote root so the load can
progress to the tip.

### Ledger-state import validation

Before persisting imported ledger state, Dingo validates consensus inputs such
as tip hash and nonce widths, certificate and stake snapshots, pool distribution
and governance state, protocol parameters, and fee-pot relationships. If this
preflight rejects an input, the import fails before the UTxO phase and does not
persist partial UTxO state.

## Snapshot, restore, and truncate

The `dingo database` commands snapshot, restore, or rewind the configured
database. These are offline maintenance operations: stop the node first and
make sure no other Dingo process has the data directory open.

```sh
dingo database snapshot --dir /backups/dingo-preview
dingo database restore /backups/dingo-preview
dingo database truncate --slot 12345678
```

`snapshot` requires a destination directory that does not already exist.
Before restoring, move the existing configured data directory aside; the
configured path must be absent or empty. A restore into a populated directory
fails.
For operations that authenticate snapshots, `databaseLifecycle.snapshotTrustKeyFile`
must name a regular file, not a final-component symlink, no larger than 1024 bytes.
On Unix, the node user must own the file and the file must grant access only to its
owner. On Windows, the owner must be the node user or `BUILTIN\Administrators`,
the process must belong to the administrator group when that owner applies, and
the DACL must restrict access to the permitted trustees. Snapshot authentication
rejects a file that fails any of these requirements.

MySQL snapshot and restore reject `tls=skip-verify`. See the Dingo configuration reference
for provider TLS defaults.
`truncate` accepts exactly one target: `--slot`, `--hash`, or
`--block-number`. It removes blocks and metadata after that point so the node
can resync from the new tip. Check `dingo database --help` for all options
before running a recovery operation. Dingo refuses a target before the recorded
Mithril trust boundary because the required UTxO history is not available
locally before that point. Truncation can also fail when the database no longer
retains consumed-UTxO history needed for the target. If local history is
insufficient, use a database snapshot from a fully synced peer that retains
the required history.

## History expiry and archives

History expiry removes old immutable block files from local storage while
retaining ledger indexes and metadata. Reads for those blocks then need a
configured [Bark archive](/guides/dingo/006-apis-and-archive/) or return an
expired-history error. An archive service uses an object storage provider that
can issue signed download URLs. Configure expiry frequency, archive storage,
and download host allowlists in the Dingo v0.87.0 release
[example configuration](https://raw.githubusercontent.com/blinklabs-io/dingo/v0.87.0/dingo.yaml.example). Use this example
only with Dingo v0.87.0; configuration options can change between versions.

Configure the compressed download limit for each Mithril object with `mithril.downloadMaxBytes` in `dingo.yaml`, `--mithril-download-max-bytes` on the command line, or `DINGO_MITHRIL_DOWNLOAD_MAX_BYTES` in the environment. Set the value to `0` to use the built-in limits. The `v1` limit is `512 GiB`; `v2` uses `1 GiB` for immutable archives, `256 MiB` for the digest list, and `64 GiB` for ancillary data. A positive byte value replaces the built-in limit for each downloaded object. A negative value is invalid and causes configuration validation to fail.


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
