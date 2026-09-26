---
title: Adder APIリファレンス
description: Adder APIのルート、リクエスト、レスポンスに関するリファレンス。
---

# Adder APIリファレンス

## 概要

このリファレンスは、Adder HTTP APIのルート、リクエスト、レスポンスを説明します。対象は、ルート直下のヘルスチェックとイベントストリーミング、`/v1`配下のプッシュ通知とQRコード、Swagger UIです。APIはデフォルトで`0.0.0.0:8080`で待ち受けます。

Adderのルートは2つのパス階層に分かれます。

- ルート直下の`/ping`、`/healthcheck`、`/events`で、疎通確認、ヘルスチェック、イベントストリーミングを実行します。
- `/v1`配下の`/v1/fcm`、`/v1/fcm/{token}`、`/v1/qrcode`で、プッシュ通知とQRコードを設定します。

`/fcm`をルート直下のパスとして使用しないでください。FCMトークンの登録には`/v1/fcm`を使用します。

## ルートリファレンス

| メソッド | パス | 用途 | レスポンスとステータス |
| --- | --- | --- | --- |
| `GET` | `/ping` | APIサーバーの疎通を確認します。 | プレーンテキスト`pong`を`200 OK`で返します。 |
| `GET` | `/healthcheck` | 実行中のパイプラインと登録済みヘルスチェッカーの状態を確認します。 | 正常時は`{"failed":false}`のJSONを`200 OK`で返します。ヘルスチェッカーが異常を検出すると、`{"failed":true,"reason":"pipeline is not running"}`のJSONを`503 Service Unavailable`で返します。 |
| `GET` | `/events` | パイプラインイベントをリアルタイムでストリーミングします。 | サーバーはクライアントの要求に応じてWebSocketにアップグレードし、それ以外ではServer-Sent Events（SSE）でイベントを配信します。接続成功時のステータスは`200 OK`です。 |
| `POST` | `/v1/fcm` | FCMトークンを保存します。 | JSONリクエストを受け取り、保存後に`201 Created`を返します。不正なJSON、`fcmToken`の欠落、または空の`fcmToken`には`400 Bad Request`を返します。トークンストアを取得できない場合は`500 Internal Server Error`を返します。 |
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

トークンを保存すると`201 Created`を返します。JSONをデコードできない場合、`fcmToken`がない場合、または`fcmToken`が空の場合は、`400 Bad Request`とエラーJSONを返します。

### FCMトークンを取得または削除する

保存済みトークンの値を、`/v1/fcm/{token}`の`{token}`に指定します。

- `GET`は`{"fcmToken":"example-device-token"}`形式のJSONを`200 OK`で返します。
- `DELETE`はトークンを削除し、`204 No Content`を返します。
- トークンが存在しない場合、どちらのメソッドも`404 Not Found`を返します。

削除にも`/v1/fcm/{token}`を使用します。ルート直下の`/fcm/{token}`は使用しません。

### イベントをストリーミングする

`GET /events`でイベントストリームを開きます。サーバーは WebSocket 接続を要求したクライアントには WebSocket 接続を確立します。それ以外のクライアントには SSE ストリームを返します。ルートは `/events` です。

各イベントは次の基本フィールドを持つ JSON オブジェクトです。

| フィールド | 説明 |
| --- | --- |
| `type` | イベント種別 |
| `timestamp` | イベントのタイムスタンプ |
| `context` | イベントに関連するコンテキスト |
| `payload` | イベントのデータ |

SSE クライアントは `data` フィールドからイベントを読み取ります。WebSocket クライアントはテキストメッセージからイベントを読み取ります。

このルートは次の任意クエリーパラメーターを受け付けます。

- `types`: 対象にするイベント種別をカンマ区切りで指定します。`types` を省略すると、すべてのイベント種別を受け取ります。例: `types=input.block,input.transaction`
- `replay`: 接続時にリングバッファ内の最近のイベントを再生するか指定する `boolean`（真偽値）です。既定値は `true` です。
  - `true` は `types` フィルターに一致する最近のバッファーイベントを先に送り、その後に新しいイベントを送ります。
  - `false` は履歴を送らず、新しいイベントから開始します。

既定の `replay` を使う SSE 接続は次の URL を使用します。

```text
https://<host>:<port>/events
```

ライブイベントだけを受け取る SSE 接続には `replay=false` を指定します。

```text
https://<host>:<port>/events?replay=false
```

既定の `replay` を使う WebSocket 接続は次の URL を使用します。

```text
ws://<host>:<port>/events
```

ライブイベントだけを受け取る WebSocket 接続には `replay=false` を指定します。

```text
ws://<host>:<port>/events?replay=false
```

`types` と `replay` は組み合わせて指定できます。

```text
ws://<host>:<port>/events?types=input.block,input.transaction&replay=false
```

#### Adder Tray の再接続

Adder Tray は、初回接続に `/events?replay=false` を使います。接続成功後に再接続する場合は `/events?replay=true` を使います。これにより、切断中に発生したバッファーイベントを取得します。この手順は Adder Tray が採用する戦略であり、すべてのクライアントに必須の規則ではありません。再接続時に `replay=true` を使うクライアントは、すでに処理したイベントや重複を適切に扱えるようにしてください。

## パスと末尾スラッシュ

- `/ping`と`/healthcheck`は、記載したパスに加えて末尾に`/`を付けた形式も受け付けます。
- FCMとQRコードのルートは、記載したパスに加えて任意の末尾スラッシュを受け付けます。
- `/events`はルート直下に登録されており、ここでは`/events/`を別のパスとして定義しません。
- Swagger UIには`/swagger/`を使用し、末尾のスラッシュを省略しないでください。


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
