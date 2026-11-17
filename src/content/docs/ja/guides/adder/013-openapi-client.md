# Adder OpenAPI Goクライアント

## 概要

AdderのOpenAPI GoクライアントをGoプロジェクトに追加する際は、現在のモジュールパスを使用します。

## インポート

```go
import openapi "github.com/blinklabs-io/adder/openapi"
```

## 旧モジュールパスからの移行

以前のモジュールパス `github.com/blinklabs-io/cardano-node-api/openapi` を使用しているプロジェクトは、`github.com/blinklabs-io/adder/openapi` に更新します。`openapi/go.mod` のモジュール名も `github.com/blinklabs-io/adder/openapi` です。