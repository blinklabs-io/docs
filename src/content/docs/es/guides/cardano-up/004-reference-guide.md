---
title: Guia de Referencia
description: Guia de referencia de comandos para cardano-up.
---

# Guia de Referencia

cardano-up es una utilidad de linea de comandos para gestionar servicios de Cardano. cardano-up te permite usar una utilidad de linea de comandos para instalar servicios de Cardano utilizando imagenes de docker.

Esta guia explica con mas detalle como funciona cardano-up, la gestion de paquetes y los comandos que puedes usar.

### Enlaces Rapidos:

[Referencia de Comandos](#1) | [Comandos Generales de cardano-up](#2) | [Contextos](#3)

***

<a name="1"></a>

## Referencia de Comandos

El comando `cardano-up` consiste en multiples subcomandos. Puedes listar todos los subcomandos ejecutando `cardano-up` sin argumentos o con la opcion `--help`.

```
$ cardano-up
Usage:
  cardano-up [command]

Available Commands:
  completion     Generate the autocompletion script for the specified shell
  context        Manage the current context
  down           Stops all Docker containers
  help           Help about any command
  info           Show info for an installed package
  install        Install package
  list           List installed packages
  list-available List available packages
  logs           Show logs for an installed package
  uninstall      Uninstall package
  up             Starts all Docker containers
  update         Update the package registry cache
  upgrade        Upgrade package
  validate       Validate package file(s) in the given directory
  version        Displays the version

Flags:
  -D, --debug   enable debug logging
  -h, --help    help for cardano-up
  -v, --verbose Show all available versions of packages

Use "cardano-up [command] --help" for more information about a command.
```

***

<a name="2"></a>

## Comandos Generales de cardano-up:

#### Listar paquetes disponibles

Podemos ver que paquetes estan disponibles o dicho de otra manera, que servicios de Cardano disponibles podemos instalar con cardano-up ejecutando el siguiente comando:

```
cardano-up list-available
```

![cardano-up-list-available](/cardano-up-list-available.png)

#### Instalar un Paquete

> Para instalar un paquete e interactuar con el, necesitamos agregar `~/.local/bin` a tu `$PATH` agregando lo siguiente a tu archivo RC/profile del shell para que cualquier comando/script instalado este facilmente disponible
>
> ```
> export PATH=~/.local/bin:$PATH
> ```

Para instalar un paquete, ejecutamos `cardano-up install (Nombre del Paquete)` para este ejemplo `cardano-node`

```
cardano-up install cardano-node
```

#### Desinstalar un Paquete

Para desinstalar un paquete, ejecutamos `cardano-up uninstall (Nombre del Paquete)` para este ejemplo `cardano-node`

```
cardano-up uninstall cardano-node
```

#### `down`

Detiene todos los servicios en ejecucion para los paquetes en el contexto activo

#### `help`

Muestra informacion de uso para comandos y subcomandos

#### `info`

Muestra informacion de un paquete instalado, incluyendo el nombre, version, nombre del contexto, cualquier nota posterior a la instalacion, etc.

#### `list`

Lista los paquetes instalados en el contexto activo, o en todos los contextos con `-A`

#### `logs`

Muestra los logs de un servicio en ejecucion para el paquete especificado en el contexto activo

#### `up`

Inicia todos los servicios para los paquetes en el contexto activo

#### `update`

Fuerza una actualizacion del cache del registro de paquetes

#### `upgrade`

Actualiza el paquete especificado

#### `validate`

Valida los paquetes definidos en la ruta especificada

#### `version`

Muestra la version

***

<a name="3"></a>

## Contextos

Los contextos se utilizan para permitirte instalar multiples copias del mismo paquete con diferentes configuraciones de red lado a lado. Te permiten hacer cosas como ejecutar un nodo de Cardano en `preprod` y `mainnet` en la misma maquina, o incluso tener multiples instancias de nodos de Cardano en `preview` ejecutando diferentes versiones del nodo.

Comandos como `install`, `uninstall` y `list` funcionan en el contexto activo. Puedes usar el comando `context` para cambiar el contexto activo o gestionar los contextos disponibles.

El subcomando `context` gestiona los contextos. Tiene subcomandos propios para las diversas funciones relacionadas con contextos.

#### `context create`

Crea un nuevo contexto con un nombre dado, opcionalmente especificando una descripcion y una red de Cardano. Usamos la bandera `-n` para especificar la red de Cardano y la bandera `-d` para darle una descripcion

En este ejemplo nombramos nuestro nuevo contexto `dev` y configuramos la red a `preview` con descripcion de `preview test`

```
cardano-up context create dev -n preview -d 'preview test'
```

![cardano-up-context-create-dev-sample](/cardano-up-context-create-dev-sample.png)

#### `context delete`

Elimina el contexto con el nombre dado, si existe

```
cardano-up context delete contextName
```

En este ejemplo nombramos nuestro contexto `dev`

![cardano-up-context-delete](/cardano-up-context-delete.png)

#### `context env`

Muestra las variables de entorno para el contexto activo

```
cardano-up context env
```

![cardano-up-context-env](/cardano-up-context-env.png)

#### `context list`

Lista los contextos disponibles

```
cardano-up context list
```

![cardano-up-context-list](/cardano-up-context-list.png)


#### `context select`

Establece el contexto activo al nombre de contexto dado. En este ejemplo seleccionamos el contexto `dev`.

```
cardano-up context select dev
```

![cardano-up-context-select](/cardano-up-context-select.png)

***
