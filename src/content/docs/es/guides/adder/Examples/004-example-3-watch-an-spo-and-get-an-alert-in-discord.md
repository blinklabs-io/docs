---
title: Monitorear un SPO y obtener una Alerta en Discord
description: Adder Ejemplo 3 - Monitorear un SPO y obtener una Alerta en Discord.
---

# Monitorear un SPO y obtener una Alerta en Discord

En este ejemplo usaremos Adder para enviarnos una notificacion de Discord via webhooks, cuando haya un cambio en el stake pool que queremos rastrear.


### Los eventos que activaran una alerta son los siguientes cambios a un SPO:

Bloque Acunado - si el SPO que estamos rastreando acuna un bloque

Delegacion de Stake - si el SPO que estamos rastreando tiene un nuevo delegador agregado al pool

Actualizaciones de Registro del Pool - si el SPO cambia elementos en su registro como, Relays, tarifa fija, margen, Nombre o metadatos

Retiro del Pool - si el SPO retira su stake pool

***

> Para esta guia asumimos que ya has descargado el exe de Adder y has abierto una linea de comandos. Si no, consulta nuestra guia de [Inicio Rapido](../../002-quick-start-overview).

***

Antes de desglosar los filtros y comandos que usaremos para este ejemplo, necesitamos obtener un id de pool para rastrear y una URL de webhook para poder recibir alertas en nuestro Discord. Te guiaremos a traves de los pasos para obtener ambos a continuacion.

<a name="step-1"></a>

## Paso 1 - Obtener ID del Pool que quieres Rastrear

Para filtrar por un Stake Pool (SPO) que queremos monitorear necesitamos el id del pool. Podemos usar herramientas como cexplorer.io para buscar por ticker del Pool y obtener el id del pool.

En este ejemplo buscamos el ticker `ECP` en <a href="https://www.cexplorer.io" target="_blank">cexplorer.io</a>

![adder-pool-id](/adder-pool-id.png)

<br />

Toma nota del ID del Pool, lo necesitaremos mas tarde. Para este ejemplo, fue:

```
pool16cdtqyk0fvxzfkhjg3esjcuty4tnlpds5lj0lkmqmwdjyzaj7p8
```

***

<a name="step-2"></a>

## Paso 2 - Obtener URL de webhook de Discord

Para recibir alertas en nuestro servidor de Discord necesitaremos una URL de webhook. Los siguientes pasos te guiaran a traves de como crear un webhook en tu canal preferido en tu servidor de Discord.


<br />

1 ) Haz clic en `Editar Canal` en el canal donde te gustaria recibir alertas

![adder-discord-edit-channel](/adder-discord-edit-channel.png)

<br />

2 ) Haz clic en `Integraciones`

![adder-discord-integrations](/adder-discord-integrations.png)

<br />

3 ) Haz clic en `Crear Webhook`

![adder-discord-create-webhook](/adder-discord-create-webhook.png)

<br />

4 ) Haz clic en `Nuevo Webhook`

![adder-discord-new-webhook](/adder-discord-new-webhook.png)

<br />

5 ) Nombra tu Webhook

![adder-discord-rename-webhook](/adder-discord-rename-webhook.png)

<br />

6 ) Haz clic en `Copiar URL del Webhook`

![adder-discord-copy-webhook-url](/adder-discord-copy-webhook-url.png)

<br />

Asegurate de tomar nota de tu URL del Webhook, la necesitaremos mas tarde. Para este ejemplo, la URL del Webhook que usamos es:

```
https://discord.com/api/webhooks/1342941446373773342/Wo1bXhSouY5fKdv2frsUQlOnT5UTa9heCxinN_B13AUTuaQ0IOzxzr9ZYsa4co2VN3mi
```

***

Ahora que tenemos el id del pool que queremos monitorear y nuestra URL de webhook de Discord, estamos listos para ver los filtros y comandos que usaremos. Para este ejemplo, usaremos:

