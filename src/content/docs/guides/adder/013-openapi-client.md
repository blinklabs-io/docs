---
title: Adder OpenAPI Go Client
description: Use the generated Adder OpenAPI client with the canonical Go module and import path.
---

The generated Go client provides access to the Adder OpenAPI service. Use the `github.com/blinklabs-io/adder/openapi` module path.

## Installation

Install the following dependencies from the generated client instructions:

```sh
go get github.com/stretchr/testify/assert
go get golang.org/x/net/context
```

Import the client with its canonical path:

```go
import openapi "github.com/blinklabs-io/adder/openapi"
```

The generated client module is:

```go
module github.com/blinklabs-io/adder/openapi
```

## Migrate from the retired module path

In Go imports and `go.mod` module references, replace `github.com/blinklabs-io/cardano-node-api/openapi` with `github.com/blinklabs-io/adder/openapi`:

```diff
-import openapi "github.com/blinklabs-io/cardano-node-api/openapi"
+import openapi "github.com/blinklabs-io/adder/openapi"
```

After updating the references, rebuild the project. Go then resolves the generated client from the Adder module.