---
title: Configuración del nodo y modos de almacenamiento
description: Elige la función del nodo Dingo y consulta las opciones de configuración correspondientes.
---

Usa el [inicio rápido](/es/guides/dingo/002-quick-start-overview/) para instalar Dingo e iniciar un nodo. Esta página explica las principales decisiones de configuración. Lee la [referencia completa de configuración de Dingo v0.87.0](/es/guides/dingo/009-configuration-reference/) y descarga el archivo [`dingo.yaml.example`](https://raw.githubusercontent.com/blinklabs-io/dingo/v0.87.0/dingo.yaml.example) de esa versión.

## Elegir la función del nodo

| Función | Modo de almacenamiento | Producción de bloques | Uso |
| --- | --- | --- | --- |
| Relay | `core` | Desactivada | Seguir y validar la cadena; atender conexiones de nodo a nodo y de nodo a cliente. |
| Productor de bloques | `core` | Activada, con las claves del pool y un certificado operativo | Seguir la cadena y forjar bloques cuando resulte elegido. Consulta las [guías para SPO](../spo-guides/000-spo-guide/). |
| Nodo de API | `api` | Desactivada | Conservar el historial de transacciones y servir las API configuradas de Blockfrost, Mesh o UTxO RPC, o la API integrada opcional compatible con Kupo. |

`core` es el modo de almacenamiento predeterminado y conserva los datos necesarios para el consenso. `api` también indexa los detalles históricos de las transacciones para los servicios de consulta. Los proveedores de API requieren el modo `api`, incluida la API integrada opcional compatible con Kupo. Establecer el puerto de un proveedor en `0` desactiva ese servicio. El modo de almacenamiento no activa la producción de bloques.

En las versiones actuales, la producción de bloques de Dingo está destinada a redes de prueba y devnets privadas. Sigue las indicaciones sobre claves y certificados del pool en las [guías para SPO](../spo-guides/000-spo-guide/); disponer de una configuración de mainnet no significa que se admita la producción en mainnet.

## Configurar Dingo

Dingo lee los ajustes de un archivo YAML, variables de entorno y opciones de la línea de comandos. El orden de prioridad es: opciones de línea de comandos, variables de entorno, YAML y valores predeterminados integrados. Una ejecución local básica utiliza la configuración integrada de la red Preview:

```sh
./dingo --network preview
```

Para una configuración persistente o distinta de la predeterminada, guarda el archivo descargado como `dingo.yaml` y pásalo con `--config`. Las opciones de configuración y sus valores predeterminados pueden cambiar entre versiones.

Los proveedores se configuran bajo `plugins`: los de almacenamiento conservan los datos de bloques y metadatos, los de mempool ordenan las transacciones pendientes y los de API atienden las solicitudes de los clientes. La configuración específica de cada proveedor se encuentra junto a su nombre. El archivo de ejemplo documenta los proveedores y las opciones de Dingo v0.87.0.

Cuando `plugins.storage.metadata.provider` es `sqlite`, el ajuste raíz `databasePath` no puede estar vacío. Si no se especifica un proveedor, se utiliza `sqlite`, y Dingo rechaza la configuración al inicio si `databasePath` está vacío. Las variables de entorno siguen el formato `DINGO_PLUGINS_<CAPABILITY>_<PROVIDER>_...`. El ejemplo actual muestra los proveedores de blobs y metadatos admitidos y sus opciones.

La [guía de Grafana](../spo-guides/008-grafana-dashboard/) explica los paneles de métricas. Para ejecutar el nodo como servicio Linux, consulta [Ejecutar Dingo como servicio](/es/guides/dingo/003-create-start-up-service/).

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
