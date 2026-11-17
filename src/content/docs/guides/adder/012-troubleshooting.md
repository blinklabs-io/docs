---
title: Troubleshooting
description: How to troubleshoot Adder profiling.
---

## Profiling troubleshooting

### Symptom

The `/debug/pprof` endpoint and goroutine leak HTTP collection are unavailable through Adder's debug listener. This listener does not register HTTP `pprof` handlers.

### Correction

Use the [benchmarks and profiling guide](./011-benchmarks-and-profiling) for supported local commands. The guide provides bounded Go test runs with `-cpuprofile`, `-memprofile`, and `-trace`, followed by analysis with `go tool pprof` and `go tool trace`.

Keep profile files in a private temporary directory because they can contain application data and file paths. The local commands invoke Go's test profiler and open no network listener. Do not expose a profiling listener on a public interface.

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
