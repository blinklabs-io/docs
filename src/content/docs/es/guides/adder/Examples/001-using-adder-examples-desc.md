---
title: Resumen de los ejemplos
description: Resumen de los filtros y comandos habituales de Adder.
---

Antes de comenzar con los ejemplos, conoce los comandos y filtros más habituales.

💡 Consulta todos los comandos disponibles con `-h` o `--help`.

### Opciones de filtrado

1. `--filter-type`: cuatro tipos de evento: transacción, bloque, retroceso y gobernanza.
   - [x] `--filter-type input.transaction`
   - [x] `--filter-type input.rollback`
   - [x] `--filter-type input.block`
   - [x] `--filter-type input.governance`
2. `--filter-policy xyz...`: filtrar por identificador de política.
3. `--filter-asset asset1xyz...`: filtrar por identificador de activo.
4. `--filter-drep drepxyz...`: filtrar por identificador de DRep.
5. `--filter-address addr1xyz...`: filtrar por dirección de recepción de la billetera.
6. `--filter-address stake1xyz...`: filtrar por dirección de stake.
7. `--filter-pool poolxyz...`: filtrar por identificador de stake pool.

### Opciones de salida

1. `--output log`
2. `--output notify`
3. `--output telegram`
4. `--output webhook`
5. `--output push`

### Cambiar la red

`--input-chainsync-network` permite elegir entre tres redes: preview, preprod y mainnet.

- [x] `--input-chainsync-network preview`
- [x] `--input-chainsync-network preprod`
- [x] `--input-chainsync-network mainnet`

Ahora que conoces los filtros y comandos, continúa con los ejemplos:

1. [Ejemplo 1](../002-example-1-watch-my-wallet-and-get-a-desktop-notification) - Observar la billetera y recibir una notificación de escritorio.
2. [Ejemplo 2](../003-example-2-watch-a-token-and-get-a-desktop-notification) - Observar un token y recibir una notificación de escritorio.
3. [Ejemplo 3](../004-example-3-watch-an-spo-and-get-an-alert-in-discord) - Observar un SPO y recibir una alerta en Discord.
4. [Ejemplo 4](../005-example-4-watch-a-smart-contract-for-a-specific-asset-id-and-get-a-desktop-notification) - Observar un contrato inteligente para un activo concreto y recibir una notificación de escritorio.
5. [Ejemplo 5](../006-example-5-watch-an-drep-and-get-an-alert-in-telegram) - Observar un DRep y recibir una alerta en Telegram.
6. [Ejemplo 6](../007-example-6-watch-mempool-for-a-token) - Observar el mempool para encontrar transacciones con un token.

## Ejemplos de la biblioteca Go

Para desarrollar aplicaciones, consulta los [ejemplos de la biblioteca Go](/es/guides/adder/library-examples/overview/), que incluyen publicadores de eventos, filtros y plantillas de plugins gestionados descargables.
