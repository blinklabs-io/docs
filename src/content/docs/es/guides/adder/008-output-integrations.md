---
title: Integraciones de salida de Adder
description: Referencia de configuración y entrega para las integraciones de salida de Adder.
---

# Integraciones de salida de Adder

Esta referencia describe la configuración y el comportamiento de entrega de las integraciones de salida de Adder para PostgreSQL, MQTT, RabbitMQ, Google Cloud Pub/Sub, Elasticsearch, S3, AWS SQS/SNS y Redis Streams.

## PostgreSQL

La salida `postgres` agrega los eventos seleccionados de Adder a `adder_events` en una base de datos PostgreSQL existente. Adder crea la tabla y el índice temporal al iniciarse.

Cuando la conexión TCP usa una contraseña, la cadena de conexión debe exigir TLS. `sslmode=prefer`, que pgx usa de forma predeterminada, puede cambiar a texto sin cifrar. La configuración debe usar `sslmode=verify-full` y un certificado raíz adecuado para verificar la identidad del servidor.

```yaml
plugins:
  output:
    postgres:
      database-url: postgres://adder:secret@localhost:5432/adder?sslmode=require
      event-types: blocks,transactions,rollbacks,governance
```

`database-url` no tiene valor predeterminado. El valor predeterminado de `event-types` es `blocks,transactions,rollbacks,governance,drep-registration,drep-update,drep-retirement`.

El esquema contiene `arrival_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY`, `event_hash text`, `schema_version smallint` (actualmente `1`), `event_type text`, `event_time timestamptz` y `event_json jsonb`. Adder conserva todos los eventos seleccionados, incluido `input.rollback`, como registros de solo adición. Un rollback no elimina las filas históricas; los consumidores aplican los registros de rollback para obtener el estado activo de la cadena al reproducir las filas en orden de `arrival_id` para un único escritor de salida. Este orden también se mantiene cuando las marcas de tiempo se repiten o retroceden. Varios escritores simultáneos no proporcionan un orden global de la cadena. Las formas de almacenamiento incompatibles futuras requieren una nueva versión del esquema y una migración explícita.

Adder ejecuta cada evento mediante una sentencia `INSERT` y, por tanto, una transacción de PostgreSQL. La salida no usa un lote ni un temporizador de vaciado. El canal de entrada compartido almacena como máximo diez eventos; el productor espera a que haya espacio. Adder guarda en `event_hash` el SHA-256 del JSON completo para comparar los bytes codificados por Go, mientras que PostgreSQL normaliza la representación almacenada en `jsonb`. Adder conserva todos los eventos recibidos, incluidos los duplicados idénticos. Así, un bloque reaplicado después de un rollback se conserva aunque su JSON coincida con el bloque anterior. Adder no recibe un identificador de ocurrencia ascendente que distinga una retransmisión de una reaplicación.

Cada sentencia tiene un plazo de diez segundos. La salida comunica las inserciones fallidas mediante el canal de errores del plugin y no las conserva localmente para reintentarlas. Al detenerse, cancela la sentencia en curso y descarta los eventos en cola. La cuenta de la base de datos necesita permisos de propietario o permisos DDL adecuados para configurar el esquema al iniciarse, permiso `INSERT` en la tabla y permiso para usar la secuencia de identidad.

## MQTT

La salida `mqtt` publica los eventos seleccionados de Adder como JSON en topics MQTT y usa MQTT 5.

```yaml
output: mqtt
plugins:
  output:
    mqtt:
      broker: mqtt://127.0.0.1:1883
      client-id: adder-output
      topic-prefix: adder/events
      qos: 1
      event-types: blocks,rollbacks,governance
```

Los topics predeterminados son `adder/events/block`, `adder/events/rollback` y `adder/events/governance`. Adder también permite seleccionar `transactions`, `drep-registration`, `drep-update` y `drep-retirement`. Cada carga contiene el JSON completo del evento de Adder. La salida no establece la marca MQTT `RETAIN`.

