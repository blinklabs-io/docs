---
title: Guia de Inicio Rapido
description: Descripcion General del Inicio Rapido de Dingo.
---

# Dingo

Un nodo de datos de la blockchain Cardano escrito en Go que participa activamente en las comunicaciones de red en la blockchain Cardano utilizando la familia de mini-protocolos Node-to-Node de la Red Ouroboros.

⚠️ Este es un trabajo en progreso y actualmente esta en desarrollo activo

<br>

***

En esta guia te guiaremos a traves de la descarga del binario de Dingo y todos los pasos necesarios para ejecutar el nodo Dingo en la red Cardano Preview. Para comenzar, sigue los pasos a continuacion.

<br>

✅ Esta guia asume una configuracion tipica de Linux. Por favor ajusta los comandos y rutas segun sea necesario.

***

<br>

## Paso 1 - Descargar binario desde Blinklabs
<br>

**Paso 1-A** - Primero comienza yendo a <a href="https://blinklabs.io/projects-open-source" target="_blank">https://blinklabs.io/projects-open-source</a> y desplazate hacia abajo hasta Dingo.

![dingo-blinklabs-site](/dingo-blinklabs-site.png)
<br>


**Paso 1-B** - Selecciona el sistema operativo que deseas usar para ejecutar Dingo.

![dingo-blinklabs-site-operating-system](/dingo-blinklabs-site-operating-system.png)
<br>

**Paso 1-C** - Puedes descargar el archivo binario y mover el archivo a tu ubicacion preferida o...

![dingo-blinklabs-site-download](/dingo-blinklabs-site-download.png)

<br>

Copia la ruta desde Blinklabs y ejecuta el siguiente comando para descargar el archivo binario.

<br>

⚠️ Ajusta la ruta del enlace a la ruta correcta para la version que deseas descargar.

> 💡 Consejo: Puedes descargar la ultima version de Dingo desde la pagina <a href="https://github.com/blinklabs-io/dingo/releases" target="_blank">https://github.com/blinklabs-io/dingo/releases</a>.


Primero crearemos un directorio `dingo` para todos nuestros archivos relacionados con dingo antes de descargar el binario de Dingo.

```
mkdir dingo
cd dingo
wget https://github.com/blinklabs-io/dingo/releases/download/v0.15.1/dingo-v0.15.1-linux-amd64.tar.gz -O - | tar -xz
```

***

<br>

## Mejores Practicas - Archivos Necesarios para Ejecutar Dingo
Los siguientes archivos son necesarios para ejecutar Dingo. Te guiaremos a traves de los pasos para descargar y editar los archivos en los proximos pasos.
1. dingo.yaml
2. Configuracion del Nodo
3. Topologia del Nodo
4. Genesis de Byron
5. Genesis de Shelley
6. Genesis de Alonzo
7. Genesis de Conway

## Paso 2 - Descargar Archivo de Ejemplo dingo.yaml

Para esta guia usaremos el archivo dingo.yaml. Lo descargaremos a nuestro directorio principal de dingo usando el siguiente comando:
```
wget -O - https://raw.githubusercontent.com/blinklabs-io/dingo/refs/heads/main/dingo.yaml.example > dingo.yaml
```

***

<br>

## Paso 3 - Crear Directorio y Descargar Archivos de Configuracion

Crearemos un directorio para almacenar nuestros Archivos de Configuracion de Cardano. Para este ejemplo, la estructura de archivos que crearemos es `/config/cardano/preview/` ejecutando el siguiente comando en nuestro directorio `dingo`:

```
mkdir -p config/cardano/preview
```

Ahora navegaremos a la carpeta `config/cardano/preview` y descargaremos los Archivos de Configuracion de Cardano

```
cd config/cardano/preview
```

Ahora descargaremos el archivo de configuracion de nodos no productores de bloques de la Testnet Preview de Cardano ejecutando:

```
wget https://book.play.dev.cardano.org/environments/preview/config.json
```

A continuacion, descargaremos el archivo de Topologia de la Testnet Preview ejecutando:

```
wget https://book.play.dev.cardano.org/environments/preview/topology.json
```

✅ Para este ejemplo usaremos el archivo de topologia predeterminado, como se ve a continuacion, solo para que el nodo funcione y se sincronice. Dingo soporta todos los archivos de topologia actuales y heredados.

```
{
  "bootstrapPeers": [
    {
      "address": "preview-node.play.dev.cardano.org",
      "port": 3001
    }
  ],
  "localRoots": [
    {
      "accessPoints": [],
      "advertise": false,
      "trustable": false,
      "valency": 1
    }
  ],
  "publicRoots": [
    {
      "accessPoints": [],
      "advertise": false
    }
  ],
  "useLedgerAfterSlot": 73267000
}
```

