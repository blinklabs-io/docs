---
title: Uso en Windows
description: Como usar Adder en Windows.
---

# Usando Adder en Windows

Esta guía describe cómo instalar y usar Adder en Windows. La instalación empaquetada recomendada utiliza el MSI firmado de la versión publicada.

## Instalar Adder con el MSI de la versión publicada

1. Descargue el archivo MSI firmado correspondiente a la arquitectura de Windows:
   `amd64` para Windows x64 o `arm64` para Windows ARM64. Los archivos siguen el
   formato `adder-<version>-windows-<arch>.msi`.

2. Abra o ejecute el archivo `.msi` y complete el instalador de Windows.

3. Abra el menú Inicio y seleccione `Adder`. El acceso directo inicia `Adder Tray`
   y su asistente de configuración.

4. Verifique que el instalador haya colocado los dos ejecutables en las rutas
   siguientes:
   - `%ProgramFiles%\Adder\adder.exe`: ejecutable de línea de comandos.
   - `%ProgramFiles%\Adder\adder-tray.exe`: aplicación de bandeja del sistema.

El MSI no agrega el ejecutable de línea de comandos a `PATH`. Tampoco crea una
tarea programada ni una entrada de inicio automático. `Adder Tray` gestiona el
registro de inicio por usuario cuando la configuración inicial activa la opción
de inicio automático.

## Alternativa: ejecutable independiente

El ejecutable independiente `.exe` sigue siendo una alternativa válida para usar
Adder desde la línea de comandos sin la instalación MSI. Esta modalidad requiere
el archivo disponible en
<a href="https://blinklabs.io/projects-open-source" target="_blank">blinklabs.io</a>.

### Paso 1 - Abrir una línea de comandos en Windows

Abra el menú Inicio de Windows.

![adder-windows-start-menu](/adder-windows-start-menu.webp)

Escriba `cmd` en el cuadro de búsqueda y seleccione `Abrir`.

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
