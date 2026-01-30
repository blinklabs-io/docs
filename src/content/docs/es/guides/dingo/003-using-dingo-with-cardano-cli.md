---
title: Usando Dingo con Cardano CLI
description: Dingo - Como usar Dingo con Cardano CLI.
---

Dingo es un nodo de datos de la blockchain Cardano escrito en Go que participa activamente en las comunicaciones de red en la blockchain Cardano utilizando la familia de mini-protocolos Node-to-Node de la Red Ouroboros.

⚠️ Este es un trabajo en progreso y actualmente esta en desarrollo activo

<br>

***

En esta guia te guiaremos a traves de la descarga y ejecucion del binario de Cardano CLI y la ejecucion de algunos comandos de Cardano CLI. Para comenzar, sigue los pasos a continuacion.

<br>

> ✅ Esta guia asume que ya has descargado Dingo y sincronizado la cadena. Si no, consulta nuestra guia de [Inicio Rapido](../002-quick-start-overview).

***

<br>

## Paso 1 - Descargar el ultimo binario de Cardano CLI

Primero comienza yendo a la pagina del repositorio de Cardano CLI <a href="https://github.com/IntersectMBO/cardano-cli/releases" target="_blank">https://github.com/IntersectMBO/cardano-cli/releases</a>.

Puedes descargar el archivo binario y mover el archivo a tu ubicacion preferida o...

<br>

Copia la ruta al ultimo archivo binario de Cardano CLI y ejecuta el siguiente comando para descargar el archivo binario.

<br>

⚠️ Para este ejemplo ponemos el binario de Cardano-cli en nuestra carpeta `dingo`. Ajusta la ruta del enlace a la ruta correcta para la version que deseas descargar.

```
cd ~/dingo
wget https://github.com/IntersectMBO/cardano-cli/releases/download/cardano-cli-10.11.1.0/cardano-cli-10.11.1.0-x86_64-linux.tar.gz -O - | tar -xz
```

***

<br>

## Paso 2 - Renombrar Archivo y Cambiar Permisos para Cardano CLI

Para este ejemplo, nombraremos el archivo binario `cardano-cli`. Para renombrar el binario ejecutaremos lo siguiente:

⚠️ Ajusta la ruta del archivo y el nombre del archivo si es necesario.

```
mv cardano-cli-x86_64-linux cardano-cli
```

<br>

Para hacer el archivo ejecutable ejecuta el siguiente comando:

```
chmod +x cardano-cli
```

***

<br>

#### Felicidades, ahora podemos usar cardano-cli para comunicarnos con el nodo.

<br>

## Paso 3 - Ejecutar Comando de Cardano CLI para Consultar Tip
Ejecutemos nuestro primer comando de Cardano CLI para consultar el tip de la blockchain preview usando el nodo Dingo para proporcionar los datos.

Ejecutaremos el siguiente comando para consultar el tip:

```
./cardano-cli query tip \
--testnet-magic 2 \
--socket-path dingo.socket
```
> ⚠️ Ten en cuenta que el socket-path anterior asume que descargaste Cardano CLI en tu carpeta dingo. Si pusiste el binario de cardano-cli en una ubicacion diferente, por favor ajusta la ruta. Puedes usar `realpath dingo.socket` para encontrar la ruta absoluta a tu dingo.socket.

![dingo-query-tip](/dingo-query-tip.png)

***

<br>

## Paso 4 - Usando Variables de Entorno (Opcional)
En lugar de especificar la Red del Nodo Cardano y el Socket del Nodo Cardano cada vez que ejecutamos un comando de cardano-cli, podemos usar variables de entorno.

<br>

### Configurar Variables de Entorno para la Sesion Actual (Opcion 1)

Podemos ejecutar los siguientes comandos para exportar la variable para nuestra sesion actual.

Ruta del Socket:

```
export CARDANO_NODE_SOCKET_PATH=~/dingo/dingo.socket
```

Red del Nodo:

```
export CARDANO_NODE_NETWORK_ID=2
```

<br>

### Configurar Variables de Entorno Permanentemente (Opcion 2)
Para hacer una variable de entorno persistente entre sesiones, necesitas agregarla al archivo de configuracion de tu shell.

Ruta del Socket:

```
echo CARDANO_NODE_SOCKET_PATH=~/dingo/dingo.socket >> ~/.bashrc
```

Red del Nodo:

```
echo export CARDANO_NODE_NETWORK_ID=2 >> ~/.bashrc
```

***

<br>

> 💡 Consejo: A continuacion se muestran los IDs de Red actuales
> ```
> # Testnet SanchoNet
> export CARDANO_NODE_NETWORK_ID=4
>
> # Testnet Preview
> export CARDANO_NODE_NETWORK_ID=2
>
> # Testnet Pre-produccion
> export CARDANO_NODE_NETWORK_ID=1
>
> # Mainnet
> export CARDANO_NODE_NETWORK_ID=mainnet
> ```

***

<br>

### ¡Felicidades, estas listo para comenzar a usar el nodo Dingo con Cardano CLI!
Aprende mas sobre Cardano CLI en [https://developers.cardano.org](https://developers.cardano.org/docs/get-started/cli-operations/basic-operations/get-started/)
