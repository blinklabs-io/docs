---
title: フィルターとガバナンスリファレンス
description: Adder のフィルター、設定マッピング、ガバナンスイベントを説明します。
---

# フィルターとガバナンスリファレンス

## 概要

このリファレンスでは、Adder の Cardano フィルター、CLI・環境変数・YAML 設定の対応、`input.governance` イベントのデータ形式を説明します。フィルターの組み合わせやガバナンスデータの照合条件を確認して、必要なイベントだけを出力する設定を作成します。

## CLI フィルター

Adder は次のフィルターを提供します。

| フラグ | 照合対象 | 適用されるイベントタイプ |
| --- | --- | --- |
| `--filter-type` | イベントのトップレベルタイプ | すべて |
| `--filter-address` | payment address または stake address | `input.transaction`、`input.governance` |
| `--filter-policy` | asset policy ID | `input.transaction` |
| `--filter-asset` | asset fingerprint（`asset1…`） | `input.transaction` |
| `--filter-pool` | stake pool（SPO）ID | `input.block`、`input.transaction`、`input.governance` |
| `--filter-drep` | DRep ID（hex または bech32） | `input.transaction`、`input.governance` |

Adder は、フィルターの適用対象外のイベントをそのフィルターで除外しません。たとえば、`input.block` は `--filter-policy` で除外されず、`input.governance` は `--filter-asset` で除外されません。

長いフラグには二重ハイフンを使います。`--filter-type` のような長いフラグに単一ハイフンを付けた `-filter-type` を指定すると、Adder はそれを短いフラグの集合として解釈し、受け付けません。

### 値の指定と組み合わせ

各フィルターには、カンマ区切りで複数の値を指定できます。1 つのフィルター内では値を OR として評価し、イベントがいずれか 1 つに一致すれば通過させます。Adder は各値の前後の空白を取り除き、空の要素を無視します。

```bash
adder --filter-type input.transaction,input.block
```

異なる種類のフィルターは AND として評価します。次の例では、指定した asset と policy の両方に一致するトランザクションだけを出力します。

```bash
adder --filter-type input.transaction \
  --filter-asset asset108xu02ckwrfc8qs9d97mgyh4kn8gdu9w8f5sxk \
  --filter-policy 13aa2accf2e1561723aa26871e071fdf32c867cff7e7d50ad470d62f
```

`--filter-pool` と `--filter-drep` を同時に指定した場合だけ例外があり、pool ID と DRep ID を OR として評価します。いずれかの識別子に一致するトランザクションまたはガバナンスイベントを通過させ、ほかのフィルターはその組み合わせに対して AND として適用します。`input.block` は pool だけで照合します。`--filter-drep` はブロックイベントに適用されないため、両方のフラグを指定しても出力対象のブロックは広がりません。

### イベントタイプ

`--filter-type` にはイベントタイプを指定します。

```bash
adder --filter-type input.transaction
```

使用できるイベントタイプは `input.block`、`input.rollback`、`input.transaction`、`input.governance`、`input.drep-registration` です。複数のタイプを指定する場合はカンマで区切ります。

```bash
adder --filter-type input.transaction,input.block
```

ガバナンスイベントだけを出力するには、次のように指定します。

```bash
adder --filter-type input.governance
```

### Policy ID

`--filter-policy` は、指定した policy ID を含むトランザクションに適用します。

```bash
adder --filter-type input.transaction \
  --filter-policy 13aa2accf2e1561723aa26871e071fdf32c867cff7e7d50ad470d62f
```

### Asset fingerprint

`--filter-asset` は、指定した asset fingerprint を含むトランザクションに適用します。

```bash
adder --filter-type input.transaction \
  --filter-asset asset108xu02ckwrfc8qs9d97mgyh4kn8gdu9w8f5sxk
```

### Payment address と stake address

payment address を指定すると、そのアドレスに一致する出力を含むトランザクションを対象にします。

```bash
adder --filter-type input.transaction \
  --filter-address addr1qyht4ja0zcn45qvyx477qlyp6j5ftu5ng0prt9608dxp6l2j2c79gy9l76sdg0xwhd7r0c0kna0tycz4y5s6mlenh8pq4jxtdy
```

