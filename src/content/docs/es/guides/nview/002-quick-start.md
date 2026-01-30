---
title: Guia de Inicio Rapido
description: Resumen de Inicio Rapido de nview.
---

# Inicio Rapido

nview es una herramienta de monitoreo local para un Nodo Cardano (cardano-node) disenada para complementar las herramientas de monitoreo remoto proporcionando una vista local de un nodo en ejecucion desde la linea de comandos. Es una TUI (interfaz de usuario de terminal) disenada para adaptarse a la mayoria de las pantallas.

Simplemente descarga el archivo binario de nview desde blinklabs.io en tu servidor de nodo. Luego ejecuta nview en la linea de comandos del servidor. Es asi de simple de usar y obtendras monitoreo de inmediato!

Para comenzar, sigue los pasos a continuacion

***


## Paso 1 - Descargar el binario desde Blinklabs
<br>

**Paso 1-A** - Primero comienza yendo a <a href="https://blinklabs.io/projects-open-source" target="_blank">https://blinklabs.io/projects-open-source</a> y desplazate hacia abajo hasta nview.

![nview-blinklabs-site](/nview-blinklabs-site.png)
<br>

**Paso 1-B** - Selecciona el sistema operativo de tu servidor de nodo.

![nview-blinklabs-site-operating-system](/nview-blinklabs-site-operating-system.png)
<br>

**Paso 1-C** - Puedes descargar el archivo binario y mover el archivo a tu servidor de nodo o...

![nview-blinklabs-site-download](/nview-blinklabs-site-download.png)

<br>

Copia la ruta desde Blinklabs y ejecuta el siguiente comando para descargar el archivo binario en tu servidor de nodo

![nview-blinklabs-site-copy-link](/nview-blinklabs-site-copy-link.png)
<br>

Ajusta la ruta del enlace a la ruta correcta para la version que deseas descargar.

> Consejo: Puedes descargar la ultima version de nview desde la pagina <a href="https://github.com/blinklabs-io/nview/releases" target="_blank">https://github.com/blinklabs-io/nview/releases</a>.

```
wget -O - https://github.com/blinklabs-io/nview/releases/download/v0.10.7/nview-v0.10.7-linux-amd64 > nview
```

***


## Paso 2 - Cambiar Permisos

Para este ejemplo, nombramos el archivo binario `nview` y guardamos el archivo en nuestra carpeta `$NODE_HOME`. Para hacer el archivo ejecutable, ejecuta el siguiente comando:

Ajusta la ruta del archivo y el nombre del archivo si es necesario.

```
chmod +x $NODE_HOME/nview
```


***


## Paso 3 - Ejecutar nview

Ejecuta el archivo ejecutable con el siguiente comando.

Para este ejemplo, nombramos el archivo binario `nview` y guardamos el archivo en nuestra carpeta `$NODE_HOME`.

```
cd $NODE_HOME
./nview
```

![nview-screen](/nview-screen.png)

***


### Felicidades, estas listo para comenzar a monitorear tu nodo usando nview!

Ejecutar nview contra un Nodo Cardano en ejecucion funcionara de inmediato con una configuracion predeterminada de Nodo Cardano. Sin embargo, si necesitas hacer cambios, puedes ejecutar nview con un archivo de configuracion.

Quieres ajustar el archivo de configuracion de nview? Consulta nuestra guia de como usar un [archivo de configuracion](../003-using-config-file) para nview.
