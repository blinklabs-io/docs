---
title: Referencia de configuración de Bursa
description: Referencia de YAML y variables de entorno para los firmantes, el agente KES y la seguridad de la API heredada de Bursa.
---

## Descripción general

Esta guía describe la configuración de los firmantes, de `bursa kes-agent` y de la API heredada de Bursa. `signer.backends` admite los backends `pkcs11`, `nitro`, `confidential-space` y `sops`. Bursa lee un archivo YAML y después aplica las variables de entorno; las variables de entorno tienen prioridad sobre los valores YAML.

La [guía de línea de comandos](../003-commands) incluye los comandos disponibles de Bursa.

## Variable de entorno de la billetera

| Variable de entorno | Valor predeterminado | Comportamiento |
| --- | --- | --- |
| `BURSA_CONNECTOR` | `false` | Habilita el backend del conector de dApps. |
| `BURSA_LEAN` | `false` | Establece el valor inicial de lean-node/history-expiry solo en la primera ejecución, cuando todavía no existe un valor persistido. Si no se establece `BURSA_LEAN` o su valor no se interpreta como booleano, se utiliza `false`. Una preferencia ya persistida tiene prioridad y la variable no la sobrescribe después. |

## API de configuración de history expiry

Bursa persiste el ajuste de lean-node/history-expiry. `history expiry` es una opción de construcción del nodo, por lo que Bursa requiere reiniciar el nodo para aplicar un valor persistido que todavía no use.

```http
GET /wallet/settings/history-expiry
```

Devuelve:

```text
{ "enabled": boolean, "restart_required": boolean }
```

```http
PUT /wallet/settings/history-expiry
```

Requiere este cuerpo JSON:

```text
{ "enabled": boolean }
```

El cliente debe enviar el campo obligatorio `enabled` como un booleano JSON. El JSON no válido o la ausencia de `enabled` producen HTTP `400`. Una actualización correcta persiste el valor y devuelve los mismos campos `enabled` y `restart_required`. `restart_required` es `true` cuando el valor persistido todavía no coincide con el valor aplicado al nodo en ejecución. La respuesta de actualización utiliza los mismos campos que `GET`.

## Almacenamiento de billeteras y cifrado

Configura el almacenamiento de billeteras y las claves maestras de SOPS con estas entradas:

| Ruta de configuración | Variable de entorno | Uso y validación |
| --- | --- | --- |
| `storage.backend` | `STORAGE_BACKEND` | Selecciona el backend de almacenamiento de billeteras. Establece `aws` para usar AWS Secrets Manager o `gcp` para usar Google Secret Manager. |
| `aws.secret_prefix` | `AWS_SECRET_PREFIX` | Define el prefijo obligatorio de los nombres de secretos que contienen las billeteras de AWS. |
| `aws.kms_key_arn` | `AWS_KMS_KEY_ARN` | Identifica la clave maestra de AWS KMS que usa SOPS para cifrar las billeteras. |
| `google.project` | `GOOGLE_PROJECT` | Selecciona el proyecto de Google Cloud que contiene los secretos de las billeteras para el backend `gcp`. |
| `google.secret_prefix` | `GCP_SECRET_PREFIX` | Define el prefijo obligatorio del espacio de nombres de las billeteras en Google Secret Manager. |
| `age.recipients` | `AGE_RECIPIENTS` | Define los destinatarios `age` separados por comas que usa SOPS para cifrar las billeteras. |
| `storage.allow_unencrypted_wallet_storage` | `STORAGE_ALLOW_UNENCRYPTED_WALLET_STORAGE` | Permite explícitamente que Bursa persista las billeteras sin cifrar. Bursa requiere esta autorización para el almacenamiento de archivos sin una clave maestra de SOPS y para el almacenamiento SQLite. |

El cifrado de billeteras con SOPS requiere al menos un recurso de clave maestra configurado. Bursa rechaza un recurso de clave mal formado antes de iniciar el cifrado.

Para el backend `gcp`, `google.secret_prefix` es obligatorio y no puede estar vacío. El prefijo solo puede contener letras, números, guiones o guiones bajos, y debe dejar espacio para el nombre de la billetera dentro del límite combinado de `255` caracteres del ID de Secret Manager. Los nombres de billetera deben ser no vacíos y usar los mismos caracteres permitidos. Bursa rechaza el inicio cuando el prefijo está vacío o no es válido. Las operaciones de listar, cargar, guardar y eliminar billeteras solo usan recursos de Secret Manager cuyo ID pertenece al prefijo configurado.

## Referencia de configuración

Una entrada de backend en `signer.backends` selecciona el backend mediante `type`. La tabla siguiente muestra los campos disponibles:

| Ruta de configuración | Propósito | Validación |
| --- | --- | --- |
| `signer.backends[].type` | Selecciona el backend de firma. | Usa `pkcs11`, `nitro`, `confidential-space` o `sops`. |
| `signer.backends[].address` | Especifica el endpoint del backend `nitro` o `confidential-space`. | El backend acepta una dirección con `http://`, `https://` o `unix:///`. |
| `signer.backends[].profile` | Vincula un backend `confidential-space` o `sops` a un perfil de red. | Bursa valida nombres de 1 a 32 caracteres con letras, números, `.`, `_`, `@` o `-`; `nitro` no admite este campo. |
| `signer.backends[].module` | Especifica la ruta al módulo `PKCS#11`, incluido el archivo `.so`. | Establece este campo. Bursa rechaza un valor vacío. |
| `signer.backends[].token_label` | Selecciona el token o el slot mediante su etiqueta. | Establece este campo o `slot`. Bursa requiere al menos un campo de selección. |
| `signer.backends[].slot` | Selecciona un slot mediante su ID de slot explícito. | Establece este campo o `token_label`. Bursa requiere al menos un campo de selección. |
| `signer.backends[].pin_env` | Indica el nombre de la variable de entorno que contiene el PIN de usuario. | Establece este campo y asigna a la variable de entorno indicada un valor no vacío. Bursa no lee el PIN de la configuración en texto plano. |
| `signer.backends[].keys[]` | Define una lista opcional de objetos permitidos del token. | Cuando aparece, incluye `name` y `type` en cada entrada. |
| `signer.backends[].keys[].name` | Coincide con el `CKA_LABEL` del objeto del token. | Establece este campo para cada entrada de `keys`. |
| `signer.backends[].keys[].type` | Asigna un tipo de clave de Cardano al objeto del token coincidente. | Establece este campo para cada entrada de `keys`. Usa `payment`, `stake`, `drep`, `cc-hot`, `cc-cold`, `pool` o `policy`. |
| `signer.backends[].root_ca_file` | Especifica el archivo PEM del certificado raíz de AWS Nitro Enclaves. | Para `nitro`, Bursa requiere el certificado raíz de AWS Nitro fijado por el firmante. |
| `signer.backends[].pcrs` | Define los valores PCR esperados para `nitro`. | Para `nitro`, configura PCR0 (`0`) con un valor distinto de cero. |
| `signer.backends[].host_key_file` | Especifica la clave de autoridad del firmante para las solicitudes Nitro. | Bursa exige para `nitro` un archivo de clave legible solo por su propietario y separa esta autoridad de la autoridad de aprovisionamiento. |
| `signer.backends[].audience` | Define la audiencia configurada para el token de atestación de `confidential-space`. | Bursa requiere este valor para `confidential-space`. |
| `signer.backends[].image_digest` | Identifica la imagen de contenedor configurada para `confidential-space`. | Bursa requiere este valor con el formato `sha256:` seguido de 64 caracteres hexadecimales. |
| `signer.backends[].jwks_url` | Especifica el endpoint de las claves de firma de tokens de `confidential-space`. | Bursa usa las claves de firma de tokens publicadas por Google cuando no se establece este valor opcional. |