Adder は、stake address をその stake credential で構成されたアドレスと、トランザクション内の stake certificate に対して照合します。Adder は payment address を指定したアドレスだけに対して照合します。Adder はどちらもトランザクションの出力と、Kupo で解決した入力に対して照合します。入力の送金元を照合するには `KUPO_URL` を設定します。

```bash
adder --filter-type input.transaction \
  --filter-address stake1u9f9v0z5zzlldgx58n8tklphu8mf7h4jvp2j2gddluemnssjfnkzz
```

### 複数の address

1 つの `--filter-address` に複数の値をカンマ区切りで指定します。イベントは、いずれかの address に関係すれば通過します。payment address と stake address は同じリストに混在できます。

```bash
adder --filter-type input.transaction \
  --filter-address addr1qyht4ja0zcn45qvyx477qlyp6j5ftu5ng0prt9608dxp6l2j2c79gy9l76sdg0xwhd7r0c0kna0tycz4y5s6mlenh8pq4jxtdy,addr1q88zh70hsfjkqnexte4u5ewsfpjq3dxrhlvr3ha7k99p3y8rtwtt945eg3tvmg09t8f4ug4dw24nednp598w4vlycgqsry583e
```

```bash
adder --filter-type input.transaction \
  --filter-address addr1qyht4ja0zcn45qvyx477qlyp6j5ftu5ng0prt9608dxp6l2j2c79gy9l76sdg0xwhd7r0c0kna0tycz4y5s6mlenh8pq4jxtdy,stake1u834h94j66v5g4kd58j4n567y2kh92eukes6znh2k0jvyqgfufmts
```

### Stake pool

`--filter-pool` は SPO の stake pool ID に一致するブロック、トランザクション、ガバナンスイベントに適用します。pool ID には bech32 または hex 形式を使えます。

```bash
adder --filter-type input.block \
  --filter-pool pool1z5uqdk7dzdxaae5633fqfcu2eqzy3a3rgtuvy087fdld7yws0xt
```

複数の pool ID はカンマ区切りで指定します。値を混在させた場合も含め、リスト内のいずれかに一致するイベントを出力します。

```bash
adder --filter-type input.block \
  --filter-pool pool1z5uqdk7dzdxaae5633fqfcu2eqzy3a3rgtuvy087fdld7yws0xt,a81f156d98e1f02123abccdef5439a89d71fa9d8b76c8db028c7df0e
```

### DRep

`--filter-drep` は、指定した DRep が関係するトランザクションとガバナンスイベントに適用します。ガバナンスイベントでは、その DRep が投じた vote、DRep の registration・update・retirement certificate、その DRep への vote delegation を照合します。

```bash
adder --filter-type input.governance \
  --filter-drep drep1p4h4ea7y70ede2wy7x3t83x4umm63wwq68308f94cmt7szexmnr
```

`--filter-drep` は次の形式を受け付けます。

- **Bech32**: `drep1…`（key hash）または `drep_script1…`（script hash）で始まる値を指定します。Adder は値を decode し、28 byte の credential hash を期待します。decode 後の payload が 29 byte の場合、先頭 byte を header として削除します。Adder はその header byte の値を検査または検証しません。ほかの長さの payload は無視され、識別子はフィルターから静かに削除されます。
- **Hex**: 56 個の hexadecimal 文字で表す raw 28 byte credential hash を指定します。hex では先頭の header byte を付けません。decode 後の値はそのまま保存するため、header byte を含む値は一致しません。

Adder 自身が出力する DRep ID は、raw 28 byte credential hash の bech32 表現です。key hash credential には `drep` prefix、script hash credential には `drep_script` prefix を使います。`drepId` の出力値はそのまま `--filter-drep` に渡せます。

## CLI・環境変数・設定ファイルの対応

CLI フラグは plugin 名を省略した短い形ですが、環境変数と設定ファイルのキーは plugin type と plugin name から作成します。3 つの表記は異なるため、短い CLI フラグ名を短い環境変数または設定キーとして使いません。たとえば `FILTER_ADDRESS` は機能しません。

