---
title: Bursa設定リファレンス
description: Bursaの署名、KES-agent、PKCS#11設定を構成します。
---

## 概要

このガイドでは、Bursaの署名およびKES-agent設定と、`PKCS#11`署名バックエンドの`signer.backends`設定を説明します。バックエンドは`PKCS#11`モジュールを使用し、秘密鍵をトークン内に保持して、トークンで`Ed25519`署名を生成します。

## ウォレット環境変数

| 環境変数 | デフォルト | 動作 |
| --- | --- | --- |
| `BURSA_CONNECTOR` | `false` | dAppコネクタバックエンドを有効にします。 |

## 設定リファレンス

`signer.backends`の下にバックエンドエントリを追加し、`type`を`pkcs11`に設定します。以下のフィールドを使用します。

| 設定パス | 目的 | 検証 |
| --- | --- | --- |
| `signer.backends[].type` | 署名バックエンドを選択します。 | `pkcs11`を設定します。 |
| `signer.backends[].module` | `.so`ファイルを含む`PKCS#11`モジュールのパスを指定します。 | このフィールドを設定します。Bursaは空の値を拒否します。 |
| `signer.backends[].token_label` | ラベルでトークンまたはスロットを選択します。 | このフィールドまたは`slot`を設定します。少なくとも一方の選択フィールドが必要です。 |
| `signer.backends[].slot` | 明示的なスロットIDでスロットを選択します。 | このフィールドまたは`token_label`を設定します。少なくとも一方の選択フィールドが必要です。 |
| `signer.backends[].pin_env` | ユーザーPINを格納する環境変数の名前を指定します。 | このフィールドを設定し、指定した環境変数に空でない値を設定します。Bursaはプレーンテキスト設定からPINを読み取りません。 |
| `signer.backends[].keys[]` | トークンオブジェクトの許可リストを任意で定義します。 | 設定する場合は、すべてのエントリに`name`と`type`を指定します。 |
| `signer.backends[].keys[].name` | トークンオブジェクトの`CKA_LABEL`と照合します。 | 各`keys`エントリにこのフィールドを設定します。 |
| `signer.backends[].keys[].type` | 照合したトークンオブジェクトにCardano鍵タイプを割り当てます。 | 各`keys`エントリにこのフィールドを設定します。`payment`、`stake`、`drep`、`cc-hot`、`cc-cold`、`pool`、または`policy`を使用します。 |

## ビルド要件

`PKCS#11`バックエンドを含めるには、`CGO`を有効にし、`pkcs11`ビルドタグを指定してBursaをコンパイルします。このビルドタグなしで設定がこのバックエンドを選択すると、Bursaは即座に失敗し、次のエラーを返します。

```text
pkcs11 backend not compiled in (build with -tags pkcs11)
```

デフォルトビルドでは`PKCS#11`サポートを暗黙的に有効にしません。

## 署名の制約

`PKCS#11`バックエンドは秘密鍵をトークン内に保持し、トークンに`Ed25519`署名の生成を依頼します。このバックエンドは`CIP-8`の`COSE`署名をサポートしません。`PKCS#11`鍵を使用する`CIP-8`リクエストに対して、Bursaは`CodeUnsupported`を返します。

## 署名者の起動時安全性

`software`/`file`署名バックエンドは、プレーンテキストの秘密鍵素材をプロセスメモリに読み込みます。署名者がローカルマシンの外部で待ち受ける場合、Bursaはこのバックエンドを保護します。

| 設定パス | 環境変数 | デフォルト | 動作 |
| --- | --- | --- | --- |
| `signer.allow_insecure_file_backend` | `SIGNER_ALLOW_INSECURE_FILE_BACKEND` | `false` | ループバック以外の署名者リスナーで`software`/`file`バックエンドを使用することを明示的に許可します。 |
| `signer.listen_address` | `SIGNER_LISTEN_ADDRESS` | `""` | 署名者リスナーがループバックアドレスを使用するかどうかを決定します。 |

`software`/`file`バックエンドを設定すると、`signer.listen_address`がループバック以外の場合に、`signer.allow_insecure_file_backend`が`true`でなければBursaは起動を拒否します。空の`signer.listen_address`は全インターフェースを意味し、この判定ではループバック以外として扱います。ループバックリスナーまたは明示的な`true`のオプトインでは起動できますが、バックエンドの使用時にはBursaが警告を出力します。本番環境では、プレーンテキストの鍵素材ではなく`Vault`や`SOPS`などの保管バックエンドを使用します。

## KES-agentの期間ガード

KES-agentは単調増加する期間ガードのために永続的なパスを必要とします。

| 設定パス | 環境変数 | 要件 |
| --- | --- | --- |
| `kes_agent.guard_file` | `KESAGENT_GUARD_FILE` | KES-agentデーモンが開ける、空でない永続ファイルパスを設定します。 |

`kes_agent.guard_file`が空の場合、BursaはKES-agentの起動を拒否します。期間ガードはエージェントが承認した最高のKES期間を保存し、再起動後にその期間を復元し、期間のロールバックを拒否します。デーモンはこのガードにインメモリのフォールバックを使用しません。

## 署名者のトランザクションポリシー

