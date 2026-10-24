---
title: マネージドプラグインの作成
description: キャンセルに対応した Adder の入出力プラグインを実装し、テストします。
sidebar:
  order: 5
---

[バンドル](/downloads/adder/library-examples/adder-library-examples.tar.gz)には、タイマー入力、コールバック出力、およびライフサイクル、再起動、終了を伴う障害、元のイベントを変更しない変換のテストが含まれます。
登録、設定、リソース所有権の要件については、[プラグイン作成の契約](https://github.com/blinklabs-io/adder/blob/main/docs/plugin-authoring.md)を参照してください。

展開したバンドルのルートで実行します。

```sh
go test -race ./plugins
```

`TickerInput` は `plugin.Base` を埋め込み、実行コンテキストがキャンセルされるまで `example.tick` イベントを発行します。
`HandlerOutput` はキャンセルに対応するコールバックを呼び出し、コールバックのエラーが発生すると終了します。
どちらも `plugin.ManagedPlugin` を実装し、`Stop` の際に追跡中のワーカーの終了を待ちます。
ハンドラーはキャンセル時に処理を終了して戻る必要があります。

<a id="input"></a>

## 入力

[input.go をダウンロード](/downloads/adder/library-examples/source/plugins/input.go).

```go
// Copyright 2026 Blink Labs Software
// SPDX-License-Identifier: Apache-2.0

// Package plugins contains minimal managed plugins for authors to adapt.
package plugins

import (
	"context"
	"errors"
	"time"

	"github.com/blinklabs-io/adder/event"
	"github.com/blinklabs-io/adder/plugin"
)

// TickerInput publishes example.tick events until its run is canceled.
type TickerInput struct {
	plugin.Base
	interval time.Duration
}

var _ plugin.ManagedPlugin = (*TickerInput)(nil)

// NewTickerInput validates its configuration without acquiring resources.
func NewTickerInput(interval time.Duration) (*TickerInput, error) {
	if interval <= 0 {
		return nil, errors.New("tick interval must be positive")
	}
	return &TickerInput{interval: interval}, nil
}

// Role declares this plugin's event ports.
func (*TickerInput) Role() plugin.PluginType { return plugin.PluginTypeInput }

// Start starts an independently owned run. Pipelines use StartContext.
func (p *TickerInput) Start() error { return p.StartContext(context.Background()) }

// StartContext starts production with cancellation controlled by ctx.
func (p *TickerInput) StartContext(ctx context.Context) error {
	return p.StartRun(
		ctx,
		plugin.BaseConfig{HasOutput: true},
		func(ctx context.Context) error {
			p.Go(func() {
				ticker := time.NewTicker(p.interval)
				defer ticker.Stop()
				for {
					select {
					case <-ctx.Done():
						return
					case now := <-ticker.C:
						if !p.Emit(
							event.New("example.tick", now, nil, now.UnixNano()),
						) {
							return
						}
					}
				}
			})
			return nil
		},
		plugin.ShutdownHooks{},
	)
}

// Stop cancels production and joins the worker before closing its channels.
func (p *TickerInput) Stop() error { return p.Shutdown(plugin.ShutdownHooks{}) }
```

<a id="output"></a>

## 出力

[output.go をダウンロード](/downloads/adder/library-examples/source/plugins/output.go).

```go
// Copyright 2026 Blink Labs Software
// SPDX-License-Identifier: Apache-2.0

package plugins

import (
	"context"
	"errors"

	"github.com/blinklabs-io/adder/event"
	"github.com/blinklabs-io/adder/plugin"
)

// HandlerOutput passes immutable events to a cancellation-aware handler.
// A handler error is terminal. The handler must return on context cancellation.
type HandlerOutput struct {
	plugin.Base
	handle func(context.Context, event.Event) error
}

var _ plugin.ManagedPlugin = (*HandlerOutput)(nil)

// NewHandlerOutput validates its dependency without acquiring resources.
func NewHandlerOutput(
	handle func(context.Context, event.Event) error,
) (*HandlerOutput, error) {
	if handle == nil {
		return nil, errors.New("event handler is required")
	}
	return &HandlerOutput{handle: handle}, nil
}

// Role declares this plugin's event ports.
func (*HandlerOutput) Role() plugin.PluginType { return plugin.PluginTypeOutput }

// Start starts an independently owned run. Pipelines use StartContext.
func (p *HandlerOutput) Start() error { return p.StartContext(context.Background()) }

// StartContext starts the handler worker with the run's context.
func (p *HandlerOutput) StartContext(ctx context.Context) error {
	return p.StartRun(
		ctx,
		plugin.BaseConfig{HasInput: true},
		func(ctx context.Context) error {
			in := p.Input()
			p.Go(func() {
				for {
					select {
					case <-ctx.Done():
						return
					case evt, ok := <-in:
						if !ok {
							return
						}
						if err := p.handle(ctx, evt); err != nil {
							p.Fail(err)
							return
						}
					}
				}
			})
			return nil
		},
		plugin.ShutdownHooks{},
	)
}

// Stop cancels the handler and joins it. Cancellation must be cooperative.
func (p *HandlerOutput) Stop() error { return p.Shutdown(plugin.ShutdownHooks{}) }
```

<a id="event-ownership"></a>

## イベントの所有権

発行済みイベントと、そこから参照できるデータは変更できません。変換したイベントを発行する前に、
変更するすべてのマップ、スライス、ポインターで参照する値をコピーしてください。
この実行可能な例では、受信したペイロードを変更せずに保持します。

```go
// Copyright 2026 Blink Labs Software
// SPDX-License-Identifier: Apache-2.0

package plugins_test

import (
	"fmt"
	"maps"
	"slices"

	"github.com/blinklabs-io/adder/event"
)

func Example_eventTransformation() {
	type reading struct {
		Labels map[string]string
		Values []int
	}
	incoming := event.Event{Payload: reading{
		Labels: map[string]string{"source": "original"},
		Values: []int{1, 2},
	}}
	transformed := incoming
	payload := incoming.Payload.(reading)
	payload.Labels = maps.Clone(payload.Labels)
	payload.Values = slices.Clone(payload.Values)
	payload.Labels["source"] = "transformed"
	payload.Values[0] = 9
	transformed.Payload = payload
	fmt.Println(
		incoming.Payload.(reading).Labels["source"],
		incoming.Payload.(reading).Values,
	)
	fmt.Println(
		transformed.Payload.(reading).Labels["source"],
		transformed.Payload.(reading).Values,
	)
	// Output:
	// original [1 2]
	// transformed [9 2]
}
```
