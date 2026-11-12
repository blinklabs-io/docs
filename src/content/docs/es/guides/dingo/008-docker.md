---
title: Ejecutar Dingo en un contenedor
description: Ejecuta la imagen publicada de Dingo, conserva sus datos y comprueba el estado del nodo.
---

Dingo publica imágenes de contenedores en GitHub Container Registry. Las etiquetas de las imágenes omiten la `v` inicial de la versión correspondiente de Dingo. Este ejemplo utiliza Dingo `v0.92.4`:

```sh
 docker pull ghcr.io/blinklabs-io/dingo:0.92.4
```

## Iniciar un nodo de Preview

La imagen utiliza de forma predeterminada el comando `serve`, la red Preview y el directorio de base de datos `/data/db`. Un volumen con nombre conserva la base de datos al detener o sustituir el contenedor.

```sh
docker run --detach --name dingo-preview \
  --publish 3001:3001 \
  --publish 127.0.0.1:12798:12798 \
  --publish 127.0.0.1:12799:12799 \
  --env DINGO_METRICS_BIND_ADDR=0.0.0.0 \
  --volume dingo-preview-data:/data/db \
    ghcr.io/blinklabs-io/dingo:0.92.4
```

El puerto `3001` acepta conexiones Ouroboros de nodo a nodo. En este ejemplo, las métricas del puerto `12798` y el servicio de estado del puerto `12799` se publican en la interfaz de loopback del host. De forma predeterminada, la imagen mantiene las métricas en el loopback del contenedor, por lo que `DINGO_METRICS_BIND_ADDR=0.0.0.0` permite acceder desde el host al puerto de métricas publicado, mientras que el extremo del host permanece limitado a `127.0.0.1`. Utiliza un volumen con nombre distinto para cada red.

Para Preprod, añade `--env CARDANO_NETWORK=preprod` y utiliza un volumen como `dingo-preprod-data`.

## Usar un archivo de configuración

Monta un archivo `dingo.yaml` legible y pasa su ruta antes del comando `serve`:

```sh
docker run --detach --name dingo-custom \
  --publish 3001:3001 \
  --volume dingo-custom-data:/data/db \
  --mount type=bind,source="$(pwd)/dingo.yaml",target=/tmp/dingo.yaml,readonly \
     ghcr.io/blinklabs-io/dingo:0.92.4 \
  --config /tmp/dingo.yaml serve
```

Si la configuración personalizada publica el puerto de métricas, establece `metricsBindAddr: "0.0.0.0"` en `dingo.yaml` o `DINGO_METRICS_BIND_ADDR=0.0.0.0` en el entorno del contenedor. Montar un archivo de configuración no basta para acceder a las métricas de loopback mediante un puerto publicado.

El contenedor se ejecuta con UID `1000`. Asegúrate de que ese usuario puede leer el archivo de configuración montado. Para otras opciones del nodo, consulta [Configuración y modos de almacenamiento](/es/guides/dingo/005-node-configuration/).

Antes de iniciar el contenedor, prepara la propiedad del directorio del host que se montará como `databaseLifecycle.snapshotDir`:

```sh
mkdir -p ./dingo-snapshots
sudo chown 1000:1000 ./dingo-snapshots
```

Las rutas de `snapshotDir` bajo `/data/db` ya están preparadas para `UID:GID 1000:1000`. Si el bind mount usa otro directorio del host, asígnale esa propiedad antes de montarlo y configura `snapshotDir` con la ruta de destino; Dingo falla al iniciar si la ruta no permite escritura.

### Configurar las métricas publicadas

Los extremos de métricas del nodo y de Mithril aceptan solicitudes anónimas. No configures `DINGO_METRICS_AUTH_TOKEN` ni credenciales Bearer en Prometheus.

Publica el puerto de métricas con la dirección de enlace indicada en los ejemplos. El nodo y Mithril sirven las métricas mediante HTTP sin cifrar; limita el acceso con controles de red, un proxy inverso con TLS o un túnel cifrado si el puerto queda accesible fuera de una red de confianza.

### Añadir registros a un archivo existente

Configura `DINGO_LOG_FILE` junto con `DINGO_LOG_FILE_APPEND=true` para que el contenedor reutilice el mismo archivo de registros:

```sh
docker run --detach --name dingo-logging \
  --env DINGO_LOG_FILE=/data/dingo.log \
  --env DINGO_LOG_FILE_APPEND=true \
  ghcr.io/blinklabs-io/dingo:0.92.4
```

El valor de `DINGO_LOG_FILE_APPEND` debe ser exactamente `true`. Con este valor, el contenedor añade registros a un archivo regular existente, crea el archivo si falta y conserva los permisos del archivo existente. Si el archivo no está vacío y su última línea no termina en salto de línea, el contenedor inserta uno antes de añadir los registros. El contenedor rechaza enlaces simbólicos y archivos que no sean regulares. Si `DINGO_LOG_FILE_APPEND` no tiene exactamente el valor `true`, el comportamiento predeterminado exige que `DINGO_LOG_FILE` indique un archivo nuevo.

## Comprobar y gestionar el contenedor

```sh
docker logs --follow dingo-preview
docker stop dingo-preview
docker start dingo-preview
```

La comprobación de estado de la imagen llama a `/health`, que informa de la actividad del proceso e incluye la capacidad de respuesta del bucle de eventos. Un contenedor con estado saludable puede seguir sincronizándose. `/readyz` comprueba si está preparado: exige superar las comprobaciones de distancia a la punta y de disponibilidad de la base de datos. Si es un productor de bloques, también necesita un proceso de forjado en ejecución con credenciales utilizables. Usa `/readyz` para decidir si dirigir tráfico de aplicaciones al nodo. Consulta [Arranque y mantenimiento de datos](/es/guides/dingo/007-bootstrap-and-data-maintenance/) para las operaciones de arranque con Mithril y de base de datos.

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
