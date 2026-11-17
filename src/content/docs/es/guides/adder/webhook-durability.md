---
title: Entrega de webhooks segura frente a reinicios
description: Configuración, funcionamiento y recuperación de las entregas duraderas de webhooks de Adder.
---

# Entrega de webhooks segura frente a reinicios

La configuración de `plugins.output.webhook.state-path` permite a Adder conservar en un archivo SQLite persistente las entregas de webhooks que haya añadido a la cola de salida durante los reinicios.

```yaml
output: webhook
plugins:
  output:
    webhook:
      url: "https://example.org/adder-hook"
      format: "adder"
      state-path: "/var/lib/adder/webhook.sqlite"
      max-pending: 1024
```

Con `state-path`, Adder da formato a cada evento una vez, añade el cuerpo de la solicitud a SQLite y después lo envía. Adder realiza la adición mediante una [transacción de SQLite](https://www.sqlite.org/lang_transaction.html). Después de recibir una respuesta HTTP `2xx`, la salida elimina explícitamente esa entrada. Una respuesta HTTP `2xx` indica que el receptor aceptó la solicitud según las [semánticas de HTTP](https://www.rfc-editor.org/rfc/rfc9110.html); no demuestra que el receptor haya terminado el trabajo posterior. Al reiniciar, `Start` reproduce las entradas pendientes en su orden original antes de devolver el control. Si el proceso no puede completar la reproducción, el inicio falla y SQLite conserva las entradas pendientes.

El modo durable rechaza las redirecciones que cambian `POST` a un `GET` sin cuerpo; las redirecciones `307` y `308` pueden conservar el cuerpo de la solicitud.

Cada ejecución de entrega usa la política de reintentos existente: un intento inicial y hasta tres reintentos para fallos transitorios. Si una respuesta terminal o el agotamiento del límite de reintentos impiden la entrega, la salida informa de un fallo terminal, detiene el pipeline y conserva la entrada en SQLite. Un reinicio con la misma URL y el mismo formato vuelve a intentarlo. Durante una detención normal, Adder persiste los eventos posteriores que ya aceptó en el búfer de salida. Un fallo del proceso aún puede perder eventos anteriores a la adición en SQLite, incluidos los eventos de los canales del pipeline o de salida; esta opción no convierte el cursor de chainsync y la adición en SQLite en una sola transacción atómica.

## Validación y apagado seguro

Antes de procesar un evento, Adder comprueba que la carga útil y el contexto coincidan con el tipo de evento. Rechaza las cargas útiles nulas o inesperadas, los contextos nulos cuando son necesarios, los contextos inesperados y los tipos de evento desconocidos. El complemento envía estos errores a su canal de errores sin provocar un pánico; si el canal está lleno, Adder registra el error.

Adder propaga como errores los fallos al formatear o serializar un evento y los fallos al preparar o transportar una entrega. En el modo durable, un fallo antes de guardar la entrega impide que Adder la añada a SQLite; un fallo durante la reproducción deja la entrada pendiente para conservar la recuperación existente.

`Start` y `Stop` protegen el estado del ciclo de vida y los canales compartidos. `Stop` indica al trabajador que termine, espera su finalización y cierra los canales compartidos después. El apagado también cancela las esperas entre reintentos, por lo que Adder no inicia otra espera cuando el complemento ya se está deteniendo. Esta cancelación no confirma la recepción: las entradas que SQLite ya guardó siguen el contrato de reproducción y entrega al menos una vez documentado en esta página.

La cola tiene un límite estricto de entradas `max-pending` (mínimo `11`, valor predeterminado `1024`) y un límite de `16 MiB` por entrada codificada. `state-path` debe apuntar a un archivo SQLite persistente en disco, no a una base de datos en memoria como `:memory:`. La configuración debe proporcionar un nombre de archivo simple; Adder rechaza los URI de SQLite y los parámetros de consulta DSN para impedir que la configuración cambie los ajustes de almacenamiento o durabilidad de la cola.

El archivo de estado debe estar en un directorio que otros usuarios locales no puedan modificar. En Unix, Adder comprueba la propiedad y los permisos de cada componente de la ruta, y rechaza que el directorio padre inmediato sea un enlace simbólico. Adder permite un antecesor `sticky` cuya propiedad corresponde a `root`, como `/tmp`. Antes de abrir el almacén, Adder restringe los permisos del archivo de base de datos y de cualquier archivo auxiliar de diario de SQLite existente para que solo el propietario pueda acceder. Durante la inspección al iniciar, Adder rechaza un archivo de estado o un archivo auxiliar existente que sea un enlace simbólico. Las comprobaciones de modo de Unix no inspeccionan las ACL extendidas; las ACL deben impedir el acceso de escritura a otra cuenta. En Windows, la ACL del directorio debe conceder acceso de escritura únicamente a la cuenta de Adder; Adder no valida las ACL de directorio.

Estas comprobaciones no protegen contra otro proceso que se ejecute como el usuario de Adder y cambie los archivos mientras Adder se inicia.

Cuando la cola se llena o SQLite no puede persistir un evento, la salida falla en lugar de descartarlo silenciosamente. Las entradas pendientes no caducan automáticamente; permanecen hasta que el receptor devuelve un acuse `2xx` o un operador las elimina explícitamente. Adder elimina inmediatamente una entrada entregada. Cada proceso de Adder debe usar un `state-path` diferente y Adder debe conservar el archivo de base de datos durante los reinicios. Adder rechaza un cambio de URL o formato para un archivo de estado existente, para impedir que las entregas antiguas lleguen a un destino diferente. Un destino nuevo requiere un archivo de estado independiente.

Cada entrega en cola incluye un encabezado `X-Adder-Delivery-ID` estable durante los reintentos y los reinicios. Si un proceso termina después de que el receptor acepta una solicitud, pero antes de que SQLite registre su acuse, la reproducción puede enviarla de nuevo. Los receptores pueden deduplicar mediante este encabezado; la salida proporciona intentos de entrega al menos una vez para las entradas persistidas, no efectos exactamente una vez. Adder pone en cola un evento de rollback después de los eventos de bloque anteriores y no los elimina. Los consumidores deben aplicar el rollback a su propio estado.

Para verificar la recuperación:

1. Configura un receptor de prueba para que devuelva `500`, envía un evento y confirma que la salida falla mientras la entrada permanece en el archivo SQLite.
2. Reinicia con el receptor devolviendo `200` y comprueba que recibe el mismo `X-Adder-Delivery-ID`.
3. Consulta el archivo SQLite con:

   ```sql
   SELECT COUNT(*) FROM queue WHERE name = 'webhook.pending';
   ```

   El resultado debe ser cero.

Las pruebas del paquete cubren esta secuencia, la persistencia correcta de los eventos almacenados en el búfer, la identidad del destino y la reproducción ordenada de SQLite sin un servicio externo.

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>