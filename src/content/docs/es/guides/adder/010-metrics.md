---
title: Métricas de Prometheus de Adder
description: Consulta el endpoint de métricas de Prometheus y las métricas del pipeline de Adder.
---

## Endpoint de métricas

La API HTTP sirve texto de Prometheus en `GET /metrics` mediante el servidor de la API configurado en `API_ADDRESS` y `API_PORT`. Los valores predeterminados son `0.0.0.0:8080`. La ruta se encuentra fuera del grupo de rutas versionado `/v1`.

```http
GET /metrics
```

## Métricas del pipeline

| Métrica | Uso operativo |
| --- | --- |
| `adder_pipeline_received_events_total` | Cuenta los eventos cuando el pipeline los lee de los canales de salida del complemento de entrada. No cuenta los eventos ascendentes que una entrada todavía no ha emitido. |
| `adder_pipeline_processed_events_total` | Cuenta los eventos después de que cada canal de salida configurado acepta una copia. Un pipeline sin salidas aún drena y cuenta eventos. Este contador no confirma la entrega a un destino externo ni a `/events`. |
| `adder_pipeline_filtered_events_total` | Cuenta las notificaciones de descarte de los filtros de eventos y Cardano integrados. Los filtros personalizados contribuyen cuando implementan `SetPipelineDropObserver(func())` y llaman una vez a la función registrada por cada evento rechazado. |
| `adder_pipeline_processing_duration_seconds` | Registra un histograma desde que el pipeline lee un evento de entrada, durante el procesamiento de filtros y las esperas de los canales, hasta que todos los canales de salida configurados aceptan el evento. Solo los eventos completados que conservan su hora de entrada al pipeline generan muestras. El histograma no mide la entrega a destinos externos. |

Al reiniciar el proceso, Adder restablece los contadores. Las métricas no incluyen etiquetas derivadas de tipos de evento, direcciones, hashes, clientes ni otros datos del usuario.

Un evento recibido puede superar temporalmente los totales de eventos procesados y filtrados mientras permanece en curso. El apagado deja fuera de los totales procesados y filtrados los eventos que siguen en curso. Los filtros personalizados también pueden descartar eventos sin informar o emitir más de un evento por entrada, por lo que los tres contadores no forman una ecuación de conservación. Adder actualiza los contadores y el histograma por separado, de modo que una consulta puede observarlos entre actualizaciones.

Estas métricas no informan sobre los resultados de la entrega externa. El sistema de monitorización debe consultar el complemento de salida o el destino para obtener esos resultados. Compare el `_count` del histograma con `adder_pipeline_processed_events_total` para identificar eventos completados que no conservaron su hora de entrada.

## Restricción de acceso

El perímetro de red debe limitar el acceso al servidor de la API cuando las métricas solo deban estar disponibles para el sistema de monitorización.
