---
title: Guía de línea de comandos
description: Guía de línea de comandos de Bursa.
---

Ahora podemos usar la línea de comandos para crear una billetera de Cardano y generar todos los archivos que necesitaremos para administrar la billetera. También podemos iniciar la API y acceder a la documentación Swagger de la API.

Bursa también se puede usar para generar scripts multifirma, hashes y claves, incluidas las claves y certificados necesarios para ejecutar un stake pool de Cardano.

La [referencia de configuración de Bursa](../009-configuration-reference) documenta la configuración de `bursa kes-agent`.

Actualmente hay 11 categorías de comandos que Bursa puede ejecutar, lo que la convierte en una herramienta poderosa para los usuarios de Cardano.

> **Categorías de comandos de Bursa**
> 1. [wallet](#wallet) &nbsp; - Comandos para generar billetera y los archivos necesarios para administrar una billetera de Cardano
> 2. [api](#api)  &emsp;&nbsp;&nbsp; - Comandos para ejecutar la API
> 3. [kes-agent](#kes-agent) - Comando para ejecutar el agente KES para un productor de bloques de Cardano
> 4. [cert](../004-cert-commands)   &emsp;&nbsp; - Comandos para generar varios certificados de Cardano
> 5. [hash](../005-hash-commands)  &nbsp;&nbsp;&nbsp; - Comandos para generar hashes criptográficos usados en Cardano
> 6. [script](../006-script-commands) &nbsp;&nbsp; - Comandos para operaciones multifirma
> 7. [address](../007-address-commands) - Comandos para trabajar con direcciones de Cardano
> 8. [key](../008-key-commands)  &emsp;&nbsp;&nbsp; - Comandos para derivar claves individuales a partir de una mnemónica
> 9. [tx](#tx) - Operaciones de transacciones sin conexión
> 10. [sign](#sign) - Firma y verificación de mensajes CIP-8/CIP-30
> 11. [signer](#signer) - Servicio de firma remota

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

### Restaurar e inspeccionar una billetera

Restaura una mnemónica BIP-39 existente desde un archivo protegido e inspecciona los archivos de claves generados:

```sh
./bursa wallet restore --mnemonic-file dev/seed.txt --output restored-wallet
./bursa wallet load --dir restored-wallet
```

`--output` escribe direcciones y archivos de claves; si se omite, la restauración solo registra las direcciones. No copia la mnemónica al directorio de salida. Mantén la mnemónica y las claves de firma privadas y con copias de seguridad seguras. Las fuentes de mnemónica se consultan en este orden: `--mnemonic` (obsoleto), variable de entorno `MNEMONIC`, `--mnemonic-file` y archivo predeterminado `seed.txt`. Elimina `MNEMONIC` al usar `--mnemonic-file`. Los argumentos `--mnemonic` y `--password` están obsoletos porque otros usuarios locales pueden ver los argumentos del proceso; usa `--mnemonic-file` y `--password-file` en su lugar. Usa `--password-file /path/to/password.txt` si la billetera se derivó con una contraseña BIP-39; es una contraseña de derivación, no cifra los archivos de salida.

`wallet load` lee archivos de claves existentes sin derivar otra billetera. El valor hexadecimal de las claves privadas se oculta por defecto; `--show-secrets` lo muestra explícitamente. Consulta las opciones con `./bursa wallet restore --help` y `./bursa wallet load --help`.

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

Cuando la API heredada escucha en una dirección que no sea de loopback, configure TLS y exactamente una fuente de confianza bearer. Consulte la [referencia de configuración](../009-configuration-reference).

***

<a name="kes-agent"></a>

## Usar la línea de comandos para ejecutar el agente KES

El subcomando `kes-agent` ejecuta el agente KES para un productor de bloques de Cardano. Configure `kes_agent.mode` con `serve-key` para proporcionar la clave de firma KES al productor o con `sign` para firmar encabezados de bloque en su nombre.

```bash
./bursa kes-agent --config /path/to/kes-agent.yaml
```

La opción `--config` especifica la ruta al archivo de configuración YAML. Como alternativa, use la variable de entorno `BURSA_CONFIG` para indicar la ruta.

Consulte la [referencia de configuración](../009-configuration-reference) para `kes_agent.mode`, `kes_agent.service_socket`, `kes_agent.control_socket`, `kes_agent.service_socket_mode`, `kes_agent.control_socket_mode`, `kes_agent.cold_vkey_file`, `kes_agent.cold_vkey_hex`, `kes_agent.system_start`, `kes_agent.slot_length`, `kes_agent.slots_per_kes_period`, `kes_agent.max_kes_evolutions`, `kes_agent.evolve_interval` y `kes_agent.guard_file`.

<a name="tx"></a>

## Operaciones de transacciones sin conexión

Los comandos `tx` inspeccionan y firman una transacción existente sin conectarse a un nodo. Proporciona `unsigned.tx` como CBOR hexadecimal o como un sobre de texto JSON que contenga `cborHex`:

```sh
./bursa tx decode --tx-file unsigned.tx
./bursa tx id --tx-file unsigned.tx
./bursa tx sign --tx-file unsigned.tx \
  --signing-key-file dev/payment.skey --out-file signed.tx
```

Repite `--signing-key-file` para añadir varios firmantes. Para sesiones de firma separadas, crea testigos independientes y ensámblalos sobre la misma transacción:

```sh
./bursa tx witness --tx-file unsigned.tx \
  --signing-key-file dev/payment.skey --out-file payment.witness
./bursa tx assemble --tx-file unsigned.tx \
  --witness-file payment.witness --out-file assembled.tx
```

Repite `--witness-file` para incluir más testigos. La firma, la creación de testigos y el ensamblado escriben sobres de texto JSON en `--out-file`, o en la salida estándar si se omite. `tx decode --protocol-params protocol-parameters.json` también estima la tarifa mínima a partir de un archivo JSON de parámetros del protocolo Cardano. Consulta las opciones con `./bursa tx --help` y el `--help` de cada subcomando.

<a name="sign"></a>

## Firmar y verificar mensajes

`sign data` genera una firma COSE CIP-8/CIP-30 y una clave pública como JSON. Asigna a `ADDRESS_HEX` los bytes de la dirección de la clave de firma codificados en hexadecimal (en lugar del texto Bech32). Después de firmar, asigna a `SIGNATURE_HEX` y `COSE_KEY_HEX` los campos `signature` y `key` devueltos:

```sh
./bursa sign data --address "$ADDRESS_HEX" --payload 'Hello Cardano' \
  --signing-key-file dev/payment.skey
./bursa sign verify --signature "$SIGNATURE_HEX" --key "$COSE_KEY_HEX" \
  --payload 'Hello Cardano'
```

Usa `--payload-hex` en lugar de `--payload` para datos binarios. La verificación con el contenido esperado imprime `VALID` si tiene éxito y termina con un error si falla.

<a name="signer"></a>

## Iniciar el servicio de firma remota

El comando `signer` atiende solicitudes autenticadas de firma remota con los backends de custodia, permisos de clientes, políticas de claves y marcas de protección contra doble firma configurados:

```sh
./bursa signer --config /path/to/signer.yaml
```

Si se omite `--config`, `BURSA_CONFIG` selecciona el archivo YAML. Configura al menos un modo de autenticación: se admiten JWT bearer, certificados de cliente mTLS y firmas de solicitudes con claves autorizadas. Antes de iniciar el servicio, sigue la [guía operativa del firmante](https://github.com/blinklabs-io/bursa/blob/main/docs/signer/runbook.md) y adapta el [ejemplo de configuración](https://github.com/blinklabs-io/bursa/blob/main/docs/signer/signer.example.yaml) para la custodia, autenticación, TLS, permisos de clientes y marcas persistentes. La [descripción del firmante](https://github.com/blinklabs-io/bursa/blob/main/docs/signer/README.md) enlaza la especificación de la API y la guía de seguridad.

***

Explora otros comandos de Bursa

> **Categorías de comandos de Bursa**
> 1. [wallet](#wallet) &nbsp; - Comandos para generar billetera y los archivos necesarios para administrar una billetera de Cardano
> 2. [api](#api)  &emsp;&nbsp;&nbsp; - Comandos para ejecutar la API
> 3. [kes-agent](#kes-agent) - Comando para ejecutar el agente KES para un productor de bloques de Cardano
> 4. [cert](../004-cert-commands)   &emsp;&nbsp; - Comandos para generar varios certificados de Cardano
> 5. [hash](../005-hash-commands)  &nbsp;&nbsp;&nbsp; - Comandos para generar hashes criptográficos usados en Cardano
> 6. [script](../006-script-commands) &nbsp;&nbsp; - Comandos para operaciones multifirma
> 7. [address](../007-address-commands) - Comandos para trabajar con direcciones de Cardano
> 8. [key](../008-key-commands)  &emsp;&nbsp;&nbsp; - Comandos para derivar claves individuales a partir de una mnemónica
> 9. [tx](#tx) - Operaciones de transacciones sin conexión
> 10. [sign](#sign) - Firma y verificación de mensajes CIP-8/CIP-30
> 11. [signer](#signer) - Servicio de firma remota

***


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
