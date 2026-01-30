---
title: ウォレットを監視してデスクトップ通知を受け取る
description: Adder例1 - ウォレットを監視してデスクトップ通知を受け取る。
---

# ウォレットを監視してデスクトップ通知を受け取る

Adderを開き、フィルターとコマンドを入力して、ウォレットを追跡し、ウォレットに変更があったときにデスクトップ通知を受け取る方法を説明します。

> このガイドでは、Adder exeをダウンロード済みでコマンドプロンプトを開いていることを前提としています。まだの場合は、[クイックスタート](../../002-quick-start-overview)ガイドを参照してください。

***
<a name="step-1"></a>

## ステップ1 - ウォレットアドレスを取得

まず、ウォレットの受取アドレスまたはステーキングアドレスが必要です。受取アドレスを見つけるには、お好みのCardanoウォレットに移動します。受取タブまたはボタンを見つけて、アドレスをコピーします。後で使用するためにアドレスをメモしてください。

![adder-receive-address](/adder-receive-address.png)

ステーキングアドレスを見つけるには、<a href="https://www.cexplorer.io" target="_blank">cexplorer.io</a>などのツールを使用して受取アドレスを検索し、ステーキングアドレスをコピーできます

ステーキングアドレス：
![adder-staking-address](/adder-staking-address.png)

使用したいウォレットアドレスをメモしてください。後で必要になります。この例では、以下のステーキングアドレスを使用しました：

```
stake1uytyq97kc5xc6uwy9vt0xskhfaesv3q49efxgmhrengxpec3j5cta
```

***

監視したいウォレットアドレスが取得できたので、使用するフィルターとコマンドを確認する準備ができました。この例では、以下を使用します：

* フィルタータイプ
* フィルターアドレス
* 出力

## フィルタータイプ

最初に追加するフィルターはフィルタータイプです。この例では、ウォレット内でトランザクションが発生したとき、つまりアセットを送信または受信したときにアラートを受け取りたいと考えています。これを行うには、以下のフィルターを追加します：

```
-filter-type chainsync.transaction
```

## フィルターアドレス

次に、自分のウォレットアドレスだけのアラートを受け取りたいと思います。この例では、ステーキングアドレスを使用します。ステーキングアドレスだけのアラートを受け取るには、以下のフィルターを追加します：

```
-filter-address stake1uytyq97kc5xc6uwy9vt0xskhfaesv3q49efxgmhrengxpec3j5cta
```

## 出力

出力をデスクトップ通知にしたいので、ウォレットでトランザクションが発生したときにデスクトップ通知を受け取ります。これを行うには、以下のコマンドを追加します：

```
-output notify
```

***

## ステップ2 - すべてをまとめる

アセットを送信または受信したときにデスクトップアラートを受け取るためにAdderに入力するフィルターとコマンドを理解したので、コマンドプロンプトで以下のコマンドを実行します：



> Adder exeへのパスを調整してください。この例では、ユーザーrichmのデスクトップにあります。\
\
また、以下のステークアドレスを[ステップ1](#step-1)の受取またはステークアドレスに置き換えてください


Adder exeパスとウォレットアドレスを調整したら実行するコマンド：


```
C:\Users\richm\Desktop\adder-v0.26.0-windows-amd64.exe -filter-type chainsync.transaction -filter-address stake1uytyq97kc5xc6uwy9vt0xskhfaesv3q49efxgmhrengxpec3j5cta -output notify
```

実行する最終コマンド：
![adder-final-ex-1-command](/adder-final-ex-1-command.png)

Enterキーを押してコマンドを実行したら、cmdウィンドウを最小化してバックグラウンドで実行させることができます。これで、ウォレットがアセットを送信または受信すると、デスクトップ通知が届きます。

最小化：
![adder-minimize-final-ex-1-command](/adder-minimize-final-ex-1-command.png)


デスクトップアラート：
![adder-desktop-alert](/adder-desktop-alert.png)

### おめでとうございます！

***


> ヒント：`-h`または`-help`フラグを使用すると、利用可能なすべてのコマンドのリストを取得できます。

他の例を参照して、Adderで何ができるかを確認し、Adderのパワーを解き放ちましょう

1. [例1](../002-example-1-watch-my-wallet-and-get-a-desktop-notification) - ウォレットを監視してデスクトップ通知を受け取る
2. [例2](../003-example-2-watch-a-token-and-get-a-desktop-notification) - トークンを監視してデスクトップ通知を受け取る
3. [例3](../004-example-3-watch-an-spo-and-get-an-alert-in-discord) - SPOを監視してDiscordでアラートを受け取る
4. [例4](../005-example-4-watch-a-smart-contract-for-a-specific-asset-id-and-get-a-desktop-notification) - 特定のアセットIDのスマートコントラクトを監視してデスクトップ通知を受け取る
