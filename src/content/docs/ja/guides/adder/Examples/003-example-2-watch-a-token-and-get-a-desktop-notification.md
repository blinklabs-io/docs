---
title: "トークンを監視し、デスクトップ通知を取得する"
description: "Adder 例2 - トークンを見て、デスクトップ通知を取得します。"
---

この例では、Adderを使用して、追跡したい特定のトークンまたはアセットを含むトランザクションがある場合、デスクトップ通知を送信します。

> ✅ このガイドでは、Adderバイナリを既にダウンロードしたと仮定しています。未ダウンロードの場合は[クイックスタート](../../005-use-adder-on-linux)ガイドを参照してください。

***

フォローしたいアセットを選ぶことで始めましょう。

<a id="step-1---get-asset-id--fingerprint"></a>

## ステップ1 - アセット ID / フィンガープリントを取得

私たちが見たいトークンでフィルタリングするには、アセット ID もアセットフィンガープリントとして知られる必要があります。 <a href="https://www.cexplorer.io" target="_blank">cexplorer.io</a> などのツールを使用して、トークン名で検索してアセット ID / アセットフィンガープリントを得ることができます。

<img src="/adder-cTOSI-cexploer.png"
     alt="adder-cTOSI-cexploer"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

アセットフィンガープリントのメモは、後で必要です。この例では、次のアセットID/アセットフィンガープリントを使用しました。

```
asset1uaxup2yv695uat3chgwqtpg9xvau55pd5z6r46
```

***

<a id="step-2---selecting-adder-commands"></a>

## ステップ2 - Adderコマンドの選択

今、私たちは監視したいアセット ID / フィンガープリントを持っているので、私たちが使用するフィルタとコマンドを調べる準備ができています。 この例では、次のようになります。

* アセットフィルター
* フィルター タイプ
* 出力

<a id="filter-asset"></a>

### アセットフィルター

上記のcTOSIからアセット指紋を使用して、以下のフィルタを使用して、Adderトラックトランザクションを指紋で追跡することができます。

```
--filter-asset asset1uaxup2yv695uat3chgwqtpg9xvau55pd5z6r46
```

<a id="filter-type---transaction"></a>

### フィルターの種類 - トランザクション

この例では、cTOSIアセットID/フィンガープリントを使用してトランザクションが発生したときにアラートを取得したいです。これを行うには、次のフィルタを追加します。

```
--filter-type input.transaction
```

<a id="output"></a>

### 出力

出力をデスクトップ通知にしたいです。そのため、cTOSI を含むトランザクションが発生したとき、デスクトップ通知を受け取ります。これを行うには、次のコマンドを追加します。

```
--output notify
```

***

<a id="step-3---putting-it-all-together"></a>

## ステップ3 - すべての設定を組み合わせる

トランザクションが Tosidrop トークン cTOSI を含むときにデスクトップ通知を取得するには、コマンドプロンプトで次のコマンドを実行します。

```
./adder --filter-type input.transaction --filter-asset asset1uaxup2yv695uat3chgwqtpg9xvau55pd5z6r46 --output notify
```

<a id="congratulations"></a>

### おめでとうございます!

トランザクションが cTOSI を含む cTOSI でデスクトップアラートが取得されます。

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
