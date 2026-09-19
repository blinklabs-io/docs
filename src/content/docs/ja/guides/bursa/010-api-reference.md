---
title: Bursa APIリファレンス
description: Bursaの運用証明書署名とGCP永続ウォレットAPIのHTTP契約を参照します。
---

## 概要

このリファレンスでは、運用証明書に署名する`POST /v1/sign`リクエストと、GCPに保存したlegacy walletを操作するAPIの認証およびリクエスト形式を説明します。APIの起動に必要な認証元、管理者subject、署名ポリシーは[設定リファレンス](./009-configuration-reference)を参照してください。

## 運用証明書への署名

`POST /v1/sign`に`type`として`opcert`を指定すると、指定したKES公開検証鍵、発行カウンター、KES期間に対応する運用証明書の署名素材を取得できます。リクエストには`Content-Type: application/json`を指定します。

### リクエスト

```http
POST /v1/sign
Content-Type: application/json
```

```json
{
  "type": "opcert",
  "kes_vkey": "0000000000000000000000000000000000000000000000000000000000000000",
  "issue_counter": 42,
  "kes_period": 123,
  "key": "00000000000000000000000000000000000000000000000000000000"
}
```

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `type` | `string` | `opcert`を指定します。 |
| `kes_vkey` | `string` | 32バイトのKES検証鍵を表す16進数文字列です。 |
| `issue_counter` | `number` | 運用証明書の発行カウンターです。 |
| `kes_period` | `number` | KES期間です。 |
| `key` | `string` | 署名対象のプールコールドキーを識別します。 |

`kes_vkey`はデコード可能な16進数で、32バイトの値を指定します。形式が不正な場合、APIはHTTP `400`を返します。

### レスポンス

成功時、APIはHTTP `200`と次のJSONを返します。

```json
{
  "audit_id": "8f8c2c6b-1a8a-4d1e-9e18-000000000000",
  "signature": "0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
  "cold_vkey": "0000000000000000000000000000000000000000000000000000000000000000",
  "key": "00000000000000000000000000000000000000000000000000000000"
}
```

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `audit_id` | `string` | リクエストを監査ログと対応付ける識別子です。 |
| `signature` | `string` | コールドキーによる64バイトの署名を表す16進数文字列です。 |
| `cold_vkey` | `string` | 32バイトのコールド検証鍵を表す16進数文字列です。 |
| `key` | `string` | 使用したコールドキーの識別子です。 |

`signature`と`cold_vkey`は、リクエストの`kes_vkey`、`issue_counter`、`kes_period`と組み合わせて運用証明書のエンベロープを構成します。署名処理はコールド秘密鍵をバックエンドの外へ返さず、レスポンスには署名素材だけを含めます。

### 署名が拒否される条件

APIは次の条件をすべて満たす場合だけ署名を許可します。

- 呼び出し元ACLが`key`で指定したコールドキーを許可していること。ACLが許可しない場合、APIはリクエストを拒否してHTTP `403`を返します。
- 対象キーのポリシーに`allowed_requests`の値として`opcert`が含まれていること。ポリシーがない場合、または`opcert`がない場合、APIはデフォルトで拒否します。ポリシーの設定は[署名者の運用証明書ポリシー](./009-configuration-reference#署名者の運用証明書ポリシー)を参照してください。
- `key`がステークプールのコールドキーであること。APIはプールに属さないコールドキーを拒否します。

## GCP永続ウォレットAPIの認証

次のルートは、GCPウォレットストレージに保存したlegacy walletを操作します。

- `GET /api/wallet/list`
- `POST /api/wallet/get`
- `POST /api/wallet/update`
- `POST /api/wallet/delete`

GCPウォレットストレージを有効にした場合、各リクエストに次のヘッダーを指定します。

```http
Authorization: Bearer <JWT>
```

JWTのsubjectは、`api.jwt_admin_subjects`または`API_JWT_ADMIN_SUBJECTS`に登録した管理者subjectと一致する必要があります。GCPウォレットストレージを有効にするためのJWT認証元と管理者subjectの起動要件は[APIのTLSとBearer認証](./009-configuration-reference#apiのtlsとbearer認証)を参照してください。

認証および認可の結果は次のとおりです。

| 条件 | HTTPステータス |
| --- | --- |
| `Authorization`ヘッダーがない、またはJWTが無効 | `401 Unauthorized` |
| JWTは有効だが、subjectが管理者リストにない | `403 Forbidden` |

## legacy walletのリクエスト形式

この節のスキーマは、GCPに保存したlegacy walletの取得、更新、削除にだけ適用します。

### `POST /api/wallet/get`

```json
{
  "name": "wallet-name"
}
```

`name`は取得対象のウォレット名です。成功時、APIはウォレット情報をJSONで返します。

### `POST /api/wallet/update`

```json
{
  "name": "wallet-name",
  "description": "運用ウォレット"
}
```

`name`は更新対象のウォレット名、`description`は保存する説明です。このリクエストには`password`を指定しません。

### `POST /api/wallet/delete`

```json
{
  "name": "wallet-name"
}
```

`name`は削除対象のウォレット名です。このリクエストには`password`を指定しません。`password`の削除はlegacy walletのget、update、deleteリクエストだけを対象とし、`/api/wallet/create`および`/api/wallet/restore`のパスワード項目には適用しません。
`password`の変更範囲はlegacy walletのget、update、deleteリクエストだけです。APIはこれら3つのリクエストで`password`プロパティを受け付けません。`/api/wallet/create`および`/api/wallet/restore`のパスワード項目にはこの変更を適用しません。

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>