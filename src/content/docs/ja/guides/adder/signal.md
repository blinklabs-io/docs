---
title: "Signal出力"
description: "AdderのSignal出力の設定と動作を説明します。"
---

<a id="signal-output"></a>

# <ins>Signal出力:</ins>

`signal`出力は、別途管理する[`signal-cli` HTTP JSON-RPCデーモン](https://github.com/AsamK/signal-cli/blob/master/man/signal-cli-jsonrpc.5.adoc)を通じて、選択したAdderイベントを送信します。Signalには公式のボットAPIがありません。リンク済みまたは登録済みのアカウントを使用する、管理対象のsignal-cliデーモンを実行してください。たとえば、次のコマンドを使用します。

```
signal-cli -a ACCOUNT daemon --http=127.0.0.1:8081
```

## 設定

`plugins.output.signal`に次のYAML設定を指定します。

```yaml
plugins:
  output:
    signal:
      endpoint: "http://127.0.0.1:8081/api/v1/rpc"
      recipients: "+15551234567,00000000-0000-0000-0000-000000000000"
      account: "+15557654321"
      event-types: "blocks,rollbacks,governance"
```

### 設定項目

| 項目 | 必須 | 説明 |
| --- | --- | --- |
| `endpoint` | いいえ | signal-cliデーモンのHTTP JSON-RPC URL。既定値は`http://127.0.0.1:8081/api/v1/rpc`です。 |
| `recipients` | はい | 受信者の電話番号またはサービスIDをカンマ区切りで指定します。既定値はありません。少なくとも1件の受信者を指定してください。 |
| `account` | いいえ | 複数アカウントを扱うデーモンで使用するsignal-cliアカウントです。 |
| `event-types` | いいえ | 送信するイベントタイプをカンマ区切りで指定します。既定値は`blocks,rollbacks,governance`です。値の大文字と小文字は区別しません。 |

### `endpoint`の制限

`endpoint`には、`/api/v1/rpc`パスを持つURLを指定します。Adderは次の規則でURLを検証します。

- リモートエンドポイントにはHTTPSを使用します。
- `localhost`、`127.0.0.1`、または`::1`のループバックエンドポイントではHTTPを使用できます。
- URLに認証情報、クエリ、またはフラグメントを指定できません。
- パスは`/api/v1/rpc`と完全に一致する必要があります。

### イベントタイプ

`event-types`には次の値を指定できます。

- `blocks` — ブロックイベント
- `transactions` — トランザクションイベント
- `rollbacks` — ロールバックイベント
- `governance` — ガバナンスイベント
- `drep-registration` — DRep登録イベント
- `drep-update` — DRep更新イベント
- `drep-retirement` — DRep退任イベント

`event-types`に未対応の値を指定すると、設定を拒否します。空の値は少なくとも1つのイベントタイプを指定していないため、設定を拒否します。

## 送信動作

選択した各イベントのJSONをメッセージ本文として、`signal-cli`の`send` JSON-RPCメソッドに送信します。HTTPリクエストは`POST`で、`Content-Type`は`application/json`です。`account`を指定した場合、リクエストにそのアカウントを含めます。

AdderはHTTPステータス`200`のレスポンスだけを受け付けます。さらに、レスポンスが次の条件をすべて満たす必要があります。

- JSON-RPCバージョンが`2.0`である。
- レスポンスIDがリクエストIDと一致する。
- `send`結果に0ではないタイムスタンプが含まれる。
- 各受信者の結果のステータスが`SUCCESS`である。

受信者の送信に失敗した場合、Adderはその結果タイプをエラーとして報告します。エラーにはメッセージ本文や受信者アドレスを記録しません。その他のRPCエラー、無効なレスポンス、HTTPエラーも出力エラーチャネルに報告します。

Adderはリクエストを自動的に再試行しません。タイムアウトはSignalがメッセージを送信した後にも発生する可能性があり、再試行すると重複送信につながるためです。RPCが成功した場合も、signal-cliが送信を受け付けたことだけを示し、受信者がメッセージを読んだことは示しません。

## 再起動時の動作

保留中のイベントはAdderの再起動をまたいで保持されません。再起動時に保留中だったイベントは、再起動後にSignalへ送信されません。

## 動作確認

安全に確認するには、専用のSignalアカウントと受信者を使用して、次の手順を実行します。

1. Signalアカウントをリンクまたは登録し、`signal-cli` HTTP JSON-RPCデーモンを実行します。
2. `endpoint`と`recipients`に確認用のデーモンと受信者を指定します。
3. `event-types`で選択したイベントをAdderから送信します。
4. 受信者にメッセージが届くことを確認します。

ローカルテストではHTTPテストデーモンを使用して、JSON-RPCリクエストとレスポンスの契約を確認できます。

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>