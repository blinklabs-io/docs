---
title: 鍵コマンドラインガイド
description: ニーモニックから個別の鍵を導出するためのBursaコマンドラインガイド。
---

<a name="key"></a>

## 鍵を作成
Bursaは、ニーモニックから個別の鍵を導出するために使用できます。

<table>
  <tr>
    <th colspan="3" align="left">鍵の種類:</th>
  </tr>
<tr>
  <td><a href="#root">ルートキー</a></td>
  <td><a href="#account">アカウントキー</a></td>
  <td><a href="#payment">ペイメントキー</a></td>
</tr>
<tr>
  <td><a href="#stake">ステークキー</a></td>
  <td><a href="#pool-cold">プールコールドキー</a></td>
  <td><a href="#policy">ポリシーキー</a></td>
</tr>
<tr>
  <td><a href="#calidus">Calidusキー</a></td>
  <td><a href="#vrf">VRFキー</a></td>
  <td><a href="#kes">KESキーペア</a></td>
</tr>
<tr>
  <td><a href="#drep">DRepキー</a></td>
  <td><a href="#committee-cold">憲法委員会コールドキー</a></td>
  <td><a href="#committee-hot">憲法委員会ホットキー</a></td>
</tr>
<tr>
  <td><a href="#bls">Dijkstra BLSステークプール登録鍵</a></td>
</tr>
</table>

***

ニーモニックから個別の鍵を導出するためのBursaコマンドラインガイド。

`--mnemonic-file seed.txt` はファイルから、`--mnemonic-file -` は標準入力からニーモニックを読み取ります。`MNEMONIC` 環境変数も使用でき、他の入力がない場合は `seed.txt` を使用します。`MNEMONIC` が設定されている場合、`--mnemonic-file` より優先されます。`--mnemonic` 引数は他のローカルユーザーに見えるため非推奨です。任意の導出パスワードには `--password-file <path>` を使用してください。`-` は標準入力を読み取りますが、同じコマンドで両方の秘密情報を標準入力から読み取ることはできません。

以下の例では、署名鍵を明示的なファイルにcardano-cli JSONエンベロープ形式で保存します。ニーモニックから導出するコマンドでは、`--signing-key-file -` を指定すると秘密鍵をbech32形式で標準出力に書き込みます。署名鍵の出力先を省略できるのは、そのコマンドが `--verification-key-file` のみの出力に対応し、それを指定した場合だけです。rootとaccountでは署名鍵の出力先が必須です。`--signing-key-file -` と `--verification-key-file` は併用できません。

