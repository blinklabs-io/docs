# ---
# title: Entrega de webhooks segura frente a reinicios
# description: Configuración, funcionamiento y recuperación de las entregas duraderas de webhooks de Adder.
# ---
#
# # Entrega de webhooks segura frente a reinicios
#
# Configura `plugins.output.webhook.state-path` con un archivo SQLite persistente para conservar las entregas de webhooks que hayan entrado en la cola de salida durante los reinicios.
#
# ```yaml
# output: webhook
# plugins:
#   output:
#     webhook:
#       url: "https://example.org/adder-hook"
#       format: "adder"
#       state-path: "/var/lib/adder/webhook.sqlite"
#       max-pending: 1024
# ```
#
# Con `state-path`, Adder da formato a cada evento una vez, añade el cuerpo de la solicitud a SQLite y después lo envía. La adición usa una [transacción de SQLite](https://www.sqlite.org/lang_transaction.html). Después de recibir una respuesta HTTP `2xx`, la salida elimina explícitamente esa entrada. Una respuesta HTTP `2xx` indica que el receptor aceptó la solicitud según las [semánticas de HTTP](https://www.rfc-editor.org/rfc/rfc9110.html); no demuestra que el receptor haya terminado el trabajo posterior. Al reiniciar, `Start` reproduce las entradas pendientes en su orden original antes de devolver el control. Si la reproducción no puede completarse, el inicio falla y las entradas pendientes permanecen en SQLite.
#
# El modo durable rechaza las redirecciones que cambian `POST` a un `GET` sin cuerpo; las redirecciones `307` y `308` pueden conservar el cuerpo de la solicitud.
#
# La política de reintentos existente se aplica a cada ejecución de entrega: un intento inicial y hasta tres reintentos para fallos transitorios. Si una respuesta terminal o el agotamiento del límite de reintentos impide la entrega, la salida informa de un fallo terminal, detiene el pipeline y conserva la entrada en SQLite. Un reinicio con la misma URL y el mismo formato vuelve a intentarlo. Durante una detención normal, Adder persiste los eventos posteriores que ya aceptó en el búfer de salida. Un fallo del proceso aún puede perder eventos anteriores a la adición en SQLite, incluidos los eventos de los canales del pipeline o de salida; esta opción no convierte el cursor de chainsync y la adición en SQLite en una sola transacción atómica.
#
# La cola tiene un límite estricto de entradas `max-pending` (mínimo `11`, valor predeterminado `1024`) y un límite de `16 MiB` por entrada codificada. `state-path` debe apuntar a un archivo SQLite en disco, no a una base de datos en memoria. Proporciona un nombre de archivo simple; Adder rechaza los URI de SQLite y los parámetros de consulta DSN para impedir que la configuración cambie los ajustes de almacenamiento o durabilidad de la cola.
#
# Coloca el archivo de estado en un directorio que otros usuarios locales no puedan modificar. En Unix, Adder comprueba la propiedad y los permisos de cada componente de la ruta, y rechaza que el directorio padre inmediato sea un enlace simbólico. Adder permite un antecesor `sticky` propiedad de `root`, como `/tmp`. Antes de abrir el almacén, Adder restringe los permisos del archivo de base de datos y de cualquier archivo auxiliar de diario de SQLite existente para que solo el propietario pueda acceder. Durante la inspección al iniciar, Adder rechaza un archivo de estado o un archivo auxiliar existente que sea un enlace simbólico. Las comprobaciones de modo de Unix no inspeccionan las ACL extendidas; garantiza que estas no concedan acceso de escritura a otra cuenta. En Windows, configura una ACL de directorio que conceda acceso de escritura únicamente a la cuenta de Adder; Adder no valida las ACL de directorio.
#
# Estas comprobaciones no protegen contra otro proceso que se ejecute como el usuario de Adder y cambie los archivos mientras Adder se inicia.
#
# Cuando la cola se llena o SQLite no puede persistir un evento, la salida falla en lugar de descartarlo silenciosamente. Las entradas pendientes no caducan automáticamente; permanecen hasta que reciben un acuse `2xx` o un operador las elimina explícitamente. Adder elimina inmediatamente una entrada entregada. Usa un proceso de Adder por cada `state-path` y conserva el archivo de base de datos durante los reinicios. Adder rechaza un cambio de URL o formato para un archivo de estado existente, para impedir que las entregas antiguas lleguen a un destino diferente. Usa un archivo de estado independiente para un destino nuevo.
#
# Cada entrega en cola incluye un encabezado `X-Adder-Delivery-ID` estable durante los reintentos y los reinicios. Si un proceso se detiene después de que el receptor acepta una solicitud, pero antes de que SQLite registre su acuse, la reproducción puede enviarla de nuevo. Los receptores pueden deduplicar mediante este encabezado; la salida proporciona intentos de entrega al menos una vez para las entradas persistidas, no efectos exactamente una vez. Adder pone en cola un evento de rollback después de los eventos de bloque anteriores y no los elimina. Los consumidores deben aplicar el rollback a su propio estado.
#
# Para verificar la recuperación:
#
# 1. Configura un receptor de prueba para que devuelva `500`, envía un evento y confirma que la salida falla mientras la entrada permanece en el archivo SQLite.
# 2. Reinicia con el receptor devolviendo `200` y comprueba que recibe el mismo `X-Adder-Delivery-ID`.
# 3. Consulta el archivo SQLite con:
#
#    ```sql
#    SELECT COUNT(*) FROM queue WHERE name = 'webhook.pending';
#    ```
#
#    Confirma que el resultado es cero.
#
# Las pruebas del paquete cubren esta secuencia, la persistencia correcta de los eventos almacenados en el búfer, la identidad del destino y la reproducción ordenada de SQLite sin un servicio externo.
#
# ---
#
# <!-- doc-holiday-watermark -->
# <p align="center">
#   <a href="https://doc.holiday">
#     <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
#   </a>
# </p>
# <p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>