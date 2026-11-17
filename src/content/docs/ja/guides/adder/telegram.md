---
title: "Telegram 出力の制御"
description: "Adder の Telegram 出力設定とチャット内コマンドを説明します。"
---

# Telegram 出力の制御

このページでは、Adder の Telegram 出力でイベント通知を送信し、設定済みのチャットから通知設定を管理する方法を説明します。

## 設定

`output: telegram` を指定し、Telegram の bot token と chat ID、および通知設定を保存する `settings-file` を設定します。

```yaml
output: telegram
plugins:
  output:
    telegram:
      bot-token: "<Telegram bot token>"
      chat-id: "<Telegram chat ID>"
      settings-file: "/var/lib/adder/telegram-settings.yaml"
      operator-user-ids: "123456789,987654321" # group chats only
```

`operator-user-ids` には、グループ設定の変更を許可する Telegram ユーザー ID を正の整数でカンマ区切りに指定します。この設定はグループとスーパーグループだけで使用します。

## 通知設定の永続化

Adder は `settings-file` に設定済みのチャットの通知設定を保存します。Adder のプロセスには、ファイルの親ディレクトリへの書き込み権限が必要です。Adder は必要なディレクトリをプライベートな権限で作成し、途中の状態を残さず YAML ファイルを保存します。Adder の各インスタンスと設定済みのチャットには、それぞれ別の設定ファイルを使用します。

設定ファイルには次のキーを使用します。

```yaml
chat_id: <Telegram chat ID>
blocks: true
transactions: true
rollbacks: true
governance: true
```

- `chat_id` は必須で、設定した `chat-id` と一致する必要があります。
- `blocks` はブロック通知を制御します。
- `transactions` はトランザクション通知を制御します。
- `rollbacks` はロールバック通知を制御します。
- `governance` はガバナンス通知を制御します。

4 種類の通知は、初期状態ではすべて `true` です。設定ファイルが存在しない場合、Adder は初期設定で起動します。設定ファイルに必須の `chat_id` がない場合、`chat_id` が設定済みのチャットと一致しない場合、未知のキーがある場合、形式が不正な場合、または複数の YAML ドキュメントが含まれる場合、Adder は起動を拒否します。

`settings-file` を省略すると、Adder はすべての通知を有効にし、`/settings` で現在の設定を表示できます。ただし、チャット内から通知設定を変更できません。通知カテゴリを無効にすると、そのカテゴリの Telegram メッセージだけを抑制します。Adder はイベントの処理を継続します。

## コマンド

Adder は次のコマンドを設定済みのチャットで受け付けます。

### `/start`

ボットを紹介し、`/help` の使用を案内します。

### `/help`

`/status`、`/settings`、`/notify blocks|transactions|rollbacks|governance on|off` のコマンドを表示します。

### `/status`

Adder パイプラインの状態を返します。状態を取得できる場合は、`running`、`stopped`、または `unavailable` を表示します。状態を取得できない場合も `unavailable` を表示します。

### `/settings`

`blocks`、`transactions`、`rollbacks`、`governance` の各通知設定を `on` または `off` で表示します。`settings-file` を設定していない場合、通知設定を変更するには `output.telegram.settings-file` を設定する必要があることも表示します。

### `/notify blocks|transactions|rollbacks|governance on|off`

指定した通知カテゴリを有効または無効にします。`blocks`、`transactions`、`rollbacks`、`governance` のいずれかと、`on` または `off` を指定します。Adder は変更後の設定を、途中の状態を残さず `settings-file` に保存します。

構文、通知カテゴリ、または値が不正な場合、Adder は次の構文を表示します。

```text
/notify blocks|transactions|rollbacks|governance on|off
```

`settings-file` を設定していない場合、Adder は設定変更を有効にするために `output.telegram.settings-file` を設定するよう案内します。保存に失敗した場合、Adder は通知設定を保存できなかったことを返し、現在の設定を変更しません。

## 認証とチャットの範囲

設定済みの `chat-id` に一致するチャットだけがコマンドへの返信とイベントメッセージを受け取ります。Adder は別のチャットから届いたコマンドを処理しません。コマンドを別のボット宛てに指定した場合も処理しません。グループでは Telegram の privacy mode により、`/status@YourBotName` のようにボット名を付けてコマンドを指定する必要がある場合があります。

- プライベートチャットでは、設定済みのチャットの所有者だけが通知設定を変更できます。
- グループまたはスーパーグループでは、`operator-user-ids` に登録されたユーザーだけが通知設定を変更できます。
- グループまたはスーパーグループの他のメンバーは、`/status` と `/settings` を実行できますが、通知設定は変更できません。
- `operator-user-ids` が空の場合、グループまたはスーパーグループではチャット内から通知設定を変更できません。
- チャネルはイベントメッセージを受信できますが、これらのメッセージコマンドは使用できません。

通知設定を変更できないユーザーが `/notify` を実行すると、Adder は設定済みチャットの所有者またはオペレーターだけが通知設定を変更できることを返します。

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
