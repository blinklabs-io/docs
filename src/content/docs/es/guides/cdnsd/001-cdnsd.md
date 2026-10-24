---
title: cDNSd
description: Ejecuta un resolver DNS compatible con Cardano y Handshake mediante cDNSd.
---

cDNSd es un resolver DNS e indexador de blockchain para [Cardano](https://cardano.org/) y [Handshake](https://handshake.org/). Resuelve dominios de segundo nivel registrados bajo dominios de nivel superior de Handshake, y también nombres DNS ordinarios mediante las pistas de servidores raíz de ICANN.

El daemon sirve DNS por UDP y TCP, puede servir DNS-over-TLS y expone métricas de Prometheus. Configúralo con YAML, variables de entorno o ambos.

## Requisitos

- Un nodo Cardano al que cDNSd pueda acceder por TCP o un socket IPC local.
- Un directorio persistente para el estado de cDNSd.
- Un perfil configurado para los dominios Cardano/Handshake que quieras resolver.

## Siguientes pasos

- Sigue el [Inicio rápido](/es/guides/cdnsd/002-quick-start/) para instalar, configurar y probar un resolver.
- Consulta la [Referencia de configuración](/es/guides/cdnsd/003-configuration-reference/) para ver todas las claves YAML y variables de entorno.

## Código fuente y soporte

- [Código fuente de cDNSd](https://github.com/blinklabs-io/cdnsd)
- [Versiones de cDNSd](https://github.com/blinklabs-io/cdnsd/releases)
- [Abrir una incidencia](https://github.com/blinklabs-io/cdnsd/issues)
