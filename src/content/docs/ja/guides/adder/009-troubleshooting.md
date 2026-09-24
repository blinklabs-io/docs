---
title: Adderトラブルシューティングガイド
description: Adderの接続、設定、フィルター、FCM、Webhookに関する問題を診断する手順。
---

# Adderトラブルシューティングガイド

このガイドでは、Adderの接続、設定、フィルター、FCMプッシュ通知、Webhook配信に関する問題を診断します。各手順では、実行可能なCLIフラグ、YAML設定、APIパスを使用します。

---

## 1. 接続の問題

`chainsync`入力プラグインがCardanoノードへ接続できない場合は、ソケット、ネットワーク、接続方式を確認します。

### A. Unixソケットの問題（NtC）

**症状**: AdderがローカルのNode-to-Client（NtC）接続で接続拒否、または`no such file or directory`を記録します。

**原因**: 指定したUnixソケットが存在しないか、Adderの実行ユーザーにソケットの読み取りまたは書き込み権限がありません。

**対処**:

1. Cardanoノードが起動し、ソケットファイルを作成したことを確認します。
2. `--input-chainsync-socket-path`に指定したパスを確認します。
   ```bash
   ./adder --input-chainsync-socket-path=/path/to/cardano-node.socket
   ```
3. ファイルの存在と権限を確認します。
   ```bash
   ls -la /path/to/cardano-node.socket
   ```

### B. ネットワーク選択の不一致

**症状**: 接続は確立しますが、`handshake failed: network magic mismatch`などのエラーでプロトコルのハンドシェイクに失敗します。

**原因**: Adderのネットワーク設定と、実行中のCardanoノードのネットワーク設定が一致していません。

**対処**:

1. ノードが接続するネットワーク名を確認します。
2. `--input-chainsync-network`で同じネットワークを指定します。次の例では`preview`を指定します。
   ```bash
   ./adder --input-chainsync-network=preview
   ```
3. ネットワーク名の代わりにネットワークマジックを使う場合は、`--input-chainsync-network-magic`を指定します。
   ```bash
   ./adder --input-chainsync-network-magic=<network-magic>
   ```

### C. NtCとNtNの選択

**症状**: 接続に失敗するか、アドレス解決エラーが発生します。

**原因**: ローカルソケットを使うNode-to-Client（NtC）接続と、リモートTCP/IPを使うNode-to-Node（NtN）接続を混同しています。

**対処**:

- ローカルノードには`--input-chainsync-socket-path`を指定します。
- リモートノードには`--input-chainsync-address`でホストとポートを指定します。次の例では、リモートのTCPポート`3001`を確認します。
  ```bash
  ./adder --input-chainsync-address=relays-new.cardano-mainnet.iohk.io:3001
  nc -zv relays-new.cardano-mainnet.iohk.io 3001
  ```
- `socat`などでノードのUnixソケットをTCP経由で公開する場合は、`--input-chainsync-ntc-tcp`を指定し、公開した`host:port`を`--input-chainsync-address`に指定します。

---

## 2. 設定の問題

Adderは同じ設定を複数の方法で指定した場合、次の順序で値を適用します。

1. CLIフラグ
2. YAML設定ファイル
3. 環境変数
4. デフォルト値

### A. 設定値が反映されない

**症状**: 設定値を指定してもAdderの動作が変わりません。

**対処**:

1. 同じ設定をCLI、YAML、環境変数で重複して指定していないか確認します。上位の設定が下位の設定を上書きします。
2. CLIで使用するフラグ名を確認します。たとえば、ログレベルには`--logging-level`を使用します。
   ```bash
   ./adder --logging-level=debug
   ```
3. 設定ファイルを指定する場合は、`--config`を使用します。
   ```bash
   ./adder --config=config.yaml
   ```

### B. YAMLファイルが見つからない、または値が不正

**症状**: `failed to read configuration file`または`yaml: unmarshal errors`が表示されます。

**対処**:

