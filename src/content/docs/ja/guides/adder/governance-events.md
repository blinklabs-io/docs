---
title: "ガバナンスイベントリファレンス"
description: "Adderのinput.governanceイベントのスキーマとフィルターを説明します。"
---

# ガバナンスイベント

Adderは、Cardanoブロックチェーン上のオンチェーンガバナンスアクションと証明書の活動について、構造化イベントを出力します。イベントにはConway時代のガバナンスデータが含まれ、提案、投票、DRep登録、投票委任、憲法委員会の変更を監視できます。

## 概要

`chainsync`入力プラグインは、Conway時代のオンチェーンガバナンスデータを含むブロック内トランザクションごとに、`input.governance`イベントを1件出力します。1件のトランザクションからは必ず1件の`input.governance`イベントが生成され、そのトランザクションから検出したすべてのガバナンスデータをイベントにまとめます。

ガバナンスイベントは、同じトランザクションの通常の`input.transaction`イベントに加えて出力されます。ロールバック後の再生または再処理では、同じトランザクションが再度出力されることがあります。ガバナンスデータを含まないトランザクションは、`input.governance`イベントを生成しません。

- **イベントタイプ名**: `input.governance`

---

## イベント構造

ガバナンスイベントは、`timestamp`、`type`、`context`、`payload`を含むトップレベルのJSONオブジェクトです。

### コンテキストフィールド

`context`オブジェクトは、ガバナンスデータが見つかったトランザクションとチェーン上の位置を示します。

| フィールド | 型 | 説明 |
| :--- | :--- | :--- |
| `transactionHash` | string | ガバナンスデータを含むトランザクションの32バイト、16進数エンコード済みハッシュ。 |
| `blockNumber` | number | トランザクションを含むブロックの絶対ブロック高。 |
| `slotNumber` | number | トランザクションを含むブロックのスロット番号。 |
| `transactionIdx` | number | ブロック内のトランザクションのインデックス（0始まり）。 |
| `networkMagic` | number | 接続先ノードのネットワークマジック識別子。 |

### ペイロードフィールド

`payload`オブジェクトには、ブロック情報とガバナンス関連項目の配列が含まれます。各配列は空の場合に省略されます。

| フィールド | 型 | 説明 |
| :--- | :--- | :--- |
| `blockHash` | string | トランザクションを含むブロックの16進数エンコード済みハッシュ。 |
| `transactionCbor` | string | 16進数形式の生トランザクションCBOR。`--input-chainsync-include-cbor`を設定した場合だけ含まれます。 |
| `proposalProcedures` | array | このトランザクションで提案されたガバナンスアクションの一覧。 |
| `votingProcedures` | array | このトランザクションで実行された投票の一覧。 |
| `drepCertificates` | array | DRepの登録、更新、または登録解除証明書の一覧。 |
| `voteDelegationCertificates` | array | ステーク資格情報からDRepへの投票委任証明書の一覧。 |
| `committeeCertificates` | array | 憲法委員会の承認または辞任証明書の一覧。 |

---

## 埋め込みデータ構造

### `proposalProcedures[]`

新しいガバナンス提案を表します。

| フィールド | 型 | 説明 |
| :--- | :--- | :--- |
| `index` | number | トランザクション内の提案インデックス。 |
| `deposit` | `uint64` | この提案のためにロックされたLovelaceのデポジット。`uint64`として値を保持し、符号付き整数や`MaxInt64`で制限しません。 |
| `rewardAccount` | string | 完了時にデポジットを返すステークまたは報酬アドレス。 |
| `actionType` | string | `ParameterChange`、`HardForkInitiation`、`TreasuryWithdrawal`、`NoConfidence`、`UpdateCommittee`、`NewConstitution`、`Info`のいずれか。認識されないタイプには`Unknown`を使用します。 |
| `actionData` | object | アクション固有のデータ。認識されたアクションでは、アクション名（`parameterChange`、`treasuryWithdrawal`、`newConstitution`など）をキーとする1つのフィールドに値を設定します。 |
| `anchor` | object | `{ "url", "dataHash" }`。メタデータがない場合、両方の文字列は空です。 |

