---
title: 特定のアセットIDのスマートコントラクトを監視してデスクトップ通知を受け取る
description: Adder例4 - 特定のアセットIDのスマートコントラクトを監視してデスクトップ通知を受け取る。
---

# 特定のアセットIDのスマートコントラクトを監視してデスクトップ通知を受け取る

この例は少し高度で、Adderを使用してスマートコントラクトを監視し、特定のアセットがコントラクトに追加または削除されたかどうかを確認します。

> この例で使用するフィルターとコマンドを説明する前に、監視したいスマートコントラクトポリシーがすでにあることを前提としています。


![adder-policy-id](/adder-policy-id.png)

<br />

この例では、監視するスマートコントラクトポリシーIDは：

```
c04e78ea267631f27975446a15d96ef1f3bbcdbf99577d3e552c663b
```

<br />

> このガイドでは、Adder exeをダウンロード済みでコマンドプロンプトを開いていることを前提としています。まだの場合は、[クイックスタート](../../002-quick-start-overview)ガイドを参照してください。



***

まず、フォローしたいアセットを選びましょう。このアセットがフォローしているスマートコントラクトで使用された場合、デスクトップアラートが届きます。

## ステップ1 - アセットID / フィンガープリントを取得

監視したいトークンでフィルタリングするには、アセットID（アセットフィンガープリントとも呼ばれる）が必要です。<a href="https://www.cexplorer.io" target="_blank">cexplorer.io</a>などのツールを使用して、トークン名で検索し、アセットID / アセットフィンガープリントを取得できます。

![adder-cTOSI-cexploer](/adder-cTOSI-cexploer.png)

<br />

アセットフィンガープリントをメモしてください。後で必要になります。この例では、以下のアセットID / アセットフィンガープリントを使用しました：

```
asset1uaxup2yv695uat3chgwqtpg9xvau55pd5z6r46
```

***

監視したいアセットID / アセットフィンガープリントが取得できたので、使用するフィルターとコマンドを確認する準備ができました。この例では、以下を使用します：

* フィルターポリシー
* フィルターアセット
* フィルタータイプ
* 出力

## フィルターポリシー

上記のスマートコントラクトポリシーIDを使用して、Adderにこのポリシーを監視させるには、以下のフィルターを使用します：

```
-filter-policy c04e78ea267631f27975446a15d96ef1f3bbcdbf99577d3e552c663b
```

## フィルターアセット

上記のcTOSIのアセットフィンガープリントを使用して、Adderにそのフィンガープリントを持つトランザクションを追跡させるには、以下のフィルターを使用します：

```
-filter-asset asset1uaxup2yv695uat3chgwqtpg9xvau55pd5z6r46
```

## フィルタータイプ - トランザクション

この例では、スマートコントラクトでcTOSIアセットを送信または受信するトランザクションが発生したときにアラートを受け取りたいと考えています。これを行うには、以下のフィルターを追加します：

```
-filter-type chainsync.transaction
```

## 出力

出力をデスクトップ通知にしたいので、スマートコントラクトでcTOSIを含むトランザクションが発生したときにデスクトップ通知を受け取ります。これを行うには、以下のコマンドを追加します：

```
-output notify
```

***

## すべてをまとめる

スマートコントラクト内でTosidropトークンcTOSIを含むトランザクションがあったときにデスクトップ通知を受け取るには、コマンドプロンプトで以下のコマンドを実行します：

> Adder exeへのパスを調整してください。この例では、ユーザーrichmのデスクトップにあります。\
> また、追跡したいアセットIDとポリシーIDも調整してください。


```
C:\Users\richm\Desktop\adder-v0.26.0-windows-amd64.exe -filter-type chainsync.transaction -filter-asset asset1uaxup2yv695uat3chgwqtpg9xvau55pd5z6r46 -filter-policy c04e78ea267631f27975446a15d96ef1f3bbcdbf99577d3e552c663b -output notify
```


### おめでとうございます！

これでウィンドウを最小化して、Adderをバックグラウンドで実行させることができます。スマートコントラクト内でcTOSIを含むトランザクションが発生するたびに、デスクトップアラートが届きます。

![adder-desktop-alert](/adder-desktop-alert.png)

***


> ヒント：`-h`または`-help`フラグを使用すると、利用可能なすべてのコマンドのリストを取得できます。

他の例を参照して、Adderで何ができるかを確認し、Adderのパワーを解き放ちましょう

1. [例1](../002-example-1-watch-my-wallet-and-get-a-desktop-notification) - ウォレットを監視してデスクトップ通知を受け取る
2. [例2](../003-example-2-watch-a-token-and-get-a-desktop-notification) - トークンを監視してデスクトップ通知を受け取る
3. [例3](../004-example-3-watch-an-spo-and-get-an-alert-in-discord) - SPOを監視してDiscordでアラートを受け取る
4. [例4](../005-example-4-watch-a-smart-contract-for-a-specific-asset-id-and-get-a-desktop-notification) - 特定のアセットIDのスマートコントラクトを監視してデスクトップ通知を受け取る