1. `--config`に指定したファイルのパスとファイルの読み取り権限を確認します。
2. YAMLのインデントと値の型を確認します。次の例では、Adderが認識する設定キーを使用しています。
   ```yaml
   input: chainsync
   output: log
   api:
     address: 0.0.0.0
     port: 8080
   logging:
     level: debug
   ```
3. YAMLの構文を検証します。
   ```bash
   python3 -c "import yaml; yaml.safe_load(open('config.yaml'))"
   ```

---

## 3. フィルターの問題

異なる種類のフィルター（`type`と`address`など）はAND条件で評価されます。同じ種類のフィルターに複数の値を指定した場合はOR条件で評価されます。

### A. フィルター後にイベントが出力されない

**症状**: Adderは動作していますがイベントを出力せず、パイプラインが停止したように見えます。

**原因**: 適用対象外のイベントにフィルターを指定しているか、フィルター値の形式が不正です。たとえば、`input.block`や`input.governance`のイベントには、`--filter-policy`と`--filter-asset`を適用できません。

**対処**:

1. すべてのフィルターを一時的に外し、入力接続を確認します。
2. イベントタイプだけを指定して、イベントの出力を確認します。
   ```bash
   ./adder --filter-type=input.transaction
   ```
3. 必要なフィルターを1種類ずつ追加します。使用できる主なフラグは`--filter-address`、`--filter-asset`、`--filter-drep`、`--filter-policy`、`--filter-pool`、`--filter-type`です。

### B. フィルター値の形式

- アドレスには有効なBech32の支払いアドレスまたはステークアドレス（`addr1...`、`stake1...`）を指定します。
- ポリシーIDには28バイトの16進数、つまり56文字の文字列を指定します。
- DRep IDにはBech32（`drep1...`または`drep_script1...`）または16進数ハッシュを指定します。
- DRep IDをカンマ区切りで指定する場合は、各値を確認します。
- ポリシーIDの長さを確認するには、次のコマンドを実行します。
  ```bash
  echo -n "2dd15e0efd5c07b6bfbc0cf7fb2f767a50e189d7bfa50e1ef0b87abc" | wc -c
  ```

---

## 4. FCMプッシュ通知の問題

### A. FCM認証情報

**症状**: Push出力プラグインが`failed to get token`または`failed to read credential file`を記録します。

**原因**: サービスアカウントJSONファイルが存在しない、読み取れない、または有効なGoogleサービスアカウント認証情報ではありません。

**対処**:

1. `--output-push-serviceAccountFilePath`に指定するサービスアカウントファイルの存在と読み取り権限を確認します。
2. JSONファイルに`project_id`が含まれることを確認します。
   ```bash
   cat /path/to/service-account.json | grep "project_id"
   ```

### B. FCM配信の失敗

**症状**: `failed to send message to token...`がエラーログに表示されます。

**原因**: FCMトークンの期限切れ、登録解除、またはFirebaseサービスへの接続失敗が発生しています。

**対処**:

1. FCMが返したエラーペイロードを確認します。`UNREGISTERED`が含まれる場合は、無効なトークンを削除します。
2. トークンを保存する場合、JSON本文に必須フィールド`fcmToken`を含めます。
   ```bash
   curl -X POST "http://localhost:8080/v1/fcm" \
     -H "Content-Type: application/json" \
     -d '{"fcmToken":"<token>"}'
   ```
   保存に成功すると`201 Created`を返します。不正なJSONまたは`fcmToken`が空の本文には`400 Bad Request`を返します。
3. 無効なトークンを削除するには、`DELETE /v1/fcm/<token>`を使用します。
   ```bash
   curl -X DELETE "http://localhost:8080/v1/fcm/<token>"
   ```
   削除に成功すると`204 No Content`を返します。トークンが登録されていない場合は`404 Not Found`を返します。

---

## 5. Webhookの問題

### A. Webhookの設定

Webhook出力プラグインは次のCLIオプションを登録します。