Cuando una misma clave fría aparece en varios backends con perfiles, cada backend debe tener un perfil distinto. Bursa enruta una solicitud al backend cuyo perfil coincide con el perfil de la solicitud y conserva por separado los registros de contador y de emisión de cada perfil. Una solicitud sin perfil usa el único backend que contiene la clave; Bursa rechaza una solicitud sin perfil cuando existen varios titulares.

Los backends `confidential-space` y `sops` aceptan perfiles. El backend Nitro no implementa perfiles y debe dejar `signer.backends[].profile` sin establecer.
Los inventarios de `armory` y `confidential-space` con un `profile` no vacío vinculan la evidencia de inventario al perfil seleccionado, además del nonce y la lista de claves. Bursa rechaza la evidencia producida para otro perfil. Los productores y verificadores que usan perfiles deben actualizarse juntos; mezclar el comportamiento heredado sin perfil con la evidencia vinculada a un perfil provoca un fallo de verificación. Un perfil vacío conserva el comportamiento heredado. Nitro debe mantener `signer.backends[].profile` vacío; Bursa rechaza el inventario de Nitro cuando se configura un perfil.

### Métricas

| Ruta de configuración | Variable de entorno | Valor predeterminado | Uso y validación |
| --- | --- | --- | --- |
| `metrics.address` | `METRICS_LISTEN_ADDRESS` | `127.0.0.1` | Dirección de escucha del endpoint de métricas y salud. Un valor vacío usa `127.0.0.1`. Se admiten hosts explícitos, incluidos `0.0.0.0` y la dirección IP del pod. No incluya un puerto en este valor; Bursa rechaza un host que contenga un puerto. |
| `metrics.port` | `METRICS_LISTEN_PORT` | `8081` | Puerto de escucha del endpoint de métricas y salud. El valor `0` deshabilita el listener. |

El subcomando `bursa kes-agent ready` consulta el listener local. Cuando `metrics.address` usa una dirección comodín, el sondeo usa loopback; con otra dirección explícita usa esa dirección. El sondeo omite los proxies configurados en el entorno. Si `metrics.port` es `0`, el agente no ofrece un endpoint de disponibilidad y el subcomando no puede marcarlo como listo.

### Autenticación JWT del firmante

| Ruta de configuración | Variable de entorno | Valor predeterminado | Uso y validación |
| --- | --- | --- | --- |
| `signer.jwt_secret` | `SIGNER_JWT_SECRET` | `""` | Bursa usa esta fuente HS256; exige al menos 32 bytes y la excluye junto con `signer.jwks_url`. |
| `signer.jwks_url` | `SIGNER_JWKS_URL` | `""` | Bursa usa este endpoint JWKS para tokens RS256, ES256 o EdDSA y lo excluye junto con `signer.jwt_secret`. |
| `signer.jwt_audience` | `SIGNER_JWT_AUDIENCE` | `""` | Bursa exige un valor no vacío cuando una fuente de confianza está configurada y valida el mismo valor en `aud`. |
| `signer.jwt_issuer` | `SIGNER_JWT_ISSUER` | `""` | Bursa restringe opcionalmente el emisor aceptado; registra una advertencia cuando acepta cualquier emisor con este campo vacío. |

Cuando `signer.jwt_secret` o `signer.jwks_url` tiene un valor, Bursa exige un `signer.jwt_audience` no vacío y el mismo valor en `aud` de cada token. Bursa rechaza el inicio si falta la audiencia y rechaza la autenticación si falta o no coincide el valor de `aud`. El sujeto `sub` del token determina la identidad del llamador.

### Persistencia operativa de Nitro

El rol de AWS que Nitro usa durante el servicio necesita `secretsmanager:GetSecretValue`, `secretsmanager:DescribeSecret` y `secretsmanager:PutSecretValue`. Nitro guarda el estado del contador sellado en Secrets Manager con cada firma, por lo que el rol debe conservar `PutSecretValue` mientras el servicio atiende solicitudes. Un fallo de persistencia detiene las firmas posteriores hasta que el operador reinicia o recarga el proxy. El operador puede reintentar una solicitud con el mismo contenido usando el contador almacenado; Nitro rechaza un contenido diferente para ese contador.

El estado sellado tiene una versión. Un proxy o enclave anterior no puede consumir un estado que una combinación más nueva escribió. Para una reducción de versión, el operador debe restaurar en el secreto la versión anterior que solo contiene el sobre antes de iniciar la combinación anterior.

<a id="confidential-space-custody-persistence"></a>

### Persistencia de la custodia de Confidential Space

Con `--state-secret`, la carga de trabajo de Confidential Space guarda su clave de pool envuelta y el estado sellado de sus contadores juntos en un secreto de Secret Manager. Bursa nunca crea ni elimina el secreto; créalo fuera de Bursa. Concede al principal de Workload Identity Federation de la carga de trabajo, solo sobre ese secreto, `secretmanager.versions.access`, `secretmanager.versions.add`, `secretmanager.versions.list` y `secretmanager.versions.destroy`, además de cifrar y descifrar en Cloud KMS con la clave de envoltura.

La carga de trabajo lee el secreto una vez, al iniciar, y a partir de entonces mantiene el estado en memoria. El inicio lee la versión más reciente por número y no el alias `latest`, que tiene consistencia eventual; si la versión más reciente está deshabilitada o destruida, el inicio se detiene en lugar de cargar una anterior. Un secreto inexistente, un secreto sin versiones o un contenido vacío también detienen un inicio normal. En este modo la carga de trabajo nunca genera una clave de pool: solo un inicio con `--import` escribe una, y solo acepta un secreto cuyas versiones habilitadas tengan todas un contenido vacío y que no tenga ninguna versión deshabilitada.

La carga de trabajo sella cada registro de contador con una clave derivada de la clave de cifrado de datos de la clave envuelta, que desenvuelve mediante Cloud KMS, y vincula el registro a la clave de pool, al nombre de la clave de KMS y a su perfil. Un registro alterado o movido a otro perfil detiene el inicio. Cada certificado operativo que emite la carga de trabajo añade una nueva versión del secreto antes de devolver el certificado; repetir la solicitud `opcert-next` ya registrada no escribe nada. Después de cada escritura, la carga de trabajo destruye las versiones habilitadas anteriores. Un fallo al destruir se registra y se reintenta en la siguiente escritura. Un fallo de escritura detiene las firmas posteriores hasta que la carga de trabajo se reinicia y vuelve a cargar la versión más reciente.

