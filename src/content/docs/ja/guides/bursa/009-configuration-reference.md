---
title: 設定リファレンス
description: Bursa の kes-agent と従来の API のセキュリティに関する YAML と環境変数のリファレンス。
---
<a id="overview"></a>

## 概要

このガイドは Bursa の署名サービスと KES エージェントの設定を説明します。`signer.backends` は `pkcs11`、`nitro`、`confidential-space` の署名バックエンドに対応します。

<a id="load-a-configuration-file"></a>

## 設定ファイルの読み込み

`kes-agent` は `--config` で YAML ファイルを指定できます。フラグを省略した場合は `BURSA_CONFIG` からパスを読みます。どちらにもパスがない場合は YAML を使わず、環境変数と組み込みの既定値を読み込みます。環境変数は対応する YAML の値を上書きします。

```bash
bursa kes-agent --config /etc/bursa/config.yaml
```

コマンドは、どちらの Unix ソケットを開くよりも前に設定値を検証します。使い方は CLI ガイドの [API セクション](../003-commands#api)と [kes-agent セクション](../003-commands#kes-agent)を参照してください。

<a id="wallet-environment-variable"></a>

## ウォレットの環境変数

| 環境変数 | 既定値 | 動作 |
| --- | --- | --- |
| `BURSA_CONNECTOR` | `false` | dApp コネクターバックエンドを有効にします。 |
| `BURSA_LEAN` | `false` | 初回実行時にのみ、永続化する lean ノードの履歴期限切れ設定の初期値を指定します。未設定または真偽値として解釈できない場合は `false` です。永続化後は、この変数を設定、変更しても保存済みの選択を上書きしません。 |

<a id="history-expiry-api"></a>

## 履歴期限切れ API

アクセス制限のない履歴期限切れエンドポイントは、Bursa が永続化する lean ノード設定を読み取り、更新します。

<a id="get-the-history-expiry-setting"></a>

### 履歴期限切れ設定の取得

```http
GET /wallet/settings/history-expiry
```

応答は次の形式です。

```json
{ "enabled": boolean, "restart_required": boolean }
```

<a id="update-the-history-expiry-setting"></a>

### 履歴期限切れ設定の更新

```http
PUT /wallet/settings/history-expiry
```

必須の `enabled` フィールドを JSON の真偽値として送信します。

```json
{ "enabled": boolean }
```

不正な JSON または `enabled` のないリクエストには HTTP `400` を返します。更新成功時は `GET` と同じ `enabled` と `restart_required` の形式を返します。履歴期限切れ設定はノードの構築時に適用するため、稼働中のノードが永続化された設定をまだ反映しておらず再起動が必要な場合、`restart_required` は `true` になります。

<a id="configuration-reference"></a>

## 設定リファレンス

`signer.backends` にバックエンドを追加し、`type` に選択した種類を指定して、そのバックエンドに適用するフィールドを設定します。

| 設定パス | 用途 | 検証 |
| --- | --- | --- |
| `signer.backends[].type` | 署名バックエンドを選択します。 | `pkcs11`、`nitro`、`confidential-space` を指定します。 |
| `signer.backends[].address` | アテステーション付き署名バックエンドのエンドポイントです。 | `http://`、`https://`、`unix:///` のエンドポイントを指定します。 |
| `signer.backends[].module` | `.so` ファイルを含む `PKCS#11` モジュールのパスです。 | 必須です。空の値は拒否されます。 |
| `signer.backends[].token_label` | ラベルでトークンまたはスロットを選択します。 | このフィールドまたは `slot` の少なくとも一方が必須です。 |
| `signer.backends[].slot` | スロット ID を明示して選択します。 | このフィールドまたは `token_label` の少なくとも一方が必須です。 |
| `signer.backends[].pin_env` | ユーザー PIN を格納する環境変数名です。 | 必須です。指定した環境変数に空でない値を設定します。平文の設定から PIN を読み取ることはありません。 |
| `signer.backends[].keys[]` | トークンオブジェクトの任意の許可リストです。 | 指定する場合、各項目に `name` と `type` が必要です。 |
| `signer.backends[].keys[].name` | トークンオブジェクトの `CKA_LABEL` と照合します。 | 各 `keys` 項目に必須です。 |
| `signer.backends[].keys[].type` | 一致するトークンオブジェクトに Cardano の鍵の種類を割り当てます。 | 各 `keys` 項目に必須です。`payment`、`stake`、`drep`、`cc-hot`、`cc-cold`、`pool`、`policy` を使用します。 |
| `signer.backends[].root_ca_file` | AWS Nitro Enclaves のルート証明書です。 | `nitro` で必須です。固定された AWS Nitro ルート証明書を使用します。 |
| `signer.backends[].pcrs` | 期待する Nitro PCR インデックスと 16 進数値の組です。 | `nitro` で必須です。PCR0 が存在し、0 以外である必要があります。 |
| `signer.backends[].audience` | Confidential Space アテステーショントークンに必要な audience です。 | `confidential-space` で必須です。 |
| `signer.backends[].image_digest` | 必要な Confidential Space コンテナイメージのダイジェストです。 | `confidential-space` で必須です。`sha256:` ダイジェストを使用します。 |
| `signer.backends[].jwks_url` | Confidential Space アテステーショントークンの署名鍵セットです。 | `confidential-space` で任意です。既定では Google の公開トークン署名セットを使用します。 |

<a id="wallet-storage-and-encryption"></a>

### ウォレットの保存と暗号化

次のフィールドでウォレットの永続化と SOPS 暗号化を設定します。

| 設定パス | 環境変数 | 用途 | 既定値または要件 |
| --- | --- | --- | --- |
| `storage.backend` | `STORAGE_BACKEND` | ウォレットのストレージバックエンドを選択します。 | AWS Secrets Manager を使用するには `aws` を指定します。 |
| `aws.secret_prefix` | `AWS_SECRET_PREFIX` | AWS Secrets Manager 内のウォレット秘密情報の接頭辞です。 | `storage.backend` が `aws` の場合は必須です。 |
| `aws.kms_key_arn` | `AWS_KMS_KEY_ARN` | SOPS 暗号化に使用する AWS KMS マスター鍵を選択します。 | AWS KMS が暗号鍵を提供する場合、SOPS のマスター鍵リソースの 1 つとして設定します。 |
| `age.recipients` | `AGE_RECIPIENTS` | SOPS 暗号化の age 受信者一覧です。 | カンマ区切りで指定します。 |
| `storage.allow_unencrypted_wallet_storage` | `STORAGE_ALLOW_UNENCRYPTED_WALLET_STORAGE` | ウォレットを暗号化せずに保存することを許可します。 | SOPS マスター鍵なしのファイル保存、または SQLite 保存では明示的に有効にします。 |

SOPS 暗号化には、少なくとも 1 つのマスター鍵リソースの設定が必要です。不正な鍵リソースは暗号化の開始前に拒否されます。暗号化なしの保存を明示的に許可すると、ウォレットを暗号化せずに永続化できます。

<a id="build-requirements"></a>

## ビルド要件

ソースから Bursa をビルドするには Go `1.26.8` 以降が必要です。`PKCS#11` バックエンドには、さらに `CGO` と `pkcs11` ビルドタグが必要です。

`PKCS#11` バックエンドを含めるには `CGO` を有効にし、`pkcs11` ビルドタグでコンパイルします。このタグなしで設定からバックエンドを選択すると、直ちに次のエラーを返して失敗します。

```text
pkcs11 backend not compiled in (build with -tags pkcs11)
```

既定のビルドで `PKCS#11` のサポートが暗黙に有効になることはありません。

<a id="signing-constraints"></a>

## 署名の制約

`PKCS#11` バックエンドは秘密鍵をトークン上に保持し、トークンに `Ed25519` 署名の生成を要求します。`CIP-8` の `COSE` 署名はこのバックエンドに対応しません。`PKCS#11` 鍵を使用する `CIP-8` リクエストには `CodeUnsupported` を返します。

<a id="signer-startup-safety"></a>

## 署名サービスの起動時の安全性

`software`/`file` 署名バックエンドは、平文の秘密鍵をプロセスメモリに読み込みます。ローカルマシン以外で待ち受ける署名サービスでは、次の保護が適用されます。

| 設定パス | 環境変数 | 既定値 | 動作 |
| --- | --- | --- | --- |
| `signer.allow_insecure_file_backend` | `SIGNER_ALLOW_INSECURE_FILE_BACKEND` | `false` | `software`/`file` バックエンドを非ループバックの署名リスナーで明示的に許可します。 |
| `signer.listen_address` | `SIGNER_LISTEN_ADDRESS` | `""` | 署名リスナーがループバックを使用するかどうかを決めます。 |

`software`/`file` バックエンドを設定した場合、`signer.listen_address` がループバック以外で、`signer.allow_insecure_file_backend` が `true` でなければ、起動を拒否します。空の `signer.listen_address` は全インターフェイスを意味し、この検査ではループバック以外とみなします。ループバックリスナーまたは明示的な `true` の指定で起動できますが、このバックエンドの使用中は常に警告を出します。本番環境では、平文の鍵ではなく `Vault` や `SOPS` などの鍵保管バックエンドを使用してください。

<a id="signer-watermark"></a>

## 署名のウォーターマーク

`signer.watermark` は、署名の安全性を守るウォーターマークと運用証明書の発行カウンターを保存します。`mem` はメモリに保持し、`file` は SQLite、`postgres` は複数の署名レプリカが共有できる永続的な PostgreSQL データベースに保存します。

| 設定パス | 用途 | 既定値または要件 |
| --- | --- | --- |
| `signer.watermark.type` | ウォーターマークストアを選択します。 | `mem`、`file`、`postgres` に対応します。 |
| `signer.watermark.path` | file ストアの SQLite データベースパスです。 | `signer.watermark.type` が `file` の場合は必須です。 |
| `signer.watermark.dsn` | PostgreSQL 接続文字列を直接指定します。 | `dsn_env` を設定していない場合の代替値です。 |
| `signer.watermark.dsn_env` | PostgreSQL 接続文字列を格納する環境変数名です。 | `dsn` より優先されます。指定した環境変数が空ならエラーです。`postgres` にはこの変数または `dsn` からの DSN が必須です。 |
| `signer.watermark.mode` | 運用証明書の発行カウンターの保護を制御します。 | 既定値は `enforce`。`off`、`warn`、`enforce` を指定できます。 |

`mem` ストアは `warn` または `off` でのみ有効です。`enforce` モードは永続化する `file` または `postgres` ストレージを必要とします。空または不明なモードは `enforce` として扱われるため、どちらの場合も `mem` では起動に失敗します。`postgres` ストアには `dsn` または `dsn_env` が必要です。

署名レプリカ間で同じ正規のウォーターマークとカウンター状態を共有する場合は、`postgres` を使用します。同じ鍵を保護するすべてのレプリカを、そのデータベースに接続してください。データベースのロールには、ウォーターマークのテーブル作成と読み書きの権限が必要です。認証情報はコミットする YAML に含めず、リモート接続にはデプロイ構成に適した検証付き TLS を設定してください。

```yaml
signer:
  watermark:
    type: postgres
    mode: enforce
    dsn_env: BURSA_SIGNER_WATERMARK_DSN
```

YAML にパスワードを埋め込まず、指定した環境変数から DSN を渡します。

```bash
export BURSA_SIGNER_WATERMARK_DSN='postgres://bursa@db.example.com:5432/bursa?sslmode=verify-full'
```

`mode` は、コールド鍵ごとに発行カウンターの保護を適用します。

- `enforce` では、各運用証明書の `issue_counter` が、そのコールド鍵の保存済み最大値より厳密に大きい必要があります。同じか小さい値は拒否されます。
- `warn` は、同じか小さいカウンターへの後退を記録してログ出力しますが、署名は返します。
- `off` は発行カウンターの保護を無効にします。

<a id="operational-certificate-signer-policy"></a>

## 運用証明書の署名ポリシー

`signer.keys[].allowed_requests` に `opcert` を追加すると、`type: opcert` の `POST /v1/sign` リクエストを許可します。鍵にポリシーがない場合、またはポリシーに `opcert` が含まれない場合は拒否します。

```yaml
signer:
  keys:
    - hash: "0000000000000000000000000000000000000000000000000000000000"
      allowed_requests:
        - opcert
```

<a id="signer-health-endpoints"></a>

## 署名サービスのヘルスエンドポイント

`/healthz` は固定の生存性を示し、常に HTTP `200` を返します。

`/readyz` は 3 秒のタイムアウトで設定済みのウォーターマークストアを確認します。SQLite と PostgreSQL では、署名に必要なウォーターマークの書き込みを受け入れることを検証します。正常で書き込み可能なら HTTP `200`、利用不能または書き込み不能なら HTTP `503` を返します。メモリ内ストアには外部依存がなく、準備完了として HTTP `200` を返します。

<a id="kes_agent"></a>

## `kes_agent`

`kes_agent` YAML キーにデーモンを設定します。各フィールドは、対応する `KESAGENT_*` 環境変数でも指定できます。

| YAML キー | 環境変数 | 用途 | 既定値または要件 |
| --- | --- | --- | --- |
| `kes_agent.mode` | `KESAGENT_MODE` | `serve-key` は現在の KES 署名鍵をプロデューサーに渡します。`sign` は鍵を渡さずにブロックヘッダーに署名します。 | `serve-key` または `sign` を指定します。 |
| `kes_agent.service_socket` | `KESAGENT_SERVICE_SOCKET` | ブロックプロデューサーを接続する Unix ソケットです。 | サービスソケットのパスを指定します。 |
| `kes_agent.control_socket` | `KESAGENT_CONTROL_SOCKET` | KES 鍵管理コマンドを実行する Unix ソケットです。 | `service_socket` と異なるパスを指定します。 |
| `kes_agent.service_socket_mode` | `KESAGENT_SERVICE_SOCKET_MODE` | サービスソケットの 8 進数権限モードです。異なるユーザー ID のプロデューサーにはグループアクセスを許可できます。 | 既定は `0600`。その他のユーザーに書き込みを許可してはいけません。 |
| `kes_agent.control_socket_mode` | `KESAGENT_CONTROL_SOCKET_MODE` | 制御ソケットの 8 進数権限モードです。 | 既定は `0600`。グループやその他のユーザーに書き込みを許可してはいけません。 |
| `kes_agent.cold_vkey_file` | `KESAGENT_COLD_VKEY_FILE` | `cardano-cli` テキストエンベロープ、生バイト、16 進数からプールのコールド検証鍵を読み込みます。 | このフィールドまたは `cold_vkey_hex` が必須です。 |
| `kes_agent.cold_vkey_hex` | `KESAGENT_COLD_VKEY_HEX` | プールのコールド検証鍵をインラインの 16 進数から読み込みます。 | このフィールドまたは `cold_vkey_file` が必須です。両方がある場合はインラインの 16 進数を使用します。 |
| `kes_agent.system_start` | `KESAGENT_SYSTEM_START` | Shelley ジェネシスの開始時刻です。 | RFC3339 のタイムスタンプを指定します。 |
| `kes_agent.slot_length` | `KESAGENT_SLOT_LENGTH` | 1 スロットの実時間の長さを秒で指定します。 | 既定値は `1`。正の値が必要です。 |
| `kes_agent.slots_per_kes_period` | `KESAGENT_SLOTS_PER_KES_PERIOD` | 1 KES 期間のスロット数です。 | `0` より大きい値を指定します。 |
| `kes_agent.max_kes_evolutions` | `KESAGENT_MAX_KES_EVOLUTIONS` | 運用証明書の進化回数を制限します。 | 既定値は `62` です。 |
| `kes_agent.evolve_interval` | `KESAGENT_EVOLVE_INTERVAL` | スケジューラーの間隔を `1m` などの Go の期間で指定します。 | 既定値は `1m`。Go の期間を指定します。 |
| `kes_agent.guard_file` | `KESAGENT_GUARD_FILE` | 単調増加する KES 期間ガードを永続的なパスに保存します。 | 永続的なパスを指定します。 |

サービスソケットと制御ソケットには異なるパスが必要です。8 進数の権限モードを指定でき、両方の既定値は所有者のみの `0600` です。異なるユーザー ID で動くプロデューサーのため、サービスソケットにはグループアクセスを許可できますが、その他のユーザーに書き込みは許可できません。制御ソケットは KES 鍵のインストールや削除を受け付けるため、書き込みは所有者のみに制限する必要があります。

`cold_vkey_file` または `cold_vkey_hex` のいずれかから、32 バイトのコールド検証鍵が必要です。起動には、RFC3339 形式の `system_start`、正の `slot_length`、0 以外の `slots_per_kes_period`、永続的な `guard_file` のパスも必要です。

`kes_agent.guard_file` が空の場合、KES エージェントは起動を拒否します。期間ガードは認可した最大の KES 期間を永続化し、再起動後に復元して、期間のロールバックを拒否します。このガードをメモリ内で代替する機能はありません。

```yaml
kes_agent:
  mode: sign
  service_socket: /run/bursa/kes-agent.sock
  control_socket: /run/bursa/kes-agent-control.sock
  service_socket_mode: "0660"
  control_socket_mode: "0600"
  cold_vkey_file: /etc/bursa/pool-cold.vkey
  system_start: "2022-03-31T00:00:00Z"
  slot_length: 1
  slots_per_kes_period: 129600
  max_kes_evolutions: 62
  evolve_interval: 1m
  guard_file: /var/lib/bursa/kes-period.guard
```

<a id="migrate-socket-permissions"></a>

### ソケット権限の移行

従来の `kes_agent.socket_mode` を、`kes_agent.service_socket_mode` と `kes_agent.control_socket_mode` の両方に置き換えます。古いキーは無効です。制御ソケットは `0600` のままにし、プロデューサーにグループアクセスが必要な場合はサービスソケットだけを広げてください。

<a id="legacy-api-security"></a>

## 従来の API のセキュリティ

従来の API は `api` YAML キーに設定します。

| YAML キー | 環境変数 | 用途 | 既定値または要件 |
| --- | --- | --- | --- |
| `api.tls_cert_file` | `API_TLS_CERT_FILE` | このファイルのサーバー TLS 証明書を提示します。 | 非ループバックのリスナーでは必須です。 |
| `api.tls_key_file` | `API_TLS_KEY_FILE` | このファイルのサーバー TLS 秘密鍵を使用します。 | 非ループバックのリスナーでは必須です。 |
| `api.jwt_secret` | `API_JWT_SECRET` | HS256 シークレットで Bearer トークンを認証します。 | `api.jwks_url` の代わりに使用し、32 バイト以上を指定します。 |
| `api.jwks_url` | `API_JWKS_URL` | JWKS エンドポイントで Bearer トークンを認証します。 | `api.jwt_secret` の代わりに使用します。ループバックでの開発を除き HTTPS が必須です。 |
| `api.jwt_issuer` | `API_JWT_ISSUER` | Bearer トークンの issuer を制限します。 | 受け入れる issuer を制限する場合に設定します。 |
| `api.jwt_audience` | `API_JWT_AUDIENCE` | Bearer トークンの audience を制限します。 | 受け入れる audience を制限する場合に設定します。 |
| `api.jwt_admin_subjects` | `API_JWT_ADMIN_SUBJECTS` | 永続化したウォレットの管理用 JWT subject の、空でない許可リストです。 | いずれかのウォレットストレージを設定する場合、1 つ以上の空でない subject が必要です。リストが空または未設定なら起動を拒否します。 |

ループバック以外の従来の API リスナーには、読み取り可能な TLS ファイルの両方と、Bearer の信頼元 `api.jwt_secret` または `api.jwks_url` のちょうど一方が必要です。信頼元がちょうど 1 つでなければ起動を拒否します。HS256 シークレットは 32 バイト以上が必要です。JWKS URL は HTTPS を使用し、ループバックでの開発に限り HTTP を使用できます。

API は既定でループバックを使用します。TLS ファイルを省略したループバックでの開発は平文で利用できますが、ループバック以外のリスナーでは TLS と Bearer 認証が必須です。

いずれかのウォレットストレージバックエンドを設定した場合、`/api/wallet/list`、`/api/wallet/get`、`/api/wallet/update`、`/api/wallet/delete` には、subject が `api.jwt_admin_subjects` に含まれる有効な Bearer JWT が必要です。

```yaml
api:
  address: 0.0.0.0
  port: 8080
  tls_cert_file: /run/secrets/bursa-api-cert.pem
  tls_key_file: /run/secrets/bursa-api-key.pem
  jwks_url: https://identity.example.com/.well-known/jwks.json
  jwt_issuer: https://identity.example.com
  jwt_audience: bursa-api
```

`api.jwt_secret` はコミットする YAML ではなく、環境変数またはデプロイ用の秘密情報に保存します。

<a id="signer-transaction-policies"></a>

## 署名サービスのトランザクションポリシー

`signer.keys[].tx_policy` で、操作の種類を認識するトランザクション権限を設定します。大まかな `allow_certificates` と `allow_votes` も使用できますが、空でない `allowed_certificates` は `allow_certificates` より優先されます。空でない `allowed_voter_kinds` または `allowed_drep_ids` は、`allow_votes` ではなく許可リストモードを選択します。該当する許可リストも真偽値の許可設定もない場合、既定では操作を拒否します。

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

`allowed_certificates` には次の値を指定できます。

`stake_registration`、`stake_deregistration`、`stake_delegation`、`pool_registration`、`pool_retirement`、`genesis_key_delegation`、`move_instantaneous_rewards`、`registration`、`deregistration`、`vote_delegation`、`stake_vote_delegation`、`stake_registration_delegation`、`vote_registration_delegation`、`stake_vote_registration_delegation`、`auth_committee_hot`、`resign_committee_cold`、`drep_registration`、`drep_deregistration`、`drep_update`.

`allowed_voter_kinds` には次の値を指定できます。

`committee_hot_key`、`committee_hot_script`、`drep_key`、`drep_script`、`staking_pool_key`.

`allowed_drep_ids` に 16 進数の資格情報 ID を指定すると、DRep 投票者をその ID に制限します。このリストは DRep 資格情報 ID を持たない投票者も拒否します。記載された証明書と投票者の種類のみを受け入れます。操作の種類、または有効な許可リストが必要とする詳細をデコードできない場合は署名を拒否します。

<a id="per-caller-transaction-restrictions"></a>

### 呼び出し元ごとのトランザクション制限

`signer.caller_policies` は、呼び出し元の subject、鍵ハッシュ、権限を狭めるトランザクション上書き設定の順のマップとして使用します。

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

`signer.caller_policies` の各キーは呼び出し元の subject を識別し、その下の各キーは鍵ハッシュを識別します。上書きできるフィールドは、`networks`、`allowed_outputs`、`max_output_ada`、`max_total_out_ada`、`max_fee_ada`、`allowed_certificates`、`allowed_voter_kinds`、`allowed_drep_ids`、`forbid_certificates`、`forbid_mint`、`forbid_withdrawals`、`forbid_votes`、`forbid_proposals`、`forbid_treasury` です。

Bursa は、呼び出し元ごとの上書き設定と鍵の基本ポリシーの共通部分を使用します。上書きは権限を狭めることだけが可能で、基本ポリシーが拒否する権限を付与することはできません。不明なフィールドや不正な鍵ハッシュがある場合、有効なポリシーを構築できません。

<a id="external-policy-hook"></a>

### 外部ポリシーフック

`signer.policy_hook_url` は、静的ポリシーが承認した後の外部ポリシー検査を有効にします。環境変数 `SIGNER_POLICY_HOOK_URL` が優先されます。タイムアウトは `signer.policy_hook_timeout_ms` でミリ秒単位に設定し、`SIGNER_POLICY_HOOK_TIMEOUT_MS` が優先されます。`0` は既定の 5 秒を使用します。設定値の上限は 1 日です。

Bursa は次のフィールドを含むトランザクション概要を JSON の `POST` リクエストとして送信します。

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

フックが HTTP `200` と JSON 応答 `{"allow": true}` を返した場合のみ署名を許可します。通信エラー、タイムアウト、`200` 以外の応答、読めないか不正な JSON、`true` 以外の `allow` 値では、すべて署名を拒否します。

<a id="troubleshooting"></a>

## トラブルシューティング

- `module` が必要と報告された場合、`signer.backends[].module` に `PKCS#11` モジュールのパスを設定します。
- `token_label` または `slot` が必要と報告された場合、少なくとも一方のトークン選択フィールドを指定します。
- `pin_env` が必要、またはその環境変数が空と報告された場合、`signer.backends[].pin_env` に環境変数名を指定し、その変数でユーザー PIN を渡します。
- 鍵の種類が不正と報告された場合、各 `signer.backends[].keys[].type` をリファレンスに記載された対応値に設定します。


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
