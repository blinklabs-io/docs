---
title: "DRep を見て、Telegram でアラートを取得"
description: "Adder 例5 - DRep を見て、Telegram でアラートを取得します。"
---

この例では、監視対象の DRep がアクションを行ったときに、Adder から Telegram 通知を受け取ります。

<a id="the-events-that-will-trigger-an-alert-are-the-following-actions-by-our-drep"></a>

### アラートをトリガーするイベントは、DRep による次のアクションです。

✅ DRep 登録更新 - DRep が登録を解除するか、登録を変更した場合。

✅ DRep の委任 - 監視対象の DRep に新しい委任者が加わった場合。

✅ ガバナンス投票 - DRepがガバナンス行動に投票した場合。

***

> ✅ このガイドでは、すでにAdderバイナリをダウンロードしたと仮定しています。 未ダウンロードの場合は[クイックスタート](../../005-use-adder-on-linux)ガイドを参照してください。

***

フィルターとコマンドを説明する前に、監視する DRep ID と、Telegram で通知を受け取るためのボットトークンとチャット ID を取得します。以下の手順に従ってください。

<a name="step-1"></a>

<a id="step-1---get-drep-id-for-the-drep-you-want-to-track"></a>

## ステップ1 - あなたが追跡したいDRep IDを取得

DRep でフィルタリングするには、DRep id が必要です。 DRep の ID を取得できるように、 adastat.net などのツールを使用して、DRep の ID を取得できます。

この例では、<a href="https://adastat.net/dreps" target="_blank">https://adastat.net/dreps</a> で `Earn Coin Pool` を検索しました。

<img src="/adder-drep-id.png"
     alt="adder-drep-id"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

<br />

後で使用するため、DRep ID をメモしてください。この例では次の値を使用します。

```
drep1yg8vjs7ute7z7vyd8yez5tgjey6043djjfh8d3n7sjev35g064xxc
```

***

<a name="step-2"></a>

<a id="step-2---creating-the-telegram-bot-required-once"></a>

## ステップ 2 - Telegram ボットの作成（初回のみ）

Telegramでアラートを取得するには、ボットトークンを BotFather から必要とし、チャット ID が必要になります。

**2-1.** `BotFather`を検索して、TelegramでBotFatherを開く

<img src="/adder-search-botfather.png"
     alt="adder-search-botfather"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

***

**2-2.** 新規ボットを作成する

<img src="/adder-botfather-create-new-bot.png"
     alt="adder-botfather-create-new-bot"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

***

**2-3.** ボットに名前を付け、一意のユーザー名を設定します。

<img src="/adder-botfather-new-bot-details.png"
     alt="adder-botfather-new-bot-details"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

***

**2-4.** `Create Bot` をクリックします。

<img src="/adder-botfather-click-create-bot.png"
     alt="adder-botfather-click-create-bot"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

***

<a name="step-2-5"></a>

**2-5.**ボットトークンをコピーする

後で使用するため、ボットトークンをメモしてください。

<img src="/adder-botfather-copy-bot-token.png"
     alt="adder-botfather-copy-bot-token"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

***

**2-6.** `Username`をクリック

<img src="/adder-botfather-click-username.png"
     alt="adder-botfather-click-username"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

***

**2-7.** `Message`をクリックしてボットでチャットを開始

<img src="/adder-botfather-click-message-bot.png"
     alt="adder-botfather-click-message-bot"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

**2-8.** `Start` をクリック

<img src="/adder-bot-chat-click-start.png"
     alt="adder-bot-chat-click-start"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

<a name="step-2-9"></a>

