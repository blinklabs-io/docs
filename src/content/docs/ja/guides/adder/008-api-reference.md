---
title: Adder APIリファレンス
description: Adder APIのルート、リクエスト、レスポンスに関するリファレンス。
---

# Adder APIリファレンス

## 概要

このリファレンスでは、Adder HTTP APIのルート、リクエスト、レスポンスを説明します。対象には、ルート直下のヘルスチェックとイベントストリーミング、`/v1`配下のプッシュ通知とQRコード、Swagger UIが含まれます。APIはデフォルトで`0.0.0.0:8080`で待ち受けます。

Adderのルートは2つのパス階層に分かれます。

- ルート直下の`/ping`、`/healthcheck`、`/events`は、疎通確認、ヘルスチェック、イベントストリーミングに使用します。
- `/v1`配下の`/v1/fcm`、`/v1/fcm/{token}`、`/v1/qrcode`は、プッシュ通知とQRコードの設定に使用します。

`/fcm`をルート直下のパスとして使用しないでください。FCMトークンの登録には`/v1/fcm`を使用します。

## ルートリファレンス

| メソッド | パス | 用途 | レスポンスとステータス |
| --- | --- | --- | --- |
| `GET` | `/ping` | APIサーバーの疎通を確認します。 | プレーンテキスト`pong`を`200 OK`で返します。 |
| `GET` | `/healthcheck` | 実行中のパイプラインと登録済みヘルスチェッカーの状態を確認します。 | 正常時は`{"failed":false}`のJSONを`200 OK`で返します。ヘルスチェッカーが異常を検出すると、`{"failed":true,"reason":"pipeline is not running"}`のJSONを`503 Service Unavailable`で返します。 |
| `GET` | `/events` | パイプラインイベントをリアルタイムでストリーミングします。 | クライアントが要求した場合はWebSocketにアップグレードし、それ以外ではServer-Sent Events（SSE）を使用します。接続成功時のステータスは`200 OK`です。 |
| `POST` | `/v1/fcm` | FCMトークンを保存します。 | JSONリクエストを受け取り、保存後に`201 Created`を返します。不正なJSONまたは`fcmToken`の欠落には`400 Bad Request`を返します。トークンストアを取得できない場合は`500 Internal Server Error`を返します。 |
| `GET` | `/v1/fcm/{token}` | トークン値で保存済みFCMトークンを取得します。 | トークンをJSONで`200 OK`として返します。トークンが存在しない場合は`404 Not Found`、トークンストアを取得できない場合は`500 Internal Server Error`を返します。 |
| `DELETE` | `/v1/fcm/{token}` | トークン値で保存済みFCMトークンを削除します。 | 削除後に`204 No Content`を返します。トークンが存在しない場合は`404 Not Found`、トークンストアを取得できない場合は`500 Internal Server Error`を返します。 |
| `GET` | `/v1/qrcode` | ローカルAPIのFCMエンドポイント用QRコード設定ページを生成します。 | インタラクティブなHTMLページを`200 OK`で返します。 |
| `GET` | `/swagger/` | Swagger UIを開きます。 | インタラクティブなAPIドキュメントを提供します。パス末尾のスラッシュが必要です。 |

## リクエストとレスポンス

### FCMトークンを登録する

`application/json`を指定して`POST /v1/fcm`にリクエストを送り、必須の`fcmToken`プロパティを含めます。

```json
{"fcmToken":"example-device-token"}
```

トークンを保存すると`201 Created`を返します。JSONをデコードできない場合、または`fcmToken`が空の場合は、`400 Bad Request`とエラーJSONを返します。

### FCMトークンを取得または削除する

保存済みトークンの値を`/v1/fcm/{token}`の`{token}`に指定します。

- `GET`は`{"fcmToken":"example-device-token"}`形式のJSONを`200 OK`で返します。
- `DELETE`はトークンを削除し、`204 No Content`を返します。
- トークンが存在しない場合、どちらのメソッドも`404 Not Found`を返します。

削除ルートも`/v1/fcm/{token}`です。ルート直下の`/fcm/{token}`は使用しません。

### イベントをストリーミングする

`GET /events`でイベントストリームを開きます。クライアントがWebSocketプロトコルを要求するとWebSocketにアップグレードし、それ以外ではSSEを使用します。このルートは次の任意クエリパラメーターを受け付けます。

- `types`: 対象にするイベント種別をカンマ区切りで指定します。例: `input.block`、`input.transaction`
- `replay`: 接続時にリングバッファ内の最近のイベントを再生するか指定します。デフォルトは`true`です。

SSEでは`text/event-stream`を使用します。WebSocket接続ではWebSocketセッションを使用します。

## パスと末尾スラッシュ

- `/ping`と`/healthcheck`は、記載したパスに加えて末尾に`/`を付けた形式も受け付けます。
- FCMとQRコードのルートは、記載したパスに加えて任意の末尾スラッシュを受け付けます。
- `/events`はルート直下に登録されており、ここでは`/events/`を別のパスとして定義しません。
- Swagger UIには`/swagger/`を使用し、末尾のスラッシュを省略しないでください。
