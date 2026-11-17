---
title: Persistencia del cursor de ChainSync
description: Configuración y comportamiento de la persistencia opcional del cursor de ChainSync.
---

# Persistencia del cursor de ChainSync

## Visión general

Esta guía describe cómo conservar de forma opcional el cursor de `ChainSync` en un archivo SQLite. Con la persistencia activada, Adder reanuda la sincronización desde el último bloque emitido después de un reinicio y ajusta el cursor cuando la cadena hace rollback.

## Configuración del operador

Configure `--input-chainsync-state-path` con la ruta de un archivo SQLite:

```bash
adder --input chainsync \
  --input-chainsync-state-path /var/lib/adder/chainsync.sqlite
```

La configuración YAML equivalente es:

```yaml
plugins:
  input:
    chainsync:
      state-path: /var/lib/adder/chainsync.sqlite
```

Configure una ruta de archivo que el proceso pueda abrir para leer y escribir. Conserve el archivo en un almacenamiento que sobreviva a los reinicios si la aplicación debe conservar el cursor. Adder crea y utiliza el archivo SQLite cuando `--input-chainsync-state-path` o `state-path` tiene un valor no vacío.

El valor predeterminado es `""`. Para desactivar la persistencia, omita `--input-chainsync-state-path` o configure `state-path: ""`; Adder no conserva ningún cursor y mantiene el comportamiento anterior.

Cuando el archivo contiene un cursor guardado, Adder lo restaura al iniciar `ChainSync`. El cursor guardado tiene prioridad sobre `intersect-tip` e `intersect-point`, por lo que la sincronización comienza en el último bloque emitido guardado en el archivo. Si el archivo todavía no contiene un cursor, Adder utiliza la intersección configurada.

Consulte la [referencia de comandos en español](./006-command_list.md) para ver la entrada de `--input-chainsync-state-path` junto con las demás opciones de `ChainSync`.

## Reinicio y rollback

Adder conserva únicamente bloques que ya emitió. Después de emitir correctamente todos los eventos de un bloque, Adder actualiza el cursor pendiente con ese bloque. Adder escribe ese cursor en SQLite cada cinco segundos y también durante el apagado.

Cuando la cadena hace rollback, Adder retrocede el cursor pendiente hasta el último bloque emitido que todavía sobrevive en la cadena. La siguiente escritura conserva ese punto, y el siguiente reinicio reanuda la sincronización desde allí en lugar de continuar después del bloque eliminado por el rollback.

El intervalo de cinco segundos limita la cantidad de progreso reciente que puede perderse si el proceso termina antes de la siguiente escritura. Un reinicio puede volver a emitir eventos posteriores a la última escritura persistida; esta función no elimina la posibilidad de reemisión ni sustituye la deduplicación del consumidor. Si la persistencia está desactivada, Adder no restaura ni escribe ningún cursor y aplica las opciones configuradas de intersección en cada inicio.

## API de Go

Los programas Go pueden proporcionar un almacén de estado con `WithStateStore`:

```go
chainSync := chainsync.New(
    chainsync.WithStateStore(store),
)
```

Use `WithStateKey` para seleccionar la clave del cursor cuando varias instancias comparten el mismo archivo o almacén:

```go
chainSync := chainsync.New(
    chainsync.WithStateStore(store),
    chainsync.WithStateKey("consumer-a"),
)
```

La clave predeterminada es `chainsync-cursor`. Asigne una clave distinta a cada instancia que comparta un almacén para evitar que sus cursores colisionen.

La instancia que abre su propio almacén administra su ciclo de vida y lo cierra durante el apagado. Un almacén proporcionado por el llamador mediante `WithStateStore` permanece abierto cuando `ChainSync` se detiene o inicia otra ejecución; el llamador administra su ciclo de vida y puede compartirlo entre instancias.

## Navegación

- Consulte la sección de [configuración de entrada](./006-command_list.md#entrada) para ubicar `--input-chainsync-state-path` junto con las demás opciones de entrada.

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