**2-9.** [手順 2-5](#step-2-5) `https://api.telegram.org/bot{your_bot_token}/getUpdates`からボットトークンを持つブラウザでこのURLを開きます

⚠️ トークンを単語 `bot` でプレフィックスする必要があります。

> Eg: https://api.telegram.org/bot87xxxxxx07:AAG8xxxxxx1hi-C8xxxxxxTB2/getUpdates

Bot チャットに関連する Telegram 情報を含む JSON 応答を受信します。

ここでは JSON 形式の例を示します。
```
{
  "ok": true,
  "result": [
    {
      "update_id": 386670171,
      "message": {
        "message_id": 5,
        "from": {
          "id": 1902914866,
          "is_bot": false,
          "first_name": "ECP",
          "username": "EarnCoinPool",
          "language_code": "en"
        },
        "chat": {
          "id": 1902914866,
          "first_name": "ECP",
          "username": "EarnCoinPool",
          "type": "private"
        },
        "date": 1773686781,
        "text": "/start",
        "entities": [
          {
            "offset": 0,
            "length": 6,
            "type": "bot_command"
          }
        ]
      }
    }
  ]
}
```
後で使用するため、CHAT_ID をメモしてください。

この例では、`1902914866` は CHAT_ID です。
<br />

<a id="step-3---selecting-adder-commands"></a>

## ステップ3 - Adderコマンドの選択

今、私たちは監視したいDRep IDを持っていること, 私たちのTelegramトークン, そして、チャットID, 私たちは、私たちが使用するフィルタとコマンドを見て準備ができています. この例では、次のようになります:

* フィルター タイプ
* フィルター DRep
* 出力Telegram
* 出力Telegramボット トークン
* 出力 Telegram チャット Id

***

<a id="filter-type"></a>

### フィルターの種類

ガバナンスイベントが発生したときにのみアラートを取得したいので、フィルタタイプのガバナンスを使用できます。次のフィルタを使用します。

```
--filter-type input.governance
```

<a id="filter-drep"></a>

### フィルター DRep

[手順 1](#step-1)からDRep IDを使用して、次のフィルタを使用してDRepを追跡することができます。

```
--filter-drep drep1yg8vjs7ute7z7vyd8yez5tgjey6043djjfh8d3n7sjev35g064xxc
```

<a id="output-telegram"></a>

### Telegram 出力

Adder が Telegram を使用したいことを知らせるフラグを追加する必要があります。これを行うには、次のフラグを追加します。

```
--output telegram
```

<a id="output-telegram-bot-token"></a>

### Telegram ボットのトークン

Adder が Telegram で通知したいので、Telegram で使用したい Bot トークンを追加する必要があります。これを行うには、[手順 2-5](#step-2-5) から Bot トークンを使用して、次のフラグを追加します。

> ⚠️ $TELEGRAM_TOKEN を[手順 2-5](#step-2-5)で取得したトークンに置き換えます。

```
--output-telegram-bot-token $TELEGRAM_TOKEN
```

<a id="output-telegram-chat-id"></a>

### Telegram のチャット ID

希望の Telegram チャンネルで通知を取得するには、Telegram ボットにチャット ID を Adder に伝える必要があります。これを行うには、[手順 2-9](#step-2-9) からチャット ID を使用して、次のフラグを追加します。

> ⚠️チャット ID で $CHAT_ID を置換

```
--output-telegram-chat-id $CHAT_ID
```

***

<a id="step-4---putting-it-all-together"></a>

## ステップ4 - すべての設定を組み合わせる

アクションがDRepによって発生したときにTelegram通知を取得するには、コマンドプロンプトで次のコマンドを実行します。

> ⚠️DRep ID、$TELEGRAM_TOKEN、$CHAT_IDを以下に調整してください。

```
./adder --filter-type input.governance --filter-drep drep1yg8vjs7ute7z7vyd8yez5tgjey6043djjfh8d3n7sjev35g064xxc --output telegram --output-telegram-bot-token $TELEGRAM_TOKEN --output-telegram-chat-id $CHAT_ID
```


<a id="congratulations"></a>

### おめでとうございます!

DRep でアクションが発生したときは、Telegram でアラートを取得します。

***


> 💡 ヒント: `-h` または `--help` フラグを使用して、利用可能なすべてのコマンドのリストを得ることができます。

ほかの使用例も参照して、Adder の機能を活用してください。

1. [例1](../002-example-1-watch-my-wallet-and-get-a-desktop-notification) - ウォレットを監視してデスクトップ通知を受け取る
2. [例2](../003-example-2-watch-a-token-and-get-a-desktop-notification) - トークンを監視してデスクトップ通知を受け取る
3. [例3](../004-example-3-watch-an-spo-and-get-an-alert-in-discord) - SPO を監視して Discord 通知を受け取る
4. [例4](../005-example-4-watch-a-smart-contract-for-a-specific-asset-id-and-get-a-desktop-notification) - 特定のアセット ID のスマートコントラクトを監視してデスクトップ通知を受け取る
5. [例5](../006-example-5-watch-an-drep-and-get-an-alert-in-telegram) - DRep を監視して Telegram 通知を受け取る
6. [例 6](../007-example-6-watch-mempool-for-a-token) - 指定トークンを含むトランザクションをメモリプールで監視する
