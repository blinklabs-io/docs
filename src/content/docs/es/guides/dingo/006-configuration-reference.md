---
title: Referencia de configuración y CLI
description: Referencia de los parámetros de configuración y las opciones de CLI de Dingo.
---

# Referencia de configuración y CLI de Dingo

Esta referencia documenta los parámetros YAML, las variables de entorno y las opciones de CLI para los controles de destinos de Koios, los límites de `tokenRegistry` y el mantenimiento de SQLite.

## Controles de destinos de Koios

`koiosParity.allowPrivateAddresses` permite que Koios use destinos con direcciones privadas o de uso especial.

```yaml
koiosParity:
  allowPrivateAddresses: false
```

| Forma | Identificador |
| --- | --- |
| YAML | `koiosParity.allowPrivateAddresses` |
| Variable de entorno | `DINGO_KOIOS_PARITY_ALLOW_PRIVATE_ADDRESSES` |
| CLI de Dingo | `--koios-parity-allow-private-addresses` |
| CLI `node-parity from-genesis` | `--koios-allow-private-addresses` |

El valor predeterminado es `false`. Con este valor, Dingo rechaza destinos privados, de loopback, de enlace local, multicast, no especificados y otros destinos de uso especial. La protección también se aplica a los destinos obtenidos después de una redirección o de una resolución DNS.

La autorización de HTTP plano es independiente: `--koios-parity-allow-insecure-http` no habilita automáticamente los destinos privados.

## Límites de `tokenRegistry`

La siguiente tabla enumera los límites de configuración disponibles:

| Clave YAML | Valor `0` | Variable de entorno | Opción de CLI |
| --- | --- | --- | --- |
| `tokenRegistry.maxDecompressedBytes` | Selecciona el valor predeterminado incorporado de `2 GB`. | `DINGO_TOKEN_REGISTRY_MAX_DECOMPRESSED_BYTES` | `--token-registry-max-decompressed-bytes` |
| `tokenRegistry.maxArchiveEntries` | Selecciona el valor predeterminado incorporado de `100000`. | `DINGO_TOKEN_REGISTRY_MAX_ARCHIVE_ENTRIES` | `--token-registry-max-archive-entries` |
| `tokenRegistry.maxAcceptedEntries` | Selecciona el valor predeterminado incorporado de `50000`. | `DINGO_TOKEN_REGISTRY_MAX_ACCEPTED_ENTRIES` | `--token-registry-max-accepted-entries` |
| `tokenRegistry.maxBatchBytes` | Selecciona el valor predeterminado incorporado de `64 MB`. | `DINGO_TOKEN_REGISTRY_MAX_BATCH_BYTES` | `--token-registry-max-batch-bytes` |

Durante el inicio, cuando ambos valores son positivos, Dingo exige `maxBatchBytes >= maxEntryBytes`. Una configuración que haga que `maxBatchBytes` sea menor que `maxEntryBytes` no puede iniciar.

## Mantenimiento de SQLite

Configure `vacuumIntervalSeconds` únicamente en el proveedor de metadatos SQLite:

```yaml
plugins:
  storage:
    metadata:
      provider: sqlite
      config:
        vacuumIntervalSeconds: 86400
```

Dingo expresa el valor en segundos. Si la configuración no incluye esta clave o asigna `0`, Dingo desactiva el `full VACUUM` periódico. Un valor positivo activa el mantenimiento con el intervalo especificado. Una operación `full VACUUM` puede pausar las escrituras de SQLite.