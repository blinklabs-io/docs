---
title: Billetera con nodo completo
description: Instala, configura, compila y soluciona problemas de la billetera con nodo completo de Bursa.
---

# Billetera con nodo completo de Bursa

Esta guía cubre la instalación, los modos de ejecución, la configuración, la compilación desde el código fuente, los paquetes macOS y la resolución de problemas de la billetera con nodo completo de Bursa.

## Instalar

Descarga el archivo correspondiente a tu plataforma desde las [versiones de Bursa](https://github.com/blinklabs-io/bursa/releases). Los archivos publicados siguen este patrón de nombres:

```text
bursa-wallet-<version>-<os>-<arch>.<ext>
```

| Plataforma | Archivo | Instalación |
| --- | --- | --- |
| macOS arm64 (Apple Silicon) | `.pkg` | Apple firma y notariza el instalador, que instala `Bursa.app`. |
| Windows amd64 o arm64 | `.msi` | Windows firma el instalador. |
| Linux amd64 o arm64 | `.tar.gz` | Extrae el archivo para ejecutar la versión con ventana nativa. |
| FreeBSD amd64 o arm64 | `.tar.gz` | Extrae el archivo y ejecuta la versión sin ventana nativa en el navegador. FreeBSD no proporciona una versión con ventana nativa. |

En Linux o FreeBSD, extrae el archivo y ejecuta el programa `bursa-wallet` incluido:

```bash
tar xzf bursa-wallet-<version>-<os>-<arch>.tar.gz
./bursa-wallet
```

## Ejecutar la billetera

Después de instalar el paquete macOS o Windows, abre `Bursa` desde el menú de aplicaciones, o ejecuta directamente el programa:

```bash
bursa-wallet
```

La versión de escritorio abre una ventana nativa. La versión sin ventana nativa sirve la interfaz en <http://127.0.0.1:8090>; abre esa dirección en el navegador. La billetera escucha en loopback, en `127.0.0.1:8090`.

La primera ejecución sincroniza el nodo integrado. El modo predeterminado `mithril` arranca desde una instantánea de Mithril en lugar de reproducir la cadena desde la génesis. La billetera conserva sus datos bajo `~/.bursa-wallet/<network>/`.

## Configuración

Establece las variables de entorno antes de la primera ejecución para inicializar la configuración:

| Variable | Valor predeterminado | Efecto |
| --- | --- | --- |
| `BURSA_NETWORK` | `preview` | Selecciona la red Cardano y su directorio de datos. |
| `BURSA_SYNC` | `mithril` | El valor `genesis` reproduce la cadena desde el principio en lugar de arrancar desde una instantánea de Mithril. |
| `BURSA_LEAN` | `false` | Activa el almacenamiento reducido, que poda los datos históricos de la cadena para ahorrar disco. |
| `BURSA_CONNECTOR` | `false` | Activa el backend del conector de dApps. |

La billetera conserva los ajustes configurados mediante su interfaz tras la primera ejecución. Cuando un ajuste ya está almacenado, tiene prioridad sobre la variable de entorno.

## Compilar desde el código fuente

Instala Go `1.26` o posterior y Node `22`. Ejecuta los comandos desde la raíz del repositorio.

### Compilar la billetera sin ventana nativa

Compila los recursos web y el binario predeterminado en Go puro:

```bash
make wallet
```

El comando escribe el binario en `ui/bursa-wallet`. Esta versión sirve la interfaz por loopback y admite compilación cruzada.

### Compilar la billetera con ventana nativa

Compila la versión con ventana nativa:

```bash
make wallet-webview
```

Este objetivo requiere CGO, herramientas de compilación C y las cabeceras de desarrollo de webview de la plataforma:

- macOS: `WKWebView`.
- Windows: `WebView2`.
- Linux: cabeceras de desarrollo `webkit2gtk` para compilar y `libayatana-appindicator3` para ejecutar. Una compilación con la etiqueta `webview` necesita ambas para funcionar con soporte de bandeja.

La versión webview no admite compilación para otra arquitectura. Compílala en una máquina con la arquitectura de destino. En Linux puede utilizar `webkit2gtk-4.1`; el Makefile proporciona una adaptación de `pkg-config` cuando el enlace del proyecto original solicita `4.0`.

### Crear un paquete macOS

Crea un paquete para pruebas locales:

```bash
make bundle-macos
```

Este objetivo genera un `.pkg` con firma ad hoc. Para generar el paquete de publicación firmado y notarizado:

```bash
make pkg-macos
```

El objetivo `pkg-macos` requiere los secretos de firma y notarización de Apple.

## Resolución de problemas

### La sincronización es lenta o parece detenida

1. Abre **Settings → Diagnostics** para comprobar el estado del nodo, los pares y la sincronización.
2. Exporta los registros de diagnóstico o consulta directamente `~/.bursa-wallet/<network>/logs/bursa-wallet.log`.

### La ventana webview de Linux está vacía

Instala `webkit2gtk` y sus cabeceras de desarrollo para la versión webview. Instala también `libayatana-appindicator3` antes de ejecutar una compilación con la etiqueta `webview`. Si el sistema no dispone de webview, utiliza la versión de navegador en Go puro y abre la dirección de loopback.

### La billetera ocupa demasiado disco

Activa el almacenamiento reducido en la primera ejecución:

```bash
BURSA_LEAN=true bursa-wallet
```

Este modo hace caducar los datos históricos de la cadena y reduce el espacio ocupado en disco.

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
