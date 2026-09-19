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
</table>

***

ニーモニックから個別の鍵を導出するためのBursaコマンドラインガイド。

**ニーモニックは以下の方法で提供できます:**
  1. --mnemonicフラグ
  2. MNEMONIC環境変数
  3. --mnemonic-fileフラグ
  4. デフォルトファイル "seed.txt"
<br>

> 鍵はCardano CIP標準に従って導出され、cardano-cliやその他のツールで使用するのに適したbech32形式で出力されます。
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
出力は、--signing-key-fileが指定されていない限り、bech32形式 (root_xskプレフィックス) です。
```bash
./bursa key root --mnemonic "word1 word2 ..."
```

**署名鍵ファイル付きルートキーの例:**

> ⚠️ 以下のパスを調整してください。

```bash
./bursa key root --signing-key-file /path/root.skey
```

***

<a name="account"></a>

### アカウントキー
アカウントキーはCIP-1852のパスに従います: m/1852'/1815'/account'
出力は、--signing-key-fileが指定されていない限り、bech32形式 (acct_xskプレフィックス) です。

```bash
./bursa key account --mnemonic "word1 word2 ..." --index 0
```

***

<a name="payment"></a>

### ペイメントキー
ペイメントキーはCIP-1852のパスに従います: m/1852'/1815'/account'/0/index
出力は、鍵ファイルが指定されていない限り、bech32形式 (addr_xskプレフィックス) です。
```bash
./bursa key payment --mnemonic "word1 word2 ..." --account-index 0 --index 0
```

***

<a name="stake"></a>

### ステークキー
ステークキーはCIP-1852のパスに従います: m/1852'/1815'/account'/2/index
出力は、鍵ファイルが指定されていない限り、bech32形式 (stake_xskプレフィックス) です。
```bash
./bursa key stake --mnemonic "word1 word2 ..." --account-index 0 --index 0
```

***

<a name="pool-cold"></a>

### プールコールドキー
プールコールドキーはCIP-1853のパスに従います: m/1853'/1815'/0'/index'
これらの鍵は、ステークプールオペレーターの長期的なアイデンティティ鍵として使用されます。
出力は、鍵ファイルが指定されていない限り、bech32形式 (pool_xskプレフィックス) です。
```bash
./bursa key pool-cold --mnemonic "word1 word2 ..." --index 0
```

***

<a name="policy"></a>

### ポリシーキー
ポリシーキーはCIP-1855のパスに従います: m/1855'/1815'/policy_ix'
これらの鍵は、ネイティブアセットのミント/バーンポリシーに使用されます。
出力は、鍵ファイルが指定されていない限り、bech32形式 (policy_xskプレフィックス) です。
```bash
./bursa key policy --mnemonic "word1 word2 ..." --index 0
```

***

<a name="calidus"></a>

### Calidusキー
CalidusキーはCIP-88/CIP-151で定義されたSPOオンチェーン認証ホットキーです。ペイメントキーと同じ導出パスを使用します:
m/1852'/1815'/account'/0/index

この鍵は機能的にはペイメントキーと同一ですが、SPOアイデンティティのために異なるbech32プレフィックス (calidus_xsk/calidus_xvk) と異なるcardano-cliテキストエンベロープタイプを使用します。

出力は、鍵ファイルが指定されていない限り、bech32形式 (calidus_xskプレフィックス) です。

```bash
./bursa key calidus --mnemonic "word1 word2 ..." --account-index 0 --index 0
```

**鍵ファイル付きCalidusキーの例**

> ⚠️ 以下のパスを調整してください。

```bash
./bursa key calidus --signing-key-file /path/calidus.skey --verification-key-file /path/calidus.vkey
```

***

<a name="vrf"></a>

### VRF (検証可能ランダム関数) キーペア
VRFキーは、Praosコンセンサスプロトコルにおけるリーダー選出のためにステークプールオペレーターによって使用されます。シードはニーモニックから決定論的に導出されるため、鍵を復元できます。

出力には、鍵ファイルが指定されていない限り、署名鍵 (vrf_sk) と検証鍵 (vrf_vk) の両方がbech32形式で含まれます。

