---
title: "チェック ブロック スケジュール"
description: "Dingo プールのSPOガイド - スロット リーダーのチェックを実行して、ブロックのスケジュールを確認します。"
---

`cardano-cli`のスロットリーダーチェックを実行してブロックをミントに予定されているかどうかを確認することができます。

これは、現在のエポックまたは次のエポックのいずれかのために行うことができます。 現在のエポックが少なくとも70%完了したら、次のエポックのスケジュールが利用可能になります。

***

<img src="/dingo-epoch-70-percent-over.png"
     alt="dingo-epoch-70-percent-over" style="max-width:100%; height:auto; max-height:350px; オブジェクトフィット:含有; ボーダー:1pxソリッド#ccc;" />

***

<br>

## 現在のEpochのためのスロット リーダーの点検を実行して下さい
次のコマンドを実行して、プールが現在のエポックのブロックをミントにするかどうかを確認します。

> ✅ これは、あなたのBPにstakepoolid.txtファイルを持っていると仮定します。 そうでない場合は、手順[here](../005-register-pool/#step-81---create-stakepoolidtxt-file)に従ってください。
>
> ⚠️ 必要に応じてパスを調整する

```
cd $DINGO_HOME
cardano-cli query leadership-schedule \
   --genesis $DINGO_HOME/config/shelley-genesis.json \
   --stake-pool-id $(cat stakepoolid.txt) \
   --vrf-signing-key-file vrf.skey \
   --testnet-magic 2 \
   --current
```

***

<br>

## 次のエポックのためのスロットリーダーチェックを実行します
以下のコマンドを実行して、プールが次のエポックのブロックをミントにするかどうかを確認します。(現在のエポックが70%以上である場合にのみ実行します。)

> ✅ これは、あなたのBPにstakepoolid.txtファイルを持っていると仮定します。 そうでない場合は、手順[here](../005-register-pool/#step-81---create-stakepoolidtxt-file)に従ってください。
>
> ⚠️ 必要に応じてパスを調整する

```
cd $DINGO_HOME
cardano-cli query leadership-schedule \
   --genesis $DINGO_HOME/config/shelley-genesis.json \
   --stake-pool-id $(cat stakepoolid.txt) \
   --vrf-signing-key-file vrf.skey \
   --testnet-magic 2 \
   --next
```

***

<br>

### おめでとうございます!
うまくいけば、あなたのプールはミントに予定されています**Cardano** Dingoを使用してブロック!
