---
title: Dingo
description: Documentación de Dingo para operadores de nodos, desarrolladores de aplicaciones y colaboradores.
---

![Logotipo de Dingo](/dingo-logo-250.png)

Dingo es la implementación de un nodo de Cardano en Go de Blink Labs. Elige la guía según lo que quieras hacer.

## Opero un nodo Dingo

- [Inicio rápido](/es/guides/dingo/002-quick-start-overview/) — descarga Dingo e inicia un nodo Preview.
- [Configuración y modos de almacenamiento (en inglés)](/guides/dingo/005-node-configuration/) — elige y configura un relay, productor de bloques o nodo de API.
- [Referencia de configuración de Dingo (en inglés)](/guides/dingo/009-configuration-reference/) — consulta todos los ajustes de Dingo v0.79.1.
- [Descargar `dingo.yaml.example` para Dingo v0.79.0](https://raw.githubusercontent.com/blinklabs-io/dingo/v0.79.0/dingo.yaml.example).
- [Arranque inicial y mantenimiento de datos (en inglés)](/guides/dingo/007-bootstrap-and-data-maintenance/) — usa Mithril y administra los datos locales del nodo.
- [Ejecutar Dingo como servicio](/es/guides/dingo/003-create-start-up-service/) y [supervisarlo con Grafana](https://docs.blinklabs.io/guides/dingo/spo-guides/008-grafana-dashboard/).
- [Guías para operadores de pools](https://docs.blinklabs.io/guides/dingo/spo-guides/000-spo-guide/) — configura y opera un productor de bloques de testnet.

## Conecto una aplicación

- [APIs y servicios de archivo (en inglés)](/guides/dingo/006-apis-and-archive/) — elige una API, configura el acceso y conoce Bark.
- [Crear un cliente para la API Blockfrost (en inglés)](/guides/dingo/Development%20Guides/009-build-blockfrost-client/) — conecta una aplicación con la API compatible de Dingo.
- [Crear una interfaz de wallet con UTxO RPC (en inglés)](/guides/dingo/Development%20Guides/010-build-utxorpc-frontend/) — consulta UTxO y envía transacciones mediante Dingo.
- [Crear un panel de gobernanza (en inglés)](/guides/dingo/Development%20Guides/011-build-governance-dashboard/) — conoce las opciones y limitaciones de los metadatos indexados.
- [Usar Dingo con Cardano CLI](/es/guides/dingo/004-using-dingo-with-cardano-cli/) — consulta un nodo mediante node-to-client.

## Contribuyo a Dingo

El [repositorio de Dingo](https://github.com/blinklabs-io/dingo) contiene el código Go y documentación para colaboradores. Empieza por la [guía de desarrollo](https://github.com/blinklabs-io/dingo/blob/main/docs/development.md), la [arquitectura](https://github.com/blinklabs-io/dingo/blob/main/ARCHITECTURE.md) y el [diseño de la base de datos](https://github.com/blinklabs-io/dingo/blob/main/DATABASE.md). La [referencia de la biblioteca Go en pkg.go.dev](https://pkg.go.dev/github.com/blinklabs-io/dingo) documenta su API.

Las [notas de la versión](/es/guides/dingo/releases/001-release-notes/) describen los cambios entre versiones.

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
