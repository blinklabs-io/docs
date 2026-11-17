---
title: Adder OpenAPI Go Client
description: Use the generated Adder OpenAPI client with the canonical Go module and import path.
---

This page describes the generated Go client for the Adder OpenAPI service. The client uses the `github.com/blinklabs-io/adder/openapi` module path.

## Installation

Install the dependencies listed by the generated client:

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

Replace `github.com/blinklabs-io/cardano-node-api/openapi` with `github.com/blinklabs-io/adder/openapi` in Go imports and `go.mod` module references:

```diff
-import openapi "github.com/blinklabs-io/cardano-node-api/openapi"
+import openapi "github.com/blinklabs-io/adder/openapi"
```

After updating the references, rebuild the project so Go resolves the generated client from the Adder module.