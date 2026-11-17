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

El paquete incluye la aplicación de bandeja y la CLI `adder` dentro de `Adder.app`. Para actualizar Adder, utiliza el paquete macOS `.pkg` en lugar del artefacto anterior de aplicación independiente.

De forma opcional, el instalador puede crear `/usr/local/bin/adder` como enlace simbólico a la CLI incluida. Solo lo crea si no existe o si ya apunta a la CLI incluida; no reemplaza otro comando que no esté relacionado.

## Compilaciones locales

El comando para crear una compilación local con notificaciones funcionando es:

```sh
make pkg-macos-adhoc
```

Este objetivo establece `ADHOC=1` y firma la aplicación de forma ad hoc. El instalador deja el paquete `.pkg` sin firmar, por lo que Gatekeeper no lo acepta. Si la compilación no tiene credenciales de firma de lanzamiento, también omite la firma y la notarización y muestra advertencias.

## Abrir Adder

- Abre `Adder` desde `/Applications`.
- O ejecuta `open /Applications/Adder.app` en Terminal.

## Configurar el inicio y la actividad en segundo plano

Durante la configuración de Adder Tray, activa la casilla `Start Adder automatically on login / reboot` para iniciar Adder automáticamente al iniciar sesión o reiniciar macOS. El estado de actividad en segundo plano indica si Adder está registrado y en ejecución.

Selecciona `Open Login Items Settings...` para abrir los ajustes correspondientes de macOS. También es posible consultar este estado en **System Settings > General > Login Items & Extensions**, en las secciones **Open at Login** y **App Background Activity**. Esta configuración sincroniza el inicio automático de Adder Tray con el elemento de inicio de sesión y el agente de lanzamiento de macOS.

## Editar las reglas de notificación

En el menú de Adder Tray, selecciona `Notification Rules...` para editar los destinos de `Wallets`, `DReps`, `Pools`, `Assets` y `Policies`, así como las categorías de notificación de cada destino.

- Activa o desactiva las categorías de notificación según las necesidades de cada destino.
- Selecciona `Monitor Everything` para supervisar todo en lugar de configurar destinos individuales. Esta opción excluye los destinos específicos.
- Selecciona `Apply` para guardar los cambios y actualizar inmediatamente las reglas y los límites de frecuencia de las notificaciones. No es necesario reiniciar el proceso de Adder Tray.
- Al eliminar un destino, confirma la eliminación cuando el editor lo solicite.

Si aparece una advertencia de reconexión después de aplicar los cambios, el editor permanece disponible y vuelve a habilitar sus controles. Selecciona `Apply` para volver a intentarlo.

## Consultar la versión

En el menú de Adder Tray, selecciona `About` para abrir el diálogo integrado de información. El diálogo muestra `Version: <version> (commit: <hash>)` cuando hay un hash de commit disponible; de lo contrario, muestra únicamente `Version: <version>`.



---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
