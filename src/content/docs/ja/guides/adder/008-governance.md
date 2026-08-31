---
title: ガバナンスイベント
description: Adderのinput.governanceイベントとガバナンスフィルターのリファレンス。
---

# ガバナンスイベント

Adderは、Cardanoブロックチェーン上のオンチェーンガバナンスアクションと証明書の活動を構造化イベントとして出力します。これらのイベントにはConway時代のガバナンスデータが含まれ、提案手続き、投票活動、DRepの登録、投票委任、憲法委員会の変更を監視できます。

## 概要

chainsync入力プラグインは、Conway時代のオンチェーンガバナンスデータを含むブロック内の各トランザクションに対して、`input.governance`イベントを出力します。1つのトランザクションにつき、`input.governance`イベントを正確に1つ出力し、そのトランザクションに含まれるすべてのガバナンスデータをそのイベントにまとめます。

ガバナンスイベントは、同じトランザクションの通常の`input.transaction`イベントに加えて出力されます。ガバナンスデータを含まないトランザクションは、`input.governance`イベントを出力しません。

- **イベントタイプ名**: `input.governance`

---

## イベントの構造

ガバナンスイベントは、`timestamp`、`type`、`context`、`payload`を含むトップレベルのJSONオブジェクトです。

### Contextフィールド

`context`オブジェクトは、ガバナンスデータが見つかったトランザクションとチェーン上の位置を識別します。

| フィールド | 型 | 説明 |
| :--- | :--- | :--- |
| `transactionHash` | string | ガバナンスデータを含むトランザクションの32バイト、16進数エンコード済みハッシュ。 |
| `blockNumber` | number | トランザクションを含むブロックの絶対ブロック高。 |
| `slotNumber` | number | トランザクションを含むブロックのスロット番号。 |
| `transactionIdx` | number | ブロック内のトランザクションのインデックス（0始まり）。 |
| `networkMagic` | number | 接続先ノードのネットワークマジック識別子。 |

### Payloadフィールド

`payload`オブジェクトには、ブロック情報とガバナンス関連項目の配列が含まれます。空の配列は省略される場合があります。

| フィールド | 型 | 説明 |
| :--- | :--- | :--- |
| `blockHash` | string | トランザクションを含むブロックの16進数エンコード済みハッシュ。 |
| `transactionCbor` | string | 16進数形式のトランザクションの生CBOR。`--input-chainsync-include-cbor`を指定した場合にだけ存在します。 |
| `proposalProcedures` | array | このトランザクションで提案されたガバナンスアクションの一覧。 |
| `votingProcedures` | array | このトランザクションで行われた投票の一覧。 |
| `drepCertificates` | array | DRepの登録、更新、または退任の証明書の一覧。 |
| `voteDelegationCertificates` | array | ステーク資格情報からDRepへの投票委任証明書の一覧。 |
| `committeeCertificates` | array | 憲法委員会の認証または辞任の証明書の一覧。 |

---

## 埋め込みデータ構造

### `proposalProcedures[]`

新しい提案である、提案されたガバナンスアクションを表します。

| フィールド | 型 | 説明 |
| :--- | :--- | :--- |
| `index` | number | トランザクション内の提案のインデックス。 |
| `deposit` | number | この提案のためにロックされたデポジット額（Lovelace）。 |
| `rewardAccount` | string | 提案の完了時にデポジットが返還されるステークまたは報酬アドレス。 |
| `actionType` | string | `ParameterChange`、`HardForkInitiation`、`TreasuryWithdrawal`、`NoConfidence`、`UpdateCommittee`、`NewConstitution`、`Info`のいずれか。 |
| `actionData` | object | アクション固有のデータ。アクションに対応するキー（例: `parameterChange`、`treasuryWithdrawal`、`newConstitution`）を使い、ちょうど1つのフィールドに値が入ります。 |
| `anchor` | object | オフチェーンメタデータを参照するオプションの`{ "url", "dataHash" }`。 |

### `votingProcedures[]`

有効な提案に対して行われた投票を表します。

| フィールド | 型 | 説明 |
| :--- | :--- | :--- |
| `voterType` | string | `DRep`（Delegate Representative）、`SPO`（Stake Pool Operator）、`CCHot`（憲法委員会のホット資格情報）のいずれか。 |
| `voterHash` | string | 投票者の資格情報ハッシュ（16進数エンコード済み）。 |
| `voterId` | string | 投票者のBech32識別子（例: `drep1...`）。 |
| `govActionTxId` | string | 投票対象のガバナンスアクションのトランザクションID。 |
| `govActionIndex` | number | そのトランザクション内のガバナンスアクションのインデックス。 |
| `vote` | string | 行った投票。`Yes`、`No`、`Abstain`のいずれか。 |
| `anchor` | object | オフチェーンの投票理由メタデータを参照するオプションの`{ "url", "dataHash" }`。 |

