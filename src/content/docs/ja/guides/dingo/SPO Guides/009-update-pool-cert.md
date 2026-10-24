---
title: "プールの証明書を更新して下さい"
description: "Dingo プールのSPOガイド - プールの証明書を更新します。"
---

# Dingo - プール証明書の更新
時間が経つにつれて、プール証明書(`pool.cert`)を更新して、あなたの誓約量、手数料、またはリレー情報を変更する必要があります。 このガイドは、プロセスを介してあなたを歩くでしょう。

> ✅ このガイドでは、元の `pool.cert` を [Stake Pool の登録](../005-register-pool) ガイドに従って生成します。
>
> ⚠️ プレビュー-pool-metadata.json を変更している場合は、メタデータのハッシュを再計算し、更新されたファイルをアップロードして続行します。 [Stake Pool の登録](../005-register-pool)ガイドに記載されている手順に従ってください。


***

## ステップ1 - `env`ファイルを編集する
`env`ファイル内の値をプールの更新します。

⚠️ エアギャップ環境のマシンで

```
sudo nano $DINGO_HOME/pool-scripts/env
```

`env`ファイルのサンプル:
```
PLEDGE=25000000000  # 25,000 ADA
COST=170000000     #  170 ADA
MARGIN=0.01        #    1 %

NET="--testnet-magic 2"  #preview
RELAY1_HOST=55.209.117.58
RELAY1_PORT=6000
RELAY2_HOST=55.23.123.206
RELAY2_PORT=6000
METADATA_URL=https://website.com/preview-pool-metadata.json
METADATA_HASH=$(cat $DINGO_HOME/previewPoolMetaDataHash.txt)
```

***

## ステップ2 - スクリプトを実行
スクリプトは、新しいステークプール登録証明書を生成するために実行されなければなりません。これはトランザクションで提出する必要があります。

```
cd $DINGO_HOME/pool-scripts
./pool-registration.sh
```

***

## ステップ3 - あなたのホット環境にプールをコピーする
`pool.cert`をホット環境の`$DINGO_HOME`ディレクトリ(ブロックプロデューサーまたはリレーノード)にコピーします。

***

## ステップ4 - プールの証明書を提出する
トランザクションを作成して、更新された`pool.cert`をオンチェーンに送信します。

### ステップ4.1 - 現在のスロットを問い合わせる
```
currentSlot=$(cardano-cli conway query tip --testnet-magic 2 | jq -r '.slot')
echo Current Slot: $currentSlot
```

### ステップ 4.2 - トランザクションの構築
```
cd $DINGO_HOME
cardano-cli conway transaction build \
    --tx-in $(cardano-cli query utxo --address $(cat payment.addr) --out-file /dev/stdout | jq -r 'keys[0]') \
    --change-address $(cat payment.addr) \
    --certificate-file pool.cert \
    --invalid-hereafter $(( ${currentSlot} + 1000 )) \
    --witness-override 2 \
    --out-file tx.raw
```

> ▷ ヒント: オプション - プールの正しい値を持っていることをダブルチェックするには.cert run:
> ```
> cardano-cli debug transaction view \
> --tx-body-file tx.raw
> ```

### ステップ 4.3 - トランザクションの署名
`tx.raw` を `$DINGO_HOME` ディレクトリーのコールド環境にコピーします。

⚠️ エアギャップ環境のマシンで
```
cd $DINGO_HOME
cardano-cli conway transaction sign \
--tx-body-file tx.raw \
--signing-key-file payment.skey \
--signing-key-file $DINGO_HOME/cold-keys/node.skey \
--out-file tx.signed
```

### ステップ 4.4 - トランザクションの送信
`tx.signed`をホット環境の`$DINGO_HOME`ディレクトリ(ブロックプロデューサーまたはリレーノード)にコピーします。

```
cd $DINGO_HOME
cardano-cli conway transaction submit --tx-file tx.signed
```

***

## ステップ5 - 登録を確認する
変更は 2 エポック後に有効になります。 次のエポックトランジションの後、プールの設定が正しいことを確認してください。

トランザクションがチェーンに到達するまで数分待ってから、好みのCardanoエクスプローラを使用して、<a href="https://preview.cardanoscan.io/" target="_blank">https://preview.cardanoscan.io</a>などのトランザクションが成功していることを確認することができます。