| CLI フラグ | 環境変数 | YAML 設定キー |
| --- | --- | --- |
| `--filter-address` | `FILTER_CARDANO_ADDRESS` | `plugins.filter.cardano.address` |
| `--filter-asset` | `FILTER_CARDANO_ASSET` | `plugins.filter.cardano.asset` |
| `--filter-policy` | `FILTER_CARDANO_POLICY` | `plugins.filter.cardano.policy` |
| `--filter-pool` | `FILTER_CARDANO_POOL` | `plugins.filter.cardano.pool` |
| `--filter-drep` | `FILTER_CARDANO_DREP` | `plugins.filter.cardano.drep` |
| `--filter-type` | `FILTER_EVENT_TYPE` | `plugins.filter.event.type` |

`--filter-type` は `event` filter plugin に属するため、環境変数と設定キーには `cardano` ではなく `event` を使います。

```yaml
plugins:
  filter:
    cardano:
      address: addr1qyht4ja0zcn45qvyx477qlyp6j5ftu5ng0prt9608dxp6l2j2c79gy9l76sdg0xwhd7r0c0kna0tycz4y5s6mlenh8pq4jxtdy
      pool: pool1z5uqdk7dzdxaae5633fqfcu2eqzy3a3rgtuvy087fdld7yws0xt
      drep: drep1p4h4ea7y70ede2wy7x3t83x4umm63wwq68308f94cmt7szexmnr

    event:
      type: input.governance
```

設定ファイルの各値は 1 つの文字列として指定します。複数の値には CLI と同じカンマ区切りを使います。

## `input.governance` イベント

chainsync input は、Conway era のオンチェーンガバナンスデータを含むトランザクションごとに `input.governance` イベントを 1 件発行します。1 件のトランザクションに含まれるガバナンスデータを、そのイベントにまとめます。

### 発行条件

トランザクションが次のいずれかを含む場合、Adder は `input.governance` を発行します。

- 1 つ以上の **proposal procedures**（新しい governance action）
- 1 つ以上の **voting procedures**（governance action への vote）
- 1 つ以上の **governance certificates**（DRep の registration・update・retirement、vote delegation、Constitutional Committee の hot key authorization または cold key resignation）

ガバナンスデータを含まないトランザクションには `input.governance` を発行しません。Adder は同じトランザクションについて、通常の `input.transaction` に加えて `input.governance` を発行します。

### `context`

`context` は、ガバナンスデータを含むトランザクションとチェーン上の位置を示します。

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `transactionHash` | string | トランザクションの hash（hex） |
| `blockNumber` | number | トランザクションを含むブロックの高さ |
| `slotNumber` | number | トランザクションを含むブロックの slot |
| `transactionIdx` | number | ブロック内のトランザクションの index |
| `networkMagic` | number | 接続先ノードの network magic |

### `payload`

`payload` には常に `blockHash` が入り、空でないガバナンス配列が最大 5 種類入ります。Adder は空の配列を省略します。Adder は chainsync input に `--input-chainsync-include-cbor` を指定した場合だけ `transactionCbor` を含めます。

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `blockHash` | string | トランザクションを含むブロックの hash（hex） |
| `transactionCbor` | string | raw transaction CBOR（hex）。`--input-chainsync-include-cbor` 指定時だけ存在 |
| `proposalProcedures` | array | このトランザクションが提案した governance action |
| `votingProcedures` | array | このトランザクションが投じた vote |
| `drepCertificates` | array | DRep の registration・update・retirement certificate |
| `voteDelegationCertificates` | array | vote delegation certificate |
| `committeeCertificates` | array | Constitutional Committee の hot authorization・cold resignation certificate |