* Tipo de Filtro
* Filtro de Pool
* Salida Webhook
* Formato de Webhook de Salida
* URL de Webhook de Salida


***

## Tipo de Filtro

No queremos alertas de rollbacks de bloques, asi que podemos usar el tipo de filtro transaccion y bloque. Ya que queremos usar dos tipos de filtro, los separamos con una coma. Para que Adder excluya las alertas de rollback usando el filtro de transaccion y bloque, usaremos el siguiente filtro:

```
-filter-type chainsync.transaction,chainsync.block
```

## Filtro de Pool

Podemos usar el id del pool del [Paso 1](#step-1) para que Adder rastree nuestro SPO usando el siguiente filtro:

```
-filter-pool pool16cdtqyk0fvxzfkhjg3esjcuty4tnlpds5lj0lkmqmwdjyzaj7p8
```

## Salida Webhook

Necesitamos agregar un comando para que Adder sepa que queremos usar un webhook. Para hacer esto agregaremos el siguiente comando:

```
-output webhook
```

## Formato de Webhook de Salida

Ya que queremos que Adder nos notifique en Discord, necesitamos decirle a Adder que el formato de webhook que queremos usar es Discord. Para hacer esto agregaremos el siguiente comando:

```
-output-webhook-format discord
```

## URL de Webhook de Salida

Para recibir una notificacion en nuestro canal de Discord preferido, necesitamos decirle a Adder la URL del Webhook de Discord. Para hacer esto agregaremos el siguiente comando usando la URL del Webhook del [Paso 2](#step-2):

```
-output-webhook-url https://discord.com/api/webhooks/1342941446373773342/Wo1bXhSouY5fKdv2frsUQlOnT5UTa9heCxinN_B13AUTuaQ0IOzxzr9ZYsa4co2VN3mi
```



***

## Poniendolo Todo Junto

Para obtener notificaciones de Discord cuando ocurra un cambio en un SPO, ejecutaremos el siguiente comando en nuestra linea de comandos:

> Por favor ajusta la ruta a tu exe de Adder. En este ejemplo esta en el Escritorio para el usuario richm.\
> Tambien ajusta el id del pool y la URL del webhook.

```
C:\Users\richm\Desktop\adder-v0.26.0-windows-amd64.exe -filter-type chainsync.transaction, chainsync.block -filter-pool pool16cdtqyk0fvxzfkhjg3esjcuty4tnlpds5lj0lkmqmwdjyzaj7p8 -output webhook -output-webhook-format discord -output-webhook-url https://discord.com/api/webhooks/1342941446373773342/Wo1bXhSouY5fKdv2frsUQlOnT5UTa9heCxinN_B13AUTuaQ0IOzxzr9ZYsa4co2VN3mi
```

![adder-SPO-block-alert](/adder-SPO-block-alert.png)

### Felicitaciones!

Ahora puedes minimizar la ventana y dejar que Adder se ejecute en segundo plano. Cada vez que ocurra un cambio en nuestro Pool recibiremos una Alerta en Discord.

***


> CONSEJO: Puedes obtener una lista de todos los comandos disponibles usando la bandera `-h` o `-help`.

Consulta nuestros otros ejemplos para ver que mas puede hacer Adder y desbloquea el poder de Adder

1. [Ejemplo 1](../002-example-1-watch-my-wallet-and-get-a-desktop-notification) - Monitorear Mi Billetera y obtener una Notificacion de Escritorio
2. [Ejemplo 2](../003-example-2-watch-a-token-and-get-a-desktop-notification) - Monitorear un Token y obtener una Notificacion de Escritorio
3. [Ejemplo 3](../004-example-3-watch-an-spo-and-get-an-alert-in-discord) - Monitorear un SPO y obtener una Alerta en Discord
4. [Ejemplo 4](../005-example-4-watch-a-smart-contract-for-a-specific-asset-id-and-get-a-desktop-notification) - Monitorear un Contrato Inteligente para un ID de Activo Especifico y obtener una Notificacion de Escritorio
