---
title: Inicio rápido
description: Instala, configura y prueba un resolver cDNSd.
---

## Paso 1: Instalar e iniciar cDNSd

Compila o descarga `cdnsd` desde las [versiones de cDNSd](https://github.com/blinklabs-io/cdnsd/releases), e inícialo con un archivo de configuración opcional:

```sh
cdnsd -config /etc/cdnsd/config.yaml
```

Sin archivo de configuración, cDNSd usa el puerto `8053` para DNS, el `8081` para métricas y `./.state` para el estado persistente. DNS-over-TLS usa el puerto `8853` solo cuando se configuran tanto la ruta del certificado TLS como la de la clave; de lo contrario está desactivado. Los puertos inferiores a `1024` suelen requerir privilegios elevados, por lo que debes usar un proxy inverso o un mapeo de puertos del contenedor para exponer el puerto estándar 53.

## Paso 2: Crear una configuración mínima

Este ejemplo activa el perfil preprod de Cardano y guarda el estado fuera del directorio de trabajo:

```yaml
dns:
  address: "0.0.0.0"
  port: 8053
metrics:
  address: "127.0.0.1"
  port: 8081
indexer:
  network: "preprod"
  address: "127.0.0.1:3001"
state:
  dir: "/var/lib/cdnsd"
profiles:
  - "ada-preprod"
```

La dirección del nodo Cardano debe apuntar a un nodo accesible para cDNSd. Usa `socketPath` en lugar de `address` al conectar mediante un socket local. Los perfiles proporcionan ajustes de red y dominio; consulta los [perfiles disponibles](https://github.com/blinklabs-io/cdnsd/blob/main/internal/config/profile.go).

Un `METRICS_LISTEN_ADDRESS` vacío hace que las métricas escuchen en todas las interfaces. El endpoint `/metrics` no requiere autenticación; usa `127.0.0.1` para monitorización local o protege cualquier endpoint expuesto con controles de red y autenticación.

## Paso 3: Iniciar con variables de entorno

En un contenedor o una unidad systemd, puedes sobrescribir los mismos valores sin montar YAML:

```sh
export DNS_LISTEN_ADDRESS=127.0.0.1
export DNS_LISTEN_PORT=8053
export METRICS_LISTEN_ADDRESS=127.0.0.1
export INDEXER_NETWORK=preprod
export INDEXER_TCP_ADDRESS=127.0.0.1:3001
export STATE_DIR=/var/lib/cdnsd
export PROFILES=ada-preprod
cdnsd
```

Las variables de entorno tienen prioridad sobre los valores del archivo YAML.

## Paso 4: Probar el resolver

Consulta directamente el servicio DNS con `dig`:

```sh
dig @127.0.0.1 -p 8053 example.com
dig @127.0.0.1 -p 8053 <indexed-domain>.ada
```

La primera consulta comprueba la resolución DNS ordinaria. Sustituye `<indexed-domain>` por un dominio que esté presente en el estado Cardano/Handshake indexado por tu nodo; configurar un perfil no garantiza por sí solo la resolución de un nombre concreto. Si DNS-over-TLS está activado, pruébalo con un cliente compatible y el certificado configurado.

## Paso 5: Monitorizar cDNSd

Recopila `/metrics` en la dirección y el puerto de métricas configurados. Define `debug.port` con un valor distinto de cero para activar el servidor HTTP de depuración, incluidos los endpoints pprof de Go. Mantén los endpoints de depuración en localhost o protegidos por autenticación, salvo que los expongas deliberadamente para diagnóstico.

Para ver todas las opciones, consulta la [Referencia de configuración](/es/guides/cdnsd/003-configuration-reference/).
