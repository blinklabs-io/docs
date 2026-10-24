---
title: Monitorizar los nodos Dingo con nview
description: Guía para SPO de pools Dingo - Cómo monitorizar los nodos con nview.
---

nview es una herramienta de monitorización local para nodos Cardano que complementa las herramientas remotas con una vista del nodo desde la línea de comandos. Su interfaz de terminal (TUI) está diseñada para adaptarse a la mayoría de las pantallas.

Descarga el binario `nview` desde blinklabs.io al servidor del nodo y ejecútalo desde la línea de comandos. La monitorización funciona directamente con la configuración predeterminada.

## Paso 1 - Descargar el binario nview de Blink Labs

Copia la URL de descarga desde la página de versiones de Blink Labs en GitHub y ejecuta el siguiente comando en el servidor del nodo.

⚠️ Ajusta la URL a la versión y la arquitectura que quieras descargar.

💡 La última versión de nview está en [GitHub](https://github.com/blinklabs-io/nview/releases).

```
cd ~/dingo
wget -O - https://github.com/blinklabs-io/nview/releases/download/v0.15.0/nview-v0.15.0-linux-amd64 > nview
```

## Paso 2 - Cambiar los permisos

Este ejemplo llama `nview` al binario y lo guarda en `$DINGO_HOME`. Dale permisos de ejecución:

⚠️ Ajusta la ruta y el nombre del archivo si es necesario.

```
chmod +x $DINGO_HOME/nview
```

## Paso 3 - Ejecutar nview

Ejecuta `nview`. En este ejemplo, el binario se encuentra en `$DINGO_HOME`:

```
cd $DINGO_HOME
./nview
```

### ¡Enhorabuena! Ya puedes monitorizar el nodo Dingo con nview.

nview funciona directamente con la configuración predeterminada de Dingo. Si necesitas modificar los ajustes, puedes utilizar un archivo de configuración.

Para personalizarlo, consulta la guía del [archivo de configuración de nview](../../../nview/003-using-config-file).
