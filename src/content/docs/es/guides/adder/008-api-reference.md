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

**Importante:** Use `/v1/fcm` para crear un token. `/fcm` sin el prefijo `/v1` no es la ruta documentada.

## Referencia de rutas

| Método | Ruta | Propósito | Respuesta y estado |
| --- | --- | --- | --- |
| `GET` | `/ping` | Comprueba que el servidor de la API está disponible. | Devuelve el texto sin formato `pong` con `200 OK`. |
| `GET` | `/healthcheck` | Informa del estado del pipeline en ejecución y de sus comprobadores de estado. | Devuelve JSON con `200 OK` cuando todos los comprobadores funcionan correctamente. Devuelve JSON con `503 Service Unavailable` cuando un comprobador no está saludable. |
| `GET` | `/events` | Transmite eventos del pipeline en tiempo real. | El servidor actualiza la conexión a WebSocket cuando el cliente lo solicita o usa Server-Sent Events (SSE). Una conexión correcta usa `200 OK`. |
| `POST` | `/v1/fcm` | Guarda un token de FCM. | Acepta una solicitud JSON y devuelve `201 Created`. Un JSON no válido o la ausencia de `fcmToken` devuelve `400 Bad Request`. Un fallo del almacén de tokens devuelve `500 Internal Server Error`. |
| `GET` | `/v1/fcm/{token}` | Obtiene un token de FCM guardado por su valor. | Devuelve una respuesta JSON con el token y `200 OK`. Un token desconocido devuelve `404 Not Found`. La API devuelve `500 Internal Server Error` cuando el almacén de tokens no puede proporcionar el token. |
| `DELETE` | `/v1/fcm/{token}` | Elimina un token de FCM guardado por su valor. | Devuelve `204 No Content` después de eliminarlo. Un token desconocido devuelve `404 Not Found`. La API devuelve `500 Internal Server Error` cuando el almacén de tokens no puede procesar la solicitud. |
| `GET` | `/v1/qrcode` | Genera la página de configuración QR para el endpoint FCM de la API local. | Devuelve una página HTML interactiva con `200 OK`. |
| `GET` | `/swagger/` | Abre la interfaz de Swagger. | Sirve la documentación interactiva de la API. Use la barra final que aparece en la ruta. |

## Detalles de integración

### Guardar un token de FCM

Envíe una solicitud `POST` a `/v1/fcm` con `application/json` y una propiedad `fcmToken` obligatoria:

```json
{"fcmToken":"example-device-token"}
```

La API devuelve `201 Created` después de guardar el token y devuelve `400 Bad Request` cuando no puede decodificar el JSON o cuando `fcmToken` está vacío.

### Leer o eliminar un token de FCM

Reemplace `{token}` en `/v1/fcm/{token}` por el valor del token guardado:

- `GET` devuelve el token en una respuesta JSON con `200 OK`.
- `DELETE` elimina el token y devuelve `204 No Content`.
- Ambos métodos devuelven `404 Not Found` cuando el token no existe.

### Transmitir eventos

Use `GET /events` para abrir una transmisión de eventos. El servidor actualiza la conexión a WebSocket cuando el cliente solicita ese protocolo; de lo contrario, usa SSE. La ruta acepta estos parámetros de consulta opcionales:

- `types`: Lista separada por comas de los tipos de eventos que se incluirán, como `input.block` o `input.transaction`.
- `replay`: Valor booleano que indica si el servidor reproduce los eventos retenidos recientemente cuando el cliente abre la conexión. La API establece este valor en `true` de forma predeterminada.

La ruta devuelve datos de eventos como `text/event-stream` o `application/json`, según el modo de conexión.

## Reglas de rutas y barras finales

- Mantenga las rutas de estado y eventos en la raíz. No anteponga `/v1` a `/ping`, `/healthcheck` ni `/events`.
- Use `/v1` para las rutas FCM y QR.
- Las rutas raíz aceptan `/ping/` y `/healthcheck/` además de las rutas documentadas.
- Las rutas FCM y QR aceptan una barra final opcional además de las rutas documentadas.
- Use `/swagger/` con la barra final. Use `/events` como está documentado; esta referencia no define una variante `/events/`.
