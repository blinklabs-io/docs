---
title: Referencia de configuración de Bursa
description: Configura el agente KES y la API heredada de Bursa.
---

## Descripción general

Esta guía describe la configuración de `bursa kes-agent` y de la API heredada de Bursa. Bursa lee un archivo YAML y después aplica las variables de entorno; las variables de entorno tienen prioridad sobre los valores YAML.

La [guía de línea de comandos](./003-commands) incluye los comandos disponibles de Bursa.

## Variable de entorno de la billetera

| Variable de entorno | Valor predeterminado | Comportamiento |
| --- | --- | --- |
| `BURSA_CONNECTOR` | `false` | Habilita el backend del conector de dApps. |
| `BURSA_LEAN` | `false` | Establece el valor inicial de lean-node/history-expiry solo en la primera ejecución, cuando todavía no existe un valor persistido. Una preferencia ya persistida tiene prioridad y la variable no la sobrescribe después. |

## API de configuración de history expiry

Bursa persiste el ajuste de lean-node/history-expiry. `history expiry` es una opción de construcción del nodo, por lo que Bursa requiere reiniciar el nodo para aplicar un valor persistido que todavía no use.

`GET /wallet/settings/history-expiry` devuelve:

```text
{ "enabled": boolean, "restart_required": boolean }
```

`PUT /wallet/settings/history-expiry` requiere este cuerpo JSON:

```text
{ "enabled": boolean }
```

El cliente debe enviar el campo obligatorio `enabled` como un booleano JSON. El JSON no válido o la ausencia de `enabled` producen HTTP `400`. Una actualización correcta persiste el valor y devuelve los mismos campos `enabled` y `restart_required`. `restart_required` es `true` cuando el valor persistido todavía no coincide con el valor aplicado al nodo en ejecución.

## Referencia de configuración

Agrega una entrada de backend en `signer.backends` y establece `type` en `pkcs11`. Usa los campos siguientes:

| Ruta de configuración | Propósito | Validación |
| --- | --- | --- |
| `signer.backends[].type` | Selecciona el backend de firma. | Establece el valor `pkcs11`. |
| `signer.backends[].module` | Especifica la ruta al módulo `PKCS#11`, incluido el archivo `.so`. | Establece este campo. Bursa rechaza un valor vacío. |
| `signer.backends[].token_label` | Selecciona el token o el slot mediante su etiqueta. | Establece este campo o `slot`. Bursa requiere al menos un campo de selección. |
| `signer.backends[].slot` | Selecciona un slot mediante su ID de slot explícito. | Establece este campo o `token_label`. Bursa requiere al menos un campo de selección. |
| `signer.backends[].pin_env` | Indica el nombre de la variable de entorno que contiene el PIN de usuario. | Establece este campo y asigna a la variable de entorno indicada un valor no vacío. Bursa no lee el PIN de la configuración en texto plano. |
| `signer.backends[].keys[]` | Define una lista opcional de objetos permitidos del token. | Cuando aparece, incluye `name` y `type` en cada entrada. |
| `signer.backends[].keys[].name` | Coincide con el `CKA_LABEL` del objeto del token. | Establece este campo para cada entrada de `keys`. |
| `signer.backends[].keys[].type` | Asigna un tipo de clave de Cardano al objeto del token coincidente. | Establece este campo para cada entrada de `keys`. Usa `payment`, `stake`, `drep`, `cc-hot`, `cc-cold`, `pool` o `policy`. |

## Requisitos de compilación

Una compilación de Bursa desde el código fuente requiere Go `1.26.0` o posterior. Además, compila Bursa con `CGO` habilitado y la etiqueta de compilación `pkcs11` para incluir el backend `PKCS#11`. Sin esa etiqueta, Bursa falla de inmediato cuando una configuración selecciona este backend y devuelve:

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

Configura `signer.watermark.type` con `postgres` para guardar de forma duradera y compartida las marcas de agua y los contadores del firmante. El almacenamiento en memoria y el almacenamiento en SQLite siguen disponibles. Las réplicas que protegen las mismas claves frías deben usar la misma base de datos PostgreSQL autoritativa.

| Ruta de configuración | Uso | Requisito |
| --- | --- | --- |
| `signer.watermark.type` | Selecciona el almacén de marcas de agua. | Establece `postgres` para usar PostgreSQL. |
| `signer.watermark.dsn` | Proporciona un DSN de PostgreSQL en texto plano. | Bursa lo usa como alternativa cuando `dsn_env` no está configurado. |
| `signer.watermark.dsn_env` | Indica el nombre de la variable de entorno que contiene el DSN. | Bursa da prioridad a esta fuente sobre `dsn`; la variable indicada debe tener un valor no vacío. |

