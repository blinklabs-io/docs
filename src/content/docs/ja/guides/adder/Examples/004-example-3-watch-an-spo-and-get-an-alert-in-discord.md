---
title: SPOを監視してDiscordでアラートを受け取る
description: Adder例3 - SPOを監視してDiscordでアラートを受け取る。
---

# SPOを監視してDiscordでアラートを受け取る

この例では、Adderを使用して、追跡したいステークプールに変更があったときにWebhook経由でDiscord通知を送信します。


### アラートをトリガーするイベントは、SPOへの以下の変更です：

ブロック生成 - 追跡しているSPOがブロックを生成した場合

ステーク委任 - 追跡しているSPOに新しいデリゲーターがプールに追加された場合

プール登録更新 - SPOがリレー、固定手数料、マージン、名前、メタデータなどの登録項目を変更した場合

プール引退 - SPOがステークプールを引退させた場合

***

> このガイドでは、Adder exeをダウンロード済みでコマンドプロンプトを開いていることを前提としています。まだの場合は、[クイックスタート](../../002-quick-start-overview)ガイドを参照してください。

***

この例で使用するフィルターとコマンドを説明する前に、追跡するプールIDとDiscordでアラートを受け取るためのWebhook URLを取得する必要があります。以下でそれらを取得する手順を説明します。

<a name="step-1"></a>

## ステップ1 - 追跡したいプールのプールIDを取得

監視したいステークプール（SPO）でフィルタリングするには、プールIDが必要です。cexplorer.ioなどのツールを使用して、プールティッカーで検索し、プールIDを取得できます。

この例では、<a href="https://www.cexplorer.io" target="_blank">cexplorer.io</a>でティッカー`ECP`を検索しました

![adder-pool-id](/adder-pool-id.png)

<br />

プールIDをメモしてください。後で必要になります。この例では：

```
pool16cdtqyk0fvxzfkhjg3esjcuty4tnlpds5lj0lkmqmwdjyzaj7p8
```

***

<a name="step-2"></a>

## ステップ2 - Discord Webhook URLを取得

Discordサーバーでアラートを受け取るには、Webhook URLが必要です。以下の手順では、Discordサーバーの好みのチャンネルでWebhookを作成する方法を説明します。


<br />

1 ) アラートを受け取りたいチャンネルで`チャンネルの編集`をクリック

![adder-discord-edit-channel](/adder-discord-edit-channel.png)

<br />

2 ) `連携サービス`をクリック

![adder-discord-integrations](/adder-discord-integrations.png)

<br />

3 ) `ウェブフックを作成`をクリック

![adder-discord-create-webhook](/adder-discord-create-webhook.png)

<br />

4 ) `新しいウェブフック`をクリック

![adder-discord-new-webhook](/adder-discord-new-webhook.png)

<br />

5 ) Webhookに名前を付ける

![adder-discord-rename-webhook](/adder-discord-rename-webhook.png)

<br />

6 ) `ウェブフックURLをコピー`をクリック

![adder-discord-copy-webhook-url](/adder-discord-copy-webhook-url.png)

<br />

Webhook URLをメモしてください。後で必要になります。この例では、使用したWebhook URLは：

```
https://discord.com/api/webhooks/1342941446373773342/Wo1bXhSouY5fKdv2frsUQlOnT5UTa9heCxinN_B13AUTuaQ0IOzxzr9ZYsa4co2VN3mi
```

***

監視したいプールIDとDiscord Webhook URLが取得できたので、使用するフィルターとコマンドを確認する準備ができました。この例では、以下を使用します：

* フィルタータイプ
* フィルタープール
* 出力Webhook
* 出力Webhook形式
* 出力Webhook URL


***

## フィルタータイプ

ブロックロールバックのアラートは不要なので、トランザクションとブロックのフィルタータイプを使用できます。2つのフィルタータイプを使用したいので、カンマで区切ります。Adderにトランザクションとブロックフィルターを使用してロールバックアラートを除外させるには、以下のフィルターを使用します：

```
-filter-type chainsync.transaction,chainsync.block
```

## フィルタープール

[ステップ1](#step-1)のプールIDを使用して、Adderに以下のフィルターを使用してSPOを追跡させることができます：

```
-filter-pool pool16cdtqyk0fvxzfkhjg3esjcuty4tnlpds5lj0lkmqmwdjyzaj7p8
```

## 出力Webhook

Webhookを使用したいことをAdderに知らせるコマンドを追加する必要があります。これを行うには、以下のコマンドを追加します：

```
-output webhook
```

## 出力Webhook形式

AdderにDiscordで通知させたいので、使用したいWebhook形式がDiscordであることをAdderに伝える必要があります。これを行うには、以下のコマンドを追加します：

```
-output-webhook-format discord
```

## 出力Webhook URL

好みのDiscordチャンネルで通知を受け取るには、Discord WebhookへのURLをAdderに伝える必要があります。これを行うには、[ステップ2](#step-2)のWebhook URLを使用して以下のコマンドを追加します：

```
-output-webhook-url https://discord.com/api/webhooks/1342941446373773342/Wo1bXhSouY5fKdv2frsUQlOnT5UTa9heCxinN_B13AUTuaQ0IOzxzr9ZYsa4co2VN3mi
```



***

## すべてをまとめる

SPOに変更があったときにDiscord通知を受け取るには、コマンドプロンプトで以下のコマンドを実行します：

> Adder exeへのパスを調整してください。この例では、ユーザーrichmのデスクトップにあります。\
> また、プールIDとWebhook URLも調整してください。

```
C:\Users\richm\Desktop\adder-v0.26.0-windows-amd64.exe -filter-type chainsync.transaction, chainsync.block -filter-pool pool16cdtqyk0fvxzfkhjg3esjcuty4tnlpds5lj0lkmqmwdjyzaj7p8 -output webhook -output-webhook-format discord -output-webhook-url https://discord.com/api/webhooks/1342941446373773342/Wo1bXhSouY5fKdv2frsUQlOnT5UTa9heCxinN_B13AUTuaQ0IOzxzr9ZYsa4co2VN3mi
```

![adder-SPO-block-alert](/adder-SPO-block-alert.png)

### おめでとうございます！

これでウィンドウを最小化して、Adderをバックグラウンドで実行させることができます。プールに変更があるたびに、Discordでアラートが届きます。

***


> ヒント：`-h`または`-help`フラグを使用すると、利用可能なすべてのコマンドのリストを取得できます。

他の例を参照して、Adderで何ができるかを確認し、Adderのパワーを解き放ちましょう

1. [例1](../002-example-1-watch-my-wallet-and-get-a-desktop-notification) - ウォレットを監視してデスクトップ通知を受け取る
2. [例2](../003-example-2-watch-a-token-and-get-a-desktop-notification) - トークンを監視してデスクトップ通知を受け取る
3. [例3](../004-example-3-watch-an-spo-and-get-an-alert-in-discord) - SPOを監視してDiscordでアラートを受け取る
4. [例4](../005-example-4-watch-a-smart-contract-for-a-specific-asset-id-and-get-a-desktop-notification) - 特定のアセットIDのスマートコントラクトを監視してデスクトップ通知を受け取る
