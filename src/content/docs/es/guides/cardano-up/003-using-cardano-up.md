---
title: Usando cardano-up
description: Una guia de como usar cardano-up.
---

# Usando cardano-up para instalar servicios de Cardano

cardano-up es una utilidad de linea de comandos para gestionar servicios de Cardano. cardano-up te permite usar una utilidad de linea de comandos para instalar servicios de Cardano utilizando imagenes de docker.

Vamos a revisar como abrir cardano-up y ver como podemos usarlo para instalar servicios de Cardano que podriamos necesitar.

> Para esta guia asumimos que ya has descargado el binario de cardano-up y has abierto la aplicacion Ubuntu. Si aun no lo has hecho, consulta nuestra guia de [Inicio Rapido](../002-quick-start-docker-desktop).

***

## Contextos

Antes de comenzar a instalar paquetes, necesitamos entender que son los `contextos` y como cardano-up los utiliza.

Los contextos se utilizan para permitirte instalar multiples copias del mismo paquete con diferentes configuraciones de red lado a lado. Te permiten hacer cosas como ejecutar un nodo de Cardano en `preprod` y `mainnet` en la misma maquina, o incluso tener multiples instancias de nodos de Cardano en `preview` ejecutando diferentes versiones del nodo.

Comandos como `install`, `uninstall` y `list` funcionan en el contexto activo. Puedes usar el comando `context` para cambiar el contexto activo o gestionar los contextos disponibles.

El subcomando `context` gestiona los contextos. Tiene subcomandos propios para las diversas funciones relacionadas con contextos.

Para esta guia instalaremos en el contexto predeterminado que esta configurado para la red preprod. Si quieres ver como crear tu propio contexto o cambiar la red, consulta nuestra [Guia de Referencia](../004-reference-guide).

***

## Instalar un Paquete

> Para instalar un paquete e interactuar con el, necesitamos agregar `~/.local/bin` a tu `$PATH` agregando lo siguiente a tu archivo RC/profile del shell para que cualquier comando/script instalado este facilmente disponible
>
> ```
> export PATH=~/.local/bin:$PATH
> ```

Para este ejemplo instalaremos nuestro paquete en el contexto predeterminado que esta configurado para la red preprod

![cardano-up-context-list](/cardano-up-context-list.png)

El paquete que instalaremos es el Nodo de Cardano. Para instalar el Nodo de Cardano usando cardano-up ejecutaremos el siguiente comando:

```
cardano-up install cardano-node
```

![cardano-up-install-cardano-node](/cardano-up-install-cardano-node.png)

Una vez que la instalacion este completa, veremos el siguiente mensaje de `successfully installed`. Podemos notar que instalo los siguientes paquetes necesarios para el Nodo de Cardano: cardano-config, cardano-cli, mithril-client y cardano-node.

![cardano-up-install-cardano-node-success-message](/cardano-up-install-cardano-node-success-message.png)

> Consejo: Ahora tambien podemos ver el Nodo de Cardano en Docker Desktop bajo nuestros contenedores.
>
> ![cardano-up-docker-desktop-cardano-node](/cardano-up-docker-desktop-cardano-node.png)

### Felicitaciones, has instalado tu primer paquete de Cardano con cardano-up y tienes la imagen de docker lista para usar!

Veamos los paquetes en nuestro contexto, mostremos nuestras variables de entorno y probemos nuestro nodo de Cardano encontrando el tip actual de la blockchain usando cardano-cli. Tambien veremos los paquetes disponibles para instalar en caso de que queramos instalar otro paquete para usar con el Nodo de Cardano.

## Ver Paquetes en Nuestro Contexto

Ahora podemos usar el comando `cardano-up list` para ver los paquetes instalados en nuestro contexto predeterminado.

```
cardano-up list
```

![cardano-up-default-context-list](/cardano-up-default-context-list.png)

***

## Mostrar Variables de Entorno

Tambien podemos agregar cualquier variable de entorno exportada por los paquetes instalados a tu entorno agregando lo siguiente a tu archivo RC/profile del shell:

```
eval $(cardano-up context env)
```

Ahora deberias poder ejecutar `cardano-cli` normalmente. Podemos verificar el tip del nodo de Cardano ejecutando:

```
cardano-cli query tip --testnet-magic 1
```

![cardano-up-eval-env-plus-tip](/cardano-up-eval-env-plus-tip.png)

> Si obtienes un error, es posible que tengas que esperar a que el nodo de Cardano termine de sincronizarse antes de ejecutar.

***

## Ver Paquetes Disponibles para Instalar

Ahora veamos que otros paquetes estan disponibles que podriamos necesitar o querer instalar. Podemos ejecutar el siguiente comando para ver los paquetes disponibles:

```
cardano-up list-available
```

![cardano-up-list-available](/cardano-up-list-available.png)

> Consejo: Puedes ver los paquetes requeridos que se instalaran si instalas un paquete determinado. Por ejemplo, puedes ver que si instalas el nodo de Cardano `Requires: cardano-config, cardano-cli and mithril-client`

![cardano-up-list-available-tip](/cardano-up-list-available-tip.png)

Quieres ver que mas puedes hacer o como ajustar tu configuracion, consulta nuestra [Guia de Referencia](../004-reference-guide)
