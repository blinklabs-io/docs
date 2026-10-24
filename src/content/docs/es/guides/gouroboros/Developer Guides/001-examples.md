---
title: "Ejemplos de gOuroboros"
description: "Explora y descarga ejemplos ejecutables en Go de los protocolos de nodos de Cardano."
---

El repositorio gOuroboros incluye programas ejecutables que demuestran cómo las aplicaciones Go se conectan a los nodos de Cardano y usan mini-protocolos Ouroboros. Esta página incluye una copia de documentación basada en los ejemplos de [gOuroboros v0.211.0](https://github.com/blinklabs-io/gouroboros/tree/v0.211.0/examples), con las correcciones indicadas en el README del paquete.

[Descargar todos los ejemplos](/downloads/gouroboros/dev-guides/gouroboros-examples-v0.211.0.tar.gz) o consulta los [archivos de código versionados en GitHub](https://github.com/blinklabs-io/gouroboros/tree/v0.211.0/examples).

| Ejemplo | Qué demuestra |
| --- | --- |
| [block-fetch](https://github.com/blinklabs-io/gouroboros/tree/v0.211.0/examples/block-fetch) | Obtiene un bloque de un nodo mediante su slot y hash. |
| [chain-sync](https://github.com/blinklabs-io/gouroboros/tree/v0.211.0/examples/chain-sync) | Sincroniza bloques y cabeceras, con obtención de bloques y consultas de rangos opcionales. |
| [chain-tip](https://github.com/blinklabs-io/gouroboros/tree/v0.211.0/examples/chain-tip) | Lee y muestra la punta actual de la cadena. |
| [peer-sharing](https://github.com/blinklabs-io/gouroboros/tree/v0.211.0/examples/peer-sharing) | Solicita pares mediante el miniprotocolo peer-sharing. |
| [ping](https://github.com/blinklabs-io/gouroboros/tree/v0.211.0/examples/ping) | Mide los tiempos de conexión al nodo y de respuesta de ChainSync. |
| [state-query](https://github.com/blinklabs-io/gouroboros/tree/v0.211.0/examples/state-query) | Consulta el estado del ledger en un nodo local. |
| [tx-monitor](https://github.com/blinklabs-io/gouroboros/tree/v0.211.0/examples/tx-monitor) | Observa las transacciones del mempool local del nodo. |
| [tx-submission](https://github.com/blinklabs-io/gouroboros/tree/v0.211.0/examples/tx-submission) | Envía una transacción a un nodo local. |

Los ejemplos son programas Go del módulo gOuroboros y requieren Go 1.26.5 o más reciente. Después de extraer la descarga, siga su README para copiar los ejemplos corregidos en el módulo v0.211.0, ejecute las pruebas y configure una conexión de nodo. Siga la configuración de entorno y conexión en cada archivo fuente, y utiliza la [documentación de la API](https://pkg.go.dev/github.com/blinklabs-io/gouroboros) del módulo para obtener detalles adicionales del paquete.
