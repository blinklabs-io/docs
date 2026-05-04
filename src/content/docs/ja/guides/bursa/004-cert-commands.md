---
title: Certコマンドラインガイド
description: 各種Cardano証明書を生成するためのBursaコマンドラインガイド。
---

<a name="cert"></a>

Bursaは、ステークプール運用、ステーク委任、Conway時代のガバナンス用の証明書を作成するために使用できます。

## Bursaを使用して証明書を作成
これらのBursaコマンドは、各種Cardano証明書を生成するために使用できます。

<table>
  <tr>
    <th colspan="2" align="left">証明書の種類:</th>
  </tr>
<tr>
    <td><a href="#op">op-cert</a></td>
    <td>- ブロック生成用の運用証明書</td>
</tr>
<tr>
    <td><a href="#pool-registration">pool-registration</a></td>
    <td>- プール登録証明書</td>
</tr>
<tr>
    <td><a href="#pool-retirement">pool-retirement</a></td>
    <td>- プール引退証明書</td>
</tr>
<tr>
    <td><a href="#stake-registration">stake-registration</a></td>
    <td>- ステークアドレスの登録</td>
</tr>
<tr>
    <td><a href="#stake-deregistration">stake-deregistration</a></td>
    <td>- ステークアドレスの登録解除</td>
</tr>
<tr>
    <td><a href="#stake-delegation">stake-delegation</a></td>
    <td>- プールへのステーク委任</td>
</tr>
<tr>
    <td><a href="#drep-registration">drep-registration</a></td>
    <td>- DRep登録 (Conway)</td>
</tr>
<tr>
    <td><a href="#drep-deregistration">drep-deregistration</a></td>
    <td>- DRep登録解除 (Conway)</td>
</tr>
<tr>
    <td><a href="#vote-delegation">vote-delegation</a></td>
    <td>- 投票委任 (Conway)</td>
</tr>
<tr>
    <td><a href="#committee-hot-auth">committee-hot-auth</a></td>
    <td>- 委員会ホットキー認証 (Conway)</td>
</tr>
<tr>
    <td><a href="#committee-cold-resign">committee-cold-resign</a></td>
    <td>- 委員会コールドキー辞任 (Conway)</td>
</tr>
</table>

***
<a name="op"></a>

## ステークプール運用のための証明書を作成

`op-cert`コマンドは、KESキーをプールコールドキーに紐付ける運用証明書(別名`node.cert`)を生成するために使用できます。ステークプールはKESキーをローテーションする際に新しいnode.certを作成する必要があります。そのため、SPOはBursaを使用して、新しいkes.vkey、コールドキー、KES期間で新しい`node.cert`を作成できます。

🔁 出力形式は、cardano-cliの運用証明書と互換性があります。

> **必要な入力:** <br>
>   `--kes-vkey` &emsp; &nbsp; &nbsp; KES検証鍵ファイル (bech32またはhex形式) <br>
>   `--cold-skey` &emsp; &nbsp; プールコールド署名鍵ファイル (bech32またはhex形式) <br>
>   `--counter` &emsp; &nbsp; &nbsp; &nbsp;証明書のシーケンス番号 (新しい証明書ごとにインクリメントする必要があります) <br>
>   `--kes-period` &emsp; 証明書作成時のKES期間

✅ カウンタの値は、新しい運用証明書を作成するたびに、古いKESキーでブロックをミントした場合に限り、インクリメントする必要があります。KES期間は、現在のスロットをKES期間あたりのスロット数で割ったものです (通常はメインネットで129600スロット = 約36時間)。

`node.cert`の出力形式は、cardano-cliの運用証明書と互換性があります。

`node.cert`を作成するには、次のコマンドを実行できます。

> ⚠️ KESおよびコールドキーへのパスを調整してください。また、以下のカウンタとKES期間も調整してください。

```bash
./bursa cert op-cert --kes-vkey /path/kes.vkey --cold-skey /path/cold.skey --counter 0 --kes-period 200 --out node.cert
```

***

<a name="pool-registration"></a>

## プール登録証明書を生成

