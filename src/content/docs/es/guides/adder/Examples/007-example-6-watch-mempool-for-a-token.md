---
title: Observar el mempool para encontrar transacciones con un token
description: Ejemplo 6 de Adder - Observar el mempool para encontrar transacciones con un token.
---

En este ejemplo utilizaremos Adder para registrar una notificación cuando aparezca en el mempool una transacción que incluya el token o activo que queramos seguir.

⚠️ El mempool contiene transacciones todavía no confirmadas. Si necesitas mayor certeza, utiliza `input-chainsync`.

✅ Se presupone que ejecutas Adder en la misma máquina que el nodo. Si no es así, consulta la [guía de Adder para Linux](../../005-use-adder-on-linux).

Primero elige el activo que quieras seguir.

## Paso 1 - Obtener el identificador o huella del activo

Para filtrar por token necesitamos su identificador de activo, también llamado huella del activo. Podemos buscar el nombre del token en [cexplorer.io](https://www.cexplorer.io) para obtenerlo.

<img src="/adder-cTOSI-cexploer.png"
     alt="adder-cTOSI-cexploer"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

📝 Anota la huella del activo; la necesitaremos después. En este ejemplo utilizamos:

```
asset1uaxup2yv695uat3chgwqtpg9xvau55pd5z6r46
```

## Paso 2 - Seleccionar los comandos de Adder

Con el identificador del activo, podemos seleccionar estos filtros y comandos:

- Entrada mempool.
- Ruta del socket del mempool.
- Filtro de activo.
- Tipo de evento.
- Salida.

### Entrada mempool

Indica que la entrada es el mempool:

```
--input mempool
```

### Ruta del socket del mempool

Indica la ruta del socket del nodo Cardano en el que ejecutas Adder.

⚠️ Ajusta la ruta del archivo a tu instalación.

```
--input-mempool-socket-path /home/user/cardano-my-node/db/socket
```

💡 Para encontrar la ruta del socket del nodo:

```
echo $CARDANO_NODE_SOCKET_PATH
```

### Filtro de activo

Utiliza la huella de cTOSI obtenida antes para observar las transacciones que la contengan:

```
--filter-asset asset1uaxup2yv695uat3chgwqtpg9xvau55pd5z6r46
```

### Tipo de evento - Transacción

Para recibir alertas de transacciones que utilicen la huella de cTOSI:

```
--filter-type input.transaction
```

### Salida

Queremos escribir los eventos en la consola mediante el registro. Así recibiremos una entrada de registro cuando aparezca una transacción con cTOSI:

```
--output log
```

## Paso 3 - Combinarlo todo

Ejecuta este comando para registrar las transacciones que contengan el token cTOSI de TosiDrop.

⚠️ Ajusta la ruta del socket.

```
./adder --input mempool --input-mempool-socket-path /home/user/cardano-my-node/db/socket --filter-type input.transaction --filter-asset asset1uaxup2yv695uat3chgwqtpg9xvau55pd5z6r46 --output log
```

### ¡Enhorabuena!

Cuando aparezca en el mempool una transacción con cTOSI, recibirás un evento en el registro.

<img src="/adder-mempool-log.png"
     alt="adder-mempool-log"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

💡 Consulta todos los comandos disponibles con `-h` o `--help`.

Descubre otras posibilidades de Adder en estos ejemplos:

1. [Ejemplo 1](../002-example-1-watch-my-wallet-and-get-a-desktop-notification) - Observar la billetera y recibir una notificación de escritorio.
2. [Ejemplo 2](../003-example-2-watch-a-token-and-get-a-desktop-notification) - Observar un token y recibir una notificación de escritorio.
3. [Ejemplo 3](../004-example-3-watch-an-spo-and-get-an-alert-in-discord) - Observar un SPO y recibir una alerta en Discord.
4. [Ejemplo 4](../005-example-4-watch-a-smart-contract-for-a-specific-asset-id-and-get-a-desktop-notification) - Observar un contrato inteligente para un activo concreto y recibir una notificación de escritorio.
5. [Ejemplo 5](../006-example-5-watch-an-drep-and-get-an-alert-in-telegram) - Observar un DRep y recibir una alerta en Telegram.
6. [Ejemplo 6](../007-example-6-watch-mempool-for-a-token) - Observar el mempool para encontrar transacciones con un token.
