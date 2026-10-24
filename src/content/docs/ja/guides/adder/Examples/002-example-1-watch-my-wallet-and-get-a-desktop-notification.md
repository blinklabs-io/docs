---
title: "ウォレットを監視してデスクトップ通知を受け取る"
description: "Adder 例1 - ウォレットを監視してデスクトップ通知を受け取る。"
---

Adder、入力フィルタ、コマンドを開く方法を歩き、ウォレットを追跡し、ウォレットに変更がある場合にデスクトップ通知を与えます。

> ✅ このガイドでは、Adderバイナリを既にダウンロードしたと仮定しています。未ダウンロードの場合は[クイックスタート](../../005-use-adder-on-linux)ガイドを参照してください。

***
<a name="step-1"></a>

<a id="step-1---get-wallet-address"></a>

## ステップ1 - ウォレットアドレスを取得する

まず、ウォレットの受信アドレスまたはステーキングアドレスが必要です。 受信アドレスがあなたの好みのCardanoウォレットに行きます。 受信タブまたはボタンを見つけて、アドレスをコピーします。 後で使用するアドレスのメモを作成します。

<img src="/adder-receive-address.png"
     alt="adder-receive-address"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />


<a href="https://www.cexplorer.io" target="_blank">cexplorer.io</a>などのツールを使用して、受信アドレスを検索し、ステーキングアドレスをコピーすることができます

ステーキングアドレス:
<img src="/adder-staking-address.png"
     alt="adder-staking-address"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

利用したいウォレットアドレスのメモを作成します。後で必要です。この例では、次のアドレスを使用します。

```
stake1uytyq97kc5xc6uwy9vt0xskhfaesv3q49efxgmhrengxpec3j5cta
```

***

<a id="step-2---selecting-adder-commands"></a>

## ステップ2 - Adderコマンドの選択
今、私たちは監視したい財布アドレスを持っているので、我々は私たちが使用するフィルタとコマンドを見て準備ができています。 この例では、次のようになります。

* フィルタータイプ
* フィルターアドレス
* 出力

<a id="filter-type"></a>

### フィルターの種類

追加する最初のフィルタは、フィルタタイプです。この例では、トランザクションがウォレット内で発生したときにアラートを取得したいのですが、アセットを送ったり受け取ったりすることもあります。これを行うには、次のフィルタを追加します。

```
--filter-type input.transaction
```

<a id="filter-address"></a>

### フィルターアドレス

次に、ウォレットアドレスのアラートを受け取りたい。この例では、当社のステークアドレスを使用します。当社のステークアドレスのアラートを取得するには、次のフィルタを追加します。

```
--filter-address stake1uytyq97kc5xc6uwy9vt0xskhfaesv3q49efxgmhrengxpec3j5cta
```

<a id="output"></a>

### 出力

トランザクションがウォレットで発生したとき、デスクトップ通知になるように、出力をデスクトップ通知にしたいです。これを行うには、次のコマンドを追加します。

```
--output notify
```

***

<a id="step-3---putting-it-all-together"></a>

## ステップ3 - すべての設定を組み合わせる

アセットを送受信する際にデスクトップアラートを取得するには、Adderに入力したいフィルタとコマンドを理解し、コマンドプロンプトで次のコマンドを実行します。

> ⚠️ 受信アドレスまたはstakeアドレスを[ステップ1](#step-1)から置き換えてください。

Adderバイナリパスとウォレットアドレスを調整したら実行するコマンド:

```
./adder --filter-type input.transaction --filter-address stake1uytyq97kc5xc6uwy9vt0xskhfaesv3q49efxgmhrengxpec3j5cta --output notify
```

実行する最終コマンド:
<img src="/adder-final-ex-1-command.png"
     alt="adder-final-ex-1-command"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

ウォレットがアセットを送ったり、受け取ったらデスクトップ通知が届きます。

デスクトップの警告:
<img src="/adder-desktop-alert-v2.png"
     alt="adder-desktop-alert"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

<a id="congratulations"></a>

### おめでとうございます!

***

> 💡 ヒント: `-h` または `--help` フラグを使用して、利用可能なすべてのコマンドのリストを得ることができます。

Adderの他の例を見て、Adderのパワーを解除することができます

1. [例1](../002-example-1-watch-my-wallet-and-get-a-desktop-notification) - ウォレットを監視してデスクトップ通知を受け取る
2. [例2](../003-example-2-watch-a-token-and-get-a-desktop-notification) - トークンを監視してデスクトップ通知を受け取る
3. [例3](../004-example-3-watch-an-spo-and-get-an-alert-in-discord) - SPO を監視して Discord 通知を受け取る
4. [例4](../005-example-4-watch-a-smart-contract-for-a-specific-asset-id-and-get-a-desktop-notification) - 特定のアセット ID のスマートコントラクトを監視してデスクトップ通知を受け取る
5. [例5](../006-example-5-watch-an-drep-and-get-an-alert-in-telegram) - DRep を監視して Telegram 通知を受け取る
6. [例 6](../007-example-6-watch-mempool-for-a-token) - 指定トークンを含むトランザクションをメモリプールで監視する
