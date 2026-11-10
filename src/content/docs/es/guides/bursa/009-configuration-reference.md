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

`/healthz` solo comprueba que el proceso está vivo y devuelve HTTP `200`. `/readyz` comprueba el almacén de marcas de agua configurado y aplica un tiempo de espera de tres segundos.

Con SQLite o PostgreSQL, `/readyz` verifica que el almacén esté disponible y acepte operaciones de escritura. Devuelve HTTP `200` cuando la comprobación tiene éxito y HTTP `503` cuando el almacén no está disponible o no permite escribir. El almacenamiento en memoria no tiene una dependencia externa, por lo que `/readyz` devuelve HTTP `200` en ese modo.

## Archivo de configuración de `kes-agent`

El indicador `--config` indica el archivo YAML:

```bash
bursa kes-agent --config /etc/bursa/config.yaml
```

Si `--config` no especifica una ruta, `bursa kes-agent` usa la ruta de `BURSA_CONFIG`. Si ninguna fuente proporciona una ruta, Bursa carga las variables de entorno y los valores predeterminados sin archivo YAML. El comando valida los valores antes de abrir cualquiera de los sockets Unix.

## Configuración de `kes_agent`

El daemon se configura bajo `kes_agent`; cada campo admite su variable `KESAGENT_*` correspondiente. Los sockets de servicio y control deben tener rutas distintas; `service_socket` identifica el socket del productor.

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
| `kes_agent.guard_file` | `KESAGENT_GUARD_FILE` | `""` | Requerida. La configuración debe indicar una ruta de archivo persistente y no vacía que el agente pueda abrir. |
| `kes_agent.profiles` | Solo YAML | `[]` | Sustituye los campos de un solo grupo por una lista de perfiles. Cada perfil define su clave fría, calendario, guardia y estado de slot; los comandos de control reciben el nombre del perfil. Bursa exige nombres únicos de 1 a 64 caracteres: el primer carácter debe ser una letra o un dígito ASCII y los siguientes deben ser letras, dígitos, `.`, `_` o `-`. No combine `profiles` con los campos de grupo único; elimine también `slot_length` y `max_kes_evolutions` o déjelos en sus valores predeterminados. |
| `kes_agent.store.type` | Solo YAML | `file` | Selecciona el almacén de guardia. `file` usa `guard_file`; `postgres` comparte entre réplicas la marca de periodo y los registros de slots firmados. PostgreSQL requiere dejar `guard_file` sin establecer. |
| `kes_agent.store.dsn_env` | Solo YAML | `""` | Indica la variable de entorno que contiene el DSN de PostgreSQL cuando `store.type` es `postgres`. Un host remoto requiere `sslmode=verify-full`. |
| `kes_agent.store.age_recipients` | Solo YAML | `[]` | Destinatarios `age` que sellan las claves KES compartidas del almacén PostgreSQL. El operador debe configurarlo junto con `age_identity_file`. |
| `kes_agent.store.age_identity_file` | Solo YAML | `""` | Archivo de identidad `age` para abrir las claves KES compartidas. El operador debe configurarlo junto con `age_recipients`; Bursa rechaza un archivo legible por el grupo o por otros usuarios. |
| `kes_agent.store.key_poll_interval` | Solo YAML | `10s` | Intervalo con el que una réplica comprueba si PostgreSQL contiene una clave instalada nueva. Solo aplica al almacén PostgreSQL con claves selladas mediante `age`. |
| `kes_agent.attested_listen_address` | `KESAGENT_ATTESTED_LISTEN_ADDRESS` | `""` | Habilita el listener atestado en modo `sign`. Solo admite exactamente un perfil. El listener aplica el protocolo `bursa-attested-kes/1`. |
| `kes_agent.attested_tls_cert_file` | `KESAGENT_ATTESTED_TLS_CERT_FILE` | `""` | Certificado TLS 1.3 del listener atestado. Configúralo junto con `attested_tls_key_file` para el transporte TLS. |
| `kes_agent.attested_tls_key_file` | `KESAGENT_ATTESTED_TLS_KEY_FILE` | `""` | Clave privada TLS del listener atestado. Configúralo junto con `attested_tls_cert_file`. |
| `kes_agent.attested_client_ca_file` | `KESAGENT_ATTESTED_CLIENT_CA_FILE` | `""` | CA que emite los certificados de cliente. El agente exige un certificado de cliente solo cuando el operador configura este archivo. |
| `kes_agent.attested_plaintext` | `KESAGENT_ATTESTED_PLAINTEXT` | `false` | Usa TCP sin cifrado para el listener atestado cuando otra capa proporciona la seguridad de transporte. No lo combines con ninguno de los tres archivos TLS. |
| `kes_agent.attestation_provider` | `KESAGENT_ATTESTATION_PROVIDER` | `""` | Selecciona `nitro`, `confidential-space` o `none`. `none` no usa un atestador y devuelve evidencia vacía; Bursa exige `attester_address` con `nitro` o `confidential-space`. |
| `kes_agent.attester_address` | `KESAGENT_ATTESTER_ADDRESS` | `""` | Dirección del adaptador que produce evidencia de atestación nueva para cada desafío. Bursa rechaza este campo con el proveedor `none`. |

