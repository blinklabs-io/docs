---
title: Uso en Mac
description: Cómo usar Adder en Mac.
---

# Usar en Mac

Adder se distribuye como un paquete macOS `.pkg` firmado y notarizado.

## Instalar Adder

1. Abre la página de versiones de Adder y descarga el paquete macOS `.pkg`.
2. Haz doble clic en el archivo `.pkg` y sigue las indicaciones del instalador.
3. El instalador coloca `Adder.app` en `/Applications`.

El paquete incluye la aplicación de bandeja y la CLI `adder` dentro de `Adder.app`. Para actualizar Adder, utiliza el paquete macOS `.pkg` en lugar del artefacto anterior orientado únicamente a la aplicación.

Como comodidad opcional, el instalador puede crear `/usr/local/bin/adder` como enlace simbólico a la CLI incluida. Solo lo crea si no existe o si ya apunta a la CLI incluida; no reemplaza otro comando que no esté relacionado.

## Compilaciones locales

Para crear una compilación local con notificaciones funcionando, ejecuta:

```sh
make pkg-macos-adhoc
```

Este objetivo usa `ADHOC=1` para firmar la aplicación de forma ad hoc. El paquete `.pkg` no está firmado y no se espera que Gatekeeper lo acepte. Si la compilación no tiene credenciales de firma de lanzamiento, también omite la firma y la notarización y muestra advertencias.

## Abrir Adder

- Abre `Adder` desde `/Applications`.
- O ejecuta `open /Applications/Adder.app` en Terminal.



---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
