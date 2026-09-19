---
title: Referencia de API de Bursa
description: Consulta los contratos HTTP de firma de certificados operativos y de administración de wallets persistentes de Bursa.
---

## Descripción general

Esta referencia describe los contratos HTTP de `POST /v1/sign` para firmar certificados operativos y las operaciones de wallets persistentes en GCP. Incluye los cuerpos JSON, las respuestas correctas y las condiciones de autorización que afectan a cada solicitud.

## Firma de un certificado operativo

### Solicitud

Envía una solicitud `POST /v1/sign` con `type` igual a `opcert`:

```json
{
  "type": "opcert",
  "kes_vkey": "<64 caracteres hexadecimales>",
  "issue_counter": 42,
  "kes_period": 123,
  "key": "<hash de la clave fría>"
}
```

El cuerpo requiere estos campos:

| Campo | Tipo | Contrato |
| --- | --- | --- |
| `type` | cadena | Usa el valor `opcert`. |
| `kes_vkey` | cadena | Contiene en hexadecimal la clave de verificación KES de 32 bytes, es decir, 64 caracteres hexadecimales. |
| `issue_counter` | entero | Indica el contador de emisión del certificado operativo. |
| `kes_period` | entero | Indica el periodo KES del certificado operativo. |
| `key` | cadena | Identifica la clave fría que producirá la firma. |

### Respuesta correcta

Una solicitud autorizada devuelve HTTP `200` con esta estructura:

```json
{
  "audit_id": "<identificador de auditoría>",
  "signature": "<firma hexadecimal>",
  "cold_vkey": "<clave de verificación fría hexadecimal>",
  "key": "<hash de la clave fría>"
}
```

`signature` contiene en hexadecimal la firma de 64 bytes de la clave fría. `cold_vkey` contiene en hexadecimal la clave de verificación fría de 32 bytes. `audit_id` identifica la solicitud y `key` identifica la clave usada para firmar.

El consumidor combina `kes_vkey`, `issue_counter`, `kes_period` y `signature` con `cold_vkey` para formar el sobre del certificado operativo. Bursa conserva la clave privada fría en su servicio de custodia y no la incluye en la respuesta.

### Condiciones de denegación

Bursa rechaza la solicitud cuando se cumple cualquiera de estas condiciones:

- La clave fría no supera la ACL del llamador.
- La política de la clave no incluye `opcert` en `allowed_requests`.
- La clave fría no corresponde a una clave fría de un pool de stake.

Configura `signer.keys[].allowed_requests` con `opcert` y establece la ACL correspondiente en la [referencia de configuración de Bursa](./009-configuration-reference). Esa referencia también describe las políticas del firmante y sus requisitos de configuración.

## Wallets persistentes en GCP

Bursa registra estas operaciones cuando la configuración activa el almacenamiento de wallets en GCP:

| Operación | Método y ruta | Respuesta correcta |
| --- | --- | --- |
| Listar wallets | `GET /api/wallet/list` | Una lista JSON de nombres. |
| Obtener una wallet | `POST /api/wallet/get` | Los detalles JSON de la wallet. |
| Actualizar una wallet | `POST /api/wallet/update` | La cadena JSON `"OK"`. |
| Eliminar una wallet | `POST /api/wallet/delete` | La cadena JSON `"OK"`. |

### Autenticación y autorización

Cada operación requiere el encabezado siguiente:

```http
Authorization: Bearer <JWT>
```

El `subject` del JWT debe aparecer en `api.jwt_admin_subjects`. La variable de entorno equivalente es `API_JWT_ADMIN_SUBJECTS`. Bursa devuelve estos resultados observables:

| Situación | Respuesta |
| --- | --- |
| Falta la autenticación o el JWT no es válido | HTTP `401 Unauthorized`. |
| El JWT es válido, pero su `subject` no aparece en la lista de administradores | HTTP `403 Forbidden`. |

Configura una fuente de confianza JWT y al menos un sujeto administrador antes de habilitar el almacenamiento GCP. Consulta la [referencia de configuración de Bursa](./009-configuration-reference) para los requisitos de inicio, las variables de entorno y las restricciones de exposición de la API.

### Esquemas de solicitud heredados

Las solicitudes de `get` y `delete` solo aceptan `name`:

```json
{
  "name": "wallet-name"
}
```

La solicitud de `update` acepta `name` y `description`:

```json
{
  "name": "wallet-name",
  "description": "Descripción actualizada"
}
```

Estas tres solicitudes heredadas no incluyen una propiedad `password`. La eliminación de `password` se limita a `get`, `update` y `delete`; las solicitudes de creación y restauración conservan sus campos `password`.

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>