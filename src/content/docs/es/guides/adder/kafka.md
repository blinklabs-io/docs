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

Los parámetros admiten los siguientes valores y validaciones:

- `brokers`: lista separada por comas de direcciones de bootstrap de Kafka válidas con el formato `host:port`. Cada entrada debe especificar un host y un puerto válidos. El valor predeterminado es `127.0.0.1:9092`.
- `topic`: topic de Kafka que recibe los eventos. El nombre debe tener entre 1 y 249 caracteres ASCII, que solo pueden ser letras, dígitos, puntos, guiones bajos o guiones, y no puede ser `.` ni `..`. El valor predeterminado es `adder.events`.
- `username` y `password`: credenciales opcionales de SASL PLAIN. La configuración debe incluir ambos valores y rechaza las credenciales incompletas. La configuración de estas credenciales exige `tls` en `true`. Proporcione los secretos mediante una configuración administrada para secretos.
- `tls`: activa TLS para las conexiones con los brokers. Establezca `tls` en `true` para habilitar TLS. El valor predeterminado es `false`.
- `event-types`: tipos de eventos separados por comas. Debe incluir al menos un tipo admitido; Adder rechaza los tipos desconocidos. El valor predeterminado es `blocks,rollbacks,governance`. También puede seleccionar `transactions`, `drep-registration`, `drep-update` y `drep-retirement`.

Antes de iniciar la lectura de eventos, Adder hace ping a los brokers configurados para comprobar la conectividad. Si la comprobación falla, la salida no comienza a procesar eventos.

## Entrega de eventos

Cada valor de registro contiene el JSON completo del evento de Adder. La clave siempre es `adder.events`.

Con un número de particiones del topic que no cambie, los registros de un productor de Adder llegan a una sola partición y conservan su secuencia entre los tipos de eventos. No aumente el número de particiones del topic si necesita ese orden. Varios procesos de Adder no comparten un orden total.

El productor solicita confirmación de todas las réplicas en sincronización (`acks=all`) y el cliente Kafka usa un productor idempotente para sus reintentos internos. Estos reintentos del cliente no equivalen a un reenvío de Adder.

Adder espera el resultado de cada registro antes de leer el siguiente evento seleccionado. Cada envío tiene un plazo de diez segundos. Cuando la entrega se rechaza o queda incierta, Adder registra el error y lo envía mediante el canal de errores del plugin.

Adder no vuelve a enviar un registro fallido en el nivel de la aplicación. El broker puede haber recibido el registro antes de que el cliente pierda la respuesta, y un envío nuevo no compartiría el número de secuencia del productor original. El cliente puede reconectarse para procesar eventos posteriores.

Durante el apagado, Adder cancela cualquier envío de Kafka en curso y cierra el cliente Kafka.
Adder no recupera los eventos almacenados en búfer después del apagado o reinicio. Una confirmación correcta confirma la política de replicación configurada en el broker, no el procesamiento por parte de los consumidores.

## Navegación

- Consulte la [referencia de comandos](./006-command_list.md) para conocer las opciones de `kafka` disponibles en la línea de comandos.
- Consulte el [resumen de los modos de funcionamiento](./002-operating-mode-overview.md) para ubicar las salidas dentro de Adder.

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
