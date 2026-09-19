---
title: Guía de línea de comandos
description: Guía de línea de comandos de Bursa.
---

Ahora podemos usar la línea de comandos para crear una billetera de Cardano y generar todos los archivos que necesitaremos para administrar la billetera. También podemos iniciar la API y acceder a la documentación Swagger de la API.

Bursa también se puede usar para generar scripts multifirma, hashes y claves, incluidas las claves y certificados necesarios para ejecutar un stake pool de Cardano.

Actualmente hay 8 categorías de comandos que Bursa puede ejecutar, lo que la convierte en una herramienta poderosa para los usuarios de Cardano.

> **Categorías de comandos de Bursa**
> 1. [wallet](#wallet) &nbsp; - Comandos para generar billetera y los archivos necesarios para administrar una billetera de Cardano
> 2. [api](#api)  &emsp;&nbsp;&nbsp; - Comandos para ejecutar la API
> 3. [cert](../004-cert-commands)   &emsp;&nbsp; - Comandos para generar varios certificados de Cardano
> 4. [hash](../005-hash-commands)  &nbsp;&nbsp;&nbsp; - Comandos para generar hashes criptográficos usados en Cardano
> 5. [script](../006-script-commands) &nbsp;&nbsp; - Comandos para operaciones multifirma
> 6. [address](../007-address-commands) - Comandos para trabajar con direcciones de Cardano
> 7. [key](../008-key-commands)  &emsp;&nbsp;&nbsp; - Comandos para derivar claves individuales a partir de una mnemónica
> 8. [kes-agent](#kes-agent) - Comando para ejecutar el agente KES para un productor de bloques de Cardano

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

Para una escucha de la API heredada en una dirección que no sea de loopback, configure TLS y exactamente una fuente de confianza bearer. Consulte la [referencia de configuración](../009-configuration-reference).

***

<a name="kes-agent"></a>

## Usar la línea de comandos para ejecutar el agente KES

El subcomando `kes-agent` ejecuta el agente KES para un productor de bloques de Cardano. Configure `kes_agent.mode` con `serve-key` para proporcionar la clave de firma KES al productor o con `sign` para firmar encabezados de bloque en su nombre.

```bash
./bursa kes-agent --config /path/to/kes-agent.yaml
```

La bandera `--config` especifica la ruta al archivo de configuración YAML. Como alternativa, defina la ruta en la variable de entorno `BURSA_CONFIG`.

Consulte la [referencia de configuración](../009-configuration-reference) para `kes_agent.mode`, `kes_agent.service_socket`, `kes_agent.control_socket`, `kes_agent.service_socket_mode`, `kes_agent.control_socket_mode`, `kes_agent.cold_vkey_file`, `kes_agent.cold_vkey_hex`, `kes_agent.system_start`, `kes_agent.slot_length`, `kes_agent.slots_per_kes_period`, `kes_agent.max_kes_evolutions`, `kes_agent.evolve_interval` y `kes_agent.guard_file`.

Explora otros comandos de Bursa

> **Categorías de comandos de Bursa**
> 1. [wallet](#wallet) &nbsp; - Comandos para generar billetera y los archivos necesarios para administrar una billetera de Cardano
> 2. [api](#api)  &emsp;&nbsp;&nbsp; - Comandos para ejecutar la API
> 3. [cert](../004-cert-commands)   &emsp;&nbsp; - Comandos para generar varios certificados de Cardano
> 4. [hash](../005-hash-commands)  &nbsp;&nbsp;&nbsp; - Comandos para generar hashes criptográficos usados en Cardano
> 5. [script](../006-script-commands) &nbsp;&nbsp; - Comandos para operaciones multifirma
> 6. [address](../007-address-commands) - Comandos para trabajar con direcciones de Cardano
> 7. [key](../008-key-commands)  &emsp;&nbsp;&nbsp; - Comandos para derivar claves individuales a partir de una mnemónica
> 8. [kes-agent](#kes-agent) - Comando para ejecutar el agente KES para un productor de bloques de Cardano

***
