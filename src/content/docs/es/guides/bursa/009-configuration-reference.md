---
title: Referencia de configuración de Bursa
description: Configura el backend de firma PKCS#11 de Bursa.
---

## Descripción general

Esta guía describe la configuración de `signer.backends` para el backend de firma `PKCS#11`.

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

## Solución de problemas

- Si Bursa informa que `module` es obligatorio, establece `signer.backends[].module` en la ruta del módulo `PKCS#11`.
- Si Bursa informa que `token_label` o `slot` es obligatorio, proporciona al menos un campo de selección del token.
- Si Bursa informa que `pin_env` es obligatorio o que su variable de entorno está vacía, establece `signer.backends[].pin_env` con el nombre de una variable de entorno y proporciona el PIN de usuario mediante esa variable.
- Si Bursa informa de un tipo de clave no válido, establece cada valor de `signer.backends[].keys[].type` en uno de los valores admitidos en la referencia de configuración.