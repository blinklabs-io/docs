---
title: "Adder出力連携リファレンス"
description: "Adderイベントを外部サービスへ配信する出力プラグインの設定と動作を説明します。"
---

# Adder出力連携

このリファレンスでは、Adderが選択したイベントをPostgreSQL、MQTT、RabbitMQ、Google Cloud Pub/Sub、Elasticsearch、S3、AWS SQS、AWS SNS、Redis Streamsへ配信する方法を説明します。各出力は`event-types`で対象イベントを選択し、利用できる既定値は出力ごとに異なります。

## 関連リファレンス

各出力の詳細な設定項目と配信動作は、次の個別リファレンスを参照してください。

- [Discordボット出力](./discord.md)
- [Slack Webhook出力](./slack.md)
- [Matrixルーム出力](./matrix.md)
- [ClickHouse出力](./clickhouse.md)
- [Kafka出力](./kafka.md)
- [NATS出力](./nats.md)
- [Signal出力](./signal.md)
- [再起動安全なWebhook配信](./webhook-durability.md)

## PostgreSQL

`postgres`出力は、選択したAdderイベントを既存のPostgreSQLデータベースの`adder_events`へ追加します。起動時にテーブルと時刻インデックスを作成するため、データベースアカウントには適切なDDL権限、テーブルへの`INSERT`権限、identityシーケンスの使用権限が必要です。

```yaml
plugins:
  output:
    postgres:
      database-url: postgres://adder:secret@localhost:5432/adder?sslmode=require
      event-types: blocks,transactions,rollbacks,governance
```

`database-url`の既定値は空です。接続URLにはホストとデータベースを指定してください。TCP接続でパスワードを使用する場合はTLSが必須です。`sslmode=prefer`は平文接続へフォールバックできるため使用せず、サーバーの識別情報も検証する場合は適切なルート証明書と`sslmode=verify-full`を使用します。

`event-types`の既定値は`blocks,transactions,rollbacks,governance,drep-registration,drep-update,drep-retirement`です。空の値やサポートされていないイベントタイプは設定エラーになります。

出力は`adder_events`に`arrival_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY`、`event_hash text`、`schema_version smallint`（現在は`1`）、`event_type text`、`event_time timestamptz`、`event_json jsonb`を保存します。選択したイベントはすべて追記専用のレコードになり、`input.rollback`も含まれます。ロールバックによって過去の行を削除せず、コンシューマーは単一の出力ライターについて`arrival_id`順に行を再生して有効なチェーン状態を導出します。複数の同時ライターではグローバルなチェーン順序を保証しません。互換性のない保存形式へ変更する場合は、新しいスキーマバージョンと明示的な移行が必要です。

各イベントは1つの`INSERT`文と1つのPostgreSQLトランザクションで処理します。プラグイン側のバッチ処理やフラッシュタイマーはありません。共有入力チャネルは最大10件をバッファーし、満杯になると上流の送信が空きを待ちます。`event_hash`には完全なJSONをGoがエンコードしたバイト列のSHA-256を保存し、PostgreSQLの`jsonb`は保存時の表現を正規化します。同一内容の重複イベントもすべて保持するため、ロールバック後に再適用したブロックを、以前のブロックとJSONが同一でも保存できます。Adderは再送と再適用を区別する上流の発生IDを受け取りません。

各文には10秒の期限があります。失敗した`INSERT`はプラグインのエラーチャネルへ報告しますが、ローカルで再試行するために保持しません。停止時には実行中の文をキャンセルし、キューに残るイベントを破棄します。

