---
title: "Mempool をトークンでトランザクションに表示する"
description: "Adder 例 6 - トークンでトランザクションのMempoolを見る。"
---

この例では、私たちが追跡したい特定のトークンまたはアセットを含むメモリプールのトランザクションがある場合に、Adderを使用してログ通知を取得します。

⚠️ Mempool は、事前承認されたトランザクションに使用されます。 より高い保証が必要な場合は、`input-chainsync` を使用します。

> ✅ このガイドでは、ノードと同じマシンでAdderを実行していると仮定しています。 そうでない場合は [Adder Linux ガイド](../../005-use-adder-on-linux)を参照してください。

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

* 入力Mempool
* 入力Mempoolのソケットのパス
* アセットフィルター
* フィルター タイプ
* 出力

<br>

<a id="input-mempool"></a>

### 入力Mempool

使用したい入力は、次のフラグを使用してメモリプールであることを指定する必要があります。

```
--input mempool
```

<br>

<a id="input-mempool-socket-path"></a>

### 入力Mempoolのソケットのパス

Adder を実行している Cardano ノードの mempool のソケットパスを指定する必要があります。

⚠️ ファイルパスを以下に調整して、パスを一致させます。

```
--input-mempool-socket-path /home/user/cardano-my-node/db/socket
```

▷ ヒント: ノードソケットへのパスを見つけるには、次のコマンドを実行します。

```
echo $CARDANO_NODE_SOCKET_PATH
```

<br>

<a id="filter-asset"></a>

### アセットフィルター

上記の cTOSI のアセットフィンガープリントを次のフィルターに指定し、一致するトランザクションを Adder で監視します。

```
--filter-asset asset1uaxup2yv695uat3chgwqtpg9xvau55pd5z6r46
```

<br>

<a id="filter-type---transaction"></a>

### フィルターの種類 - トランザクション

この例では、cTOSIアセットID/フィンガープリントを使用してトランザクションが発生したときにアラートを取得したいです。これを行うには、次のフィルタを追加します。

```
--filter-type input.transaction
```

<br>

<a id="output"></a>

### 出力

出力イベントをロガーを使用してコンソールにしたいです。そのため、cTOSI を含むトランザクションが発生したとき、コンソールにログを受信します。これを行うには、次のフラグを追加します。

```
--output log
```

***

<a id="step-3---putting-it-all-together"></a>

## ステップ3 - すべての設定を組み合わせる

トランザクションが Tosidrop トークン cTOSI を含むときにログ通知を取得するには、コマンドプロンプトで次のコマンドを実行します。

> ⚠️ ソケットパスを調節して下さい


```
./adder --input mempool --input-mempool-socket-path /home/user/cardano-my-node/db/socket --filter-type input.transaction --filter-asset asset1uaxup2yv695uat3chgwqtpg9xvau55pd5z6r46 --output log
```

<a id="congratulations"></a>

### おめでとうございます!

トランザクションが cTOSI を含む mempool に表示されます。ログイベントが取得されます。

<img src="/adder-mempool-log.png"
     alt="adder-mempool-log"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

***

> 💡 ヒント: `-h` または `--help` フラグを使用して、利用可能なすべてのコマンドのリストを得ることができます。

ほかの使用例も参照して、Adder の機能を活用してください。

1. [例1](../002-example-1-watch-my-wallet-and-get-a-desktop-notification) - ウォレットを監視してデスクトップ通知を受け取る
2. [例2](../003-example-2-watch-a-token-and-get-a-desktop-notification) - トークンを監視してデスクトップ通知を受け取る
3. [例3](../004-example-3-watch-an-spo-and-get-an-alert-in-discord) - SPO を監視して Discord 通知を受け取る
4. [例4](../005-example-4-watch-a-smart-contract-for-a-specific-asset-id-and-get-a-desktop-notification) - 特定のアセット ID のスマートコントラクトを監視してデスクトップ通知を受け取る
5. [例5](../006-example-5-watch-an-drep-and-get-an-alert-in-telegram) - DRep を監視して Telegram 通知を受け取る
6. [例 6](../007-example-6-watch-mempool-for-a-token) - 指定トークンを含むトランザクションをメモリプールで監視する
