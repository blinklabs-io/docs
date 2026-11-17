# Adder OpenAPI Goクライアント

## 概要

AdderのOpenAPI GoクライアントをGoプロジェクトに追加するには、次のモジュールパスを使用します。

## インポート

```go
import openapi "github.com/blinklabs-io/adder/openapi"
```

## 旧モジュールパスからの移行

以前のモジュールパス `github.com/blinklabs-io/cardano-node-api/openapi` を使用するプロジェクトは、`github.com/blinklabs-io/adder/openapi` へ移行します。`openapi/go.mod` では、モジュール名として `github.com/blinklabs-io/adder/openapi` を指定します。

## APIルートと動作

Adder API は、次のルートを提供します。`/ping` と `/healthcheck`、および `/v1` 配下のルートは、末尾のスラッシュを付けた形式にも対応します。

| 区分 | メソッドとパス | 動作 |
| --- | --- | --- |
| ルート | `GET /ping` | サーバーが到達可能な場合に `pong` を返します。 |
| ルート | `GET /healthcheck` | ヘルスチェック結果を JSON で返します。すべてのチェックが成功すると `200`、いずれかが失敗すると `503` を返します。 |
| ルート | `GET /events`（通常のSSE要求） | SSEでイベント配信を開始します。 |
| ルート | `GET /events`（WebSocket upgrade要求） | WebSocketへアップグレードします。アップグレードできない場合はWebSocketエラーを返し、SSEへ暗黙にfallbackしません。 |
| `/v1` | `POST /v1/fcm` | JSON の `fcmToken` を保存します。`fcmToken` が空の場合、または JSON が不正な場合は JSON 形式の `400` エラーを返します。 |
| `/v1` | `GET /v1/fcm/{token}` | 指定した FCM トークンを返します。トークンが存在しない場合は `404` を返します。 |
| `/v1` | `DELETE /v1/fcm/{token}` | 指定した FCM トークンを削除します。削除できた場合は `204`、トークンが存在しない場合は `404` を返します。 |
| `/v1` | `GET /v1/qrcode` | Adder Mobile の接続に使用する QR コードを含む HTML ページを返します。 |
| Swagger | `GET /swagger/` | Swagger UI を表示します。URL には末尾の `/` を付けます。 |

通常の要求ではSSEがストリームを維持できます。WebSocketへのアップグレードを要求するヘッダーを含む要求は、アップグレードに失敗するとWebSocketエラーで拒否され、SSEへ暗黙にfallbackしません。HTTP サーバーは書き込みタイムアウトを設定していないため、書き込みタイムアウトでストリームを終了しません。サーバーは構造化アクセスログを記録し、ハンドラーで panic が発生しても処理を回復して異常終了を防ぎます。

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
