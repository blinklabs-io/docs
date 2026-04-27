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
> 3. [cert](../004-cert-commands)   &emsp;&nbsp; - 各種Cardano証明書を生成するコマンド
> 4. [hash](../005-hash-commands)  &nbsp;&nbsp;&nbsp; - Cardanoで使用される暗号ハッシュを生成するコマンド
> 5. [script](../006-script-commands) &nbsp;&nbsp; - マルチシグネチャ操作用のコマンド
> 6. [address](../007-address-commands) - Cardanoアドレスを操作するコマンド
> 7. [key](#key)  &emsp;&nbsp;&nbsp; - ニーモニックから個別の鍵を導出するコマンド

***
