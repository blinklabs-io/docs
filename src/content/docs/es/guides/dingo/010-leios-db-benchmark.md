---
title: "CLI de pruebas de rendimiento de LeiosDB"
description: "Ejecuta la prueba de latencia de LeiosDB de v0.86.0 e interpreta sus resultados."
---

El comando `cmd/leios-db-bench` mide la latencia de LeiosDB en las fases de obtención, lectura de votos, lectura para atender solicitudes y lectura para la aplicación.

## Ejecución

Ejecuta la prueba mediante uno de los puntos de entrada compatibles:

```sh
make bench-leios-db
```

Utiliza el objetivo de pruebas con caché para medir un escenario con caché de lectura. El objetivo pasa el valor de `LEIOS_DB_BENCH_ARGS` a la prueba:

```sh
make bench-leios-db-cached
```

```sh
go run ./cmd/leios-db-bench
```

## Opciones actuales

La prueba de latencia admite las siguientes opciones:

| Opción | Función |
| --- | --- |
| `-volatile-ebs` | Configura los bloques de respaldo (EB) volátiles utilizados para la medición. |
| `-request-bytes` | Configura el tamaño de las solicitudes. |
| `-job-bytes` | Configura el tamaño de las tareas. |
| `-upstream-peers` | Establece el número de pares de origen que comparten los rangos de obtención. |
| `-downstream-peers` | Establece el número de pares de destino que comparten las solicitudes que se atienden. |
| `-samples` | Establece el número de muestras recopiladas. |
| `-gc-every` | Configura la frecuencia de recolección de basura. |
| `-burst` | Activa la programación opcional de ráfagas. |
| `-burst-size` | Configura el tamaño de las ráfagas programadas. |
| `-burst-interval` | Configura el intervalo entre las ráfagas programadas. |
| `-cached-reads` | Activa una caché de lectura para los manifiestos y los datos de cierre persistidos de cada bloque de respaldo. |
| `-cpuprofile` | Escribe los datos de diagnóstico del perfil de CPU de la prueba. |
| `-heapprofile` | Escribe los datos de diagnóstico del perfil de memoria heap de la prueba. |

## Opciones eliminadas

> **Nota de migración:** Las siguientes opciones de la antigua prueba de rendimiento ya no existen. La ejecución falla si se utilizan; los scripts existentes deben sustituirlas por las opciones actuales indicadas arriba.

- `-pre-populated-ebs`
- `-fetch-clients`
- `-ebs-per-client`
- `-fetch-servers`
- `-chain-sel-reads`
- `-gc-ticks`
- `-runs`

## Comportamiento de la carga de trabajo

La prueba mide un bloque de respaldo a la vez mediante estas fases:

1. **Obtención**: lee los datos del bloque de respaldo.
2. **Lectura de votos**: lee los datos de voto del bloque.
3. **Lectura para atender solicitudes**: lee los datos solicitados por los pares de destino.
4. **Lectura para la aplicación**: lee los datos utilizados en la fase de aplicación.

La prueba distribuye las solicitudes y los rangos entre los pares de origen y de destino configurados. La poda no avanza más allá de los bloques de respaldo que todavía tienen lecturas en curso. Al terminar la prueba, el programador opcional `-burst` se detiene de inmediato, sin esperar al siguiente intervalo.

## Salida

La prueba muestra los siguientes valores para las fases de obtención, voto, atención de solicitudes y aplicación:

- latencia `p50`
- latencia `p99`
- latencia máxima
- número de muestras

Estos resultados describen la latencia de cada fase de la carga de trabajo. No indican el rendimiento ni la duración de las iteraciones.

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
