---
title: Salida de Matrix de Adder
description: Referencia de configuración y entrega para la salida de notificaciones de Matrix de Adder.
---

# Salida de Matrix de Adder

La salida `matrix` envía los eventos seleccionados de Adder como mensajes de texto sin formato `m.room.message` a una o más salas de Matrix. La salida usa el [endpoint de envío de salas de Matrix Client-Server API v1.19](https://spec.matrix.org/v1.19/client-server-api/#put_matrixclientv3roomsroomidsendeventtypetxnid) y autentica cada solicitud con un token de acceso.

## Configuración

Configure la salida en YAML:

```yaml
output: matrix
plugins:
  output:
    matrix:
      homeserver-url: https://matrix.example.org
      access-token: your-bot-access-token
      room-ids: '!alerts:example.org,!ops:example.org'
      event-types: blocks,rollbacks,governance
```

| Opción | Descripción |
| --- | --- |
| `homeserver-url` | URL base del homeserver de Matrix. Una URL remota debe usar `https://`. Adder solo permite `http://` para pruebas con `localhost`, `127.0.0.1` o `::1`. |
| `access-token` | Token de acceso de la cuenta de Matrix. Es obligatorio. La configuración debe gestionarlo como un secreto. La cuenta debe haberse unido a cada sala de destino y tener permiso para enviar mensajes. |
| `room-ids` | Lista de IDs de salas separados por comas. Debe incluir al menos un ID válido que empiece por `!` y no puede contener espacios en blanco. También acepta IDs de salas de la versión 12 sin sufijo de servidor, como los descritos en la [especificación de salas de la versión 12](https://spec.matrix.org/v1.19/rooms/v12/). |
| `event-types` | Tipos de eventos separados por comas. El valor predeterminado es `blocks,rollbacks,governance`. Los tipos admitidos también incluyen `transactions`, `drep-registration`, `drep-update` y `drep-retirement`. |

Adder envía cada evento seleccionado a todas las salas configuradas en `room-ids`. La salida ignora los eventos que no coinciden con `event-types`.

## Autenticación y entrega mediante la API

Para cada sala y evento, Adder ejecuta una solicitud como la siguiente:

```text
PUT /_matrix/client/v3/rooms/{room}/send/m.room.message/{txnId}
Authorization: Bearer <access-token>
Content-Type: application/json
```

El cuerpo JSON usa `m.text` y contiene el texto del evento:

```json
{"msgtype":"m.text","body":"..."}
```

El campo `body` contiene `Adder <type>`, un salto de línea y el JSON completo del evento de Adder. La salida genera un ID de transacción con el formato `adder-<randomPrefix>-<counter>`. Adder conserva el mismo `txnId` para todos los reintentos del mismo evento en la misma sala, lo que permite al homeserver deduplicar esos reintentos. Cada sala recibe su propia solicitud.

El homeserver confirma la aceptación cuando responde con HTTP `200` y un `event_id`. Esta respuesta confirma que el homeserver aceptó el evento; no confirma que una persona haya leído el mensaje.

## Reintentos y límites de frecuencia

La entrega usa como máximo tres reintentos después del intento inicial:

- Adder reintenta los errores de red, HTTP `408` y las respuestas HTTP `5xx`.
- Adder reintenta las respuestas HTTP `429` y usa el encabezado `Retry-After` cuando Matrix lo proporciona. El valor puede expresar segundos, incluidos valores decimales, o una fecha HTTP.
- Si `Retry-After` no aparece, Adder busca la sugerencia heredada `retry_after_ms` en el cuerpo JSON. Si tampoco existe una sugerencia válida, Adder usa una espera exponencial acotada.
- Las esperas exponenciales comienzan con un segundo y aumentan hasta el siguiente intento. Una sugerencia de `Retry-After` o `retry_after_ms` que supere un minuto excede la ventana permitida y produce un error en lugar de una espera más larga.
- Las respuestas HTTP `4xx` permanentes, excepto `408` y `429`, terminan la entrega sin reintento. Esto incluye errores de autorización o de permisos, como HTTP `401` y `403`.

La salida comunica cada fallo de entrega mediante el canal de errores del plugin y lo registra con el componente `output.matrix`. No existe una cola persistente. Al apagar o reiniciar Adder, la salida cancela la entrega en curso y descarta los mensajes pendientes.

## Verificación

Use una sala exclusiva de prueba antes de configurar una sala operativa:

1. Cree una sala de prueba y haga que la cuenta asociada a `access-token` se una a ella.
2. Conceda a esa cuenta permiso para enviar mensajes y configure su ID en `room-ids`.
3. Configure `output: matrix` con esa sala y `event-types: blocks`.
4. Inicie Adder y produzca un evento seleccionado. Compruebe que aparece un `m.room.message` de texto en la sala de prueba y que el registro no muestra errores de `output.matrix`.
5. Pruebe una cuenta sin permiso de envío o una sala a la que la cuenta no se haya unido. Adder debe informar el error HTTP sin reintentar las respuestas permanentes `4xx`.
6. Revise la configuración antes de cambiar `room-ids` a salas operativas y elimine las credenciales de prueba que ya no necesite.

## Referencias relacionadas

- [Referencia de comandos](./006-command_list.md)
- [Integraciones de salida](./008-output-integrations.md)

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>