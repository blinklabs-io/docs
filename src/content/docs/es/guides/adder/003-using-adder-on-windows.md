---
title: Uso en Windows
description: Como usar Adder en Windows.
---

# Usando Adder en Windows

Esta guia te mostrara como usar Adder en Windows. En las siguientes secciones te mostraremos ejemplos de como usar Adder. Recuerda que estos son ejemplos para familiarizarte con el tipo de cosas que Adder es capaz de hacer. El verdadero poder de Adder puede ser desbloqueado por tu imaginacion.

> Nota: esta guia asume que has descargado el exe de Adder desde <a href="https://blinklabs.io/projects-open-source" target="_blank">blinklabs.io</a>. Si no has descargado el exe, por favor consulta nuestro [Inicio Rapido](../002-quick-start-overview)

## Paso 1 - Abrir una Linea de Comandos en Windows

Ahora que tienes el archivo exe de Adder descargado, necesitamos abrir una linea de comandos. Aqui es donde mas tarde alimentaremos a Adder con filtros y comandos para que nos notifique de los eventos que queremos rastrear.



Para abrir una linea de comandos en Windows, ve a tu menu de inicio de Windows

![adder-windows-start-menu](/adder-windows-start-menu.webp)



Luego escribe `cmd` en el cuadro de busqueda y haz clic en `Abrir`

![adder-windows-search-cmd](/adder-windows-search-cmd.webp)

## Paso 2 - Obtener la ruta del exe de Adder

A continuacion, necesitaremos obtener la ruta del archivo exe de Adder que descargamos para poder ejecutarlo en la linea de comandos.

En este ejemplo descargamos el exe de Adder en nuestro escritorio, asi que podemos hacer clic derecho en el exe de Adder y copiar la ruta.

Toma nota de la ruta, la necesitaremos mas adelante

![adder-exe-path](/adder-exe-path.png)

## Paso 3 - Ejecutar Adder en la Linea de Comandos

Ahora que tenemos la ruta del exe de Adder, escribe la ruta o pegala si copiaste la ruta en el paso anterior.

![adder-cmd-paste-path](/adder-cmd-paste-path.png)

## Configurar Adder Tray

El asistente de Adder Tray organiza los objetivos de monitoreo en las listas `Wallets`, `DReps`, `Pools`, `Assets` y `Policies`. Cada lista admite varias entradas.

`Monitor Everything` y las listas de objetivos son opciones mutuamente excluyentes. Con `Monitor Everything` activado, Adder Tray monitorea todos los eventos e ignora las listas. Si la opción permanece desactivada, el asistente exige al menos un objetivo y rechaza los valores vacíos, mal formados o duplicados.

Adder Tray combina los valores de cada lista con `OR`. El asistente une los grupos con contenido mediante `OR` o `AND`. `OR` acepta una coincidencia en cualquiera de los grupos; `AND` exige que el evento coincida con todos los grupos unidos. Una combinación `AND` entre objetivos de bloques, transacciones y gobernanza nunca coincide, por lo que `OR` permite combinar esos tipos de eventos.

El asistente muestra las categorías de notificación según los grupos que la configuración selecciona. Adder Tray muestra las alertas sobre problemas de conexión por separado y guarda todas las preferencias al aplicar la configuración.

La sección `Advanced — Rate Limiting` permite definir el máximo de notificaciones por ventana y la duración de la ventana. La duración acepta valores como `5s`, `30s` o `1m`. Los campos vacíos hacen que Adder Tray use los valores predeterminados de una notificación por ventana de cinco segundos. Un máximo negativo desactiva la agrupación de notificaciones.

Adder Tray guarda la configuración principal en `%APPDATA%\Adder\adder-tray.yaml`. Cuando una configuración no incluye un filtro de Adder Tray, el asistente migra los objetivos antiguos de `engine.yaml`, incluidos los valores de `filter.cardano`, a las listas estructuradas. Al aplicar la nueva configuración, Adder elimina esas claves antiguas de `filter.cardano`.

### Felicitaciones!

Ahora estamos listos para ejecutar Adder con filtros y comandos para que podamos rastrear cierta informacion y elegir la forma en que somos notificados.

<br />


> CONSEJO: Puedes obtener una lista de todos los comandos disponibles usando la bandera `-h` o `--help`.

<br />


Ahora estamos listos para revisar algunos [ejemplos](../examples/001-using-adder-examples-desc) sobre la utilidad y el poder de Adder!
