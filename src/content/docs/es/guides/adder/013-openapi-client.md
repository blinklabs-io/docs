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

## Referencia de la API

La API organiza las rutas de supervisión y eventos en la raíz, y las funciones de notificaciones y código QR bajo `/v1`.

### Rutas raíz

| Método | Ruta | Comportamiento |
| --- | --- | --- |
| `GET` | `/ping` | Devuelve `pong` para confirmar que el servidor responde. También acepta `/ping/`. |
| `GET` | `/healthcheck` | Devuelve el estado de salud en JSON. Responde con `200` cuando todos los componentes funcionan y con `503` cuando alguno falla. También acepta `/healthcheck/`. |
| `GET` | `/events` | Entrega eventos mediante SSE. Cuando la solicitud incluye una actualización WebSocket, mantiene una conexión WebSocket. El servidor no aplica un límite de escritura para conservar las conexiones de streaming de larga duración. |

El servidor genera registros de acceso estructurados y recupera los errores inesperados de los controladores sin interrumpir el proceso.

### Rutas `/v1`

| Método | Ruta | Comportamiento |
| --- | --- | --- |
| `POST` | `/v1/fcm` | Recibe un objeto JSON con un campo `fcmToken` no vacío y devuelve `201` cuando guarda el token. También acepta `/v1/fcm/`. El servidor devuelve una respuesta JSON con estado `400` cuando recibe JSON mal formado o cuando falta `fcmToken`. |
| `GET` | `/v1/fcm/{token}` | Devuelve el token en JSON con estado `200`, o `404` si no existe. También acepta una barra final. |
| `DELETE` | `/v1/fcm/{token}` | Elimina el token y devuelve `204`, o devuelve `404` si no existe. También acepta una barra final. |
| `GET` | `/v1/qrcode` | Devuelve la página HTML que genera el código QR de conexión. También acepta `/v1/qrcode/`. |

### Swagger

La interfaz Swagger está disponible en `GET /swagger/`. La URL práctica incluye la barra final, por ejemplo `https://servidor.example/swagger/`.

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
