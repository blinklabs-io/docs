# Salida de Kafka

La salida `kafka` publica eventos seleccionados de Adder como JSON en un topic de Kafka. El topic debe existir antes de iniciar Adder.

## Configuración

Configure la salida con `output: kafka` y las opciones del plugin en `plugins.output.kafka`:

```yaml
output: kafka
plugins:
  output:
    kafka:
      brokers: "127.0.0.1:9092"
      topic: "adder.events"
      event-types: "blocks,rollbacks,governance"
```

Los parámetros admiten los siguientes valores:

- `brokers`: lista de direcciones de bootstrap de Kafka separadas por comas, con el formato `host:port`. El valor predeterminado es `127.0.0.1:9092`.
- `topic`: topic de Kafka que recibe los eventos. El valor predeterminado es `adder.events`.
- `username` y `password`: credenciales opcionales de SASL PLAIN. Configure ambos valores juntos y active `tls`; Adder requiere TLS cuando se usan estas credenciales. Administre los secretos mediante una configuración para secretos.
- `tls`: activa TLS para las conexiones con los brokers cuando se establece en `true`. El valor predeterminado es `false`.
- `event-types`: tipos de eventos separados por comas. El valor predeterminado es `blocks,rollbacks,governance`. También puede seleccionar `transactions`, `drep-registration`, `drep-update` y `drep-retirement`.

## Entrega de eventos

Cada valor de registro contiene el JSON completo del evento de Adder. La clave siempre es `adder.events`.

Con un número de particiones del topic que no cambie, los registros de un productor de Adder llegan a una sola partición y conservan su secuencia entre los tipos de eventos. No aumente el número de particiones del topic si necesita ese orden. Varios procesos de Adder no comparten un orden total.

El productor solicita confirmación de todas las réplicas en sincronización (`acks=all`) y usa un productor idempotente para sus reintentos internos.

Adder espera el resultado de cada registro antes de leer el siguiente evento seleccionado. Cada envío tiene un plazo de diez segundos. Adder informa la entrega rechazada o incierta mediante el canal de errores del plugin.

Adder no vuelve a enviar un registro fallido en el nivel de la aplicación. El broker puede haber recibido el registro antes de que se pierda la respuesta, y un envío nuevo no compartiría el número de secuencia del productor original. El cliente puede reconectarse para procesar eventos posteriores.

Los eventos almacenados en búfer no se recuperan después del apagado o reinicio. Una confirmación correcta confirma la política de replicación configurada en el broker, no el procesamiento por parte de los consumidores.