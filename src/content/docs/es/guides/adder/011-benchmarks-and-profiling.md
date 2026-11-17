---
title: Benchmarks de streaming y perfilado
description: Cómo comparar el rendimiento del streaming y recopilar perfiles locales de Adder.
---

Este documento describe cómo comparar las capacidades de los búferes de entrada de streaming y cómo recopilar perfiles locales acotados de Adder.

## Streaming y contrapresión

La entrada de `ChainSync` tiene un búfer de salida de `2,048` eventos; los canales normales de los plugins tienen `10` slots de forma predeterminada. Compare búferes de entrada sintéticos de `10`, `256` y `2,048` slots con el mismo pipeline y la misma salida:

```sh
for order in 0 1 2 2 1 0; do
  GOMAXPROCS=2 ADDER_BENCH_ORDER="$order" GOWORK=off go test ./pipeline -run '^$' -bench '^BenchmarkPipelineStreaming$' -benchmem -benchtime=200ms -count=1 -v
done
```

Cada operación envía y drena `4,096` sobres de eventos de bloque. `fast_output` drena de forma continua. `periodic_output_pause` espera 100 microsegundos después de cada 64 eventos para representar la contrapresión intermitente del sink. El benchmark informa `events/s`, además del tiempo y las asignaciones por operación de `4,096` eventos. El arranque queda fuera de la sección cronometrada. La carga no incluye un nodo de Cardano, decodificación, filtros, serialización, salida de red ni asignaciones de payload. La pausa representa una secuencia sintética, no la latencia medida de un sink. Las seis ejecuciones independientes equilibran los tres órdenes de búfer; `-v` imprime cada orden con los tiempos sin procesar. Compare el mismo caso con nombre entre las ejecuciones; completar antes la producción no implica por sí solo una entrega más rápida de extremo a extremo.

La creación del canal queda fuera del temporizador, por lo que `B/op` no incluye el almacenamiento del búfer.

Una ejecución local en Apple M5 con Go 1.27.3, `GOMAXPROCS=2` y otras tareas en la máquina produjo estas medianas en seis repeticiones:

| Búfer de entrada | events/s de salida rápida | events/s de pausa periódica | Almacenamiento de slots de eventos |
| ---: | ---: | ---: | ---: |
| 10 | 1,050,530 | 352,140 | 960 B |
| 256 | 1,080,099 | 354,043 | 24 KiB |
| 2,048 | 1,048,588 | 353,900 | 192 KiB |

La columna de almacenamiento de slots multiplica la capacidad por el valor `event.Event` de 96 bytes en esta compilación `arm64`. Excluye la contabilidad del canal y la memoria que conservan los payloads de eventos. La memoria ocupada y conservada real depende de la profundidad de la cola y del tamaño del payload. Las pequeñas diferencias de rendimiento de esta muestra no demuestran una ventaja del búfer más grande.

Los búferes más grandes pueden absorber una ráfaga, pero conservan más eventos en cola y sus payloads referenciados mientras un sink se retrasa. Un búfer no aumenta la capacidad de un sink que permanece lento. Los casos de búfer aíslan esta compensación; no establecen una configuración óptima de `ChainSync` para un nodo, una red, una combinación de eventos o una salida concretos. El tiempo de ejecución debe conservar los valores predeterminados hasta que las mediciones de la carga prevista justifiquen un cambio.

## Perfiles de CPU, memoria y traza de ejecución

Capture perfiles a partir de un benchmark local acotado. Use un directorio temporal privado porque los perfiles pueden contener datos de la aplicación y rutas:

```sh
profile_dir=$(mktemp -d)
GOWORK=off go test ./pipeline -run '^$' -bench '^BenchmarkPipelineStreaming/buffer_2048/fast_output$' -benchtime=1s -count=1 -cpuprofile="$profile_dir/cpu.out"
go tool pprof -top "$profile_dir/cpu.out"
GOWORK=off go test ./pipeline -run '^$' -bench '^BenchmarkPipelineStreaming/buffer_2048/fast_output$' -benchtime=200ms -count=1 -memprofile="$profile_dir/mem.out"
go tool pprof -alloc_space -top "$profile_dir/mem.out"
GOWORK=off go test ./pipeline -run '^$' -bench '^BenchmarkPipelineStreaming/buffer_2048/fast_output$' -benchtime=200ms -count=1 -trace="$profile_dir/trace.out"
go tool trace -pprof=sched "$profile_dir/trace.out" > "$profile_dir/sched.pprof"
go tool pprof -top "$profile_dir/sched.pprof"
```

El perfil de CPU toma muestras del trabajo activo de la CPU. `alloc_space` informa las asignaciones acumuladas, no el heap conservado; use `-inuse_space` para inspeccionar el heap conservado en el momento de la captura. El perfil de memoria también incluye el arranque del proceso y la preparación del benchmark. El perfil del planificador destaca las esperas de las goroutines listas para ejecutarse. Una ejecución corta puede producir muy pocas muestras; incremente `-benchtime` solo cuando la máquina tenga capacidad. Capture cada perfil por separado para evitar que un profiler distorsione a otro. Esta carga sintética de canales puede estar dominada por la planificación del runtime de Go y no identifica un cuello de botella en un despliegue real de Adder. Para comparar, mantenga fija la versión de Go, la máquina, la carga y la duración del benchmark, recopile varias ejecuciones sin perfilado y compare tanto `events/s` como `B/op`. La instrumentación del perfil modifica los tiempos; no use ejecuciones con perfilado como referencia de rendimiento.

Adder mantiene deshabilitado el listener de depuración de forma predeterminada y no registra handlers HTTP de `pprof`. Estos comandos usan el profiler de pruebas de Go y no abren ningún listener de red. No exponga un listener de perfilado en una interfaz pública.