詳細は[PostgreSQL `INSERT` and `ON CONFLICT` documentation](https://www.postgresql.org/docs/current/sql-insert.html)、[`jsonb` documentation](https://www.postgresql.org/docs/current/datatype-json.html)、[pgx v5 driver](https://github.com/jackc/pgx/tree/master/stdlib)を参照してください。

## MQTT

`mqtt`出力は、選択したAdderイベントをJSONとしてMQTT 5のトピックへ公開します。

```yaml
output: mqtt
plugins:
  output:
    mqtt:
      broker: mqtt://127.0.0.1:1883
      client-id: adder-output
      topic-prefix: adder/events
      qos: 1
      event-types: blocks,rollbacks,governance
```

`broker`の既定値は`mqtt://127.0.0.1:1883`で、`mqtt://`と`tls://`のURLを指定できます。`client-id`の既定値は`adder-output`で、空にはできません。`username`と`password`は任意ですが、認証情報を使用する場合は`tls://`が必須です。各Adderインスタンスには異なる`client-id`を割り当てます。同じ識別子で接続すると、MQTTブローカーが既存のセッションを切断します。

`topic-prefix`の既定値は`adder/events`です。空でないトピックレベルだけを含め、MQTTワイルドカードの`+`と`#`、先頭または末尾の`/`、連続する`//`は使用できません。イベントタイプを末尾のトピックレベルとして追加するため、既定のトピックは`adder/events/block`、`adder/events/rollback`、`adder/events/governance`です。各トピックはイベントタイプの接尾辞を含めて65,535バイト以内にします。`transactions`、`drep-registration`、`drep-update`、`drep-retirement`も選択できます。ペイロードにはAdderイベント全体のJSONを使用し、MQTTのRETAINフラグは設定しません。

`qos`の既定値は`1`で、`0`、`1`、`2`だけを指定できます。QoS 1では公開完了はブローカーが`PUBACK`を送信したことを意味し、QoS 2ではQoS 2の交換をブローカーが完了したことを意味します。どちらもサブスクライバーが受信または処理したことを確認しません。QoS 0にはブローカーの確認応答を含めません。切断されたイベントと失敗した公開はエラーチャネルへ報告し、永続ストレージから再生しません。接続が切れた場合、次のイベントの前に再接続します。確認応答がタイムアウトすると配送結果は不明になり、失敗を報告します。QoS 2の`PUBCOMP 0x92`も不明な結果として報告します。Pahoの任意の公開キューは使用しません。

## RabbitMQ

`rabbitmq`出力は、選択したAdderイベントをJSONとしてRabbitMQへ公開します。

```yaml
output: rabbitmq
plugins:
  output:
    rabbitmq:
      url: amqp://127.0.0.1:5672/
      exchange: ""
      routing-key: adder.events
      persistent: true
      event-types: blocks,rollbacks,governance
```

`url`の既定値は`amqp://127.0.0.1:5672/`で、`amqp://`または`amqps://`だけを指定できます。URLにフラグメントは指定できません。信頼できるネットワークの外部へ接続する場合は`amqps://`を使用します。`exchange`の既定値は空で、空の場合はデフォルトexchangeを使用します。`routing-key`の既定値は`adder.events`で、空にはできません。デフォルトexchangeでは`routing-key`がキュー名になります。対象キューは事前に作成し、名前付きexchangeを使用する場合はexchangeとバインディングも事前に作成します。プラグインはブローカーのトポロジーを作成しません。

`persistent`の既定値は`true`です。永続メッセージを使用するには、永続的な宛先キューと適切なブローカー設定が必要です。メッセージだけを永続化しても、配送の永続性は保証しません。`event-types`の既定値は`blocks,rollbacks,governance`で、`transactions`、`drep-registration`、`drep-update`、`drep-retirement`も選択できます。

パブリッシャー確認とmandatory routingを有効にします。ルーティングできないメッセージは、ブローカーが公開を確認しても失敗として報告します。ブローカー確認はブローカーがメッセージを受け入れたことだけを示し、コンシューマーが処理したことは示しません。否定確認、接続のクローズ、10秒のタイムアウトはプラグインのエラーチャネルへ報告します。次のイベントで再接続しますが、再公開による重複を避けるため、不明な失敗を自動再試行しません。Adderには永続的な出力キューがないため、再起動時に保留イベントが失われることがあります。

詳細は[RabbitMQ publisher guide](https://www.rabbitmq.com/docs/publishers)を参照してください。

## Google Cloud Pub/Sub

`pubsub`出力は、選択したAdderイベントを既存のGoogle Cloud Pub/Subトピックへ送信します。認証には[Application Default Credentials](https://cloud.google.com/docs/authentication/application-default-credentials)を使用します。`project-id`と`topic-id`に対応するトピックを事前に作成してください。

```yaml
output: pubsub
plugins:
  output:
    pubsub:
      project-id: my-project
      topic-id: adder-events
      event-types: blocks,rollbacks,governance
```

`project-id`と`topic-id`の既定値は空です。トピックの完全な名前は`projects/{project-id}/topics/{topic-id}`です。`project-id`にはプロジェクトID、プロジェクト番号、または`example.com:my-project`のような従来のドメインスコープIDを指定できます。`topic-id`はPub/Subの命名規則に従う必要があります。`event-types`の既定値は`blocks,rollbacks,governance`で、`transactions`、`drep-registration`、`drep-update`、`drep-retirement`も選択できます。

完全なAdderイベントJSONをメッセージの`Data`に設定し、`event_type`属性にイベントタイプを設定します。`PublishResult.Get`がサービスによるメッセージの受け入れまたは拒否を返すまで次のイベントを受け付けません。これはサブスクライバーの処理完了を確認するものではありません。公開は意図的なバッチ処理を行わず、各リクエストには10秒の期限があります。失敗はエラーチャネルへ報告し、ローカルで永続的に再生しません。停止時には新しいイベントの受け付けを止め、実行中の公開を最大10秒待ってからクライアントを閉じます。結果を待つ処理が停止した後も公開が成功する場合があります。

メッセージの`Data`は最大10,000,000バイトです。サービスの現在の制限ではデータフィールドと公開リクエストが10 MBまでですが、リクエストのオーバーヘッドによって上限付近のメッセージが拒否される場合があります。詳細は[Pub/Sub limits](https://cloud.google.com/pubsub/quotas)と[documented naming rules](https://cloud.google.com/pubsub/docs/create-topic)を参照してください。

## Elasticsearch

`elasticsearch`出力は、選択したAdderイベントをバージョン付きインデックスへ登録します。起動時に厳密なマッピングでインデックスを作成し、`schema_version`、`event_type`、`event_time`を管理します。完全なイベントはインデックスを無効にしたソースJSONとして`event`に保存するため、任意のペイロードフィールドを誤ってマッピングしません。

```yaml
output: elasticsearch
plugins:
  output:
    elasticsearch:
      url: https://elastic.example.org:9200
      index: adder-events-v1
      api-key: BASE64_ENCODED_API_KEY
      event-types: blocks,transactions,rollbacks,governance
```

`url`の既定値は`http://127.0.0.1:9200`です。URLには`http://`または`https://`を使用し、認証情報、パス、クエリ、フラグメントは含めません。`api-key`は任意で既定値は空ですが、指定する場合は`https://`が必須です。`index`の既定値は`adder-events-v1`で、バージョン付きインデックス名を指定します。既存インデックスのマッピングが互換性を持たない場合、起動に失敗します。互換性のないスキーマには新しい`-vN`インデックスを作成して設定を更新します。プラグインは既存インデックスを移行しません。

`event-types`の既定値は`blocks,transactions,rollbacks,governance,drep-registration,drep-update,drep-retirement`です。ドキュメントIDには完全なイベントJSONのSHA-256を使用します。同じJSONを再送すると同じドキュメントを上書きし、タイムスタンプまたはペイロードが異なると別のドキュメントになります。ロールバックは個別の`input.rollback`ドキュメントになり、以前のイベントを削除または書き換えません。検索クライアントは有効なチェーン状態を導出するときにロールバックを適用してください。検索結果は挿入順を提供しないため、この出力だけでは順序付きチェーン再生に適しません。

バッチバッファーやフラッシュタイマーはなく、各ドキュメントの応答を待ってから次のイベントを処理します。共有入力チャネルは10件をバッファーします。インデックスリクエストには10秒の期限があり、トランスポートエラーとHTTP `429`、`502`、`503`、`504`を最大4回まで短いバックオフで再試行します。タイムアウトによって結果が不明になる場合があります。失敗はログに記録し、空きがある場合はエラーチャネルへ送ります。停止時にはキューに残るイベントを破棄します。APIキーにはHTTPSと、インデックスの作成およびドキュメント登録に必要な権限が必要です。

詳細は[Create index API](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-indices-create)、[Index document API](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-index)、[indexing guidance for HTTP 429](https://www.elastic.co/docs/deploy-manage/production-guidance/optimize-performance/indexing-speed)を参照してください。

## S3

`s3`出力は、選択したAdderイベントを1イベント1オブジェクトのUTF-8 JSONとしてAmazon S3へ保存します。`Content-Type: application/json`とS3 SHA-256チェックサムを付け、通常のAWS認証情報チェーンと指定したリージョンを使用します。バケットは事前に作成してください。

```yaml
output: s3
plugins:
  output:
    s3:
      region: us-east-1
      bucket: adder-archive
      prefix: adder/events
      event-types: blocks,transactions,rollbacks,governance
```

`region`と`bucket`の既定値は空で、`prefix`の既定値は`adder/events`です。バケット名とプレフィックスには有効なUTF-8を指定し、最終的なオブジェクトキーを1,024バイト以内に収めます。`event-types`の既定値は`blocks,transactions,rollbacks,governance,drep-registration,drep-update,drep-retirement`です。

オブジェクトキーは`<prefix>/YYYY/MM/DD/<UTC timestamp>-<SHA-256 of JSON>.json`です。JSONはAdderの`timestamp`、`context`、`payload`、`type`フィールドを持ちます。日付にはイベントのタイムスタンプをUTCで使用します。同じイベントを再生すると同じバイト列を同じキーへ書き込み、同じタイムスタンプを持つ異なるイベントには異なるキーを作成します。ロールバックは通常の`input.rollback`アーカイブレコードであり、以前のオブジェクトを削除または書き換えません。コンシューマーはチェーン状態を構築するときにロールバックを適用してください。

バッチバッファーやバックグラウンドのフラッシュはなく、各`PutObject`応答を待ってから次のイベントを処理します。共有入力チャネルは10件を保持できます。AWS SDKはそのリクエスト内で再試行可能なエラーを再試行し、リクエスト全体の制限時間は30秒です。停止時には実行中のアップロードをキャンセルし、キューに残るイベントを破棄します。エラーはログに記録し、空きがある場合はプラグインのエラーチャネルへ報告します。失敗したイベントを再生用に保持せず、タイムアウトでは配送結果が不明になることがあります。プロセス再起動後に再生するには、再生可能な上流ソースを使用してください。

選択したプレフィックスには`s3:PutObject`権限が必要です。カスタマーマネージドSSE-KMSを使用するバケットでは、AWSの説明に従って必要なKMS権限も付与します。詳細は[PutObject API](https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutObject.html)と[AWS SDK for Go v2 S3 examples](https://docs.aws.amazon.com/sdk-for-go/v2/developer-guide/go_s3_code_examples.html)を参照してください。

## AWS SQSとSNS

`sqs`は選択したAdderイベントを1つのキューへ送信し、`sns`は選択したイベントを1つのトピックへ公開します。どちらもAWS SDK for Go v2と既定の認証情報チェーンを使用します。IAMロール、プロファイル、または環境変数で認証情報を提供し、Adderの設定にアクセスキーを保存しません。

```yaml
output: sqs
plugins:
  output:
    sqs:
      region: us-east-1
      queue-url: https://sqs.us-east-1.amazonaws.com/123456789012/adder.fifo
      group-id: chain
      event-types: blocks,rollbacks,governance
```

```yaml
output: sns
plugins:
  output:
    sns:
      region: us-east-1
      topic-arn: arn:aws:sns:us-east-1:123456789012:adder.fifo
      group-id: chain
      max-message-bytes: 262144
      event-types: blocks,rollbacks,governance
```

`region`と`group-id`の既定値は空です。`sqs`では`queue-url`、`sns`では`topic-arn`の既定値も空です。`sns`の`max-message-bytes`の既定値は`262144`です。SQSの標準AWSホスト名を使用する場合、キューURLのリージョンは`region`と一致する必要があります。HTTPSのSQSキューURL、または正しい形式のSNSトピックARNを指定します。キューとトピックは事前に作成します。

イベントJSONを[SQS SendMessage](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/API_SendMessage.html)の`MessageBody`、または[SNS Publish](https://docs.aws.amazon.com/sns/latest/api/API_Publish.html)の`Message`に設定します。各イベントを個別のAPI呼び出しで送信し、バッチ処理や永続的なローカルキューは使用しません。AWS SDKは10秒のリクエスト期限内で通常の一時的な再試行を行います。失敗したリクエストはエラーチャネルへ報告し、再生しません。API成功は、SQSがメッセージをキューへ受け入れたこと、またはSNSがファンアウト用の公開を受け入れたことだけを示し、コンシューマーの受信を証明しません。ロールバックはロールバックイベントレコードとして公開し、以前のイベントの解釈はコンシューマーに委ねます。

宛先名が`.fifo`で終わるFIFO宛先では`group-id`が必須で、使用できる文字も検証します。完全なイベントJSONのSHA-256を`MessageDeduplicationId`として設定します。同一のイベントJSONはサービスの重複排除期間内に重複排除されますが、新しいタイムスタンプで再出力したイベントは異なるダイジェストになります。標準宛先では`group-id`を省略できます。標準SQSキューで設定するとfair queueが有効になり、標準SNSトピックでは標準SQSサブスクリプションに対してのみfair queue用に転送します。標準宛先ではFIFOの順序付けや重複排除は提供しません。

`event-types`の既定値は`blocks,rollbacks,governance`で、`transactions`、`drep-registration`、`drep-update`、`drep-retirement`も選択できます。SQSメッセージの上限は1 MiBです。SNSトピックの既定値は256 KiBで、`max-message-bytes`には宛先の上限に合わせて256 KiBから1 MiBまでを指定します。その場合はSNSの`MaximumMessageSize`と同じ値を指定してください。宛先がより小さい上限を適用して、サービスがエラーを返す場合があります。

## Redis Streams

`redis`出力は、[`XADD`](https://redis.io/docs/latest/commands/xadd/)を使用して選択したAdderイベントをRedis Streamへ追加します。`XADD`にはRedis Open Source 5.0以降が必要です。任意のACL`username`にはRedis 6.0以降が必要で、この出力はRedis 8.6の冪等プロデューサー拡張を必要としません。

```yaml
output: redis
plugins:
  output:
    redis:
      address: "127.0.0.1:6379"
      stream: "adder.events"
      event-types: "blocks,rollbacks,governance"
```

`address`の既定値は`127.0.0.1:6379`です。`username`と`password`の既定値は空で、`tls`の既定値は`false`です。`stream`の既定値は`adder.events`で、空にはできません。Redis ACL認証には`username`と`password`を設定し、デフォルトユーザーには`password`だけを設定します。認証情報を使用する場合は`tls: true`が必須で、サーバー側でも[Redis TLS](https://redis.io/docs/latest/operate/oss_and_stack/management/security/encryption/)を設定してください。`address`は`host:port`形式で指定します。起動時にRedisへ接続して確認するため、接続できない場合は起動に失敗します。

選択したイベントごとに、設定したStreamへ1つの`XADD`エントリを追加します。RedisがエントリIDを生成し、`type`フィールドにはAdderイベントタイプ、`event`フィールドにはイベント全体のJSONを設定します。Redisから成功応答を受け取った場合、Redisが追加を受け入れたことを確認しますが、ディスクへの永続化やコンシューマーによる消費は確認しません。エントリは[`XRANGE`](https://redis.io/docs/latest/commands/xrange/)で確認し、[`XREAD`](https://redis.io/docs/latest/commands/xread/)で読み取れます。

各追加処理には5秒の期限があります。クライアントはコマンドを再試行せず、エラーをプラグインのエラーチャネルへ送信します。Redisがコマンドを受け取る前の接続失敗ではイベントを保存しませんが、応答を失うと配送結果が不明になります。`XADD *`を繰り返すと重複を作成する可能性があるため、Adderはどちらの場合も自動的に再生しません。後続イベントではクライアント接続プールを使用し、再接続する場合があります。停止または再起動後に保留イベントを復元しません。Streamのサイズと保持期間はRedis運用者が管理し、この出力はエントリをトリミングしません。

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
