---
title: プール鍵の生成
description: Dingo プールの SPO ガイド - プール鍵を生成します。
---

# Dingo ノード - ブロック生成鍵

Preview ネットワークのブロック生成に必要なプール鍵を生成します。

| 鍵 | 用途 | 保存場所 |
| --- | --- | --- |
| コールド鍵（node.skey / node.vkey） | プール登録と KES 更新の認可 | エアギャップ環境のみ。決して転送しない |
| KES 鍵（kes.skey / kes.vkey） | ブロックの署名。KES 期限前に更新 | kes.skey はブロックプロデューサー |
| VRF 鍵（vrf.skey / vrf.vkey） | スロットリーダーであることの証明 | vrf.skey はブロックプロデューサー |
| 運用証明書（node.cert） | ノードの KES 鍵とコールド鍵の結び付け | ブロックプロデューサー |

各鍵の背景は [Cardano の鍵ペア](https://developers.cardano.org/docs/operate-a-stake-pool/basics/cardano-key-pairs/)を参照してください。

> ⚠️ Dingo ノードのセットアップが完了し、100% 同期していることを前提とします。未完了なら、先にセットアップと同期を完了してください。

✅ ファイルは $DINGO_HOME ディレクトリにあるものとします。必要に応じてパスを調整してください。

## ステップ 1 - KES 鍵ペアの生成

```
cd $DINGO_HOME
cardano-cli conway node key-gen-KES \
--verification-key-file kes.vkey \
--signing-key-file kes.skey
```

## ステップ 2 - コールド鍵用ディレクトリの作成

⚠️ エアギャップ環境のマシンで行います。

ディレクトリを作成し、その中に移動します。

```
mkdir -p "$DINGO_HOME/cold-keys" && cd "$DINGO_HOME/cold-keys"
```

## ステップ 3 - コールド鍵とカウンターファイルの生成

⚠️ エアギャップ環境のマシンで行います。

```
cardano-cli conway node key-gen \
--cold-verification-key-file node.vkey \
--cold-signing-key-file node.skey \
--operational-certificate-issue-counter node.counter
```

## ステップ 4 - 開始 KES 期間の確認

次の CLI コマンドには Shelley ジェネシス JSON が必要です。
Cardano 設定ファイル用のディレクトリを作成します。この例では `$DINGO_HOME/config/` を使用します。作成後、その中に移動します。

```
mkdir -p "$DINGO_HOME/config" && cd "$DINGO_HOME/config"
```

Shelley ジェネシスファイルをダウンロードします。

```
wget https://book.play.dev.cardano.org/environments/preview/shelley-genesis.json
```

> 💡 Cardano 設定ファイルは [Cardano の環境一覧](https://book.play.dev.cardano.org/environments.html)にあります。

次のコマンドで開始 KES 期間を確認します。

```
cd $DINGO_HOME
slotNo=$(cardano-cli conway query tip --testnet-magic 2 | jq -r '.slot')
slotsPerKESPeriod=$(cat $DINGO_HOME/config/shelley-genesis.json | jq -r '.slotsPerKESPeriod')
kesPeriod=$((${slotNo} / ${slotsPerKESPeriod}))
startKesPeriod=${kesPeriod}
echo startKesPeriod: ${startKesPeriod}
```

📝 **この数値をメモしてください。**

## ステップ 5 - プールの運用証明書の生成

✅ 前の手順でメモした値に `<startKesPeriod>` を置き換えます。

⚠️ `kes.vkey` をコールド環境にコピーした後、エアギャップ環境のマシンで行います。

```
cd $DINGO_HOME
cardano-cli conway node issue-op-cert \
--kes-verification-key-file kes.vkey \
--cold-signing-key-file $DINGO_HOME/cold-keys/node.skey \
--operational-certificate-issue-counter $DINGO_HOME/cold-keys/node.counter \
--kes-period <startKesPeriod> \
--out-file node.cert
```

## ステップ 6 - node.cert をホット環境にコピー

`node.cert` をブロックプロデューサーにコピーします。

## ステップ 7 - VRF 鍵ペアの生成

```
cd $DINGO_HOME
cardano-cli conway node key-gen-VRF \
--verification-key-file vrf.vkey \
--signing-key-file vrf.skey
```

## ステップ 8 - VRF 鍵を読み取り専用に設定

`vrf.vkey` をコールド環境にもコピーする必要があります。

```
chmod 400 vrf.skey
```

> ### 確認事項
>
> **ブロック生成ノード**
>
> ブロックプロデューサーに保存するステークプール鍵と証明書は、次の 3 ファイルだけです。
>
> ```
> ###
> ### On block producer node
> ###
> KES = kes.skey
> VRF = vrf.skey
> CERT = node.cert
> ```
>
> **その他の鍵はすべて、オフラインのエアギャップ環境に保管してください。**
>
> **リレーノード**
>
> リレーノードに運用証明書、VRF 鍵、署名鍵、コールド鍵を保存してはいけません。

***

### 次のセクションに進む準備ができました。
