---
title: "Stakeのプールを登録する"
description: "DingoプールのSPOガイド - あなたのStakeプールを登録します。"
---

# Dingo - Stake プールを登録する

✅ このガイドでは、ファイルが$DINGO_HOMEフォルダにあると仮定します。必要に応じて以下のパスを調整します。

## ステップ1 - プールのメタデータJSONファイルを作成する
以下の値を自分のプールの情報に更新します。

📝 **ticker** は 3～5 文字にしてください。

📝 **description** は 255 文字以内にしてください。

```
cd $DINGO_HOME
cat > preview-pool-metadata.json << EOF
{
"name": "MyPoolName",
"description": "My pool description",
"ticker": "ABC",
"homepage": "https://pool-Website.com"
}
EOF
```

***

## ステップ2 - メタデータのハッシュを計算する
メタデータのハッシュを計算します。ハッシュは`previewPoolMetaDataHash.txt`に保存されます。

```
cardano-cli conway stake-pool metadata-hash \
--pool-metadata-file preview-pool-metadata.json \
--out-file previewPoolMetaDataHash.txt
```

`previewPoolMetaDataHash.txt`をエアガップ機にコピーします。

***

## ステップ3 - 公開ウェブサイトに`preview-pool-metadata.json`をアップロードする

`preview-pool-metadata.json`ファイルを管理または公開ウェブサイトにアップロードします。 たとえば、プールメタデータをGitHubにアップロードできます。 <a href="https://www.coincashew.com/coins/overview-ada/guide-how-to-build-a-haskell-stakepool-node/part-v-tips/uploading-pool-metadata-to-github" target="_blank">See Coincashewガイド GitHub.</a>

***

## ステップ4 - メタデータハッシュの検証
メタデータJSON URLからメタデータハッシュを取得します。

ステップ3から実際のURLで<https://www.METADATA-URL.com>を置き換える
```
cardano-cli conway stake-pool metadata-hash --pool-metadata-file <(curl -s -L <https://www.METADATA-URL.com>)
```

このハッシュが値にマッチしていることを検証します。

```
cat previewPoolMetaDataHash.txt
```

***

## ステップ5 - あなたのステークプールのための登録証明書を作成する

プールの登録証明書への将来の更新を簡素化するには、プール構成とスクリプトを含む環境(`env`)ファイルを作成し、`pool.cert`を生成します。

### ステップ5.1 - プールスクリプトフォルダを作成する
⚠️ エアギャップ環境のマシンで

```
cd $DINGO_HOME
mkdir pool-scripts
```

### ステップ5.2 - envファイルを作成する
プールスクリプトフォルダ内のプール用の環境(`env`)ファイルを作成します。

✅ メタデータURL、リレーノードIP、ポート、プールの誓約額、コスト（最低プール手数料）、マージンで以下の値を更新します。

```
cat > $DINGO_HOME/pool-scripts/env << 'EOF'
#!/bin/bash

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
EOF
```

> 上記の例では IP アドレスを使用します。 リレーノードが DNS 名を代わりに使用している場合は、次のオプションを使用します。
> ```
> --single-host-pool-relay <relaynode1.pool.example.com> \
> --pool-relay-port 6000 \
> --single-host-pool-relay <relaynode2.pool.example.com> \
> --pool-relay-port 6000 \
>```

▷ ヒント: リレーで使用する `RELAY_PORT` がファイアウォールルールで開くことを確認してください。

現在開いているポートを参照するには:

```
sudo ufw status numbered
```

### ステップ5.3 - `pool-registration.sh`スクリプトを作成する
pool-registration.shスクリプトをpool-scriptsフォルダに作成します。

```
cat > $DINGO_HOME/pool-scripts/pool-registration.sh << EOF
#!/bin/bash

source ./env

cardano-cli conway stake-pool registration-certificate \
--cold-verification-key-file $DINGO_HOME/cold-keys/node.vkey \
--vrf-verification-key-file $DINGO_HOME/vrf.vkey \
--pool-pledge \${PLEDGE} \
--pool-cost \${COST} \
--pool-margin \${MARGIN} \
--pool-reward-account-verification-key-file $DINGO_HOME/stake.vkey \
--pool-owner-stake-verification-key-file $DINGO_HOME/stake.vkey \
\${NET} \
--pool-relay-ipv4 \${RELAY1_HOST} \
--pool-relay-port \${RELAY1_PORT} \
--pool-relay-ipv4 \${RELAY2_HOST} \
--pool-relay-port \${RELAY2_PORT} \
--metadata-url \${METADATA_URL} \
--metadata-hash \${METADATA_HASH} \
--out-file $DINGO_HOME/pool.cert
EOF
```

### ステップ 5.4 - 実行権限を追加する
`pool-registration.sh`スクリプトに実行権限を追加します。

```
chmod +x $DINGO_HOME/pool-scripts/pool-registration.sh
```

### ステップ5.5 - スクリプトを実行
スクリプトは、新しいステークプール登録証明書を生成するために実行されなければなりません。これはトランザクションで提出する必要があります。

