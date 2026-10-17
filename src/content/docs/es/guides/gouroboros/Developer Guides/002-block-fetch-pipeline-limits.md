---
title: Propiedad de los resultados de BlockPipeline y límites de rango de Block Fetch
description: Configura los límites de datos de bloques retenidos, libera los resultados de BlockPipeline y gestiona las salvaguardas de rango de Block Fetch en Go.
---

Esta guía describe dos contratos de recursos para las integraciones con gOuroboros:

- `BlockPipeline` limita el CBOR completo agregado que conservan los elementos en curso.
- Block Fetch limita el número de bloques, los bytes de respuesta codificados y la duración total de cada rango inclusivo.

## Propiedad de los resultados de BlockPipeline

`PipelineConfig.MaxRawCborBytes` establece el presupuesto agregado para las copias completas de CBOR de bloques que el pipeline conserva entre el envío y la entrega del resultado. El presupuesto cubre la copia sin procesar del envío y el CBOR almacenado del bloque decodificado para los elementos en curso. `DefaultMaxRawCborBytes` establece el valor predeterminado en `64 MiB`, y un valor cero de `MaxRawCborBytes` selecciona ese valor predeterminado.

Configura el valor mediante `WithMaxRawCborBytes`:

```go
blockPipeline := pipeline.NewBlockPipeline(
	pipeline.WithMaxRawCborBytes(128 * 1024 * 1024),
)
```

El pipeline reserva los bytes retenidos necesarios durante `Submit` y mantiene cada resultado contabilizado hasta que el consumidor lo recibe. Si un bloque no cabe en el presupuesto agregado configurado, `Submit` devuelve un error que coincide con `pipeline.ErrRawCborBudgetExceeded`. Si los consumidores no reciben y liberan los resultados, los envíos posteriores pueden permanecer sujetos a contrapresión porque los resultados retenidos continúan ocupando recursos del pipeline.

### Consume y libera cada resultado

El pipeline transfiere al llamador la propiedad de cada elemento recibido desde `Results()` y de cada elemento devuelto por `DrainResults()`. Procesa el elemento antes de llamar a `Release()`:

```go
consume := func(item *pipeline.BlockItem) {
	// Read or process all required fields before releasing the item.
	raw := item.RawCbor()
	block := item.Block()
	_ = raw
	_ = block

	item.Release()
}

for item := range blockPipeline.Results() {
	consume(item)
}

for _, item := range blockPipeline.DrainResults() {
	consume(item)
}
```

`Release()` es idempotente, por lo que las llamadas repetidas son seguras. El método borra los datos CBOR sin procesar y del bloque decodificado del elemento; los consumidores no deben llamar a `RawCbor()` ni a `Block()` después de liberar el elemento. Aplica el mismo procedimiento de consumir y liberar durante el procesamiento normal, la limpieza y el cierre.

## Salvaguardas de rango de Block Fetch

Block Fetch aplica tres límites acumulativos a cada rango inclusivo. Configura los campos en `blockfetch.Config` directamente o usa las funciones de opción correspondientes:

| Campo de configuración | Opción | Unidad | Valor cero |
| --- | --- | --- | --- |
| `MaxBlocksPerRange` | `WithMaxBlocksPerRange` | Bloques por rango | `2,161` bloques |
| `MaxRangeBytes` | `WithMaxRangeBytes` | Bytes codificados acumulativos por rango | `214,205,235` bytes |
| `RangeTimeout` | `WithRangeTimeout` | Duración total del rango | `36 horas 3 minutos` |

`NewConfig` aplica estos valores predeterminados. Un campo con valor cero o un argumento cero de una opción selecciona el valor predeterminado correspondiente; el valor cero no desactiva la salvaguarda.

El cliente cuenta cada mensaje `MsgBlock` completo y codificado del rango:

- `MaxBlocksPerRange` cuenta el número acumulativo de bloques aceptados.
- `MaxRangeBytes` cuenta los bytes codificados acumulativos de esos mensajes `MsgBlock` completos.
- `RangeTimeout` comienza cuando inicia la admisión de la solicitud. Incluye las esperas locales por capacidad en curso y por la puesta en cola de la solicitud, y el progreso de los bloques no renueva el plazo.

El cliente aplica los contadores al rango inclusivo completo, no a respuestas ni lotes individuales. También comprueba los límites antes de entregar cada bloque y comprueba el plazo durante el procesamiento terminal del rango.

### Errores de límite de rango

El cliente envuelve uno de estos errores centinela exportados cuando un rango alcanza un límite:

- `blockfetch.ErrRangeBlockLimit` indica que el rango superó `MaxBlocksPerRange`.
- `blockfetch.ErrRangeByteLimit` indica que el rango superó `MaxRangeBytes`.
- `blockfetch.ErrRangeTimeout` indica que el rango superó `RangeTimeout`.

Usa la comprobación de errores envueltos en lugar de comparar cadenas de error:

```go
if errors.Is(err, blockfetch.ErrRangeTimeout) {
	// Retry or discard the range according to application policy.
}
```

Para `Client.RequestRange`, el método devuelve directamente los fallos de admisión y `RangeDoneFunc` recibe cada fallo terminal del rango en su argumento `error`. Las API síncronas y las demás rutas de solicitud basadas en callbacks exponen el error correspondiente mediante su retorno normal o su callback de finalización. Un fallo de límite de rango envía un error de protocolo y cierra el protocolo de Block Fetch afectado, por lo que los consumidores también deben gestionar los errores terminales de las demás solicitudes de ese protocolo.

### Límites de rango y admisión en curso

Las salvaguardas de rango no sustituyen `RangeRequest.ExpectedBytes` ni `MaxInFlightBytes`. `ExpectedBytes` representa la estimación del llamador para el tamaño serializado de un rango, incluidos los encabezados. El cliente usa esa estimación para admitir solicitudes canalizadas pendientes frente a `MaxInFlightBytes` y para dimensionar la capacidad de entrada solicitada. En cambio, las salvaguardas de rango cuentan las respuestas `MsgBlock` completas y codificadas reales, además del tiempo total real de un rango.

## Contabilidad del búfer de lectura de la conexión

La contabilidad del búfer de lectura de toda la conexión sigue la capacidad retenida de cada `bytes.Buffer` durante la entrega y la compactación. Por tanto, la capacidad sobrante después de consumir un mensaje permanece incluida en la contabilidad en lugar de omitirse.
Este comportamiento no añade una opción nueva ni requiere cambios en otra configuración.
