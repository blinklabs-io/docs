---
title: gOuroboros
description: Introduccion a gOuroboros.
---

![gOuroboros-logo](/gOuroboros-logo.png)

gOuroboros es un framework potente y versatil para construir aplicaciones Go que interactuan con la blockchain de Cardano. Escribe aplicaciones Go de forma rapida y sencilla que se comuniquen con nodos de Cardano o gestionen bloques/transacciones. Sincroniza la blockchain desde un nodo local o remoto, consulta un nodo local para obtener parametros de protocolo o UTxOs por direccion, y mucho mas.

## Compatibilidad de la API de Byron

La API de Byron ya no incluye los campos `EnableByronSscProofHashValidation` ni `EnableByronPayloadValidation` en `common.VerifyConfig`. Además, `consensus/byron.ValidateBodyHash` y `(*ledger/byron.ByronMainBlock).ValidateBodyProof` ya no aceptan un argumento `VerifyConfig`. Las llamadas que usen esos campos o las firmas antiguas ya no compilan; el código debe reemplazarlas.

La decodificación de Byron autentica de forma predeterminada. Verifica los hashes de las pruebas SSC y las firmas de los payloads de delegación y actualización; si una comprobación falla, devuelve un error. El código que solo necesite análisis estructural puede usar:

```go
common.VerifyConfig{SkipBodyHashValidation: true}
```

Esta opción omite la validación de las pruebas del cuerpo durante la decodificación. La aplicación debe ejecutar una validación explícita antes de confiar en los datos decodificados.

## Validación estricta de CBOR y entradas Shelley

Los constructores públicos de CBOR consumen un único elemento completo. Si la entrada contiene datos CBOR adicionales al final, la decodificación devuelve un error en lugar de aceptar parcialmente la entrada.

Las entradas de transacción Shelley también deben cumplir estas condiciones:

- El hash debe tener exactamente 32 bytes.
- El índice de salida debe ser un entero sin signo entre `0` y `65535`.
- Una estructura de entrada mal formada, datos adicionales después del hash o del índice, y argumentos de constructor no válidos producen un error.

`NewShelleyTransactionInput` devuelve un error cuando el hash no tiene un formato hexadecimal válido o no tiene 32 bytes. El código que llame a este constructor debe tratar el error antes de utilizar la entrada.

***

Aprende mas sobre la documentacion del codigo de gOuroboros aqui: <a href="https://pkg.go.dev/github.com/blinklabs-io/gouroboros" target="_blank">https://pkg.go.dev/github.com/blinklabs-io/gouroboros</a>.
