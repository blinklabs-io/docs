---
title: Bursa設定リファレンス
description: Bursaの署名、KESエージェント、APIのTLSおよびBearer認証設定を構成します。
---

## 概要

このガイドでは、Bursaの署名およびKESエージェント設定、APIのTLSとBearer認証、および`PKCS#11`署名バックエンドの`signer.backends`設定を説明します。コマンドの詳細は[コマンドラインガイド](../003-commands)を参照してください。バックエンドは`PKCS#11`モジュールを使用し、秘密鍵をトークン内に保持して、トークンで`Ed25519`署名を生成します。

## 設定ファイルの読み込み

`bursa kes-agent`は、`--config`で指定した任意の`YAML`ファイルを読み込みます。`--config`を指定しない場合は、`BURSA_CONFIG`の値を設定ファイルのパスとして使用します。両方を指定した場合は`--config`が優先されます。

```bash
bursa kes-agent --config /etc/bursa/config.yaml
```

`YAML`の値を読み込んだ後、環境変数の値で上書きします。環境変数名は各表に記載しています。

## ウォレット環境変数

| 環境変数 | デフォルト | 動作 |
| --- | --- | --- |
| `BURSA_CONNECTOR` | `false` | `dApp`コネクタバックエンドを有効にします。 |
| `BURSA_LEAN` | `false` | `history-expiry`の値をまだ設定ファイルに保存していない初回起動時だけ、lean-node/history-expiryの初期値を設定します。値を設定ファイルに保存した後は、環境変数より保存済みのユーザー設定を優先します。未設定または解釈できない値には`false`を使用します。 |

### history-expiry設定API

Bursaは`history-expiry`設定を永続化し、次のAPIで参照および更新できます。

#### 設定の取得

```http
GET /wallet/settings/history-expiry
```

レスポンスは`enabled`と`restart_required`の2つの`boolean`フィールドを含み、形式は`{ "enabled": boolean, "restart_required": boolean }`です。

#### 設定の更新

```http
PUT /wallet/settings/history-expiry
Content-Type: application/json
```

リクエスト本文は`{ "enabled": boolean }`です。`enabled`は必須のJSON `boolean`値です。不正なJSONまたは`enabled`の欠落にはHTTP `400`を返します。更新に成功すると、APIはGETと同じ`{ "enabled": boolean, "restart_required": boolean }`形式のレスポンスを返します。

`history-expiry`はノード構築時に決まる設定です。実行中のノードが永続化した値をまだ適用していない場合、レスポンスの`restart_required`は`true`になります。

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

ソースからBursaをビルドする場合は、Go `1.26.0`以上が必要です。

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

## 署名者のウォーターマーク

`signer.watermark.type`に`postgres`を設定すると、ウォーターマークと運用証明書カウンターをPostgreSQLに保存できます。既存のメモリ内またはSQLiteの保存方法と異なり、同じコールドキーを保護する署名者レプリカで共有できます。

| YAMLキー | 説明 | 要件 |
| --- | --- | --- |
| `signer.watermark.type` | ウォーターマークの保存先を選択します。 | PostgreSQLを使用する場合は`postgres`を設定します。 |
| `signer.watermark.dsn` | PostgreSQLへの接続に使うDSNをプレーンテキストで指定します。 | `dsn_env`を使用しない場合のフォールバックです。 |
| `signer.watermark.dsn_env` | DSNを格納する環境変数の名前を指定します。 | 指定した環境変数は空でない値を持つ必要があります。`dsn`より優先されます。 |
| `signer.watermark.mode` | 運用証明書の発行カウンター検査を選択します。 | `off`、`warn`、`enforce`のいずれかを設定します。デフォルトは`enforce`です。 |

`postgres`を選択する場合は、`signer.watermark.dsn`または`signer.watermark.dsn_env`でDSNソースを指定します。両方を指定した場合は`dsn_env`を優先し、そこに指定した環境変数が空の場合はBursaが設定をエラーとして扱います。認証情報をコミット済みのYAMLに保存せず、`dsn_env`を使用します。

```yaml
signer:
  watermark:
    type: postgres
    mode: enforce
    dsn_env: BURSA_SIGNER_WATERMARK_DSN
```

