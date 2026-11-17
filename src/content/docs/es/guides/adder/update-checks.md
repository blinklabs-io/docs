---
title: Comprobar y aplicar actualizaciones de Adder
description: Cómo comprobar actualizaciones de Adder e instalarlas según la plataforma.
---

Esta guía describe la comprobación manual y semanal de actualizaciones de Adder Tray, así como la instalación de las versiones disponibles en macOS y Windows. Linux y FreeBSD requieren una instalación manual desde la página de versiones.

## Comprobar actualizaciones

### Comprobación manual

1. Abre el menú de Adder en la bandeja del sistema.
2. Selecciona `Check for Updates...`.

La ventana `Software Update` consulta la versión más reciente de Adder y muestra el resultado. Si Adder ya utiliza la versión más reciente, la ventana indica que no hay ninguna actualización disponible. Si existe una versión nueva, muestra sus detalles y ofrece el flujo de instalación correspondiente a la plataforma.

La opción `Check for Updates...` inicia una comprobación independientemente de que las comprobaciones semanales estén activadas.

### Comprobación semanal

La ventana `Software Update` incluye la casilla `Check for updates weekly`. Activa o desactiva esta casilla para permitir o impedir las comprobaciones automáticas. La misma preferencia también aparece en el asistente de configuración, dentro de la sección `Software Updates`.

Cuando la opción está activa, Adder comprueba si ha transcurrido aproximadamente una semana desde la última comprobación correcta. Si hay una versión nueva que no se ha omitido, Adder abre `Software Update` automáticamente. Si la opción está desactivada, Adder no realiza comprobaciones semanales.

### Estado guardado

Adder guarda el estado de las actualizaciones en `adder-tray.yaml`:

- `check_updates_weekly` conserva la preferencia de comprobación semanal.
- `last_update_check` conserva la fecha y hora de la última comprobación correcta.
- `skipped_version` conserva la versión que se ha omitido.

Selecciona `Skip This Version` para cerrar la ventana y guardar la versión mostrada como omitida. Las comprobaciones semanales no vuelven a mostrar esa versión, pero una versión posterior puede activar una nueva notificación.

Las operaciones de configuración conservan `skipped_version` y `last_update_check`, por lo que volver a aplicar la configuración no restablece este estado.

## Instalar una actualización

### macOS

En macOS, Adder busca un instalador `.pkg` que coincida con la arquitectura del equipo.

1. Selecciona `Install and Relaunch` en `Software Update`.
2. Espera a que Adder descargue el paquete y verifique su digest SHA-256.
3. Permite que Adder abra el instalador cuando finalice la verificación.
4. Selecciona `Quit & Install` para cerrar Adder y permitir que la instalación termine; después, Adder puede volver a iniciarse.

Adder no instala un paquete de otra arquitectura. Si la versión no incluye un `.pkg` para la arquitectura del equipo, la ventana no ofrece un instalador alternativo y muestra `Open Release Page` para consultar las plataformas disponibles.

### Windows

En Windows, Adder busca un instalador `.msi` que coincida con la arquitectura del equipo.

1. Selecciona `Install and Relaunch` en `Software Update`.
2. Espera a que Adder descargue el instalador y verifique su digest SHA-256.
3. Permite que Adder abra el instalador de Windows cuando finalice la verificación.
4. Selecciona `Quit & Install` para cerrar Adder y permitir que la instalación termine; después, Adder puede volver a iniciarse.

Adder no instala un paquete de otra arquitectura. Si la versión no incluye un `.msi` para la arquitectura del equipo, la ventana no ofrece un instalador alternativo y muestra `Open Release Page` para consultar las plataformas disponibles.

### Verificación del instalador

Adder solo inicia un instalador si la versión publicada incluye un digest SHA-256 válido y el archivo descargado coincide con ese digest. Un digest ausente, no válido o que no coincida con el archivo descargado impide la instalación y evita que Adder abra el instalador.

### Linux y FreeBSD

Adder no instala automáticamente las actualizaciones en Linux ni FreeBSD. Cuando hay una versión nueva, selecciona `Open Release Page` para abrir la página de versiones y descarga allí el paquete correspondiente. Completa la instalación mediante el procedimiento de la plataforma.

Durante una comprobación, Adder no sustituye un instalador que falte por otro de una arquitectura distinta. Si macOS o Windows no tienen un paquete compatible, utiliza `Open Release Page` para revisar las plataformas compatibles.

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>