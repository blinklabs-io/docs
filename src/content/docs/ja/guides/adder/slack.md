---
title: "Slack Webhook出力リファレンス"
description: "AdderからSlack Incoming Webhookへイベントを配信する設定と動作を説明します。"
---

# Slack Webhook出力

`slack`出力は、選択したAdderイベントを1つ以上のSlack Incoming Webhookへ
送信します。各Webhook URLはSlackの送信先に紐づく認証シークレットです。
Slackで送信先チャンネルごとのIncoming Webhookを作成し、URLを安全に管理してください。

このリファレンスでは、設定、イベントの選択、JSONペイロード、HTTP配信、
レート制限、再試行、エラー処理、停止時の動作を説明します。

## 前提条件

- Slackの送信先チャンネルごとにIncoming Webhook URLを作成します。
- AdderがWebhook URLへHTTPS接続できることを確認します。
- Webhook URLは安全に保管し、設定ファイルやログへ不用意に公開しないでください。

## 設定

`output: slack`を選択し、`plugins.output.slack`にオプションを設定します。

```yaml
output: slack
plugins:
  output:
    slack:
      webhook-urls: "https://hooks.slack.com/services/EXAMPLE/ONE,https://hooks.slack.com/services/EXAMPLE/TWO"
      event-types: "blocks,transactions,rollbacks,governance"
```

`webhook-urls`にはカンマ区切りで1つ以上のURLを指定します。Adderは各項目の前後の空白を
除去し、空の項目を無視します。残ったURLが1つもない場合、またはURLの形式が不正な場合は
起動時に設定エラーになります。URLは`https`スキームを使用し、ユーザー情報を含めないでください。

`event-types`には1つ以上のサポート対象イベントをカンマ区切りで指定します。空の値や
サポートされていないイベント名は設定エラーになります。イベント名は次の表に示す識別子を
そのまま使用してください。

| オプション | 必須 | 既定値 | 説明 |
| --- | --- | --- | --- |
| `webhook-urls` | はい | なし | Slack Incoming Webhook URLのカンマ区切りリストです。各URLには`https`を使用し、ユーザー情報を含めません。 |
| `event-types` | いいえ | `blocks,transactions,rollbacks,governance` | Slackへ配信するイベント識別子のカンマ区切りリストです。少なくとも1つのサポート対象イベントを指定します。 |

Webhook URLは送信先ごとの認証シークレットとして扱います。Adderは配信エラーをログと
プラグインのエラーチャネルへ通知しますが、エラー内容にWebhook URLやそのシークレットを
含めません。

## 対象イベント

`event-types`は次のイベント識別子を受け付けます。

| 識別子 | メッセージに含まれる情報 |
| --- | --- |
| `blocks` | ブロック番号、スロット番号、Era、ブロックハッシュ、トランザクション数 |
| `transactions` | トランザクションハッシュ、ブロック番号、スロット番号、手数料（lovelace） |
| `rollbacks` | ロールバック先のスロット番号とブロックハッシュ |
| `governance` | トランザクションハッシュ、スロット番号、提案数、投票数、DRep証明書数 |
| `drep-registration` | DRep証明書の種類、DRep ID、トランザクションハッシュ、スロット番号 |
| `drep-update` | DRep証明書の種類、DRep ID、トランザクションハッシュ、スロット番号 |
| `drep-retirement` | DRep証明書の種類、DRep ID、トランザクションハッシュ、スロット番号 |

既定では`blocks`、`transactions`、`rollbacks`、`governance`を選択します。
DRep証明書イベントは`event-types`に追加した場合に選択されます。選択しなかったイベントは
Slackへ送信せず、Adderのパイプラインを通常どおり通過します。

## メッセージとHTTPリクエスト

Adderは選択したイベントをテキストメッセージへ整形し、次のJSON形式で各送信先へ個別に
`HTTP POST`します。複数の送信先を指定した場合、Adderは同じイベントを各URLへ個別に送信します。

