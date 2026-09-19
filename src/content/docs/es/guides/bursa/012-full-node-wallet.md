---
title: Monedero de nodo completo
description: Instalar, ejecutar, configurar y compilar el monedero de nodo completo de Bursa.
---

# Monedero de nodo completo de Bursa

Esta guía describe la instalación, ejecución, configuración, compilación y resolución de problemas del monedero de nodo completo de Bursa. El monedero incluye un nodo de Cardano y ofrece una interfaz de escritorio o una interfaz accesible desde el navegador.

## Instalación

Descargar un instalador o archivo de la [página de versiones de Bursa](https://github.com/blinklabs-io/bursa/releases). Los archivos siguen este patrón de nombres:

```text
bursa-wallet-<version>-<os>-<arch>.<ext>
```

| Plataforma | Archivo | Comportamiento |
| --- | --- | --- |
| macOS arm64 (Apple Silicon) | `.pkg` | Instalar `Bursa.app`. El paquete incluye firma y notarización. |
| Windows amd64 o arm64 | `.msi` | Instalar el monedero con un paquete que incluye firma. |
| Linux amd64 o arm64 | `.tar.gz` | Extraer el archivo para usar la ventana nativa. |
| FreeBSD amd64 o arm64 | `.tar.gz` | Extraer el archivo y abrir la interfaz desde un navegador. Este archivo no incluye la ventana nativa. |

En macOS, abrir el archivo `.pkg` y completar el instalador. En Windows, abrir el archivo `.msi` y completar el instalador. En Linux y FreeBSD, extraer el archivo y conceder permisos de ejecución al ejecutable `bursa-wallet`:

```bash
tar xzf bursa-wallet-<version>-<os>-<arch>.tar.gz
chmod +x bursa-wallet
```

## Ejecutar el monedero

Ejecutar el binario desde un terminal:

```bash
bursa-wallet
```

El archivo de escritorio abre una ventana nativa. El binario sin ventana sirve la misma interfaz en `http://127.0.0.1:8090`; abrir esa dirección en un navegador. El proceso solo escucha en la interfaz de loopback.

El primer inicio sincroniza el nodo. La configuración predeterminada usa una instantánea de Mithril para evitar reproducir la cadena desde el génesis. La pantalla de sincronización muestra el progreso mientras el nodo se pone al día.

## Configuración

Configurar las variables de entorno antes de ejecutar `bursa-wallet`:

| Variable | Valor predeterminado | Efecto operativo |
| --- | --- | --- |
| `BURSA_NETWORK` | `preview` | Seleccionar la red de Cardano y el directorio de datos correspondiente. |
| `BURSA_SYNC` | `mithril` | Usar una instantánea de Mithril para la sincronización. El valor `genesis` reproduce la cadena desde el inicio. |
| `BURSA_LEAN` | `false` | Usar el perfil de almacenamiento reducido, que elimina datos históricos de la cadena para reducir el espacio en disco. |
| `BURSA_CONNECTOR` | `false` | Activar el conector de aplicaciones descentralizadas. |

Por ejemplo, iniciar el monedero en `mainnet` con la sincronización predeterminada:

```bash
BURSA_NETWORK=mainnet bursa-wallet
```

El monedero sirve la interfaz en `127.0.0.1:8090`. El monedero guarda las opciones que también se modifican desde la interfaz después del primer inicio; a partir de entonces, el valor guardado tiene prioridad sobre la variable de entorno correspondiente.

## Compilar desde el código fuente

### Requisitos

- Go `1.26` o una versión posterior.
- Node `22`.
- Un árbol de código fuente de Bursa y `make`.

Ejecutar los comandos desde la raíz del repositorio.

### Compilar el binario sin ventana nativa

Ejecutar:

```bash
make wallet
```

Este destino compila el paquete web y genera `ui/bursa-wallet`, un binario puro de Go que sirve la interfaz mediante loopback. Este binario admite compilación cruzada y utiliza un navegador para mostrar la interfaz.

### Compilar el binario con ventana nativa

Ejecutar:

```bash
make wallet-webview
```

Esta variante requiere CGO, una cadena de herramientas de C y las cabeceras de desarrollo del webview del sistema. Usa `WKWebView` en macOS, `WebView2` en Windows y `webkit2gtk` en Linux. En Linux, una compilación con la etiqueta `webview` también requiere `libayatana-appindicator3` en tiempo de ejecución para ejecutarse con soporte de bandeja. Compilarla en una máquina de la arquitectura de destino: esta variante no admite compilación cruzada.

En Linux, instalar las cabeceras de desarrollo de `webkit2gtk` y disponer de `libayatana-appindicator3` en tiempo de ejecución antes de ejecutar el destino. Si el sistema solo ofrece `webkit2gtk-4.1`, el archivo Makefile crea la adaptación `pkg-config` necesaria para la dependencia que solicita `4.0`.

### Crear paquetes para macOS

Para realizar pruebas locales, ejecutar:

```bash
make bundle-macos
```

Este destino genera un paquete `.pkg` con firma ad hoc. Para generar el paquete de distribución, ejecutar:

```bash
make pkg-macos
```

Este destino aplica la firma y la notarización de Apple, y requiere los secretos de Apple.

## Solución de problemas

### La sincronización tarda demasiado o parece detenida

1. Abrir `Settings` → `Diagnostics` para consultar el estado del nodo, los pares y la sincronización.
2. Exportar los registros desde la pantalla de diagnóstico.
3. Si hace falta consultar el archivo directamente, abrir:

   ```text
   ~/.bursa-wallet/<network>/logs/bursa-wallet.log
   ```

### La ventana aparece en blanco en Linux

El binario con webview necesita `webkit2gtk` y sus cabeceras de desarrollo para mostrar la ventana. Además, `libayatana-appindicator3` debe estar instalada en tiempo de ejecución para que la compilación con la etiqueta `webview` se ejecute correctamente; esta dependencia no sustituye a `webkit2gtk` para resolver una ventana en blanco. Instalar ambas dependencias y volver a ejecutar `make wallet-webview`. Como alternativa, compilar el binario puro de Go y abrir `http://127.0.0.1:8090` en un navegador:

```bash
make wallet
bursa-wallet
```

### El monedero usa demasiado espacio en disco

Activar el almacenamiento reducido desde `Settings` o establecer `BURSA_LEAN=true` antes del primer inicio:

```bash
BURSA_LEAN=true bursa-wallet
```

El perfil reducido elimina datos históricos de la cadena para limitar el uso de disco.

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>