```bash
export BURSA_SIGNER_WATERMARK_DSN='postgres://bursa@db.example/bursa?sslmode=require'
```

同じコールドキーを保護する高可用性レプリカは、同じ権威データベースを使用する必要があります。PostgreSQLのデータベースロールには、ウォーターマークテーブルを初期化するための作成権限と、初期化後にテーブルを読み書きする権限が必要です。

### `opcert`の発行カウンター

`signer.watermark.mode`では、Bursaがコールドキーごとに保存した`opcert`の`issue_counter`の最大値を基準に検査します。

- `enforce`（デフォルト）では、Bursaは保存済みの最大値より`issue_counter`が厳密に大きい場合だけ署名します。同じ値または小さい値は拒否します。
- `warn`では、Bursaは同じ値または小さい値を回帰として記録およびログ出力しますが、署名は返します。
- `off`は発行カウンターの検査を適用しません。

### 署名者のヘルスエンドポイント

- `/healthz`は静的な生存確認で、HTTP `200`を返します。
- `/readyz`は、設定したSQLiteまたはPostgreSQLウォーターマークストアに3秒以内に書き込めることを確認します。ストアを利用できない場合または書き込めない場合はHTTP `503`を返し、書き込み可能なストアにはHTTP `200`を返します。メモリ内ストアは外部依存関係を持たないため、HTTP `200`を返します。

## `kes_agent`の設定

| YAMLキー | 環境変数 | 説明 | デフォルトまたは要件 |
| --- | --- | --- | --- |
| `kes_agent.mode` | `KESAGENT_MODE` | KESエージェントの動作モード。`serve-key`は現在のKES署名鍵をプロデューサーへ渡し、`sign`はエージェント内に鍵を保持したままブロックヘッダーに署名します。 | `serve-key`または`sign`。必須 |
| `kes_agent.service_socket` | `KESAGENT_SERVICE_SOCKET` | ブロックプロデューサーが接続するUnixソケット。 | 必須。`kes_agent.control_socket`と異なるパス |
| `kes_agent.control_socket` | `KESAGENT_CONTROL_SOCKET` | `gen-staged-key`、`install-key`、`drop-key`、`info`コマンドを受け付けるUnixソケット。 | 必須。`kes_agent.service_socket`と異なるパス |
| `kes_agent.service_socket_mode` | `KESAGENT_SERVICE_SOCKET_MODE` | サービスソケットの8進ファイルモード。プロデューサーのUIDが異なる場合は、専用グループへの書き込みを許可できます。 | `0600`。他ユーザーの書き込みは不可。例:`0660` |
| `kes_agent.control_socket_mode` | `KESAGENT_CONTROL_SOCKET_MODE` | 制御ソケットの8進ファイルモード。鍵の生成、インストール、破棄を受け付けるため、グループまたは他ユーザーの書き込みを許可できません。 | `0600`。グループまたは他ユーザーの書き込みは不可 |
| `kes_agent.cold_vkey_file` | `KESAGENT_COLD_VKEY_FILE` | プールのコールド検証鍵を含むファイル。`cardano-cli`のテキストエンベロープ、生のバイト列、または16進値を使用できます。 | `kes_agent.cold_vkey_hex`とどちらか一方を指定 |
| `kes_agent.cold_vkey_hex` | `KESAGENT_COLD_VKEY_HEX` | プールのコールド検証鍵を表す16進値。 | `kes_agent.cold_vkey_file`とどちらか一方を指定 |
| `kes_agent.system_start` | `KESAGENT_SYSTEM_START` | Shelleyジェネシスのシステム開始時刻。 | `RFC3339`形式で必須 |
| `kes_agent.slot_length` | `KESAGENT_SLOT_LENGTH` | 1スロットの実時間（秒）。 | `1`。正の値が必須 |
| `kes_agent.slots_per_kes_period` | `KESAGENT_SLOTS_PER_KES_PERIOD` | 1 KES期間に含まれるスロット数。 | 0以外の値が必須。例:`129600` |
| `kes_agent.max_kes_evolutions` | `KESAGENT_MAX_KES_EVOLUTIONS` | 運用証明書を更新できる最大回数。 | `62` |
| `kes_agent.evolve_interval` | `KESAGENT_EVOLVE_INTERVAL` | KES鍵を進めるスケジューラーの間隔。Goの期間文字列を使用します。 | `1m` |
| `kes_agent.guard_file` | `KESAGENT_GUARD_FILE` | 単調増加するKES期間を永続化するガードファイルのパス。 | 必須。デフォルトなし |

