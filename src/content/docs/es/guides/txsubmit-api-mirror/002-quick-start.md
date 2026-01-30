---
title: Guia de Inicio Rapido
description: Guia de Inicio Rapido de Tx Submit API Mirror.
---

# Inicio Rapido

Tx Submit API Mirror es un servicio API simple de envio de transacciones de Cardano que replica todas las solicitudes entrantes de forma asincrona a los servicios API de envio de backend configurados.

Una API HTTP simple que acepta una transaccion de Cardano codificada en CBOR como cuerpo de carga util y la envia a uno o mas servicios API de envio de transacciones de backend configurados.

Simplemente descargue el archivo binario de Tx Submit API Mirror desde blinklabs.io en su servidor de nodo. La configuracion se puede realizar utilizando un archivo de configuracion o estableciendo variables de entorno.

Para comenzar, siga los pasos a continuacion

Advertencia: Esta guia asume una configuracion tipica de Nodo Cardano en Linux. Por favor ajuste los comandos y rutas segun sea necesario.

<br>

> Consejo: No tiene un Nodo Cardano todavia? Pruebe [cardano-up](../../cardano-up/001-cardano-up)

***

## Paso 1 - Descargar el binario desde Blinklabs
<br>

**Paso 1-A** - Primero comience yendo a <a href="https://blinklabs.io/projects-open-source" target="_blank">https://blinklabs.io/projects-open-source</a> y desplacese hacia abajo hasta Tx Submit API Mirror.

![txsubmit-mirror-blinklabs-site](/txsubmit-mirror-blinklabs-site.png)
<br>

**Paso 1-B** - Seleccione el sistema operativo de su servidor de nodo.

![txsubmit-mirror-blinklabs-site-operating-system](/txsubmit-mirror-blinklabs-site-operating-system.png)
<br>

**Paso 1-C** - Puede descargar el archivo binario y mover el archivo a su servidor de nodo o...

![txsubmit-mirror-blinklabs-site-download](/txsubmit-mirror-blinklabs-site-download.png)

<br>

Copie la ruta desde Blinklabs y ejecute el siguiente comando para descargar el archivo binario en su servidor de nodo

<br>

Advertencia: Ajuste la ruta del enlace a la ruta correcta para la version que desea descargar.

> Consejo: Puede descargar la ultima version de Tx Submit API Mirror desde la pagina <a href="https://github.com/blinklabs-io/tx-submit-api-mirror/releases" target="_blank">https://github.com/blinklabs-io/tx-submit-api-mirror/releases</a>.

```
wget -O - https://github.com/blinklabs-io/tx-submit-api-mirror/releases/download/v0.8.1/tx-submit-api-mirror-v0.8.1-linux-amd64 > tx-submit-api-mirror
```

***

## Paso 2 - Cambiar Permisos

Para este ejemplo, nombramos el archivo binario `tx-submit-api-mirror` y guardamos el archivo en nuestra carpeta `$NODE_HOME`. Para hacer el archivo ejecutable, ejecute el siguiente comando:

Advertencia: Ajuste la ruta del archivo y el nombre del archivo si es necesario.

```
chmod +x $NODE_HOME/tx-submit-api-mirror
```

***

## Paso 3 - Abrir el Firewall en el Puerto Seleccionado

Asegurese de que su firewall este abierto en el puerto que selecciono. Para este ejemplo, usamos el puerto 8090. Para abrir el puerto 8090, ejecutamos el siguiente comando:

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
  backends: http://tx1, http://tx2, http://tx3
```

`BACKENDS` es una lista separada por comas de URIs de servicios API de envio de transacciones HTTP de Cardano

***

Consejo: Para encontrar la ruta a su socket de nodo, ejecute el siguiente comando:

```
echo $CARDANO_NODE_SOCKET_PATH
```

<br>

Mas informacion sobre el archivo de configuracion o las variables de entorno se puede encontrar aqui: [https://github.com/blinklabs-io/tx-submit-api-mirror](https://github.com/blinklabs-io/tx-submit-api-mirror)

***

## Paso 5 - Ejecutar Tx Submit Mirror API Con el Archivo de Configuracion

Ejecute el archivo ejecutable ejecutando lo siguiente con la bandera de linea de comandos `-config` para establecer el archivo a cargar como configuracion.

Advertencia: Ajuste la ruta del archivo a continuacion para que coincida con su ruta al archivo `config.yaml`.

```
cd $NODE_HOME
./tx-submit-api-mirror -config /path/to/config.yaml
```

Consejo: Puede presionar `control`+`z` y luego escribir `bg` para ejecutar en segundo plano. Presione `fg` para traer de vuelta al primer plano

***

<br>

Consejo: Puede verificar que Tx Submit Mirror API esta ejecutandose usando el siguiente comando. Por favor ajuste el puerto si es necesario.

```
curl http://localhost:8090/healthcheck
```

### Felicitaciones, esta listo para comenzar a enviar transacciones con Tx Submit Mirror API!

<br>

## Paso 6 - Enviar Transacciones a su URL de Tx Submit Mirror

Envie transacciones a la URL de su API Tx Submit Mirror. Deberia verse como `http://192.0.2.0:8090/api/submit/tx` Advertencia: Ajuste a su IP y Puerto segun sea necesario.

Esta implementacion comparte una especificacion de API con la implementacion Haskell de IOHK. Se aplican las mismas instrucciones. Siga los pasos para
[construir y enviar una transaccion](https://github.com/input-output-hk/cardano-node/tree/master/cardano-submit-api#build-and-submit-a-transaction)
