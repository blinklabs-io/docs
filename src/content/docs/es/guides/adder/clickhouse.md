---
title: Referencia de la salida ClickHouse
description: Configuración y comportamiento de la salida ClickHouse de Adder.
---

# Salida ClickHouse

## Descripción general

La salida `clickhouse` crea la tabla `adder_events_v1` en la base de datos de
ClickHouse seleccionada y escribe los eventos como filas `JSONEachRow` mediante
HTTP. Esta referencia describe la configuración YAML, el esquema de la tabla y
el comportamiento de lotes, errores, duplicados, rollbacks y apagado.

## Configuración

Configure la salida en YAML:

```yaml
output: clickhouse
plugins:
  output:
    clickhouse:
      url: https://clickhouse.example.org:8443
      database: analytics
      username: adder
      password: YOUR_PASSWORD
      event-types: blocks,transactions,rollbacks,governance
```

La salida admite estas claves:

| Clave | Valor predeterminado | Restricciones |
| --- | --- | --- |
| `url` | `http://127.0.0.1:8123` | Debe ser un origen `http://` o `https://` sin credenciales, ruta, consulta ni fragmento. |
| `database` | `default` | Debe nombrar una base de datos de ClickHouse y no puede contener espacios en blanco, `/` ni `\\`. |
| `username` | `default` | Debe contener un nombre de usuario no vacío. |
| `password` | `""` | Es opcional. Cuando contiene un valor, `url` debe usar `https://` fuera de `localhost` o de una dirección de loopback. |
| `event-types` | `blocks,transactions,rollbacks,governance,drep-registration,drep-update,drep-retirement` | Debe contener al menos un tipo admitido separado por comas. |

Los nombres admitidos para `event-types` son `blocks`, `transactions`,
`rollbacks`, `governance`, `drep-registration`, `drep-update` y
`drep-retirement`. Con el valor predeterminado, la salida selecciona todos
estos tipos.

## Esquema de `adder_events_v1`

La salida crea `adder_events_v1` si la tabla todavía no existe. ClickHouse usa
el motor `MergeTree`, particiona las filas por el mes de `event_time` y las
ordena para las consultas mediante `(event_time, event_type, event_hash)`.

| Campo | Tipo de ClickHouse | Descripción |
| --- | --- | --- |
| `schema_version` | `UInt8` | Versión del esquema de la fila. La salida escribe el valor `1`. |
| `event_hash` | `String` | Hash SHA-256 del JSON completo del evento. Sirve para comparar filas, pero no es una clave única. |
| `event_type` | `LowCardinality(String)` | Tipo del evento de Adder. |
| `event_time` | `DateTime64(9, 'UTC')` | Marca de tiempo del evento en UTC con precisión de nanosegundos. |
| `event_json` | `String` | JSON completo del evento. |

Cada fila `JSONEachRow` contiene estos cinco campos con sus nombres exactos.

## Lotes y confirmación

La salida acumula eventos y envía un lote cuando alcanza 100 eventos o cuando
transcurre un segundo, lo que ocurra primero. Cada vaciado ejecuta una sola
instrucción `INSERT` con formato `JSONEachRow`.

La salida espera la finalización HTTP del lote antes de considerarlo completado.
El ajuste `async_insert=0` mantiene la inserción síncrona aunque el perfil del
usuario de ClickHouse habilite inserciones asíncronas. El ajuste
`wait_end_of_query=1` y la inspección del cuerpo de la respuesta permiten
detectar errores que ClickHouse comunica al finalizar la consulta.

Cuando Adder se detiene, la salida consume los eventos aceptados que aún están
en su búfer e intenta un vaciado final con un límite de diez segundos.

## Errores y marcas de tiempo

La salida registra cada lote fallido y envía el error al canal de errores cuando
hay espacio disponible. Después descarta el lote localmente. La salida no
mantiene una cola duradera ni reintenta automáticamente los fallos ambiguos;
repetir un lote podría añadir filas duplicadas.

La salida comprueba cada `event_time` antes de incorporarlo a un lote. ClickHouse
acepta únicamente marcas de tiempo dentro del rango de `DateTime64(9, 'UTC')`.
Cuando una marca queda fuera de ese rango, la salida informa el error por
separado y conserva los demás eventos válidos del mismo lote.

## Duplicados y rollbacks

ClickHouse conserva cada fila insertada correctamente, incluso cuando varias
filas son idénticas. `event_hash` contiene el SHA-256 del JSON completo para
facilitar la comparación, pero no impide la retención de duplicados.

La salida desactiva la deduplicación de inserciones con los ajustes
`deduplicate_insert=disable` y `insert_deduplicate=0`. Por tanto, una nueva
aparición de un bloque después de un rollback permanece como una ocurrencia
independiente.

La salida trata los rollbacks como filas ordinarias con `event_type`
`input.rollback`; no elimina las filas anteriores. El orden de ClickHouse
facilita las consultas analíticas, pero no establece un orden global para
reproducir la cadena.