---
title: Guía de línea de comandos
description: Guía de línea de comandos de Bursa.
---

Ahora podemos usar la línea de comandos para crear una billetera de Cardano y generar todos los archivos que necesitaremos para administrar la billetera. También podemos iniciar la API y acceder a la documentación Swagger de la API.

Bursa también se puede usar para generar scripts multifirma, hashes y claves, incluidas las claves y certificados necesarios para ejecutar un stake pool de Cardano.

Actualmente hay 7 categorías de comandos que Bursa puede ejecutar, lo que la convierte en una herramienta poderosa para los usuarios de Cardano.

> **Categorías de comandos de Bursa**
> 1. [wallet](#wallet) &nbsp; - Comandos para generar billetera y los archivos necesarios para administrar una billetera de Cardano
> 2. [api](#api)  &emsp;&nbsp;&nbsp; - Comandos para ejecutar la API
> 3. [cert](../004-cert-commands)   &emsp;&nbsp; - Comandos para generar varios certificados de Cardano
> 4. [hash](../005-hash-commands)  &nbsp;&nbsp;&nbsp; - Comandos para generar hashes criptográficos usados en Cardano
> 5. [script](../006-script-commands) &nbsp;&nbsp; - Comandos para operaciones multifirma
> 6. [address](../007-address-commands) - Comandos para trabajar con direcciones de Cardano
> 7. [key](../008-key-commands)  &emsp;&nbsp;&nbsp; - Comandos para derivar claves individuales a partir de una mnemónica

***

<a name="wallet"></a>

## Usar la línea de comandos para crear una billetera y generar archivos de billetera

Podemos usar la línea de comandos para crear una billetera y generar todos los archivos que necesitaremos para administrar nuestra billetera de Cardano.

Para este ejemplo creamos los archivos de billetera en la carpeta `dev` usando la bandera `--output` y dándole un directorio donde generar los archivos.

```bash
./bursa wallet create --output dev
```

![bursa-wallet-create-with-output-string](/bursa-wallet-create-with-output-string.png)

Ahora tendremos todos los archivos de billetera en nuestro directorio `dev`.

![bursa-wallet-files](/bursa-wallet-files.png)

***

<a name="api"></a>

## Usar la línea de comandos para iniciar API

Si queremos usar la API, podemos usar la línea de comandos para iniciarla ejecutando el siguiente comando.

```bash
./bursa api
```

![bursa-start-api](/bursa-start-api.png)

## Acceder a la documentación Swagger de la API

Puedes verificar la API de Bursa yendo a tu IP:puerto/swagger/index.html. Por favor ajusta la IP y tu puerto si es necesario.

```text
http://localhost:8080/swagger/index.html
```

![bursa-swagger](/bursa-swagger.png)

***

Explora otros comandos de Bursa

> **Categorías de comandos de Bursa**
> 1. [wallet](#wallet) &nbsp; - Comandos para generar billetera y los archivos necesarios para administrar una billetera de Cardano
> 2. [api](#api)  &emsp;&nbsp;&nbsp; - Comandos para ejecutar la API
> 3. [cert](../004-cert-commands)   &emsp;&nbsp; - Comandos para generar varios certificados de Cardano
> 4. [hash](../005-hash-commands)  &nbsp;&nbsp;&nbsp; - Comandos para generar hashes criptográficos usados en Cardano
> 5. [script](../006-script-commands) &nbsp;&nbsp; - Comandos para operaciones multifirma
> 6. [address](../007-address-commands) - Comandos para trabajar con direcciones de Cardano
> 7. [key](../008-key-commands)  &emsp;&nbsp;&nbsp; - Comandos para derivar claves individuales a partir de una mnemónica

***
