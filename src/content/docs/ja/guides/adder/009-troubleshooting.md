---
title: Adder トラブルシューティング
description: Adder の接続、設定、フィルター、Push 通知、Webhook に関するトラブルシューティング。
---

# Adder トラブルシューティング

このガイドでは、Adder の接続、設定、フィルター、Push 通知、Webhook に関する確認手順を説明します。各設定には、記載された CLI フラグ、YAML キー、または環境変数を使用してください。

## 1. 接続の問題

`chainsync` 入力プラグインが Cardano ノードに接続できない場合は、接続方式とネットワーク設定を確認します。

### ローカル NtC ソケットの確認

ローカルノードへの NtC（node-to-client）接続では、Adder と Cardano ノードが同じ UNIX ソケットを使用します。ソケットファイルが存在し、Adder の実行ユーザーが読み書きできることを確認します。

1. Cardano ノードが起動し、ソケットファイルを作成していることを確認します。
2. ソケットのパスを確認します。

   ```bash
   ls -la /path/to/cardano-node.socket
   ```

3. CLI フラグ、YAML の `socket-path`、または `CARDANO_NODE_SOCKET_PATH` に同じパスを指定します。

   ```bash
   ./adder --input-chainsync-socket-path=/path/to/cardano-node.socket
   ```

   ```bash
   export CARDANO_NODE_SOCKET_PATH=/path/to/cardano-node.socket
   ```

### ネットワーク設定の不一致

接続後すぐにハンドシェイクが失敗し、ネットワークマジックの不一致が表示される場合は、Adder と Cardano ノードが異なるネットワークを使用しています。両方のネットワーク名をそろえます。

`--input-chainsync-network` または `--input-chainsync-network-magic` を使用します。`--input-chainsync-network-magic` は `--input-chainsync-network` の値より優先されます。

```bash
./adder --input-chainsync-network=preview
```

環境変数を使用する場合は、生成された `INPUT_CHAINSYNC_NETWORK` またはカスタム環境変数 `CARDANO_NETWORK` にネットワーク名を指定します。

```bash
export INPUT_CHAINSYNC_NETWORK=preview
```

### NtN、ローカル NtC、NtC over TCP の選択

接続先とプロトコルを混同すると、接続失敗またはアドレス解決エラーが発生します。

- ローカル NtC では、`--input-chainsync-socket-path` に UNIX ソケットのパスを指定します。
- リモート NtN（node-to-node）では、`--input-chainsync-address` に `host:port` 形式の TCP アドレスを指定します。リモートホストの TCP ポートが到達可能であることも確認します。

  ```bash
  nc -zv relays-new.cardano-mainnet.iohk.io 3001
  ```

  ```bash
  ./adder --input-chainsync-address=relays-new.cardano-mainnet.iohk.io:3001
  ```

- UNIX ソケットを `socat` などで TCP に公開している場合は、NtC over TCP を使用します。`--input-chainsync-address` と `--input-chainsync-ntc-tcp` を同時に指定します。

  ```bash
  ./adder --input-chainsync-address=host:port --input-chainsync-ntc-tcp
  ```

## 2. 設定の問題

Adder は設定を次の優先順位で適用します。

`CLI フラグ > YAML 設定ファイル > 環境変数 > デフォルト値`

同じ項目を複数の場所で指定した場合は、優先順位が高い設定を使用します。`chainsync` の設定は、次のように YAML の `plugins`、`input`、`chainsync` の下に記述します。

```yaml
input: chainsync
plugins:
  input:
    chainsync:
      network: preview
      socket-path: /path/to/cardano-node.socket
```

プラグインの環境変数名は、プラグイン種別、プラグイン名、オプション名から生成します。たとえば `network` には `INPUT_CHAINSYNC_NETWORK` を使用できます。`network` と `socket-path` には、それぞれカスタム環境変数の `CARDANO_NETWORK` と `CARDANO_NODE_SOCKET_PATH` も使用できます。これらの設定に `ADDER_` プレフィックスは使用しません。

環境変数が反映されない場合は、変数名、YAML キー、CLI フラグの綴りを確認し、優先順位の高い設定が同じ値を上書きしていないことを確認します。

## 3. フィルターの問題

イベントが出力されない場合は、最小構成でフィルターを確認します。異なるフィルター種別は AND 条件、同じフィルター種別内の複数値は OR 条件として適用します。

1. アドレス、アセット、ポリシー、プール、DRep ID などの追加フィルターを外します。
2. イベント種別だけを指定して Adder を起動します。

   ```bash
   ./adder --filter-type input.transaction
   ```

3. トランザクションイベントが出力されることを確認してから、フィルターを 1 つずつ追加します。

`--filter-policy` と `--filter-asset` は `input.block` または `input.governance` イベントには適用されません。アドレスには有効な Bech32 の支払いアドレスまたはステークアドレスを、ポリシー ID には 56 文字の 16 進数文字列を指定します。

## 4. Push 通知の問題

### サービスアカウントの確認

Push 出力には、空でないサービスアカウントファイルのパスが必要です。`serviceAccountFilePath` を YAML または `--output-push-serviceAccountFilePath` で指定し、ファイルを読み取れることを確認します。

```yaml
plugins:
  output:
    push:
      serviceAccountFilePath: /path/to/service-account.json
```

```bash
./adder --output push --output-push-serviceAccountFilePath=/path/to/service-account.json
```

サービスアカウント JSON の `project_id` は、空でない文字列でなければなりません。

```bash
cat /path/to/service-account.json | grep "project_id"
```

```json
{
  "project_id": "your-project-id"
}
```

ファイルが存在しない、読み取れない、JSON として解析できない、または `project_id` がないか空文字列の場合、Push 出力は起動できません。

### 無効な FCM トークンの削除

FCM が `UNREGISTERED` を返す場合は、無効なトークンを登録から削除します。Adder の API グループは `/v1` です。削除ルートには `/v1/fcm/<token>` を使用します。

```bash
curl -X DELETE http://localhost:8080/v1/fcm/<token>
```

`/fcm/<token>` のように `/v1` グループを省略したルートは使用しません。

## 5. Webhook の問題

Webhook の送信先が応答しない場合、URL、ペイロード形式、Basic 認証、TLS 検証の設定を確認します。Webhook 出力では、次の CLI フラグを使用できます。

```bash
./adder --output webhook \
  --output-webhook-url="https://your-webhook-url.com" \
  --output-webhook-format="adder" \
  --output-webhook-username="username" \
  --output-webhook-password="password" \
  --output-webhook-tls-skip-verify
```

同じ設定は、YAML の `plugins`、`output`、`webhook` の下に記述します。

```yaml
plugins:
  output:
    webhook:
      url: https://your-webhook-url.com
      format: adder
      username: username
      password: password
      tls-skip-verify: true
```

`--output-webhook-max-retries` と `--output-webhook-initial-backoff` は CLI オプションでも YAML オプションでもありません。これらの設定をコマンドや YAML に追加しないでください。

自己署名証明書を使用する場合だけ `--output-webhook-tls-skip-verify` を指定します。通常の TLS 接続では TLS 検証を有効にします。

---
<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>