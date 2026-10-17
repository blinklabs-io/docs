---
title: BlockPipeline ownership and Block Fetch range limits
description: Configure retained block data limits, release BlockPipeline results, and handle Block Fetch range safeguards in Go.
---

This guide describes two resource contracts for gOuroboros integrations:

- `BlockPipeline` limits the aggregate full block CBOR that in-flight items retain.
- Block Fetch limits the number of blocks, encoded response bytes, and total lifetime of each inclusive range.

## BlockPipeline result ownership

`PipelineConfig.MaxRawCborBytes` sets the aggregate budget for full block CBOR
copies retained between submission and result delivery. The budget covers the
raw submission copy and the decoded block's stored CBOR for in-flight pipeline
items. `DefaultMaxRawCborBytes` sets the default to `64 MiB`, and a zero
`MaxRawCborBytes` value selects that default.

Configure the value through `WithMaxRawCborBytes`:

```go
blockPipeline := pipeline.NewBlockPipeline(
	pipeline.WithMaxRawCborBytes(128 * 1024 * 1024),
)
```

The pipeline reserves the required retained bytes during `Submit` and keeps
each result charged until the consumer receives it. If a block cannot fit within
the configured aggregate budget, `Submit` returns an error that matches
`pipeline.ErrRawCborBudgetExceeded`. If consumers do not receive and release
results, later submissions can remain backpressured because retained results
continue to occupy pipeline resources.

### Consume and release every result

The pipeline transfers ownership of every item received from `Results()` and
every item returned by `DrainResults()` to the caller. Process the item before
calling `Release`:

```go
consume := func(item *pipeline.BlockItem) {
	// Read or process all required fields before releasing the item.
	raw := item.RawCbor()
	block := item.Block()
	_ = raw
	_ = block

	item.Release()
}

for item := range blockPipeline.Results() {
	consume(item)
}

for _, item := range blockPipeline.DrainResults() {
	consume(item)
}
```

`Release()` is idempotent, so repeated calls are safe. The method clears the
item's raw and decoded block data; callers must not call `RawCbor()` or
`Block()` after release. Apply the same consume-then-release procedure during
normal processing, cleanup, and shutdown paths.

## Block Fetch range safeguards

Block Fetch applies three cumulative limits to each inclusive range. Configure
the fields on `blockfetch.Config` directly or use the corresponding option
functions:

| Configuration field | Option | Unit | Zero value |
| --- | --- | --- | --- |
| `MaxBlocksPerRange` | `WithMaxBlocksPerRange` | Blocks per range | `2,161` blocks |
| `MaxRangeBytes` | `WithMaxRangeBytes` | Cumulative encoded bytes per range | `214,205,235` bytes |
| `RangeTimeout` | `WithRangeTimeout` | Total range lifetime | `36 hours 3 minutes` |

`NewConfig` applies these defaults. A zero field or zero option argument selects
the corresponding default; the zero value does not disable the safeguard.

The client counts every complete encoded `MsgBlock` message in the range:

- `MaxBlocksPerRange` counts the cumulative number of accepted blocks.
- `MaxRangeBytes` counts the cumulative encoded bytes of those complete `MsgBlock` messages.
- `RangeTimeout` starts when request admission begins. It includes local waits for in-flight capacity and request enqueue, and block progress does not renew the deadline.

The range counters apply to the whole inclusive range, not to individual
responses or batches. The client checks the limits before it delivers each
block and checks the deadline at terminal range handling as well.

### Range limit errors

The client wraps one of these exported sentinel errors when a range reaches a
limit:

- `blockfetch.ErrRangeBlockLimit` indicates that the range exceeded `MaxBlocksPerRange`.
- `blockfetch.ErrRangeByteLimit` indicates that the range exceeded `MaxRangeBytes`.
- `blockfetch.ErrRangeTimeout` indicates that the range exceeded `RangeTimeout`.

Use wrapped-error matching instead of comparing error strings:

```go
if errors.Is(err, blockfetch.ErrRangeTimeout) {
	// Retry or discard the range according to application policy.
}
```

For `Client.RequestRange`, the method returns admission failures directly, and
`RangeDoneFunc` receives each terminal range failure in its `error` argument.
Synchronous APIs and other callback-based request paths surface their
applicable error through their normal return or completion callback. A range
limit failure sends a protocol error and shuts down the affected Block Fetch
protocol, so callers must also handle terminal errors for other requests on
that protocol.

### Range limits and in-flight admission

The range safeguards do not replace `RangeRequest.ExpectedBytes` or
`MaxInFlightBytes`. `ExpectedBytes` is the caller's estimate of the serialized
size of a range, including headers. The client uses that estimate to admit
outstanding pipelined requests against `MaxInFlightBytes` and to size the
requested ingress allowance. The range safeguards instead count the actual
complete `MsgBlock` responses and the actual total time for one range.

## Connection read-buffer accounting

Connection-wide read-buffer accounting now follows the retained capacity of
each `bytes.Buffer` through delivery and compaction. Leftover capacity after a
message is consumed therefore remains counted instead of being under-counted.
This behavior does not add a new option or require changes to unrelated
configuration.
