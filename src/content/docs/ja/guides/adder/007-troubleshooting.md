---
title: "Adderトラブルシューティングガイド"
description: "Adderの接続、設定、イベント配信、ヘルスチェック、メトリクスを診断するための手順です。"
---

# Adderトラブルシューティングガイド

このガイドでは、Adderの運用中に発生する一般的な問題を、診断コマンド、原因、解決手順とともに説明します。

---

## 1. 接続の問題

`chainsync`入力プラグインがCardanoノードに接続できない、またはハンドシェイクを完了できない場合は、次の手順で確認します。

### A. ソケットパスの問題（NtC）

* **症状**: ローカルのNode-to-Client（NtC）ソケットへの接続時に、Adderのログに接続拒否または`no such file or directory`が現れます。
* **原因**: 指定したパスにUNIXソケットファイルがないか、Adderを実行するユーザーにソケットの読み取りまたは書き込み権限がありません。
* **解決**:
  1. Cardanoノードが完全に起動し、ソケットファイルを作成したことを確認します。
  2. 設定ファイルの`--input-chainsync-socket-path`または`plugins.input.chainsync.socket-path`に指定したパスを確認します。
  3. ファイルの権限を確認します。

     ```bash
     ls -la /path/to/cardano-node.socket
     ```

### B. ネットワーク選択の不一致

* **症状**: 接続は確立しますが、`handshake failed: network magic mismatch`などのエラーですぐにプロトコルのハンドシェイクが失敗します。
* **原因**: Adderに設定したネットワークマジックが、実行中のCardanoノードのネットワークマジックと一致していません。たとえば、`mainnet`用に設定したAdderを`preview`のノードに接続しています。
* **解決**: ネットワーク設定を一致させます。
  * 環境変数で正しいネットワークを設定します。

    ```bash
    export INPUT_CHAINSYNC_NETWORK=preview
    ```

  * または、`config.yaml`の`input-chainsync-network`設定を確認します。

ネットワーク名に対応する値を使わず、ネットワークマジックを直接指定する場合は、`--input-chainsync-network-magic`または対応する入力設定を使用します。ネットワークマジックはネットワーク名より優先されます。

### C. NtCとNtNの選択

* **症状**: 接続に失敗するか、アドレス解決エラーが発生します。
* **原因**: Node-to-Client（ローカルソケット）とNode-to-Node（リモートTCP/IP）を取り違えています。
* **解決**:
  * ローカルノード接続（NtC）では、ノードのUNIXソケットを`--input-chainsync-socket-path`で指定します。TCPでソケットを公開する構成では、`--input-chainsync-ntc-tcp`と`host:port`形式のアドレスを使用します。
  * リモートノード接続（NtN）では、ホストとポート（例: `relays-new.cardano-mainnet.iohk.io:3001`）を指定し、TCPポート`3001`に到達できることを確認します。

    ```bash
    nc -zv relays-new.cardano-mainnet.iohk.io 3001
    ```

---

## 2. 設定の問題

Adderは設定を、**CLIフラグ、環境変数、YAML設定ファイル、デフォルト値**の順に評価します。同じ設定を複数の方法で指定した場合は、CLIフラグが最も優先されます。

### A. 環境変数が読み込まれない

* **症状**: 環境変数を設定してもAdderの動作が変わりません。
* **原因**: 環境変数名の接頭辞または接尾辞の誤り、あるいは優先順位の高いCLIフラグによる上書きです。
* **解決**:
  * アプリケーション設定には`INPUT_`、`OUTPUT_`、`API_`、`DEBUG_`など、登録された環境変数名を使用します。たとえば、`--input-chainsync-network`には`INPUT_CHAINSYNC_NETWORK`を使用します。環境変数名に製品名の接頭辞は付けません。
  * フィルター設定には、フラグ名ではなくプラグインの種類と名前から生成された環境変数名を使用します。たとえば、`--filter-address`には`FILTER_CARDANO_ADDRESS`を使用します。
  * シェルで有効な環境変数を確認します。

    ```bash
    env | grep -E "^(INPUT|OUTPUT|API|DEBUG|SHELLEY_|BYRON_|KUPO_URL)"
    ```

