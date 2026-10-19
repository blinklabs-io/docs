---
title: Plutusスクリプトの評価
description: Plutus V1からV4スクリプトを評価するEvaluateContext APIのリファレンス。
---

## 概要

このページでは、`PlutusV1Script`、`PlutusV2Script`、`PlutusV3Script`、`PlutusV4Script` の `EvaluateContext` を使用してPlutusスクリプトを評価する方法を説明します。各メソッドは、使用した実行予算を `ExUnits` として返します。`ctx` がキャンセルされると、評価を停止します。

`EvaluateContext` は、台帳から取得したデータ引数を信頼された実行引数としてプログラムに渡し、データをUPLCプログラムのtermに埋め込みません。そのため、大きな台帳データをUPLCプログラム自体の構造ノード数に加算しません。

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

`PlutusV3Script` は `scriptContext` をスクリプトに渡します。`redeemer` は `scriptContext` に含め、`datum` と `redeemer` を別の引数として渡しません。

### Plutus V4

```go
func (s PlutusV4Script) EvaluateContext(
	ctx context.Context,
	scriptContext data.PlutusData,
	budget ExUnits,
	evalContext *cek.EvalContext,
) (ExUnits, error)
```

`PlutusV4Script` は `scriptContext` をスクリプトに渡します。`redeemer` は `scriptContext` に含め、`datum` と `redeemer` を別の引数として渡しません。

## 台帳データの扱いと要件

`datum`、`redeemer`、`scriptContext` に渡す値は、次の条件を満たす必要があります。

- 値は有限であること。
- 値は有効な `data.PlutusData` であること。
- 値は台帳から取得したデータ、または台帳状態から構築したデータであること。

呼び出し側は、信頼された実行引数として渡すすべてのデータツリーを `EvaluateContext` に渡す前に検証する必要があります。`EvaluateContext` はそれらのツリーを `RunContextWithTrustedDataArguments` に転送し、この処理の検証では転送されたツリーを意図的に検証しません。そのため、呼び出し側はデータの生成元で、各ツリーが有限で、有効な `data.PlutusData` であり、非循環であることを確認する必要があります。

呼び出し側が構築した不正なtermまたは未知のtermは、評価を開始せずにエラーを返します。エラー処理では、特定のエラー名やエラー文字列に依存しないでください。

## プログラム検証と実行予算

UPLCプログラムは引き続き検証します。台帳データをUPLCプログラムの構造から分離して渡しても、プログラムの検証やデータの要件を回避できません。

`budget` にはスクリプトの実行予算を指定します。評価は指定された予算をそのまま適用し、ゼロの予算も含めて実行量を `ExUnits` として返します。プログラムの検証に失敗した場合、実行時にエラーが発生した場合、または `ctx` がキャンセルされた場合、メソッドはエラーを返します。

### 大きなV3コンテキスト

`PlutusV3Script` は、`scriptContext` に1,000,000を超える `PlutusData` ノードが含まれる場合でも、その台帳由来のコンテキストノードをUPLCプログラム自体の構造ノード数に加算せずに評価できます。この動作は、大きな台帳コンテキストが原因でプログラムの構造ノード数の制限に達する問題を防ぎます。

この動作によって、UPLCプログラムの検証、実行予算、またはPlutusデータの有限性と有効性に関する要件がなくなるわけではありません。

## 戻り値

`EvaluateContext` は `(ExUnits, error)` を返します。

- 成功した場合、`ExUnits` に評価で使用したメモリ量とステップ数を返し、`error` は `nil` になります。
- プログラムのデコードまたは検証、入力データの処理、スクリプトの実行、コンテキストのキャンセルで問題が発生した場合、`error` にエラーを返します。
- 実行開始後にエラーが発生した場合、`ExUnits` にはエラーが返るまでに使用した実行量が含まれることがあります。

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
