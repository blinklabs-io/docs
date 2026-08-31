---
title: Uso en Mac
description: Cómo usar Adder en Mac.
---

# Usar en Mac

Adder se distribuye como un paquete macOS `.pkg` firmado y notarizado.

## Requisitos previos

- Descarga el archivo de la versión que corresponda a la arquitectura del Mac: `darwin-arm64` para `arm64` o `darwin-amd64` para `amd64`.
- Usa macOS 11.0 o una versión posterior.

## Instalar Adder

1. Abre la página de versiones de Adder y descarga el paquete macOS `.pkg`.
2. Haz doble clic en el archivo `.pkg` y sigue las indicaciones del instalador.
3. El instalador coloca `Adder.app` en `/Applications`.
4. El paquete instala la interfaz gráfica de la bandeja y la CLI dentro de `Adder.app`.

## Abrir Adder

- Abre `Adder` desde `/Applications`.
- O ejecuta `open /Applications/Adder.app` en Terminal.

## Usar la CLI

Tras la instalación, el comando `adder` suele estar disponible mediante el enlace simbólico `/usr/local/bin/adder`, que apunta a la CLI incluida en `Adder.app`. Ejecuta la CLI con un comando como:

```bash
adder --help
```

El instalador no detiene la instalación si no puede crear el enlace, por ejemplo, cuando `/usr/local` es de solo lectura o está restringido. Si ya existe un `/usr/local/bin/adder` que pertenece a otra herramienta, el instalador lo deja intacto. En cualquiera de esos casos, ejecuta directamente la CLI:

```bash
/Applications/Adder.app/Contents/MacOS/adder --help
```

## Paquetes locales

Cuando un paquete macOS local necesita solicitar autorización para las notificaciones, usa `ADHOC=1` al construirlo:

```bash
ADHOC=1 ./packaging/macos/build-pkg.sh
```

La opción firma la aplicación local de forma ad hoc, pero el `.pkg` resultante sigue sin firma y Gatekeeper puede rechazarlo. El paquete local no sustituye al paquete `.pkg` firmado y notarizado de las versiones publicadas.



---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
