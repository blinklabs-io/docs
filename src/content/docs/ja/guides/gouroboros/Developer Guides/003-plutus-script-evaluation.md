---
title: Plutusスクリプトの評価
description: Plutus V1からV4スクリプトを評価するEvaluateContext APIのリファレンス。
---

## 概要

このページでは、`PlutusV1Script`、`PlutusV2Script`、`PlutusV3Script`、`PlutusV4Script` の `EvaluateContext` を使用してPlutusスクリプトを評価する方法を説明します。各メソッドは、使用した実行予算を `ExUnits` として返します。`ctx` がキャンセルされると、評価を停止します。

評価対象のプログラムと台帳データには、次の規則を適用します。

- `PlutusV1Script` と `PlutusV2Script` は、`datum`、`redeemer`、`scriptContext` をこの順序で受け取ります。
- `PlutusV3Script` と `PlutusV4Script` は、`scriptContext` のみを受け取ります。redeemerは `scriptContext` に含めます。
- 台帳から取得したデータ引数は、信頼された実行引数としてプログラムに渡します。データをUPLCプログラムのtermに埋め込まないため、大きな台帳データはUPLCプログラム自体の構造ノード数に加算されません。

## APIシグネチャ

### Plutus V1

```go
func (s PlutusV1Script) EvaluateContext(
	ctx context.Context,
	datum data.PlutusData,
	redeemer data.PlutusData,
	scriptContext data.PlutusData,
	budget ExUnits,
	evalContext *cek.EvalContext,
) (ExUnits, error)
```

`PlutusV1Script` は、`datum`、`redeemer`、`scriptContext` をこの順序でスクリプトに渡します。

### Plutus V2

```go
func (s PlutusV2Script) EvaluateContext(
	ctx context.Context,
	datum data.PlutusData,
	redeemer data.PlutusData,
	scriptContext data.PlutusData,
	budget ExUnits,
	evalContext *cek.EvalContext,
) (ExUnits, error)
```

`PlutusV2Script` は、`datum`、`redeemer`、`scriptContext` をこの順序でスクリプトに渡します。

### Plutus V3

```go
func (s PlutusV3Script) EvaluateContext(
	ctx context.Context,
	scriptContext data.PlutusData,
	budget ExUnits,
	evalContext *cek.EvalContext,
) (ExUnits, error)
```

`PlutusV3Script` は `scriptContext` をスクリプトに渡します。datumとredeemerを別の引数として渡さないでください。

### Plutus V4

```go
func (s PlutusV4Script) EvaluateContext(
	ctx context.Context,
	scriptContext data.PlutusData,
	budget ExUnits,
	evalContext *cek.EvalContext,
) (ExUnits, error)
```

`PlutusV4Script` は `scriptContext` をスクリプトに渡します。datumとredeemerを別の引数として渡さないでください。

## 台帳データの要件

`datum`、`redeemer`、`scriptContext` に渡す値は、次の条件を満たす必要があります。

- 値は有限であること。
- 値は有効な `data.PlutusData` であること。
- 値は台帳から取得したデータ、または台帳状態から構築したデータであること。

この要件は、信頼された実行引数としてデータを渡す場合にも適用します。信頼された実行引数は、任意の呼び出し側データに対する検証を無効にする機能ではありません。

呼び出し側が構築した不正なtermまたは未知のtermは、評価せずにエラーとして返します。特定のエラー名やエラー文字列に依存せず、エラーを処理してください。

## プログラム検証と実行予算

UPLCプログラムの検証は引き続き実行します。台帳データをUPLCプログラムの構造から分離して渡しても、プログラムの検証やデータの要件を回避することはできません。

`budget` にはスクリプトの実行予算を指定します。評価は指定された予算をそのまま適用し、ゼロの予算も含めて実行量を `ExUnits` として返します。プログラムの検証に失敗した場合、実行時にエラーが発生した場合、または `ctx` がキャンセルされた場合、メソッドはエラーを返します。

### 大きなV3コンテキスト

`PlutusV3Script` は、`scriptContext` に1,000,000を超える `PlutusData` ノードが含まれる場合でも、その台帳由来のコンテキストノードをUPLCプログラム自体の構造ノード数に加算せずに評価できます。この動作は、大きな台帳コンテキストが原因でプログラムの構造ノード数の制限に達する問題を防ぎます。

この動作によって、UPLCプログラムの検証、実行予算、またはPlutusデータの有限性と有効性に関する要件がなくなるわけではありません。

## 戻り値

`EvaluateContext` は `(ExUnits, error)` を返します。

- 成功した場合、`ExUnits` に評価で使用したメモリ量とステップ数を返し、`error` は `nil` になります。
- プログラムのデコードまたは検証、入力データの処理、スクリプトの実行、コンテキストのキャンセルで問題が発生した場合、`error` にエラーを返します。
- 実行開始後にエラーが発生した場合、`ExUnits` にはエラーが返るまでに使用した実行量が含まれることがあります。