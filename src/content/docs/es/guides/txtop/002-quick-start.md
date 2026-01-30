---
title: Guia de Inicio Rapido
description: Resumen de Inicio Rapido de TxTop.
---

# Inicio Rapido

TxTop es un inspector de mempool para el software Cardano Node.

Puedes usar TxTop como una herramienta de monitoreo local para un Cardano Node (cardano-node) destinada a proporcionar una vista local de las transacciones del mempool de un nodo en ejecucion con una leyenda de iconos simple para la categorizacion de transacciones de un vistazo.

Simplemente descarga el archivo binario de TxTop desde blinklabs.io en tu servidor de nodo. Luego ejecuta TxTop en la linea de comandos del servidor. Es asi de simple de usar y te da la capacidad de inspeccionar el mempool de tu Cardano Node con iconos simples de un vistazo!

Para comenzar sigue los pasos a continuacion

***

## Paso 1 - Descargar el binario desde Blinklabs
<br>

**Paso 1-A** - Primero comienza yendo a <a href="https://blinklabs.io/projects-open-source" target="_blank">https://blinklabs.io/projects-open-source</a> y desplazate hacia abajo hasta TxTop.

![txtop-blinklabs-site](/txtop-blinklabs-site.png)
<br>

**Paso 1-B** - Selecciona el sistema operativo de tu servidor de nodo.

![txtop-blinklabs-site-operating-system](/txtop-blinklabs-site-operating-system.png)
<br>

**Paso 1-C** - Puedes descargar el archivo binario y mover el archivo a tu servidor de nodo o...

![txtop-blinklabs-site-download](/txtop-blinklabs-site-download.png)

<br>

Copia la ruta desde Blinklabs y ejecuta el siguiente comando para descargar el archivo binario en tu servidor de nodo

![txtop-blinklabs-site-copy-link](/txtop-blinklabs-site-copy-link.png)
<br>

⚠️ Ajusta la ruta del enlace a la ruta correcta para la version que deseas descargar.

> 💡 Consejo: Puedes descargar la ultima version de TxTop desde la pagina <a href="https://github.com/blinklabs-io/txtop/releases" target="_blank">https://github.com/blinklabs-io/txtop/releases</a>.

```
wget -O - https://github.com/blinklabs-io/txtop/releases/download/v0.13.0/txtop-v0.13.0-linux-amd64 > txtop
```

***

## Paso 2 - Cambiar Permisos

Para este ejemplo, nombramos el archivo binario `txtop` y guardamos el archivo en nuestra carpeta `$NODE_HOME`. Para hacer el archivo ejecutable ejecuta el siguiente comando:

⚠️ Ajusta la ruta del archivo y el nombre del archivo si es necesario.

```
chmod +x $NODE_HOME/txtop
```

***

## Paso 3 - Ejecutar txtop

Ejecuta el archivo ejecutable ejecutando el siguiente comando.

⚠️ Para este ejemplo, nombramos el archivo binario `txtop` y guardamos el archivo en nuestra carpeta `$NODE_HOME`.

```
cd $NODE_HOME
./txtop
```

![txtop-screen](/txtop-screen.png)

***

### Felicitaciones, estas listo para comenzar a inspeccionar las transacciones de tu mempool con TxTop!

<br>

#### 💡 Consejo: TxTop se conecta al nodo Cardano usando el socket.
Un usuario puede establecer estas variables en su sistema a traves de sus variables de entorno para modificar el comportamiento.

- `NETWORK`, `CARDANO_NETWORK` - estas establecen el nombre de la red, si ambas estan dadas, NETWORK "gana" para que funcione de inmediato en un contenedor `cardano-node`, por defecto mainnet
- `CARDANO_NODE_NETWORK_MAGIC` - (opcional) Configurar manualmente la magia de red
- `CARDANO_NODE_SOCKET_PATH` - Establece la ruta al socket UNIX del nodo, por defecto
    /opt/cardano/ipc/socket a menos que NETWORK este establecido, entonces usa /ipc/node.socket
- `CARDANO_NODE_SOCKET_TCP_HOST` - Establece el host TCP para comunicacion NtC
    (socat), por defecto vacio
- `CARDANO_NODE_SOCKET_TCP_PORT` - Establece el puerto TCP para comunicacion NtC
    (socat), por defecto 30001