```bash
./bursa key vrf --mnemonic "word1 word2 ..." --index 0
```

**鍵ファイル付きVRFの例**

> ⚠️ 以下のパスを調整してください。

```bash
./bursa key vrf --signing-key-file /path/vrf.skey --verification-key-file /path/vrf.vkey
```

VRF検証鍵は期待される長さを満たす必要があります。VRF署名鍵には、シード単体またはシードと公開鍵を連結した形式を使用できます。シードと公開鍵の形式では、Bursaがシードから導出した公開鍵と埋め込まれた公開鍵を照合します。Bursaは長さが不正な鍵やシードと公開鍵が一致しない鍵を拒否し、エンベロープを生成しません。

***

<a name="kes"></a>

### KESキーペア
KESキーは、Praosコンセンサスプロトコルにおけるブロック署名のためにステークプールオペレーターによって使用されます。KESは、現在の鍵が侵害されても過去の署名は侵害されない、フォワードセキュアな署名を提供します。

この実装ではCardanoの深さ6を使用し、64の時間期間を提供します。
シードはニーモニックから決定論的に導出されるため、鍵を復元できます。

出力には、鍵ファイルが指定されていない限り、署名鍵 (kes_sk、608バイト) と検証鍵 (kes_vk、32バイト) の両方がbech32形式で含まれます。

```bash
./bursa key kes --mnemonic "word1 word2 ..." --index 0
```

**鍵ファイル付きKESキーの例**

> ⚠️ 以下のパスを調整してください。

```bash
./bursa key kes --signing-key-file /path/kes.skey --verification-key-file /path/kes.vkey
```

KES検証鍵は期待される長さを満たす必要があります。KES署名鍵はCardano KES depthとKES secret-key sizeの要件を満たす必要があります。Bursaは長さが不正な検証鍵、無効なKES depth、または無効なKES secret-key sizeを含む鍵を拒否し、エンベロープを生成しません。

***

<a name="drep"></a>

### DRepキー
DRepキーはCIP-0105のパスに従います: m/1852'/1815'/account'/3/index
これらの鍵は、Delegated Representativeとしてのガバナンス参加に使用されます。
出力は、鍵ファイルが指定されていない限り、bech32形式 (drep_xskプレフィックス) です。

```bash
./bursa key drep --mnemonic "word1 word2 ..." --account-index 0 --index 0
```

**鍵ファイル付きDRepキーの例**

> ⚠️ 以下のパスを調整してください。

```bash
./bursa key drep --signing-key-file /path/drep.skey --verification-key-file /path/drep.vkey
```

***

<a name="committee-cold"></a>

### 憲法委員会コールドキー
委員会コールドキーはCIP-0105のパスに従います: m/1852'/1815'/account'/4/index
これらの鍵は、憲法委員会のメンバーシップ (長期的なアイデンティティ) に使用されます。
出力は、鍵ファイルが指定されていない限り、bech32形式 (cc_cold_xskプレフィックス) です。

```bash
./bursa key committee-cold --mnemonic "word1 word2 ..." --account-index 0 --index 0
```

**鍵ファイル付き憲法委員会コールドキーの例**

> ⚠️ 以下のパスを調整してください。

```bash
./bursa key committee-cold --signing-key-file /path/committee-cold.skey --verification-key-file /path/committee-cold.vkey
```

***

<a name="committee-hot"></a>

### 憲法委員会ホットキー
委員会ホットキーはCIP-0105のパスに従います: m/1852'/1815'/account'/5/index
これらの鍵は、憲法委員会の投票 (運用鍵) に使用されます。
出力は、鍵ファイルが指定されていない限り、bech32形式 (cc_hot_xskプレフィックス) です。

```bash
./bursa key committee-hot --mnemonic "word1 word2 ..." --account-index 0 --index 0
```

**鍵ファイル付き憲法委員会ホットキーの例**

> ⚠️ 以下のパスを調整してください。

```bash
./bursa key committee-hot --signing-key-file /path/committee-hot.skey --verification-key-file /path/committee-hot.vkey
```

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

***


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
