---
title: Guia de Inicio Rapido
description: Resumen de Inicio Rapido de Tx Submit API.
---

# Inicio Rapido

Tx Submit API es un servicio de API para envio de transacciones de Cardano escrito en Go que toma cargas de transacciones codificadas en CBOR a traves de HTTP y las convierte al mini-protocolo LocalTxSubmission de la Red Ouroboros mediante gOuroboros. Este proyecto fue financiado en Project Catalyst Fund 9.

Tx Submit API envia transacciones a traves de HTTP, lo que lo convierte en una opcion mas rapida para enviar transacciones a la blockchain de Cardano.

Simplemente descarga el archivo binario de Tx Submit API desde blinklabs.io en tu servidor de nodo. Luego ejecuta Tx Submit API en la linea de comandos del servidor. La configuracion se puede realizar usando un archivo de configuracion o estableciendo variables de entorno.

Para comenzar, sigue los pasos a continuacion.

Esta guia asume una configuracion tipica de Nodo Cardano en Linux. Por favor ajusta los comandos y rutas segun sea necesario.

***

## Paso 1 - Descargar el binario desde Blinklabs
<br>

**Paso 1-A** - Primero, ve a <a href="https://blinklabs.io/projects-open-source" target="_blank">https://blinklabs.io/projects-open-source</a> y desplazate hacia abajo hasta Tx Submit API.

![txsubmit-blinklabs-site](/txsubmit-blinklabs-site.png)
<br>

**Paso 1-B** - Selecciona el sistema operativo de tu servidor de nodo.

![txsubmit-blinklabs-site-operating-system](/txsubmit-blinklabs-site-operating-system.png)
<br>

**Paso 1-C** - Puedes descargar el archivo binario y mover el archivo a tu servidor de nodo o...

![txsubmit-blinklabs-site-download](/txsubmit-blinklabs-site-download.png)

<br>

Copia la ruta desde Blinklabs y ejecuta el siguiente comando para descargar el archivo binario en tu servidor de nodo.

![txsubmit-blinklabs-site-copy-link](/txsubmit-blinklabs-site-copy-link.png)

<br>

Ajusta la ruta del enlace a la ruta correcta para la version que deseas descargar.

> Consejo: Puedes descargar la ultima version de Tx Submit API desde la pagina <a href="https://github.com/blinklabs-io/tx-submit-api/releases" target="_blank">https://github.com/blinklabs-io/tx-submit-api/releases</a>.

```
wget -O - https://github.com/blinklabs-io/tx-submit-api/releases/download/v0.20.8/tx-submit-api-v0.20.8-linux-amd64 > tx-submit-api
```

***

## Paso 2 - Cambiar Permisos

Para este ejemplo, nombramos el archivo binario `tx-submit-api` y guardamos el archivo en nuestra carpeta `$NODE_HOME`. Para hacer el archivo ejecutable, ejecuta el siguiente comando:

Ajusta la ruta del archivo y el nombre del archivo si es necesario.

```
chmod +x $NODE_HOME/tx-submit-api
```

***

## Paso 3 - Abrir el Firewall en el Puerto Seleccionado

Asegurate de que tu firewall este abierto en el puerto que seleccionaste. Para este ejemplo, usamos el puerto 8090. Para abrir el puerto 8090, ejecutamos el siguiente comando:

`
sudo ufw allow 8090/tcp
`

***

## Paso 4 - Configurar el Archivo de Configuracion

Ejemplo de config.yaml:

```
node:
  network: mainnet
  port: 8090
  socketPath: /home/user/cardano-my-node/db/socket
```

***

Consejo: Para encontrar la ruta a tu socket de nodo, ejecuta el siguiente comando:

```
echo $CARDANO_NODE_SOCKET_PATH
```

<br>

Un desglose detallado del archivo de configuracion se puede encontrar aqui: [https://github.com/blinklabs-io/tx-submit-api/blob/main/config.yaml.example](https://github.com/blinklabs-io/tx-submit-api/blob/main/config.yaml.example)

***

## Paso 5 - Ejecutar Tx Submit API Con el Archivo de Configuracion

Ejecuta el archivo ejecutable usando el flag de linea de comandos `-config` para establecer el archivo a cargar como configuracion.

Ajusta la ruta del archivo a continuacion para que coincida con tu ruta al archivo `config.yaml`.

```
cd $NODE_HOME
./tx-submit-api -config /path/to/config.yaml
```

![txsubmit-screen](/txsubmit-screen.png)

Consejo: Puedes presionar `control`+`z` y luego escribir `bg` para ejecutar en segundo plano. Presiona `fg` para traer de vuelta al primer plano.

***



Consejo: Puedes verificar que Tx Submit API esta ejecutandose usando el siguiente comando. Por favor ajusta el puerto si es necesario.

```
curl http://localhost:8090/healthcheck
```

### Felicitaciones, estas listo para comenzar a enviar transacciones con Tx Submit API!

<br>

Para enviar transacciones usando Tx Submit API con tu billetera, necesitaremos configurar un `endpoint de envio personalizado` en la configuracion de tu billetera. Consulta nuestra guia de [configuracion de tu billetera para usar Tx Submit API](../003-setting-up-wallet-using-custom-submit-endpoint).

