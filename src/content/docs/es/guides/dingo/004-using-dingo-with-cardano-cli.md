---
title: Usar Dingo con Cardano CLI
description: Cómo utilizar Dingo con Cardano CLI.
---

Dingo es un nodo de la blockchain de Cardano escrito en Go que participa activamente en las comunicaciones de la red mediante la familia de miniprotocolos Ouroboros de nodo a nodo.

⚠️ Dingo sigue en desarrollo intensivo.

Esta guía descarga y ejecuta el binario de Cardano CLI y muestra varios comandos para comunicarse con un nodo Dingo.

✅ Se presupone que ya descargaste Dingo y sincronizaste la cadena. Si no es así, consulta el [inicio rápido](../002-quick-start-overview).

## Paso 1 - Descargar el último binario de Cardano CLI

Abre la página de [versiones de Cardano CLI](https://github.com/IntersectMBO/cardano-cli/releases). Puedes descargar el binario y moverlo a la ubicación que prefieras, o copiar su URL y ejecutar el siguiente comando.

⚠️ Este ejemplo coloca `cardano-cli` en `~/dingo`. Ajusta la URL a la versión que quieras descargar.

```
cd ~/dingo
wget https://github.com/IntersectMBO/cardano-cli/releases/download/cardano-cli-11.0.0.0/cardano-cli-11.0.0.0-x86_64-linux.tar.gz -O - | tar -xz
```

## Paso 2 - Renombrar el binario y darle permisos de ejecución

Haz ejecutable el archivo:

```
chmod +x cardano-cli-x86_64-linux
```

Renombra el binario a `cardano-cli` y muévelo a `/usr/local/bin/`. Ajusta la ruta y el nombre de archivo si es necesario.

```
sudo mv cardano-cli-x86_64-linux /usr/local/bin/cardano-cli
```

### ¡Enhorabuena! Ya puedes utilizar cardano-cli con el nodo Dingo.

## Paso 3 - Consultar la punta mediante Cardano CLI

Consulta la punta de Preview a través del nodo Dingo:

```
./cardano-cli query tip \
--testnet-magic 2 \
--socket-path dingo.socket
```

⚠️ El `--socket-path` anterior presupone que descargaste cardano-cli en `~/dingo`. Ajusta la ruta si lo instalaste en otra ubicación. Puedes obtener la ruta absoluta de `dingo.socket` con `realpath dingo.socket`.

![Consulta de la punta de Dingo](/dingo-query-tip.png)

## Paso 4 - Variables de entorno, opcional

Puedes utilizar variables de entorno en lugar de especificar la red Cardano y el socket del nodo en cada comando.

### Opción 1 - Variables para la sesión actual

Exporta la ruta del socket:

```
export CARDANO_NODE_SOCKET_PATH=~/dingo/dingo.socket
```

Red del nodo:

```
export CARDANO_NODE_NETWORK_ID=2
```

### Opción 2 - Variables permanentes

Añádelas al archivo de configuración del shell para conservarlas entre sesiones.

Ruta del socket:

```
echo export CARDANO_NODE_SOCKET_PATH=~/dingo/dingo.socket >> ~/.bashrc
```

Red del nodo:

```
echo export CARDANO_NODE_NETWORK_ID=2 >> ~/.bashrc
```

💡 Estos son los identificadores de red actuales:

> ```
> # SanchoNet testnet
> export CARDANO_NODE_NETWORK_ID=4
>
> # Preview testnet
> export CARDANO_NODE_NETWORK_ID=2
>
> # Pre-production testnet
> export CARDANO_NODE_NETWORK_ID=1
>
> # Mainnet
> export CARDANO_NODE_NETWORK_ID=mainnet
> ```

### ¡Enhorabuena! Ya puedes utilizar el nodo Dingo con Cardano CLI.

Consulta más información en la [documentación de Cardano CLI](https://developers.cardano.org/docs/get-started/cli-operations/basic-operations/get-started/).
