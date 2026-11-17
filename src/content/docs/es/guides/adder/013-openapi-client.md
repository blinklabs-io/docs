---
title: Cliente OpenAPI de Adder para Go
description: Actualiza la ruta del módulo y la importación del cliente OpenAPI de Adder.
---

# Cliente OpenAPI de Adder para Go

## Instalación

Instala las siguientes dependencias:

```sh
go get github.com/stretchr/testify/assert
go get golang.org/x/net/context
```

## Migración de la ruta del módulo

El cliente OpenAPI generado ahora usa el módulo `github.com/blinklabs-io/adder/openapi`. Actualiza las referencias existentes al módulo anterior:

Antes:

```go
import openapi "github.com/blinklabs-io/cardano-node-api/openapi"
```

Después:

```go
import openapi "github.com/blinklabs-io/adder/openapi"
```

En `go.mod`, sustituye el nombre del módulo anterior por el siguiente:

```go
module github.com/blinklabs-io/adder/openapi
```