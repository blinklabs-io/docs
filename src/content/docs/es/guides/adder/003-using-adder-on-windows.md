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

### Paso 2 - Obtener la ruta del ejecutable independiente de Adder

Obtenga la ruta del archivo `.exe` descargado para ejecutarlo desde la línea de
comandos.

Por ejemplo, haga clic derecho en el ejecutable de Adder del escritorio y copie
la ruta.

Conserve la ruta para el paso siguiente.

![adder-exe-path](/adder-exe-path.png)

### Paso 3 - Ejecutar Adder en la línea de comandos

Escriba la ruta del ejecutable o péguela si la copió en el paso anterior.

![adder-cmd-paste-path](/adder-cmd-paste-path.png)

## Configurar Adder Tray

Después de completar la configuración inicial, haga clic derecho en el icono de
Adder Tray y seleccione `Notification Rules...`.

El editor permite modificar las cinco listas de objetivos de monitoreo:
`Wallets`, `DReps`, `Pools`, `Assets` y `Policies`. Cada lista admite varias
entradas. Al eliminar un objetivo, el editor solicita confirmación antes de
quitarlo.

`Monitor Everything` y las listas de objetivos son opciones mutuamente excluyentes. Con `Monitor Everything` activado, Adder Tray monitorea todos los eventos e ignora las listas. Si la opción permanece desactivada, el asistente exige al menos un objetivo y rechaza los valores vacíos, mal formados o duplicados.

Adder Tray combina los valores de cada lista con `OR`. El editor muestra los conectores `OR` y `AND` entre los grupos con contenido. `OR` acepta una coincidencia en cualquiera de los grupos; `AND` exige que el evento coincida con todos los grupos unidos. Una combinación `AND` entre objetivos de bloques, transacciones y gobernanza nunca coincide, por lo que `OR` permite combinar esos tipos de eventos.

El editor muestra casillas para las categorías de notificación. Active o desactive cada categoría según las alertas de escritorio requeridas. Adder Tray muestra las alertas sobre problemas de conexión por separado.

El botón `Apply & Restart` (Aplicar y reiniciar) guarda los objetivos y las
preferencias de Adder Tray, aplica los cambios, reinicia Adder y actualiza las
reglas y el límite de notificaciones en ejecución. El botón `Cancel` (Cancelar)
descarta las modificaciones sin guardar.

La sección `Advanced — Rate Limiting` permite definir el máximo de notificaciones por ventana y la duración de la ventana. La duración acepta valores como `5s`, `30s` o `1m`. Los campos vacíos hacen que Adder Tray use los valores predeterminados de una notificación por ventana de cinco segundos. Un máximo negativo desactiva la agrupación de notificaciones.

Adder Tray guarda la configuración principal en `%APPDATA%\Adder\adder-tray.yaml`. Cuando una configuración no incluye un filtro de Adder Tray, el asistente migra los objetivos antiguos de `engine.yaml`, incluidos los valores de `filter.cardano`, a las listas estructuradas. Al aplicar la nueva configuración, Adder elimina esas claves antiguas de `filter.cardano`.

### Felicitaciones!

Ahora estamos listos para ejecutar Adder con filtros y comandos para que podamos rastrear cierta informacion y elegir la forma en que somos notificados.

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