`--config`、`--version`、`--help`などのコマンド制御用フラグには、対応する環境変数はありません。CLIフラグ、環境変数、YAMLの値が競合していないことも確認します。

### B. YAMLファイルが見つからない、または値が不正

* **症状**: Adderが`failed to read configuration file`または`yaml: unmarshal errors`を出力します。
* **原因**: ファイルパスの誤り、不正なインデント、または整数を要求する項目に文字列を指定するなどの型の不一致です。
* **解決**: YAMLの構文と値の型を確認します。次のコマンドでYAMLファイルの構文を確認できます。

  ```bash
  python3 -c "import yaml; yaml.safe_load(open('config.yaml'))"
  ```

不明なYAMLキーもエラーになります。キー名はコマンドリファレンスに記載されたプラグインの種類、名前、オプションに合わせます。

---

## 3. フィルターの問題

異なる種類のフィルター（`type`と`address`など）は**AND**で結合します。同じフィルターに複数の値を指定した場合（`address1`または`address2`など）は**OR**で結合します。`--filter-pool`と`--filter-drep`を同時に指定した場合だけ、両者はORで結合します。

### A. イベントがフィルターを通過しない

* **症状**: Adderは動作していますが、イベントを出力せず、パイプラインが停止しているように見えます。
* **原因**: 過剰なフィルター、または不正なフィルター入力です。たとえば、ブロックイベントに適用されないアセットポリシーIDでフィルタリングしています。
* **解決**:
  * `--filter-policy`と`--filter-asset`は`input.transaction`にだけ適用されます。`input.block`と`input.governance`はこれらのフィルターを通過します。
  * まずイベントタイプだけでフィルタリングし、イベントが生成されることを確認します。

    ```bash
    ./adder --filter-type input.transaction
    ```

  * 異なる種類のフィルターはすべて同時に満たす必要があります。`--filter-pool`と`--filter-drep`の組み合わせだけは、どちらか一方に一致すれば通過します。

### B. 入力形式の要件

* **アドレス**: 有効なBech32の支払いアドレスまたはステークアドレスを指定します（例: `addr1...`、`stake1...`）。
* **ポリシーID**: 28バイトの16進数を文字列で指定します。長さは56文字でなければなりません。
* **DRep ID**: Bech32（`drep1...`または`drep_script1...`）または生の16進ハッシュを指定します。29バイトのBech32ペイロードでは先頭のヘッダーバイトを除去して台帳ハッシュと照合します。
* **診断**: ポリシーIDの長さを確認します。

  ```bash
  echo -n "2dd15e0efd5c07b6bfbc0cf7fb2f767a50e189d7bfa50e1ef0b87abc" | wc -c
  ```

フィルター値をカンマ区切りで指定すると、各値のいずれかに一致したイベントを出力します。Adderは各項目の前後の空白を除去し、空の項目を無視します。

---

## 4. プッシュ通知の問題

### A. FCM認証情報

* **症状**: Pushプラグインが`failed to get token`または`failed to read credential file`をログに出力します。
* **原因**: サービスアカウントJSONファイルが存在しない、読み取れない、または有効なGoogleサービスアカウント認証情報ではありません。`project_id`が空または存在しない場合も起動または設定に失敗します。
* **解決**: サービスアカウントファイルが存在し、読み取り可能で、`project_id`を含むことを確認します。

  ```bash
  cat /path/to/service-account.json | grep "project_id"
  ```

### B. 配信の失敗

* **症状**: `failed to send message to token...`がERRORとして出力されます。
* **原因**: FCM tokenの期限切れ、登録解除、またはFirebaseサービスへの到達不能です。
* **解決**: FCMが返すエラーペイロードを確認します。`UNREGISTERED`を示す場合は、クライアントのレジストリから無効なtokenを削除します。

  ```bash
  curl -X DELETE http://localhost:8080/v1/fcm/<token>
  ```

このエンドポイントは`/v1`のAPIルートグループに属します。`<token>`は削除する実際のFCM tokenに置き換えます。

---

## 5. Webhookの問題

### A. Webhookの再試行とタイムアウト