#### `proposalProcedures[]`

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `index` | number | トランザクション内の proposal の index |
| `deposit` | number | proposal が lock する deposit（lovelace） |
| `rewardAccount` | string | deposit の返却先となる stake または reward address |
| `actionType` | string | `ParameterChange`、`HardForkInitiation`、`TreasuryWithdrawal`、`NoConfidence`、`UpdateCommittee`、`NewConstitution`、`Info` のいずれか |
| `actionData` | object | action 固有のデータ。action に対応する `parameterChange`、`treasuryWithdrawal`、`newConstitution`、`updateCommittee`、`hardForkInitiation`、`noConfidence`、`info` のいずれか 1 フィールドを持つ |
| `anchor` | object | 任意の off-chain metadata を示す `{ "url", "dataHash" }` |

#### `votingProcedures[]`

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `voterType` | string | `DRep`、`SPO`、`CCHot` のいずれか |
| `voterHash` | string | voter credential hash（hex） |
| `voterId` | string | voter identifier（該当する場合は bech32） |
| `govActionTxId` | string | 投票対象の governance action の transaction ID |
| `govActionIndex` | number | 対象トランザクション内の governance action の index |
| `vote` | string | `Yes`、`No`、`Abstain` のいずれか |
| `anchor` | object | 任意の vote rationale metadata を示す `{ "url", "dataHash" }` |

#### `drepCertificates[]`

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `certificateType` | string | `Registration`、`Update`、`Deregistration` のいずれか |
| `drepHash` | string | DRep credential hash（hex） |
| `drepId` | string | DRep ID（`drep1…` または `drep_script1…` の bech32） |
| `deposit` | number | deposit（lovelace）。registration と deregistration に存在 |
| `anchor` | object | 任意の metadata を示す `{ "url", "dataHash" }` |

#### `voteDelegationCertificates[]`

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `certificateType` | string | `VoteDelegation`、`StakeVoteDelegation`、`VoteRegistrationDelegation`、`StakeVoteRegistrationDelegation` のいずれか |
| `stakeCredential` | string | delegation 元の stake credential hash（hex） |
| `drepType` | string | `KeyHash`、`ScriptHash`、`Abstain`、`NoConfidence` のいずれか |
| `drepHash` | string | DRep credential hash（hex）。`KeyHash` または `ScriptHash` の場合に存在 |
| `drepId` | string | DRep ID（bech32）。`KeyHash` または `ScriptHash` の場合に存在 |
| `poolKeyHash` | string | pool key hash（hex）。stake と vote を組み合わせた delegation type の場合に存在 |
| `deposit` | number | deposit（lovelace）。registration delegation type の場合に存在 |

#### `committeeCertificates[]`

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `certificateType` | string | `AuthHot`（hot key authorization）または `ResignCold` |
| `coldCredential` | string | committee cold credential hash（hex） |
| `hotCredential` | string | committee hot credential hash（hex）。`AuthHot` の場合に存在 |
| `anchor` | object | `{ "url", "dataHash" }`。`ResignCold` の場合に存在 |

## ガバナンスイベントのフィルタリング

`input.governance` には、次の 3 つの Cardano フィルターを適用します。リスト内のいずれかのデータが指定値を参照すると、イベントはそのフィルターに一致します。

- `--filter-drep` は、DRep certificate、指定した DRep への vote delegation certificate、その DRep が voter である voting procedure を照合します。
- `--filter-pool` は、SPO として pool が投じた voting procedure と、pool の key hash を参照する vote delegation certificate を照合します。
- `--filter-address` は、指定した address の種類によって照合先が変わります。
  - **stake address（`stake1…`）** は、proposal の `rewardAccount`、treasury withdrawal の送金先 address、vote delegation certificate の stake credential を照合します。
  - **payment address（`addr1…`）** は、treasury withdrawal の送金先 address だけを照合します。`rewardAccount` と vote delegation credential は stake credential なので、stake address とだけ比較します。

アカウントのガバナンス活動を追跡するには、payment address ではなく stake address を指定します。

`--filter-policy` と `--filter-asset` は governance event に適用しません。`input.governance` は、これらのフィルターを設定していても影響を受けずに通過します。

次のコマンドは、特定の DRep が関係するガバナンスイベントだけを出力します。

```bash
adder --filter-type input.governance \
  --filter-drep drep1p4h4ea7y70ede2wy7x3t83x4umm63wwq68308f94cmt7szexmnr
```