Secret Manager no puede añadir una versión de forma condicional, así que ejecuta exactamente una carga de trabajo por secreto. La marca de agua del firmante en modo `enforce`, y no el secreto, es la autoridad que rechaza un contador reemitido, también después de restaurar el secreto a una versión anterior; en modo `warn` u `off` nada lo rechaza. Nunca restaures el secreto a una versión anterior ni lo elimines para una clave de pool existente.
La envoltura `bursa-confidential-space-key/3` conserva un estado de clave distinto para cada perfil y usa la clave correspondiente para el inventario, la firma y los contadores. Al iniciar con una envoltura multiclave, el conjunto de valores de `--profile` debe coincidir exactamente con el conjunto de perfiles de la envoltura: Bursa rechaza un inicio sin perfil, con un perfil ausente o con un perfil adicional. La envoltura v3 no es compatible con versiones anteriores, por lo que una vez que el estado multiclave está en uso no se puede volver a una versión anterior sin reemplazar el estado almacenado.

Con `--tls-secret`, la carga de trabajo lee su certificado HTTPS de otro secreto de Secret Manager. La versión más reciente contiene un único paquete PEM: la cadena de certificados, con el certificado de entidad final (leaf) primero, y exactamente una clave, sin nada más que espacios en blanco entre los bloques. La carga de trabajo lee la versión `latest` una sola vez al iniciar, así que rotar el certificado requiere una versión nueva y un reinicio, y una versión más reciente deshabilitada detiene el inicio en lugar de volver a una anterior. El alias `latest` tiene consistencia eventual, así que un reinicio poco después de añadir la versión nueva todavía puede cargar el certificado anterior; comprueba que la carga de trabajo presenta el certificado nuevo y, si no es así, reiníciala de nuevo. El inicio también se detiene si el paquete está vacío, no es PEM, contiene otro tipo de bloque o su clave no coincide con el certificado de entidad final. Concede al principal de la carga de trabajo solo `secretmanager.versions.access` sobre ese secreto.

## Requisitos de compilación

Una compilación de Bursa desde el código fuente requiere Go `1.26.8` o posterior. Además, compila Bursa con `CGO` habilitado y la etiqueta de compilación `pkcs11` para incluir el backend `PKCS#11`. Sin esa etiqueta, Bursa falla de inmediato cuando una configuración selecciona este backend y devuelve:

```text
pkcs11 backend not compiled in (build with -tags pkcs11)
```

La compilación predeterminada no habilita silenciosamente la compatibilidad con `PKCS#11`.

## Restricciones de firma

El backend `PKCS#11` mantiene las claves privadas en el token y solicita al token que produzca firmas `Ed25519`. El backend `PKCS#11` no admite la firma `COSE` de `CIP-8`. Bursa devuelve `CodeUnsupported` para las solicitudes de `CIP-8` que usan claves `PKCS#11`.

## Seguridad de inicio del firmante

El backend de firma `software`/`file` carga material de clave privada en texto plano en la memoria del proceso. Bursa protege este backend cuando el firmante escucha fuera de la máquina local:

| Ruta de configuración | Variable de entorno | Valor predeterminado | Comportamiento |
| --- | --- | --- | --- |
| `signer.allow_insecure_file_backend` | `SIGNER_ALLOW_INSECURE_FILE_BACKEND` | `false` | Permite explícitamente un backend `software`/`file` en un listener del firmante que no sea de bucle local. |
| `signer.listen_address` | `SIGNER_LISTEN_ADDRESS` | `""` | Determina si el listener del firmante usa una dirección de bucle local. |

Para un backend `software`/`file` configurado, Bursa rechaza el inicio cuando `signer.listen_address` no es de bucle local, a menos que `signer.allow_insecure_file_backend` sea `true`. El valor vacío de `signer.listen_address` significa todas las interfaces y cuenta como no perteneciente al bucle local para esta comprobación. Un listener de bucle local o una autorización explícita con `true` permite el inicio, pero Bursa emite una advertencia cada vez que se usa el backend. En producción, usa un backend de custodia como `Vault` o `SOPS` en lugar de material de clave en texto plano.

## Almacenamiento de marcas de agua del firmante

`signer.watermark` conserva las marcas de seguridad del firmante y los contadores de emisión de certificados operativos. `mem` los mantiene en memoria; `file` los guarda en SQLite, y `postgres` en PostgreSQL durable y compartido.

El almacenamiento `postgres` guarda de forma duradera y compartida las marcas de agua y los contadores del firmante. Las réplicas que protegen las mismas claves frías deben usar la misma base de datos PostgreSQL autoritativa.

| Ruta de configuración | Uso | Requisito |
| --- | --- | --- |
| `signer.watermark.type` | Selecciona el almacén de marcas de agua. | Bursa acepta `mem`, `file` o `postgres`. `file` usa un almacén durable respaldado por SQLite. Bursa solo permite `mem` con `warn` u `off`. |
| `signer.watermark.path` | Especifica la ruta del almacén SQLite. | Bursa requiere este valor cuando `signer.watermark.type` es `file`. |
| `signer.watermark.dsn` | Proporciona un DSN de PostgreSQL en texto plano. | Bursa lo usa como alternativa cuando `dsn_env` no está configurado. |
| `signer.watermark.dsn_env` | Indica el nombre de la variable de entorno que contiene el DSN. | Bursa da prioridad a esta fuente sobre `dsn`; la variable indicada debe tener un valor no vacío. |

Una configuración `postgres` requiere una fuente de DSN. Si `dsn_env` nombra una variable inexistente o vacía, Bursa rechaza la configuración y no recurre a `dsn`. El rol de la base de datos debe poder crear las tablas de marcas de agua y después leerlas y escribirlas. Mantén las credenciales fuera del archivo YAML y proporciónalas mediante un gestor de secretos o el entorno.

Cuando `signer.watermark.mode` no tiene un valor, Bursa usa `enforce`. Este modo requiere un almacén durable `file` o `postgres`. Bursa convierte un modo desconocido en `enforce`, por lo que ese modo también requiere almacenamiento durable.

```yaml
signer:
  watermark:
    type: postgres
    mode: enforce
    dsn_env: BURSA_SIGNER_WATERMARK_DSN
```

```bash
export BURSA_SIGNER_WATERMARK_DSN='postgres://bursa@db.example.com:5432/bursa?sslmode=verify-full'
```

### Modo del contador de certificados operativos

`signer.watermark.mode` controla la protección del contador de emisión del certificado operativo (`opcert`) por clave fría. El ajuste `mode` utiliza `enforce` de forma predeterminada.

| Valor | Comportamiento |
| --- | --- |
| `off` | Desactiva la comprobación del contador. |
| `warn` | Registra las regresiones del contador, pero devuelve la firma. |
| `enforce` | Requiere un almacén durable `file` o `postgres`, además de que `issue_counter` sea estrictamente mayor que el contador más alto almacenado para la misma clave fría. Bursa rechaza los contadores iguales o menores. |

### Sondeos de salud y disponibilidad