プール登録証明書は、新しいステークプールを登録するか、Cardanoブロックチェーン上の既存の登録を更新します。

> 必要な入力:
> -  `--cold-vkey`       プールコールド検証鍵ファイル
> -  `--vrf-vkey`        VRF検証鍵ファイル
> -  `--pledge`          プレッジ額(lovelace)
> -  `--cost`            エポックごとの固定コスト(lovelace)
> -  `--margin`          プールマージン (0.0から1.0)
> -  `--reward-account`  報酬アカウントアドレス (bech32ステークアドレス)

>オプションの入力:
> -  `--metadata-url`    プールメタデータURL
> -  `--metadata-hash`   プールメタデータハッシュ (hex)

出力形式はcardano-cli証明書と互換性があります。

> ⚠️ 以下のパスを調整してください。

```bash
./bursa cert pool-registration \
    --cold-vkey /path/cold.vkey --vrf-vkey /path/vrf.vkey \
    --pledge 1000000000 --cost 340000000 --margin 0.01 \
    --reward-account stake1... \
    --metadata-url "https://example.com/pool.json" \
    --metadata-hash "abc123..." --out pool-reg.cert
```

***

<a name="pool-retirement"></a>

## プール引退証明書を生成
プール引退証明書は、ステークプールが指定されたエポック境界で引退することを示します。

> 必要な入力:
> -  `--cold-vkey`  プールコールド検証鍵ファイル
> -  `--epoch`      引退エポック

出力形式はcardano-cli証明書と互換性があります。

> ⚠️ コールドキーへのパスを調整してください。
```bash
./bursa cert pool-retirement --cold-vkey /path/cold.vkey \
    --epoch 300 --out pool-retire.cert
```

***

<a name="stake-registration"></a>

## ステークアドレス登録証明書を作成

この証明書はステークアドレスをオンチェーンで登録します。これは、ステークキーが委任や報酬の引き出しに使用される前に必要です。

出力形式はcardano-cli互換のJSONテキストエンベロープです。

> ⚠️ 以下のパスを調整してください。

```bash
./bursa cert stake-registration \
    --stake-vkey /path/stake.vkey --out stake-reg.cert
```

***

<a name="stake-deregistration"></a>

## ステークアドレス登録解除証明書を作成

この証明書はステークアドレスの登録を解除し、デポジットを返却し、オンチェーン登録からステークキーを削除します。

出力形式はcardano-cli互換のJSONテキストエンベロープです。

> ⚠️ 以下のパスを調整してください。

```bash
 ./bursa cert stake-deregistration \
    --stake-vkey /path/stake.vkey --out stake-dereg.cert
```

***

<a name="stake-delegation"></a>

## ステーク委任証明書を作成

この証明書は、プールID(bech32またはhex形式)で識別される特定のステークプールにステークキーからステークを委任します。

出力形式はcardano-cli互換のJSONテキストエンベロープです。

> ⚠️ 以下のパスを調整してください。

```bash
./bursa cert stake-delegation \
    --stake-vkey /path/stake.vkey \
    --pool-id pool1... \
    --out stake-deleg.cert
```

***

<a name="drep-registration"></a>

## DRep登録証明書を作成 (Conway)

この証明書は、Delegated Representative (DRep) をオンチェーンで登録します。これにより、DRepは投票委任を受け取り、ガバナンスアクションに参加できるようになります。

lovelaceでのデポジット額が必要です。DRepメタデータ用に、オプションでアンカーURLとハッシュを提供できます。

出力形式はcardano-cli互換のJSONテキストエンベロープです。

**アンカーメタデータ付きDRep登録の例**

> ⚠️ 以下のパスを調整してください。

```bash
./bursa cert drep-registration \
    --drep-vkey /path/drep.vkey \
    --deposit 500000000 \
    --anchor-url https://example.com/drep.json \
    --anchor-hash abc123... \
    --out drep-reg.cert
```

***

<a name="drep-deregistration"></a>

## DRep登録解除証明書を作成 (Conway)

この証明書はオンチェーンガバナンスからDRepを登録解除し、デポジット返金額を返却します。

