---
title: Referencia de la API de Adder
description: Referencia de rutas, solicitudes y respuestas para la API de Adder.
---

# Referencia de la API de Adder

## Descripción general

Esta referencia describe la API HTTP de Adder, incluidas las rutas raíz de estado y eventos, las rutas de notificaciones push y configuración QR bajo `/v1`, y la interfaz de Swagger. De forma predeterminada, la API escucha en `0.0.0.0:8080`.

Adder separa las rutas en dos niveles de ruta:

- Las rutas raíz proporcionan comprobaciones de estado y transmisión de eventos: `/ping`, `/healthcheck` y `/events`.
- La ruta `/v1` proporciona las rutas de notificaciones push y configuración QR: `/v1/fcm`, `/v1/fcm/{token}` y `/v1/qrcode`.

**Importante:** La creación de tokens usa `/v1/fcm`. `/fcm` sin el prefijo `/v1` no es la ruta documentada.

## Referencia de rutas

| Método | Ruta | Propósito | Respuesta y estado |
| --- | --- | --- | --- |
| `GET` | `/ping` | Comprueba que el servidor de la API está disponible. | Devuelve el texto sin formato `pong` con `200 OK`. |
| `GET` | `/healthcheck` | Informa del estado del flujo de procesamiento en ejecución y de sus comprobadores de estado. | Devuelve JSON con `200 OK` cuando todos los comprobadores funcionan correctamente. Devuelve JSON con `503 Service Unavailable` cuando un comprobador no está saludable. |
| `GET` | `/events` | Transmite eventos del pipeline en tiempo real. | El servidor actualiza la conexión a WebSocket cuando el cliente lo solicita o usa Server-Sent Events (SSE). Una conexión correcta usa `200 OK`. |
| `POST` | `/v1/fcm` | Guarda un token de FCM. | Acepta una solicitud JSON y devuelve `201 Created`. Un JSON no válido o la ausencia de `fcmToken` devuelve `400 Bad Request`. Un fallo del almacén de tokens devuelve `500 Internal Server Error`. |
| `GET` | `/v1/fcm/{token}` | Obtiene un token de FCM guardado por su valor. | Devuelve una respuesta JSON con el token y `200 OK`. Un token desconocido devuelve `404 Not Found`. La API devuelve `500 Internal Server Error` cuando el almacén de tokens no puede proporcionar el token. |
| `DELETE` | `/v1/fcm/{token}` | Elimina un token de FCM guardado por su valor. | Devuelve `204 No Content` después de eliminarlo. Un token desconocido devuelve `404 Not Found`. La API devuelve `500 Internal Server Error` cuando el almacén de tokens no puede procesar la solicitud. |
| `GET` | `/v1/qrcode` | Genera la página de configuración QR para la ruta FCM de la API local. | Devuelve una página HTML interactiva con `200 OK`. |
| `GET` | `/swagger/` | Abre la interfaz de Swagger. | Sirve la documentación interactiva de la API. La interfaz requiere la barra final que aparece en la ruta. |

## Detalles de integración

### Guardar un token de FCM

Una solicitud `POST` a `/v1/fcm` debe incluir `application/json` y una propiedad `fcmToken` obligatoria:

```json
{"fcmToken":"example-device-token"}
```

La API devuelve `201 Created` después de guardar el token y devuelve `400 Bad Request` cuando no puede decodificar el JSON o cuando `fcmToken` está vacío.

### Leer o eliminar un token de FCM

El cliente reemplaza `{token}` en `/v1/fcm/{token}` por el valor del token guardado:

- `GET` devuelve el token en una respuesta JSON con `200 OK`.
- `DELETE` elimina el token y devuelve `204 No Content`.
- Ambos métodos devuelven `404 Not Found` cuando el token no existe.

### Transmitir eventos

La integración usa `GET /events` para abrir una transmisión de eventos. El servidor usa WebSocket cuando el cliente solicita una actualización a WebSocket; si no, usa Server-Sent Events (SSE).

Cada evento llega como un objeto JSON con estos campos:

- `type`: tipo del evento, como `input.block` o `input.transaction`.
- `timestamp`: marca de tiempo del evento.
- `context`: contexto asociado al evento.
- `payload`: datos del evento.

Con SSE, el servidor envía cada objeto JSON en un mensaje `data`. Con WebSocket, el servidor envía cada objeto JSON como un mensaje de texto.

#### Parámetros de consulta

- `types`: parámetro opcional que acepta una lista de tipos separada por comas. Por ejemplo, `types=input.block,input.transaction` limita la transmisión a esos tipos. Si se omite, la transmisión incluye todos los tipos de eventos.
- `replay`: parámetro booleano opcional que usa `true` de forma predeterminada.
  - `replay=true` envía primero los eventos recientes del búfer que cumplen el filtro `types` y después los eventos nuevos.
  - `replay=false` omite el contenido anterior del búfer y comienza directamente con los eventos nuevos.

#### Ejemplos de URL

Sustituye `localhost:8080` por el host y el puerto de la API de Adder sin cambiar la ruta `/events`.

SSE con repetición predeterminada:

```text
http://localhost:8080/events
```

WebSocket con repetición predeterminada:

```text
ws://localhost:8080/events
```

SSE en modo solo en vivo:

```text
http://localhost:8080/events?replay=false
```

WebSocket en modo solo en vivo:

```text
ws://localhost:8080/events?replay=false
```

Al omitir `replay`, el cliente recibe primero los eventos recientes que coinciden con el filtro y después los eventos nuevos. Los ejemplos con `replay=false` comienzan directamente con los eventos nuevos.

#### Reconexión

Adder Tray aplica una estrategia específica para mantener su transmisión:

1. La primera conexión usa `/events?replay=false` para comenzar con eventos en vivo.
2. Después de establecer una conexión correctamente, una reconexión usa `/events?replay=true` para recuperar eventos emitidos mientras la bandeja estaba desconectada.

Este patrón pertenece a Adder Tray y no obliga a otros consumidores a usar los mismos valores. Un consumidor que solicite una repetición después de reconectarse debe tolerar eventos repetidos o eventos que ya haya procesado. El flujo no garantiza entrega exactamente una vez ni un orden específico para los eventos repetidos.

## Reglas de rutas y barras finales

- Las integraciones mantienen las rutas de estado y eventos en la raíz y no anteponen `/v1` a `/ping`, `/healthcheck` ni `/events`.
- La integración usa `/v1` para las rutas FCM y QR.
- Las rutas raíz aceptan `/ping/` y `/healthcheck/` además de las rutas documentadas.
- Las rutas FCM y QR aceptan una barra final opcional además de las rutas documentadas.
- La interfaz usa `/swagger/` con la barra final. La integración usa `/events` como está documentado; esta referencia no define una variante `/events/`.


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
