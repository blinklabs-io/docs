---
title: Troubleshooting
description: How to troubleshoot Adder profiling.
---

## Profiling troubleshooting

### Symptom

Requests to `/debug/pprof` or attempts to collect goroutine leak data over HTTP do not work through Adder's debug listener. The debug listener does not register HTTP `pprof` handlers.

### Correction

Use the [benchmarks and profiling guide](./011-benchmarks-and-profiling) for supported local commands. The guide uses bounded Go test runs with `-cpuprofile`, `-memprofile`, and `-trace`, then examines the results with `go tool pprof` and `go tool trace`.

Store profiles in a private temporary directory because they can contain application data and file paths. The local commands use Go's test profiler and open no network listener. Never expose a profiling listener on a public interface.