```
cd $DINGO_HOME/pool-scripts
./pool-registration.sh
```

### ステップ5.6 - あなたのホット環境にプール.certをコピー
`pool.cert`をホット環境の`$DINGO_HOME`ディレクトリ(ブロックプロデューサーまたはリレーノード)にコピーします。

***

## ステップ6 - あなたのステークプールへの誓約
⚠️ エアギャップ環境のマシンで

```
cd $DINGO_HOME
cardano-cli conway stake-address stake-delegation-certificate \
--stake-verification-key-file stake.vkey \
--cold-verification-key-file $DINGO_HOME/cold-keys/node.vkey \
--out-file deleg.cert
```

***

## ステップ7 - 証明書を提出する
`pool.cert`と`deleg.cert`の両方を提出するためにトランザクションを構築し、署名します。

### ステップ7.1 - 現在のスロットを問い合わせる
```
currentSlot=$(cardano-cli conway query tip --testnet-magic 2 | jq -r '.slot')
echo Current Slot: $currentSlot
```

### ステップ7.2 - トランザクションの構築
```
cd $DINGO_HOME
cardano-cli conway transaction build \
    --tx-in $(cardano-cli query utxo --address $(cat payment.addr) --out-file /dev/stdout | jq -r 'keys[0]') \
    --change-address $(cat payment.addr) \
    --certificate-file pool.cert \
    --certificate-file deleg.cert \
    --invalid-hereafter $(( ${currentSlot} + 1000 )) \
    --witness-override 3 \
    --out-file tx.raw
```

### ステップ 7.3 - トランザクションの署名
`tx.raw`をエアギャップ機の`$DINGO_HOME`ディレクトリにコピーします。

⚠️ エアギャップ環境のマシンで
```
cd $DINGO_HOME
cardano-cli conway transaction sign \
--tx-body-file tx.raw \
--signing-key-file payment.skey \
--signing-key-file $DINGO_HOME/cold-keys/node.skey \
--signing-key-file stake.skey \
--out-file tx.signed
```

### ステップ 7.4 - トランザクションの送信
`tx.signed`をホット環境の`$DINGO_HOME`ディレクトリ(ブロックプロデューサーまたはリレーノード)にコピーします。

```
cd $DINGO_HOME
cardano-cli conway transaction submit --tx-file tx.signed
```

***

## ステップ8 - 登録の確認

<a id="step-81---create-stakepoolidtxt-file"></a>

### ステップ8.1 - `stakepoolid.txt`ファイルを作成する

⚠️ エアギャップ環境のマシンで
```
cardano-cli conway stake-pool id \
--cold-verification-key-file $DINGO_HOME/cold-keys/node.vkey \
--output-format hex \
> stakepoolid.txt

cat stakepoolid.txt
```

### ステップ8.2 - あなたのホット環境に`stakepoolid.txt`をコピーする
`stakepoolid.txt`をホット環境の`$DINGO_HOME`ディレクトリ(ブロックプロデューサーまたはリレーノード)にコピーします。

### ステップ 8.3 - プールがオンチェーンに登場していることを確認:
```
cd $DINGO_HOME
cardano-cli query stake-snapshot --stake-pool-id $(cat stakepoolid.txt)
```

***

## ステップ9 - 新しいKESキー、VRFキーおよび操作の証明書とあなたの`dingo.yaml`を更新して下さい

⚠️ ブロックプロデューサー

次のコマンドで Dingo ノードを停止します。
```
sudo systemctl stop dingo
```

次の行を `dingo.yaml` ファイルに実行して追加します。

```
sudo bash -c "cat <<EOF >> /etc/dingo/dingo.yaml
# Validator / block producer (core storage, API ports ignored):
blockProducer: true
shelleyVrfKey: \"$DINGO_HOME/vrf.skey\"
shelleyKesKey: \"$DINGO_HOME/kes.skey\"
shelleyOperationalCertificate: \"$DINGO_HOME/node.cert\"
EOF"
```

`dingo.yaml`ファイルを実行して確認することができます:

```
sudo nano /etc/dingo/dingo.yaml
```

***

## ステップ10 - Dingo Nodeを起動する

```
sudo systemctl start dingo
```

***

## ステップ11 - ステータスの確認

Dingo が実行されていることを確認します。

```
sudo systemctl status dingo
```

ログをリアルタイムでフォローするには:

```
sudo journalctl -u dingo -f
```

エラーがある場合、最近のログを表示するには:

```
sudo journalctl -u dingo -n 50 --no-pager
```

***

>REST ヒント: <a href="https://docs.cardano.org/cardano-testnets/tools/faucet" target="_blank">Cardano faucet</a> を使用して、一部のテスト ADA がプールに委任されます。 プレビュー テストネットを選択し、`receive pool delegation` を選択します。 次に、お気に入りの Cardano Explorer からコピーできるプール ID を貼り付けます。

***

### おめでとうございます!Dingo stake プールをプレビューネットワーク上で稼働中です。