| オプション | 説明 | デフォルト |
| :--- | :--- | :--- |
| `--output-webhook-format` | Webhookペイロード形式 | `adder` |
| `--output-webhook-url` | 配信先URL | `http://localhost:3000` |
| `--output-webhook-username` | Basic認証のユーザー名 | 空 |
| `--output-webhook-password` | Basic認証のパスワード | 空 |
| `--output-webhook-tls-skip-verify` | TLS証明書の検証をスキップ | `false` |

Basic認証を使用する場合は、`--output-webhook-username`と`--output-webhook-password`を両方指定します。自己署名証明書を一時的に検証する場合は、`--output-webhook-tls-skip-verify`を指定します。

配信先を手動で確認するには、次のコマンドを実行します。

```bash
curl -H "Content-Type: application/json" \
  -X POST \
  -d '{"type":"test"}' \
  https://your-webhook-url.com
```

### B. Webhookの再試行とタイムアウト

**症状**: Webhook配信が遅延するか、配信失敗のエラーが記録されます。

**原因**: Webhookサーバーの応答が遅い、停止している、または`2xx`以外のステータスを返しています。各HTTPリクエストは5秒でタイムアウトします。

**動作**:

- Adderは再試行設定をCLIオプションとして公開しません。
- 内部の既定値は、最大再試行回数`3`、初回待機時間`1s`、最大待機時間`30s`、待機時間の倍率`2`です。
- 配信に失敗すると、Adderは指数バックオフで再試行します。待機時間は`1s`、`2s`、`4s`の順に増加し、`30s`を上限にします。
- すべての再試行に失敗すると、Adderはエラーをログに記録し、エラーチャネルへ通知します。エラーチャネルが満杯の場合、Adderは警告をログに記録して処理を継続します。

### C. 不正なイベントとWebhook終了

Webhook処理はイベントの内容を検証します。

- ペイロードが`nil`の場合、イベントは配信せず、エラーをログとエラーチャネルに通知します。
- イベントのペイロードまたはコンテキストの型がイベント種別と一致しない場合、イベントは配信せず、エラーをログとエラーチャネルに通知します。
- 未知のイベント種別を受信した場合、イベントは配信せず、エラーをログとエラーチャネルに通知します。
- Adderの終了処理が再試行の待機中に開始された場合、終了シグナルが待機を中断し、追加の待機を行わずにWebhook処理を終了します。

### D. TLS証明書の問題

**症状**: `x509: certificate signed by unknown authority`が表示されます。

**対処**:

1. Webhookサーバーの証明書チェーンを確認し、信頼できるCA証明書を配置します。
2. 自己署名証明書を使用する検証環境に限り、`--output-webhook-tls-skip-verify`を指定します。

---

## 6. よくあるエラー

| 表示または状況 | 考えられる原因 | 対処 |
| :--- | :--- | :--- |
| `failed to read credential file: open ...: no such file or directory` | FCM認証情報ファイルのパスが正しくありません。 | `--output-push-serviceAccountFilePath`のパスとローカルファイルを照合します。 |
| `failed to get token: oauth2: cannot fetch token` | ネットワークに接続できないか、Google IAM認証情報が無効です。 | ネットワーク接続とサービスアカウントの状態を確認します。 |
| `invalid intersect point format: expected '<slot>.<hash>'` | `--input-chainsync-intersect-point`の値が不正です。 | `<slot_integer>.<block_hex_hash>`形式の値を指定します。 |
| `server returned status: 500` | Webhookサーバーがリクエストを受信した後、内部エラーを返しました。 | Webhookサーバーのログを確認します。 |
| `failed to parse credential file` | サービスアカウントJSONの構文または形式が不正です。 | 認証情報JSONの形式を検証します。 |
| `failed to process plugin config` | プラグイン設定のキーまたは値の型が不正です。 | 使用するプラグインのオプション形式と設定値の型を照合します。 |

問題を切り分ける際は、まず接続を確認し、次に設定、フィルター、出力プラグインの順に追加します。`--logging-level=debug`を指定すると、接続と配信の詳細ログを確認できます。

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>