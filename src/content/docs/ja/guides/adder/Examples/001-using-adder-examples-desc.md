---
title: "使用例"
description: "一般的なAdderフィルタとコマンドの概要。"
---

使用例に進む前に、よく使うコマンドとフィルターを確認します。

> 💡 ヒント: `-h` または `--help` フラグを使用して、利用可能なすべてのコマンドのリストを得ることができます。

<a id="filter-options"></a>

### フィルター選択:

1. `--filter-type`(トランザクション、ブロック、ロールバック、およびガバナンスの4つのフィルタタイプがあります)
   * [x] `--filter-type input.transaction`
   * [x] `--filter-type input.rollback`
   * [x] `--filter-type input.block`
   * [x] `--filter-type input.governance`
2. `--filter-policy xyz...`(ポリシーIDによるフィルタ)
3. `--filter-asset asset1xyz...`(アセットIDによるフィルタ)
4. `--filter-drep drepxyz...` (drep IDによるフィルタ)
5. `--filter-address addr1xyz...`(ウォレットによるフィルタ受信アドレス)
6. `--filter-address stake1xyz...`(stakeアドレスによるフィルタ)
7. `--filter-pool poolxyz...`(ステークプールIDによるフィルタ)

<a id="output-options"></a>

### 出力オプション:

1. `--output log`
2. `--output notify`
3. `--output telegram`
4. `--output webhook`
5. `--output push`

<a id="change-network"></a>

### ネットワークの変更

* `--input-chainsync-network`（preview、preprod、mainnet）
  * [x] `--input-chainsync-network preview`
  * [x] `--input-chainsync-network preprod`
  * [x] `--input-chainsync-network mainnet`


Adderの力に精通させるためのいくつかの例を歩くと、使用できるフィルタとコマンドの種類の概要があります。

1. [例1](../002-example-1-watch-my-wallet-and-get-a-desktop-notification) - ウォレットを監視してデスクトップ通知を受け取る
2. [例2](../003-example-2-watch-a-token-and-get-a-desktop-notification) - トークンを監視してデスクトップ通知を受け取る
3. [例3](../004-example-3-watch-an-spo-and-get-an-alert-in-discord) - SPO を監視して Discord 通知を受け取る
4. [例4](../005-example-4-watch-a-smart-contract-for-a-specific-asset-id-and-get-a-desktop-notification) - 特定のアセット ID のスマートコントラクトを監視してデスクトップ通知を受け取る
5. [例5](../006-example-5-watch-an-drep-and-get-an-alert-in-telegram) - DRep を監視して Telegram 通知を受け取る
6. [例 6](../007-example-6-watch-mempool-for-a-token) - 指定トークンを含むトランザクションをメモリプールで監視する

<a id="go-library-examples"></a>

## Goライブラリ例

アプリケーション開発者は、ダウンロード可能なイベントパブリッシャー、フィルタ、およびマネージドプラグインテンプレートの[Goライブラリ例](/ja/guides/adder/library-examples/overview/)を参照してください。