> 鍵はCardano CIP標準に従って導出されます。ファイル出力にはcardano-cliエンベロープを使用し、明示的に指定した標準出力にはbech32を使用します。
>
> **鍵の種類別の導出パス:**
> -  CIP-1852: root, account, payment, stake (m/1852'/1815'/...)
> -  CIP-1853: pool-cold (m/1853'/1815'/...)
> -  CIP-1855: policy (m/1855'/1815'/...)
> -  CIP-0105: drep, committee-cold, committee-hot (m/1852'/1815'/account'/role/...)
> -  CIP-88/151: calidus (m/1852'/1815'/account'/0/index, SPO認証)

***

### 署名鍵ファイル形式

HDパスから導出した署名鍵をエクスポートすると、Bursaは拡張Ed25519-BIP32エンベロープに署名鍵を書き込みます。ルート、アカウント、ペイメント、ステーク、ガバナンス、ポリシー、マルチシグ、Calidusの署名鍵ファイルでは、`*_ExtendedSigningKeyShelley_ed25519_bip32`などのエンベロープタイプを使用し、`5880`で始まる128バイトのCBORを使用します。従来の非拡張ファイルは、`5820`で始まる32バイトのCBORを使用します。

プールコールド署名ファイルは例外です。新しいエクスポートでは、署名鍵エンベロープに `StakePoolSigningKey_ed25519`、検証鍵エンベロープに `StakePoolVerificationKey_ed25519` を使用します。読み込み時は従来の `StakePoolSigningKeyShelley_ed25519` と `StakePoolVerificationKeyShelley_ed25519` も受け付けますが、Bursaはこれらのファイルを自動的に書き換えません。エクスポートされたプールコールド検証鍵は、プールコールド署名シードから導出された標準Ed25519のアイデンティティであり、運用証明書はこのアイデンティティを使用します。オプションの拡張プールコールド表現でも、同じアイデンティティが保持されます。

秘密鍵ファイル（`.skey`）へのアクセスは所有者に限定します。Unixではグループまたはその他のユーザー向けの権限ビットを設定できません。Windowsでは所有者に限定した制限付きDACLが必要です。Bursaは安全でない秘密鍵ファイルを `ErrInsecureFileMode` により拒否します。ディレクトリにこの権限チェックで拒否された `.skey` ファイルしかない場合、Bursaはその権限エラーをディレクトリのエラーとして報告します。公開鍵の `.vkey` ファイルや運用証明書などの公開アーティファクトは公開鍵の読み込み経路を使用するため、この秘密鍵のアクセス権チェックの対象外です。

鍵ファイルを読み込むとき、Bursaは通常ファイルだけを受け付け、UnixのシンボリックリンクとWindowsの再解析ポイントを拒否します。Bursaは鍵入力のサイズを実装がサポートする最大値以内に制限し、その値を超える鍵ファイルを処理開始前に拒否します。公開鍵ファイルは公開鍵の読み込み経路で引き続き読み込めます。Bursaは秘密鍵マテリアルを実際に読み込む場合にだけ、上記の所有者専用権限チェックを適用します。

非拡張タイプを宣言する従来のHD導出署名鍵ファイルを、`type`フィールドだけ変更して修復しないでください。Bursaはこれらのファイルを自動的に書き換えません。元のニーモニックから署名鍵ファイルと検証鍵ファイルを同時に再生成し、署名前に生成されたアドレス、鍵ハッシュ、または現在使用しているその他のアイデンティティと比較してください。

<a name="root"></a>

### ルートキー
ルートキーは、他のすべての鍵が導出されるマスターキーです。
`--signing-key-file -` を指定すると、標準出力はbech32形式 (root_xskプレフィックス) になります。
```bash
./bursa key root --mnemonic-file seed.txt --signing-key-file root.skey
```

**署名鍵ファイル付きルートキーの例:**

> ⚠️ 以下のパスを調整してください。

```bash
./bursa key root --mnemonic-file seed.txt --signing-key-file /path/root.skey
```

***

<a name="account"></a>

### アカウントキー
アカウントキーはCIP-1852のパスに従います: m/1852'/1815'/account'
`--signing-key-file -` を指定すると、標準出力はbech32形式 (acct_xskプレフィックス) になります。

```bash
./bursa key account --mnemonic-file seed.txt --index 0 --signing-key-file account.skey
```

***

<a name="payment"></a>

### ペイメントキー
ペイメントキーはCIP-1852のパスに従います: m/1852'/1815'/account'/0/index
`--signing-key-file -` を指定すると、標準出力はbech32形式 (addr_xskプレフィックス) になります。
```bash
./bursa key payment --mnemonic-file seed.txt --account-index 0 --index 0 --signing-key-file payment.skey --verification-key-file payment.vkey
```

***

<a name="stake"></a>

### ステークキー
ステークキーはCIP-1852のパスに従います: m/1852'/1815'/account'/2/index
`--signing-key-file -` を指定すると、標準出力はbech32形式 (stake_xskプレフィックス) になります。
```bash
./bursa key stake --mnemonic-file seed.txt --account-index 0 --index 0 --signing-key-file stake.skey --verification-key-file stake.vkey
```

***

<a name="pool-cold"></a>

### プールコールドキー
プールコールドキーはCIP-1853のパスに従います: m/1853'/1815'/0'/index'
これらの鍵は、ステークプールオペレーターの長期的なアイデンティティ鍵として使用されます。
`--signing-key-file -` を指定すると、標準出力はbech32形式 (pool_xskプレフィックス) になります。
```bash
./bursa key pool-cold --mnemonic-file seed.txt --index 0 --signing-key-file pool-cold.skey --verification-key-file pool-cold.vkey
```

***

<a name="policy"></a>

### ポリシーキー
ポリシーキーはCIP-1855のパスに従います: m/1855'/1815'/policy_ix'
これらの鍵は、ネイティブアセットのミント/バーンポリシーに使用されます。
`--signing-key-file -` を指定すると、標準出力はbech32形式 (policy_xskプレフィックス) になります。
```bash
./bursa key policy --mnemonic-file seed.txt --index 0 --signing-key-file policy.skey --verification-key-file policy.vkey
```

***

<a name="calidus"></a>

### Calidusキー
CalidusキーはCIP-88/CIP-151で定義されたSPOオンチェーン認証ホットキーです。ペイメントキーと同じ導出パスを使用します:
m/1852'/1815'/account'/0/index

この鍵は機能的にはペイメントキーと同一ですが、SPOアイデンティティのために異なるbech32プレフィックス (calidus_xsk/calidus_xvk) と異なるcardano-cliテキストエンベロープタイプを使用します。

`--signing-key-file -` を指定すると、標準出力はbech32形式 (calidus_xskプレフィックス) になります。

```bash
./bursa key calidus --mnemonic-file seed.txt --account-index 0 --index 0 --signing-key-file calidus.skey --verification-key-file calidus.vkey
```

**鍵ファイル付きCalidusキーの例**

> ⚠️ 以下のパスを調整してください。

```bash
./bursa key calidus --mnemonic-file seed.txt --signing-key-file /path/calidus.skey --verification-key-file /path/calidus.vkey
```

***

<a name="vrf"></a>

### VRF (検証可能ランダム関数) キーペア
VRFキーは、Praosコンセンサスプロトコルにおけるリーダー選出のためにステークプールオペレーターによって使用されます。シードはニーモニックから決定論的に導出されるため、鍵を復元できます。

`--signing-key-file -` を指定すると、標準出力には、署名鍵 (vrf_sk) と検証鍵 (vrf_vk) の両方がbech32形式で含まれます。

```bash
./bursa key vrf --mnemonic-file seed.txt --index 0 --signing-key-file vrf.skey --verification-key-file vrf.vkey
```

**鍵ファイル付きVRFの例**

> ⚠️ 以下のパスを調整してください。

```bash
./bursa key vrf --mnemonic-file seed.txt --signing-key-file /path/vrf.skey --verification-key-file /path/vrf.vkey
```

VRF検証鍵は期待される長さを満たす必要があります。VRF署名鍵には、シード単体またはシードと公開鍵を連結した形式を使用できます。シードと公開鍵の形式では、Bursaがシードから導出した公開鍵と埋め込まれた公開鍵を照合します。Bursaは長さが不正な鍵やシードと公開鍵が一致しない鍵を拒否し、エンベロープを生成しません。

***

<a name="kes"></a>

### KESキーペア
KESキーは、Praosコンセンサスプロトコルにおけるブロック署名のためにステークプールオペレーターによって使用されます。KESは、現在の鍵が侵害されても過去の署名は侵害されない、フォワードセキュアな署名を提供します。

この実装ではCardanoの深さ6を使用し、64の時間期間を提供します。
シードはニーモニックから決定論的に導出されるため、鍵を復元できます。

`--signing-key-file -` を指定すると、標準出力には、署名鍵 (kes_sk、608バイト) と検証鍵 (kes_vk、32バイト) の両方がbech32形式で含まれます。

```bash
./bursa key kes --mnemonic-file seed.txt --index 0 --signing-key-file kes.skey --verification-key-file kes.vkey
```

**鍵ファイル付きKESキーの例**

> ⚠️ 以下のパスを調整してください。

```bash
./bursa key kes --mnemonic-file seed.txt --signing-key-file /path/kes.skey --verification-key-file /path/kes.vkey
```

KES検証鍵は期待される長さを満たす必要があります。KES署名鍵はCardano KES depthとKES secret-key sizeの要件を満たす必要があります。Bursaは長さが不正な検証鍵、無効なKES depth、または無効なKES secret-key sizeを含む鍵を拒否し、エンベロープを生成しません。

***

<a name="drep"></a>

### DRepキー
DRepキーはCIP-0105のパスに従います: m/1852'/1815'/account'/3/index
これらの鍵は、Delegated Representativeとしてのガバナンス参加に使用されます。
`--signing-key-file -` を指定すると、標準出力はbech32形式 (drep_xskプレフィックス) になります。

```bash
./bursa key drep --mnemonic-file seed.txt --account-index 0 --index 0 --signing-key-file drep.skey --verification-key-file drep.vkey
```

**鍵ファイル付きDRepキーの例**

> ⚠️ 以下のパスを調整してください。

```bash
./bursa key drep --mnemonic-file seed.txt --signing-key-file /path/drep.skey --verification-key-file /path/drep.vkey
```

***

<a name="committee-cold"></a>

### 憲法委員会コールドキー
委員会コールドキーはCIP-0105のパスに従います: m/1852'/1815'/account'/4/index
これらの鍵は、憲法委員会のメンバーシップ (長期的なアイデンティティ) に使用されます。
`--signing-key-file -` を指定すると、標準出力はbech32形式 (cc_cold_xskプレフィックス) になります。

```bash
./bursa key committee-cold --mnemonic-file seed.txt --account-index 0 --index 0 --signing-key-file committee-cold.skey --verification-key-file committee-cold.vkey
```

**鍵ファイル付き憲法委員会コールドキーの例**

> ⚠️ 以下のパスを調整してください。

```bash
./bursa key committee-cold --mnemonic-file seed.txt --signing-key-file /path/committee-cold.skey --verification-key-file /path/committee-cold.vkey
```

***

<a name="committee-hot"></a>

### 憲法委員会ホットキー
委員会ホットキーはCIP-0105のパスに従います: m/1852'/1815'/account'/5/index
これらの鍵は、憲法委員会の投票 (運用鍵) に使用されます。
`--signing-key-file -` を指定すると、標準出力はbech32形式 (cc_hot_xskプレフィックス) になります。

```bash
./bursa key committee-hot --mnemonic-file seed.txt --account-index 0 --index 0 --signing-key-file committee-hot.skey --verification-key-file committee-hot.vkey
```

**鍵ファイル付き憲法委員会ホットキーの例**

> ⚠️ 以下のパスを調整してください。

```bash
./bursa key committee-hot --mnemonic-file seed.txt --signing-key-file /path/committee-hot.skey --verification-key-file /path/committee-hot.vkey
```

***

<a name="bls"></a>

### Dijkstra BLSステークプール登録鍵
`bursa key bls` は、Dijkstra時代のLeiosおよびPerasでステークプールを登録するためのBLS12-381 MinSig鍵と所有証明を生成します。このコマンドは、他の鍵コマンドで使用するニーモニックやニーモニックファイルを読み取らず、暗号学的に安全な乱数から新しい鍵の素材を生成します。

```bash
./bursa key bls --signing-key-file /path/to/bls.skey
```

3つの出力先を指定する例:

```bash
./bursa key bls --signing-key-file bls.skey --verification-key-file bls.vkey --output-file bls-registration.json
```

`--signing-key-file` は必須です。`--verification-key-file` と `--output-file` は任意です。

- `--signing-key-file` は、BLS署名鍵を書き込むファイルのパスです。Bursaは署名鍵を`cardano-cli`互換の`BlsSigningKey_bls12-381-BLS-Signature-Minimal-Signature-Size`エンベロープに格納します。
- `--verification-key-file` は、BLS検証鍵を書き込むファイルのパスです。指定した場合、Bursaは検証鍵を`cardano-cli`互換の`BlsVerificationKey_bls12-381-BLS-Signature-Minimal-Signature-Size`エンベロープに格納します。
- `--output-file` は、登録用JSONを書き込むファイルのパスです。省略すると、Bursaは登録用JSONを標準出力に書き込みます。

登録用JSONは次のフィールドを出力します。Bursaは出力前に生成した所有証明を検証します。

- `publicKey`: 96バイトの公開鍵を表す小文字の16進数文字列
- `possessionProof`: 48バイトの所有証明を表す小文字の16進数文字列

Bursaは指定した各生成先ファイルを、所有者だけが読み書きできる権限で作成します。`--signing-key-file` のファイルはステークプールの認証情報として厳重に保護し、安全なバックアップを作成してください。

`--signing-key-file`、`--verification-key-file`、`--output-file` に指定する3つのパスは、同じ生成先を指してはいけません。Bursaは正規化したパスが一致する場合や、シンボリックリンクをたどった結果が同じファイルになる場合に、パスの衝突を拒否します。

***

その他のBursaコマンドを探索

> **Bursaコマンドカテゴリ**
> 1. [wallet](../003-commands) &nbsp; - Cardanoウォレットの管理に必要なウォレットおよびファイルを生成するコマンド
> 2. [api](../003-commands)  &emsp;&nbsp;&nbsp; - APIを実行するコマンド
> 3. [kes-agent](../003-commands#kes-agent) &emsp;&nbsp;&nbsp; - KESエージェントを実行するコマンド
> 4. [cert](../004-cert-commands)   &emsp;&nbsp; - 各種Cardano証明書を生成するコマンド
> 5. [hash](../005-hash-commands)  &nbsp;&nbsp;&nbsp; - Cardanoで使用される暗号ハッシュを生成するコマンド
> 6. [script](../006-script-commands) &nbsp;&nbsp; - マルチシグネチャ操作用のコマンド
> 7. [address](../007-address-commands) - Cardanoアドレスを操作するコマンド
> 8. [key](#key)  &emsp;&nbsp;&nbsp; - ニーモニックから個別の鍵を導出するコマンド
> 9. [tx](../003-commands#tx) - トランザクションへの署名とウィットネスの組み立て用コマンド
> 10. [sign](../003-commands#sign) - CIP-8データ署名用コマンド
> 11. [signer](../003-commands#signer) - リモート署名サービスを実行するコマンド

***


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
