---
title: "特定資産IDのスマートコントラクトを監視し、デスクトップ通知を取得します。"
description: "Adder 例4 - 特定アセットIDのスマートコントラクトを見て、デスクトップ通知を取得します。"
---

この例はもう少し進んでおり、Adderを使用して、特定のアセットを追加または契約から削除されたかどうかを確認するためのスマートコントラクトを監視します。

> ⚠️ フィルターとコマンドを破棄する前に、この例ではすでにスマートコントラクトポリシーを提示して見たいと仮定します。


<img src="/adder-policy-id.png"
     alt="adder-policy-id"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

<br />

この例では、私たちが見ようとしているスマートコントラクトポリシーIDは以下のとおりです。

```
c04e78ea267631f27975446a15d96ef1f3bbcdbf99577d3e552c663b
```

<br />

> ✅ このガイドでは、Adderバイナリを既にダウンロードしたと仮定しています。未ダウンロードの場合は[クイックスタート](../../005-use-adder-on-linux)ガイドを参照してください。



***

フォローしたいアセットを選ぶことで始めましょう。このアセットがスマートコントラクトで使用されている場合は、デスクトップアラートを取得します。

<a id="step-1---get-asset-id--fingerprint"></a>

## ステップ1 - アセット ID / フィンガープリントを取得

私たちが見たいトークンでフィルタリングするには、アセット ID もアセットフィンガープリントとして知られる必要があります。 <a href="https://www.cexplorer.io" target="_blank">cexplorer.io</a> などのツールを使用して、トークン名で検索してアセット ID / アセットフィンガープリントを得ることができます。

<img src="/adder-cTOSI-cexploer.png"
     alt="adder-cTOSI-cexploer"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

<br />

アセットフィンガープリントのメモは、後で必要です。この例では、次のアセットID/アセットフィンガープリントを使用しました。

```
asset1uaxup2yv695uat3chgwqtpg9xvau55pd5z6r46
```

***

<a id="step-2---selecting-adder-commands"></a>

## ステップ2 - Adderコマンドの選択

アセット ID / アセット フィンガープリントを監視したいので、使用するフィルターやコマンドを調べる準備が整っています。この例では、次の操作を行います。

* フィルターポリシー
* アセットフィルター
* フィルター タイプ
* 出力

<a id="filter-policy"></a>

### フィルターポリシー

上記からスマートコントラクトポリシーIDを使用して、Adderに以下のフィルタを使用して、このポリシーを監視します。

```
--filter-policy c04e78ea267631f27975446a15d96ef1f3bbcdbf99577d3e552c663b
```

<a id="filter-asset"></a>

### アセットフィルター

上記からcTOSI用のアセットフィンガープリントを使用して、次のフィルタを使用して、Adderトラックトランザクションをフィンガープリントで追跡できます。

```
--filter-asset asset1uaxup2yv695uat3chgwqtpg9xvau55pd5z6r46
```

<a id="filter-type---transaction"></a>

### フィルターの種類 - トランザクション

この例では、cTOSIアセットの送信または受信時に、トランザクションがスマートコントラクトで発生したときにアラートを取得したいです。 これを行うには、次のフィルタを追加します。

```
--filter-type input.transaction
```

<a id="output"></a>

### 出力

デスクトップ通知として出力したいです。そのため、cTOSI を含むトランザクションがスマートコントラクトで発生したとき、デスクトップ通知を受け取ります。これを行うには、次のコマンドを追加します。

```
--output notify
```

***

<a id="step-3---putting-it-all-together"></a>

## ステップ3 - すべての設定を組み合わせる

トランザクションが Tosidrop トークン cTOSI を含むときにデスクトップ通知を取得するには、スマートコントラクト内で、コマンドプロンプトで次のコマンドを実行します。

> ⚠️ 以下を追跡したいアセットIDとポリシーIDを調整してください。

```
./adder --filter-type input.transaction --filter-asset asset1uaxup2yv695uat3chgwqtpg9xvau55pd5z6r46 --filter-policy c04e78ea267631f27975446a15d96ef1f3bbcdbf99577d3e552c663b --output notify
```


<a id="congratulations"></a>

### おめでとうございます!

スマートコントラクトでcTOSIを含むトランザクションが発生したときは、デスクトップアラートを取得します。

<img src="/adder-desktop-alert-v2.png"
     alt="adder-desktop-alert"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

***


> 💡 ヒント: `-h` または `--help` フラグを使用して、利用可能なすべてのコマンドのリストを得ることができます。

Adderの他の例を見て、Adderのパワーを解除することができます

1. [例1](../002-example-1-watch-my-wallet-and-get-a-desktop-notification) - ウォレットを監視してデスクトップ通知を受け取る
2. [例2](../003-example-2-watch-a-token-and-get-a-desktop-notification) - トークンを監視してデスクトップ通知を受け取る
3. [例3](../004-example-3-watch-an-spo-and-get-an-alert-in-discord) - SPO を監視して Discord 通知を受け取る
4. [例4](../005-example-4-watch-a-smart-contract-for-a-specific-asset-id-and-get-a-desktop-notification) - 特定のアセット ID のスマートコントラクトを監視してデスクトップ通知を受け取る
5. [例5](../006-example-5-watch-an-drep-and-get-an-alert-in-telegram) - DRep を監視して Telegram 通知を受け取る
6. [例 6](../007-example-6-watch-mempool-for-a-token) - 指定トークンを含むトランザクションをメモリプールで監視する