`kes_agent.cold_vkey_file`と`kes_agent.cold_vkey_hex`は、プールのコールド署名鍵ではなくコールド検証鍵を指定します。両方を指定した場合は`kes_agent.cold_vkey_hex`を使用します。エージェントはコールド署名鍵を保持しません。

`kes_agent.service_socket_mode`はグループ書き込みを許可できますが、他ユーザーの書き込みを許可するモードは使用できません。`kes_agent.control_socket_mode`はグループまたは他ユーザーの書き込みを許可できません。両方の値を8進文字列として指定します。

期間ガードはエージェントが承認した最高のKES期間を保存し、再起動後にその期間を復元し、期間のロールバックを拒否します。デーモンはこのガードにメモリ内の代替手段を使用しません。

## APIのTLSと`Bearer`認証

| YAMLキー | 環境変数 | 説明 | デフォルトまたは要件 |
| --- | --- | --- | --- |
| `api.address` | `API_LISTEN_ADDRESS` | APIの待ち受けアドレス。 | `127.0.0.1` |
| `api.port` | `API_LISTEN_PORT` | APIの待ち受けポート。 | `8080` |
| `api.tls_cert_file` | `API_TLS_CERT_FILE` | APIサーバー証明書のファイルパス。 | 非ループバックの待ち受けでは必須 |
| `api.tls_key_file` | `API_TLS_KEY_FILE` | APIサーバー秘密鍵のファイルパス。 | 非ループバックの待ち受けでは必須 |
| `api.jwt_secret` | `API_JWT_SECRET` | `HS256`の`Bearer`認証で使用する共有シークレット。設定時はこの値を認証元として使用します。 | 非ループバックの待ち受けでは`api.jwks_url`と排他的に指定。32バイト以上 |
| `api.jwks_url` | `API_JWKS_URL` | `RS256`、`ES256`、または`EdDSA`の`Bearer`認証で使用するJWKSのURL。 | 非ループバックの待ち受けでは`api.jwt_secret`と排他的に指定。`HTTPS`が必須 |
| `api.jwt_issuer` | `API_JWT_ISSUER` | `Bearer`トークンの発行者を検証する制約。 | 任意 |
| `api.jwt_audience` | `API_JWT_AUDIENCE` | `Bearer`トークンの対象者を検証する制約。 | 任意 |

`api.address`にループバック以外のアドレスを設定する場合、起動には`api.tls_cert_file`と`api.tls_key_file`の両方、および`api.jwt_secret`または`api.jwks_url`のどちらか一方が必要です。TLSファイルが片方だけの場合、または`Bearer`認証元を両方またはどちらも指定した場合、起動できません。

`api.jwt_secret`には32バイト以上のシークレットを指定し、設定ファイルへ直接保存せずデプロイメントのシークレットとして管理します。`api.jwks_url`は非ループバックの待ち受けでは`HTTPS` URLが必要です。ループバックの待ち受けではTLSファイルと`Bearer`認証元を省略でき、開発用の`api.jwks_url`には`HTTP` URLも使用できます。

`api.jwt_issuer`と`api.jwt_audience`は任意の制約です。どちらも指定しない場合、発行者または対象者による追加の制約は適用されません。

## `socket_mode`から分割設定への移行

`kes_agent.socket_mode`はサポートされていません。既存の`kes_agent.socket_mode`を削除し、サービスソケットには`kes_agent.service_socket_mode`、制御ソケットには`kes_agent.control_socket_mode`を個別に設定します。

サービスソケットでプロデューサーのグループアクセスが必要な場合は、`kes_agent.service_socket_mode`に`0660`などのグループ書き込みを許可する値を指定できます。制御ソケットは鍵をインストールまたは破棄できるため、`kes_agent.control_socket_mode`にグループまたは他ユーザーの書き込みを許可する値を指定できません。新しい設定を省略した場合、両方のソケットは`0600`になります。

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
