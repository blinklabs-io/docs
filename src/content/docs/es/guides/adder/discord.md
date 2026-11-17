---
title: Salida del bot de Discord
description: Referencia de configuración y comportamiento de la salida del bot de Discord de Adder.
---

# Salida del bot de Discord

La salida `discord` publica eventos seleccionados en un único servidor y canal de Discord configurados. También registra dos comandos de barra de solo lectura en el servidor configurado.

La integración usa Discord Gateway v10 y las API REST correspondientes. El bot mantiene la conexión mediante heartbeats, reanuda la sesión cuando es posible y se reconecta con un retroceso limitado.

## Configuración

Configure `output: discord` y anide las opciones bajo `plugins.output.discord`:

```yaml
output: discord
plugins:
  output:
    discord:
      bot-token: "REPLACE_WITH_DISCORD_BOT_TOKEN"
      application-id: "123456789012345678"
      guild-id: "234567890123456789"
      channel-id: "345678901234567890"
      event-types: "blocks,rollbacks,governance"
```

La siguiente tabla describe las opciones disponibles:

| Opción | Valor predeterminado | Requisito y descripción |
| --- | --- | --- |
| `bot-token` | `""` | Obligatorio. Token del bot de Discord. También puede configurarse mediante la variable de entorno `OUTPUT_DISCORD_BOT_TOKEN`; esta opción resulta preferible cuando el token procede de un almacén de secretos. |
| `application-id` | `""` | Obligatorio. ID de la aplicación de Discord que registra los comandos. |
| `guild-id` | `""` | Obligatorio. ID del servidor de Discord permitido para los mensajes y los comandos. |
| `channel-id` | `""` | Obligatorio. ID del canal permitido para los mensajes y los comandos. |
| `event-types` | `blocks,rollbacks,governance` | Lista separada por comas de categorías de eventos que la salida publica. Admite `blocks`, `transactions`, `rollbacks` y `governance`. |

Los tres ID y el token del bot son obligatorios. Mantenga el token fuera del control de versiones y de los registros. Los errores de entrega aparecen en el canal de errores de la salida y en los registros sin exponer el token.

### Recursos y permisos de Discord

Antes de iniciar Adder:

1. Cree una aplicación de Discord y su bot.
2. Invite el bot al servidor de destino con los scopes `bot` y `applications.commands`.
3. Conceda al bot los permisos `View Channel`, `Send Messages` y `Embed Links` en el canal configurado.
4. Verifique que `application-id`, `guild-id` y `channel-id` identifican los recursos seleccionados.

La integración usa interacciones de comandos de barra a través de Gateway y solicita cero Gateway intents. Por tanto, no requiere los intents privilegiados `Message Content` ni de miembros. Adder registra `/adder-status` y `/adder-recent` en el servidor configurado al iniciar la salida.

## Categorías de eventos

La salida admite estas categorías seleccionables:

- `blocks`: eventos de bloques.
- `transactions`: eventos de transacciones.
- `rollbacks`: eventos de rollback.
- `governance`: eventos relacionados con gobernanza.

Por defecto, Adder publica `blocks`, `rollbacks` y `governance`. `transactions` puede generar un volumen alto; selecciónela solo cuando el canal de destino pueda gestionar ese tráfico.

## Entrega de mensajes

La salida reutiliza el formato de mensajes de Discord existente para los eventos de Adder y suprime las menciones en los mensajes publicados y en las respuestas de los comandos. Adder comunica cada fallo de entrega; no conserva el evento no entregado para una entrega posterior ni mantiene una cola duradera.

Las solicitudes REST respetan las cabeceras de límite de frecuencia de Discord. Las respuestas `429` se reintentan hasta tres veces. Las solicitudes `GET` también reintentan fallos temporales del servidor y de transporte. Adder no repite solicitudes `POST` después de un fallo ambiguo, porque esa repetición podría duplicar mensajes.

Cuando `Retry-After` indica más de diez segundos, la entrega actual falla de inmediato. Adder también rechaza las entregas posteriores para esa ruta mientras queden más de diez segundos de espera y después espera el tiempo restante del cooldown. Los errores de entrega permanecen visibles en el canal de errores de la salida y en los registros.

## Gateway y reconexión

El bot envía heartbeats al Gateway y reanuda la sesión cuando Discord lo permite. Si la sesión no puede reanudarse, Adder establece una nueva conexión. La reconexión usa un retroceso limitado para evitar intentos ilimitados o una carga excesiva sobre el Gateway.

## Comandos de barra

`/adder-status` y `/adder-recent` son comandos de solo lectura del servidor:

- `/adder-status` confirma que la salida de Adder está activa.
- `/adder-recent` muestra hasta cinco eventos entregados desde el inicio del proceso.

Ambos comandos responden de forma efímera. Una interacción procedente de otro servidor se ignora. Una interacción procedente del servidor configurado pero de otro canal recibe una respuesta efímera que indica la restricción del canal. La salida limita el historial reciente a cinco elementos y lo conserva solo en memoria; el historial se borra al reiniciar Adder.

## Apagado

Detener un Gateway que ya está cerrado es una operación idempotente y correcta. Por tanto, `Stop` no comunica un error espurio cuando otra operación ya cerró la conexión. Adder sigue comunicando cualquier otro error al cerrar la conexión.

## Referencias relacionadas

- Consulte la [referencia de comandos](./006-command_list.md) para las opciones de línea de comandos, incluida la configuración de `discord`.
- Consulte la [referencia de integraciones de salida](./008-output-integrations.md) para la configuración general de las salidas de Adder.

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>