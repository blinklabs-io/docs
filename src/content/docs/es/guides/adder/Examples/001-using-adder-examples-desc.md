---
title: Resumen de Ejemplos
description: Resumen de filtros y comandos comunes de Adder.
---

# Usando Ejemplos de Adder

## Resumen de Filtros Comunes

Antes de mostrarte algunos ejemplos, vamos a familiarizarte con algunos de los comandos y filtros comunes que puedes usar.

> CONSEJO: Puedes obtener una lista de todos los comandos disponibles usando la bandera `-h` o `-help`.

### Opciones de Filtro:

1. `-filter-type` (Hay 3 tipos de filtro: Transaction, Block y Rollback)
   * [x] -filter-type chainsync.transaction
   * [x] -filter-type chainsync.rollback
   * [x] -filter-type chainsync.block
2. `-filter-policy xyz...` (filtrar por id de politica)
3. `-filter-asset asset1xyz...` (filtrar por id de activo)
4. `-filter-address addr1xyz...` (filtrar por direccion de recepcion de billetera)
5. `-filter-address stake1xyz...` (filtrar por direccion de stake)
6. `-filter-pool poolxyz...` (filtrar por id de stake pool)

### Opciones de Salida:

1. -output log
2. -output notify
3. -output webhook
4. -output push

### Cambiar Red

* -input-chainsync-network (Hay 3 redes: preview, preprod, mainnet)
  * [x] -input-chainsync-network preview
  * [x] -input-chainsync-network preprod
  * [x] -input-chainsync-network mainnet



Ahora que tenemos un resumen de los tipos de filtros y comandos que puedes usar, vamos a revisar algunos ejemplos para familiarizarte con el poder de Adder.

1. [Ejemplo 1](../002-example-1-watch-my-wallet-and-get-a-desktop-notification) - Monitorear Mi Billetera y obtener una Notificacion de Escritorio
2. [Ejemplo 2](../003-example-2-watch-a-token-and-get-a-desktop-notification) - Monitorear un Token y obtener una Notificacion de Escritorio
3. [Ejemplo 3](../004-example-3-watch-an-spo-and-get-an-alert-in-discord) - Monitorear un SPO y obtener una Alerta en Discord
4. [Ejemplo 4](../005-example-4-watch-a-smart-contract-for-a-specific-asset-id-and-get-a-desktop-notification) - Monitorear un Contrato Inteligente para un ID de Activo Especifico y obtener una Notificacion de Escritorio
