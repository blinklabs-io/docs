---
title: Monitorear un Contrato Inteligente para un ID de Activo Especifico y obtener una Notificacion de Escritorio
description: Adder Ejemplo 4 - Monitorear un Contrato Inteligente para un ID de Activo Especifico y obtener una Notificacion de Escritorio.
---

# Monitorear un Contrato Inteligente para un ID de Activo Especifico y obtener una Notificacion de Escritorio

Este ejemplo es un poco mas avanzado, donde usamos Adder para monitorear un contrato inteligente para ver si cierto activo fue agregado o removido del contrato.

> Antes de desglosar los filtros y comandos que usaremos para este ejemplo, asumimos que ya tienes en mente una politica de contrato inteligente que quieres monitorear.


![adder-policy-id](/adder-policy-id.png)

<br />

Para este ejemplo, el id de politica del contrato inteligente que vamos a monitorear es:

```
c04e78ea267631f27975446a15d96ef1f3bbcdbf99577d3e552c663b
```

<br />

> Para esta guia asumimos que ya has descargado el exe de Adder y has abierto una linea de comandos. Si no, consulta nuestra guia de [Inicio Rapido](../../002-quick-start-overview).



***

Comencemos eligiendo un activo que queremos seguir. Si este activo se usa en el contrato inteligente que estamos siguiendo, recibiremos una alerta de escritorio.

## Paso 1 - Obtener ID de Activo / Huella Digital

Para filtrar por un Token que queremos monitorear necesitamos el id del activo, tambien conocido como la huella digital del activo. Podemos usar herramientas como <a href="https://www.cexplorer.io" target="_blank">cexplorer.io</a> para buscar por nombre de token y obtener el id / huella digital del activo.

![adder-cTOSI-cexploer](/adder-cTOSI-cexploer.png)

<br />

Toma nota de la huella digital del activo, la necesitaremos mas tarde. Para este ejemplo, usamos el siguiente id / huella digital de activo:

```
asset1uaxup2yv695uat3chgwqtpg9xvau55pd5z6r46
```

***

Ahora que tenemos nuestro id / huella digital del activo que queremos monitorear, estamos listos para ver los filtros y comandos que usaremos. Para este ejemplo, usaremos:

* Filtro de Politica
* Filtro de Activo
* Tipo de Filtro
* Salida

## Filtro de Politica

Usaremos el id de politica del contrato inteligente de arriba para decirle a Adder que monitoree esta politica usando el siguiente filtro:

```
-filter-policy c04e78ea267631f27975446a15d96ef1f3bbcdbf99577d3e552c663b
```

## Filtro de Activo

Podemos usar la huella digital del activo para cTOSI de arriba para que Adder rastree transacciones con esa huella digital usando el siguiente filtro:

```
-filter-asset asset1uaxup2yv695uat3chgwqtpg9xvau55pd5z6r46
```

## Tipo de Filtro - Transaccion

Para este ejemplo, queremos recibir alertas cuando ocurra una transaccion con el contrato inteligente, ya sea al enviar o recibir el activo cTOSI. Para hacer esto agregaremos el siguiente filtro:

```
-filter-type chainsync.transaction
```

## Salida

Queremos que la salida sea una notificacion de escritorio. Para que cuando ocurra una transaccion que contenga cTOSI con el contrato inteligente, recibamos una notificacion de escritorio. Para hacer esto agregaremos el siguiente comando:

```
-output notify
```

***

## Poniendolo Todo Junto

Para obtener notificaciones de escritorio cuando una transaccion incluya el token Tosidrop cTOSI, dentro del contrato inteligente ejecutaremos el siguiente comando en nuestra linea de comandos:

> Por favor ajusta la ruta a tu exe de Adder. En este ejemplo esta en el Escritorio para el usuario richm.\
> Tambien ajusta al id de activo y id de politica que quieres rastrear.


```
C:\Users\richm\Desktop\adder-v0.26.0-windows-amd64.exe -filter-type chainsync.transaction -filter-asset asset1uaxup2yv695uat3chgwqtpg9xvau55pd5z6r46 -filter-policy c04e78ea267631f27975446a15d96ef1f3bbcdbf99577d3e552c663b -output notify
```


### Felicitaciones!

Ahora puedes minimizar la ventana y dejar que Adder se ejecute en segundo plano. Cada vez que ocurra una transaccion que contenga cTOSI en nuestro contrato inteligente recibiras una alerta de escritorio.

![adder-desktop-alert](/adder-desktop-alert.png)

***


> CONSEJO: Puedes obtener una lista de todos los comandos disponibles usando la bandera `-h` o `-help`.

Consulta nuestros otros ejemplos para ver que mas puede hacer Adder y desbloquea el poder de Adder

1. [Ejemplo 1](../002-example-1-watch-my-wallet-and-get-a-desktop-notification) - Monitorear Mi Billetera y obtener una Notificacion de Escritorio
2. [Ejemplo 2](../003-example-2-watch-a-token-and-get-a-desktop-notification) - Monitorear un Token y obtener una Notificacion de Escritorio
3. [Ejemplo 3](../004-example-3-watch-an-spo-and-get-an-alert-in-discord) - Monitorear un SPO y obtener una Alerta en Discord
4. [Ejemplo 4](../005-example-4-watch-a-smart-contract-for-a-specific-asset-id-and-get-a-desktop-notification) - Monitorear un Contrato Inteligente para un ID de Activo Especifico y obtener una Notificacion de Escritorio