### `votingProcedures[]`

アクティブな提案への投票を表します。

| フィールド | 型 | 説明 |
| :--- | :--- | :--- |
| `voterType` | string | `DRep`（Delegate Representative）、`SPO`（Stake Pool Operator）、`CCHot`（Constitutional Committee Hot Credential）のいずれか。認識されないタイプには`Unknown`を使用します。 |
| `voterHash` | string | 投票者の資格情報ハッシュを16進数でエンコードした値。 |
| `voterId` | string | 投票者のBech32識別子（例: `drep1...`）。 |
| `govActionTxId` | string | 投票対象のガバナンスアクションのトランザクションID。 |
| `govActionIndex` | number | そのトランザクション内のガバナンスアクションのインデックス。 |
| `vote` | string | 実行した投票。`Yes`、`No`、`Abstain`のいずれか。認識されない値には`Unknown`を使用します。 |
| `anchor` | object | `{ "url", "dataHash" }`。投票メタデータがない場合、両方の文字列は空です。 |

### `drepCertificates[]`

DRepの状態変更を表します。

| フィールド | 型 | 説明 |
| :--- | :--- | :--- |
| `certificateType` | string | `Registration`、`Update`、`Deregistration`のいずれか。 |
| `drepHash` | string | DRep資格情報ハッシュを16進数でエンコードした値。 |
| `drepId` | string | Bech32形式のDRep ID（`drep1...`または`drep_script1...`）。 |
| `deposit` | `uint64` | 登録時に必要なLovelaceのデポジット、または登録解除時に返却されるLovelaceのデポジット。値は`uint64`として保持され、0の場合は省略されます。符号付き値への変換や`MaxInt64`でのクランプは行いません。 |
| `anchor` | object | `{ "url", "dataHash" }`。DRepメタデータがない場合、両方の文字列は空です。 |

### `voteDelegationCertificates[]`

ステークアドレスがDRepまたは事前定義された状態に投票権を委任したことを表します。

| フィールド | 型 | 説明 |
| :--- | :--- | :--- |
| `certificateType` | string | `VoteDelegation`、`StakeVoteDelegation`、`VoteRegistrationDelegation`、`StakeVoteRegistrationDelegation`のいずれか。 |
| `stakeCredential` | string | 委任元のステーク資格情報ハッシュを16進数でエンコードした値。 |
| `drepType` | string | 委任先。`KeyHash`、`ScriptHash`、`Abstain`、`NoConfidence`のいずれか。 |
| `drepHash` | string | DRep資格情報ハッシュを16進数でエンコードした値。`Abstain`または`NoConfidence`では省略されます。 |
| `drepId` | string | Bech32形式のDRep ID。`Abstain`または`NoConfidence`では省略されます。 |
| `poolKeyHash` | string | プールキーのハッシュを16進数でエンコードした値。ステーク委任と投票委任を組み合わせたタイプだけに含まれます。 |
| `deposit` | `uint64` | 登録委任タイプのLovelaceデポジット。値は`uint64`として保持され、0の場合は省略されます。符号付き値としてデシリアライズしたり、`MaxInt64`でクランプしたりしないでください。 |

### `committeeCertificates[]`

憲法委員会の資格情報の変更を表します。

| フィールド | 型 | 説明 |
| :--- | :--- | :--- |
| `certificateType` | string | ホット資格情報を承認する`AuthHot`、またはコールド資格情報を辞任する`ResignCold`。 |
| `coldCredential` | string | 委員会のコールド資格情報ハッシュを16進数でエンコードした値。 |
| `hotCredential` | string | 委員会のホット資格情報ハッシュを16進数でエンコードした値。`AuthHot`の場合だけ含まれます。 |
| `anchor` | object | 常にシリアライズされます。`ResignCold`証明書がメタデータを提供しない場合、文字列は空です。 |

