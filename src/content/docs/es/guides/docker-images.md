---
title: Imágenes de contenedores de Blink Labs
description: Elige, ejecuta y configura imágenes de contenedores de Blink Labs para Cardano, Hydra y Mithril.
---

Blink Labs publica imágenes reproducibles basadas en Debian o Alpine que empaquetan software de los proyectos originales del ecosistema Cardano. El software sigue perteneciendo al proyecto original; Blink Labs mantiene los Dockerfiles, los componentes de compilación, los puntos de entrada y la automatización de publicación. Lee la licencia y las notas de la versión del proyecto original antes de desplegar una imagen en producción.

Las imágenes se publican tanto en [GitHub Container Registry](https://github.com/orgs/blinklabs-io/packages?repo_name=docker-cardano-node), como `ghcr.io/blinklabs-io/<image>`, como en [Docker Hub](https://hub.docker.com/u/blinklabs), como `blinklabs/<image>`. Utiliza una etiqueta de versión cuando necesites reproducibilidad; usa `:latest` únicamente si quieres seguir deliberadamente la compilación publicada más reciente.

## Catálogo de imágenes

| Imagen | Uso | Proyecto original | Guía |
| --- | --- | --- | --- |
| `cardano-cli` | Consultas desde la línea de comandos, construcción de transacciones y firma. | [IntersectMBO/cardano-cli](https://github.com/IntersectMBO/cardano-cli) | [Guía](/es/guides/docker-images/cardano-cli/) |
| `cardano-configs` | Proporcionar archivos de configuración de red a otro contenedor o volumen. | [Configuraciones de entornos Cardano](https://book.play.dev.cardano.org/environments/) | [Guía](/es/guides/docker-images/cardano-configs/) |
| `cardano-db-sync` | Indexar una cadena Cardano en PostgreSQL. | [IntersectMBO/cardano-db-sync](https://github.com/IntersectMBO/cardano-db-sync) | [Guía](/es/guides/docker-images/cardano-db-sync/) |
| `cardano-node` | Ejecutar un nodo completo de Cardano, un tracer o una API de envío. | [IntersectMBO/cardano-node](https://github.com/IntersectMBO/cardano-node) | [Guía](/es/guides/docker-images/cardano-node/) |
| `cardano-wallet` | Ejecutar el servicio HTTP de billetera Cardano. | [cardano-foundation/cardano-wallet](https://github.com/cardano-foundation/cardano-wallet) | [Guía](/es/guides/docker-images/cardano-wallet/) |
| `hydra-node` | Ejecutar un nodo de una head de Hydra. | [cardano-scaling/hydra](https://github.com/cardano-scaling/hydra) | [Guía](/es/guides/docker-images/hydra-node/) |
| `mithril-client` | Descargar y verificar instantáneas Mithril. | [input-output-hk/mithril](https://github.com/input-output-hk/mithril) | [Guía](/es/guides/docker-images/mithril-client/) |
| `mithril-signer` | Ejecutar el servicio firmante de Mithril. | [input-output-hk/mithril](https://github.com/input-output-hk/mithril) | [Guía](/es/guides/docker-images/mithril-signer/) |

Los repositorios de las imágenes contienen los Dockerfiles y las versiones de compilación exactas de cada publicación. Los enlaces anteriores son la fuente de referencia cuando una etiqueta de imagen y esta página dejan de coincidir.

## Patrones habituales de Docker

Utiliza un volumen con nombre para el estado que deba conservarse al sustituir un contenedor. Publica únicamente los puertos necesarios para otros servicios y pasa los secretos mediante Docker secrets o un gestor de secretos, sin guardarlos en el historial del shell.

```sh
docker pull ghcr.io/blinklabs-io/cardano-node:<release-tag>
docker pull blinklabs/cardano-node:<release-tag>
docker image inspect ghcr.io/blinklabs-io/cardano-node:<release-tag>
docker logs -f cardano-node
```

Las guías individuales utilizan GHCR y `:latest` para facilitar la lectura. Sustituye el nombre por `blinklabs/<image>` para Docker Hub y fija la etiqueta en los scripts y manifiestos de despliegue.

## Elegir una imagen

- Para un nodo completo con herramientas opcionales incluidas, comienza con [cardano-node](/es/guides/docker-images/cardano-node/).
- Para comandos de transacciones y consultas, utiliza [cardano-cli](/es/guides/docker-images/cardano-cli/).
- Para montar configuraciones en otro servicio, utiliza [cardano-configs](/es/guides/docker-images/cardano-configs/).
- Para un índice PostgreSQL, utiliza [cardano-db-sync](/es/guides/docker-images/cardano-db-sync/).
- Para una API de billetera, una head de Hydra o un servicio Mithril, consulta la guía correspondiente del catálogo.

## Resolución de problemas

- **El comando termina inmediatamente:** comprueba el punto de entrada y pasa un comando cuando la imagen lo requiera. `cardano-configs` necesita un directorio de destino; `cardano-node` requiere `NETWORK` o `run`.
- **El nodo no encuentra su socket:** monta el mismo volumen con nombre en los contenedores del nodo y del cliente. Usa `/ipc/node.socket` en modo gestionado o el valor de `CARDANO_SOCKET_PATH` en modo configurable.
- **El nodo comienza desde la génesis:** conserva `/data/db` o deja `RESTORE_SNAPSHOT=true` para que el punto de entrada descargue una instantánea Mithril.
- **db-sync no conecta con PostgreSQL:** comprueba los valores de `POSTGRES_*` y el archivo generado `/configuration/pgpass`; asegúrate de que la base de datos sea accesible desde la red del contenedor.
- **Falta un archivo de configuración:** ejecuta `cardano-configs` con la red deseada y monta su salida donde la imagen consumidora espere `/opt/cardano/config`.

Informa de los problemas específicos de una imagen en su repositorio para que los mantenedores puedan reproducir la etiqueta exacta de compilación.
