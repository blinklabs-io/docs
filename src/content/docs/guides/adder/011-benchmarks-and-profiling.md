---
title: Adder benchmarks and local profiling
description: Run the Adder streaming benchmark and collect local CPU, memory, and execution trace profiles.
---

## Overview

This guide covers the streaming and backpressure benchmark for the Adder pipeline and the local workflow for collecting CPU, memory, and scheduler profiles. The benchmark uses synthetic input buffers and output behavior to compare pipeline behavior; it does not establish throughput for a production deployment.

Run all commands from the repository root.

## Run the streaming benchmark

Execute the following loop to compare the three input buffer capacities in a balanced order:

```sh
for order in 0 1 2 2 1 0; do
  GOMAXPROCS=2 ADDER_BENCH_ORDER="$order" GOWORK=off go test ./pipeline -run '^$' -bench '^BenchmarkPipelineStreaming$' -benchmem -benchtime=200ms -count=1 -v
done
```

`BenchmarkPipelineStreaming` compares synthetic input buffers with capacities of `10`, `256`, and `2,048` event slots. The `ADDER_BENCH_ORDER` value controls the case order. The loop runs the three orders twice, and `-v` prints each order with its raw timings.

The benchmark compares these synthetic output modes for each buffer case:

- `fast_output` drains continuously.
- `periodic_output_pause` pauses for 100 microseconds after every 64 events to model intermittent sink backpressure.

Each operation sends and drains `4,096` block event envelopes. The benchmark reports events per second, time per operation, and allocations per `4,096-event` operation. Startup and shutdown occur outside the timed section.

## Compare results

Compare the same named case across repeated runs on the same machine, with the same Go version and workload. The six runs in the command balance the three buffer orders. Compare both events per second and allocations, rather than using producer completion time alone as a measure of end to end delivery.

The benchmark does not include the following production concerns:

- A Cardano node or network output
- Decoding data or applying filters
- Serializing output
- Allocating payloads
- Real sink latency

The pause schedule is synthetic and does not measure sink latency. Because channel creation occurs outside the timer, `B/op` does not include the buffer's storage.

Larger buffers can absorb a burst, but they retain more queued events and referenced payloads while a sink falls behind. A larger buffer does not increase the capacity of a persistently slow sink. These cases isolate that tradeoff; they do not identify an optimal setting for a particular node, network, event mix, or output. Keep the runtime defaults until measurements from the intended workload justify a change.

## Capture local profiles

Use a private temporary directory because profiles can contain application data and paths. Capture each profile separately so one profiler does not distort another:

```sh
profile_dir=$(mktemp -d)
GOWORK=off go test ./pipeline -run '^$' -bench '^BenchmarkPipelineStreaming/buffer_2048/fast_output$' -benchtime=1s -count=1 -cpuprofile="$profile_dir/cpu.out"
go tool pprof -top "$profile_dir/cpu.out"
GOWORK=off go test ./pipeline -run '^$' -bench '^BenchmarkPipelineStreaming/buffer_2048/fast_output$' -benchtime=200ms -count=1 -memprofile="$profile_dir/mem.out"
go tool pprof -alloc_space -top "$profile_dir/mem.out"
GOWORK=off go test ./pipeline -run '^$' -bench '^BenchmarkPipelineStreaming/buffer_2048/fast_output$' -benchtime=200ms -count=1 -trace="$profile_dir/trace.out"
go tool trace -pprof=sched "$profile_dir/trace.out" > "$profile_dir/sched.pprof"
go tool pprof -top "$profile_dir/sched.pprof"
```

The profiles provide these views:

- The CPU profile samples active CPU work.
- `alloc_space` reports cumulative allocations, not retained heap. Use `-inuse_space` to inspect retained heap at the capture point.
- The memory profile includes process startup and benchmark setup.
- The scheduler profile highlights runnable delays.

A short run can produce too few samples. Increase `-benchtime` only when the machine has capacity. This synthetic channel workload can be dominated by Go runtime scheduling and does not identify a bottleneck in a real Adder deployment. Keep the Go version, machine, workload, and benchmark duration fixed for comparisons, collect multiple unprofiled runs, and compare events per second with `B/op`.

Profile instrumentation changes timings. Do not use profiled runs as the throughput baseline.

## Profiling safety boundary

Adder disables its debug listener by default and does not register HTTP pprof handlers. The commands in this guide use Go's test profiler and open no network listener. Do not expose a profiling listener on a public interface; use this private local workflow instead of an HTTP pprof or goroutine leak listener workflow.


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
