---
title: "API / イベントリファレンス"
description: "AdderのイベントAPIとGo APIのシャットダウン契約を説明します。"
---

# API / イベントリファレンス

このページでは、AdderのイベントAPIとGo APIのシャットダウン契約を説明します。

## `/events` の `replay` パラメーター

`/events` は、バッファー済みイベントの再送を制御する省略可能な `replay` クエリパラメーターを受け付けます。

```
/events?replay=true
```

- `replay` を省略した場合、`replay=true` として扱います。バッファー済みイベントを再送します。
- `replay=false` を指定すると、ライブイベントだけを配信し、バッファー済みイベントを再送しません。
- `replay=true` を指定すると、バッファー済みイベントを再送します。

組み込みトレイでは、初回接続に `replay=false` を使用し、再接続に `replay=true` を使用します。この接続方針は組み込みトレイの動作であり、すべてのAPIクライアントに対する要件ではありません。

## Go API のシャットダウン契約

`api.API` インターフェースには、次のメソッドが必要です。

```go
Shutdown(context.Context) error
```

`APIv1` はリスナーのシャットダウンを実装します。`api.API` を実装するコードと、このインターフェースを呼び出すコードは、`Shutdown(context.Context) error` を処理する必要があります。
