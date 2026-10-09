---
title: Encuestas CIP-179 en el monedero de Bursa
description: Consultar, responder, crear, cancelar y revelar encuestas CIP-179 desde el monedero de Bursa y su API.
---

# Encuestas CIP-179 en el monedero de Bursa

Esta guía describe el flujo funcional y la API de las encuestas y sondeos `CIP-179` en el monedero de Bursa. El monedero lee las encuestas desde el nodo integrado y permite consultar sus resultados, responder, crear y cancelar encuestas, además de revelar respuestas selladas.

## Requisitos y comportamiento

- Las consultas leen el historial local del nodo integrado. El monedero no contacta un servicio externo para descubrir, buscar o consultar encuestas.
- El nodo debe estar en un estado consultable para listar encuestas, abrir detalles y revelar respuestas.
- Las operaciones que crean transacciones necesitan un nodo completamente sincronizado y una billetera con una semilla local para firmar.
- El nodo indexa localmente el historial de encuestas. Mientras la indexación continúa, la lista muestra los resultados encontrados hasta ese momento y la respuesta de la API incluye `partial: true`. El detalle espera a que termine la indexación.
- La interfaz no puede responder preguntas que usan un método personalizado. Si una encuesta contiene una pregunta personalizada obligatoria, el monedero no permite responderla.
- La encuesta identifica los roles que pueden responder. El monedero solo ofrece los roles para los que la billetera activa tiene las credenciales necesarias.

## Flujo de la billetera

### Explorar y filtrar encuestas

1. Abra la vista de encuestas para consultar las encuestas y los sondeos que el nodo ha indexado.
2. Busque por título, descripción o identificador de encuesta.
3. Filtre por `open`, `closed` o `cancelled`.
4. Use la paginación para recorrer las coincidencias.
5. Abra una encuesta para consultar su descripción, estado, fecha de finalización expresada como época, roles, propietario, identificador, preguntas y resultados.

La lista marca las encuestas selladas, las encuestas propias y las encuestas vinculadas a acciones de gobernanza. Una acción de gobernanza puede enlazar una encuesta mediante un documento de anclaje `CIP-108`; el enlace solo anuncia la encuesta y no cambia los roles que pueden responder.

### Responder

1. Abra una encuesta con estado `open`.
2. Seleccione un rol disponible para la billetera activa.
3. Responda las preguntas compatibles o déjelas sin respuesta para abstenerse.
4. Responda al menos una pregunta. El monedero no publica una respuesta que se abstenga en todas las preguntas.
5. Revise la vista previa y confirme la transacción. El monedero firma y envía la transacción después de la confirmación.

La interfaz admite preguntas de selección única, selección múltiple, clasificación, rango numérico, asignación de puntos y valoración. Una pregunta personalizada requiere un método que este monedero no implementa.

Cuando la encuesta usa respuestas selladas, el monedero cifra las respuestas en el dispositivo. Cualquier persona puede abrirlas después de que pase la hora de revelación indicada por la ronda de Drand.

### Crear una encuesta

1. Seleccione la acción para crear una encuesta.
2. Introduzca el título, la descripción, los roles, la época final y las preguntas.
3. Opcionalmente, añada un documento de presentación mediante `anchor_uri` y `anchor_document`.
4. Opcionalmente, configure el sellado con una ronda y un tamaño de relleno.
5. Revise la vista previa y confirme la transacción.

La API devuelve una vista previa pendiente para que el monedero revise y confirme la operación. El monedero necesita una semilla local y un nodo completamente sincronizado para crear la transacción.

### Cancelar una encuesta

El propietario puede cancelar su encuesta mientras permanece abierta. Abra el detalle de una encuesta propia, seleccione la cancelación y confirme la vista previa pendiente. Solo la clave de pago del propietario activo puede cancelar la encuesta. Una encuesta cancelada conserva sus datos, pero el monedero no calcula su recuento de respuestas.

### Revelar respuestas selladas

Cuando finaliza la ronda de revelación, el detalle muestra la opción para revelar las respuestas selladas:

- Marque el consentimiento para que el monedero obtenga el beacon desde `api.drand.sh`. El monedero contacta ese servicio externo solo después de recibir este consentimiento.
- Pegue la firma del beacon en formato hexadecimal para evitar la consulta externa. Esta opción no necesita consentimiento.

El monedero envía la solicitud de revelación y actualiza el detalle con los resultados abiertos. Si la encuesta no tiene respuestas selladas pendientes, la vista de revelación no aparece.

## Referencia de la API

Las rutas usan el prefijo `/wallet`.

### Listar encuestas

`GET /wallet/surveys`

La ruta lee las encuestas del nodo integrado, aplica los filtros y devuelve una página de resúmenes.

| Parámetro | Tipo | Descripción |
| --- | --- | --- |
| `q` | `string` | Busca coincidencias en `title`, `description` o `id`. |
| `status` | `open`, `closed` o `cancelled` | Conserva las encuestas con el estado indicado. |
| `page` | `number` | Selecciona la página. La primera página es `1`. |
| `count` | `number` | Solicita el número de elementos por página. |
| `linked` | `true` | Conserva solo las encuestas vinculadas a acciones de gobernanza. |

El cliente serializa `linked` como `linked=true`; los demás parámetros usan sus nombres tal como aparecen en la tabla. La respuesta tiene esta forma:

```json
{
  "surveys": [],
  "total": 0,
  "page": 1,
  "count": 1,
  "partial": true
}
```

`surveys` contiene resúmenes. `total` indica cuántas encuestas coinciden antes de paginar; `page` y `count` describen la página devuelta. El campo opcional `partial` aparece como `true` mientras el nodo todavía indexa el historial y la API lo omite cuando la indexación termina.

Cada resumen contiene:

