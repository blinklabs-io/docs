---
title: Controles de salida de Telegram
description: Configuración y controles de la salida de Telegram de Adder.
---

# Controles de salida de Telegram

La salida de Telegram envía eventos seleccionados de Adder a un chat configurado y responde a comandos en ese chat. Configure un token de bot, un ID de chat y un archivo local para conservar las preferencias de notificación después de reiniciar Adder:

```yaml
output: telegram
plugins:
  output:
    telegram:
      bot-token: "<Telegram bot token>"
      chat-id: "<Telegram chat ID>"
      settings-file: "/var/lib/adder/telegram-settings.yaml"
      operator-user-ids: "123456789,987654321" # group chats only
```

## Configuración y preferencias persistentes

Use un archivo `settings-file` diferente para cada instancia de Adder y para cada chat configurado. El proceso debe poder escribir en el directorio principal del archivo. Adder crea ese directorio con permisos privados y guarda el archivo YAML de forma atómica.

El archivo de preferencias contiene el `chat_id` y cuatro claves de notificación:

- `blocks`
- `transactions`
- `rollbacks`
- `governance`

Las cuatro preferencias están habilitadas de forma predeterminada. Un archivo creado manualmente requiere `chat_id`, y su valor debe coincidir con el `chat-id` configurado. Adder rechaza un archivo con formato incorrecto, campos desconocidos, varios documentos YAML o un `chat_id` que falte, tenga el valor `0` o pertenezca a otro chat. El archivo debe contener un solo documento YAML.

Sin `settings-file`, Adder mantiene habilitadas las cuatro categorías y permite consultar `/settings`, pero no permite cambiar las preferencias dentro del chat. Adder aplica cada cambio de preferencia a la configuración activa solo después de guardar correctamente el archivo.

Cuando una categoría está deshabilitada, Adder suprime los mensajes de Telegram de esa categoría, pero continúa procesando los eventos.

## Comandos

| Comando | Comportamiento |
| --- | --- |
| `/start` | Presenta el bot y dirige a `/help`. |
| `/help` | Muestra la lista de comandos: `/status`, `/settings` y `/notify blocks\|transactions\|rollbacks\|governance on\|off`. |
| `/status` | Informa el estado del pipeline de Adder: `running`, `stopped` o `unavailable`. |
| `/settings` | Muestra el estado `on` u `off` de `blocks`, `transactions`, `rollbacks` y `governance`. Si falta `settings-file`, Adder indica que `output.telegram.settings-file` es necesario para habilitar los cambios. |
| `/notify blocks on\|off` | Habilita o deshabilita los mensajes de bloques. |
| `/notify transactions on\|off` | Habilita o deshabilita los mensajes de transacciones. |
| `/notify rollbacks on\|off` | Habilita o deshabilita los mensajes de rollbacks. |
| `/notify governance on\|off` | Habilita o deshabilita los mensajes de gobernanza. |

La sintaxis general para cambiar una preferencia es `/notify blocks|transactions|rollbacks|governance on|off`. Adder devuelve esa sintaxis cuando el comando no incluye exactamente una categoría válida y `on` o `off`. Adder confirma la nueva preferencia después de guardarla correctamente; si la escritura falla, devuelve un error y conserva la configuración anterior.

## Autorización y alcance del chat

Adder procesa comandos únicamente cuando el mensaje procede del `chat-id` configurado. Las respuestas de los comandos y los mensajes de eventos solo llegan a ese chat.

- En un chat privado, solo el propietario del chat configurado puede cambiar las preferencias.
- En un grupo o supergrupo, solo los usuarios incluidos en `operator-user-ids` pueden cambiar las preferencias. Cada ID debe ser un ID de usuario de Telegram entero positivo y los valores deben separarse mediante comas.
- Los demás miembros de un grupo o supergrupo pueden consultar `/status` y `/settings`, pero no pueden cambiar las preferencias.
- Si `operator-user-ids` está vacío o no está configurado, ningún usuario puede cambiar las preferencias desde un grupo o supergrupo.
- Los bots no pueden cambiar las preferencias.

El bot acepta un comando dirigido a su propio nombre de usuario, como `/status@YourBotName`, cuando la privacidad del grupo requiere esa forma. Ignora los comandos dirigidos a otro bot.

Los canales pueden recibir mensajes de eventos, pero no pueden usar estos comandos de mensajes.