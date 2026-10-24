---
title: cardano-configs
description: Copia archivos de configuración de redes Cardano desde la imagen cardano-configs de Blink Labs.
---

`cardano-configs` copia archivos de configuración de red a un directorio montado. Su punto de entrada requiere un directorio de destino y acepta un nombre de red opcional.

```sh
docker run --rm \
  -v "$(pwd)/configs:/output" \
  ghcr.io/blinklabs-io/cardano-configs:latest /output preprod
```

Omite `preprod` para copiar todas las redes incluidas. Los directorios disponibles suelen incluir `mainnet`, `preprod`, `preview`, `sanchonet` y `devnet` si se incluyeron los archivos de devnet. Una red desconocida produce un error que muestra los directorios disponibles.

No hay variables de entorno de ejecución. El script de actualización usa estos controles durante la compilación:

| Variable | Significado |
| --- | --- |
| `HAIL_HYDRA` | Con `true`, incluye la configuración de devnet de Hydra. |
| `LEIOS_GO_BRR` | Con `true`, actualiza la configuración de `musashi`/Leios. |

[Repositorio de código fuente](https://github.com/blinklabs-io/docker-cardano-configs)
