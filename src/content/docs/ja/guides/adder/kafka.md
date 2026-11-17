---
title: "Kafka出力"
description: "AdderのKafka出力の設定と動作を説明します。"
---

# Kafka出力

`kafka` outputは、選択したAdderイベントをJSONとして1つのKafka topicに配信します。

- [コマンドリファレンス](./006-command_list.md)
- [出力設定の概要](./008-output-integrations.md)

## 設定

次のYAMLでKafka出力を設定します。

```yaml
output: kafka
plugins:
  output:
    kafka:
      brokers: "127.0.0.1:9092"
      topic: "adder.events"
      event-types: "blocks,rollbacks,governance"
```

- `brokers`には、1つ以上のKafka bootstrapブローカーをカンマ区切りで指定します。各値は有効な`host:port`形式で、hostとportを含める必要があります。既定値は`127.0.0.1:9092`です。
- `topic`にはKafka topicを指定します。topic名は1〜249文字のASCIIで、英数字、`.`、`_`、`-`だけを使用できます。`.`と`..`は指定できません。既定値は`adder.events`です。運用側はAdderの起動前にtopicを作成します。
- `username`と`password`はSASL PLAINの認証情報です。既定値は空です。片方だけを設定した構成は無効です。両方を設定する場合は`tls: true`も指定してください。シークレット管理機能を通じて認証情報を渡します。
- `tls`はブローカー接続でTLSを使用します。既定値は`false`です。SASL認証情報を使用する場合はTLSが必須です。
- `event-types`には、カンマ区切りで配信するイベント種別を指定します。既定値は`blocks,rollbacks,governance`です。`blocks`、`transactions`、`rollbacks`、`governance`、`drep-registration`、`drep-update`、`drep-retirement`だけを指定できます。Adderは未対応のイベント種別を含む構成を拒否します。

## 起動・配信・終了

### 起動

`start()`は入力読み取りループを開始する前にブローカーへpingを送信します。pingが成功しない場合、Adderは配信ワーカーを開始しません。

### 配信

各recordのvalueには、完全なAdder event JSONが入ります。keyは常に`adder.events`です。

producerは`RequiredAcks(kgo.AllISRAcks())`を使用し、すべてのin-sync replicaからacknowledgementを要求します（`acks=all`）。内部retryにはidempotent producerを使用します。

Adderは`ProduceSync(...).First()`で各recordの結果を同期的に待ってから、選択した次のeventを読み取ります。各recordには`kgo.RecordDeliveryTimeout`による10秒のdeadlineがあります。

1つのAdder producerはrecordを1つのpartitionに送り、topicのpartition数を変更しない限り、event typeが変わっても順序を維持します。この順序を使用する場合、topicのpartition数を増やさないでください。複数のAdder processは、全体で共有する順序を持ちません。

Adderは、brokerがdeliveryを拒否した場合、またはdeliveryの成否が不明な場合に、`TrySendError`を通じてそのrecordをpluginのerror channelに報告します。Adderはアプリケーションレベルで再送しません。応答を失う前にbrokerがrecordを受け取っていた可能性があり、新しい送信は元のproducer sequence numberを共有しないためです。clientは後続のeventで再接続できます。

成功したacknowledgementはconsumer processingの完了を示しません。brokerが設定したreplication policyを満たしたことだけを示します。

### 終了

shutdownまたは`Stop`の実行中、Adderはin-flight produceをキャンセルし、`Output.close`で`franz-go` clientを閉じます。shutdownまたはrestartの後、buffered eventを復元しません。

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