```http
POST https://hooks.slack.com/services/EXAMPLE/ONE
Content-Type: application/json

{"text":"Cardano rollback to slot 42\nHash: abc"}
```

リクエストボディはJSONオブジェクトの`text`フィールドだけで構成します。メッセージ形式に
関する設定オプションはありません。Adderはイベントの種類、スロット番号またはブロック番号、
関連するハッシュまたは件数を含むテキストを作成します。

1つのイベントを送信するHTTPリクエストには次の制限があります。

- 各送信先へのイベントは個別のリクエストで送信し、バッチ化しません。
- 各HTTPリクエストのタイムアウトは15秒です。
- Adderが読み取るHTTPレスポンスボディは最大1,024バイトです。
- 配信処理の入力バッファーには上限があり、永続的なローカルキューはありません。

## 配信結果とレート制限

SlackがHTTPステータス`200`を返し、レスポンスボディが`ok`の場合、Adderはその送信先への
配信成功として扱います。通常の成功リクエストの後、Adderは同じ送信先への次のリクエストを
少なくとも1秒間隔を空けて送信します。

SlackがHTTPステータス`429`を返した場合、Adderは`Retry-After`ヘッダーを整数の秒数として
解析し、同じメッセージを再送します。

- 有効な`Retry-After`の値が0秒以上1分以内の場合、その送信先にクールダウンを設定します。
- 再試行回数を使い切った場合も、解析したクールダウンを後続イベントへ適用します。
- `Retry-After`がない、整数として解析できない、または負の値の場合、該当イベントの配信を失敗とし、送信先に1分間のクールダウンを設定します。
- 1分を超える`Retry-After`は再試行可能な期間を超えるため、配信を失敗とします。設定した送信先はクールダウン中として後続リクエストを受け付けません。

クールダウンは送信先ごとに管理します。クールダウンが1分を超えて残っている間、Adderは
その送信先への後続イベントをスキップします。残り時間が1分以内になると、残りのSlackの
クールダウンが終わるまで待ちます。ある送信先の制限は他の送信先への配信を停止しません。

HTTPステータス`5xx`と一時的なHTTP接続エラーは、最大3回まで再試行します。再試行の待機時間には、
上限付きの指数バックオフ（`1`秒、`2`秒、`4`秒）を使用します。
その他のクライアントエラーと再試行回数を使い切ったエラーは、ログとプラグインのエラー
チャネルへ通知します。

クールダウンはプロセス実行中の送信先状態として保持します。Adderはクールダウンや保留中の
イベントを永続化しないため、プロセスを再起動した後に未完了のイベントを再送しません。

## 停止とエラー処理

停止または実行コンテキストのキャンセルが発生すると、Adderは配信処理を終了し、実行中の
HTTPリクエストをキャンセルします。配信処理の入力バッファーに残るイベントは送信を待たずに
破棄します。

配信エラーはログとプラグインのエラーチャネルへ送信します。エラーにはHTTPステータスや
`Retry-After`の問題など、対処に必要な情報を含めますが、Webhook URLやURL内の認証シークレットを
含めません。

## ライブ確認

本番チャンネルとは別のテストチャンネルに、テスト用のSlack Incoming Webhookを作成します。
テスト用Webhook URLを本番の設定やログへコピーしないでください。

1. テスト用Webhook URLを`webhook-urls`に指定し、`output: slack`を設定します。
2. `event-types`に含まれるイベントを1つ選択します。
3. Adderを起動し、選択したイベントに一致するチェーンイベントを発生させます。
4. 設定したテストチャンネルにメッセージが表示されることを確認します。
5. ログとプラグインのエラーチャネルに配信エラーがないことを確認します。

設定やイベント選択の一覧は[コマンドリファレンス](/ja/guides/adder/006-command_list/)を、他の出力プラグインへの
導線は[出力連携リファレンス](/ja/guides/adder/008-output-integrations/)を参照してください。

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>