Una configuración `postgres` requiere una fuente de DSN. Si `dsn_env` nombra una variable inexistente o vacía, Bursa rechaza la configuración y no recurre a `dsn`. El rol de la base de datos debe poder crear las tablas de marcas de agua y después leerlas y escribirlas. Mantén las credenciales fuera del archivo YAML y proporciónalas mediante un gestor de secretos o el entorno.

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

`signer.watermark.mode` controla la protección del contador de emisión del certificado operativo (`opcert`) por clave fría. El valor predeterminado es `enforce`.

| Valor | Comportamiento |
| --- | --- |
| `off` | Desactiva la comprobación del contador. |
| `warn` | Registra las regresiones del contador, pero devuelve la firma. |
| `enforce` | Requiere que `issue_counter` sea estrictamente mayor que el contador más alto almacenado para la misma clave fría. Bursa rechaza los contadores iguales o menores. |

### Sondeos de salud y disponibilidad

`/healthz` solo comprueba que el proceso está vivo y devuelve HTTP `200`. `/readyz` comprueba el almacén de marcas de agua configurado y aplica un tiempo de espera de tres segundos.

Con SQLite o PostgreSQL, `/readyz` verifica que el almacén esté disponible y acepte operaciones de escritura. Devuelve HTTP `200` cuando la comprobación tiene éxito y HTTP `503` cuando el almacén no está disponible o no permite escribir. El almacenamiento en memoria no tiene una dependencia externa, por lo que `/readyz` devuelve HTTP `200` en ese modo.

## Archivo de configuración de `bursa kes-agent`

El indicador `--config` indica el archivo YAML:

```bash
bursa kes-agent --config /ruta/a/bursa.yaml
```

Si `--config` no especifica una ruta, `bursa kes-agent` usa la ruta de `BURSA_CONFIG`. Una ruta vacía carga la configuración mediante variables de entorno.

## Configuración de `kes_agent`

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
| `kes_agent.slot_length` | `KESAGENT_SLOT_LENGTH` | `1` | Duración de cada slot en segundos. El valor debe ser positivo. |
| `kes_agent.slots_per_kes_period` | `KESAGENT_SLOTS_PER_KES_PERIOD` | `0` | Requerida. La configuración debe indicar un número mayor que `0` de slots por periodo KES. |
| `kes_agent.max_kes_evolutions` | `KESAGENT_MAX_KES_EVOLUTIONS` | `62` | Número máximo de evoluciones del certificado operativo. |
| `kes_agent.evolve_interval` | `KESAGENT_EVOLVE_INTERVAL` | `1m` | Intervalo del planificador como cadena de duración de Go. El valor predeterminado es `1m`. |
| `kes_agent.guard_file` | `KESAGENT_GUARD_FILE` | `""` | Requerida. La configuración debe indicar una ruta de archivo persistente y no vacía que el agente pueda abrir. |

El agente KES solo conserva la clave de verificación fría; la clave de firma fría no entra en el agente. El archivo de guardia conserva el periodo KES autorizado más alto, lo restaura después de un reinicio y rechaza una reducción del periodo. Bursa no usa una alternativa en memoria para este guardia.

### Permisos de los sockets

Los dos modos deben ser cadenas de permisos octales válidas, como `0600`. El modo del socket de servicio puede conceder escritura al grupo, por ejemplo `0660`, cuando el productor y el agente comparten un grupo dedicado. Nunca puede conceder escritura a otros usuarios.

El socket de control acepta comandos que pueden generar, instalar o eliminar claves KES. Por eso `kes_agent.control_socket_mode` nunca puede ampliar la escritura al grupo ni a otros usuarios. El valor predeterminado `0600` cubre la política de propietario más restrictiva.

### Migración desde `kes_agent.socket_mode`

`kes_agent.socket_mode` ya no configura los sockets. La migración sustituye esa clave por dos valores independientes:

| Configuración anterior | Configuración nueva | Variable de entorno nueva |
| --- | --- | --- |
| `kes_agent.socket_mode` | `kes_agent.service_socket_mode` | `KESAGENT_SERVICE_SOCKET_MODE` |
| `kes_agent.socket_mode` | `kes_agent.control_socket_mode` | `KESAGENT_CONTROL_SOCKET_MODE` |

El socket de servicio conserva la amplitud que necesita el productor, pero el socket de control usa un modo que no concede escritura al grupo ni a otros usuarios. La migración no puede ampliar el acceso de escritura del socket de control.

## Configuración de la API heredada

