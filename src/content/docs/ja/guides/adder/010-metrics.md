# Adder Prometheusメトリクス

## 概要

Adderは、パイプラインのイベント処理状況をPrometheus形式で公開します。メトリクスエンドポイントはAPIリスナー上の`GET /metrics`で利用でき、`/v1`グループには含まれません。

## エンドポイント

APIリスナーを`API_ADDRESS`と`API_PORT`で設定します。デフォルトではリスナーは`0.0.0.0:8080`で待ち受けます。

```shell
curl http://localhost:8080/metrics
```

`/metrics`は、`/v1`のプレフィックスを付けずにAPIリスナーへリクエストします。Prometheusからアクセスする場合は、Adderを実行しているネットワークからAPIリスナーに到達できることを確認してください。`0.0.0.0`で待ち受ける設定は、すべてのネットワークインターフェイスからアクセスできるため、必要に応じてファイアウォールなどでアクセスを制限してください。

## パイプラインメトリクス

Adderは次の4つのメトリクスを公開します。

| メトリクス | 種類 | 内容 |
| --- | --- | --- |
| `adder_pipeline_received_events_total` | Counter | 入力プラグインの出力チャネルからパイプラインが読み取ったイベント数。 |
| `adder_pipeline_processed_events_total` | Counter | 設定したすべての出力チャネルがイベントを受け入れた後、終端ステージが完了したイベント数。外部シンクへの配信完了は確認しません。 |
| `adder_pipeline_filtered_events_total` | Counter | フィルターによって破棄されたイベント数。組み込みフィルターは拒否した各イベントを報告します。 |
| `adder_pipeline_processing_duration_seconds` | Histogram | パイプラインが入力イベントを読み取ってから、設定したすべての出力チャネルが受け入れるまでの時間。パイプラインへの入力時刻を保持する完了イベントを記録します。 |

### メトリクスの解釈

- `adder_pipeline_received_events_total`は、入力をパイプラインが受け取った時点で増加します。
- `adder_pipeline_filtered_events_total`は、フィルターがイベントを拒否した時点で増加します。
- `adder_pipeline_processed_events_total`は、設定した出力チャネルがイベントを受け入れ、終端ステージが完了した時点で増加します。この値は外部サービスやその他の外部シンクがイベントを受け取ったことを示しません。
- `adder_pipeline_processing_duration_seconds`は、入力から出力チャネルによる受け入れまでの処理時間を秒単位で記録します。
- これらのメトリクスにイベントの内容やユーザーデータを含むラベルはありません。
- CounterとHistogramの値はAdderのプロセス再起動時にリセットされます。

メトリクスの値は、Adderのプロセスが稼働している間のパイプラインの状態を示します。外部シンクへの到達状況を確認するには、各シンクが提供する配信状態や監視機能を使用してください。