* **症状**: Webhookメッセージが遅延するか、配信失敗のエラーが出力されます。
* **原因**: 対象のWebサーバーが遅い、停止している、または成功以外のHTTPステータスコードを返しています。
* **解決**:
  * `curl`で対象エンドポイントを手動テストし、応答してPOSTペイロードを受け付けることを確認します。

    ```bash
    curl -H "Content-Type: application/json" -X POST -d '{"type":"test"}' https://your-webhook-url.com
    ```

  * 実際に使用するWebhook URLと認証設定を指定します。

    ```bash
     ./adder --output webhook --output-webhook-url="https://your-webhook-url.com"
    ```

Webhookは初回送信を1回行い、デフォルトで最大3回再試行します。一時的な通信障害、HTTP `408`、`429`、`5xx`では、デフォルトで`1s`、`2s`、`4s`の指数バックオフを使用します。バックオフの上限は`30s`です。これらの再試行回数とバックオフは内部動作であり、登録済みのCLIフラグではありません。

有効な`Retry-After`値は設定済みの最大バックオフまで使用します。最大値を超える待機時間を要求する`Retry-After`はterminal failureとして扱います。再試行対象ではない失敗は直ちにterminal failureになり、再試行回数を使い切ったイベントはexhaustedとして破棄されます。

301、302、303リダイレクトではHTTPクライアントがPOSTをGETに変更し、イベント本文を破棄します。本文を維持するWebhook POSTのリダイレクトには307または308を使用します。リダイレクトは最大10回までです。

### B. TLS証明書の問題

* **症状**: Webhook配信が`x509: certificate signed by unknown authority`で失敗します。
* **原因**: 対象のWebhookサーバーが自己署名証明書または無効なTLS証明書を使用しています。
* **解決**: ローカルマシンに認証局（CA）証明書をインストールするか、Webhookホストに有効な証明書を設定します。自己署名証明書を使うローカルテストだけでは、`--output-webhook-tls-skip-verify`を使用できます。本番環境ではTLS検証を無効にしません。

### C. Webhook配信の可観測性

