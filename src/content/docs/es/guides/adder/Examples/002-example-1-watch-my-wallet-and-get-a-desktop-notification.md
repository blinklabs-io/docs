---
title: Monitorear Mi Billetera y obtener una Notificación de Escritorio
description: Adder Ejemplo 1 - Monitorear Mi Billetera y obtener una Notificación de Escritorio.
---

# Monitorear Mi Billetera y obtener una Notificación de Escritorio

Vamos a revisar cómo abrir Adder, introducir filtros y comandos para que rastree tu billetera y te de una notificación de escritorio cuando haya un cambio en tu billetera.

> Para esta guia asumimos que ya has descargado el ejecutable de Adder y has abierto una línea de comandos. Si no, consulta nuestra guia de [Inicio Rapido](../../002-operating-mode-overview).

***
<a name="step-1"></a>

## Paso 1 - Obtener Dirección de Billetera

Primero necesitamos la dirección de recepcion o dirección de staking de nuestra billetera. Para encontrar tu dirección de recepcion ve a tu billetera de Cardano preferida. Encuentra la pestaña o botón de recibir y copia tu dirección. Toma nota de la dirección para usarla más tarde.

![adder-receive-address](/adder-receive-address.png)

Para encontrar tu dirección de staking puedes usar herramientas como <a href="https://www.cexplorer.io" target="_blank">cexplorer.io</a> para buscar tu dirección de recepcion y luego copiar tu dirección de staking

Dirección de Staking:
![adder-staking-address](/adder-staking-address.png)

Toma nota de la dirección de billetera que quieres usar; la necesitaremos más tarde. Para este ejemplo, usamos la siguiente dirección de staking:

```
stake1uytyq97kc5xc6uwy9vt0xskhfaesv3q49efxgmhrengxpec3j5cta
```

***

Ahora que tenemos la dirección de billetera que queremos monitorear, estamos listos para ver los filtros y comandos que usaremos. Para este ejemplo, usaremos:

* Tipo de filtro
* Filtro de Dirección
* Salida

## Tipo de filtro

El primer filtro que agregaremos es el tipo de filtro. Para este ejemplo, queremos recibir alertas cuando ocurra una transacción dentro de nuestra billetera, ya sea cuando enviamos o recibimos un activo. Para hacer esto agregaremos el siguiente filtro:

```
--filter-type input.transaction
```

## Filtro de Dirección

A continuacion queremos recibir alertas solo para nuestra dirección de billetera. En este ejemplo usaremos nuestra dirección de staking. Para recibir alertas solo para nuestra dirección de staking agregaremos el siguiente filtro:

```
--filter-address stake1uytyq97kc5xc6uwy9vt0xskhfaesv3q49efxgmhrengxpec3j5cta
```

## Salida

Queremos que la salida sea una notificación de escritorio, para que cuando ocurra una transacción con nuestra billetera, recibamos una notificación de escritorio. Para hacer esto agregaremos el siguiente comando:

```
--output notify
```

***

## Paso 2 - Poniendolo Todo Junto

Ahora que entendemos los filtros y comandos que queremos introducir en Adder para obtener alertas de escritorio cuando enviamos o recibimos un activo, ejecutaremos el siguiente comando en nuestra línea de comandos:



> Ajusta la ruta al ejecutable de Adder. En este ejemplo se usa `./adder`.\
\
También asegúrate de reemplazar la dirección de stake a continuacion con tu dirección de recepcion o stake del [Paso 1](#step-1)


Comando a ejecutar una vez que ajustes la ruta del exe de Adder y tu dirección de billetera:


```
./adder --filter-type input.transaction --filter-address stake1uytyq97kc5xc6uwy9vt0xskhfaesv3q49efxgmhrengxpec3j5cta --output notify
```

Comando final a ejecutar:
![adder-final-ex-1-command](/adder-final-ex-1-command.png)

Después de presionar enter para ejecutar el comando puedes minimizar la ventana de cmd y dejarla ejecutándose en segundo plano. Ahora cuando tu billetera envie o reciba un activo recibiras una notificación de escritorio.

Minimizar:
![adder-minimize-final-ex-1-command](/adder-minimize-final-ex-1-command.png)


Alerta de Escritorio:
![adder-desktop-alert](/adder-desktop-alert.png)

### Felicitaciones!&#x20;

***


> CONSEJO: Puedes obtener una lista de todos los comandos disponibles usando la bandera `-h` o `--help`.

Consulta nuestros otros ejemplos para ver que más puede hacer Adder y desbloquea el poder de Adder

1. [Ejemplo 1](../002-example-1-watch-my-wallet-and-get-a-desktop-notification) - Monitorear Mi Billetera y obtener una Notificación de Escritorio
2. [Ejemplo 2](../003-example-2-watch-a-token-and-get-a-desktop-notification) - Monitorear un Token y obtener una Notificación de Escritorio
3. [Ejemplo 3](../004-example-3-watch-an-spo-and-get-an-alert-in-discord) - Monitorear un SPO y obtener una Alerta en Discord
4. [Ejemplo 4](../005-example-4-watch-a-smart-contract-for-a-specific-asset-id-and-get-a-desktop-notification) - Monitorear un Contrato Inteligente para un ID de Activo Específico y obtener una Notificación de Escritorio
