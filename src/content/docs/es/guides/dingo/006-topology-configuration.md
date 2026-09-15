---
title: Validación de la configuración de topología
description: Reglas de validación para localRoots, publicRoots y bootstrapPeers en topology.json de Dingo.
---

# Validación de la configuración de topología

Esta referencia describe las reglas que Dingo aplica al cargar `topology.json` para las colecciones `localRoots`, `publicRoots` y `bootstrapPeers`. Dingo rechaza la configuración mientras la carga cuando algún valor incumple estas reglas.

## Colecciones validadas

Dingo valida estas rutas JSON:

- `localRoots[*].accessPoints[*]`
- `publicRoots[*].accessPoints[*]`
- `bootstrapPeers[*]`

Los errores de validación identifican la colección y los índices de los elementos afectados. Por ejemplo, un error puede señalar `localRoots[0].accessPoints[1]` o `bootstrapPeers[0]`.

## Reglas de los puntos de acceso

Cada elemento de las rutas validadas debe cumplir estas condiciones:

- `address` no puede estar vacío. Dingo trata como vacío cualquier valor que solo contiene espacios en blanco.
- `port` debe estar dentro del rango TCP inclusivo de `1` a `65535`.

Dingo aplica estas reglas a cada elemento de `localRoots[*].accessPoints[*]`, `publicRoots[*].accessPoints[*]` y `bootstrapPeers[*]`.

## Reglas de valencia para las raíces

Dingo aplica las reglas de valencia por separado a cada elemento de `localRoots` y `publicRoots`:

- Cuando `warmValency` es distinto de `0`, debe ser menor o igual que `valency`: `warmValency <= valency`.
- Cuando `accessPoints` contiene al menos un elemento, `valency` debe ser menor o igual que el número de puntos de acceso: `valency <= len(accessPoints)`.
- Una lista `accessPoints` vacía es válida. Cuando la lista está vacía, Dingo omite la comparación entre `valency` y el número de puntos de acceso, pero mantiene la regla `warmValency <= valency` cuando `warmValency` es distinto de `0`.

`bootstrapPeers` solo usa las reglas de los puntos de acceso. Esta colección no usa las reglas `warmValency` ni `valency`.

---
<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
