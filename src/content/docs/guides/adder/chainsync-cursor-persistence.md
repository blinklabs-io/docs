---
title: ChainSync Cursor Persistence
description: Configure optional SQLite cursor persistence for ChainSync and integrate it through the Go API.
---

# ChainSync Cursor Persistence

## Overview

This guide describes optional ChainSync cursor persistence for Adder operators and Go integrators. A persisted cursor lets ChainSync resume from the most recently emitted block after a restart while keeping rollback handling aligned with emitted events.

Configure a SQLite path when ChainSync should resume from saved progress after a restart.

## Operator configuration

### Enable cursor persistence with the CLI

Set `--input-chainsync-state-path` to a SQLite database file:

```bash
adder \
  --input chainsync \
  --input-chainsync-state-path /var/lib/adder/chainsync-state.sqlite
```

Adder creates the SQLite file when the path does not exist and reopens it when the path already exists. The parent directory must exist, and the Adder process must have permission to create, read, write, and close the file.

### Enable cursor persistence with YAML

Set `state-path` under the `chainsync` input plugin:

```yaml
plugins:
  input:
    chainsync:
      state-path: /var/lib/adder/chainsync-state.sqlite
```

The default value is an empty path. Leave the CLI option and YAML setting empty or unset to disable cursor persistence and preserve the normal ChainSync startup behavior.

When a setting has multiple sources, Adder applies the general configuration precedence order: CLI flags override environment variables, environment variables override YAML configuration, and YAML configuration overrides defaults. See the [ChainSync options in the command reference](/guides/adder/006-command_list/#input-chainsync) for the complete option list.

> **Warning:** After Adder saves a cursor, ChainSync uses that cursor as the startup intersection. The persisted cursor takes precedence over the configured `intersect-tip` and `intersect-point` values. The configured intersection applies only until the state store contains a cursor.

## Persistence and rollback behavior

ChainSync persists a cursor that represents the most recently emitted block. It does not persist a block merely because the node supplied it or because ChainSync placed it in a confirmation buffer.

- ChainSync updates the pending cursor after it emits every event for a block successfully.
- Adder flushes the pending cursor to SQLite every five seconds.
- Adder flushes the pending cursor again during shutdown.
- A failed flush leaves the pending cursor available for a later flush attempt.
- A rollback rewinds the pending cursor to the last emitted block that survives the rollback. ChainSync does not persist a block that the rollback removed.
- If a rollback removes every emitted block in the tracked history, ChainSync resets the pending cursor to the genesis point.
- On restart, ChainSync loads the saved cursor before it connects and resumes from that point.

The saved cursor records ChainSync progress, not the output event itself. Cursor persistence does not provide exactly-once processing and does not make event delivery durable. Consumers must apply their own delivery and deduplication strategy when those guarantees are required.

When `state-path` remains unset, ChainSync does not create a state store, does not flush a cursor, and continues to use the configured intersection on each start.

## Go API

Go integrations can provide a state store directly or select a different key for the cursor.

### Provide a state store

Use `WithStateStore` with a `state.Store` implementation. The SQLite store provides a file-backed implementation:

```go
package main

import (
	"log"

	"github.com/blinklabs-io/adder/input/chainsync"
	"github.com/blinklabs-io/adder/state"
)

func newChainSync() *chainsync.ChainSync {
	store, err := state.NewSqliteStore("/var/lib/adder/chainsync-state.sqlite")
	if err != nil {
		log.Fatal(err)
	}

	return chainsync.New(
		chainsync.WithStateStore(store),
		chainsync.WithStateKey("consumer-a"),
	)
}
```

`WithStateStore` changes startup behavior only when the store already contains a cursor. ChainSync uses that cursor instead of the configured intersection and otherwise retains the configured intersection until the first cursor flush.

### Select the cursor key

ChainSync uses `chainsync-cursor` as the default state key. Use `WithStateKey` to select a distinct key when multiple ChainSync instances share one SQLite file:

```go
chainsync.New(
	chainsync.WithStateStore(sharedStore),
	chainsync.WithStateKey("orders-consumer"),
)
```

Each shared instance requires a distinct key to prevent one cursor from replacing another.

### Manage store ownership

ChainSync distinguishes stores that it creates from stores that a caller provides:

- The `state-path` configuration creates an owned SQLite store. ChainSync closes the owned store during shutdown and reopens it for the next run.
- `WithStateStore` supplies a caller-owned store. ChainSync leaves that store open across `Stop` and `StartRun` so shared integrations can continue using it. The caller closes the store when all users finish.

This lifecycle applies to the store connection. The SQLite file remains available for later runs when the process closes the store.

## Related reference

- [Command reference: ChainSync options](/guides/adder/006-command_list/#input-chainsync)


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
