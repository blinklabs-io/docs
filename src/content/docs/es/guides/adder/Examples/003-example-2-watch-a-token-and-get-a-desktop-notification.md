---
title: Monitorear un Token y obtener una Notificacion de Escritorio
description: Adder Ejemplo 2 - Monitorear un Token y obtener una Notificacion de Escritorio.
---

# Monitorear un Token y obtener una Notificacion de Escritorio

En este ejemplo usaremos Adder para enviarnos una notificacion de escritorio cuando haya una transaccion que incluya cierto token o activo que queremos rastrear.

> Para esta guia asumimos que ya has descargado el exe de Adder y has abierto una linea de comandos. Si no, consulta nuestra guia de [Inicio Rapido](../../002-quick-start-overview).

***

Comencemos eligiendo un activo que queremos seguir.

## Paso 1 - Obtener ID de Activo / Huella Digital

Para filtrar por un Token que queremos monitorear necesitamos el id del activo, tambien conocido como la huella digital del activo. Podemos usar herramientas como <a href="https://www.cexplorer.io" target="_blank">cexplorer.io</a> para buscar por nombre de token y obtener el id / huella digital del activo.

![adder-cTOSI-cexploer](/adder-cTOSI-cexploer.png)

Toma nota de la huella digital del activo, la necesitaremos mas tarde. Para este ejemplo, usamos el siguiente id / huella digital de activo:

```
asset1uaxup2yv695uat3chgwqtpg9xvau55pd5z6r46
```

***

Ahora que tenemos nuestro id / huella digital del activo que queremos monitorear, estamos listos para ver los filtros y comandos que usaremos. Para este ejemplo, usaremos:

* Filtro de Activo
* Tipo de Filtro
* Salida

## Filtro de Activo

Podemos usar la huella digital del activo de arriba para cTOSI para que Adder rastree transacciones con esa huella digital usando el siguiente filtro:

```
-filter-asset asset1uaxup2yv695uat3chgwqtpg9xvau55pd5z6r46
```

## Tipo de Filtro - Transaccion

Para este ejemplo, queremos recibir alertas cuando ocurra una transaccion usando el id / huella digital del activo cTOSI. Para hacer esto agregaremos el siguiente filtro:

```
-filter-type chainsync.transaction
```

## Salida

Queremos que la salida sea una notificacion de escritorio. Para que cuando ocurra una transaccion que contenga cTOSI, recibamos una notificacion de escritorio. Para hacer esto agregaremos el siguiente comando:

```
-output notify
```



***

## Poniendolo Todo Junto

Para obtener notificaciones de escritorio cuando una transaccion incluya el token Tosidrop cTOSI, ejecutaremos el siguiente comando en nuestra linea de comandos:

> Por favor ajusta la ruta a tu exe de Adder. En este ejemplo esta en el Escritorio para el usuario richm.


```
C:\Users\richm\Desktop\adder-v0.26.0-windows-amd64.exe -filter-type chainsync.transaction -filter-asset asset1uaxup2yv695uat3chgwqtpg9xvau55pd5z6r46 -output notify
```


### Felicitaciones!

Ahora puedes minimizar la ventana y dejar que Adder se ejecute en segundo plano. Cada vez que ocurra una transaccion que contenga cTOSI recibiras una alerta de escritorio.


![adder-desktop-alert](/adder-desktop-alert.png)

***

> CONSEJO: Puedes obtener una lista de todos los comandos disponibles usando la bandera `-h` o `-help`.

Consulta nuestros otros ejemplos para ver que mas puede hacer Adder y desbloquea el poder de Adder

1. [Ejemplo 1](../002-example-1-watch-my-wallet-and-get-a-desktop-notification) - Monitorear Mi Billetera y obtener una Notificacion de Escritorio
2. [Ejemplo 2](../003-example-2-watch-a-token-and-get-a-desktop-notification) - Monitorear un Token y obtener una Notificacion de Escritorio
3. [Ejemplo 3](../004-example-3-watch-an-spo-and-get-an-alert-in-discord) - Monitorear un SPO y obtener una Alerta en Discord
4. [Ejemplo 4](../005-example-4-watch-a-smart-contract-for-a-specific-asset-id-and-get-a-desktop-notification) - Monitorear un Contrato Inteligente para un ID de Activo Especifico y obtener una Notificacion de Escritorio
