---
title: "Stakeアドレスを登録する"
description: "DingoプールのSPOガイド - あなたのStakeアドレスを登録します。"
---

# Dingo - Stakeアドレスを登録する

> stake アドレスは、使用することができる前に、オンチェーンを登録する必要があります。この手数料は、トランザクション手数料とデポジット(ネットワークプロトコルパラメーターによって定義されるように、現在の 2 ADA)を負担します。stake アドレスが登録解除されると、入金が返されます。

✅ このガイドでは、ファイルが$DINGO_HOMEフォルダにあると仮定します。必要に応じて以下のパスを調整します。

## ステップ1 - stake登録証明書を生成する

⚠️ エアギャップ環境のマシンで

```
cd $DINGO_HOME
cardano-cli conway stake-address registration-certificate \
--stake-verification-key-file stake.vkey \
--key-reg-deposit-amt "$(jq -r '.stakeAddressDeposit' params.json)" \
--out-file stake.cert
```

***

<br>

## ステップ2 - トランザクションの構築
`stake.cert`をホット環境の`$DINGO_HOME`ディレクトリにコピーします。


現在のスロットを照会して下さい(`--invalid-hereafter`のために使用される):

```
currentSlot=$(cardano-cli conway query tip --testnet-magic 2 | jq -r '.slot')
echo Current Slot: $currentSlot
```

次にトランザクションを構築します。`transaction build` は手数料とお釣りを自動計算します。

```
cd $DINGO_HOME
cardano-cli conway transaction build \
--tx-in $(cardano-cli query utxo --address $(cat payment.addr) --out-file /dev/stdout | jq -r 'keys[0]') \
--change-address $(cat payment.addr) \
--certificate-file stake.cert \
--invalid-hereafter $(( ${currentSlot} + 1000 )) \
--witness-override 2 \
--out-file tx.raw
```

> `--witness-override 2` は、支払い鍵とステーク鍵の 2 つで署名することを手数料の見積もりに伝えます。

***

<br>

## ステップ3 - トランザクションの署名

`tx.raw`をエアギャップ機の`$DINGO_HOME`ディレクトリにコピーします。

支払いとステーク署名キーを使用してトランザクションに署名します。

⚠️ エアギャップ環境のマシンで

```
cd $DINGO_HOME
cardano-cli conway transaction sign \
--tx-body-file tx.raw \
--signing-key-file payment.skey \
--signing-key-file stake.skey \
--out-file tx.signed
```

***

<br>

## ステップ4 - トランザクションの送信

`tx.signed`をホット環境の`$DINGO_HOME`ディレクトリにコピーします。

```
cd $DINGO_HOME
cardano-cli conway transaction submit --tx-file tx.signed
```

***

<br>

### おめでとうございます!次のセクションに移動する準備が整いました。
