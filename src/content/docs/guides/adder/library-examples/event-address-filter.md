---
title: Filter by Address and Asset
description: Combine Adder transaction, address, and native asset filters.
sidebar:
  order: 4
---

The event filter first selects `input.transaction`. The Cardano filter then requires both the configured address and asset fingerprint to match. Edit `WithAddresses` and `WithAssetFingerprints` for your targets; remove the asset option to watch all matching address transactions.

Follow the [bundle setup](/guides/adder/library-examples/overview/#setup), then run from its root:

```sh
export CARDANO_NODE_SOCKET_PATH=/path/to/node.socket
go run ./event-address-filter
```

Download [main.go](/downloads/adder/library-examples/source/event-address-filter/main.go)
as part of the [complete bundle](/downloads/adder/library-examples/adder-library-examples.tar.gz).

## Source

```go
// Copyright 2026 Blink Labs Software
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package main

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"os"
	"os/signal"
	"syscall"

	"github.com/blinklabs-io/adder/event"
	filter_chainsync "github.com/blinklabs-io/adder/filter/cardano"
	filter_event "github.com/blinklabs-io/adder/filter/event"
	input_chainsync "github.com/blinklabs-io/adder/input/chainsync"
	output_embedded "github.com/blinklabs-io/adder/output/embedded"
	"github.com/blinklabs-io/adder/pipeline"
	"github.com/kelseyhightower/envconfig"
)

// Config holds the Cardano node connection settings.
type Config struct {
	SocketPath string `split_words:"true"`
	Magic      uint32
}

func main() {
	if err := run(); err != nil {
		slog.Error("adder example failed", "error", err)
		os.Exit(1)
	}
}

func run() (err error) {
	cfg := Config{
		Magic:      764824073,
		SocketPath: "/ipc/node.socket",
	}
	if err := envconfig.Process("cardano_node", &cfg); err != nil {
		panic(err)
	}

	p := pipeline.New()

	inputOpts := []input_chainsync.ChainSyncOptionFunc{
		input_chainsync.WithAutoReconnect(true),
		input_chainsync.WithIntersectTip(true),
		input_chainsync.WithStatusUpdateFunc(updateStatus),
		input_chainsync.WithNetworkMagic(cfg.Magic),
		input_chainsync.WithSocketPath(cfg.SocketPath),
	}
	input := input_chainsync.New(
		inputOpts...,
	)
	p.AddInput(input)

	filterEvent := filter_event.New(
		filter_event.WithTypes([]string{event.TypeTransaction}),
	)
	p.AddFilter(filterEvent)

	filterChainsync := filter_chainsync.New(
		filter_chainsync.WithAddresses(
			[]string{
				"addr1q93l79hdpvaeqnnmdkshmr4mpjvxnacqxs967keht465tt2dn0z9uhgereqgjsw33ka6c8tu5um7hqsnf5fd50fge9gq4lu2ql",
			},
		),
		// Remove the entire WithAssetFingerprints call to disable asset filtering.
		// Filter on DJED asset https://cexplorer.io/asset/asset15f3ymkjafxxeunv5gtdl54g5qs8ty9k84tq94x
		filter_chainsync.WithAssetFingerprints(
			[]string{"asset15f3ymkjafxxeunv5gtdl54g5qs8ty9k84tq94x"},
		),
	)

	p.AddFilter(filterChainsync)

	output := output_embedded.New(
		output_embedded.WithCallbackFunc(handleEvent),
	)

	p.AddOutput(output)

	ctx, cancel := signal.NotifyContext(
		context.Background(), os.Interrupt, syscall.SIGTERM,
	)
	defer cancel()
	if err := p.StartContext(ctx); err != nil {
		if ctx.Err() != nil {
			return nil
		}
		return fmt.Errorf("failed to start pipeline: %w", err)
	}
	defer func() {
		err = errors.Join(err, p.Stop())
	}()

	for {
		select {
		case <-ctx.Done():
			return nil
		case <-p.Failed():
			return fmt.Errorf("pipeline failed: %w", p.Failure())
		case err, ok := <-p.ErrorChan():
			if !ok {
				return p.Failure()
			}
			slog.Error("pipeline diagnostic", "error", err)
		}
	}
}

func handleEvent(evt event.Event) error {
	slog.Info("received event", "type", evt.Type)
	return nil
}

func updateStatus(status input_chainsync.ChainSyncStatus) {
	slog.Info("chainsync status update", "status", status)
}
```