出力形式はcardano-cli互換のJSONテキストエンベロープです。

> ⚠️ 以下のパスを調整してください。

```bash
./bursa cert drep-deregistration \
    --drep-vkey /path/drep.vkey \
    --deposit-refund 500000000 \
    --out drep-dereg.cert
```

***

<a name="vote-delegation"></a>

## 投票委任証明書を作成 (Conway)

この証明書は、ステークキーから投票権をDRepに、または特別な投票オプション(常時棄権または常時不信任)に委任します。

<table>
  <tr>
    <th colspan="2" align="left">委任先は1つだけ指定する必要があります:</th>
  </tr>
<tr>
    <td>--drep-vkey-hash</td>
    <td>キーハッシュ(hex)でDRepに委任</td>
</tr>
<tr>
    <td>--drep-id</td>
    <td>ID (bech32またはhex) でDRepに委任</td>
</tr>
<tr>
    <td>--always-abstain</td>
    <td>常に投票を棄権する</td>
</tr>
<tr>
    <td>--always-no-confidence</td>
    <td>常に不信任に投票する</td>
</tr>
</table>

出力形式はcardano-cli互換のJSONテキストエンベロープです。

> ⚠️ 以下のパスを調整してください。

### 特定のDRepに委任
```bash
  ./bursa cert vote-delegation \
    --stake-vkey /path/stake.vkey \
    --drep-id drep1... \
    --out vote-deleg.cert
```

### 常時棄権
```bash
  ./bursa cert vote-delegation \
    --stake-vkey /path/stake.vkey \
    --always-abstain \
    --out vote-deleg.cert
```

***

<a name="committee-hot-auth"></a>

## 委員会ホットキー認証証明書を作成 (Conway)

この証明書は、ガバナンス投票のために、委員会コールドキーに代わって行動するホットキーを承認します。コールドキーはオフラインのまま保持され、ホットキーがガバナンスに参加します。

出力形式はcardano-cli互換のJSONテキストエンベロープです。

> ⚠️ 以下のパスを調整してください。

```bash
./bursa cert committee-hot-auth \
    --cold-vkey /path/cc-cold.vkey \
    --hot-vkey /path/cc-hot.vkey \
    --out cc-hot-auth.cert
```

***

<a name="committee-cold-resign"></a>

## 委員会コールドキー辞任証明書を作成 (Conway)

この証明書は、コールドキーによって委員会メンバーを辞任させます。理由書を参照するために、オプションでアンカーURLとハッシュを提供できます。

出力形式はcardano-cli互換のJSONテキストエンベロープです。

> ⚠️ 以下のパスを調整してください。

### アンカーなしで辞任
```bash
  ./bursa cert committee-cold-resign \
    --cold-vkey /path/cc-cold.vkey \
    --out cc-resign.cert
```

### アンカー理由書付きで辞任
```bash
  ./bursa cert committee-cold-resign \
    --cold-vkey /path/cc-cold.vkey \
    --anchor-url https://example.com/resign.json \
    --anchor-hash abc123... \
    --out cc-resign.cert
```

***

その他のBursaコマンドを探索

> **Bursaコマンドカテゴリ**
> 1. [wallet](../003-commands) &nbsp; - Cardanoウォレットの管理に必要なウォレットおよびファイルを生成するコマンド
> 2. [api](../003-commands)  &emsp;&nbsp;&nbsp; - APIを実行するコマンド
> 3. [cert](#cert)   &emsp;&nbsp; - 各種Cardano証明書を生成するコマンド
> 4. [hash](../005-hash-commands)  &nbsp;&nbsp;&nbsp; - Cardanoで使用される暗号ハッシュを生成するコマンド
> 5. [script](../006-script-commands) &nbsp;&nbsp; - マルチシグネチャ操作用のコマンド
> 6. [address](../007-address-commands) - Cardanoアドレスを操作するコマンド
> 7. [key](../008-key-commands)  &emsp;&nbsp;&nbsp; - ニーモニックから個別の鍵を導出するコマンド

***