La clave de verificación fría debe proceder de `cold_vkey_file` o `cold_vkey_hex` y resolver a 32 bytes. Antes del inicio, el agente también exige `system_start` en RFC3339, `slot_length` positivo y `slots_per_kes_period` distinto de cero. El agente exige una ruta durable `guard_file` cuando `store.type` no es `postgres`. En redes cuyo Byron usaba slots de 20 segundos, `shelley_start_slot` y `shelley_start_time` deben anclar el conteo a Shelley. El agente KES solo conserva la clave de verificación fría; la clave de firma fría no entra en el agente. El archivo de guardia o el almacén compartido conserva el periodo KES autorizado más alto y los registros de slots, los restaura después de un reinicio y rechaza una reducción del periodo.

`kes_agent.profiles` solo funciona en YAML. Bursa sustituye con esta lista `cold_vkey_file` o `cold_vkey_hex`, `system_start`, `shelley_start_slot`, `shelley_start_time`, `slots_per_kes_period`, `max_clock_skew` y `guard_file` de nivel superior. Cada perfil tiene sus propias claves, horarios, guardia y estado de slots. El agente enruta cada encabezado mediante la clave fría emisora y la clave KES del certificado operativo. Bursa rechaza un perfil que no coincide. El modo `serve-key` y el listener atestado requieren exactamente un perfil; una configuración sin `profiles` conserva un único perfil llamado `default`.

El almacén `postgres` comparte de forma durable los guardias entre réplicas y también puede compartir las claves KES si el operador configura `age_recipients`, `age_identity_file` y, opcionalmente, `key_poll_interval`. El agente rechaza `store.type: postgres` junto con `guard_file`. La identidad `age` debe ser legible solo por su propietario; los respaldos de la base de datos y cualquier proceso que posea esa identidad pueden leer las claves selladas.

El listener atestado admite TLS 1.3 con autenticación del servidor, TLS 1.3 con certificados de cliente o TCP sin cifrado mediante `attested_plaintext`. El agente rechaza la combinación de `attested_plaintext` con `attested_tls_cert_file`, `attested_tls_key_file` o `attested_client_ca_file`. El proveedor `none` no usa un atestador ni permite `attester_address`, y responde al desafío con evidencia vacía. El agente solicita certificados de cliente únicamente cuando el operador configura `attested_client_ca_file`.

El listener atestado aplica una fecha límite de 10 segundos para el saludo, admite como máximo 64 saludos pendientes en total y 4 por origen, donde una red IPv6 usa su prefijo `/64`. El agente expulsa el saludo pendiente más antiguo cuando alcanza cualquiera de esos límites. Los saludos pendientes no consumen slots autenticados.

El agente firma como máximo un cuerpo de encabezado por slot. Puede repetir un cuerpo idéntico; rechaza un cuerpo distinto para un slot ya firmado y rechaza también los slots inferiores. Los registros de guardia permanecen durables en `guard_file` o compartidos en PostgreSQL según la configuración.

Los ajustes de `metrics` usan un listener de bucle local dedicado:

| Clave YAML | Variable de entorno | Valor predeterminado | Uso y validación |
| --- | --- | --- | --- |
| `metrics.address` | `METRICS_LISTEN_ADDRESS` | `127.0.0.1` | Dirección de bucle local sin puerto para el listener de salud y métricas. |
| `metrics.port` | `METRICS_LISTEN_PORT` | `8082` | Puerto del listener. El valor `0` deshabilita todos sus endpoints. |

El agente expone `GET /healthz` para indicar que el proceso está vivo, `GET /readyz` para indicar que puede firmar y `GET /metrics` para métricas Prometheus. `/readyz` devuelve `503` cuando PostgreSQL no responde a una escritura de prueba en tres segundos o cuando una réplica no puede cargar una clave compartida instalada; devuelve `200` cuando el agente está listo. `metrics.port: 0` deshabilita los tres endpoints.

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
