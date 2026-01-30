---
title: Monitorear Mi Billetera y obtener una Notificacion de Escritorio
description: Adder Ejemplo 1 - Monitorear Mi Billetera y obtener una Notificacion de Escritorio.
---

# Monitorear Mi Billetera y obtener una Notificacion de Escritorio

Vamos a revisar como abrir Adder, introducir filtros y comandos para que rastree tu billetera y te de una notificacion de escritorio cuando haya un cambio en tu billetera.

> Para esta guia asumimos que ya has descargado el exe de Adder y has abierto una linea de comandos. Si no, consulta nuestra guia de [Inicio Rapido](../../002-quick-start-overview).

***
<a name="step-1"></a>

## Paso 1 - Obtener Direccion de Billetera

Primero necesitamos la direccion de recepcion o direccion de staking de nuestra billetera. Para encontrar tu direccion de recepcion ve a tu billetera de Cardano preferida. Encuentra la pestana o boton de recibir y copia tu direccion. Toma nota de la direccion para usarla mas tarde.

![adder-receive-address](/adder-receive-address.png)

Para encontrar tu direccion de staking puedes usar herramientas como <a href="https://www.cexplorer.io" target="_blank">cexplorer.io</a> para buscar tu direccion de recepcion y luego copiar tu direccion de staking

Direccion de Staking:
![adder-staking-address](/adder-staking-address.png)

Toma nota de la direccion de billetera que quieres usar; la necesitaremos mas tarde. Para este ejemplo, usamos la siguiente direccion de staking:

```
stake1uytyq97kc5xc6uwy9vt0xskhfaesv3q49efxgmhrengxpec3j5cta
```

***

Ahora que tenemos la direccion de billetera que queremos monitorear, estamos listos para ver los filtros y comandos que usaremos. Para este ejemplo, usaremos:

* Tipo de filtro
* Filtro de Direccion
* Salida

## Tipo de filtro

El primer filtro que agregaremos es el tipo de filtro. Para este ejemplo, queremos recibir alertas cuando ocurra una transaccion dentro de nuestra billetera, ya sea cuando enviamos o recibimos un activo. Para hacer esto agregaremos el siguiente filtro:

```
-filter-type chainsync.transaction
```

## Filtro de Direccion

A continuacion queremos recibir alertas solo para nuestra direccion de billetera. En este ejemplo usaremos nuestra direccion de staking. Para recibir alertas solo para nuestra direccion de staking agregaremos el siguiente filtro:

```
-filter-address stake1uytyq97kc5xc6uwy9vt0xskhfaesv3q49efxgmhrengxpec3j5cta
```

## Salida

Queremos que la salida sea una notificacion de escritorio, para que cuando ocurra una transaccion con nuestra billetera, recibamos una notificacion de escritorio. Para hacer esto agregaremos el siguiente comando:

```
-output notify
```

***

## Paso 2 - Poniendolo Todo Junto

Ahora que entendemos los filtros y comandos que queremos introducir en Adder para obtener alertas de escritorio cuando enviamos o recibimos un activo, ejecutaremos el siguiente comando en nuestra linea de comandos:



> Por favor ajusta la ruta a tu exe de Adder. En este ejemplo esta en el Escritorio para el usuario richm.\
\
Tambien asegurate de reemplazar la direccion de stake a continuacion con tu direccion de recepcion o stake del [Paso 1](#step-1)


Comando a ejecutar una vez que ajustes la ruta del exe de Adder y tu direccion de billetera:


```
C:\Users\richm\Desktop\adder-v0.26.0-windows-amd64.exe -filter-type chainsync.transaction -filter-address stake1uytyq97kc5xc6uwy9vt0xskhfaesv3q49efxgmhrengxpec3j5cta -output notify
```

Comando final a ejecutar:
![adder-final-ex-1-command](/adder-final-ex-1-command.png)

Despues de presionar enter para ejecutar el comando puedes minimizar la ventana de cmd y dejarla ejecutandose en segundo plano. Ahora cuando tu billetera envie o reciba un activo recibiras una notificacion de escritorio.

Minimizar:
![adder-minimize-final-ex-1-command](/adder-minimize-final-ex-1-command.png)


Alerta de Escritorio:
![adder-desktop-alert](/adder-desktop-alert.png)

### Felicitaciones!&#x20;

***


> CONSEJO: Puedes obtener una lista de todos los comandos disponibles usando la bandera `-h` o `-help`.

Consulta nuestros otros ejemplos para ver que mas puede hacer Adder y desbloquea el poder de Adder

1. [Ejemplo 1](../002-example-1-watch-my-wallet-and-get-a-desktop-notification) - Monitorear Mi Billetera y obtener una Notificacion de Escritorio
2. [Ejemplo 2](../003-example-2-watch-a-token-and-get-a-desktop-notification) - Monitorear un Token y obtener una Notificacion de Escritorio
3. [Ejemplo 3](../004-example-3-watch-an-spo-and-get-an-alert-in-discord) - Monitorear un SPO y obtener una Alerta en Discord
4. [Ejemplo 4](../005-example-4-watch-a-smart-contract-for-a-specific-asset-id-and-get-a-desktop-notification) - Monitorear un Contrato Inteligente para un ID de Activo Especifico y obtener una Notificacion de Escritorio
