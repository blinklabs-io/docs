---
title: Uso en Mac
description: Cómo usar Adder en Mac.
---

# Usar en Mac

Adder se distribuye como un paquete macOS `.pkg` firmado y notarizado.

## Requisitos previos

- Descarga el recurso de versión que corresponda a la arquitectura del Mac: `darwin-arm64` para `arm64` o `darwin-amd64` para `amd64`.
- Usa macOS 11.0 o una versión posterior.

## Instalar Adder

1. Abre la página de versiones de Adder y descarga el paquete macOS `.pkg`.
2. Haz doble clic en el archivo `.pkg` y sigue las indicaciones del instalador.
3. El instalador coloca `Adder.app` en `/Applications`.
4. El paquete instala la interfaz gráfica de bandeja y la CLI dentro de `Adder.app`.

## Abrir Adder

- Abre `Adder` desde `/Applications`.
- O ejecuta `open /Applications/Adder.app` en Terminal.

## Usar la CLI

Después de la instalación, el instalador intenta crear el enlace simbólico `/usr/local/bin/adder` hacia la CLI incluida en `Adder.app`. Cuando el enlace está disponible, ejecuta la CLI con un comando como:

```bash
adder --help
```

El instalador realiza este paso como una operación de mejor esfuerzo: si `/usr/local` es de solo lectura o está restringido, puede omitir el enlace sin impedir la instalación. Si ya existe un `/usr/local/bin/adder` que pertenece a otra herramienta, el instalador lo deja intacto. En esos casos, ejecuta directamente `/Applications/Adder.app/Contents/MacOS/adder`.

## Paquetes locales

Cuando un paquete macOS local necesita solicitar autorización para las notificaciones, usa `ADHOC=1` al construirlo:

```bash
ADHOC=1 ./packaging/macos/build-pkg.sh
```

La opción firma la aplicación local de forma ad hoc, pero el `.pkg` resultante sigue sin firma y no se espera que Gatekeeper lo acepte. El paquete local no sustituye al paquete `.pkg` firmado y notarizado de las versiones publicadas.

