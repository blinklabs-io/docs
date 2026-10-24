---
title: Plutus スクリプトの評価
description: gOuroboros の EvaluateContext のデータ引数、大きな台帳コンテキスト、入力検証を説明します。
---

## 概要

このページでは、`EvaluateContext` が、台帳データ、実行予算、評価コンテキストを用いて Plutus V1 から V4 までのスクリプトを評価する方法を説明します。

## EvaluateContext の引数の形

各 `EvaluateContext` メソッドは、スクリプトの台帳データと実行予算、評価コンテキストを受け取ります。評価を中止できる Go の `context.Context` も受け取ります。

| スクリプトのバージョン | データ引数 | メソッドの形 |
| --- | --- | --- |
| Plutus V1 | `datum`, `redeemer`, `scriptContext` | `EvaluateContext(ctx, datum, redeemer, scriptContext, budget, evalContext)` |
| Plutus V2 | `datum`, `redeemer`, `scriptContext` | `EvaluateContext(ctx, datum, redeemer, scriptContext, budget, evalContext)` |
| Plutus V3 | `scriptContext` | `EvaluateContext(ctx, scriptContext, budget, evalContext)` |
| Plutus V4 | `scriptContext` | `EvaluateContext(ctx, scriptContext, budget, evalContext)` |

Plutus V1 と V2 は、`datum`、`redeemer`、`scriptContext` の順で引数を適用します。Plutus V3 と V4 は `scriptContext` を受け取り、そのコンテキストに各バージョンが必要とするデータを含めます。

すべてのバージョンで、呼び出し元は実行の `budget` と `evalContext` を指定します。評価器は、予算が 0 の場合も含め、指定された予算を強制します。

## 台帳コンテキストの大きなデータ

`EvaluateContext` は、台帳状態の datum、redeemer、スクリプトコンテキストを実行引数として渡します。評価器はこれらを UPLC プログラム項とは別に保持するため、データに含まれる Plutus データノードは UPLC プログラムの構造ノード数を増やしません。

この動作により、非常に大きなインライン datum を持つコンテキストでも、台帳データ自体が構造ノード数の上限超過を引き起こすことなく処理できます。V3 の回帰テストには、1,000,000 個を超える `PlutusData` ノードを持つ台帳コンテキストが含まれます。

信頼された引数として扱う対象は、`EvaluateContext` の引数で渡す有限のデータ値のみです。評価器は引き続き UPLC プログラムをデコードして検証し、そのプログラムには構造上の制限が適用されます。この動作は、台帳データを無制限にしたり、実行予算の強制を解除したりするものではありません。

## 入力の妥当性とエラー

呼び出し元は、信頼するすべての引数ツリーを、`EvaluateContext` に渡す前にその生成元で検証する必要があります。`EvaluateContext` はこれらを `RunContextWithTrustedDataArguments` に転送し、この関数の検証では、転送されたツリーを意図的に検証しません。各ツリーが有限で、有効な Plutus データを含み、循環がないことを呼び出し元が保証してください。

評価器は、呼び出し元のコードが構築した不正または未知のスクリプト項を評価せず、エラーを返します。このエラーの後に再試行する場合は、指定した項を修正してください。
