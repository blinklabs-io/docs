---
title: "Discordボット出力リファレンス"
description: "AdderのDiscordボット出力の設定、スラッシュコマンド、配信動作、Gateway接続、停止処理を説明します。"
---

# Discordボット出力

このリファレンスでは、Adderが選択したイベントをDiscordの指定サーバーとチャンネルへ配信し、読み取り専用のスラッシュコマンドを提供する`discord`出力について説明します。

## 概要

`discord`出力は、次の機能を提供します。

- 指定した1つのDiscordサーバーとチャンネルへのイベント配信
- Discord Gateway v10を使用した接続とスラッシュコマンドの受信
- `/adder-status`による出力の稼働状態の確認
- `/adder-recent`によるプロセス起動後に配信した最新イベントの確認

両方のコマンドは読み取り専用で、応答は他の利用者に表示されないエフェメラル応答です。

## 設定

### YAMLの例

```yaml
output: discord
plugins:
  output:
    discord:
      bot-token: "replace-with-discord-bot-token"
      application-id: "123456789012345678"
      guild-id: "234567890123456789"
      channel-id: "345678901234567890"
      event-types: "blocks,rollbacks,governance"
```

`bot-token`にはDiscordボットトークンを指定します。設定ファイルへトークンを保存する代わりに、`OUTPUT_DISCORD_BOT_TOKEN`環境変数へ設定し、シークレットストアから安全に供給してください。トークンをソース管理へ登録したり、ログやエラーメッセージへ出力したりしないでください。

### 設定項目

| キー | 既定値 | 説明 |
| --- | --- | --- |
| `bot-token` | 空（必須） | Discordボットの認証トークン。`OUTPUT_DISCORD_BOT_TOKEN`環境変数でも指定できます。 |
| `application-id` | 空（必須） | DiscordアプリケーションのID。 |
| `guild-id` | 空（必須） | ボットがイベントを配信し、コマンドを受け付けるDiscordサーバーのID。 |
| `channel-id` | 空（必須） | イベントを配信し、コマンドを受け付けるDiscordチャンネルのID。 |
| `event-types` | `blocks,rollbacks,governance` | 配信するイベントをカンマ区切りで指定します。`blocks`、`transactions`、`rollbacks`、`governance`を選択できます。 |

`application-id`、`guild-id`、`channel-id`には正のDiscord IDを指定します。`event-types`には少なくとも1つの対応する値を指定してください。値の大文字と小文字は区別せず、各値の前後の空白を取り除きます。未対応の値や空の値を指定すると、設定エラーになります。`transactions`は既定で無効です。

## Discordアプリケーションの準備

1. Discordアプリケーションとボットを作成し、対象サーバーへインストールします。
2. インストール時に`bot`と`applications.commands`のスコープを許可します。
3. 対象チャンネルでボットに`View Channel`、`Send Messages`、`Embed Links`の権限を付与します。
4. アプリケーション、サーバー、チャンネルの各IDを設定します。

この出力はGateway Intentを`0`に設定し、スラッシュコマンドのインタラクションだけを受信します。特権の`Message Content` Intentやメンバー関連のIntentは必要ありません。Adderは起動時に設定したサーバーへ`/adder-status`と`/adder-recent`を登録します。

## スラッシュコマンド

### `/adder-status`

設定したサーバーとチャンネルで実行すると、`Adder Discord output is running.`というエフェメラル応答を返します。

### `/adder-recent`

設定したサーバーとチャンネルで実行すると、プロセス起動後に正常配信したイベントを新しいものから最大5件表示します。まだ配信したイベントがない場合は、履歴がないことを示すエフェメラル応答を返します。履歴はメモリだけに保持し、再起動時に消去します。

両方の応答はDiscordのインタラクション応答で`flags: 64`を使用するため、コマンドを実行した利用者だけが確認できます。コマンドとイベントメッセージには`allowed_mentions.parse`の空配列を設定し、メンションを抑制します。

