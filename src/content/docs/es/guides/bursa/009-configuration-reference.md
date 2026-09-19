---
title: Referencia de configuración de Bursa
description: Configura los ajustes del firmante, KES-agent y PKCS#11 de Bursa.
---

## Descripción general

Esta guía describe la configuración del firmante y KES-agent de Bursa, incluida la configuración de `signer.backends` para el backend de firma `PKCS#11`.

## Variable de entorno de la billetera

| Variable de entorno | Valor predeterminado | Comportamiento |
| --- | --- | --- |
| `BURSA_CONNECTOR` | `false` | Activa el backend del conector de dApps. |

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

Compila Bursa con `CGO` habilitado y la etiqueta de compilación `pkcs11` para incluir el backend `PKCS#11`. Sin esa etiqueta, Bursa falla de inmediato cuando una configuración selecciona este backend y devuelve:

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

## Guardia de periodo del KES-agent

El KES-agent requiere una ruta duradera para su guardia de periodo monotónico:

| Ruta de configuración | Variable de entorno | Requisito |
| --- | --- | --- |
| `kes_agent.guard_file` | `KESAGENT_GUARD_FILE` | Establece una ruta de archivo duradera y no vacía que el demonio KES-agent pueda abrir. |

Bursa rechaza el inicio del KES-agent cuando `kes_agent.guard_file` está vacío. La guardia de periodo conserva el periodo KES más alto que el agente autoriza, restaura ese periodo después de un reinicio y rechaza un retroceso de periodo. El demonio no admite una alternativa en memoria para esta guardia.

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
