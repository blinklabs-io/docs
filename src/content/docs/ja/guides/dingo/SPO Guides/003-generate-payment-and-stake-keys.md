---
title: "支払いとステークキーの生成"
description: "DingoプールのSPOガイド - 支払いとStakeキーを生成します。"
---

# Dingo - 支払いとステークキーの生成

✅ このガイドでは、ファイルが$DINGO_HOMEフォルダにあると仮定します。必要に応じて以下のパスを調整します。

## ステップ1 - プロトコルパラメータを取得する

```
cd $DINGO_HOME
cardano-cli conway query protocol-parameters \
--testnet-magic 2 \
--out-file params.json
```

***

<br>

## ステップ2 - 新しい支払いキーペアを生成する
新しい決済キーペア(`payment.skey`と`payment.vkey`)を生成します。

⚠️ エアギャップ環境のマシンで

```
cd $DINGO_HOME
cardano-cli conway address key-gen \
--verification-key-file payment.vkey \
--signing-key-file payment.skey
```

***

<br>

## ステップ3 - 新しいstakeアドレスキーペアを生成する
新しいstakeアドレスキーペア(`stake.skey`と`stake.vkey`)を生成します。

⚠️ エアギャップ環境のマシンで

```
cd $DINGO_HOME
cardano-cli conway stake-address key-gen \
--verification-key-file stake.vkey \
--signing-key-file stake.skey
```

***

<br>

## ステップ4 - stakeアドレスを生成する
stakeアドレス認証キーからstakeアドレスを生成し、`stake.addr`に格納します。

⚠️ エアギャップ環境のマシンで

```
cd $DINGO_HOME
cardano-cli conway stake-address build \
--stake-verification-key-file stake.vkey \
--out-file stake.addr \
--testnet-magic 2
```

***

<br>

## ステップ5 - 決済アドレスを生成する
決済キー(`payment.vkey`)とステークキー(`stake.vkey`)の決済アドレスを生成し、`payment.addr`に保管します。

```
cd $DINGO_HOME
cardano-cli conway address build \
--payment-verification-key-file payment.vkey \
--stake-verification-key-file stake.vkey \
--out-file payment.addr \
--testnet-magic 2
```

実行中の決済アドレスを表示:
```
cat payment.addr
```

✅ **ホット環境には `payment.addr` のみをコピーし、`payment.skey` はエアギャップ環境のマシンに保管してください。**

***

<br>

## ステップ6 - 支払いアドレスを入金する
テストネットでは、<a href="https://docs.cardano.org/cardano-testnets/tools/faucet" target="_blank">Cardano faucet</a>を使用してテストADAを入手することができます。 プレビューテストネットを選択し、支払いを貼り付けます。

口座に入金後、決済アドレス残高を確認して下さい。

```
cardano-cli conway query utxo \
--address $(cat payment.addr) \
--testnet-magic 2
```

***

<br>

### おめでとうございます!次のセクションに移動する準備が整いました。
