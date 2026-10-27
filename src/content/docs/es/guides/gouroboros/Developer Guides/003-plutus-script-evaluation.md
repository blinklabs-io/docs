---
title: Evaluación de scripts Plutus
description: Comprende los argumentos de datos de EvaluateContext, los contextos grandes del ledger y la validación de entradas en gOuroboros.
---

## Descripción general

Esta página describe cómo `EvaluateContext` evalúa scripts Plutus V1 a V4 con datos del ledger, presupuestos de ejecución y contextos de evaluación.

## Formas de los argumentos de EvaluateContext

Cada método `EvaluateContext` recibe los datos del ledger del script junto con el presupuesto de ejecución y el contexto de evaluación. El método también acepta un `context.Context` de Go que puede detener la evaluación.

| Versión del script | Argumentos de datos | Forma del método |
| --- | --- | --- |
| Plutus V1 | `datum`, `redeemer`, `scriptContext` | `EvaluateContext(ctx, datum, redeemer, scriptContext, budget, evalContext)` |
| Plutus V2 | `datum`, `redeemer`, `scriptContext` | `EvaluateContext(ctx, datum, redeemer, scriptContext, budget, evalContext)` |
| Plutus V3 | `scriptContext` | `EvaluateContext(ctx, scriptContext, budget, evalContext)` |
| Plutus V4 | `scriptContext` | `EvaluateContext(ctx, scriptContext, budget, evalContext)` |

Plutus V1 y V2 aplican los argumentos `datum`, `redeemer` y `scriptContext` en ese orden. Plutus V3 y V4 reciben `scriptContext`; el contexto contiene los datos que requieren esas versiones del script.

El llamador proporciona `budget` y `evalContext` para cada versión. El evaluador aplica el `budget` que recibe, incluido un presupuesto de cero.

## Datos grandes de los contextos del ledger

`EvaluateContext` pasa los valores `datum`, `redeemer` y `scriptContext` del estado del ledger como argumentos de ejecución. El evaluador mantiene esos valores separados del término del programa UPLC, por lo que sus nodos de datos Plutus no aumentan el recuento estructural de nodos del programa UPLC.

Este comportamiento permite que el evaluador procese contextos con datums inline muy grandes sin que los propios datos del ledger provoquen un error por el límite de nodos estructurales. La cobertura de regresión de V3 incluye un contexto del ledger con más de `1,000,000` nodos de `PlutusData`.

El evaluador trata como argumentos de confianza únicamente los valores de datos finitos que recibe mediante los argumentos de `EvaluateContext`. El evaluador aún decodifica y valida el programa UPLC, y los límites estructurales siguen aplicándose a ese programa. Este comportamiento no hace ilimitados los datos del ledger ni elimina la aplicación del presupuesto de ejecución.

## Integración del evaluador

Las integraciones deben usar `RunScriptContext` cuando solo necesiten clasificar el resultado del script como `unit` o no `unit`. Esta ruta evalúa el script y comprueba el estado `unit` sin expandir ni descargar el resultado final. `RunContextWithTrustedDataArguments` sigue siendo apropiado cuando una integración necesita descargar el resultado completo, pero puede devolver `ErrCodeResultTooLarge` si la evaluación termina correctamente y el resultado supera los límites de descarga.

## Validez de las entradas y errores

Antes de pasar cada árbol de argumentos de confianza a `EvaluateContext`, el llamador debe validarlo. `EvaluateContext` reenvía esos árboles a `RunContextWithTrustedDataArguments`, cuya validación omite deliberadamente los árboles reenviados. Por ello, el llamador debe garantizar desde el origen que cada árbol sea finito, contenga datos Plutus válidos y sea acíclico.

Antes de pasar datums o redeemers decodificados al evaluador, el llamador debe aplicar `data.Normalize`. La normalización realiza una copia profunda de los datos y restablece las opciones de codificación CBOR a los valores predeterminados del paquete, para que los valores visibles para el script coincidan con la representación de referencia.

La decodificación predeterminada rechaza la etiqueta CBOR `1401` y las etiquetas `bignum` con una cabecera larga. El unmarshalling de `Integer` y `ByteString` también aplica una validación más estricta. El evaluador rechaza los términos de script malformados o desconocidos que construye el código del llamador y devuelve un error en lugar de evaluarlos. El llamador debe corregir el término antes de volver a intentarlo después de ese error.

## Errores de presupuesto

En `BudgetError`, `Requested` representa el cargo que provocó el agotamiento del presupuesto y `Available` representa el presupuesto restante inmediatamente antes de ese cargo. El evaluador descuenta el cargo antes de devolver el error, por lo que el presupuesto posterior al fallo refleja `Available - Requested`. A diferencia del agotamiento del presupuesto, `ErrCodeResultTooLarge` indica un error al descargar el resultado.


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
