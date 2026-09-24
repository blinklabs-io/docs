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

### Felicitaciones!

Ahora estamos listos para ejecutar Adder con filtros y comandos para que podamos rastrear cierta informacion y elegir la forma en que somos notificados.

## Configurar Adder Tray

En el asistente de configuración, seleccione un modo de monitoreo:

- Active `Monitor Everything` para monitorear todos los eventos compatibles. Esta opción ignora las listas de las secciones de destino.
- Desactive `Monitor Everything` y agregue al menos un valor válido en `Wallets`, `DReps`, `Pools`, `Assets` o `Policies`.

Introduzca los valores con el formato aceptado por cada sección:

- `Wallets`: una dirección de pago o de participación que comience por `addr1...` o `stake1...`.
- `DReps`: un ID de DRep con prefijo `drep1...` o un valor hexadecimal.
- `Pools`: un ID de pool con prefijo `pool1...` o un valor hexadecimal.
- `Assets`: una huella digital de activo CIP-14 con prefijo `asset1...`.
- `Policies`: un ID de política hexadecimal de 56 caracteres.

Los valores de una misma sección funcionan como alternativas. Los controles `OR` y `AND` combinan las secciones de destino que contienen valores. Use `OR` cuando cualquiera de las secciones pueda producir el evento correspondiente. No use `AND` entre familias de eventos incompatibles: `Pools` coincide con bloques, `Wallets`, `Assets` y `Policies` coinciden con transacciones, y `DReps` coincide con eventos de gobernanza. El asistente rechaza una combinación `AND` que no pueda coincidir con ningún evento.

En la pantalla `Notifications`, seleccione las categorías de alertas relevantes para los grupos de destino configurados. Seleccione `Notify on connection issues` por separado para recibir alertas sobre problemas de conexión.

Abra `Advanced — Rate Limiting` para definir `Max notifications per window` y `Window duration`. Introduzca una duración como `5s`, `30s` o `1m`. Los campos vacíos usan el valor predeterminado de una notificación cada cinco segundos. Introduzca un límite negativo para desactivar por completo la agrupación de notificaciones.

Consulte la [referencia de configuración de la bandeja](../007-tray-configuration-reference) para conocer las opciones disponibles de destinos y notificaciones.

<br />


> CONSEJO: Puedes obtener una lista de todos los comandos disponibles usando la bandera `-h` o `--help`.

<br />


Ahora estamos listos para revisar algunos [ejemplos](../examples/001-using-adder-examples-desc) sobre la utilidad y el poder de Adder!


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
