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

Cuando la opción está activa, Adder realiza una comprobación cuando han transcurrido siete días desde la última comprobación correcta. Si hay una versión nueva que no se ha omitido, Adder abre `Software Update` automáticamente. Si la opción está desactivada, Adder no realiza comprobaciones semanales.

### Estado guardado

Adder guarda el estado de las actualizaciones en `adder-tray.yaml`:

- `check_updates_weekly` conserva la preferencia de comprobación semanal.
- `last_update_check` conserva la fecha y hora de la última comprobación correcta.
- `skipped_version` conserva la versión seleccionada para omitirla.

Selecciona `Skip This Version` para cerrar la ventana; Adder guarda la versión mostrada como omitida. Las comprobaciones semanales no vuelven a mostrar esa versión, pero una versión posterior puede activar una nueva notificación.

Al volver a aplicar la configuración, Adder conserva `skipped_version` y `last_update_check`, por lo que este estado no se restablece.

## Instalar una actualización

### macOS y Windows

Adder busca un instalador `.pkg` en macOS y un instalador `.msi` en Windows. En ambos casos, Adder selecciona únicamente el archivo que coincide con la arquitectura del equipo.

1. Selecciona `Install and Relaunch` en `Software Update`.
2. Espera a que Adder descargue el archivo y verifique su suma de comprobación SHA-256.
3. Permite que Adder abra el instalador cuando finalice la verificación.
4. Selecciona `Quit & Install` para cerrar Adder y permitir que la instalación termine; después, Adder puede volver a iniciarse.

En macOS, Adder no instala un `.pkg` de otra arquitectura. En Windows, Adder no instala un `.msi` de otra arquitectura.

### Verificación del instalador

Adder solo abre un instalador si la versión publicada incluye una suma de comprobación SHA-256 válida y el archivo descargado coincide con esa suma. Una suma ausente, no válida o diferente impide la instalación y evita que Adder abra el instalador.

Si macOS o Windows no tienen un instalador para la arquitectura del equipo, Adder no ofrece un archivo de sustitución y muestra `Open Release Page` para consultar las plataformas disponibles.

### Linux y FreeBSD

En Linux y FreeBSD, Adder no instala automáticamente las actualizaciones. Cuando hay una versión nueva, selecciona `Open Release Page` para abrir la página de versiones y descarga allí el paquete correspondiente. Completa la instalación mediante el procedimiento de la plataforma.

Adder no utiliza un paquete de sustitución de otra arquitectura si falta el paquete compatible.

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>