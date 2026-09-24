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


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