`broker` acepta URL `mqtt://` y `tls://`; su valor predeterminado es `mqtt://127.0.0.1:1883`. `client-id` usa `adder-output` de forma predeterminada. `username` y `password` son opcionales y tienen como valor predeterminado una cadena vacía, pero las credenciales requieren `tls://`. `topic-prefix` usa `adder/events` de forma predeterminada y `qos` usa `1`. Cada instancia de Adder en ejecución debe tener un `client-id` distinto, porque el broker MQTT desconecta una sesión existente cuando otro cliente se conecta con el mismo identificador.

El valor de `qos` puede ser `0`, `1` o `2`. Con QoS 1, una publicación completada significa que el broker envió `PUBACK`; con QoS 2, significa que el broker completó el intercambio de QoS 2. Ninguno de los dos confirma la entrega a los suscriptores. Con QoS 0, la finalización no incluye una confirmación del broker. La salida comunica mediante el canal de errores los eventos desconectados y las publicaciones fallidas, y no los reproduce desde un almacenamiento duradero. La salida se reconecta antes del siguiente evento si la conexión se interrumpe.

Si una confirmación agota el tiempo de espera, la entrega queda en estado incierto y la salida comunica el fallo. La salida no usa la cola de publicaciones opcional de Paho. Con QoS 2, también comunica como resultado incierto una respuesta `PUBCOMP 0x92`: el protocolo permite esa respuesta durante la recuperación, pero en otros casos indica una discrepancia de sesión.

El prefijo de topic debe contener niveles no vacíos y no puede contener los comodines MQTT `+` ni `#`. La salida agrega el tipo de evento como último nivel del topic.

## RabbitMQ

La salida `rabbitmq` publica los eventos seleccionados de Adder como JSON mediante AMQP 0-9-1.

```yaml
output: rabbitmq
plugins:
  output:
    rabbitmq:
      url: amqp://127.0.0.1:5672/
      exchange: ""
      routing-key: adder.events
      persistent: true
      event-types: blocks,rollbacks,governance
```

La configuración requiere `url`, `exchange` y `routing-key`. El exchange predeterminado (`exchange: ""`) enruta por nombre de cola; la cola de destino debe existir antes de iniciar Adder. Un exchange con nombre y sus bindings también deben existir. La salida no crea la topología del broker. La conexión debe usar `amqps://` fuera de una red de confianza.

La selección de eventos predeterminada es `blocks,rollbacks,governance`. Adder también permite seleccionar `transactions`, `drep-registration`, `drep-update` y `drep-retirement`. `persistent` tiene el valor predeterminado `true`. La persistencia requiere una cola de destino durable y una configuración adecuada del broker; un mensaje persistente por sí solo no garantiza la durabilidad.

La salida activa las confirmaciones del publicador y el enrutamiento obligatorio. La salida notifica como fallo cualquier mensaje que el broker no pueda enrutar, aunque el broker también confirme la publicación. Una confirmación del broker significa que el broker aceptó el mensaje, no que un consumidor lo procesó. La salida comunica en su canal de errores una confirmación negativa, una conexión cerrada o un plazo de diez segundos agotado. El siguiente evento vuelve a conectarse. La salida no reintenta automáticamente los fallos ambiguos porque volver a publicar puede duplicar la entrega. Adder no conserva una cola de salida persistente, por lo que puede perder eventos pendientes al reiniciarse.

Una prueba en vivo requiere una cola durable, el exchange predeterminado configurado y su nombre como `routing-key`. La prueba publica un evento seleccionado y consume su JSON. Una clave de enrutamiento sin binding debe provocar que la salida notifique el retorno obligatorio.

## Google Cloud Pub/Sub

