---
title: Referencia de API y eventos de Adder
description: Referencia del endpoint `/events` y del contrato de apagado de la API Go de Adder.
---

# Referencia de API y eventos

Esta guía documenta el parámetro opcional `replay` del endpoint `/events` y el contrato de apagado de la API Go de Adder.

## Endpoint `/events`

El endpoint `/events` acepta el parámetro de consulta opcional `replay`:

```text
GET /events?replay=false
```

- Sin `replay`, Adder usa `replay=true` y activa la reproducción de eventos almacenados en el búfer.
- `replay=false` solicita una entrega solo de eventos en directo y excluye la reproducción de eventos almacenados en el búfer.
- `replay=true` activa la reproducción de eventos almacenados en el búfer.

Adder Tray usa `replay=false` en la conexión inicial para recibir solo eventos en directo. Después de una reconexión, usa `replay=true` para activar la reproducción del búfer. Esta política de conexión pertenece a Adder Tray y no constituye un requisito para todos los clientes de la API.

## Contrato de apagado de la API Go

La interfaz `api.API` requiere el método:

```go
Shutdown(context.Context) error
```

`APIv1` implementa el apagado del listener. Las implementaciones de `api.API` deben incluir este método y el código que llama a la interfaz debe gestionar su resultado.

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
