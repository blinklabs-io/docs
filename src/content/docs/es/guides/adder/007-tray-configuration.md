---
title: Referencia de configuración de Adder Tray
description: Configuración de filtros estructurados y límites de frecuencia de notificaciones de Adder Tray.
---

# Referencia de configuración de Adder Tray

Esta guía describe el filtro estructurado que Adder Tray utiliza para seleccionar objetivos de monitorización, la persistencia de esa configuración y los controles de frecuencia de las notificaciones.

## Filtro estructurado de monitorización

Adder Tray guarda el filtro en `adder-tray.yaml`. El filtro contiene un modo general o listas explícitas de objetivos.

### Listas de objetivos

El asistente muestra las siguientes secciones para los objetivos:

- `Watch Wallet` para direcciones Cardano que comienzan por `addr` o `stake`.
- `Track DRep` para identificadores que comienzan por `drep1` o que contienen valores hexadecimales.
- `Monitor Pool` para identificadores que comienzan por `pool1` o que contienen valores hexadecimales.
- `Follow Asset` para huellas de activos que comienzan por `asset1`.
- `Follow Policy` para identificadores de política hexadecimales de 56 caracteres.

Las listas utilizan estos campos YAML:

| Campo | Función |
| --- | --- |
| `monitor_everything` | Monitoriza todos los tipos de objetivos admitidos cuando el valor es `true`. |
| `wallets` | Lista de direcciones de wallets. |
| `dreps` | Lista de identificadores de DRep. |
| `pools` | Lista de identificadores de pool. |
| `assets` | Lista de huellas de activos. |
| `policies` | Lista de identificadores de política. |

Cada lista combina sus propios valores con `OR`. El asistente requiere al menos un objetivo cuando `monitor_everything` tiene el valor `false`.

El modo `Monitor Everything (ignore per-target lists)` es exclusivo. Cuando el modo está activo, Adder Tray ignora todas las listas explícitas y guarda únicamente el modo general.

### Modos de coincidencia

Los siguientes campos opcionales conectan cada grupo de objetivos con el grupo anterior que contiene valores:

| Campo | Valores | Comportamiento |
| --- | --- | --- |
| `drep_match` | `any` o `all` | Combina el grupo `dreps` con el grupo anterior mediante `OR` o `AND`. |
| `pool_match` | `any` o `all` | Combina el grupo `pools` con el grupo anterior mediante `OR` o `AND`. |
| `asset_match` | `any` o `all` | Combina el grupo `assets` con el grupo anterior mediante `OR` o `AND`. |
| `policy_match` | `any` o `all` | Combina el grupo `policies` con el grupo anterior mediante `OR` o `AND`. |

Cuando un campo de coincidencia está ausente o contiene un valor distinto de `all`, Adder Tray utiliza `any`. Los campos de coincidencia no cambian la combinación `OR` de los valores dentro de un grupo.

Un filtro estructurado puede tener esta forma:

```yaml
filter:
  monitor_everything: false
  wallets:
    - addr1...
  dreps:
    - drep1...
  pools:
    - pool1...
  assets:
    - asset1...
  policies:
    - 00000000000000000000000000000000000000000000000000000000
  drep_match: any
  pool_match: any
  asset_match: any
  policy_match: any
```

## Persistencia y migración

Adder Tray guarda el filtro estructurado bajo `filter` en `adder-tray.yaml`. Adder Tray mantiene las reglas de coincidencia y las listas de objetivos; la configuración del motor auxiliar ya no actúa como fuente de las listas por objetivo.

Cuando una configuración existente no contiene un filtro estructurado, Adder Tray puede importar una configuración heredada que todavía contiene estos valores bajo `filter.cardano`:

- `address` pasa a `wallets`.
- `drep` pasa a `dreps`.
- `pool` pasa a `pools`.
- `asset` pasa a `assets`.
- `policy` pasa a `policies`.

Durante la importación, Adder Tray separa los valores delimitados por comas, elimina los espacios al principio y al final e ignora las entradas vacías. Si la importación encuentra al menos un objetivo, desactiva `monitor_everything` para conservar la selección explícita.

Después de guardar la configuración del asistente, los valores nuevos pertenecen a los campos estructurados de Adder Tray, no a las claves por objetivo de `filter.cardano`. Adder Tray elimina las claves heredadas del motor auxiliar cuando escribe la configuración actualizada.

Si `adder-tray.yaml` no contiene un modo ni listas de objetivos, Adder Tray selecciona `monitor_everything: true` al reconstruir la configuración para que el asistente continúe con el modo general.

> **Importante:** No añadas listas nuevas a las claves heredadas de `filter.cardano`. Utiliza `filter` en `adder-tray.yaml` para conservar los objetivos y los modos de coincidencia.

## Controles de frecuencia de notificaciones

Adder Tray guarda los controles de frecuencia en la raíz de `adder-tray.yaml`:

```yaml
notify_rate_limit: 1
notify_rate_window: 5s
```

| Campo | Valores y comportamiento |
| --- | --- |
| `notify_rate_limit` | Límite entero de notificaciones por ventana. Un valor positivo agrupa los avisos que superan el límite. `0` o la ausencia del campo utiliza el valor predeterminado `1`. Un valor negativo desactiva la agrupación. |
| `notify_rate_window` | Duración de la ventana. `0` o la ausencia del campo utiliza el valor predeterminado `5s`. El valor debe ser positivo cuando se especifica. |

Cuando un límite positivo alcanza su máximo durante la ventana, Adder Tray agrupa las coincidencias adicionales en una sola notificación `Multiple events occurred` al finalizar la ventana. Un límite negativo envía cada coincidencia de inmediato y desactiva la agrupación.

### Configuración en el asistente

El asistente coloca estos campos en `Advanced — Rate Limiting`:

- `Max notifications per window` acepta un número entero, incluidos valores negativos.
- `Window duration (e.g. 5s, 30s, 1m)` acepta duraciones de Go, como `5s`, `30s` y `1m`.

Un campo vacío restablece el valor predeterminado correspondiente. El asistente rechaza una duración que no sea válida o que no sea mayor que cero.

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200" />
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>