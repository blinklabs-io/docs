---
title: "Kafka出力"
description: "AdderのKafka出力の設定と動作を説明します。"
---

# Kafka出力

`kafka` outputは、選択したAdderイベントをJSONとして1つのKafka topicに配信します。

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

- `brokers`には、カンマ区切りのKafka bootstrap `host:port`アドレスを指定します。既定値は`127.0.0.1:9092`です。
- `topic`にはKafka topicを指定します。既定値は`adder.events`です。Adderの起動前にtopicを作成してください。
- `username`と`password`は、SASL PLAINの任意の認証情報です。既定値は空です。両方を設定し、認証情報を使用する場合は`tls: true`を指定してください。シークレット管理機能を通じて認証情報を渡します。
- `tls`はブローカー接続でTLSを使用します。既定値は`false`です。
- `event-types`には、カンマ区切りで配信するイベント種別を指定します。既定値は`blocks,rollbacks,governance`です。追加で`transactions`、`drep-registration`、`drep-update`、`drep-retirement`を指定できます。

## 配信動作

各recordのvalueには、完全なAdder event JSONが入ります。keyは常に`adder.events`です。

1つのAdder producerはrecordを1つのpartitionに送り、topicのpartition数を変更しない限り、event typeが変わっても順序を維持します。この順序を使用する場合、topicのpartition数を増やさないでください。複数のAdder processは、全体で共有する順序を持ちません。

producerは、すべてのin-sync replicaからacknowledgementを要求します（`acks=all`）。内部retryにはidempotent producerを使用します。acknowledgementとidempotenceの仕様については、[Apache Kafka producer configuration](https://kafka.apache.org/44/configuration/producer-configs/)を参照してください。

Adderは、選択した次のeventを読み取る前に、各recordの結果を待ちます。各送信には10秒のdeadlineがあります。

Adderは、brokerが拒否したdeliveryまたは成否が不明なdeliveryをpluginのerror channelに報告します。Adderは失敗したrecordをアプリケーションレベルで再送しません。replyを失う前にbrokerがrecordを受け取った可能性があり、新しい送信は元のproducer sequence numberを共有しないためです。clientは後続のeventで再接続できます。

shutdownまたはrestartの後、buffered eventを復元しません。成功したacknowledgementは、consumer processingではなく、brokerの設定したreplication policyを確認します。

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