### `drepCertificates[]`

DRepの状態に対する変更を表します。

| フィールド | 型 | 説明 |
| :--- | :--- | :--- |
| `certificateType` | string | `Registration`、`Update`、`Deregistration`のいずれか。 |
| `drepHash` | string | DRep資格情報ハッシュ（16進数エンコード済み）。 |
| `drepId` | string | Bech32形式のDRep ID（`drep1...`または`drep_script1...`）。 |
| `deposit` | number | 登録時に必要な、または退任時に返還されるデポジット（Lovelace）。 |
| `anchor` | object | オフチェーンのDRepメタデータを参照するオプションの`{ "url", "dataHash" }`。 |

### `voteDelegationCertificates[]`

ステークアドレスがDRepまたは事前定義された状態に投票権を委任することを表します。

| フィールド | 型 | 説明 |
| :--- | :--- | :--- |
| `certificateType` | string | `VoteDelegation`、`StakeVoteDelegation`、`VoteRegistrationDelegation`、`StakeVoteRegistrationDelegation`のいずれか。 |
| `stakeCredential` | string | 委任元のステーク資格情報ハッシュ（16進数エンコード済み）。 |
| `drepType` | string | 委任先。`KeyHash`、`ScriptHash`、`Abstain`、`NoConfidence`のいずれか。 |
| `drepHash` | string | DRep資格情報ハッシュ（`Abstain`または`NoConfidence`では省略）。 |
| `drepId` | string | Bech32形式のDRep ID（`Abstain`または`NoConfidence`では省略）。 |
| `poolKeyHash` | string | プールキーのハッシュ（ステークと投票を組み合わせた委任タイプの場合だけ存在）。 |
| `deposit` | number | デポジット額（Lovelace）。登録を伴う委任タイプの場合だけ存在。 |

### `committeeCertificates[]`

憲法委員会の資格情報に対する変更を表します。

| フィールド | 型 | 説明 |
| :--- | :--- | :--- |
| `certificateType` | string | `AuthHot`（ホット資格情報を認証）または`ResignCold`（コールド資格情報を辞任）のいずれか。 |
| `coldCredential` | string | 委員会のコールド資格情報ハッシュ（16進数エンコード済み）。 |
| `hotCredential` | string | 委員会のホット資格情報ハッシュ（16進数エンコード済み）。`AuthHot`の場合だけ存在。 |
| `anchor` | object | オプションの`{ "url", "dataHash" }`メタデータ。`ResignCold`の場合だけ存在。 |

---

## サポートするガバナンスアクション

Conwayレジャーには、提案アクションタイプが7種類あります。

1. **`ParameterChange`**: 1つ以上のネットワークプロトコルパラメーターの更新を提案します。
2. **`HardForkInitiation`**: 新しいプロトコルバージョンへのハードフォークアップグレードを提案します。
3. **`TreasuryWithdrawal`**: トレジャリーから指定した報酬アカウントへのLovelaceの引き出しを提案します。
4. **`NoConfidence`**: 現在の憲法委員会への不信任を提案します。
5. **`UpdateCommittee`**: 憲法委員会のメンバー、しきい値、または任期の変更を提案します。
6. **`NewConstitution`**: ネットワーク憲法とそのオフチェーンアンカーの更新を提案します。
7. **`Info`**: レジャーに影響を与えないアクションです。通常、コミュニティの意見調査や告知に使用します。

---

## ガバナンスイベントのフィルタリング

ガバナンスイベントは、Cardano固有の次の3つのパイプラインフィルターをサポートします。

- **DRepフィルター（`--filter-drep`）**: 特定のDRepに関係するイベントに一致します。DRepの登録、更新、退任の証明書、そのDRepを委任先とする投票委任証明書、投票者がそのDRepである投票手続きが対象です。16進数形式またはBech32形式（スクリプトDRep IDを含む）を使用できます。
- **プールフィルター（`--filter-pool`）**: ステークプールに関係するイベントに一致します。プールをSPOとして行った投票手続きと、プールのキー���ッシュを参照する投票委任証明書が対象です。トランザクションにSPOの投票手続きが含まれている場合、プール関連の証明書がなくても一致します。
- **アドレスフィルター（`--filter-address`）**: ガバナンスアクションに関係するアドレスに一致します。提案の報酬アカウント、トレジャリー引き出し先アドレス、または委任元のステーク資格情報が対象です。