---

## 対応するガバナンスアクション

Conway台帳は、次の7種類の提案アクションを定義します。

1. **`ParameterChange`**: 1つ以上のネットワークプロトコルパラメーターの更新を提案します。
2. **`HardForkInitiation`**: 新しいプロトコルバージョンへのハードフォークを提案します。
3. **`TreasuryWithdrawal`**: 指定した報酬アカウントへのLovelaceの国庫引き出しを提案します。
4. **`NoConfidence`**: 現在の憲法委員会への不信任を提案します。
5. **`UpdateCommittee`**: 憲法委員会のメンバー、しきい値、または任期の変更を提案します。
6. **`NewConstitution`**: ネットワーク憲法とそのオフチェーンアンカーの更新を提案します。
7. **`Info`**: 台帳状態を変更しないアクションです。通常はコミュニティの意向確認や告知に使用します。

---

## ガバナンスイベントのフィルタリング

ガバナンスイベントは、次のCardano固有のパイプラインフィルターに対応します。

- **DRepフィルタリング（`--filter-drep`）**: 特定のDRepに関係するイベントに一致します。対象にはDRepの登録、更新、登録解除証明書、そのDRepを対象とする投票委任証明書、そのDRepが投票者である投票手順が含まれます。16進数形式とBech32形式（スクリプトDRep IDを含む）に対応します。
- **プールフィルタリング（`--filter-pool`）**: ステークプールに関係するイベントに一致します。対象には、SPOとしてプールが実行した投票手順と、プールのキー ハッシュを参照する投票委任証明書が含まれます。
- **アドレスフィルタリング（`--filter-address`）**: ガバナンスアクションに関係するアドレスに一致します。対象には、提案の報酬アカウント、国庫引き出し先アドレス、委任元のステーク資格情報が含まれます。

### フィルタリング例

#### コマンドライン

```bash
# Bech32でDRepをフィルタリング
./adder --filter-type input.governance \
  --filter-drep drep1p4h4ea7y70ede2wy7x3t83x4umm63wwq68308f94cmt7szexmnr

# ステークアドレスをフィルタリング（カンマ区切りの複数アドレスはOR）
./adder --filter-type input.governance \
  --filter-address stake1u9f9v0z5zzlldgx58n8tklphu8mf7h4jvp2j2gddluemnssjfnkzz
```

#### YAML設定

```yaml
plugins:
  filter:
    event:
      type: "input.governance"
    cardano:
      drep: "drep1p4h4ea7y70ede2wy7x3t83x4umm63wwq68308f94cmt7szexmnr"
      address: "stake1u9f9v0z5zzlldgx58n8tklphu8mf7h4jvp2j2gddluemnssjfnkzz"
```

---

## JSON出力例

次の例は、**DRep登録証明書**を表す`input.governance`イベントのペイロードです。

```json
{
  "timestamp": "2026-07-17T21:40:00Z",
  "type": "input.governance",
  "context": {
    "transactionHash": "58200a1ad4abcd7290bc9831d102e34fa9de1e0287a98bcdef1238b1f20a67bc",
    "blockNumber": 10528430,
    "slotNumber": 68493120,
    "transactionIdx": 3,
    "networkMagic": 764824073
  },
  "payload": {
    "blockHash": "13aa2accf2e1561723aa26871e071fdf32c867cff7e7d50ad470d62fdeadbeef",
    "drepCertificates": [
      {
        "certificateType": "Registration",
        "drepHash": "81f156d98e1f02123abccdef5439a89d71fa9d8b76c8db028c7df0e1",
        "drepId": "drep1p4h4ea7y70ede2wy7x3t83x4umm63wwq68308f94cmt7szexmnr",
        "deposit": 500000000,
        "anchor": {
          "url": "https://example.com/drep-metadata.json",
          "dataHash": "58200a1ad4abcd7290bc9831d102e34fa9de1e0287a98bcdef1238b1f20a67bc"
        }
      }
    ]
  }
}
```

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>