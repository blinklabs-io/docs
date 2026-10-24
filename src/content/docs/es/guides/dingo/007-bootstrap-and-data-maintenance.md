---
title: Arranque y mantenimiento de datos
description: Arranca Dingo con Mithril y mantén su base de datos local de forma segura.
---

## Arrancar desde Mithril

Dingo incluye un cliente Mithril que descarga e importa una instantánea de la red antes de sincronizar los bloques restantes. El flujo habitual es:

```sh
dingo mithril list
dingo mithril show <snapshot-hash>
dingo mithril sync --config ./dingo.yaml
dingo serve --config ./dingo.yaml
```

Usa los comandos de instantáneas admitidos por la versión de Dingo instalada; ejecuta `dingo mithril --help` para consultar las opciones exactas. La verificación de instantáneas de Mithril comprueba la cadena de certificados y los datos firmados. Tras la importación, Dingo valida los bloques a partir del punto importado. El modo de almacenamiento API también completa los datos históricos de consulta después de cargar la instantánea; el modo core conserva el estado de consenso y los datos de bloques sin el índice histórico completo de las API.

Consulta el [inicio rápido](/es/guides/dingo/002-quick-start-overview/) para seguir todo el proceso de la primera ejecución. El tamaño de las instantáneas, el uso de disco y el tiempo de carga varían entre redes y aumentan a medida que avanza la cadena; deja espacio tanto para los archivos descargados como para la base de datos durante la importación.

### Crear y servir artefactos de Mithril

Crea un artefacto de Mithril a partir de la base de datos de un nodo Cardano y sirve los artefactos almacenados mediante el servidor Mithril configurado:

```sh
dingo mithril snapshot create --db-dir <cardano-node db>
dingo mithril serve --config ./dingo.yaml
```

Configura `mithril.server.artifactStore` antes de crear o servir artefactos. Establece `mithril.server.publicBaseUrl` en un origen público `https://`; Dingo solo acepta un origen `http://` en loopback. Configura el puerto del servicio en `mithril.server.port`. El servidor permite leer los artefactos públicamente, y los clientes pueden descargarlos mediante solicitudes de rangos HTTP.

