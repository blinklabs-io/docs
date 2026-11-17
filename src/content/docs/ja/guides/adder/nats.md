---
title: "NATS出力"
description: "AdderイベントをCore NATSへ配信するための設定と動作を説明します。"
---

# NATS出力

## 概要

この出力は、選択したAdderイベントをJSONとして[Core NATS subject](https://docs.nats.io/learn/core-nats/publish-subscribe)へ公開します。公式の[Go client](https://github.com/nats-io/nats.go/releases/tag/v1.54.0)を使用します。Core NATSの配信はat-most-onceであり、この出力はJetStreamや永続ストレージを必要としません。

## 設定

```yaml
output: nats
plugins:
  output:
    nats:
      servers: "nats://127.0.0.1:4222"
      subject-prefix: "adder.events"
      event-types: "blocks,rollbacks,governance"
```

### オプション

| オプション | 省略時の値 | 説明 |
| --- | --- | --- |
| `servers` | `nats://127.0.0.1:4222` | NATS server URLをコンマ区切りで指定します。 |
| `token` | 空文字列 | NATS認証トークンを指定します。 |
| `subject-prefix` | `adder.events` | イベントsubjectのプレフィックスを指定します。 |
| `event-types` | `blocks,rollbacks,governance` | 配信するイベントタイプをコンマ区切りで指定します。少なくとも1つの対応タイプを指定します。 |

### `servers`

`servers`には少なくとも1つのNATS URLを指定します。各URLには次の規則を適用します。

- `nats://`または`tls://`スキームを使用します。
- ホスト名を指定します。
- 認証情報、クエリ、フラグメントを含めません。
- パスを指定しないか、`/`だけを指定します。
- ポートを指定する場合は`1`から`65535`の範囲にします。

`token`を指定する場合はTLSに`tls://`を使用します。認証情報はsecret管理された設定から渡します。

### `subject-prefix`

`subject-prefix`には、ワイルドカードを含まない空でないNATS subject tokenを指定します。次の値は拒否されます。

- スペース、タブ、復帰、改行、`*`、`>`、`/`を含む値
- `.`で始まる値または`.`で終わる値
- `..`を含む値

### `event-types`

`event-types`には、次の対応イベント名を指定できます。Adderは未知の名前を拒否します。

| イベント名 | Adderイベントタイプ | 既定で選択 | subjectの例 |
| --- | --- | --- | --- |
| `blocks` | `input.block` | はい | `adder.events.block` |
| `transactions` | `input.transaction` | いいえ | `adder.events.transaction` |
| `rollbacks` | `input.rollback` | はい | `adder.events.rollback` |
| `governance` | `input.governance` | はい | `adder.events.governance` |
| `drep-registration` | `input.drep-registration` | いいえ | `adder.events.drep-registration` |
| `drep-update` | `input.drep-update` | いいえ | `adder.events.drep-update` |
| `drep-retirement` | `input.drep-retirement` | いいえ | `adder.events.drep-retirement` |

## 配信動作

### subjectとJSONペイロード

Adderは選択したイベントごとに、`subject-prefix`、`.`、`input.`を除いたイベントタイプを連結してsubjectを作成します。

各ペイロードには、Adderイベント全体をJSONとして含めます。

### flushとエラー

Adderは各publishの後に接続をflushします。各イベントでこのラウンドトリップを実行するため、サーバーがpublish commandを処理したことを確認できますが、ブローカーとのラウンドトリップ1回あたりおよそ1イベントに処理量が制限されます。flushは5秒でタイムアウトします。

flushの成功は、サーバーが先行するpublish commandを処理したことを示します。subscriberがイベントを受け取ったことや、Core NATSが配信を永続化したことは示しません。

publish、flush、非同期ブローカー拒否の失敗は、Adderのエラー通知で報告します。曖昧なflush失敗はメッセージを重複させる可能性があるため再試行しません。

### 再接続と停止

クライアントは後続イベントのために再接続しますが、オフラインpublishのバッファリングは無効です。切断中に公開したイベントは失敗し、キューに蓄積されません。停止時に接続を閉じ、メモリ上の保留イベントを復元しません。


## ライブ環境の確認

1. `adder.events.>`を購読します。
2. 選択したイベントを送信します。
3. subjectとJSONペイロードが期待した値であることを確認します。
4. ブローカーとの接続を切断し、出力がエラーを報告することを確認します。

個別のブローカーを用意しない場合でも、パッケージテストはローカルのCore NATS protocol peerを使用してsubjectの対応とシリアライズ済みペイロードを確認できます。

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>