一般的なフラグ構文については、[コマンドリファレンス](./006-command_list.md)を参照してください。

### フィルターの例

#### コマンドライン

```bash
# Bech32形式のDRepでフィルタリング
./adder --filter-type input.governance \
  --filter-drep drep1p4h4ea7y70ede2wy7x3t83x4umm63wwq68308f94cmt7szexmnr

# プールIDでフィルタリング
./adder --filter-type input.governance \
  --filter-pool pool1...

# 複数のアドレスでフィルタリング（カンマ区切りのOR一致）
./adder --filter-type input.governance \
  --filter-address stake1u9f9v0z5zzlldgx58n8tklphu8mf7h4jvp2j2gddluemnssjfnkzz,stake1ux7abcd...
```

#### YAML設定

```yaml
filter:
  cardano:
    type: "input.governance"
    drep: "drep1p4h4ea7y70ede2wy7x3t83x4umm63wwq68308f94cmt7szexmnr"
    pool: "pool1..."
    address: "stake1u9f9v0z5zzlldgx58n8tklphu8mf7h4jvp2j2gddluemnssjfnkzz"
```

---

## DRepイベントのワイヤー値

DRep証明書タイプごとに、次のイベントタイプ値を出力します。

| 証明書タイプ | 出力されるイベントタイプ |
| :--- | :--- |
| `Registration` | `input.drep-registration` |
| `Update` | `input.drep-update` |
| `Deregistration` | `input.drep-retirement` |

`input.drep-registration`、`input.drep-update`、`input.drep-retirement`が有効なDRepイベント値です。これらは、従来の`chainsync.drep.registration`、`chainsync.drep.update`、`chainsync.drep.deregistration`の値に置き換わります。証明書の用語としては`Deregistration`を使用しますが、そのイベントのワイヤー値は`input.drep-retirement`です。

---

## JSON出力の例

次の例は、提案、投票、DRep証明書、投票委任証明書、委員会証明書を含む`input.governance`イベントです。

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
    "proposalProcedures": [
      {
        "index": 0,
        "deposit": 100000000000,
        "rewardAccount": "stake1u9f9v0z5zzlldgx58n8tklphu8mf7h4jvp2j2gddluemnssjfnkzz",
        "actionType": "ParameterChange",
        "actionData": {
          "parameterChange": {}
        },
        "anchor": {
          "url": "https://example.com/proposal.json",
          "dataHash": "58200a1ad4abcd7290bc9831d102e34fa9de1e0287a98bcdef1238b1f20a67bc"
        }
      }
    ],
    "votingProcedures": [
      {
        "voterType": "DRep",
        "voterHash": "81f156d98e1f02123abccdef5439a89d71fa9d8b76c8db028c7df0e1",
        "voterId": "drep1p4h4ea7y70ede2wy7x3t83x4umm63wwq68308f94cmt7szexmnr",
        "govActionTxId": "58200a1ad4abcd7290bc9831d102e34fa9de1e0287a98bcdef1238b1f20a67bc",
        "govActionIndex": 0,
        "vote": "Yes",
        "anchor": {
          "url": "https://example.com/vote-rationale.json",
          "dataHash": "13aa2accf2e1561723aa26871e071fdf32c867cff7e7d50ad470d62fdeadbeef"
        }
      }
    ],
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
    ],
    "voteDelegationCertificates": [
      {
        "certificateType": "VoteDelegation",
        "stakeCredential": "81f156d98e1f02123abccdef5439a89d71fa9d8b76c8db028c7df0e1",
        "drepType": "KeyHash",
        "drepHash": "81f156d98e1f02123abccdef5439a89d71fa9d8b76c8db028c7df0e1",
        "drepId": "drep1p4h4ea7y70ede2wy7x3t83x4umm63wwq68308f94cmt7szexmnr"
      }
    ],
    "committeeCertificates": [
      {
        "certificateType": "AuthHot",
        "coldCredential": "81f156d98e1f02123abccdef5439a89d71fa9d8b76c8db028c7df0e1",
        "hotCredential": "13aa2accf2e1561723aa26871e071fdf32c867cff7e7d50ad470d62fdeadbeef"
      }
    ]
  }
}
```

`transactionCbor`をイベントに含めるには、chainsync入力で`--input-chainsync-include-cbor`を指定します。
