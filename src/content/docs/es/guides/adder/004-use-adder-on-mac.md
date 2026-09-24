---
title: Uso en Mac
description: Cómo usar Adder en Mac.
---

# Usar en Mac

Adder distribuye un paquete macOS `.pkg` con firma y notarización para cada arquitectura compatible.

## Instalar Adder

1. Abre la página de versiones de Adder y descarga el paquete macOS `.pkg` que corresponda a la arquitectura del Mac: `arm64` para Apple Silicon o `amd64` para Mac Intel.
2. Haz doble clic en el archivo `.pkg` y sigue las indicaciones del instalador.
3. El instalador coloca `Adder.app` en `/Applications`. La aplicación incluye la interfaz gráfica `adder-tray` y la herramienta de línea de comandos `adder`.
4. Ejecuta `adder` desde Terminal cuando el instalador cree el enlace de conveniencia normal `/usr/local/bin/adder`. Si el instalador no puede crear ese enlace, ejecuta `/Applications/Adder.app/Contents/MacOS/adder`. El instalador no reemplaza un enlace existente y no relacionado en `/usr/local/bin/adder`.

## Abrir Adder

- Abre `Adder` desde `/Applications`.
- O ejecuta `open /Applications/Adder.app` en Terminal.

El asistente de primera ejecución de la bandeja gestiona el inicio y el registro al iniciar sesión. El paquete no configura estas opciones.

### Configurar el inicio en macOS

1. En el asistente de la bandeja, selecciona `Start Adder automatically on login / reboot` para activar el inicio automático, o desactívala para impedirlo.
2. Comprueba el estado de actividad en segundo plano que muestra el asistente. El estado indica si el servicio de macOS está registrado o en ejecución.
3. Selecciona `Open Login Items Settings...` para abrir `Configuración del Sistema > General > Elementos de inicio y extensiones > Abrir al iniciar sesión / Actividad de las apps en segundo plano`.

El asistente aplica la opción de inicio y mantiene sincronizados el agente de lanzamiento de macOS y el elemento de inicio de sesión.

### Consultar los metadatos de About

Abre `About Adder` desde el menú de la bandeja para consultar la versión en ejecución. El diálogo también muestra el identificador del commit cuando la compilación lo incluye. Si no hay una versión disponible, el diálogo muestra `devel`.

## Crear un paquete macOS local

Los desarrolladores pueden crear el paquete estándar localmente:

```bash
make pkg-macos
```

Define `ARCH` para seleccionar la arquitectura del paquete:

```bash
ARCH=arm64 make pkg-macos
ARCH=amd64 make pkg-macos
```

Para realizar pruebas locales, usa el destino con firma ad hoc, que firma la aplicación y habilita las notificaciones:

```bash
make pkg-macos-adhoc
ARCH=arm64 make pkg-macos-adhoc
ARCH=amd64 make pkg-macos-adhoc
```

Los paquetes de lanzamiento usan firma, notarización y un comprobante de notarización cuando las credenciales están disponibles. El destino `pkg-macos-adhoc` establece `ADHOC=1`, firma la aplicación para las notificaciones locales, pero deja el `.pkg` sin firma y sin notarización. Gatekeeper puede rechazar los paquetes locales sin firma y con firma ad hoc.

Para crear un paquete de aplicación local con metadatos explícitos de versión y commit, pasa `VERSION` y `COMMIT_HASH` al destino `bundle-macos`:

```bash
VERSION=1.2.3 COMMIT_HASH=abc1234 make bundle-macos
```

El script de creación del paquete pasa `VERSION` a las compilaciones de `adder` y `adder-tray` y almacena el valor original en los metadatos `AdderGitVersion` del paquete. Los programas resultantes usan `VERSION` y `COMMIT_HASH`, por lo que el diálogo About puede mostrar los valores seleccionados.

## Desinstalar desde un checkout del código fuente

Ejecuta el script de desinstalación desde el checkout del código fuente de Adder:

```bash
./scripts/bundle-macos-uninstall.sh
```

El script detiene los procesos de Adder, elimina Adder de los elementos de inicio de sesión, descarga y elimina el agente de lanzamiento, elimina los paquetes de aplicación de Adder y limpia los artefactos de compilación locales. De forma predeterminada, conserva la configuración y los registros.

Para eliminar también la configuración y los registros, usa `--purge`, `--all` o `-a`:

```bash
./scripts/bundle-macos-uninstall.sh --purge
```

Este procedimiento desde el checkout también elimina el estado del elemento de inicio de sesión y del agente de lanzamiento; quitar manualmente un paquete instalado no ejecuta esa limpieza. El script no elimina el enlace de conveniencia `/usr/local/bin/adder`. El instalador crea ese enlace cuando puede y no reemplaza un enlace existente y no relacionado, por lo que el enlace debe gestionarse por separado cuando apunta a una instalación de Adder que ya no existe.


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
