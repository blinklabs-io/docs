---
title: Guia del Archivo de Configuracion
description: nview - Como usar un archivo de configuracion (YAML).
---

# Uso del Archivo de Configuracion (YAML)

Ejecutar nview contra un Nodo Cardano en ejecucion funcionara de inmediato con una configuracion predeterminada de Nodo Cardano, que expone metricas en formato de datos Prometheus en un puerto especifico. Sin embargo, si necesitas hacer cambios, puedes ejecutar nview con un archivo de configuracion.

***

Para usar un archivo de configuracion, ejecuta `nview` con la bandera de linea de comandos `-config` para establecer el archivo a cargar como configuracion.

Ajusta la ruta del archivo a continuacion para que coincida con tu ruta al archivo `config.yml`.

```
./nview -config /path/to/config.yml
```

***

<br>

Ejemplo de config.yaml:

```
app:
  nodeName: Cardano Node
  network:
node:
  network: mainnet
  port: 3001
prometheus:
  host: 127.0.0.1
  port: 12798
  timeout: 3
```

***

<br>

Un desglose detallado del archivo de configuracion:

```

---
# Archivo de configuracion de ejemplo para nview
# Los valores mostrados a continuacion corresponden a los valores predeterminados en el codigo

app:
  # Nombre para mostrar del nodo
  #
  # Esto tambien se puede establecer mediante la variable de entorno NODE_NAME
  nodeName: Cardano Node

  # Red Cardano nombrada para cardano-node
  #
  # Este es un atajo para seleccionar el NetworkMagic y se puede usar para
  # seleccionar las redes mainnet, preprod, preview o sancho.
  #
  # Esto tambien se puede establecer mediante la variable de entorno NETWORK y anula
  # la configuracion especifica del nodo a continuacion
  network:

node:
  # Red Cardano nombrada para cardano-node
  #
  # Este es un atajo para seleccionar el NetworkMagic y se puede usar para
  # seleccionar las redes mainnet, preprod, preview o sancho.
  #
  # Esto tambien se puede establecer mediante la variable de entorno CARDANO_NETWORK
  network: mainnet

  # NetworkMagic para la red de cardano-node
  #
  # Esto selecciona la red correcta para la operacion y se puede configurar para
  # cualquier red, no solo las redes nombradas.
  #
  # Esto tambien se puede establecer mediante la variable de entorno CARDANO_NODE_NETWORK_MAGIC
  networkMagic:

  # Puerto para cardano-node
  #
  # Puerto de escucha para cardano-node para comunicacion NtN.
  #
  # Esto tambien se puede establecer mediante la variable de entorno CARDANO_PORT
  port: 3001

  # Ruta del socket para cardano-node
  #
  # Ruta y nombre de archivo del socket UNIX de escucha para comunicacion NtC
  # de cardano-node.
  #
  # Esto tambien se puede establecer mediante la variable de entorno CARDANO_NODE_SOCKET_PATH
  socketPath:

prometheus:
  # host/puerto para metricas Prometheus de cardano-node
  #
  # Estos tambien se pueden establecer mediante las variables de entorno PROM_HOST y PROM_PORT
  host: 127.0.0.1
  port: 12798

  # Tiempo de espera para conexiones a cardano-node
  #
  # Esto tambien se puede establecer mediante la variable de entorno PROM_TIMEOUT
  timeout: 3

```

<br>

### Felicidades, estas listo para comenzar a monitorear tu nodo usando nview con tu propio archivo de configuracion!
