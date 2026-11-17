---
title: Adder OpenAPI Go Client
description: Use the generated Adder OpenAPI client with the canonical Go module and import path.
---

The generated Go client provides access to the Adder OpenAPI service. Use the `github.com/blinklabs-io/adder/openapi` module path.

## Installation

Before importing the client, install the dependencies specified in the generated client instructions:

```sh
go get github.com/stretchr/testify/assert
go get golang.org/x/net/context
```

Import the client with its canonical path:

```go
import openapi "github.com/blinklabs-io/adder/openapi"
```

Use this module declaration in Go module references:

```go
module github.com/blinklabs-io/adder/openapi
```

## Migrate from the retired module path

In Go imports and `go.mod` module references, replace `github.com/blinklabs-io/cardano-node-api/openapi` with `github.com/blinklabs-io/adder/openapi`:

```diff
-import openapi "github.com/blinklabs-io/cardano-node-api/openapi"
+import openapi "github.com/blinklabs-io/adder/openapi"
```

Rebuild the project after updating the references. Go resolves the client from the Adder module.