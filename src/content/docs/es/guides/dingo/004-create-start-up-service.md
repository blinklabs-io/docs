---
title: Crear Servicio de Inicio
description: Crear Servicio de Inicio para Dingo.
---

# Dingo

Un nodo de datos de la blockchain Cardano escrito en Go que participa activamente en las comunicaciones de red en la blockchain Cardano utilizando la familia de mini-protocolos Node-to-Node de la Red Ouroboros.

⚠️ Este es un trabajo en progreso y actualmente esta en desarrollo activo

<br>

***

En esta guia te guiaremos a traves de la configuracion de un servicio `systemd`. Usar un servicio `systemd` para ejecutar un Nodo Dingo maximiza el tiempo de actividad reiniciando automaticamente el nodo Dingo cuando la computadora se reinicia. Para comenzar, sigue los pasos a continuacion.

<br>

✅ Esta guia asume una configuracion tipica de Linux. Por favor ajusta los comandos y rutas segun sea necesario.

***

<br>

## Paso 1 - Mover Archivos Dingo y dingo.yaml

Mejores Practicas: Como usaremos un `systemd` para iniciar Dingo, moveremos nuestro binario de Dingo a `/usr/local/bin/` y nuestro dingo.yaml al directorio `/etc/dingo/` ejecutando lo siguiente:

<br>

> ⚠️ Por favor ajusta las rutas a continuacion. Las rutas estan basadas en nuestra guia de [Inicio Rapido](../002-quick-start-overview) y `USER=test`.
>
> 💡 Consejo: para encontrar tu ruta al binario de Dingo, navega a tu directorio del binario de Dingo, luego puedes ejecutar el comando `realpath dingo`.

```
sudo mv /home/test/dingo/dingo /usr/local/bin/
```
<br>

> ✅ Puedes verificar que el binario de Dingo fue movido ejecutando `which dingo`

<br>

Ahora crearemos el directorio `/etc/dingo/`:

```
sudo mkdir /etc/dingo/
```

<br>

Luego moveremos nuestro archivo dingo.yaml a `/etc/dingo/`:

```
sudo mv /home/test/dingo/dingo.yaml /etc/dingo/
```

***

<br>

## Paso 2 - Editar Rutas en el Archivo dingo.yaml

Ahora editaremos nuestro archivo dingo.yaml para actualizar las siguientes rutas ya que movimos nuestro yaml a `/etc/dingo/`.

<br>

Necesitaremos editar las siguientes rutas: `cardanoConfig:`, `databasePath:`, `socketPath:` y `topology:`.

✅ Por favor ajusta segun sea necesario con las rutas correctas para que coincidan con tu nombre de usuario y directorios.

```
# Archivo de configuracion de ejemplo para dingo
# Los valores mostrados a continuacion corresponden a los valores predeterminados en el codigo

# Direccion de enlace publico para el servidor Dingo
bindAddr: "0.0.0.0"

# Ruta al archivo de configuracion del nodo Cardano
#
# Puede ser anulado con la variable de entorno config
cardanoConfig: "/home/test/dingo/config/cardano/preview/config.json"

# Un directorio que contiene los archivos de base de datos del libro mayor
databasePath: "/home/test/dingo/dingo"

# Ruta al archivo de socket de dominio UNIX usado por el servidor
socketPath: "/home/test/dingo.socket"

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
topology: "/home/test/dingo/config/cardano/preview/topology.json"

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

## Paso 3 - Crear Archivo de Configuracion de Unidad dingo.service

A continuacion, escribiremos el archivo de configuracion de unidad dingo.service o archivo de 'servicio', que sera ejecutado por `systemd`.

> ⚠️ Por favor ajusta la linea `User=` a continuacion.
> En nuestra guia de [Inicio Rapido](../002-quick-start-overview) usamos el usuario `test`, por favor ajusta esto a tu nombre de usuario.
>
> 💡 Consejo: puedes ejecutar el comando `echo $USER` para encontrar tu nombre de usuario.

```
cat <<'ENDFILE' >> /tmp/dingo.service
[Unit]
Description=Dingo Node
After=network-online.target

[Service]
Type=simple
Restart=on-failure
RestartSec=10
User=test
ExecStart=/usr/local/bin/dingo
SyslogIdentifier=dingo
TimeoutStopSec=3

[Install]
WantedBy=multi-user.target
ENDFILE
```

***

<br>

## Paso 4 - Mover dingo.service

Mueve dingo.service a `/etc/systemd/system/` para que pueda operar a traves de systemd ejecutando:

```
sudo mv /tmp/dingo.service /etc/systemd/system/
```

***

<br>



## Paso 5 - Habilitar el Servicio e Iniciar Servicio

Ahora habilitaremos el servicio para que se ejecute al inicio y lo encenderemos ejecutando:

```
sudo systemctl enable dingo.service
```

Luego:

```
sudo systemctl start dingo.service
```

***

<br>

## Paso 6 - Verificar Estado

Puedes asegurarte de que dingo.service esta activo verificando su estado ejecutando:

```
sudo systemctl status dingo.service
```

Si tienes un error, puedes usar el siguiente comando para ver los registros de errores:

```
journalctl -u dingo.service
```

***

<br>

### ¡Felicidades, has configurado un servicio de inicio para Dingo!
