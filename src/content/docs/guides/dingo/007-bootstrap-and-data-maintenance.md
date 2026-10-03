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
and download host allowlists in the Dingo v0.77.0
[example configuration](https://raw.githubusercontent.com/blinklabs-io/dingo/v0.77.0/dingo.yaml.example). Use it
with that release only; configuration options can change between versions.


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