操作を認識するトランザクション権限を`signer.keys[].tx_policy`の下に設定します。粗い`allow_certificates`と`allow_votes`の設定も使用できますが、空でない`allowed_certificates`リストは`allow_certificates`より優先されます。空でない`allowed_voter_kinds`または`allowed_drep_ids`リストは、`allow_votes`の代わりに許可リストモードを選択します。該当する許可リストまたはブール権限を設定しない場合、Bursaは操作をデフォルトで拒否します。

```yaml
signer:
  keys:
    - hash: "0000000000000000000000000000000000000000000000000000000000"
      tx_policy:
        allow_certificates: false
        allowed_certificates:
          - stake_registration
        allow_votes: false
        allowed_voter_kinds:
          - drep_key
        allowed_drep_ids:
          - "hex-credential-id"
```

`allowed_certificates`で使用できる値は次のとおりです。

`stake_registration`、`stake_deregistration`、`stake_delegation`、`pool_registration`、`pool_retirement`、`genesis_key_delegation`、`move_instantaneous_rewards`、`registration`、`deregistration`、`vote_delegation`、`stake_vote_delegation`、`stake_registration_delegation`、`vote_registration_delegation`、`stake_vote_registration_delegation`、`auth_committee_hot`、`resign_committee_cold`、`drep_registration`、`drep_deregistration`、`drep_update`。

`allowed_voter_kinds`で使用できる値は次のとおりです。

`committee_hot_key`、`committee_hot_script`、`drep_key`、`drep_script`、`staking_pool_key`。

`allowed_drep_ids`には、DRep投票者を指定した資格情報に制限する16進数の資格情報IDを設定します。DRep IDリストを設定すると、DRep資格情報IDを持たない投票者も拒否されます。Bursaは、一覧にある証明書種別と投票者種別だけを受け入れます。Bursaが操作種別、または有効な許可リストに必要な詳細をデコードできない場合、署名を拒否します。

### 呼び出し元ごとのトランザクション制限

`signer.caller_policies`を、呼び出し元サブジェクトから鍵ハッシュ、さらに減算型トランザクション上書きへ対応付けるマップとして使用します。

```yaml
signer:
  caller_policies:
    "caller-subject":
      "0000000000000000000000000000000000000000000000000000000000":
        networks: ["mainnet"]
        allowed_outputs: ["addr1example"]
        max_output_ada: 100
        max_total_out_ada: 500
        max_fee_ada: 2
        allowed_certificates: ["stake_registration"]
        allowed_voter_kinds: ["drep_key"]
        allowed_drep_ids: ["hex-credential-id"]
        forbid_certificates: true
        forbid_mint: true
        forbid_withdrawals: true
        forbid_votes: true
        forbid_proposals: true
        forbid_treasury: true
```

`signer.caller_policies`の各キーは呼び出し元サブジェクトを識別し、各ネストされたキーは鍵ハッシュを識別します。使用できる上書きフィールドは、`networks`、`allowed_outputs`、`max_output_ada`、`max_total_out_ada`、`max_fee_ada`、`allowed_certificates`、`allowed_voter_kinds`、`allowed_drep_ids`、`forbid_certificates`、`forbid_mint`、`forbid_withdrawals`、`forbid_votes`、`forbid_proposals`、`forbid_treasury`です。

Bursaは各呼び出し元の上書きを鍵の基本ポリシーと交差させるため、上書きは権限を狭めることだけができ、基本ポリシーが拒否する権限を付与できません。不明な上書きフィールドや無効な鍵ハッシュがある場合、Bursaは有効なポリシーを構築できません。

### 外部ポリシーフック

`signer.policy_hook_url`を設定すると、静的ポリシーがリクエストを許可した後に外部ポリシーチェックを有効にします。環境変数`SIGNER_POLICY_HOOK_URL`はこの設定を上書きします。リクエストのタイムアウトをミリ秒単位で設定するには`signer.policy_hook_timeout_ms`を使用し、`SIGNER_POLICY_HOOK_TIMEOUT_MS`で上書きできます。値が`0`の場合はデフォルトの5秒を使用します。Bursaは設定値を1日以内に制限します。

Bursaはトランザクション概要をJSONの`POST`リクエストとして送信します。概要には次のフィールドを使用します。

```json
{
  "type": "tx",
  "caller": "caller-subject",
  "key": "key-hash",
  "tx_id": "transaction-id",
  "fee": "1000000",
  "outputs": [
    {
      "address": "addr1example",
      "lovelace": "5000000",
      "has_assets": true
    }
  ],
  "certificates": ["stake_registration"],
  "voter_kinds": ["drep_key"],
  "drep_ids": ["hex-credential-id"]
}
```

フックがHTTP `200`とJSONレスポンス`{"allow": true}`を返した場合だけ、署名を許可します。通信エラー、タイムアウト、`200`以外のレスポンス、読み取れないまたは不正なJSON、`true`以外の`allow`値は署名を拒否します。

## トラブルシューティング

- Bursaが`module`が必要だと報告した場合は、`signer.backends[].module`に`PKCS#11`モジュールのパスを設定します。
- Bursaが`token_label`または`slot`が必要だと報告した場合は、トークン選択フィールドを少なくとも1つ指定します。
- Bursaが`pin_env`が必要、またはその環境変数が空だと報告した場合は、`signer.backends[].pin_env`に環境変数の名前を設定し、その変数を通じてユーザーPINを指定します。
- Bursaが無効な鍵タイプを報告した場合は、各`signer.backends[].keys[].type`に設定する値を設定リファレンスに記載されたサポート対象の値のいずれかに変更します。

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