### サーバーとチャンネルの制限

- 設定したサーバー以外から届いたインタラクションは無視し、応答を送信しません。
- 設定したサーバー内でも、`channel-id`と異なるチャンネルからのコマンドには、設定したチャンネルだけで利用できることを示すエフェメラル応答を返します。
- 設定したチャンネルの未知のコマンドには応答しません。

## イベント配信

Adderは`event-types`で選択したイベントを、既存のDiscord webhook形式でメッセージへ整形し、指定したチャンネルへ送信します。イベント送信には`allowed_mentions.parse`の空配列を設定するため、イベント内容が利用者やロールをメンションしません。

配信に失敗した場合、Adderはエラーを出力エラーチャネルとログへ報告します。報告内容にボットトークンは含めません。配信に失敗したイベントは永続保存せず、再起動後に再送しません。

## Gateway接続

Adderは、まず`GET /gateway/bot`からGateway接続先を取得し、Discord Gateway v10へWSS接続します。接続URLには`?v=10&encoding=json`を指定します。コマンドは、次のGateway動作を使用します。

- Gatewayから`Hello`を受け取った後、ボットトークンと`intents: 0`を含む`Identify`を送信します。
- Gatewayが通知する間隔でハートビートを送信し、最新のシーケンス番号を使用します。`Heartbeat ACK`を受け取れない場合は接続を閉じて再接続します。
- 接続が切れた場合、利用可能なセッションIDとシーケンス番号で`Resume`を試行します。セッションを再開できない場合は`Identify`から接続を確立し直します。
- 再接続の待機時間は指数的に増加しますが、1秒から最大15秒までに制限します。

Gatewayの接続とコマンドのインタラクション処理には、同時に処理するインタラクション数の上限があります。Gatewayやインタラクションの処理で発生したエラーは、エラー出力とログへ報告します。

## REST APIとレート制限

Adderは次のDiscord APIパスを使用します。

- `/applications/{application.id}/guilds/{guild.id}/commands`で、起動時に2つのギルドコマンドを登録します。
- `/channels/{channel.id}/messages`でイベントメッセージを送信します。
- `/interactions/{interaction.id}/{interaction.token}/callback`でスラッシュコマンドへの応答を送信します。

RESTリクエストはDiscordのレート制限情報を使用してルート別またはグローバルのクールダウンを管理します。

- HTTP `429`応答の`Retry-After`ヘッダー、またはレスポンス本文の`retry_after`を待機時間として使用し、最大3回まで再試行します。
- `retry_after`が数値でない、負の値、`NaN`、または3600秒を超える場合は、無効なレート制限応答として扱います。
- 10秒を超えるクールダウンが必要なリクエストは直ちに失敗します。同じルートの後続リクエストも、残り時間が10秒を超える間は失敗し、10秒以下になった後はクールダウンの終了まで待機します。
- `GET`リクエストでは、一時的なサーバーエラーと通信エラーを限定的に再試行します。
- `POST`リクエストでは、結果が不明な通信エラーやサーバーエラーの後に自動再送しません。メッセージの重複送信を防ぐためです。

インタラクション応答は、イベント配信のグローバルクールダウンとは別に処理します。イベント配信がレート制限中でも、コマンド応答は利用可能な場合に送信します。

## 停止処理

`Stop`はGatewayのWebSocket接続を閉じてから終了します。別の停止処理が先に接続を閉じていた場合、すでに閉じた接続をもう一度閉じても正常終了します。この場合に発生する`net.ErrClosed`だけを成功として扱います。

`net.ErrClosed`以外の接続終了エラーは抑制せず、`Stop`のエラーとして返します。したがって、停止処理は繰り返し実行できますが、任意の終了エラーを無視する動作ではありません。

## 関連ページ

- [コマンドリファレンス](./006-command_list.md)
- [出力連携リファレンス](./008-output-integrations.md)

---
<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>