Por ultimo, descargaremos los archivos Genesis de Byron, Shelley, Alonzo y Conway

```
wget https://book.play.dev.cardano.org/environments/preview/byron-genesis.json \
https://book.play.dev.cardano.org/environments/preview/shelley-genesis.json \
https://book.play.dev.cardano.org/environments/preview/alonzo-genesis.json \
https://book.play.dev.cardano.org/environments/preview/conway-genesis.json
```

> 💡 Consejo: Los Archivos de Configuracion de Cardano se pueden encontrar en <a href="https://book.play.dev.cardano.org/environments.html" target="_blank">https://book.play.dev.cardano.org/environments.html</a>

***

<br>

## Paso 4 - Editar Archivo dingo.yaml

Ahora que tenemos los archivos de configuracion necesarios, editaremos el archivo dingo.yaml para apuntar a los directorios y archivos correctos. Para editar este archivo, ejecutaremos:

```
cd ~/dingo
nano dingo.yaml
```

> ✅ Para este ejemplo, guardamos el archivo dingo.yaml en nuestro directorio principal de dingo, asi que usaremos `cd ~/dingo` para volver a ese directorio, por favor ajusta la ruta y el nombre del archivo si es necesario.

#### Agregar rutas a dingo.yaml
Agregaremos una ruta a nuestro archivo de topologia y verificaremos nuestra ruta al archivo config.json de Cardano. Si usaste una ruta diferente a `./config/cardano/preview` por favor ajusta segun sea necesario.

```
# Archivo de configuracion de ejemplo para dingo
# Los valores mostrados a continuacion corresponden a los valores predeterminados en el codigo

# Direccion de enlace publico para el servidor Dingo
bindAddr: "0.0.0.0"

# Ruta al archivo de configuracion del nodo Cardano
#
# Puede ser anulado con la variable de entorno config
cardanoConfig: "./config/cardano/preview/config.json"

# Un directorio que contiene los archivos de base de datos del libro mayor
databasePath: ".dingo"

# Ruta al archivo de socket de dominio UNIX usado por el servidor
socketPath: "dingo.socket"

# Nombre de la red Cardano
network: "preview"

# Ruta del archivo de certificado TLS (para HTTPS)
#
# Puede ser anulado con la variable de entorno TLS_CERT_FILE_PATH
tlsCertFilePath: ""

# Ruta del archivo de clave TLS (para HTTPS)
#
# Puede ser anulado con la variable de entorno TLS_KEY_FILE_PATH
tlsKeyFilePath: ""

# Ruta al archivo de configuracion de topologia para el nodo Cardano
topology: "./config/cardano/preview/topology.json"

# Puerto TCP para enlazar el endpoint de metricas de Prometheus
metricsPort: 12798

# Direccion interna/privada para enlazar y escuchar Ouroboros NtC
privateBindAddr: "127.0.0.1"

# Puerto TCP para enlazar y escuchar Ouroboros NtC
privatePort: 3002

# Puerto TCP para enlazar y escuchar Ouroboros NtN
#
# Puede ser anulado con la variable de entorno port
relayPort: 3001

# Puerto TCP para enlazar y escuchar UTxO RPC
utxorpcPort: 9090

# Ignorar el historial de cadena anterior y comenzar desde la punta actual (predeterminado: false)
# Esto es experimental y puede fallar — usar con precaucion
intersectTip: false

# Tamano maximo de cache en bytes usado por BadgerDB para cache de bloques/indices
# Predeterminado: 1073741824 (1 GB)
badgerCacheSize: 1073741824

# Tamano total maximo (en bytes) de todas las transacciones permitidas en el mempool.
# Las transacciones que excedan este limite seran rechazadas.
# Predeterminado: 1048576 (1 MB)
mempoolCapacity: 1048576
```

***

<br>

## Paso 5 - Abrir Puertos
Cubriremos como listar y agregar reglas de firewall UFW para agregar los puertos necesarios. Ajusta segun sea necesario.

> 💡Consejo: UFW significa Uncomplicated Firewall y se usa para administrar reglas de firewall iptables (netfilter).

Para ver que puertos estan actualmente abiertos podemos ejecutar:

```
sudo ufw status numbered
```

#### Agregar Puerto 3001 para Comunicacion Ouroboros Node to Node (NtN)
Para sincronizar la cadena y pasar datos entre nodos necesitamos abrir el puerto 3001 o el puerto que hayas seleccionado. Para abrir el puerto 3001 ejecutaremos:

```
sudo ufw allow 3001/tcp
```
<!--

