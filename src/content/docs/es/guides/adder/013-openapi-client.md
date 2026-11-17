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

El cliente OpenAPI generado ahora pertenece al módulo `github.com/blinklabs-io/adder/openapi`. Sustituye cualquier referencia al módulo anterior:

Antes:

```go
import openapi "github.com/blinklabs-io/cardano-node-api/openapi"
```

Después:

```go
import openapi "github.com/blinklabs-io/adder/openapi"
```

En `go.mod`, actualiza la declaración del módulo a la siguiente:

```go
module github.com/blinklabs-io/adder/openapi
```

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
