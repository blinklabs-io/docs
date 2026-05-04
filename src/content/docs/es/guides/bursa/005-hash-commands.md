---
title: Guía de línea de comandos de hash
description: Guía de línea de comandos de Bursa para generar hashes criptográficos usados en Cardano.
---

<a name="hash"></a>

Guía de línea de comandos de Bursa para generar hashes criptográficos usados en Cardano.

## Crear hashes para archivos de metadatos o datos de anclaje
Podemos usar Bursa para crear hashes para metadatos o `anchor-data`, usados a menudo en la gobernanza de Cardano o en operaciones de stake pool.

> **Tipos de hash:**
> - metadata - Hash Blake2b-256 de metadatos JSON de pool/DRep <br>
> - anchor-data - Hash Blake2b-256 de datos de anclaje (constituciones, propuestas de gobernanza)

#### Metadata
Los comandos de hash de metadatos se usan para el registro de metadatos de pool y DRep.
El hash se calcula a partir de la representación JSON canónica.

**Tipos de metadatos soportados:**
  - pool: Metadatos de registro de pool
  - drep: Metadatos de registro de DRep

**Ejemplo de comando de metadatos de pool**
```
./bursa hash metadata pool-metadata.json
```

#### Datos de anclaje
Los comandos de hash `anchor-data` se usan para generar un hash Blake2b-256 de datos de anclaje usados en la gobernanza de Cardano.

Por ejemplo, podrías querer crear un hash de datos de anclaje para constituciones, propuestas de gobernanza y otros documentos que se anclan a acciones de gobernanza on-chain.

**Ejemplo de comando de Anchor-Data**
```
./bursa hash anchor-data --file-text constitution.txt
```

***

Explora otros comandos de Bursa

> **Categorías de comandos de Bursa**
> 1. [wallet](../003-commands) &nbsp; - Comandos para generar billetera y los archivos necesarios para administrar una billetera de Cardano
> 2. [api](../003-commands)  &emsp;&nbsp;&nbsp; - Comandos para ejecutar la API
> 3. [cert](../004-cert-commands)   &emsp;&nbsp; - Comandos para generar varios certificados de Cardano
> 4. [hash](#hash)  &nbsp;&nbsp;&nbsp; - Comandos para generar hashes criptográficos usados en Cardano
> 5. [script](../006-script-commands) &nbsp;&nbsp; - Comandos para operaciones multifirma
> 6. [address](../007-address-commands) - Comandos para trabajar con direcciones de Cardano
> 7. [key](../008-key-commands)  &emsp;&nbsp;&nbsp; - Comandos para derivar claves individuales a partir de una mnemónica

***
