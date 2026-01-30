---
title: Guia de Inicio Rapido
description: Resumen de Inicio Rapido de Cardano Node API.
---

# Inicio Rapido

Una API HTTP para interactuar con un Nodo Cardano local y proporcionar los datos internos del nodo a clientes HTTP. Este servicio se comunica con un nodo completo de Cardano utilizando el protocolo de red Ouroboros a traves de un socket UNIX y expone los mini-protocolos Ouroboros subyacentes de Nodo-a-Cliente (NtC) a los clientes mediante una API REST o una API gRPC UTxO RPC.

<br>

Cardano Node API es un servicio escrito en Go que se comunica con un Nodo Cardano a traves de su interfaz privada y proporciona un conjunto completo de APIs HTTP basadas en estandares colaborativos.

<br>

Simplemente descarga el archivo binario de Cardano Node API desde blinklabs.io en el servidor de tu nodo. Luego ejecuta Cardano Node API en la linea de comandos del servidor. La configuracion se puede realizar mediante un archivo de configuracion o estableciendo variables de entorno. En este ejemplo lo ejecutaremos con un archivo de configuracion.

<br>

Para comenzar, sigue los pasos a continuacion

<br>

Esta guia asume una configuracion tipica de Nodo Cardano en Linux. Por favor ajusta los comandos y rutas segun sea necesario.

***

<br>

## Paso 1 - Descargar el binario desde Blinklabs
<br>

**Paso 1-A** - Primero ve a <a href="https://blinklabs.io/projects-open-source" target="_blank">https://blinklabs.io/projects-open-source</a> y desplazate hacia abajo hasta Cardano Node API.

![cardano-node-api-blinklabs-site](/cardano-node-api-blinklabs-site.png)
<br>

**Paso 1-B** - Selecciona el sistema operativo de tu servidor de nodo.

![cardano-node-api-blinklabs-site-operating-system](/cardano-node-api-blinklabs-site-operating-system.png)
<br>

**Paso 1-C** - Puedes descargar el archivo binario y mover el archivo a tu servidor de nodo o...

![cardano-node-api-blinklabs-site-download](/cardano-node-api-blinklabs-site-download.png)

<br>

Copia la ruta desde Blinklabs y ejecuta el siguiente comando para descargar el archivo binario en tu servidor de nodo

![cardano-node-api-blinklabs-site-copy-link](/cardano-node-api-blinklabs-site-copy-link.png)

<br>

Ajusta la ruta del enlace a la ruta correcta para la version que deseas descargar.

> Consejo: Puedes descargar la ultima version de Cardano Node API desde la pagina <a href="https://github.com/blinklabs-io/cardano-node-api/releases" target="_blank">https://github.com/blinklabs-io/cardano-node-api/releases</a>.

```
wget -O - https://github.com/blinklabs-io/cardano-node-api/releases/download/v0.9.0/cardano-node-api-v0.9.0-linux-amd64 > cardano-node-api
```

***

<br>

## Paso 2 - Cambiar Permisos

<br>

Para este ejemplo, nombramos el archivo binario `cardano-node-api` y guardamos el archivo en nuestra carpeta `$NODE_HOME`. Para hacer el archivo ejecutable, ejecuta el siguiente comando:

<br>

Ajusta la ruta del archivo y el nombre del archivo si es necesario.

```
chmod +x $NODE_HOME/cardano-node-api
```

***

<br>

## Paso 3 - Abrir el Firewall en el Puerto Seleccionado

<br>

Asegurate de que tu firewall este abierto en el puerto que seleccionaste. Para este ejemplo, usamos el puerto 8080. Para abrir el puerto 8080 ejecutamos el siguiente comando:

```
sudo ufw allow 8080/tcp
```

***

<br>

## Paso 4 - Configurar el Archivo de Configuracion

<br>

Ejemplo de config.yaml:

```
node:
  network: mainnet
  port: 8080
  socketPath: /home/user/cardano-my-node/db/socket
```

<br>

***

Consejo: Para encontrar la ruta a tu socket del nodo, ejecuta el siguiente comando:

```
echo $CARDANO_NODE_SOCKET_PATH
```

<br>

Un desglose detallado del archivo de configuracion se puede encontrar aqui: [https://github.com/blinklabs-io/cardano-node-api/blob/main/config.yaml.example](https://github.com/blinklabs-io/cardano-node-api/blob/main/config.yaml.example)


***

<br>

## Paso 5 - Ejecutar Cardano Node API Con el Archivo de Configuracion

<br>

Ejecuta el archivo ejecutable con la bandera de linea de comandos `-config` para establecer el archivo a cargar como configuracion.

Ajusta la ruta del archivo a continuacion para que coincida con tu ruta al archivo `config.yaml`.

```
cd $NODE_HOME
./cardano-node-api -config /path/to/config.yaml
```

<br>

Consejo: Puedes presionar `control`+`z` y luego escribir `bg` para ejecutar en segundo plano. Presiona `fg` para traer de vuelta al primer plano.

***

<br>


Consejo: Puedes verificar Cardano Node API yendo a tu IP:puerto/swagger/index.html. Por favor ajusta la IP y tu puerto si es necesario.

```
http://192.0.2.0:8080/swagger/index.html
```

<br>

![cardano-node-api-swagger](/cardano-node-api-swagger.png)

<br>

### Felicidades, estas listo para empezar a usar Cardano Node API!

<br>

Aprende mas sobre UTxO RPC [https://utxorpc.org](https://utxorpc.org/)


