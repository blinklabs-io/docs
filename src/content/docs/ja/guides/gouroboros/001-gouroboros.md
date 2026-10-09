---
title: gOuroboros
description: gOuroborosの紹介。
---

![gOuroboros-logo](/gOuroboros-logo.png)

gOuroborosは、Cardanoブロックチェーンと連携するGoアプリケーションを構築するための強力で汎用性の高いフレームワークです。Cardanoノードと通信したり、ブロックやトランザクションを管理するGoアプリケーションを素早く簡単に作成できます。ローカルまたはリモートノードからブロックチェーンを同期したり、ローカルノードにプロトコルパラメータやアドレス別のUTxOをクエリしたりすることが可能です。

## API互換性と入力検証

### Byron API

`common.VerifyConfig` から `EnableByronSscProofHashValidation` と `EnableByronPayloadValidation` を削除しました。これらを参照するコードはコンパイルできません。

`consensus/byron.ValidateBodyHash` と `(*ledger/byron.ByronMainBlock).ValidateBodyProof` は `VerifyConfig` 引数を受け取りません。以前の引数を渡す呼び出しを削除してください。Byron の証明とペイロードの認証は、デコード時と証明検証時にデフォルトで実行します。

構造だけを解析する場合は `common.VerifyConfig{SkipBodyHashValidation: true}` を指定してください。この設定は認証を省略した parse-only のデコードを行うため、デコードしたデータを信頼する前に、呼び出し側で明示的な検証を実行する必要があります。

### CBOR と Shelley のトランザクション入力

CBOR デコード用の公開コンストラクタは、期待するトップレベルの CBOR 項目の後にデータが続く入力をエラーとして返します。入力を部分的に読み取った状態で成功扱いにはしません。

Shelley のトランザクション入力では、次の不正な値をエラーとして返します。

- トランザクションハッシュが `32` バイト以外の場合
- 出力インデックスが符号なし整数でない場合、または `0` から `65535` の範囲外の場合
- ハッシュや出力インデックスの後に CBOR データが続く場合

外部入力から `NewShelleyTransactionInput` を呼び出す場合は、戻り値の `error` を処理してから値を使用してください。

***

gOuroborosのコードドキュメントの詳細はこちらをご覧ください: <a href="https://pkg.go.dev/github.com/blinklabs-io/gouroboros" target="_blank">https://pkg.go.dev/github.com/blinklabs-io/gouroboros</a>.