La salida `pubsub` envía los eventos seleccionados de Adder a un único topic de Pub/Sub existente y usa [Application Default Credentials](https://cloud.google.com/docs/authentication/application-default-credentials).

```yaml
output: pubsub
plugins:
  output:
    pubsub:
      project-id: my-project
      topic-id: adder-events
      event-types: blocks,rollbacks,governance
```

`project-id` y `topic-id` no tienen valores predeterminados y deben identificar un topic existente. El valor predeterminado de `event-types` es `blocks,rollbacks,governance`.

Pub/Sub usa el topic `projects/{project-id}/topics/{topic-id}`. La salida envía el JSON completo del evento de Adder como `Data` del mensaje y establece el atributo `event_type`. El identificador del proyecto puede ser un [ID de proyecto o número de proyecto](https://cloud.google.com/pubsub/docs/pubsub-basics); también acepta identificadores antiguos con ámbito de dominio como `example.com:my-project`. Adder también permite seleccionar `transactions`, `drep-registration`, `drep-update` y `drep-retirement`. Los rollbacks permanecen como registros de eventos independientes; los consumidores deciden cómo afectan a los eventos anteriores.

La salida espera a `PublishResult.Get` antes de aceptar el siguiente evento. Esta operación termina cuando el servicio acepta o rechaza el mensaje; no confirma que un suscriptor lo haya procesado. El umbral de mensajes del publicador es uno, por lo que la salida no agrupa eventos de forma intencionada. Cada solicitud tiene un plazo de diez segundos. La salida comunica los fallos mediante el canal de errores y no ofrece una reproducción local duradera.

Al apagarse, la salida deja de aceptar eventos y espera hasta diez segundos a que termine el intento pendiente del publicador antes de cerrar el cliente. Una publicación aún puede completarse después de que la salida deje de esperar su resultado.

Los [límites actuales de Pub/Sub](https://cloud.google.com/pubsub/quotas) establecen un máximo de `10 MB` para el campo de datos de un mensaje y de `10 MB` para una solicitud de publicación. La salida comprueba el límite de datos; el servicio puede rechazar un mensaje cercano al límite cuando la sobrecarga de la solicitud supera el límite. El `topic-id` debe seguir las [reglas de nomenclatura documentadas](https://cloud.google.com/pubsub/docs/create-topic).

## Elasticsearch

La salida `elasticsearch` indexa los eventos seleccionados de Adder en un índice versionado. Al iniciarse, crea el índice con un mapeo estricto para `schema_version`, `event_type` y `event_time`. Guarda el evento completo en `event` como JSON de origen con la indexación desactivada, para evitar mapeos accidentales de campos de carga arbitrarios.

```yaml
output: elasticsearch
plugins:
  output:
    elasticsearch:
      url: https://elastic.example.org:9200
      index: adder-events-v1
      api-key: BASE64_ENCODED_API_KEY
      event-types: blocks,transactions,rollbacks,governance
```

El valor predeterminado de `url` es `http://127.0.0.1:9200`, el de `index` es `adder-events-v1`, el de `api-key` es una cadena vacía y el de `event-types` es `blocks,transactions,rollbacks,governance,drep-registration,drep-update,drep-retirement`.

El ID del documento es el SHA-256 del JSON completo del evento. La repetición del mismo JSON sobrescribe el mismo documento. Si cambia la marca de tiempo o la carga, Adder crea otro documento. Los rollbacks son documentos `input.rollback` independientes; la salida no elimina ni reescribe los eventos indexados anteriormente. Los clientes de búsqueda deben aplicar los eventos de rollback al obtener el estado activo de la cadena. Los resultados de búsqueda de Elasticsearch no proporcionan orden de inserción, por lo que esta salida por sí sola no sirve para reproducir la cadena en orden.

La salida no usa un búfer de lotes ni un temporizador de vaciado: espera la respuesta de cada documento antes de tomar el siguiente evento. El canal de entrada compartido almacena diez eventos. Cada solicitud de índice tiene un plazo de diez segundos y reintenta los errores de transporte y las respuestas HTTP `429`, `502`, `503` o `504` hasta cuatro veces con una breve espera entre intentos. El ID de documento determinista hace que un reintento no produzca copias adicionales; aun así, un plazo agotado puede dejar el resultado en estado incierto. La salida registra los fallos y los envía al canal de errores cuando el búfer de 16 entradas tiene espacio. Al detenerse, descarta los eventos en cola. Para un esquema incompatible, crea un índice nuevo `-vN` y actualiza la configuración; el plugin no migra los índices existentes.

La clave API requiere HTTPS y permisos para crear el índice e indexar documentos. Las referencias relevantes son la [API Create index](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-indices-create), la [API Index document](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-index) y las [recomendaciones de indexación para HTTP 429](https://www.elastic.co/docs/deploy-manage/production-guidance/optimize-performance/indexing-speed).

## S3

La salida `s3` escribe cada evento seleccionado de Adder como un objeto JSON UTF-8 con `Content-Type: application/json` y una suma de comprobación SHA-256 de S3. La salida usa la cadena normal de credenciales de AWS y la región configurada. El bucket debe existir antes de iniciar Adder.

```yaml
output: s3
plugins:
  output:
    s3:
      region: us-east-1
      bucket: adder-archive
      prefix: adder/events
      event-types: blocks,transactions,rollbacks,governance
```

El valor predeterminado de `region` y `bucket` es una cadena vacía. `prefix` usa `adder/events` de forma predeterminada y `event-types` usa `blocks,transactions,rollbacks,governance,drep-registration,drep-update,drep-retirement`.

La clave tiene el formato `<prefix>/YYYY/MM/DD/<UTC timestamp>-<SHA-256 of JSON>.json`. El JSON contiene los campos `timestamp`, `context`, `payload` y `type` de Adder. La fecha procede de la marca de tiempo del evento en UTC. Reproducir el mismo evento escribe los mismos bytes en la misma clave. Los eventos distintos con la misma marca de tiempo usan claves diferentes. Un rollback es un registro de archivo `input.rollback` ordinario; la salida no elimina ni reescribe los objetos archivados anteriormente. Los consumidores deben aplicar los registros de rollback al construir el estado de la cadena.

La salida no usa un búfer de lotes ni un vaciado en segundo plano: espera la respuesta de cada `PutObject` antes de tomar otro evento. El canal de entrada compartido del plugin puede contener diez eventos; el productor espera a que haya espacio. Al detenerse, cancela la carga en curso y descarta los eventos en cola. El SDK de AWS reintenta los errores reintentables durante esa solicitud, con un límite total de 30 segundos para la solicitud. La salida registra un error y lo comunica mediante el canal de errores cuando hay espacio; los fallos persistentes pueden llenar su búfer de 16 entradas y provocar la pérdida de notificaciones posteriores. Adder no conserva un evento fallido para reproducirlo y un plazo agotado deja la entrega en estado incierto. La reproducción de eventos entre reinicios del proceso requiere una fuente ascendente que permita la reproducción.

El permiso de AWS requerido es `s3:PutObject` sobre el prefijo seleccionado. Si el bucket usa SSE-KMS administrado por el cliente, la configuración de AWS debe conceder los permisos de KMS necesarios. La referencia relevante es la [API PutObject](https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutObject.html).

## Amazon SQS y SNS

`sqs` envía los eventos seleccionados de Adder a una cola. `sns` publica los eventos seleccionados en un topic. Ambas salidas usan la cadena de credenciales predeterminada de AWS. La configuración debe proporcionar las credenciales mediante un rol de IAM, un perfil o el entorno; Adder no almacena claves de acceso en su configuración.

La cola indicada por `queue-url` y el topic indicado por `topic-arn` deben existir antes de iniciar Adder. `region` y `group-id` tienen como valor predeterminado una cadena vacía. `event-types` usa `blocks,rollbacks,governance` de forma predeterminada y `max-message-bytes` usa `262144`.

```yaml
output: sqs
plugins:
  output:
    sqs:
      region: us-east-1
      queue-url: https://sqs.us-east-1.amazonaws.com/123456789012/adder.fifo
      group-id: chain
      event-types: blocks,rollbacks,governance
```

```yaml
output: sns
plugins:
  output:
    sns:
      region: us-east-1
      topic-arn: arn:aws:sns:us-east-1:123456789012:adder.fifo
      group-id: chain
      max-message-bytes: 262144
      event-types: blocks,rollbacks,governance
```

El JSON del evento ocupa `MessageBody` en [SQS SendMessage](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/API_SendMessage.html) o `Message` en [SNS Publish](https://docs.aws.amazon.com/sns/latest/api/API_Publish.html). Cada evento usa su propia llamada a la API; estas salidas no agrupan eventos ni mantienen una cola local duradera. El SDK gestiona sus reintentos transitorios normales dentro de un plazo de diez segundos por solicitud. La salida comunica las solicitudes fallidas mediante el canal de errores y no las reproduce. Un resultado correcto de la API significa que SQS aceptó un mensaje en la cola o que SNS aceptó una publicación para su distribución; no demuestra que un consumidor la haya recibido. Los rollbacks se publican como registros de eventos de rollback y los consumidores interpretan los eventos anteriores.

Los destinos FIFO requieren `group-id`. La salida proporciona el resumen SHA-256 del JSON completo del evento como `MessageDeduplicationId`; el servicio puede deduplicar un JSON idéntico durante su ventana de deduplicación. El servicio deduplica solo los reintentos del mismo JSON; un evento emitido de nuevo con una marca de tiempo diferente produce otro resumen. Los destinos estándar pueden omitir `group-id`. Al establecerlo en una [cola SQS estándar](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/API_SendMessage.html), el ajuste habilita las colas justas. En un [topic SNS estándar](https://docs.aws.amazon.com/sns/latest/api/API_Publish.html), SNS solo lo reenvía a suscripciones SQS estándar para las colas justas. Esto no proporciona orden FIFO ni deduplicación en destinos estándar. Adder también permite seleccionar `transactions`, `drep-registration`, `drep-update` y `drep-retirement`.

Los mensajes SQS tienen un límite de `1 MiB`. Los topics SNS tienen de forma predeterminada un límite de `256 KiB`. La [API SNS actual](https://docs.aws.amazon.com/sns/latest/api/API_Publish.html) permite configurar `MaximumMessageSize` de un topic hasta `1 MiB`; la configuración debe establecer `max-message-bytes` con el mismo valor cuando use esa capacidad. El servicio puede aplicar un límite menor en el destino y devolver un error.

## Redis Streams

La salida `redis` agrega los eventos seleccionados de Adder a un Redis Stream mediante [`XADD`](https://redis.io/docs/latest/commands/xadd/). `XADD` está disponible en Redis Open Source 5.0 y posteriores. El `username` ACL opcional requiere Redis 6.0 o posterior; la referencia [AUTH](https://redis.io/docs/latest/commands/auth/) describe este requisito. Esta salida no requiere extensiones de productor idempotente de Redis 8.6.

```yaml
output: redis
plugins:
  output:
    redis:
      address: "127.0.0.1:6379"
      stream: "adder.events"
      event-types: "blocks,rollbacks,governance"
```

La configuración usa `username` y `password` para la autenticación ACL de Redis, o solo `password` para el usuario predeterminado. Las credenciales requieren `tls: true`; el servidor debe usar [TLS de Redis](https://redis.io/docs/latest/operate/oss_and_stack/management/security/encryption/). Los tipos de eventos predeterminados son `blocks,rollbacks,governance`; Adder también permite seleccionar `transactions`, `drep-registration`, `drep-update` y `drep-retirement`.

Cada evento seleccionado produce una entrada `XADD` en el Stream configurado. Redis genera el ID de la entrada. El campo `type` contiene el tipo de evento de Adder y `event` contiene el JSON completo del evento. Una respuesta correcta de Redis confirma que Redis aceptó la adición; no confirma la persistencia en disco ni el consumo. Los consumidores pueden inspeccionar las entradas con [`XRANGE`](https://redis.io/docs/latest/commands/xrange/) o leerlas con [`XREAD`](https://redis.io/docs/latest/commands/xread/).

Cada adición tiene un plazo de cinco segundos. El cliente no reintenta los comandos; la salida envía el error al canal de errores del plugin. Si la conexión falla antes de que Redis reciba el comando, Redis no almacena el evento; si Redis pierde la respuesta, la entrega queda en estado incierto. Adder no reproduce automáticamente ninguno de los dos casos, porque repetir `XADD *` después de perder una respuesta puede crear un duplicado. Los eventos posteriores usan el grupo de conexiones del cliente y pueden volver a conectarse. La salida no recupera los eventos pendientes después de apagar o reiniciar el proceso. El operador de Redis administra el tamaño y la retención del Stream; esta salida no recorta las entradas.

Una comprobación en vivo inicia Redis, publica un evento seleccionado de Adder y ejecuta `XRANGE adder.events - +` para comprobar los campos de ID, `type` y JSON `event`. Después detiene Redis y verifica que Adder comunica un error de salida.