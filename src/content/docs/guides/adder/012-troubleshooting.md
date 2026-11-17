---
title: Troubleshooting
description: How to troubleshoot Adder profiling.
---

## Profiling troubleshooting

### Symptom

The `/debug/pprof` endpoint and goroutine leak HTTP collection are unavailable through Adder's debug listener. Adder's debug listener does not register HTTP `pprof` handlers.

### Correction

Follow the [benchmarks and profiling guide](./011-benchmarks-and-profiling) for supported local commands. It provides bounded Go test runs with `-cpuprofile`, `-memprofile`, and `-trace`, followed by analysis with `go tool pprof` and `go tool trace`.

Keep profiles in a private temporary directory because they can contain application data and file paths. The local commands use Go's test profiler and open no network listener. Never expose a profiling listener on a public interface.