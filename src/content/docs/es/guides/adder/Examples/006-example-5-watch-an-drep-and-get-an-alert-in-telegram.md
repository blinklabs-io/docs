---
title: Observar un DRep y recibir una alerta en Telegram
description: Ejemplo 5 de Adder - Observar un DRep y recibir una alerta en Telegram.
---

En este ejemplo utilizaremos Adder para recibir una notificación en Telegram cuando actúe el DRep que queramos seguir.

### Acciones del DRep que activan una alerta

- ✅ Actualizaciones del registro: el DRep cambia su registro o se da de baja.
- ✅ Delegaciones: el DRep recibe un nuevo delegador.
- ✅ Votos de gobernanza: el DRep vota una acción de gobernanza.

✅ Se presupone que ya has descargado el binario de Adder. Si no es así, consulta el [inicio rápido](../../005-use-adder-on-linux).

Antes de seleccionar filtros y comandos, necesitamos un identificador de DRep, un token de bot de Telegram y un identificador de chat para recibir las alertas.

<a name="step-1"></a>

## Paso 1 - Obtener el identificador del DRep

Para filtrar por DRep necesitamos su identificador. Podemos buscarlo con herramientas como adastat.net.

En este ejemplo buscamos `Earn Coin Pool` en [adastat.net](https://adastat.net/dreps).

<img src="/adder-drep-id.png"
     alt="adder-drep-id"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

📝 Anota el identificador de DRep; lo necesitaremos después. En este ejemplo es:

```
drep1yg8vjs7ute7z7vyd8yez5tgjey6043djjfh8d3n7sjev35g064xxc
```

<a name="step-2"></a>

## Paso 2 - Crear el bot de Telegram, solo una vez

Necesitamos obtener un token de bot desde BotFather y después un identificador de chat.

**2-1.** Busca `BotFather` en Telegram y ábrelo.

<img src="/adder-search-botfather.png"
     alt="adder-search-botfather"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

**2-2.** Crea un bot nuevo.

<img src="/adder-botfather-create-new-bot.png"
     alt="adder-botfather-create-new-bot"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

**2-3.** Ponle un nombre y un nombre de usuario único.

<img src="/adder-botfather-new-bot-details.png"
     alt="adder-botfather-new-bot-details"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

**2-4.** Pulsa `Create Bot`.

<img src="/adder-botfather-click-create-bot.png"
     alt="adder-botfather-click-create-bot"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

<a name="step-2-5"></a>

**2-5.** Copia el token del bot y anótalo; lo necesitaremos después.

<img src="/adder-botfather-copy-bot-token.png"
     alt="adder-botfather-copy-bot-token"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

**2-6.** Pulsa `Username`.

<img src="/adder-botfather-click-username.png"
     alt="adder-botfather-click-username"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

**2-7.** Pulsa `Message` para iniciar el chat con el bot.

<img src="/adder-botfather-click-message-bot.png"
     alt="adder-botfather-click-message-bot"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

**2-8.** Pulsa `Start`.

<img src="/adder-bot-chat-click-start.png"
     alt="adder-bot-chat-click-start"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

<a name="step-2-9"></a>

**2-9.** Abre `https://api.telegram.org/bot{your_bot_token}/getUpdates` en el navegador, utilizando el token del [paso 2-5](#step-2-5).

⚠️ El token debe llevar delante la palabra `bot`.

Por ejemplo: https://api.telegram.org/bot87xxxxxx07:AAG8xxxxxx1hi-C8xxxxxxTB2/getUpdates

Recibirás una respuesta JSON con información del chat del bot. Este es un ejemplo de su formato:

```
{
  "ok": true,
  "result": [
    {
      "update_id": 386670171,
      "message": {
        "message_id": 5,
        "from": {
          "id": 1902914866,
          "is_bot": false,
          "first_name": "ECP",
          "username": "EarnCoinPool",
          "language_code": "en"
        },
        "chat": {
          "id": 1902914866,
          "first_name": "ECP",
          "username": "EarnCoinPool",
          "type": "private"
        },
        "date": 1773686781,
        "text": "/start",
        "entities": [
          {
            "offset": 0,
            "length": 6,
            "type": "bot_command"
          }
        ]
      }
    }
  ]
}
```

📝 Anota CHAT_ID; lo necesitaremos después. En este ejemplo, CHAT_ID es `1902914866`.

## Paso 3 - Seleccionar los comandos de Adder

Con el identificador de DRep, el token de Telegram y el identificador de chat, podemos seleccionar los filtros y comandos:

- Tipo de evento.
- Filtro de DRep.
- Salida Telegram.
- Token del bot de Telegram.
- Identificador de chat de Telegram.

### Tipo de evento

Para recibir alertas únicamente de eventos de gobernanza, utilizamos:

```
--filter-type input.governance
```

### Filtro de DRep

Usa el identificador del [paso 1](#step-1) para seguir el DRep:

```
--filter-drep drep1yg8vjs7ute7z7vyd8yez5tgjey6043djjfh8d3n7sjev35g064xxc
```

### Salida Telegram

Indica que quieres utilizar Telegram:

```
--output telegram
```

### Token del bot de Telegram

Indica el token del bot del [paso 2-5](#step-2-5).

⚠️ Sustituye $TELEGRAM_TOKEN por ese token.

```
--output-telegram-bot-token $TELEGRAM_TOKEN
```

### Identificador de chat de Telegram

Indica el chat del bot donde quieras recibir las notificaciones, obtenido en el [paso 2-9](#step-2-9).

⚠️ Sustituye $CHAT_ID por el identificador del chat.

```
--output-telegram-chat-id $CHAT_ID
```

## Paso 4 - Combinarlo todo

Ejecuta este comando para recibir una notificación de Telegram cuando actúe el DRep.

⚠️ Ajusta el identificador de DRep, $TELEGRAM_TOKEN y $CHAT_ID.

```
./adder --filter-type input.governance --filter-drep drep1yg8vjs7ute7z7vyd8yez5tgjey6043djjfh8d3n7sjev35g064xxc --output telegram --output-telegram-bot-token $TELEGRAM_TOKEN --output-telegram-chat-id $CHAT_ID
```

### ¡Enhorabuena!

Recibirás una alerta de Telegram cuando ocurra una acción del DRep.

💡 Consulta todos los comandos disponibles con `-h` o `--help`.

Descubre otras posibilidades de Adder en estos ejemplos:

1. [Ejemplo 1](../002-example-1-watch-my-wallet-and-get-a-desktop-notification) - Observar la billetera y recibir una notificación de escritorio.
2. [Ejemplo 2](../003-example-2-watch-a-token-and-get-a-desktop-notification) - Observar un token y recibir una notificación de escritorio.
3. [Ejemplo 3](../004-example-3-watch-an-spo-and-get-an-alert-in-discord) - Observar un SPO y recibir una alerta en Discord.
4. [Ejemplo 4](../005-example-4-watch-a-smart-contract-for-a-specific-asset-id-and-get-a-desktop-notification) - Observar un contrato inteligente para un activo concreto y recibir una notificación de escritorio.
5. [Ejemplo 5](../006-example-5-watch-an-drep-and-get-an-alert-in-telegram) - Observar un DRep y recibir una alerta en Telegram.
6. [Ejemplo 6](../007-example-6-watch-mempool-for-a-token) - Observar el mempool para encontrar transacciones con un token.
