---
title: Solución de problemas de Adder
description: Cómo capturar perfiles locales de Adder de forma segura.
---

## El perfil de fugas de goroutines no está disponible mediante HTTP

El listener de depuración de Adder no registra controladores HTTP `pprof`. Por
eso, `http://localhost:6060/debug/pprof/goroutineleak` no es una ruta
disponible. `GOEXPERIMENT=goroutineleakprofile` tampoco habilita un flujo HTTP
compatible en Adder.

La captura local con las herramientas de pruebas de Go evita exponer un
listener de red. Los perfiles pueden contener datos de la aplicación y rutas
locales, por lo que la captura debe usar un directorio temporal privado.

## Capturar perfiles localmente

Ejecuta cada perfil por separado a partir de un benchmark local acotado:

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

`go tool pprof` analiza los perfiles de CPU y memoria. `alloc_space` muestra
las asignaciones acumuladas; `-inuse_space` permite inspeccionar el heap
retenido en el momento de la captura. `go tool trace` genera el perfil del
planificador y muestra los retrasos de las goroutines listas para ejecutarse.

La instrumentación cambia los tiempos, así que los perfiles no sirven como
referencia de rendimiento. Mantén fijos la versión de Go, la máquina, la carga
de trabajo y la duración del benchmark, y compara varias ejecuciones sin
perfilado. Para obtener el procedimiento completo, consulta la página de
[benchmarks y profiling](011-benchmarks).

El listener de depuración está desactivado de forma predeterminada y estos
comandos no abren ningún listener de red. Mantén los archivos de perfil en un
directorio privado y no expongas un listener de profiling en una interfaz
pública.