| Campo | Descripción |
| --- | --- |
| `id` | Identificador con formato `<hash de transacción>:<índice>`. |
| `tx_hash` | Hash de la transacción que publicó la encuesta. |
| `index` | Índice de la encuesta dentro de esa transacción. |
| `title`, `description` | Título y descripción de la encuesta. |
| `owner` | Hash hexadecimal de la credencial del propietario. |
| `owner_script` | Indica si el propietario usa una credencial de script. |
| `roles` | Roles habilitados para responder. Los códigos son `0` DRep, `1` SPO, `2` CC, `3` stakeholder y `4` keyholder. |
| `end_epoch` | Última época en la que la encuesta acepta respuestas. |
| `status` | `open`, `closed` o `cancelled`. |
| `sealed` | Indica si la encuesta usa respuestas selladas. |
| `questions` | Número de preguntas. |
| `linked_actions` | Identificadores de las acciones de gobernanza que enlazan la encuesta. |
| `owned` | Indica si la clave de pago de la billetera activa posee la encuesta. |

### Consultar el detalle y los resultados

`GET /wallet/surveys/{id}`

Sustituya `{id}` por el identificador completo de la encuesta y codifíquelo como un segmento de URL. La respuesta combina el resumen con:

- `definition`: título, descripción, `roles`, `end_epoch`, `mode`, `questions` y el anclaje opcional de presentación.
- `tally`: resultados agrupados por rol y exclusiones de respuestas. La API omite `tally` para una encuesta cancelada porque no calcula sus respuestas.

Cada elemento de `tally.roles` informa el rol, el número de respuestas, el número de respuestas todavía selladas y los resultados de cada pregunta. Cada resultado de pregunta informa respuestas, abstenciones y, cuando corresponde, recuentos por opción o los valores numéricos mínimo, máximo y suma. `tally.excluded` identifica cada respuesta excluida con su transacción, rol, credencial y motivo.

El modo de una encuesta tiene `sealed`, la ronda opcional de Drand en `round` y el tamaño opcional de relleno en `padding_size`. Cada pregunta puede incluir `kind`, `prompt`, `options`, `option_count`, `min`, `max`, `budget`, `range`, `scale`, `require_all`, `anchor` y `required`, según la definición de la encuesta.

### Enviar una respuesta

`POST /wallet/surveys/respond`

Envíe un objeto con estos campos:

```json
{
  "survey": "<hash de transacción>:<índice>",
  "role": 0,
  "answers": [
    {
      "kind": 1,
      "question": 0,
      "choice": 2
    }
  ]
}
```

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `survey` | `string` | Identificador completo de la encuesta. |
| `role` | `0` a `4` | Rol con el que responde la billetera. |
| `answers` | `array` | Respuestas a las preguntas contestadas. Cada elemento contiene `kind` y `question`, además de `choice`, `indices`, `number` o `pairs` según el tipo de pregunta. |

Los elementos de `pairs` contienen `option` y `value`. `choice` representa una opción única; `indices` representa índices para selección múltiple o clasificación; `number` representa una respuesta numérica; y `pairs` representa asignación de puntos o valoración. El monedero no puede contestar preguntas de tipo personalizado (`kind: 0`).

La ruta devuelve una vista previa pendiente. El cliente debe mostrarla para confirmación y completar después la firma y el envío de la transacción.

### Crear una encuesta

`POST /wallet/surveys/create`

Envíe un objeto con:

| Campo | Tipo | Obligatorio | Descripción |
| --- | --- | --- | --- |
| `title` | `string` | Sí | Título de la encuesta. |
| `description` | `string` | Sí | Descripción de la encuesta. |
| `roles` | `array` | Sí | Roles que pueden responder. |
| `end_epoch` | `number` | Sí | Época final para las respuestas. |
| `questions` | `array` | Sí | Definiciones de las preguntas. |
| `anchor_uri` | `string` | No | URI del documento de presentación. |
| `anchor_document` | `string` | No | Contenido del documento de presentación; su hash se registra en la cadena. |
| `seal` | `{ round, padding_size }` | No | Configura respuestas selladas con la ronda de Drand y el tamaño de relleno. |

La ruta devuelve una vista previa pendiente para confirmación. Después de confirmar, la billetera firma y envía la transacción.

### Cancelar una encuesta

`POST /wallet/surveys/cancel`

Envíe:

```json
{
  "survey": "<hash de transacción>:<índice>"
}
```

La ruta devuelve una vista previa pendiente. La operación solo funciona para una encuesta abierta que pertenece a la clave de pago de la billetera activa.

### Revelar respuestas

`POST /wallet/surveys/{id}/reveal`

Envíe un objeto con uno de estos campos:

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `consent` | `boolean` | Autoriza la obtención del beacon de Drand desde el relay público. |
| `beacon` | `string` | Firma del beacon pegada en formato hexadecimal. Evita la consulta al relay. |

El identificador de la ruta determina la encuesta. La API devuelve el detalle actualizado y sus resultados cuando puede verificar y abrir las respuestas selladas.

## Estados y errores admitidos

- **Solicitud incorrecta:** el monedero rechaza un cuerpo JSON inválido o campos que no cumplen la solicitud de la ruta.
- **Encuesta no encontrada:** el identificador no corresponde a una encuesta válida o indexada.
- **Consentimiento requerido:** la revelación necesita `consent` cuando la solicitud no incluye una firma `beacon` pegada.
- **Indexación en curso:** la lista puede devolver datos parciales con `partial: true`; el detalle espera a que el nodo termine de leer el historial.
- **Nodo no disponible o no preparado:** las rutas de lectura y revelación requieren un nodo consultable. Las rutas de respuesta, creación y cancelación requieren además un nodo completamente sincronizado y una semilla local para firmar.

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>