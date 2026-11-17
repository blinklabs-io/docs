---
title: Solución de problemas de Adder
description: Cómo capturar perfiles locales de Adder de forma segura.
---

## El perfil de fugas de goroutines no está disponible mediante HTTP

El listener de depuración de Adder no registra controladores HTTP `pprof`.
Adder no ofrece la ruta `http://localhost:6060/debug/pprof/goroutineleak`.
`GOEXPERIMENT=goroutineleakprofile` tampoco habilita un flujo HTTP compatible
en Adder.

La captura local usa las herramientas de pruebas de Go y no abre un listener de
red. Los perfiles pueden contener datos de la aplicación y rutas locales; un
directorio temporal privado limita su exposición.

## Capturar perfiles localmente

Cada perfil requiere una ejecución separada a partir de un benchmark local
acotado:

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
referencia de rendimiento. Una comparación fiable mantiene constantes la
versión de Go, la máquina, la carga de trabajo y la duración del benchmark, y
compara varias ejecuciones sin perfilado. La página de [benchmarks y
profiling](/es/guides/adder/011-benchmarks-and-profiling/) describe el procedimiento completo.

El listener de depuración permanece desactivado de forma predeterminada. El
flujo local mantiene los archivos de perfil fuera de una interfaz pública.

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
