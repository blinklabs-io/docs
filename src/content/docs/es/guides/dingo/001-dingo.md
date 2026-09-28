---
title: Dingo
description: Documentación de Dingo para operadores de nodos, desarrolladores de aplicaciones y colaboradores.
---

![Logotipo de Dingo](/dingo-logo-250.png)

Dingo es la implementación de un nodo de Cardano en Go de Blink Labs. Elige la guía según lo que quieras hacer.

> Dingo sigue en desarrollo activo. Las versiones actuales están destinadas a Preview, Preprod o redes privadas de desarrollo; no están preparadas para operar en mainnet.

## Opero un nodo Dingo

- [Inicio rápido](/es/guides/dingo/002-quick-start-overview/) — descarga Dingo e inicia un nodo Preview.
- [Configuración y modos de almacenamiento](/guides/dingo/005-node-configuration/) — elige y configura un relay, productor de bloques o nodo de API.
- [Arranque inicial y mantenimiento de datos](/guides/dingo/007-bootstrap-and-data-maintenance/) — usa Mithril y administra los datos locales del nodo.
- [Ejecutar Dingo como servicio](/es/guides/dingo/003-create-start-up-service/) y [supervisarlo con Grafana](https://docs.blinklabs.io/guides/dingo/spo-guides/008-grafana-dashboard/).
- [Guías para operadores de pools](https://docs.blinklabs.io/guides/dingo/spo-guides/001-spo-guide/) — configura y opera un productor de bloques de testnet.

## Conecto una aplicación

- [APIs y servicios de archivo](/guides/dingo/006-apis-and-archive/) — elige una API, configura el acceso y conoce Bark.
- [Usar Dingo con Cardano CLI](/es/guides/dingo/004-using-dingo-with-cardano-cli/) — consulta un nodo mediante node-to-client.

## Contribuyo a Dingo

El [repositorio de Dingo](https://github.com/blinklabs-io/dingo) contiene el código Go, ejemplos y documentación para colaboradores. Empieza por la [guía de desarrollo](https://github.com/blinklabs-io/dingo/blob/main/docs/development.md), la [arquitectura](https://github.com/blinklabs-io/dingo/blob/main/ARCHITECTURE.md) y el [diseño de la base de datos](https://github.com/blinklabs-io/dingo/blob/main/DATABASE.md).

Para consultar los valores exactos, usa el [ejemplo de configuración](https://github.com/blinklabs-io/dingo/blob/main/dingo.yaml.example) de la misma versión de Dingo que ejecutas. Las [notas de versión](/guides/dingo/releases/001-release-notes/) describen los cambios entre versiones.