| Clave YAML | Variable de entorno | Valor predeterminado | Uso y validación |
| --- | --- | --- | --- |
| `api.address` | `API_LISTEN_ADDRESS` | `127.0.0.1` | Dirección de escucha de la API. El valor predeterminado limita la escucha al loopback. |
| `api.port` | `API_LISTEN_PORT` | `8080` | Puerto de escucha de la API. |
| `api.tls_cert_file` | `API_TLS_CERT_FILE` | `""` | Ruta al certificado TLS del servidor. TLS requiere este valor y `api.tls_key_file`. |
| `api.tls_key_file` | `API_TLS_KEY_FILE` | `""` | Ruta a la clave privada TLS del servidor. TLS requiere este valor y `api.tls_cert_file`. |
| `api.jwt_secret` | `API_JWT_SECRET` | `""` | Fuente de confianza bearer con HS256. El secreto debe tener al menos 32 bytes. El secreto debe permanecer en un gestor de secretos o en una variable de entorno, no en un archivo YAML. |
| `api.jwks_url` | `API_JWKS_URL` | `""` | Fuente de confianza bearer mediante un endpoint `JWKS`. La URL debe usar `https://`; HTTP solo está permitido para desarrollo en loopback. |
| `api.jwt_issuer` | `API_JWT_ISSUER` | `""` | Restricción opcional del emisor aceptado en los tokens bearer. |
| `api.jwt_audience` | `API_JWT_AUDIENCE` | `""` | Restricción opcional de la audiencia aceptada en los tokens bearer. |
| `api.jwt_admin_subjects` | `API_JWT_ADMIN_SUBJECTS` | `[]` | Lista no vacía de sujetos JWT autorizados para administrar billeteras persistidas cuando se habilita el almacenamiento GCP. |

Para una dirección de escucha que no sea de loopback, Bursa se niega a iniciar si no encuentra los dos archivos TLS y exactamente una fuente de confianza bearer: `API_JWT_SECRET` o `API_JWKS_URL`. La configuración no debe incluir ambas fuentes. La URL `API_JWKS_URL` debe usar `https://` fuera de loopback.

La escucha de loopback permite el desarrollo mediante texto sin cifrar y puede omitir los archivos TLS y la fuente de confianza bearer. Cuando se configura TLS, la configuración debe incluir el certificado y la clave privada juntos. `api.jwt_issuer` y `api.jwt_audience` son restricciones opcionales que Bursa aplica cuando una fuente de confianza bearer está configurada.

Cuando la configuración del proyecto y el recurso de Google habilita el almacenamiento de billeteras GCP con autenticación, Bursa exige al menos un sujeto administrador no vacío en `api.jwt_admin_subjects`. Una lista ausente o vacía impide el inicio. Bursa protege las rutas `/api/wallet/list`, `/api/wallet/get`, `/api/wallet/update` y `/api/wallet/delete`: cada solicitud debe incluir un encabezado `Authorization: Bearer <JWT>` válido, y el sujeto del token debe coincidir con un sujeto de la lista de administradores. Consulta la [referencia de la API de Bursa en español](./010-api-reference) para ver los ejemplos detallados de solicitudes y respuestas.

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

Incluye `opcert` en `signer.keys[].allowed_requests` para autorizar solicitudes específicas de firma de certificados operativos. Bursa deniega estas solicitudes cuando la política de la clave no incluye `opcert`:

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

### Hook de política externo

Establece `signer.policy_hook_url` para habilitar una comprobación de política externa después de que la política estática apruebe una solicitud. La variable de entorno `SIGNER_POLICY_HOOK_URL` sustituye este ajuste. Usa `signer.policy_hook_timeout_ms` para configurar el tiempo de espera de la solicitud en milisegundos; `SIGNER_POLICY_HOOK_TIMEOUT_MS` lo sustituye. El valor `0` usa el valor predeterminado de cinco segundos. Bursa limita los valores configurados a un día.

Bursa envía el resumen de la transacción como una solicitud JSON `POST`. El resumen usa estos campos:

```json
{
  "type": "tx",
  "caller": "caller-subject",
  "key": "key-hash",
  "tx_id": "transaction-id",
  "fee": "1000000",
  "outputs": [
    {
      "address": "addr1example",
      "lovelace": "5000000",
      "has_assets": true
    }
  ],
  "certificates": ["stake_registration"],
  "voter_kinds": ["drep_key"],
  "drep_ids": ["hex-credential-id"]
}
```

El hook permite firmar únicamente cuando devuelve HTTP `200` con la respuesta JSON `{"allow": true}`. Los errores de transporte, los tiempos de espera, las respuestas distintas de `200`, el JSON ilegible o mal formado y cualquier valor de `allow` distinto de `true` deniegan la firma.

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
