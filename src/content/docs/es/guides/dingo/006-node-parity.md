---
title: Referencia de la CLI node-parity
description: Sintaxis, opciones y validaciones de la CLI node-parity de Dingo.
---

# Referencia de la CLI `node-parity`

Esta página describe la sintaxis, las opciones y las validaciones de `node-parity` para comparar los estados del libro mayor de Dingo y `cardano-node`.

## Requisitos

`node-parity` compara dos extremos de node-to-client que ya deben estar ejecutándose y sincronizados. El comando no inicia ni administra ninguno de los nodos.

La sección de indicadores compartidos define los valores obligatorios para seleccionar la red y conectar los dos extremos.

Las direcciones pueden usar el formato `host:port` o una ruta a un socket Unix que comience por `/`.

## Comando `watch`

`watch` ejecuta una comparación cuando cambia la punta de cualquiera de los dos nodos. La forma canónica usa el modo incremental predeterminado:

```bash
node-parity watch \
  --network preview \
  --dingo-addr 127.0.0.1:3002 \
  --cardano-addr 127.0.0.1:3003 \
  --cursor-file /var/lib/dingo/node-parity.cursor
```

### Indicadores compartidos

| Indicador | Valor predeterminado | Descripción |
| --- | --- | --- |
| `--network` | Ninguno | Obligatorio. Acepta únicamente `preview` o `preprod`. |
| `--dingo-addr` | Ninguno | Obligatorio. Dirección node-to-client de Dingo. |
| `--cardano-addr` | Ninguno | Obligatorio. Dirección node-to-client de `cardano-node`. |
| `--metrics-addr` | `:9464` | Dirección que sirve `/metrics` para `watch`. Un valor vacío deshabilita las métricas. |

### Modos de comparación

`--mode` acepta exactamente `full` o `incremental`. El valor predeterminado es `incremental`.

Para usar el comportamiento anterior de comparación completa, especifique `--mode full` de forma explícita.

### Modo incremental

El modo `incremental` requiere los siguientes indicadores:

- `--cursor-file` es obligatorio. Especifica el archivo operativo que conserva el cursor entre reinicios.
- `--full-check-interval` debe ser positivo y tiene el valor predeterminado `1000` bloques.
- `--full-check-timeout` debe ser positivo y tiene el valor predeterminado `20m`.

Ejemplo:

```bash
node-parity watch \
  --network preview \
  --dingo-addr 127.0.0.1:3002 \
  --cardano-addr 127.0.0.1:3003 \
  --mode incremental \
  --cursor-file /var/lib/dingo/node-parity.cursor \
  --full-check-interval 1000 \
  --full-check-timeout 20m
```

`node-parity` rechaza el modo incremental si `--cursor-file` está vacío, si `--full-check-interval` es `0` o si `--full-check-timeout` no es positivo.

### Modo completo

El modo `full` usa una comparación del estado completo del libro mayor para cada ciclo. Sus indicadores específicos son:

- `--fallback-interval` debe ser positivo y tiene el valor predeterminado `2m`.
- `--check-timeout` debe ser positivo y tiene el valor predeterminado `20m`.

Ejemplo:

```bash
node-parity watch \
  --network preprod \
  --dingo-addr 127.0.0.1:3002 \
  --cardano-addr 127.0.0.1:3003 \
  --mode full \
  --fallback-interval 2m \
  --check-timeout 20m
```

`node-parity` rechaza el modo completo si `--fallback-interval` o `--check-timeout` no son positivos.

> **Importante:** `watch` rechaza `--at-slot` y `--at-hash`. Estos indicadores no permiten comparaciones históricas con `watch`.

## Comando `check` y comparaciones históricas

`check` ejecuta una comparación única. Para seleccionar un punto histórico, especifique `--at-slot` y `--at-hash` juntos:

```bash
node-parity check \
  --network preview \
  --dingo-addr 127.0.0.1:3002 \
  --cardano-addr 127.0.0.1:3003 \
  --at-slot 123456 \
  --at-hash <HASH_HEX_64_CARACTERES>
```

`--at-slot` y `--at-hash` deben aparecer juntos o ambos deben omitirse. `--at-hash` debe contener un valor hexadecimal que se decodifique exactamente en `32` bytes, es decir, `64` caracteres hexadecimales.

Si se omite el par de indicadores históricos, `check` compara la punta actual de los nodos.

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>