Usa `mithril.server.redirectBaseUrl` para redirigir las solicitudes de archivos a un almacén público de objetos, `mithril.server.tlsEnabled` para activar HTTPS con el certificado compartido de Dingo y `mithril.server.keepSnapshots` para conservar un número determinado de las instantáneas más recientes. Activa los ajustes opcionales de `mithril.server.aggregator` cuando Dingo deba recopilar firmas y certificar instantáneas. Configura `mithril.server.aggregator.operatorTokenFile` con el token Bearer utilizado en las operaciones de registro y firma; el agregador también requiere TLS cuando escucha fuera de loopback. Consulta la [referencia de configuración de `mithril`](https://raw.githubusercontent.com/blinklabs-io/dingo/v0.87.0/dingo.yaml.example) para ver todos los ajustes de `server` y `aggregator`.

El arranque con Mithril v2 solo acepta ubicaciones de artefactos y redirecciones del origen del agregador configurado o del origen oficial de Mithril `storage.googleapis.com`. Dingo mantiene la exigencia de `https://` y la excepción de desarrollo local para destinos de loopback. Cada arranque aplica un presupuesto global que suma las solicitudes y los bytes de artefactos y redirecciones, exige completar la descarga en 24 horas, limita los archivos inmutables a 100000 y elimina ubicaciones duplicadas hasta dejar un máximo de cuatro por componente de artefacto. La extracción también limita el número de entradas y los bytes descomprimidos, y reserva el espacio libre necesario. Dingo utiliza límites integrados para estas protecciones.

Antes de la extracción, Dingo verifica el manifiesto auxiliar firmado, sus rutas permitidas y sus resúmenes criptográficos. Los archivos inmutables no proporcionan árboles del ledger sin autenticar; Dingo solo restaura el estado del ledger desde el archivo auxiliar firmado.

## Cargar una ImmutableDB local o remota

`dingo load` acepta un directorio ImmutableDB local o una raíz ImmutableDB remota. Configura `immutableDbPath` o `DINGO_IMMUTABLE_DB_PATH`, o pasa el origen como argumento posicional de `dingo load`. Para datos locales, usa una ruta de directorio local. Para un origen remoto, usa una URL `https://`; Dingo solo acepta `http://` para destinos de loopback y rechaza los demás orígenes HTTP. Dingo rechaza los destinos HTTPS privados o de uso especial en la URL inicial, tras cada redirección y en cada respuesta DNS obtenida al conectarse. No utiliza los ajustes de proxy HTTP del entorno para el tráfico de importación remota.

Dingo aplica límites agregados de bytes transferidos, caché activa, datos temporales, espacio libre reservado y concurrencia para toda la importación, según el rango solicitado. Si la importación supera un límite o la reserva de espacio libre, Dingo falla explícitamente en vez de permitir un uso ilimitado de recursos. Cuando falla una importación, limpia los archivos temporales, incluso si el fallo ocurre durante la configuración o la inicialización del presupuesto.

Dingo retrocede los bloques inmutables copiados que la reproducción de confianza o el procesamiento hayan dejado sin aplicar hasta la punta aplicada del ledger. Si el backend de almacenamiento rechaza ese retroceso, la carga informa tanto del fallo original como del fallo al retroceder. Recupera la base de datos antes de intentar otra carga; Dingo no recupera automáticamente todos los fallos de carga.

La raíz remota debe proporcionar `tip.json` y tríadas completas de archivos numerados. Los tres archivos de cada tríada deben utilizar el mismo número de cinco dígitos:

```text
tip.json
NNNNN.chunk
NNNNN.primary
NNNNN.secondary
```

Dingo descarga por adelantado en las cachés temporal y de archivos listos bajo `<databasePath>/immutable-download/`. Guarda las descargas interrumpidas como archivos `.part`, las reanuda con solicitudes HTTP Range y reintenta las solicitudes fallidas. Traslada las tríadas completas a la caché de archivos listos por orden de número de fragmento y reproduce el rango contiguo. Se detiene después del fragmento que contiene el slot de `tip.json`, o antes si alcanza el primer fragmento sin publicar.

Dingo comprueba que el slot y el hash del bloque de la punta cargada coincidan con `tip.json`; si no coinciden, la carga falla. También falla si un `.chunk` publicado carece de su `.primary` o `.secondary` correspondiente. Publica en la raíz remota todos los fragmentos del rango contiguo para que la carga pueda avanzar hasta la punta.

### Validación de la importación del estado del ledger

Antes de persistir el estado importado del ledger, Dingo valida los datos de consenso: anchura del hash de la punta y de los nonces, certificados e instantáneas de stake, distribución de pools y estado de gobernanza, parámetros del protocolo y relaciones entre las reservas de comisiones. Si esta comprobación preliminar rechaza una entrada, la importación falla antes de la fase UTxO y no persiste un estado UTxO parcial.

## Crear instantáneas, restaurar y truncar

Los comandos `dingo database` crean instantáneas, restauran o retroceden la base de datos configurada. Son operaciones de mantenimiento sin conexión: detén primero el nodo y comprueba que ningún otro proceso Dingo tenga abierto el directorio de datos.

```sh
dingo database snapshot --dir /backups/dingo-preview
dingo database restore /backups/dingo-preview
dingo database truncate --slot 12345678
```

`snapshot` requiere un directorio de destino que todavía no exista. Antes de restaurar, aparta el directorio de datos configurado existente; la ruta debe estar ausente o vacía. La restauración falla si el directorio contiene datos.

Para las operaciones que autentican instantáneas, `databaseLifecycle.snapshotTrustKeyFile` debe identificar un archivo regular de no más de 1024 bytes, cuyo componente final no sea un enlace simbólico. En Unix, el usuario del nodo debe ser su propietario y el archivo solo debe conceder acceso a ese propietario. En Windows, el propietario debe ser el usuario del nodo o `BUILTIN\Administrators`; en este último caso, el proceso debe pertenecer al grupo de administradores, y la DACL debe restringir el acceso a las identidades permitidas. La autenticación rechaza los archivos que no cumplan cualquiera de estos requisitos.

Las operaciones de instantánea y restauración de MySQL rechazan `tls=skip-verify`. Consulta la referencia de configuración de Dingo para conocer los valores TLS predeterminados de los proveedores.

`truncate` acepta exactamente un destino: `--slot`, `--hash` o `--block-number`. Elimina los bloques y metadatos posteriores a ese punto para que el nodo vuelva a sincronizar desde la nueva punta. Consulta todas las opciones con `dingo database --help` antes de ejecutar una recuperación. Dingo rechaza los destinos anteriores al límite de confianza de Mithril registrado, porque el historial UTxO necesario no está disponible localmente antes de ese punto. El truncado también puede fallar si la base de datos ya no conserva el historial de UTxO consumidos que requiere el destino. Si el historial local es insuficiente, utiliza una instantánea de la base de datos de un par completamente sincronizado que conserve el historial necesario.

## Caducidad del historial y archivos

La caducidad del historial elimina los archivos de bloques inmutables antiguos del almacenamiento local, pero conserva los índices del ledger y los metadatos. Las lecturas de esos bloques necesitan un [archivo Bark](/es/guides/dingo/006-apis-and-archive/) configurado; en caso contrario, devuelven un error de historial caducado. El servicio de archivo utiliza un proveedor de almacenamiento de objetos capaz de emitir URL de descarga firmadas. Configura la frecuencia de caducidad, el almacenamiento de archivo y las listas de hosts de descarga permitidos mediante el [ejemplo de configuración](https://raw.githubusercontent.com/blinklabs-io/dingo/v0.87.0/dingo.yaml.example) de Dingo v0.87.0. Usa ese ejemplo únicamente con Dingo v0.87.0; las opciones pueden cambiar entre versiones.

Configura el límite de descarga comprimida por objeto Mithril mediante `mithril.downloadMaxBytes` en `dingo.yaml`, `--mithril-download-max-bytes` en la línea de comandos o `DINGO_MITHRIL_DOWNLOAD_MAX_BYTES` en el entorno. El valor `0` utiliza los límites integrados: `512 GiB` para `v1`; en `v2`, `1 GiB` para archivos inmutables, `256 MiB` para la lista de resúmenes y `64 GiB` para datos auxiliares. Un valor positivo en bytes sustituye el límite integrado para cada objeto descargado. Un valor negativo no es válido y hace fallar la validación de la configuración.

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
