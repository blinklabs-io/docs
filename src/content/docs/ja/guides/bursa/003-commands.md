---
title: コマンドラインガイド
description: Bursaコマンドラインガイド。
---

これでコマンドラインを使用してCardanoウォレットを作成し、ウォレット管理に必要なすべてのファイルを出力できます。また、APIを起動してAPI Swaggerドキュメントにアクセスすることもできます。

Bursaは、マルチシグネチャスクリプト、ハッシュ、鍵の生成にも使用できます。これにはCardanoステークプールの運用に必要な鍵や証明書も含まれます。

現在、Bursaが実行できるコマンドのカテゴリは11個あり、Cardanoユーザーにとって強力なツールとなっています。

> **Bursaコマンドカテゴリ**
> 1. [wallet](#wallet) &nbsp; - Cardanoウォレットの管理に必要なウォレットおよびファイルを生成するコマンド
> 2. [api](#api)  &emsp;&nbsp;&nbsp; - APIを実行するコマンド
> 3. [kes-agent](#kes-agent) &emsp;&nbsp;&nbsp; - KESエージェントを実行するコマンド
> 4. [cert](../004-cert-commands)   &emsp;&nbsp; - 各種Cardano証明書を生成するコマンド
> 5. [hash](../005-hash-commands)  &nbsp;&nbsp;&nbsp; - Cardanoで使用される暗号ハッシュを生成するコマンド
> 6. [script](../006-script-commands) &nbsp;&nbsp; - マルチシグネチャ操作用のコマンド
> 7. [address](../007-address-commands) - Cardanoアドレスを操作するコマンド
> 8. [key](../008-key-commands)  &emsp;&nbsp;&nbsp; - ニーモニックから個別の鍵を導出するコマンド
> 9. [tx](#tx) - オフライントランザクション操作
> 10. [sign](#sign) - CIP-8/CIP-30メッセージの署名と検証
> 11. [signer](#signer) - リモート署名サービス

***

<a name="wallet"></a>

<a id="use-command-line-to-create-a-wallet-and-output-wallet-files"></a>

## コマンドラインでウォレットを作成しウォレットファイルを出力

コマンドラインを使用してウォレットを作成し、Cardanoウォレット管理に必要なすべてのファイルを出力できます。

この例では、`--output`フラグを使用して出力先ディレクトリを指定し、`dev`フォルダにウォレットファイルを作成します。

```
./bursa wallet create --output dev
```

![bursa-wallet-create-with-output-string](/bursa-wallet-create-with-output-string.png)

これで`dev`ディレクトリにすべてのウォレットファイルが作成されます。

![bursa-wallet-files](/bursa-wallet-files.png)

### ウォレットの復元と確認

保護されたファイルから既存のBIP-39ニーモニックを読み込み、生成された鍵ファイルを確認します。

```sh
./bursa wallet restore --mnemonic-file dev/seed.txt --output restored-wallet
./bursa wallet load --dir restored-wallet
```

`--output` を指定するとアドレスと鍵ファイルを書き出し、省略するとアドレスのみをログに出力します。復元ではニーモニックを出力先にコピーしません。ニーモニックと署名鍵ファイルは非公開で安全にバックアップしてください。ニーモニックの入力元は、非推奨の `--mnemonic`、`MNEMONIC` 環境変数、`--mnemonic-file`、デフォルトの `seed.txt` ファイルの順で確認されます。`--mnemonic-file` を使う場合は `MNEMONIC` を解除してください。`--mnemonic` と `--password` 引数は他のローカルユーザーに見えるため非推奨です。代わりに `--mnemonic-file` と `--password-file` を使用してください。BIP-39パスワードを使って導出したウォレットには `--password-file /path/to/password.txt` を指定します。これは鍵の導出用パスワードであり、出力ファイルの暗号化ではありません。

`wallet load` は既存の鍵ファイルを読み込み、新しいウォレットを導出しません。秘密鍵の16進数は標準では非表示で、`--show-secrets` を明示すると表示されます。各オプションは `./bursa wallet restore --help` と `./bursa wallet load --help` で確認できます。

***

<a name="api"></a>

<a id="use-command-line-to-start-api"></a>

## コマンドラインでAPIを起動

APIを使用したい場合は、以下のコマンドを実行してコマンドラインから起動できます。

```
./bursa api
```

![bursa-start-api](/bursa-start-api.png)

<a id="access-api-swagger-documentation"></a>

## API Swaggerドキュメントにアクセス

IP:port/swagger/index.htmlにアクセスしてBursa APIを確認できます。必要に応じてIPとポートを調整してください。

```
http://localhost:8080/swagger/index.html
```

![bursa-swagger](/bursa-swagger.png)

ループバック以外でAPIを公開する場合のTLSとBearer認証の要件は、[設定リファレンス](../009-configuration-reference)を参照してください。

<a name="kes-agent"></a>

<a id="use-command-line-to-start-kes-agent"></a>

## コマンドラインで `kes-agent` を起動

`kes-agent` は `serve-key` または `sign` モードで起動します。設定ファイルは、以下のコマンドの `--config` フラグで指定します。

```
./bursa kes-agent --config /path/to/kes-agent.yaml
```

`--config` にはYAML設定ファイルのパスを指定します。フラグを省略した場合は、`BURSA_CONFIG` 環境変数で設定ファイルのパスを指定できます。

<a id="kes-agent-control"></a>
### `kes-agent` の制御コマンド

稼働中の `kes-agent` にローカル制御ソケット経由でコマンドを送るには、`bursa kes-agent control` を使用します。制御ソケットは次の規則で選択します。

- `--socket <path>` を指定すると、そのパスを使用します。この指定は設定ファイルの値より優先されます。
- `--socket` を省略すると、`--config <path>` で指定した YAML ファイルの `kes_agent.control_socket` を使用します。
- `--config` も省略した場合は、環境変数 `BURSA_CONFIG` で選択した YAML ファイルの `kes_agent.control_socket` を使用します。これ以外の方法では制御ソケットを検出しません。

`--profile <name>` は、複数のプロファイルを持つエージェントでコマンドを実行するプロファイルを指定します。プロファイルを指定しない `info` はすべてのプロファイルを一覧表示し、単一プロファイルのエージェントでは `--profile` を省略できます。

次のサブコマンドを使用できます。

- `info` はエージェントの鍵の状態を表示します。
- `gen-staged-key [--out <path>] [--attestation-out <path>]` はステージ済み KES 鍵を生成し、検証鍵を表示します。`--out` を指定すると、検証鍵を `cardano-cli` エンベロープとして指定したファイルに書き込みます。`--attestation-out` は任意で、エージェントが返す署名済みステージ済み鍵アテステーションを、署名者が運用証明書を要求するための JSON として指定したファイルに書き込みます。`--out` が書き込む KES 検証鍵の `cardano-cli` エンベロープとは別の出力です。アテステーションは、エージェントがアテステーション対応 TLS リスナーのアイデンティティを持つ場合にだけ返されます。`--attestation-out` を指定したときにアテステーションが返されない場合、CLI は失敗し、空のファイルを作成しません。エージェントからの応答を先に表示し、どちらの出力も既存のファイルを置き換えません。
- `install-key --opcert <path>` は、必須の `--opcert` で指定した `NodeOperationalCertificate` の `cardano-cli` エンベロープを読み込み、ステージ済み鍵をインストールします。
- `drop-key --target <value>` は、必須の `--target` で指定した鍵を削除します。`<value>` には `staged`、`active`、`all` のいずれかだけを指定できます。

各サブコマンドはエージェントの応答を JSON として出力し、バイト列のフィールドを 16 進数で表示します。`gen-staged-key` の応答には、アテステーションが存在する場合だけ `attestation_spki_sha256` が含まれ、アテステーションのアイデンティティを示す SPKI の SHA-256 値を示します。エージェントがコマンドを拒否すると、CLI は応答を表示したうえで 0 以外の終了コードを返します。1 回の制御要求には 30 秒の制限があり、要求をキャンセルすると待機中のソケット入出力を直ちに停止します。

Bursa は、アテステーション対応リスナーに相互 TLS（mTLS）とクライアント証明書の検証を設定し、その証明書の SPKI SHA-256 が対象プロファイルの `control_client_spki_sha256` に登録されている場合にだけリモート制御を許可します。リモートで許可するコマンドは `info`、`gen-staged-key`、`install-key` です。制御用のピンは署名権限を与えません。Bursa はリモートの `drop-key` を拒否するため、`drop-key` はローカル制御ソケットからのみ実行できます。

#### KES 鍵のローテーション

次の順序で KES 鍵をローテーションします。運用証明書はエージェントではなく、プールのコールド鍵を使ってオフラインで発行します。

1. `gen-staged-key` でステージ済み鍵を生成します。
2. 生成した検証鍵に対する運用証明書を、プールのコールド鍵でオフライン発行します。
3. `install-key` で運用証明書をインストールします。
4. `info` でエージェントの状態を確認します。

```sh
./bursa kes-agent control --config /path/to/kes-agent.yaml gen-staged-key --out kes.vkey
# kes.vkey に対する運用証明書をプールのコールド鍵でオフライン発行し、node.cert として保存
./bursa kes-agent control --config /path/to/kes-agent.yaml install-key --opcert node.cert
./bursa kes-agent control --config /path/to/kes-agent.yaml info
```

`kes_agent.mode` に `serve-key` または `sign` を設定します。`kes_agent` YAML のフィールドと環境変数、および必須のソケット、鍵、タイミング設定については[設定リファレンス](../009-configuration-reference)を参照してください。

### `kes-agent` の準備状態を確認

以下のコマンドはエージェントが準備完了の場合にのみ正常終了します。exec readiness probeとして利用できます。

```sh
bursa kes-agent ready --config /path/to/kes-agent.yaml
```

***

<a name="tx"></a>

## オフライントランザクション操作

`tx` コマンドはノードに接続せず、既存のトランザクションを確認して署名します。`unsigned.tx` には16進数CBOR、または `cborHex` を含むJSONテキストエンベロープを指定します。テキストエンベロープの型にEraが含まれている場合、BursaはそのEraを使用します。`--era`も指定する場合は、エンベロープのEraと一致させてください。

`tx build` は例外で、ノードのプロトコルパラメータを取得してプール操作トランザクションを構築します。`--socket-path`、`--network`、`--change-address` を指定し、ノードに接続できる状態で実行してください。`tx decode`、`tx sign`、`tx witness`、`tx assemble` は既存ファイルの検査や署名を行うオフライン操作です。

```sh
./bursa tx build \
  --socket-path /path/to/node.socket \
  --network mainnet \
  --change-address "$CHANGE_ADDRESS" \
  --max-fee 3000000 \
  --out-file unsigned.tx
```

`--max-fee` の既定値は `2_000_000` lovelace（2 ADA）です。Bursa はノードから取得したパラメータに基づく最小手数料がこの上限を超えると、トランザクションの構築を失敗させます。必要な場合は、上の例のように `--max-fee` に、より大きい lovelace 値を明示してください。

`tx sign`、`tx witness`、`tx assemble` は `--era` でトランザクションの era を指定できます。`--era` には、たとえば `babbage` または `conway` を指定します。入力が era を宣言せず、そのCBORが複数の era で有効になる場合は `--era` が必要です。

入力が `Tx ConwayEra` のような era を宣言するJSONテキストエンベロープであれば、`--era` を省略してもその宣言から era を解決します。eraを宣言しない生のCBORは、そのCBORが1つの era でだけ有効になる場合に限り、`--era` なしで使用できます。`--era` の値と入力エンベロープが宣言する era が一致しない場合、コマンドはエラーになります。

```sh
./bursa tx decode --tx-file unsigned.tx
./bursa tx id --tx-file unsigned.tx
./bursa tx sign --tx-file unsigned.tx \
  --signing-key-file dev/payment.skey --era Conway --out-file signed.tx
```

CBORが複数の era で有効になる場合は、`--era` で era を明示します。

```sh
./bursa tx sign --tx-file unsigned.tx --era conway \
  --signing-key-file dev/payment.skey --out-file signed.tx
```

複数の署名鍵を使うには `--signing-key-file` を繰り返します。別々に署名する場合は、分離したウィットネスを作成し、同じトランザクションに結合します。

```sh
./bursa tx witness --tx-file unsigned.tx \
  --signing-key-file dev/payment.skey --era Conway --out-file payment.witness
./bursa tx assemble --tx-file unsigned.tx \
  --witness-file payment.witness --era Conway --out-file assembled.tx
```

追加のウィットネスには `--witness-file` を繰り返します。入力のEraは次の規則で解決します。

- `--era` は `Shelley`、`Allegra`、`Mary`、`Alonzo`、`Babbage`、`Conway`、`Dijkstra` を受け付け、大文字と小文字を区別しません。
- Eraを宣言しない16進数CBORまたは従来の型なし `Tx` エンベロープは、CBORが1つのEraに明確に解決できる場合に限り `--era` なしで使用できます。
- 複数のEraで有効な曖昧なCBORにはEraを推測しません。`--era` を指定するか、`Tx ConwayEra` のようにEraを含むテキストエンベロープを使用してください。
- Bursaは未知のEraを受け付けません。エンベロープに記載されたEraと `--era` が一致しない場合もエラーになります。

署名済みおよび結合済みの出力はJSONテキストエンベロープです。出力型は次のとおりです。

- Shelley: `TxSignedShelley`
- Allegra: `Tx AllegraEra`
- Mary: `Tx MaryEra`
- Alonzo: `Tx AlonzoEra`
- Babbage: `Tx BabbageEra`
- Conway: `Tx ConwayEra`
- Dijkstra: `Tx DijkstraEra`
- Byron: `Tx`

分離ウィットネスの出力型は次のとおりです。

- Shelley: `TxWitness ShelleyEra`
- Allegra: `TxWitness AllegraEra`
- Mary: `TxWitness MaryEra`
- Alonzo: `TxWitness AlonzoEra`
- Babbage: `TxWitness BabbageEra`
- Conway: `TxWitness ConwayEra`
- Dijkstra: `TxWitness DijkstraEra`
- Byron: `TxWitness`

これらの出力は `--out-file` に書き出し、省略時は標準出力に表示します。

APIでは、`/api/tx/sign` と `/api/tx/assemble` の `tx_cbor` にも同じEra解決規則を適用します。複数のEraで有効なraw CBORまたは型なしエンベロープを送信するとHTTP `400`を返します。その場合は、`Tx ConwayEra` のようにEraを含むテキストエンベロープとして `tx_cbor` を送信してください。`tx decode --protocol-params protocol-parameters.json` はCardanoプロトコルパラメータのJSONファイルから最小手数料も推定します。オプションは `./bursa tx --help` と各サブコマンドの `--help` で確認できます。

<a name="sign"></a>

## メッセージの署名と検証

`sign data` はCIP-8/CIP-30 COSE署名と公開鍵をJSONで出力します。`ADDRESS_HEX` には署名鍵に対応するアドレスのバイト列を16進数で設定します（Bech32アドレス文字列ではありません）。署名後、返された `signature` と `key` の値を `SIGNATURE_HEX` と `COSE_KEY_HEX` に設定します。

```sh
./bursa sign data --address "$ADDRESS_HEX" --payload 'Hello Cardano' \
  --signing-key-file dev/payment.skey
./bursa sign verify --signature "$SIGNATURE_HEX" --key "$COSE_KEY_HEX" \
  --payload 'Hello Cardano'
```

バイナリデータには `--payload` の代わりに `--payload-hex` を使います。期待するペイロードを指定した検証は、成功時に `VALID` を表示し、失敗時はエラーで終了します。

<a name="signer"></a>

## リモート署名サービスの起動

`signer` コマンドは、カストディバックエンド、呼び出し元の権限、鍵ポリシー、二重署名防止ウォーターマークの設定に従い、認証されたリモート署名リクエストを処理します。

```sh
./bursa signer --config /path/to/signer.yaml
```

`bursa signer` は位置引数を受け付けません。未知のサブコマンドや誤記したサブコマンドは、サービスの起動前にエラーになります。

### `signer counter-reset`

```sh
./bursa signer counter-reset --config /path/to/signer.yaml \
  --key "$COLD_KEY_HASH" --chain-counter 10 --yes
```

プロファイル付きバックエンド（SOPSを含む）のカウンターを選択する場合は、設定済みのプロファイルを `--profile <configured-profile>` で指定します。プロファイル付きバックエンドが存在し、プロファイルなしのバックエンドを選択する場合は `--unprofiled` を指定します。プロファイル付きバックエンドが存在しない設定では、どちらのセレクターも必要ありません。完全な手順は[署名サービス運用ガイド](https://github.com/blinklabs-io/bursa/blob/main/docs/signer/runbook.md)を参照してください。

`--config` を省略すると、`BURSA_CONFIG` がYAMLファイルを選択します。認証方式を少なくとも1つ設定してください。JWT Bearer、mTLSクライアント証明書、登録鍵によるリクエスト署名に対応しています。起動前に[署名サービス運用ガイド](https://github.com/blinklabs-io/bursa/blob/main/docs/signer/runbook.md)を参照し、[設定例](https://github.com/blinklabs-io/bursa/blob/main/docs/signer/signer.example.yaml)のカストディ、認証、TLS、呼び出し元の権限、永続ウォーターマークを調整してください。[署名サービス概要](https://github.com/blinklabs-io/bursa/blob/main/docs/signer/README.md)にはAPI仕様とセキュリティガイドへのリンクがあります。

### Confidential Spaceワークロード

`bursa confidential-space-workload` の `--profile <name>` と `--create-profile-counter <name>` はそれぞれ繰り返し指定できます。各プロファイルのカウンターは別々のCloud Storageオブジェクトを使用します。アクティブな鍵で起動するワークロードは、欠落したプロファイルのカウンターを自動的に再作成しません。欠落したカウンターを作成する場合は、対象のプロファイルを `--create-profile-counter` で明示して起動します。

```sh
./bursa confidential-space-workload \
  --audience "$WORKLOAD_AUDIENCE" \
  --kms-key "$KMS_KEY_RESOURCE" \
  --wrapped-key-file /var/lib/bursa/pool-key.wrapped \
  --counter-bucket "$COUNTER_BUCKET" \
  --counter-object pool-counter \
  --wif-credentials /etc/bursa/wif.json \
  --tls-cert-file /etc/bursa/workload.crt \
  --tls-key-file /etc/bursa/workload.key \
  --client-ca-file /etc/bursa/signer-ca.crt \
  --profile pool@mainnet --profile pool@preview \
  --create-profile-counter pool@preview
```

Confidential Space の VM には永続ストレージがありません。ローカルの状態を持たずにワークロードを実行するには、`--state-secret` でラップされたプール鍵とすべてのプロファイルのカウンターを Secret Manager に保存し、`--tls-secret` でワークロードの HTTPS 証明書を別の Secret Manager シークレットに保存します。

```sh
./bursa confidential-space-workload \
  --listen :8080 \
  --audience "$WORKLOAD_AUDIENCE" \
  --kms-key "$KMS_KEY_RESOURCE" \
  --state-secret "projects/$PROJECT/secrets/$STATE_SECRET" \
  --tls-secret "projects/$PROJECT/secrets/$TLS_SECRET" \
  --wif-credentials /etc/bursa/wif.json \
  --client-ca-file /etc/bursa/signer-ca.crt \
  --profile pool@mainnet --profile pool@preview
```

`--state-secret` は `--wrapped-key-file`、`--counter-bucket`、`--counter-object` と同時に指定できず、`--tls-secret` は `--tls-cert-file`、`--tls-key-file` と同時に指定できません。各プロファイルのカウンターは Cloud Storage のオブジェクトではなく、状態シークレット内のレコードになります。Bursa はどちらのシークレットも作成せず、このモードではプールのコールド鍵を生成しません。インポートで状態シークレットに鍵を書き込むまで、通常の起動は失敗します。クライアント CA と Workload Identity Federation の設定は秘密情報ではないため、Bursa のイメージから派生したイメージに含めてください。権限と障害時の動作は [Confidential Space のカストディの永続化](/ja/guides/bursa/009-configuration-reference/#confidential-space-custody-persistence) を参照してください。

#### 既存のプールのコールド鍵をインポートする

空の状態シークレットに対して、ワークロードをインポートモードで一度起動します。

```sh
./bursa confidential-space-workload \
  --listen :8080 \
  --import \
  --import-authority-file /etc/bursa/import-authority.pub \
  --audience "$WORKLOAD_AUDIENCE" \
  --kms-key "$KMS_KEY_RESOURCE" \
  --state-secret "projects/$PROJECT/secrets/$STATE_SECRET" \
  --tls-secret "projects/$PROJECT/secrets/$TLS_SECRET" \
  --wif-credentials /etc/bursa/wif.json \
  --client-ca-file /etc/bursa/signer-ca.crt
```

`--import` には `--state-secret` と `--import-authority-file` が必要で、`--profile` と `--create-profile-counter` は指定できません。プロファイルはインポートのリクエストで指定します。`--import-authority-file` にはプロビジョニング権限の Ed25519 公開鍵を 16 進数で保存します。この鍵は署名クライアントの TLS の ID とは別の鍵にする必要があります。インポートモードのワークロードはインポート用のルートだけを提供し、署名は行わず、インポートが 1 回成功すると終了します。

コールド鍵を保持するマシンでインポートクライアントを実行します。

```sh
./bursa confidential-space import \
  --address https://workload.example.internal:8080 \
  --tls-ca-file ca.pem \
  --tls-client-cert-file client.pem \
  --tls-client-key-file client-key.pem \
  --audience "$WORKLOAD_AUDIENCE" \
  --image-digest sha256:IMAGE_DIGEST \
  --kms-key "$KMS_KEY_RESOURCE" \
  --signing-key-file pool-cold.skey \
  --vkey-file pool-cold.vkey \
  --authority-key-file import-authority.key \
  --profile pool@mainnet=8 --profile pool@preview=0
```

クライアントは、オーディエンスとイメージのダイジェストを含むワークロードのアテステーショントークンを検証してから、鍵をワークロード向けに封印して送信します。`--signing-key-file` には拡張されていない `StakePoolSigningKey_ed25519` ファイルを指定し、その鍵から `--vkey-file` の鍵が導出できる必要があります。`--authority-key-file` にはプロビジョニング権限の Ed25519 シードを 16 進数で保存します。各 `--profile` は `NAME=NEXT` の形式で、`NEXT` はそのプロファイルが次に署名できる運用証明書の発行番号です。オンチェーンかどうかにかかわらずそのプロファイルで署名した最大の発行番号に 1 を加えた値とし、そのプロファイルのネットワークにおけるプールのオンチェーンのカウンターに 1 を加えた値を下回らないようにします。一度も発行していないプロファイルには `0` を指定します。先に以前の署名者での証明書の発行を停止してください。インポート後にワークロードが `NEXT` を修正することはできません。

プロファイルごとに異なる鍵をインポートする場合は、両方の繰り返し指定可能な鍵フラグに、対応する `NAME=FILE` エントリを指定します。

```sh
./bursa confidential-space import \
  --address https://workload.example.internal:8080 \
  --tls-ca-file ca.pem \
  --tls-client-cert-file client.pem \
  --tls-client-key-file client-key.pem \
  --audience "$WORKLOAD_AUDIENCE" \
  --image-digest sha256:IMAGE_DIGEST \
  --kms-key "$KMS_KEY_RESOURCE" \
  --signing-key-file pool@mainnet=mainnet-cold.skey \
  --signing-key-file pool@preview=preview-cold.skey \
  --vkey-file pool@mainnet=mainnet-cold.vkey \
  --vkey-file pool@preview=preview-cold.vkey \
  --authority-key-file import-authority.key \
  --profile pool@mainnet=8 --profile pool@preview=0
```

共有鍵を使う場合は、プレーンなパスを `--signing-key-file` と `--vkey-file` にそれぞれ 1 つ指定します。プレーンなパスと `NAME=FILE` 形式は混在できません。`NAME=FILE` 形式では、各 `--profile` に対応するエントリを両方のフラグで 1 つずつ指定し、プロファイル間で異なる鍵を指定してください。同じ鍵を共有する場合はプレーンなパス形式を使用します。

インポート後は、`--import` を付けずにワークロードを起動します。マルチキー状態では、起動時の `--profile` の集合をインポート時のプロファイル集合と完全に一致させてください。プロファイルを省略した場合、欠落させた場合、または追加した場合、ワークロードは起動を拒否します。マルチキー状態を作成した後は、以前のリリースはその状態を使用できません。

### Nitro enclave

`bursa nitro enclave` では、プロビジョニング権限ファイルに加えて、`--signer-authority-file <file>` を指定する必要があります。2つの権限ファイルには、それぞれ別のプロビジョニング権限と署名者権限を指定してください。

```sh
./bursa nitro enclave \
  --server-cert-file /etc/bursa/nitro/server.pem \
  --server-key-file /etc/bursa/nitro/server-key.pem \
  --client-ca-file /etc/bursa/nitro/proxy-ca.pem \
  --provision-authority-file /etc/bursa/nitro/provision-authority.hex \
  --signer-authority-file /etc/bursa/nitro/signer-authority.hex
```

### Nitro proxy

`bursa nitro proxy` の `--socket-mode` は、グループアクセス用に `0660` などを指定できます。Bursaは全ユーザーが書き込めるモードを拒否します。

```sh
./bursa nitro proxy \
  --enclave-cid "$ENCLAVE_CID" \
  --region "$AWS_REGION" \
  --secret-id "$NITRO_SECRET_ID" \
  --enclave-ca-file /etc/bursa/nitro/enclave-ca.pem \
  --client-cert-file /etc/bursa/nitro/proxy.pem \
  --client-key-file /etc/bursa/nitro/proxy-key.pem \
  --enclave-server-name "$ENCLAVE_SERVER_NAME" \
  --socket /run/bursa/nitro.sock --socket-mode 0660
```

***

その他のBursaコマンドを探索

> **Bursaコマンドカテゴリ**
> 1. [wallet](#wallet) &nbsp; - Cardanoウォレットの管理に必要なウォレットおよびファイルを生成するコマンド
> 2. [api](#api)  &emsp;&nbsp;&nbsp; - APIを実行するコマンド
> 3. [kes-agent](#kes-agent) &emsp;&nbsp;&nbsp; - KESエージェントを実行するコマンド
> 4. [cert](../004-cert-commands)   &emsp;&nbsp; - 各種Cardano証明書を生成するコマンド
> 5. [hash](../005-hash-commands)  &nbsp;&nbsp;&nbsp; - Cardanoで使用される暗号ハッシュを生成するコマンド
> 6. [script](../006-script-commands) &nbsp;&nbsp; - マルチシグネチャ操作用のコマンド
> 7. [address](../007-address-commands) - Cardanoアドレスを操作するコマンド
> 8. [key](../008-key-commands)  &emsp;&nbsp;&nbsp; - ニーモニックから個別の鍵を導出するコマンド
> 9. [tx](#tx) - オフライントランザクション操作
> 10. [sign](#sign) - CIP-8/CIP-30メッセージの署名と検証
> 11. [signer](#signer) - リモート署名サービス

***


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
