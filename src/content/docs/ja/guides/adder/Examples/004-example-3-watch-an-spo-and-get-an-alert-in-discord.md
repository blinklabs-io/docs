---
title: "SPO を見て、Discord でアラートを取得"
description: "Adder 例3 - SPO を見て、Discord でアラートを取得します。"
---

この例では、Adderを使用して、Webhooksを介してDiscord通知を送信し、追跡したいステークプールに変更がある場合に使用します。

<a id="the-events-that-will-trigger-an-alert-are-the-following-changes-to-a-spo"></a>

### アラートをトリガーするイベントは、SPO の次の変更です。

✅ ブロック 最小化 - SPO がブロックを追跡している場合

✅ Stakeの委任 - SPOが追跡していると、プールに新しい委任者が追加されました

✅ プールの登録更新 - SPOがその登録にアイテムを変更した場合、リレー、固定料金、マージン、名前またはメタデータ

✅ プールの退職 - SPOが自分のステークプールを退職した場合

***

> ✅ このガイドでは、Adderバイナリを既にダウンロードしたと仮定しています。未ダウンロードの場合は[クイックスタート](../../005-use-adder-on-linux)ガイドを参照してください。

***

この例では、フィルタとコマンドを破棄する前に、プール ID を追跡し、Webhook URL を取得する必要があります。Discord でアラートを受け取ります。以下の手順を通ります。

<a name="step-1"></a>

<a id="step-1---get-pool-id-for-the-pool-you-want-to-track"></a>

## ステップ1 - トラックしたいプール用のプールIDを取得する

ステークプール(SPO)でフィルタリングするには、プール ID が必要です。プールティッカーで検索するために cexplorer.io などのツールを使用してプールティッカーを検索することができますので、プール ID を得ることができます。

この例では、<a href="https://www.cexplorer.io" target="_blank">cexplorer.io</a>のCティックター`ECP`を検索しました

<img src="/adder-pool-id.png"
     alt="adder-pool-id"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

<br />

プール ID のメモは、後で必要です。この例では、次のようになります。

```
pool16cdtqyk0fvxzfkhjg3esjcuty4tnlpds5lj0lkmqmwdjyzaj7p8
```

***

<a name="step-2"></a>

<a id="step-2---get-discord-webhook-url"></a>

## ステップ2 - Discord Webhook URLを取得する

Discord サーバーでアラートを取得するには、webhook URL が必要です。Discord サーバーで選択したチャネルで webhook を作成する方法について説明します。


<br />

1 )あなたが警告を受信したいチャネルで`Edit Channel`をクリックします

<img src="/adder-discord-edit-channel.png"
     alt="adder-discord-edit-channel"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

<br />

2 ) クリック `Integrations`

<img src="/adder-discord-integrations.png"
     alt="adder-discord-integrations"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

<br />

3 ) クリック `Create Webhook`

<img src="/adder-discord-create-webhook.png"
     alt="adder-discord-create-webhook"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

<br />

4 ) クリック `New Webhook`

<img src="/adder-discord-new-webhook.png"
     alt="adder-discord-new-webhook"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

<br />

5 ) Webhook の名前

<img src="/adder-discord-rename-webhook.png"
     alt="adder-discord-rename-webhook"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

<br />

6 ) クリック `Copy Webhook URL`

<img src="/adder-discord-copy-webhook-url.png"
     alt="adder-discord-copy-webhook-url"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

<br />

Webhook URL のメモを後で確認します。この例では、使用した Webhook URL は次のようになります。

```
https://discord.com/api/webhooks/1342941446373773342/Wo1bXhSouY5fKdv2frsUQlOnT5UTa9heCxinN_B13AUTuaQ0IOzxzr9ZYsa4co2VN3mi
```

***

<a id="step-3---selecting-adder-commands"></a>

## ステップ3 - Adderコマンドの選択

これで、監視したいプール ID と、Discord webhook URL があり、使用するフィルタとコマンドを調べる準備が整いました。この例では、次のようになります。

