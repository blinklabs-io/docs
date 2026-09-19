---
title: Bursa設定リファレンス
description: BursaのPKCS#11署名バックエンドを設定します。
---

## 概要

このガイドでは、`PKCS#11`署名バックエンドの`signer.backends`設定を説明します。バックエンドは`PKCS#11`モジュールを使用し、秘密鍵をトークン内に保持して、トークンで`Ed25519`署名を生成します。

## 設定リファレンス

`signer.backends`の下にバックエンドエントリを追加し、`type`を`pkcs11`に設定します。以下のフィールドを使用します。

| 設定パス | 目的 | 検証 |
| --- | --- | --- |
| `signer.backends[].type` | 署名バックエンドを選択します。 | `pkcs11`を設定します。 |
| `signer.backends[].module` | `.so`ファイルを含む`PKCS#11`モジュールのパスを指定します。 | このフィールドを設定します。Bursaは空の値を拒否します。 |
| `signer.backends[].token_label` | ラベルでトークンまたはスロットを選択します。 | このフィールドまたは`slot`を設定します。少なくとも一方の選択フィールドが必要です。 |
| `signer.backends[].slot` | 明示的なスロットIDでスロットを選択します。 | このフィールドまたは`token_label`を設定します。少なくとも一方の選択フィールドが必要です。 |
| `signer.backends[].pin_env` | ユーザーPINを格納する環境変数の名前を指定します。 | このフィールドを設定し、指定した環境変数に空でない値を設定します。Bursaはプレーンテキスト設定からPINを読み取りません。 |
| `signer.backends[].keys[]` | トークンオブジェクトの許可リストを任意で定義します。 | 設定する場合は、すべてのエントリに`name`と`type`を指定します。 |
| `signer.backends[].keys[].name` | トークンオブジェクトの`CKA_LABEL`と照合します。 | 各`keys`エントリにこのフィールドを設定します。 |
| `signer.backends[].keys[].type` | 照合したトークンオブジェクトにCardano鍵タイプを割り当てます。 | 各`keys`エントリにこのフィールドを設定します。`payment`、`stake`、`drep`、`cc-hot`、`cc-cold`、`pool`、または`policy`を使用します。 |

## ビルド要件

`PKCS#11`バックエンドを含めるには、`CGO`を有効にし、`pkcs11`ビルドタグを指定してBursaをコンパイルします。このビルドタグなしで設定がこのバックエンドを選択すると、Bursaは即座に失敗し、次のエラーを返します。

```text
pkcs11 backend not compiled in (build with -tags pkcs11)
```

デフォルトビルドでは`PKCS#11`サポートを暗黙的に有効にしません。

## 署名の制約

`PKCS#11`バックエンドは秘密鍵をトークン内に保持し、トークンに`Ed25519`署名の生成を依頼します。`CIP-8`の`COSE`署名はこのバックエンドに対応していません。`PKCS#11`鍵を使用する`CIP-8`リクエストに対して、Bursaは`CodeUnsupported`を返します。

## トラブルシューティング

- Bursaが`module`が必要だと報告した場合は、`signer.backends[].module`に`PKCS#11`モジュールのパスを設定します。
- Bursaが`token_label`または`slot`が必要だと報告した場合は、トークン選択フィールドを少なくとも1つ指定します。
- Bursaが`pin_env`が必要、またはその環境変数が空だと報告した場合は、`signer.backends[].pin_env`に環境変数の名前を設定し、その変数を通じてユーザーPINを指定します。
- Bursaが無効な鍵タイプを報告した場合は、各`signer.backends[].keys[].type`に設定する値を設定リファレンスに記載されたサポート対象の値のいずれかに変更します。