`/healthz` solo comprueba que el proceso está vivo y devuelve HTTP `200`. El firmante ejecuta la comprobación de disponibilidad de `/readyz` en segundo plano cada `10s`, con un límite de `3s`, y cada solicitud devuelve el resultado reciente almacenado en caché. La comprobación inicial permanece pendiente y `/readyz` devuelve HTTP `503` hasta que termina.

Con SQLite o PostgreSQL, la comprobación verifica que el almacén esté disponible y acepte operaciones de escritura. `/readyz` devuelve HTTP `200` cuando el resultado almacenado sigue siendo válido y HTTP `503` cuando el almacén no está disponible, cuando la comprobación falla o cuando el resultado queda obsoleto. El almacenamiento en memoria no tiene una dependencia externa, por lo que `/readyz` devuelve HTTP `200` en ese modo. Las solicitudes repetidas de `/readyz` no generan una escritura de marca de agua por solicitud.

## Archivo de configuración de `kes-agent`

El indicador `--config` indica el archivo YAML:

```bash
bursa kes-agent --config /etc/bursa/config.yaml
```

Si `--config` no especifica una ruta, `bursa kes-agent` usa la ruta de `BURSA_CONFIG`. Si ninguna fuente proporciona una ruta, Bursa carga las variables de entorno y los valores predeterminados sin archivo YAML. El comando valida los valores antes de abrir cualquiera de los sockets Unix. Comprueba la configuración del [listener remoto](#listener-remoto) al abrir ese listener, después de los sockets Unix.

## Configuración de `kes_agent`

El daemon se configura bajo `kes_agent`; cada campo admite su variable `KESAGENT_*` correspondiente, excepto `kes_agent.profiles` y `kes_agent.store`, que Bursa solo lee desde YAML. Los sockets de servicio y control deben tener rutas distintas; `service_socket` identifica el socket del productor.

| Clave YAML | Variable de entorno | Valor predeterminado | Uso y validación |
| --- | --- | --- | --- |
| `kes_agent.mode` | `KESAGENT_MODE` | `""` | Requerida. El valor `serve-key` envía la clave KES de firma al productor y `sign` firma los encabezados de bloque sin enviar la clave al productor. |
| `kes_agent.service_socket` | `KESAGENT_SERVICE_SOCKET` | `""` | Requerida. Ruta del socket Unix al que se conecta el productor. Debe diferir de `kes_agent.control_socket`. |
| `kes_agent.control_socket` | `KESAGENT_CONTROL_SOCKET` | `""` | Requerida. Ruta del socket Unix para los comandos de control. Debe diferir de `kes_agent.service_socket`. |
| `kes_agent.service_socket_mode` | `KESAGENT_SERVICE_SOCKET_MODE` | `0600` | Modo de archivo octal del socket de servicio. No puede conceder escritura a otros usuarios; la escritura del grupo sí está permitida. |
| `kes_agent.control_socket_mode` | `KESAGENT_CONTROL_SOCKET_MODE` | `0600` | Modo de archivo octal del socket de control. No puede conceder escritura al grupo ni a otros usuarios. |
| `kes_agent.cold_vkey_file` | `KESAGENT_COLD_VKEY_FILE` | `""` | Ruta opcional a la clave de verificación fría. Admite un sobre de texto de `cardano-cli`, hexadecimal o 32 bytes sin procesar. Bursa requiere esta clave o `kes_agent.cold_vkey_hex`. |
| `kes_agent.cold_vkey_hex` | `KESAGENT_COLD_VKEY_HEX` | `""` | Clave de verificación fría en hexadecimal. Bursa requiere esta clave o `kes_agent.cold_vkey_file`; si aparecen ambas, Bursa usa este valor hexadecimal. |
| `kes_agent.system_start` | `KESAGENT_SYSTEM_START` | `""` | Requerida. La configuración debe indicar el inicio del sistema Shelley con formato `RFC3339`. |
| `kes_agent.shelley_start_slot` | `KESAGENT_SHELLEY_START_SLOT` | `0` | Define el primer slot Shelley del ancla de la red cuando la era Byron usaba slots de 20 segundos. Bursa cuenta los slots desde este valor en `shelley_start_time`; sin el ancla, Bursa cuenta desde el slot `0` en `system_start`. |
| `kes_agent.shelley_start_time` | `KESAGENT_SHELLEY_START_TIME` | `""` | Define la hora RFC3339 que corresponde a `shelley_start_slot`; ambos valores deben coincidir con el ancla Shelley de la red. |
| `kes_agent.slot_length` | `KESAGENT_SLOT_LENGTH` | `1` | Duración de cada slot en segundos. El valor debe ser positivo. |
| `kes_agent.max_clock_skew` | `KESAGENT_MAX_CLOCK_SKEW` | `5s` | Adelanto máximo permitido entre el slot de un encabezado y el reloj del agente. El agente rechaza un encabezado que supere este margen. |
| `kes_agent.slots_per_kes_period` | `KESAGENT_SLOTS_PER_KES_PERIOD` | `0` | Requerida. La configuración debe indicar un número mayor que `0` de slots por periodo KES. |
| `kes_agent.max_kes_evolutions` | `KESAGENT_MAX_KES_EVOLUTIONS` | `62` | Número máximo de evoluciones del certificado operativo. |
| `kes_agent.evolve_interval` | `KESAGENT_EVOLVE_INTERVAL` | `1m` | Intervalo del planificador como cadena de duración de Go. El valor predeterminado es `1m`. |
| `kes_agent.guard_file` | `KESAGENT_GUARD_FILE` | `""` | Requerida sin un [almacén compartido](#almacén-compartido). La configuración debe indicar una ruta de archivo persistente y no vacía que el agente pueda abrir. |

Sin [`kes_agent.profiles`](#perfiles), estos campos de un solo pool forman un perfil llamado `default`. La clave de verificación fría debe proceder entonces de `cold_vkey_file` o `cold_vkey_hex` y resolver a 32 bytes. Antes del inicio también se requieren `system_start` en RFC3339, `slot_length` positivo, `slots_per_kes_period` distinto de cero y, salvo que haya un [almacén compartido](#almacén-compartido), una ruta durable `guard_file`. El agente KES solo conserva la clave de verificación fría; la clave de firma fría no entra en el agente. El archivo de guardia conserva el periodo KES autorizado más alto, lo restaura después de un reinicio y rechaza una reducción del periodo. Sin almacén compartido, Bursa rechaza el inicio cuando `kes_agent.guard_file` está vacío y no usa una alternativa en memoria para este guardia.

```yaml
kes_agent:
  mode: sign
  service_socket: /run/bursa/kes-agent.sock
  control_socket: /run/bursa/kes-agent-control.sock
  service_socket_mode: "0660"
  control_socket_mode: "0600"
  cold_vkey_file: /etc/bursa/pool-cold.vkey
  system_start: "2022-03-31T00:00:00Z"
  slot_length: 1
  slots_per_kes_period: 129600
  max_kes_evolutions: 62
  evolve_interval: 1m
  guard_file: /var/lib/bursa/kes-period.guard
```

### Listener remoto

Configure `kes_agent.attested_listen_address` para ofrecer el modo `sign` por TCP a un productor de bloques en otro host. El agente sigue atendiendo sus sockets Unix. El listener usa TLS de forma predeterminada. Agregue estas claves al bloque `kes_agent` junto con la configuración de los sockets.

| Clave YAML | Variable de entorno | Valor predeterminado | Uso y validación |
| --- | --- | --- | --- |
| `kes_agent.attested_listen_address` | `KESAGENT_ATTESTED_LISTEN_ADDRESS` | `""` | Opcional. Dirección TCP, como `:7000`, en la que el agente ofrece el modo `sign` a un productor remoto. Sin valor, el agente solo atiende los sockets Unix. Requiere `kes_agent.mode` con el valor `sign`. |
| `kes_agent.attested_tls_cert_file` | `KESAGENT_ATTESTED_TLS_CERT_FILE` | `""` | Certificado TLS del servidor para el listener remoto. Requerido junto con `attested_tls_key_file` salvo que `attested_plaintext` sea `true`. |
| `kes_agent.attested_tls_key_file` | `KESAGENT_ATTESTED_TLS_KEY_FILE` | `""` | Clave privada TLS del servidor para el listener remoto. Requerida junto con `attested_tls_cert_file` salvo que `attested_plaintext` sea `true`. En Unix, Bursa rechaza un archivo de clave que conceda acceso al grupo o a otros usuarios. |
| `kes_agent.attested_client_ca_file` | `KESAGENT_ATTESTED_CLIENT_CA_FILE` | `""` | Opcional. Archivo PEM con los certificados de CA que verifican los certificados de cliente del productor. Con este valor, cada conexión debe presentar un certificado de cliente que esta CA verifique; sin él, el listener no solicita certificados de cliente. El archivo debe contener al menos un certificado. |
| `kes_agent.attested_plaintext` | `KESAGENT_ATTESTED_PLAINTEXT` | `false` | Sirve el listener remoto por TCP sin TLS. Con `true`, deje sin configurar `attested_tls_cert_file`, `attested_tls_key_file` y `attested_client_ca_file`. |
| `kes_agent.control_client_spki_sha256` | `KESAGENT_CONTROL_CLIENT_SPKI_SHA256` | `[]` | Lista los resúmenes SHA-256 de SPKI de los certificados de cliente autorizados para abrir sesiones remotas de control del perfil único. Cada valor debe tener exactamente 64 caracteres hexadecimales. Requiere `attested_listen_address` con `attested_client_ca_file`; Bursa rechaza la configuración con `attested_plaintext` o sin verificación de certificados de cliente. |
| `kes_agent.sign_client_spki_sha256` | `KESAGENT_SIGN_CLIENT_SPKI_SHA256` | `[]` | Lista los resúmenes SHA-256 de SPKI de los certificados de cliente autorizados para abrir sesiones remotas de firma del perfil único. Cada valor debe tener exactamente 64 caracteres hexadecimales. Requiere `attested_listen_address` con `attested_client_ca_file`; Bursa rechaza la configuración con `attested_plaintext` o sin verificación de certificados de cliente. |
| `kes_agent.attestation_provider` | `KESAGENT_ATTESTATION_PROVIDER` | `""` | Requerido cuando se configura `attested_listen_address`. Nombra el verificador de atestación que debe usar el productor. El proveedor `none` no envía evidencia de atestación. |
| `kes_agent.attester_address` | `KESAGENT_ATTESTER_ADDRESS` | `""` | Adaptador de atestación dentro de la carga de trabajo protegida que produce evidencia vinculada a un nonce. Requerido para todos los proveedores excepto `none`, que lo rechaza. Use una URL `https://`, una URL `http://` de loopback o una URL de socket `unix://`. |

Con TLS, el listener requiere TLS 1.3 y un certificado y una clave. Al iniciar, el agente registra como `server_spki_sha256` la huella SHA-256 de la clave pública del certificado que sirve; un productor puede fijar ese valor. Con `attested_plaintext`, el agente no autentica al par remoto. Bursa termina al iniciar cuando un valor del listener remoto no es válido.

Las listas `control_client_spki_sha256` y `sign_client_spki_sha256` conceden autoridades independientes. La primera permite, después de la atestación, las operaciones remotas `info`, `gen-staged-key` e `install-key`; no permite firmar y `drop-key` permanece disponible solo mediante el socket de control local. La segunda limita las sesiones remotas de firma al perfil que contiene el resumen SPKI coincidente. Bursa solo admite cualquiera de estas identidades fijadas mediante un listener TLS que verifique el certificado del cliente con `attested_client_ca_file`; el listener en texto plano y TLS sin verificación del cliente no pueden admitir clientes fijados.

```yaml
kes_agent:
  mode: sign
  attested_listen_address: ":7000"
  attested_tls_cert_file: /etc/bursa/kes-agent/tls.crt
  attested_tls_key_file: /etc/bursa/kes-agent/tls.key
  attested_client_ca_file: /etc/bursa/kes-agent/client-ca.crt
  attestation_provider: none
```

### Perfiles

Configure `kes_agent.profiles` para atender varios pools desde un agente, en una red o en varias. Cada entrada es un pool en una red. Los perfiles se configuran solo en YAML.

| Ruta de configuración | Uso | Valor predeterminado o requisito |
| --- | --- | --- |
| `kes_agent.profiles[].name` | Nombra el perfil. | Requerido y único. Use de 1 a 64 letras, dígitos, `.`, `_` o `-`, empezando por una letra o un dígito. |
| `kes_agent.profiles[].cold_vkey_file` | Carga la clave de verificación fría del pool desde un sobre de texto de `cardano-cli`, bytes sin procesar o hexadecimal. | Indique este campo o `cold_vkey_hex`. |
| `kes_agent.profiles[].cold_vkey_hex` | Carga la clave de verificación fría del pool desde hexadecimal en línea. | Indique este campo o `cold_vkey_file`; si aparecen ambos, Bursa usa el valor hexadecimal. |
| `kes_agent.profiles[].system_start` | Indica el inicio del sistema de la génesis Shelley. | Requerido; use una marca de tiempo RFC3339. |
| `kes_agent.profiles[].shelley_start_slot` | Indica el primer slot de Shelley. | Configúrelo con `shelley_start_time` en redes cuya era Byron usaba slots más largos, como `4492800` en mainnet y `86400` en preprod. Sin ellos, Bursa cuenta los slots desde `system_start` con `slot_length`. |
| `kes_agent.profiles[].shelley_start_time` | Indica la hora del primer slot de Shelley. | Configúrelo con `shelley_start_slot` como marca de tiempo RFC3339, como `2020-07-29T21:44:51Z` en mainnet y `2022-06-21T00:00:00Z` en preprod. |
| `kes_agent.profiles[].slot_length` | Duración de cada slot en segundos. | El valor predeterminado es `1`; el valor debe ser positivo. |
| `kes_agent.profiles[].slots_per_kes_period` | Número de slots por periodo KES. | Indique un número mayor que `0`. |
| `kes_agent.profiles[].max_kes_evolutions` | Número máximo de evoluciones del certificado operativo. | El valor predeterminado es `62`. |
| `kes_agent.profiles[].max_clock_skew` | Indica cuánto puede adelantarse el slot de un encabezado al reloj del agente antes de que `sign` lo rechace. | El valor predeterminado es `5s`; use una duración de Go positiva. |
| `kes_agent.profiles[].guard_file` | Guarda el guardia monótono de periodos KES del perfil en esta ruta persistente. | Requerido con el almacén de archivos predeterminado; déjelo sin configurar con un [almacén compartido](#almacén-compartido). Cada perfil necesita su propio archivo. |
| `kes_agent.profiles[].control_client_spki_sha256` | Lista los resúmenes SHA-256 de SPKI de los certificados de cliente autorizados para el control remoto de este perfil. | Cada valor debe tener exactamente 64 caracteres hexadecimales. Requiere TLS con verificación mediante `attested_client_ca_file`; no funciona con texto plano ni con TLS sin verificación del cliente. |
| `kes_agent.profiles[].sign_client_spki_sha256` | Lista los resúmenes SHA-256 de SPKI de los certificados de cliente autorizados para la firma remota de este perfil. | Cada valor debe tener exactamente 64 caracteres hexadecimales. Requiere TLS con verificación mediante `attested_client_ca_file`; no funciona con texto plano ni con TLS sin verificación del cliente. |

Cuando se configura `profiles`, deje sin configurar los campos de un solo pool del nivel superior: `cold_vkey_file`, `cold_vkey_hex`, `system_start`, `shelley_start_slot`, `shelley_start_time`, `slots_per_kes_period`, `max_clock_skew` y `guard_file`. Deje `slot_length` y `max_kes_evolutions` en sus valores predeterminados `1` y `62`. Bursa rechaza el inicio cuando se configura cualquiera de estos campos del nivel superior y pide el valor en cada perfil.

Bursa también rechaza el inicio cuando dos perfiles comparten un archivo de guardia, incluido el mismo archivo alcanzado mediante un enlace simbólico o un enlace duro, y cuando dos perfiles tienen la misma clave de verificación fría y el mismo `system_start`. Una clave fría puede atender varias redes, que se distinguen por un `system_start` diferente. El modo `serve-key` admite exactamente un perfil; para varios pools, use el modo `sign`.

```yaml
kes_agent:
  mode: sign
  service_socket: /run/bursa/kes-agent.sock
  control_socket: /run/bursa/kes-agent-control.sock
  profiles:
    - name: pool-a
      cold_vkey_file: /etc/bursa/pool-a-cold.vkey
      system_start: "2022-10-25T00:00:00Z"
      slots_per_kes_period: 129600
      guard_file: /var/lib/bursa/pool-a.guard
    - name: pool-b
      cold_vkey_file: /etc/bursa/pool-b-cold.vkey
      system_start: "2022-10-25T00:00:00Z"
      slots_per_kes_period: 129600
      guard_file: /var/lib/bursa/pool-b.guard
```

### Almacén compartido

Configure `kes_agent.store` para guardar el piso de periodo KES y los registros de slots firmados de cada perfil en una base de datos PostgreSQL en lugar de archivos de guardia, de modo que varias réplicas del agente puedan compartirlos. El almacén se aplica tanto al perfil `default` de un solo pool como a `profiles`. El almacén se configura solo en YAML.

| Ruta de configuración | Uso | Valor predeterminado o requisito |
| --- | --- | --- |
| `kes_agent.store.type` | Selecciona dónde guarda el agente el guardia de slots de cada perfil. | El valor predeterminado es `file`, que usa el `guard_file` de cada perfil. Use `postgres` para una base de datos PostgreSQL compartida. Bursa rechaza otros valores. |
| `kes_agent.store.dsn_env` | Nombra una variable de entorno que contiene la cadena de conexión de PostgreSQL. | Requerido cuando `type` es `postgres`; la variable indicada debe contener un valor no vacío. Bursa rechaza este campo con el almacén `file`. Un host de base de datos que no sea de loopback requiere `sslmode=verify-full`. |
| `kes_agent.store.age_recipients` | Lista los destinatarios de age a los que el agente sella cada clave KES de firma preparada antes de guardarla en la base de datos. | Configúrelo junto con `age_identity_file` y solo cuando `type` sea `postgres`. |
| `kes_agent.store.age_identity_file` | Indica el archivo de identidades de age con el que cada réplica abre la clave KES instalada. | Configúrelo junto con `age_recipients` y solo cuando `type` sea `postgres`. En Unix, Bursa rechaza un archivo que conceda acceso al grupo o a otros usuarios. |
| `kes_agent.store.key_poll_interval` | Indica con qué frecuencia cada réplica consulta la base de datos en busca de una clave recién instalada. | El valor predeterminado es `10s`; use una duración de Go positiva. Requiere `age_recipients` y `age_identity_file`. |

Con el almacén `postgres`, deje `guard_file` sin configurar en cada perfil y en el nivel superior. Bursa rechaza el inicio cuando hay un archivo de guardia junto al almacén compartido, en lugar de ignorarlo.

Sin `age_recipients` y `age_identity_file`, cada réplica conserva su propia clave KES solo en memoria y la base de datos solo guarda el guardia de slots. Con ellos, el agente sella con age una clave preparada para `age_recipients` y la guarda en la base de datos, y cada réplica abre la clave instalada con las identidades de `age_identity_file`.

```yaml
kes_agent:
  mode: sign
  service_socket: /run/bursa/kes-agent.sock
  control_socket: /run/bursa/kes-agent-control.sock
  profiles:
    - name: pool-a
      cold_vkey_file: /etc/bursa/pool-a-cold.vkey
      system_start: "2022-10-25T00:00:00Z"
      slots_per_kes_period: 129600
  store:
    type: postgres
    dsn_env: BURSA_KES_AGENT_STORE_DSN
    age_recipients:
      - age1examplerecipient
    age_identity_file: /etc/bursa/kes-agent/age-identity.txt
    key_poll_interval: 10s
```

Proporcione el DSN mediante la variable de entorno indicada en lugar de incluir una contraseña en el archivo YAML.

### Permisos de los sockets

Los dos modos deben ser cadenas de permisos octales válidas, como `0600`. El modo del socket de servicio puede conceder escritura al grupo, por ejemplo `0660`, cuando el productor y el agente comparten un grupo dedicado. Nunca puede conceder escritura a otros usuarios.

El socket de control acepta comandos que pueden generar, instalar o eliminar claves KES. Por eso `kes_agent.control_socket_mode` nunca puede ampliar la escritura al grupo ni a otros usuarios. El valor predeterminado `0600` cubre la política de propietario más restrictiva.

### Migración desde `kes_agent.socket_mode`

`kes_agent.socket_mode` ya no configura los sockets. La migración sustituye esa clave por dos valores independientes:

| Configuración anterior | Configuración nueva | Variable de entorno nueva |
| --- | --- | --- |
| `kes_agent.socket_mode` | `kes_agent.service_socket_mode` | `KESAGENT_SERVICE_SOCKET_MODE` |
| `kes_agent.socket_mode` | `kes_agent.control_socket_mode` | `KESAGENT_CONTROL_SOCKET_MODE` |

La clave antigua ya no es válida. El socket de servicio conserva la amplitud que necesita el productor, pero el socket de control usa un modo que no concede escritura al grupo ni a otros usuarios. La migración no puede ampliar el acceso de escritura del socket de control.

## Configuración de la API heredada

Configura la API bajo la clave YAML `api`.

| Clave YAML | Variable de entorno | Valor predeterminado | Uso y validación |
| --- | --- | --- | --- |
| `api.address` | `API_LISTEN_ADDRESS` | `127.0.0.1` | Dirección de escucha de la API. El valor predeterminado limita la escucha al loopback. |
| `api.port` | `API_LISTEN_PORT` | `8080` | Puerto de escucha de la API. |
| `api.tls_cert_file` | `API_TLS_CERT_FILE` | `""` | Ruta al certificado TLS del servidor. TLS requiere este valor y `api.tls_key_file`. |
| `api.tls_key_file` | `API_TLS_KEY_FILE` | `""` | Ruta a la clave privada TLS del servidor. TLS requiere este valor y `api.tls_cert_file`. |
| `api.jwt_secret` | `API_JWT_SECRET` | `""` | Fuente de confianza bearer con HS256. El secreto debe tener al menos 32 bytes. El secreto debe permanecer en un gestor de secretos o en una variable de entorno, no en un archivo YAML. |
| `api.jwks_url` | `API_JWKS_URL` | `""` | Fuente de confianza bearer mediante un endpoint `JWKS`. La URL debe usar `https://`; HTTP solo está permitido para desarrollo en loopback. |
| `api.jwt_issuer` | `API_JWT_ISSUER` | `""` | Restricción opcional del emisor aceptado en los tokens bearer. |
| `api.jwt_audience` | `API_JWT_AUDIENCE` | `""` | Bursa exige esta audiencia cuando `api.jwt_secret` o `api.jwks_url` tiene un valor y valida el mismo valor en `aud` de cada token bearer. |
| `api.jwt_admin_subjects` | `API_JWT_ADMIN_SUBJECTS` | `[]` | Lista no vacía de sujetos JWT autorizados para administrar billeteras persistidas cuando se configura cualquier backend de almacenamiento de billeteras. |

Para una dirección de escucha que no sea de loopback, Bursa se niega a iniciar si no encuentra los dos archivos TLS y exactamente una fuente de confianza bearer: `API_JWT_SECRET` o `API_JWKS_URL`. La configuración no debe incluir ambas fuentes. La URL `API_JWKS_URL` debe usar `https://` fuera de loopback.

La escucha de loopback permite el desarrollo mediante texto sin cifrar y puede omitir los archivos TLS y la fuente de confianza bearer. Cuando el operador configura TLS, debe incluir el certificado y la clave privada juntos. Cuando `api.jwt_secret` o `api.jwks_url` tiene un valor, Bursa exige un `api.jwt_audience` no vacío y el mismo valor en `aud` de cada token bearer; Bursa rechaza el inicio sin audiencia y rechaza la autenticación cuando falta o no coincide `aud`. `api.jwt_issuer` sigue siendo una restricción opcional que Bursa aplica cuando el operador lo configura.

Cuando se configura cualquier backend de almacenamiento de billeteras, Bursa exige al menos un sujeto administrador no vacío en `api.jwt_admin_subjects`. Una lista ausente o vacía impide el inicio. Bursa protege las rutas `/api/wallet/list`, `/api/wallet/get`, `/api/wallet/update` y `/api/wallet/delete`: cada solicitud debe incluir un encabezado `Authorization: Bearer <JWT>` válido, y el sujeto del token debe coincidir con un sujeto de la lista de administradores.
Si la billetera solicitada no existe, `/api/wallet/get`, `/api/wallet/update` y `/api/wallet/delete` devuelven HTTP `404` con el cuerpo estructurado `api.ErrorResponse` definido en OpenAPI.

```yaml
api:
  address: 0.0.0.0
  port: 8080
  tls_cert_file: /run/secrets/bursa-api-cert.pem
  tls_key_file: /run/secrets/bursa-api-key.pem
  jwks_url: https://identity.example.com/.well-known/jwks.json
  jwt_issuer: https://identity.example.com
  jwt_audience: bursa-api
```

Mantén `api.jwt_secret` en el entorno o en un secreto de despliegue, nunca en un YAML versionado.

## Políticas de transacciones del firmante

Configura los permisos de transacciones según la operación debajo de `signer.keys[].tx_policy`. Los ajustes generales `allow_certificates` y `allow_votes` siguen disponibles, pero una lista no vacía de `allowed_certificates` tiene prioridad sobre `allow_certificates`. Una lista no vacía de `allowed_voter_kinds` o `allowed_drep_ids` selecciona el modo de lista permitida en lugar de `allow_votes`. Bursa deniega la operación de forma predeterminada cuando no se establece ninguna lista permitida ni permiso booleano aplicable.

```yaml
signer:
  keys:
    - hash: "0000000000000000000000000000000000000000000000000000000000"
      tx_policy:
        allow_certificates: false
        allowed_certificates:
          - stake_registration
        allow_votes: false
        allowed_voter_kinds:
          - drep_key
        allowed_drep_ids:
          - "hex-credential-id"
```

Los valores aceptados de `allowed_certificates` son:

`stake_registration`, `stake_deregistration`, `stake_delegation`, `pool_registration`, `pool_retirement`, `genesis_key_delegation`, `move_instantaneous_rewards`, `registration`, `deregistration`, `vote_delegation`, `stake_vote_delegation`, `stake_registration_delegation`, `vote_registration_delegation`, `stake_vote_registration_delegation`, `auth_committee_hot`, `resign_committee_cold`, `drep_registration`, `drep_deregistration` y `drep_update`.

Los valores aceptados de `allowed_voter_kinds` son:

`committee_hot_key`, `committee_hot_script`, `drep_key`, `drep_script` y `staking_pool_key`.

Establece `allowed_drep_ids` con ID de credencial hexadecimales para limitar los votantes DRep a las credenciales indicadas. Una lista de ID DRep también deniega los votantes que no tienen un ID de credencial DRep. Bursa acepta únicamente los tipos de certificado y de votante enumerados. Si Bursa no puede decodificar el tipo de operación o los detalles necesarios para una lista permitida activa, deniega la firma.

### Política de solicitudes del firmante

```yaml
signer:
  keys:
    - hash: "0000000000000000000000000000000000000000000000000000000000"
      allowed_requests:
        - opcert
```

`signer.keys[].allowed_requests` debe incluir `opcert` para autorizar solicitudes de firma de certificados operativos. Bursa deniega estas solicitudes cuando la política de la clave no incluye `opcert`:

| Configuración | Solicitud | Comportamiento |
| --- | --- | --- |
| `signer.keys[].allowed_requests: [opcert]` | `POST /v1/sign` con `type: opcert` | Permite la firma del certificado operativo. |
| Política ausente o lista sin `opcert` | `POST /v1/sign` con `type: opcert` | Bursa deniega la operación. |

Para emitir un certificado operativo, el llamador también necesita una concesión explícita para la clave fría y para la clave de verificación KES exacta que solicita:

```yaml
signer:
  callers:
    - subject: caller-subject
      keys:
        - "0000000000000000000000000000000000000000000000000000000000000000"
      opcerts:
        - key: "0000000000000000000000000000000000000000000000000000000000000000"
          kes_vkeys:
            - "1111111111111111111111111111111111111111111111111111111111111111"
```

Cada `opcerts[].key` debe aparecer también en `signer.callers[].keys`. `kes_vkeys` debe enumerar de forma explícita las claves de verificación KES que ese llamador puede certificar; una lista vacía no es válida. Bursa deniega la solicitud si la clave fría o la clave de verificación KES exacta no aparece en la concesión.

### Restricciones de transacciones por llamador

Usa `signer.caller_policies` como un mapa de sujeto llamador a hash de clave y después a anulaciones de transacciones sustractivas:

```yaml
signer:
  caller_policies:
    "caller-subject":
      "0000000000000000000000000000000000000000000000000000000000":
        networks: ["mainnet"]
        allowed_outputs: ["addr1example"]
        max_output_ada: 100
        max_total_out_ada: 500
        max_fee_ada: 2
        allowed_certificates: ["stake_registration"]
        allowed_voter_kinds: ["drep_key"]
        allowed_drep_ids: ["hex-credential-id"]
        forbid_certificates: true
        forbid_mint: true
        forbid_withdrawals: true
        forbid_votes: true
        forbid_proposals: true
        forbid_treasury: true
```

Cada clave de `signer.caller_policies` identifica un sujeto llamador. Cada clave anidada identifica un hash de clave. Los campos de anulación admitidos son `networks`, `allowed_outputs`, `max_output_ada`, `max_total_out_ada`, `max_fee_ada`, `allowed_certificates`, `allowed_voter_kinds`, `allowed_drep_ids`, `forbid_certificates`, `forbid_mint`, `forbid_withdrawals`, `forbid_votes`, `forbid_proposals` y `forbid_treasury`.

Bursa intersecta cada anulación del llamador con la política base de la clave, por lo que una anulación solo puede reducir la autoridad y no puede conceder un permiso que la política base deniega. Los campos de anulación desconocidos y los hashes de clave no válidos impiden que Bursa construya una política válida.

Cuando una transacción incluye entradas de garantía (`collateral_inputs`), Bursa exige `total_collateral` para autorizarla. Bursa evalúa el cargo y el retorno de garantía con los mismos límites configurados para la comisión, las salidas, el valor total, la red, las direcciones y los activos nativos o múltiples activos que aplica a la ruta de valor ordinaria. Las anulaciones específicas del llamador también restringen la ruta de garantía.

### Hook de política externo

Establece `signer.policy_hook_url` para habilitar una comprobación de política externa después de que la política estática apruebe una solicitud. La variable de entorno `SIGNER_POLICY_HOOK_URL` sustituye este ajuste. La URL debe ser absoluta, usar `https` y tener un nombre de host no vacío. Bursa verifica el certificado del servidor mediante el almacén de confianza del sistema y rechaza las redirecciones. Usa `signer.policy_hook_timeout_ms` para configurar el tiempo de espera de la solicitud en milisegundos; `SIGNER_POLICY_HOOK_TIMEOUT_MS` lo sustituye. El valor `0` usa el valor predeterminado de cinco segundos. Bursa limita los valores configurados a un día.

Bursa envía el resumen de la transacción como JSON mediante `POST` sobre la conexión HTTPS. El resumen puede incluir estos campos:
La API de inspección y la especificación OpenAPI de Bursa exponen `collateral_inputs`, `collateral_return` y `total_collateral` como campos opcionales de `TxInspection`. `collateral_inputs` contiene las entradas de transacción usadas como garantía; `collateral_return` usa los campos de una salida (`address`, `lovelace` y `has_assets`); y `total_collateral` representa el importe como una cadena. Cuando la transacción proporciona datos de garantía, el hook recibe estos campos junto con las salidas ordinarias y la comisión.

```json
{
  "type": "tx",
  "caller": "caller-subject",
  "key": "key-hash",
  "tx_id": "transaction-id",
  "fee": "1000000",
  "ttl": 123,
  "outputs": [
    {
      "address": "addr1example",
      "lovelace": "5000000",
      "has_assets": true
    }
  ],
  "collateral_inputs": [
    {
      "tx_id": "collateral-transaction-id",
      "index": 0
    }
  ],
  "collateral_return": {
    "address": "addr1example",
    "lovelace": "4000000",
    "has_assets": false
  },
  "total_collateral": "1000000",
  "certificate_count": 1,
  "certificates": ["stake_registration"],
  "has_mint": false,
  "withdrawal_count": 1,
  "voting_procedure_count": 1,
  "voters": [
    {
      "kind": "drep_key",
      "drep_id": "hex-credential-id"
    }
  ],
  "proposal_procedure_count": 1,
  "proposal_deposit_total": "5000000",
  "has_treasury_donation": true,
  "treasury_donation": "1000000",
  "certificate_deposit_total": "2000000",
  "certificate_refund_total": "0",
  "unresolved_certificate_deposits": 0,
  "unresolved_certificate_refunds": 0,
  "certificate_value_effects_complete": true,
  "voter_kinds": ["drep_key"],
  "drep_ids": ["hex-credential-id"]
}
```

`voters` contiene el `kind` de cada votante y, cuando corresponde, su `drep_id`. `certificate_value_effects_complete` y los contadores de depósitos o reembolsos no resueltos indican si Bursa conoce todos los efectos de valor de los certificados.

Con `max_total_out_ada`, Bursa incluye la donación a la tesorería, los efectos de depósitos y reembolsos de certificados y los depósitos de propuestas en el valor total evaluado. Bursa deniega la firma cuando no puede resolver un efecto de valor requerido.

El hook autoriza la firma únicamente cuando Bursa recibe HTTP `200` con el objeto JSON explícito `{"allow": true}`. La respuesta no puede incluir datos posteriores al objeto JSON. Los errores de transporte, los tiempos de espera, las respuestas distintas de `200`, el JSON ilegible o mal formado, cualquier valor de `allow` distinto de `true` y un resumen de operación incompleto deniegan la firma. Bursa deniega antes de invocar el hook cuando no puede construir un resumen completo de certificados o votantes.

## Solución de problemas

- Si Bursa informa que `module` es obligatorio, establece `signer.backends[].module` en la ruta del módulo `PKCS#11`.
- Si Bursa informa que `token_label` o `slot` es obligatorio, proporciona al menos un campo de selección del token.
- Si Bursa informa que `pin_env` es obligatorio o que su variable de entorno está vacía, establece `signer.backends[].pin_env` con el nombre de una variable de entorno y proporciona el PIN de usuario mediante esa variable.
- Si Bursa informa de un tipo de clave no válido, establece cada valor de `signer.backends[].keys[].type` en uno de los valores admitidos en la referencia de configuración.

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
