---
title: LeiosDB benchmark CLI
description: Run the v0.86.0 LeiosDB latency benchmark and interpret its output.
---

The `cmd/leios-db-bench` command measures LeiosDB latency across fetch, vote read, serve request reads, and apply read steps.

## Invocation

Run the benchmark with a supported entry point:

```sh
make bench-leios-db
```

Use the cached-read benchmark target to measure a read-through cache scenario. The target passes the value of `LEIOS_DB_BENCH_ARGS` to the benchmark:

```sh
make bench-leios-db-cached
```

```sh
go run ./cmd/leios-db-bench
```

## Current flags

The latency benchmark supports the following flags:

| Flag | Role |
| --- | --- |
| `-volatile-ebs` | Configures the volatile EBs used for measurement. |
| `-request-bytes` | Configures request sizing. |
| `-job-bytes` | Configures job sizing. |
| `-upstream-peers` | Sets the number of upstream peers that share fetch ranges. |
| `-downstream-peers` | Sets the number of downstream peers that share serve requests. |
| `-samples` | Sets the number of samples collected. |
| `-gc-every` | Configures the garbage collection cadence. |
| `-burst` | Enables optional burst scheduling. |
| `-burst-size` | Configures the size of scheduled bursts. |
| `-burst-interval` | Configures the interval between scheduled bursts. |
| `-cached-reads` | Enables read-through caching for persisted manifest and closure reads for each endorser block. |
| `-cpuprofile` | Writes CPU profiling diagnostics. |
| `-heapprofile` | Writes heap profiling diagnostics. |

## Removed flags

> **Migration note:** The following throughput benchmark flags no longer exist. An invocation that passes them fails, so existing scripts must replace them with the current flags above.

- `-pre-populated-ebs`
- `-fetch-clients`
- `-ebs-per-client`
- `-fetch-servers`
- `-chain-sel-reads`
- `-gc-ticks`
- `-runs`

## Workload behavior

The benchmark measures one endorser block at a time across these steps:

1. **Fetch** reads the endorser block data.
2. **Vote read** reads the vote data for the block.
3. **Serve request reads** reads the requested data for downstream peers.
4. **Apply read** reads the data used by the apply step.

The benchmark partitions requests and ranges across the configured upstream and downstream peers. Pruning does not advance past endorser blocks with readers still in flight. When the benchmark ends, the optional `-burst` scheduler stops promptly instead of waiting for its next interval.

## Output

The benchmark reports the following values for fetch, vote, serve, and apply:

- `p50` latency
- `p99` latency
- maximum latency
- sample count

These results describe latency for each workload step. They do not report throughput or iteration timing.

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
