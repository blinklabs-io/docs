---
title: "Matrixルーム出力リファレンス"
description: "AdderイベントをMatrixルームへ通知する出力の設定と配信動作を説明します。"
---

# Matrixルーム出力

このリファレンスでは、`output: matrix`を使用して、選択したAdderイベントをMatrixルームへ通知する方法を説明します。出力はMatrix Client-Server APIの`m.room.message`イベントとして、プレーンテキストの`m.text`メッセージを送信します。

## 前提条件

次の項目を準備します。

- 接続先MatrixホームサーバーのベースURL
- メッセージ送信用のMatrixアクセストークン
- AdderのMatrixユーザーが参加し、メッセージを送信できるルーム

アクセストークンは`Bearer`認証情報です。YAML設定ファイルを保護し、トークンをログや共有設定には保存しません。Matrixユーザーには、各対象ルームへの参加権限とメッセージ送信権限が必要です。

## 設定

次の例は、3種類のイベントを1つのMatrixルームへ送信します。

```yaml
output: matrix
plugins:
  output:
    matrix:
      homeserver-url: https://matrix.example.org
      access-token: MATRIX_ACCESS_TOKEN
      room-ids: "!roomid:example.org"
      event-types: blocks,rollbacks,governance
```

### 設定項目

| キー | 説明 |
| --- | --- |
| `homeserver-url` | 接続先MatrixホームサーバーのベースURL。リモート接続には`https://`を指定します。`HTTP`はループバックアドレスへのテスト接続だけに使用できます。既定値は空です。 |
| `access-token` | Matrix APIの`Bearer`アクセストークン。既定値は空です。 |
| `room-ids` | 送信先ルームIDをコンマ区切りで指定します。既定値は空です。 |
| `event-types` | 送信対象のイベント種別をコンマ区切りで指定します。 |

`room-ids`には、通常の`!room:server.example`形式のIDと、Matrix room version 12で使用するサーバーサフィックスなしの`!roomid`形式のIDを指定できます。Adderは設定したルームごとに、選択した各イベントを送信します。これにより、複数のルームへ同じ通知を配信できます。

`event-types`には、`blocks`、`transactions`、`rollbacks`、`governance`、`drep-registration`、`drep-update`、`drep-retirement`を指定できます。未指定の場合、Adderは`blocks`、`rollbacks`、`governance`を送信します。空の値やサポート対象外の値は設定エラーになります。

## URL、ルーム、権限の検証

Adderは起動時に次の設定を検証します。

- `homeserver-url`は有効な`HTTP` URLでなければなりません。リモートのホームサーバーには`https://`を使用します。`http://`はループバックアドレスのテストに限って許可します。
- `room-ids`には少なくとも1つのルームIDを指定します。
- 各ルームIDは`!`で始まり、空白を含めることはできません。
- room version 12のIDでは、従来の`:server`サフィックスを省略できます。

設定値の検証は、アクセストークンが有効であること、Matrixユーザーがルームに参加していること、または送信権限を持つことを確認しません。起動後のライブチェックで、実際のルーム権限とAPI接続を確認します。

## Matrix APIへの配信

Adderは、選択した各イベントをルームごとに次のエンドポイントへ送信します。

```http
PUT /_matrix/client/v3/rooms/{room}/send/m.room.message/{txnId}
Authorization: Bearer <access-token>
Content-Type: application/json
```

リクエスト本文は次のJSON形式です。

```json
{
  "msgtype": "m.text",
  "body": "Adder <type>\n<event-json>"
}
```

`body`には`Adder <type>`の行と、続くイベントJSONを設定します。`m.room.message`は送信イベントの種類、`m.text`はメッセージ本文の種類を示します。Adderは各ルームと各イベントの組み合わせに対して、`adder-<randomPrefix>-<counter>`形式の`txnId`を生成します。

Matrixが送信リクエストを受け入れると、そのルームへの配信は成功します。この応答は、ルーム内のすべてのメンバーがメッセージを表示または処理したことを確認するものではありません。複数のルームを設定した場合、Adderは各ルームへの配信を個別に処理します。

## 再試行とレート制限

Adderは一時的な失敗だけを上限付きで再試行します。既定の最大再試行回数は`3`です。再試行には指数バックオフを使用し、同じルームとイベントの再試行では同じ`txnId`を使います。これにより、再試行時に新しいトランザクションIDを発行しません。

次の失敗は再試行の対象です。

- ネットワークエラーまたは`HTTP`リクエストの作成、送信エラー
- `HTTP 408`
- `HTTP 5xx`
- `HTTP 429`

`HTTP 429`では、Adderは`Retry-After`を次の形式で解釈します。

- 秒数を表す小数値
- `HTTP`日時

標準の`Retry-After`を利用できない場合、Adderは互換性のためレスポンスの旧形式の`retry_after_ms`ヒントも解釈します。`Retry-After`または`retry_after_ms`が示す待機時間は最大1分です。1分を超える待機時間は再試行せず、配信エラーとして扱います。

`HTTP 408`、`HTTP 5xx`、`HTTP 429`以外の`HTTP 4xx`は永続的な失敗として扱い、再試行しません。最大再試行回数に達した一時的な失敗も、配信失敗として扱います。

## エラー、停止、再起動

配信エラーは`output.matrix`コンポーネントでログに記録し、Adderのエラーチャネルへ`TrySendError`で報告します。エラーチャネルの利用側は、ログ監視やプロセス監視にこの通知を利用できます。

Adderの停止処理は、進行中のMatrixリクエストをキャンセルします。出力には永続キューや耐久性のある再生機能がありません。停止または再起動の時点で処理中のイベントや未送信イベントが残っていても、Adderは後から自動的に再送しません。

## テストルームでのライブチェック

本番ルームを設定する前に、専用のテストルームで次の手順を実行します。

1. Matrixユーザーをテストルームへ参加させ、メッセージを送信できる権限を付与します。
2. `homeserver-url`、`access-token`、テストルームの`!`で始まる`room-ids`を設定します。
3. `event-types`を1種類に絞り、Adderを起動します。
4. 設定したイベントを発生させ、テストルームに`m.room.message`形式のメッセージが表示されることを確認します。
5. 複数ルームを設定する場合は、同じイベントが各ルームに届くことを確認します。
6. `output.matrix`のログとエラーチャネルを確認し、`HTTP`エラーや権限エラーがないことを確認します。

## 関連リファレンス

- [コマンドリファレンスガイド](/ja/guides/adder/006-command_list/): Matrix出力のCLIフラグと既定値
- [Adder出力連携リファレンス](/ja/guides/adder/008-output-integrations/): 他の出力プラグインとイベント配信の概要

---
<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>