#### Agregar Puerto 12798 para metricas de Prometheus (Opcional)
Si deseas rastrear metricas usando una herramienta como Grafana querras abrir el puerto 12798 o el puerto que hayas seleccionado. Para abrir el puerto 12798 ejecutaremos:

```
sudo ufw allow 12798/tcp
```

-->

#### Agregar Puerto 9090 para UTxO RPC (Opcional)
Tambien podrias querer agregar el puerto 9090 o el puerto que hayas seleccionado para UTxO RPC si deseas acceder a datos de cadena o transacciones. Podemos abrir el puerto 9090 ejecutando:

> ⚠️ Precaucion al exponer este puerto fuera de tu maquina local.

```
sudo ufw allow 9090/tcp
```

***

<br>

## Paso 6 - Iniciar sincronizacion de Blockchain usando Mithril Client (Opcional)
Podemos acelerar la sincronizacion inicial de los bloques, tambien conocida como reproduccion de bloques, usando el Mithril Client para descargar una instantanea de Mithril. Esto podria ahorrarte horas de tiempo de sincronizacion.

<br>

#### Paso 6.1 - Crear carpeta Mithril
Crearemos una carpeta dentro de nuestra carpeta dingo que usaremos para descargar el binario de mithril. Para crear una carpeta en nuestra carpeta dingo podemos ejecutar:

```
cd ~/dingo
mkdir mithril
```

<br>

#### Paso 6.2 - Descargar Mithril Client
Ahora podemos descargar el binario del Mithril Client ejecutando lo siguiente:

⚠️ Ajusta la ruta del enlace a la ruta correcta para la version que deseas descargar.

> 💡 Consejo: Puedes descargar la ultima version de Mithril desde la pagina <a href="https://github.com/input-output-hk/mithril/releases" target="_blank">https://github.com/input-output-hk/mithril/releases</a>.

```
cd mithril
wget https://github.com/input-output-hk/mithril/releases/download/2524.0/mithril-2524.0-linux-x64.tar.gz -O - | tar -xz
```

<br>

#### Paso 6.3 - Exportar Variables de Entorno
Exportaremos las siguientes variables de entorno para descargar la instantanea de Mithril. Ejecuta estos comandos:

Variable de red Preview:

```
export NETWORK=preview
```

Variable de endpoint:

```
export AGGREGATOR_ENDPOINT=https://aggregator.pre-release-preview.api.mithril.network/aggregator
```

Variable de clave de verificacion genesis:
```
export GENESIS_VERIFICATION_KEY=$(curl -s https://raw.githubusercontent.com/input-output-hk/mithril/main/mithril-infra/configuration/pre-release-preview/genesis.vkey)
```

<br>

#### Paso 6.4 - Encontrar Ultima Instantanea y Descargarla

> 💡 Consejo: Mithril crea el directorio db/ en tu carpeta actual. En nuestro caso, la carpeta `mithril` que creamos.

Primero, ejecutamos lo siguiente para obtener la lista actual de instantaneas

```
./mithril-client cardano-db snapshot list
```

Para ver la instantanea actual ejecutamos:

```
./mithril-client cardano-db snapshot show latest
```

Descarga la instantanea actual ejecutando:

```
./mithril-client cardano-db download latest
```

Esto toma algo de tiempo, quizas hasta 10 minutos en preview basado en tu sistema. Puedes ver el progreso en pantalla.

<br>

#### Paso 6.5 - Cargar instantanea en la base de datos de Dingo
Ahora podemos volver a nuestro directorio dingo ejecutando:

```
cd ~/dingo
```

Ahora cargaremos la instantanea de Mithril en dingo ejecutando el siguiente comando:

```
./dingo load ~/dingo/mithril/db/immutable
```

Dingo ahora cargara los bloques en la base de datos de dingo copiandolos y cargandolos ejecutando una reproduccion del libro mayor. Esto tambien tomara algo de tiempo, hasta 2 horas dependiendo de tu sistema.

![dingo-load-snapshot](/dingo-load-snapshot.png)

> 📝 Si eliges no cargar una instantanea de Mithril puedes iniciar dingo con el comando `./dingo` y dejar que el proceso normal de chainsync comience. Tomara varias horas mas que usando una instantanea de Mithril para que la cadena se sincronice.

***

<br>

#### ¿Interesado en usar un servicio systemd para ejecutar un Nodo Dingo para maximizar el tiempo de actividad reiniciando automaticamente el nodo Dingo cuando la computadora se reinicia?
[Consulta nuestra guia sobre como crear un servicio de inicio para Dingo](../004-create-start-up-service).

***

<br>

### ¡Felicidades, estas listo para comenzar a usar el nodo Dingo!

[Aprende como interactuar con Dingo usando la CLI de Cardano](../003-using-dingo-with-cardano-cli).
