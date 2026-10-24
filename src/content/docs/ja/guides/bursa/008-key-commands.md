---
title: 鍵のコマンドラインガイド
description: ニーモニックから個別の鍵を導出するための Bursa コマンドラインガイド。
---

<a name="key"></a>

<a id="create-keys"></a>

## 鍵の作成

Bursa はニーモニックから個別の鍵を導出できます。

| 鍵の種類 | 鍵の種類 | 鍵の種類 |
| --- | --- | --- |
| [ルート鍵](#root) | [アカウント鍵](#account) | [支払い鍵](#payment) |
| [ステーク鍵](#stake) | [プールのコールド鍵](#pool-cold) | [ポリシー鍵](#policy) |
| [Calidus 鍵](#calidus) | [VRF 鍵](#vrf) | [KES 鍵ペア](#kes) |
| [DRep 鍵](#drep) | [憲法委員会のコールド鍵](#committee-cold) | [憲法委員会のホット鍵](#committee-hot) |
| [Dijkstra BLS 鍵](#bls) | | |

ニーモニックから個別の鍵を導出するための Bursa コマンドラインガイドです。

`--mnemonic-file seed.txt` はファイルから、`--mnemonic-file -` は標準入力からニーモニックを読み取ります。ニーモニックの入力元は、非推奨の `--mnemonic`、`MNEMONIC` 環境変数、`--mnemonic-file`、デフォルトの `seed.txt` ファイルの順で確認されます。`--mnemonic` と `--password` 引数は他のローカルユーザーに見えるため非推奨です。代わりに `--mnemonic-file` と `--password-file` を使用してください。任意の導出パスワードには `--password-file <path>` を使用してください。`-` は標準入力を読み取りますが、同じコマンドで両方の秘密情報を標準入力から読み取ることはできません。

以下の例では、署名鍵を明示的なファイルにcardano-cli JSONエンベロープ形式で保存します。ニーモニックから導出するコマンドでは、`--signing-key-file -` を指定すると秘密鍵をbech32形式で標準出力に書き込みます。署名鍵の出力先を省略できるのは、そのコマンドが `--verification-key-file` のみの出力に対応し、それを指定した場合だけです。rootとaccountでは署名鍵の出力先が必須です。`--signing-key-file -` と `--verification-key-file` は併用できません。

> 鍵はCardano CIP標準に従って導出されます。ファイル出力にはcardano-cliエンベロープを使用し、明示的に指定した標準出力にはbech32を使用します。
>
> **鍵の種類ごとの導出パス:**
> - CIP-1852: ルート、アカウント、支払い、ステーク（m/1852'/1815'/...）
> - CIP-1853: プールのコールド鍵（m/1853'/1815'/...）
> - CIP-1855: ポリシー（m/1855'/1815'/...）
> - CIP-0105: DRep、委員会のコールド鍵とホット鍵（m/1852'/1815'/account'/role/...）
> - CIP-88/151: Calidus（m/1852'/1815'/account'/0/index、SPO 認証）

<a id="signing-key-file-format"></a>

## 署名鍵ファイルの形式

Bursa が HD パス由来の署名鍵をエクスポートする場合、拡張 Ed25519-BIP32 エンベロープを書き出します。ルート、アカウント、支払い、ステーク、ガバナンス、ポリシー、マルチシグ、Calidus の署名ファイルには、`*_ExtendedSigningKeyShelley_ed25519_bip32` などの型と、`5880` で始まる 128 バイトの CBOR を使用します。従来の非拡張ファイルは、`5820` で始まる 32 バイトの CBOR を使用します。

プールのコールド署名ファイルは例外です。新しいエクスポートは、型 `StakePoolSigningKey_ed25519` の標準の非拡張 Ed25519 エンベロープを使用し、対応する検証鍵には `StakePoolVerificationKey_ed25519` を使用します。読み込み時には従来の `StakePoolSigningKeyShelley_ed25519` と `StakePoolVerificationKeyShelley_ed25519` も受け入れ、ファイルは変更しません。プールのコールド署名シードは、プール登録と運用証明書で使用する標準 Ed25519 識別子としてエクスポートされた検証鍵を生成します。任意の拡張形式も、この同じプール識別子を維持します。

Bursa は通常ファイルからのみ鍵を読み込みます。Unix ではシンボリックリンク、Windows では再解析ポイントの入力を拒否します。鍵ファイルは対応する最大サイズに制限し、大きすぎるファイルは処理前に拒否します。秘密鍵ファイル（`.skey`）は所有者のみがアクセスできる必要があります。Unix の権限にグループやその他のビットを含めることはできず、Windows では所有者に限定した DACL が必要です。この権限検査は秘密情報を読み込む場合のみ適用され、不適切なファイルには `ErrInsecureFileMode` を返します。ディレクトリ内のすべての `.skey` ファイルがこの検査に失敗する場合、その権限上の理由をディレクトリについて報告します。`.vkey` や運用証明書などの公開アーティファクトは、公開鍵読み込み経路で引き続き読み取ることができ、この秘密鍵の権限検査は適用されません。

非拡張型を宣言する従来の HD 由来の署名ファイルを、`type` フィールドだけ変更して修復してはいけません。Bursa はそれらを自動で書き換えません。元のニーモニックから署名鍵と検証鍵のファイルを一緒に再生成し、署名前に、得られたアドレス、鍵ハッシュ、その他の既存の識別子を比較してください。

<a name="root"></a>

<a id="root-key"></a>

### ルート鍵

ルート鍵は、ほかのすべての鍵の導出元となるマスター鍵です。`--signing-key-file -` を指定すると、bech32 形式（root_xsk 接頭辞）で標準出力に出力します。

```
./bursa key root --mnemonic-file seed.txt --signing-key-file root.skey
```

**ルート鍵をファイルに出力する例**

> ⚠️ 以下のパスを調整してください。

```
./bursa key root --mnemonic-file seed.txt --signing-key-file /path/root.skey
```

***

<a name="account"></a>

<a id="account-key"></a>

### アカウント鍵

アカウント鍵は CIP-1852 のパス m/1852'/1815'/account' に従います。`--signing-key-file -` を指定すると、bech32 形式（acct_xsk 接頭辞）で標準出力に出力します。

```
./bursa key account --mnemonic-file seed.txt --index 0 --signing-key-file account.skey
```

***

<a name="payment"></a>

<a id="payment-key"></a>

### 支払い鍵

支払い鍵は CIP-1852 のパス m/1852'/1815'/account'/0/index に従います。`--signing-key-file -` を指定すると、bech32 形式（addr_xsk 接頭辞）で標準出力に出力します。

```
./bursa key payment --mnemonic-file seed.txt --account-index 0 --index 0 --signing-key-file payment.skey --verification-key-file payment.vkey
```

***

<a name="stake"></a>

<a id="stake-key"></a>

### ステーク鍵

ステーク鍵は CIP-1852 のパス m/1852'/1815'/account'/2/index に従います。`--signing-key-file -` を指定すると、bech32 形式（stake_xsk 接頭辞）で標準出力に出力します。

```
./bursa key stake --mnemonic-file seed.txt --account-index 0 --index 0 --signing-key-file stake.skey --verification-key-file stake.vkey
```

***

<a name="pool-cold"></a>

<a id="pool-cold-key"></a>

### プールのコールド鍵

プールのコールド鍵は CIP-1853 のパス m/1853'/1815'/0'/index' に従い、ステークプールオペレーターの長期的な識別鍵として使用します。`--signing-key-file -` を指定すると、bech32 形式（pool_xsk 接頭辞）で標準出力に出力します。

```
./bursa key pool-cold --mnemonic-file seed.txt --index 0 --signing-key-file pool-cold.skey --verification-key-file pool-cold.vkey
```

***

<a name="policy"></a>

<a id="policy-key"></a>

### ポリシー鍵

ポリシー鍵は CIP-1855 のパス m/1855'/1815'/policy_ix' に従い、ネイティブアセットの発行と焼却のポリシーに使用します。`--signing-key-file -` を指定すると、bech32 形式（policy_xsk 接頭辞）で標準出力に出力します。

```
./bursa key policy --mnemonic-file seed.txt --index 0 --signing-key-file policy.skey --verification-key-file policy.vkey
```

***

<a name="calidus"></a>

<a id="calidus-key"></a>

### Calidus 鍵

Calidus 鍵は、CIP-88/CIP-151 が定義する SPO のオンチェーン認証用ホット鍵です。支払い鍵と同じ導出パス m/1852'/1815'/account'/0/index を使用します。機能的には支払い鍵と同じですが、SPO の識別用に異なる bech32 接頭辞（calidus_xsk/calidus_xvk）と cardano-cli テキストエンベロープ型を使用します。`--signing-key-file -` を指定すると、bech32 形式（calidus_xsk 接頭辞）で標準出力に出力します。

```
./bursa key calidus --mnemonic-file seed.txt --account-index 0 --index 0 --signing-key-file calidus.skey --verification-key-file calidus.vkey
```

**Calidus 鍵をファイルに出力する例**

> ⚠️ 以下のパスを調整してください。

```
./bursa key calidus --mnemonic-file seed.txt --signing-key-file /path/calidus.skey --verification-key-file /path/calidus.vkey
```

***

<a name="vrf"></a>

<a id="vrf-verifiable-random-function-key-pair"></a>

### VRF（検証可能ランダム関数）鍵ペア

VRF 鍵は、Praos コンセンサスのリーダー選出でステークプールオペレーターが使用します。シードはニーモニックから決定的に導出するため、鍵を復元できます。`--signing-key-file -` を指定すると、署名鍵（vrf_sk）と検証鍵（vrf_vk）の両方を bech32 形式で標準出力に出力します。

```
./bursa key vrf --mnemonic-file seed.txt --index 0 --signing-key-file vrf.skey --verification-key-file vrf.vkey
```

**VRF（検証可能ランダム関数）鍵ペアをファイルに出力する例**

> ⚠️ 以下のパスを調整してください。

```
./bursa key vrf --mnemonic-file seed.txt --signing-key-file /path/vrf.skey --verification-key-file /path/vrf.vkey
```

***

<a name="kes"></a>

<a id="kes-key-pair"></a>

### KES 鍵ペア

KES 鍵は、Praos コンセンサスでブロックに署名するために使用します。現在の鍵が漏洩しても過去の署名の安全性が損なわれない、前方安全な署名を提供します。この実装は Cardano の深さ 6 を使用し、64 期間に対応します。シードはニーモニックから決定的に導出するため、鍵を復元できます。`--signing-key-file -` を指定すると、署名鍵（kes_sk、608 バイト）と検証鍵（kes_vk、32 バイト）の両方を bech32 形式で標準出力に出力します。

```
./bursa key kes --mnemonic-file seed.txt --index 0 --signing-key-file kes.skey --verification-key-file kes.vkey
```

**KES 鍵ペアをファイルに出力する例**

> ⚠️ 以下のパスを調整してください。

```
./bursa key kes --mnemonic-file seed.txt --signing-key-file /path/kes.skey --verification-key-file /path/kes.vkey
```

***

<a id="vrf-and-kes-key-validation"></a>

### VRF と KES の鍵検証

Bursa は VRF と KES の鍵データを、エクスポートまたは読み込みの前に検証します。VRF 検証鍵は所定の長さが必要です。VRF 署名データは、対応するシード形式またはシードと公開鍵の形式を使用し、後者では埋め込まれた公開鍵がシードと一致する必要があります。KES 検証鍵も所定の長さが必要で、KES 署名鍵は Cardano の KES 深さと所定の秘密鍵サイズを使用する必要があります。不正な長さ、VRF シードと公開鍵の不一致、不正な KES 深さ、秘密鍵サイズを検出すると、エンベロープを生成せず拒否します。

<a name="drep"></a>

<a id="drep-key"></a>

### DRep 鍵

DRep 鍵は CIP-0105 のパス m/1852'/1815'/account'/3/index に従い、委任代表者としてのガバナンス参加に使用します。`--signing-key-file -` を指定すると、bech32 形式（drep_xsk 接頭辞）で標準出力に出力します。

```
./bursa key drep --mnemonic-file seed.txt --account-index 0 --index 0 --signing-key-file drep.skey --verification-key-file drep.vkey
```

**DRep 鍵をファイルに出力する例**

> ⚠️ 以下のパスを調整してください。

```
./bursa key drep --mnemonic-file seed.txt --signing-key-file /path/drep.skey --verification-key-file /path/drep.vkey
```

***

<a name="committee-cold"></a>

<a id="constitutional-committee-cold-key"></a>

### 憲法委員会のコールド鍵

委員会のコールド鍵は CIP-0105 のパス m/1852'/1815'/account'/4/index に従い、憲法委員会のメンバーシップ（長期的な識別子）に使用します。`--signing-key-file -` を指定すると、bech32 形式（cc_cold_xsk 接頭辞）で標準出力に出力します。

```
./bursa key committee-cold --mnemonic-file seed.txt --account-index 0 --index 0 --signing-key-file committee-cold.skey --verification-key-file committee-cold.vkey
```

**憲法委員会のコールド鍵をファイルに出力する例**

> ⚠️ 以下のパスを調整してください。

```
./bursa key committee-cold --mnemonic-file seed.txt --signing-key-file /path/committee-cold.skey --verification-key-file /path/committee-cold.vkey
```

***

<a name="committee-hot"></a>

<a id="constitutional-committee-hot-key"></a>

### 憲法委員会のホット鍵

委員会のホット鍵は CIP-0105 のパス m/1852'/1815'/account'/5/index に従い、憲法委員会の投票（運用鍵）に使用します。`--signing-key-file -` を指定すると、bech32 形式（cc_hot_xsk 接頭辞）で標準出力に出力します。

```
./bursa key committee-hot --mnemonic-file seed.txt --account-index 0 --index 0 --signing-key-file committee-hot.skey --verification-key-file committee-hot.vkey
```

**憲法委員会のホット鍵をファイルに出力する例**

> ⚠️ 以下のパスを調整してください。

```
./bursa key committee-hot --mnemonic-file seed.txt --signing-key-file /path/committee-hot.skey --verification-key-file /path/committee-hot.vkey
```

***

<a name="bls"></a>

<a id="dijkstra-bls-key-and-registration-material"></a>

### Dijkstra の BLS 鍵と登録用データ

BLS コマンドは、Dijkstra 時代の Leios と Peras のステークプール登録に用いる、暗号学的にランダムな BLS12-381 MinSig データを生成します。ほかの鍵コマンドで説明したニーモニックの入力元は使用しません。

`--signing-key-file <path>` は必須です。`--verification-key-file` と `--output-file` は任意です。

- `--signing-key-file <path>` は署名鍵をファイルに書き出します。コマンドが署名鍵を表示することはありません。
- `--verification-key-file` は検証鍵をファイルに書き出します。
- `--output-file` は登録 JSON をファイルに書き出します。省略すると、登録 JSON を標準出力に表示します。

```bash
./bursa key bls --signing-key-file bls.skey --verification-key-file bls.vkey --output-file bls-registration.json
```

登録 JSON のフィールドは次の 2 つだけです。

- `publicKey`: 96 バイトの公開鍵を小文字の 16 進数文字列で表します。
- `possessionProof`: 48 バイトの所有証明を小文字の 16 進数文字列で表します。

Bursa は登録出力の生成前に、生成した証明を検証します。必須の署名鍵ファイルは cardano-cli エンベロープ型 `BlsSigningKey_bls12-381-BLS-Signature-Minimal-Signature-Size`、任意の検証鍵ファイルは `BlsVerificationKey_bls12-381-BLS-Signature-Minimal-Signature-Size` を使用します。すべての生成ファイルを所有者のみの権限で書き出します。署名鍵ファイルはステークプールの資格情報として保護し、バックアップしてください。

3 つの出力先パスは異なる必要があります。直接のパス衝突や、正規化またはシンボリックリンクによって同じファイルを指すパスは拒否されます。

***

ほかの Bursa コマンドも参照してください。

> **Bursa のコマンド分類**
> 1. [wallet](../003-commands) - ウォレットと、その管理に必要なファイルの生成
> 2. [api](../003-commands) - API の実行
> 3. [kes-agent](../003-commands#kes-agent) - KES エージェントの実行
> 4. [cert](../004-cert-commands) - Cardano 証明書の生成
> 5. [hash](../005-hash-commands) - Cardano の暗号学的ハッシュの生成
> 6. [script](../006-script-commands) - マルチシグ操作
> 7. [address](../007-address-commands) - Cardano アドレスの操作
> 8. [key](#key) - ニーモニックから個別の鍵を導出
> 9. [tx](../003-commands#tx) - オフライントランザクション操作
> 10. [sign](../003-commands#sign) - CIP-8/CIP-30メッセージの署名と検証
> 11. [signer](../003-commands#signer) - リモート署名サービス

***


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
