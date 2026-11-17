---
title: Referencia de la salida Slack
description: Configura y verifica la salida de notificaciones Slack de Adder.
---

# Referencia de la salida Slack

## Descripción general

La salida `slack` publica eventos seleccionados de Adder en uno o varios webhooks entrantes de Slack. Esta referencia describe la configuración, el formato de las solicitudes, la validación de destinos y el comportamiento de entrega.

Slack trata cada URL de webhook como un secreto de autenticación asociado a un destino. Crea un webhook para cada canal mediante la [configuración de webhooks entrantes de Slack](https://docs.slack.dev/messaging/sending-messages-using-incoming-webhooks/) y conserva las URL en un almacén de secretos. No las incluyas en repositorios, capturas de pantalla, comandos compartidos ni registros.

## Configuración

Selecciona la salida `slack` y configura sus opciones bajo `plugins.output.slack`:

```yaml
output: slack
plugins:
  output:
    slack:
      webhook-urls: "https://hooks.slack.com/services/EXAMPLE/ONE,https://hooks.slack.com/services/EXAMPLE/TWO"
      event-types: "blocks,transactions,rollbacks,governance"
```

Adder separa `webhook-urls` y `event-types` por comas, elimina los espacios al principio y al final de cada entrada e ignora las entradas vacías.

### Campos

| Campo | Obligatorio | Valor predeterminado | Descripción |
| --- | --- | --- | --- |
| `webhook-urls` | Sí | Ninguno | Lista separada por comas de URL de webhooks entrantes de Slack. Debe incluir al menos una URL válida. Cada destino recibe una solicitud independiente. |
| `event-types` | No | `blocks,transactions,rollbacks,governance` | Lista separada por comas de tipos de eventos que Adder entrega a Slack. |

`webhook-urls` debe contener al menos una URL HTTPS. Adder rechaza una URL que incluya información de usuario, como un nombre de usuario o una contraseña incrustados. La validación ocurre al iniciar la salida, por lo que una configuración incorrecta impide el arranque.

El valor predeterminado de `event-types` incluye `blocks`, `transactions`, `rollbacks` y `governance`. Adder también acepta `drep-registration`, `drep-update` y `drep-retirement`.

## Selección y formato de eventos

Adder entrega únicamente los eventos cuyos tipos aparecen en `event-types`. Los demás eventos continúan por la canalización sin una entrega a Slack. La salida no ofrece un formato Slack configurable: Adder genera texto y lo coloca en el campo `text` de una solicitud JSON.

Adder genera los mensajes con estas formas:

- Los bloques usan `Cardano block #<block number> (slot <slot number>, <era>)`, seguido de `Hash: <block hash>` y `Transactions: <count>`.
- Las transacciones usan `Cardano transaction <transaction hash> (block <block number>, slot <slot number>)`, seguido de `Fee: <fee> lovelace`.
- Los rollbacks usan `Cardano rollback to slot <slot number>`, seguido de `Hash: <block hash>`.
- Los eventos de gobernanza usan `Cardano governance event in transaction <transaction hash> (slot <slot number>)`, seguido de `Proposals: <count>; votes: <count>; DRep certificates: <count>`.
- Los certificados DRep usan `Cardano DRep <certificate type>: <DRep ID> (transaction <transaction hash>, slot <slot number>)`.

Para cada destino, Adder envía una solicitud `POST` con la cabecera `Content-Type: application/json` y un objeto con esta forma:

```json
{"text":"Cardano rollback to slot 42\nHash: abc"}
```

El JSON contiene únicamente el campo `text`; la salida no envía el evento completo ni añade un formato alternativo seleccionable.

## Respuestas, límites y reintentos

Slack documenta una entrega correcta del webhook entrante como `HTTP 200` con el cuerpo `ok`. Adder acepta la entrega solo cuando recibe exactamente ese estado y ese cuerpo.

Adder usa un cliente HTTP con un plazo de 15 segundos. También limita a 1024 bytes la cantidad de cuerpo de respuesta que lee. La salida no añade un límite configurable para el tamaño del mensaje `text` ni para el tamaño de la solicitud; Slack puede aplicar sus propios límites.

La salida aplica estas reglas de entrega:

- Después de una entrega correcta, Adder espera al menos un segundo antes de enviar otra solicitud al mismo destino.
- Para los fallos de transporte y las respuestas `5xx`, Adder reintenta la misma solicitud hasta tres veces después del primer intento. La espera usa un retroceso acotado de 1, 2 y 4 segundos.
- La salida no reintenta otros errores HTTP del cliente. Un `HTTP 400`, por ejemplo, termina la entrega y genera un error.
- Adder envía cada destino de forma independiente. Un fallo en un webhook se registra y se comunica por el canal de errores sin impedir que los demás destinos reciban el evento.

La salida no dispone de una cola duradera. El worker usa un búfer de entrada acotado y no guarda eventos pendientes para entregarlos después.

## Límites de frecuencia y `Retry-After`

Cuando Slack devuelve `HTTP 429`, Adder interpreta la cabecera `Retry-After` como un número entero de segundos. Adder guarda el momento permitido siguiente para cada destino y aplica ese periodo a los eventos posteriores del mismo destino.

- Un valor entero no negativo dentro de un minuto establece el periodo de enfriamiento y permite reintentar la solicitud mientras quede presupuesto de reintentos.
- Un valor ausente, no entero, negativo o demasiado grande no proporciona un plazo utilizable. Adder marca la entrega afectada como fallida y establece un enfriamiento de un minuto.
- Un valor superior a un minuto establece el enfriamiento indicado, pero Adder marca la entrega como fallida porque el retraso supera la ventana de reintento.
- Si queda más de un minuto de enfriamiento, Adder omite la solicitud posterior para ese destino y comunica que el destino continúa enfriándose. Cuando queda un minuto o menos, Adder espera el resto del periodo antes de enviar.
- Adder conserva el enfriamiento en memoria aunque la entrega agote su presupuesto de reintentos. El enfriamiento es independiente para cada URL.

La cabecera `Retry-After` puede impedir la entrega de un destino mientras otros destinos siguen funcionando. Slack describe este comportamiento en su [referencia de límites de frecuencia](https://docs.slack.dev/apis/web-api/rate-limits/).

## Errores, apagado y reinicio

Adder registra los fallos de formato y entrega, y los envía al canal de errores del plugin. Los mensajes de error identifican el destino por su posición o describen el estado HTTP, pero no incluyen las URL de webhook ni sus secretos.

Al apagar la salida, Adder cancela el worker y las esperas o solicitudes asociadas con el contexto de ejecución. El proceso no conserva los mensajes que permanecen en el búfer o en una solicitud cancelada. Un reinicio no recupera ni vuelve a enviar esos mensajes, y tampoco conserva los periodos de enfriamiento en un almacenamiento duradero.

## Comprobación segura mediante un webhook de prueba

1. Crea un canal de prueba y un webhook entrante separado. No reutilices un webhook de producción ni pegues su URL en la configuración de prueba.
2. Guarda la URL del webhook en el almacén de secretos usado por el entorno de prueba y limita su exposición al proceso de Adder.
3. Configura `output: slack`, el webhook de prueba en `webhook-urls` y un único tipo en `event-types`, como `blocks`.
4. Inicia Adder y genera un evento de prueba que coincida con el tipo seleccionado.
5. Confirma que el mensaje aparece en el canal de prueba y que la solicitud usa `Content-Type: application/json` con el campo `text`.
6. Revisa los registros y el canal de errores para confirmar que no muestran la URL ni el secreto del webhook.
7. Elimina o revoca el webhook de prueba cuando termine la comprobación.

Consulta la [referencia de comandos de Adder](./006-command_list.md) para las opciones `--output-slack-webhook-urls` y `--output-slack-event-types`, y la [referencia de integraciones de salida](./008-output-integrations.md) para el contexto de las salidas de Adder.

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>