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

## Validez de las entradas y errores

Cada argumento de datos debe contener datos Plutus finitos y válidos procedentes del estado del ledger. La ruta de argumentos de confianza no omite la validación de datos.

El evaluador rechaza los términos de script malformados o desconocidos que construye el código del llamador y devuelve un error en lugar de evaluarlos. El llamador debe corregir el término antes de volver a intentarlo después de ese error.
