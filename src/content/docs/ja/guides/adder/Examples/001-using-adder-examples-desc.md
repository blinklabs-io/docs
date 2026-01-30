---
title: 例の概要
description: 一般的なAdderフィルターとコマンドの概要。
---

# Adderの使用例

## 一般的なフィルターの概要

いくつかの例を説明する前に、使用できる一般的なコマンドとフィルターについて説明します。

> ヒント：`-h`または`-help`フラグを使用すると、利用可能なすべてのコマンドのリストを取得できます。

### フィルターオプション：

1. `-filter-type`（3つのフィルタータイプがあります：Transaction、Block、Rollback）
   * [x] -filter-type chainsync.transaction
   * [x] -filter-type chainsync.rollback
   * [x] -filter-type chainsync.block
2. `-filter-policy xyz...`（ポリシーIDでフィルター）
3. `-filter-asset asset1xyz...`（アセットIDでフィルター）
4. `-filter-address addr1xyz...`（ウォレット受取アドレスでフィルター）
5. `-filter-address stake1xyz...`（ステークアドレスでフィルター）
6. `-filter-pool poolxyz...`（ステークプールIDでフィルター）

### 出力オプション：

1. -output log
2. -output notify
3. -output webhook
4. -output push

### ネットワーク変更

* -input-chainsync-network（3つのネットワークがあります：preview、preprod、mainnet）
  * [x] -input-chainsync-network preview
  * [x] -input-chainsync-network preprod
  * [x] -input-chainsync-network mainnet



使用できるフィルターとコマンドの概要を確認したので、Adderのパワーに慣れるためにいくつかの例を見ていきましょう。

1. [例1](../002-example-1-watch-my-wallet-and-get-a-desktop-notification) - ウォレットを監視してデスクトップ通知を受け取る
2. [例2](../003-example-2-watch-a-token-and-get-a-desktop-notification) - トークンを監視してデスクトップ通知を受け取る
3. [例3](../004-example-3-watch-an-spo-and-get-an-alert-in-discord) - SPOを監視してDiscordでアラートを受け取る
4. [例4](../005-example-4-watch-a-smart-contract-for-a-specific-asset-id-and-get-a-desktop-notification) - 特定のアセットIDのスマートコントラクトを監視してデスクトップ通知を受け取る