* フィルター タイプ
* フィルター プール
* 出力 Webhook
* 出力Webhookのフォーマット
* 出力 Webhook URL


***

<a id="filter-type"></a>

### フィルターの種類

ブロックロールバックのアラートは望まないため、フィルタタイプのトランザクションとブロックを使用できます。 2つのフィルタタイプを使用してコンマでそれらを分離します。 Adderを持っているには、トランザクションとブロックフィルタを使用してロールバックアラートを除外するには、次のフィルタを使用します。

```
--filter-type input.transaction,input.block
```

<a id="filter-pool"></a>

### フィルター プール

[ステップ 1](#step-1) のプール ID を使用し、次のフィルターで Adder に対象の SPO を監視させます。

```
--filter-pool pool16cdtqyk0fvxzfkhjg3esjcuty4tnlpds5lj0lkmqmwdjyzaj7p8
```

<a id="output-webhook"></a>

### 出力 Webhook

Adder に Webhook を使用するコマンドを追加する必要があります。 これを行うには、次のコマンドを追加します。

```
--output webhook
```

<a id="output-webhook-format"></a>

### 出力Webhookのフォーマット

Discord で通知を受け取るため、Webhook の形式として Discord を使用することを Adder に指定します。次のコマンドを追加します。

```
--output-webhook-format discord
```

<a id="output-webhook-url"></a>

### 出力 Webhook URL

推奨Discordチャンネルで通知を取得するには、Discord WebhookにURLをAdderに知らせる必要があります。 これを行うには、[手順 2](#step-2)からWebhook URLを使用して、次のコマンドを追加します。

```
--output-webhook-url https://discord.com/api/webhooks/1342941446373773342/Wo1bXhSouY5fKdv2frsUQlOnT5UTa9heCxinN_B13AUTuaQ0IOzxzr9ZYsa4co2VN3mi
```

***

<a id="step-4---putting-it-all-together"></a>

## ステップ4 - すべての設定を組み合わせる

変更がSPOに発生したときにDiscord通知を取得するには、コマンドプロンプトで次のコマンドを実行します。

> ⚠️ プール ID と webhook URL を調整してください。

```
./adder --filter-type input.transaction, input.block --filter-pool pool16cdtqyk0fvxzfkhjg3esjcuty4tnlpds5lj0lkmqmwdjyzaj7p8 --output webhook --output-webhook-format discord --output-webhook-url https://discord.com/api/webhooks/1342941446373773342/Wo1bXhSouY5fKdv2frsUQlOnT5UTa9heCxinN_B13AUTuaQ0IOzxzr9ZYsa4co2VN3mi
```

<img src="/adder-SPO-block-alert.png"
     alt="adder-SPO-block-alert"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

<a id="congratulations"></a>

### おめでとうございます!

変更が当社のプールに発生した際は、Discord でアラートが取得されます。

***

> 💡 ヒント: `-h` または `--help` フラグを使用して、利用可能なすべてのコマンドのリストを得ることができます。

Adderの他の例を見て、Adderのパワーを解除することができます

1. [例1](../002-example-1-watch-my-wallet-and-get-a-desktop-notification) - ウォレットを監視してデスクトップ通知を受け取る
2. [例2](../003-example-2-watch-a-token-and-get-a-desktop-notification) - トークンを監視してデスクトップ通知を受け取る
3. [例3](../004-example-3-watch-an-spo-and-get-an-alert-in-discord) - SPO を監視して Discord 通知を受け取る
4. [例4](../005-example-4-watch-a-smart-contract-for-a-specific-asset-id-and-get-a-desktop-notification) - 特定のアセット ID のスマートコントラクトを監視してデスクトップ通知を受け取る
5. [例5](../006-example-5-watch-an-drep-and-get-an-alert-in-telegram) - DRep を監視して Telegram 通知を受け取る
6. [例 6](../007-example-6-watch-mempool-for-a-token) - 指定トークンを含むトランザクションをメモリプールで監視する