Webhookのメトリクスと、設定済みAPIリスナーでの確認方法は、[ヘルスチェックとAPI診断](#6-ヘルスチェックとapi診断)を参照してください。

---

## 6. ヘルスチェックとAPI診断

設定済みAPIリスナーは`GET /healthcheck`と`GET /metrics`を`/v1`の外側で提供します。デフォルトのリスナーは`API_ADDRESS=0.0.0.0`と`API_PORT=8080`で、環境変数または対応するCLIフラグで変更できます。監視システムだけに公開する場合は、ネットワーク境界でアクセスを制限します。

### A. `/metrics`のWebhookメトリクス

次のメトリクスで、Webhook配信の試行、最終結果、試行ごとの所要時間を確認します。

```bash
curl http://localhost:8080/metrics
```

| メトリクス | 説明 |
| --- | --- |
| `adder_webhook_http_attempts_total{status_class}` | Webhookの論理HTTP試行数。`status_class`は`1xx`、`2xx`、`3xx`、`4xx`、`5xx`、`network`、`other`のいずれかです。リダイレクトは最終レスポンスのクラスで1回として数えます。 |
| `adder_webhook_delivery_outcomes_total{outcome}` | Webhookイベントの最終結果。`outcome`は`success`、`terminal`、`exhausted`のいずれかです。 |
| `adder_webhook_http_attempt_duration_seconds` | レスポンス本文の読み取り完了またはリクエスト失敗までの、HTTP試行ごとの所要時間です。 |

これらのメトリクスには、URL、イベントタイプ、アドレス、ハッシュ、クライアント、その他のユーザーデータをラベルとして使用しません。Adderはメトリクスをプロセス内で集計し、再起動時にリセットします。

### B. `/healthcheck`のプローブ動作

```bash
curl -i http://localhost:8080/healthcheck
```

Adderはレスポンスに`failed`フィールドを常に含めます。登録済みのヘルスチェッカーがすべて稼働している場合、AdderはHTTP `200`を返し、いずれかのチェッカーが稼働していない場合はHTTP `503`を返します。Adderは診断情報の有無にかかわらず、このHTTPステータスのプローブ動作を維持します。

### C. サニタイズされた診断情報

ヘルスチェッカーが詳細情報を提供すると、Adderはレスポンスの`checks[]`にサニタイズされた情報を追加します。Adderは各チェックに`running`を含め、パイプラインのチェックには次の情報も追加します。

* `uptimeSeconds`: パイプラインの稼働時間（秒）。
* `terminalFailure`: 回復不能な失敗が発生したかどうか。
* `components[]`: パイプラインのコンポーネント一覧。
  * `role`: `input`、`filter`、`output`のいずれか。
  * `index`: コンポーネントのインデックス。
  * `state`: `unknown`、`starting`、`running`、`stopped`、`failed`のいずれか。

Adderは`checks[]`にエラー文字列、秘密情報、URL、イベント内容、設定値を含めません。Adderはコンポーネントの診断情報を最大128件に制限します。Adderは`checks[]`の詳細状態ではなく、登録済みチェッカーの稼働状態に基づいて`failed`とHTTPステータスを決定します。

---

## 7. 一般的なエラーメッセージ

| エラー文字列 | 発生元コンポーネント | 原因 | 解決 |
| :--- | :--- | :--- | :--- |
| `failed to read credential file: open ...: no such file or directory` | `output/push` | FCM認証情報のパスが正しくありません。 | 設定のパスがローカルファイルシステムと一致することを確認します。 |
| `failed to get token: oauth2: cannot fetch token` | `output/push` | ホストがインターネットに接続できないか、Google IAM認証情報が無効です。 | ネットワーク接続とサービスアカウントの状態を確認します。 |
| `invalid intersect point format: expected '<slot>.<hash>'` | `input/chainsync` | `--input-chainsync-intersect-point`に渡した値の形式が不正です。 | `<slot_integer>.<block_hex_hash>`形式で指定します。 |
| `server returned status: 500` | `output/webhook` | 対象サーバーがリクエストを受信しましたが、内部サーバーエラーになりました。 | Webhookサーバーのログでエラーの原因を確認します。 |
| `failed to parse credential file` | `output/push` / `internal/config` | JSON認証情報ファイルに構文エラーまたは不正なJSON形式があります。 | サービスアカウント認証情報の形式を検証します。 |
| `failed to process plugin config` | `internal/config` / `plugin` | 設定キーに未認識の型または互換性のない値があります。 | 標準設定のオプション定義に合わせて値の型を修正します。 |

---

## 8. Go 1.26以降でのゴルーチンリークの診断

Adderでメモリリークが発生する場合、到達不能なチャネルやミューテックスなどで停止した孤立ゴルーチンが原因の可能性があります。

Go 1.26以降では、ガベージコレクターを利用して、実行中のコードの他の部分から完全に到達不能になったゴルーチンを特定するリークプロファイラーを使用できます。

### リークプロファイラーを有効にする

この機能にはGo 1.26以降が必要です。デフォルトでは無効で、`goroutineleakprofile`実験を有効にしてAdderをビルドする必要があります。

```bash
GOEXPERIMENT=goroutineleakprofile go build -o adder ./cmd/adder
```

> **注記**: 古いGoバージョンでこのフラグを使用すると、コンパイラーは`go: unknown GOEXPERIMENT goroutineleakprofile`で失敗します。

### HTTP pprofで解析する

プロファイラーを有効にし、debugポートを有効にすると、`net/http/pprof`のエンドポイントから`goroutine/leak`プロファイルを取得できます。

```bash
GOEXPERIMENT=goroutineleakprofile ./adder \
  --debug-address 127.0.0.1 \
  --debug-port 6060
```

```bash
go tool pprof http://localhost:6060/debug/pprof/goroutineleak
```

`DEBUG_ADDRESS`と`DEBUG_PORT`でdebugリスナーを設定します。`DEBUG_PORT`のデフォルト値は`0`（無効）です。

### 従来のプロファイルとの違い

* **`goroutine`と`goroutine/leak`**: 従来の`goroutine`プロファイルはすべてのアクティブなゴルーチンを一覧表示するため、手動での絞り込みが必要です。`goroutine/leak`プロファイルは到達不能なプリミティブで停止したゴルーチンだけを抽出します。
* **本番環境での使用**: Go 1.26のリークプロファイルは、テスト専用の`testing/synctest`パッケージとは異なり、実行時のオーバーヘッドが小さく、本番環境で使用できます。

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>