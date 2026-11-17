# Adder Prometheusメトリクス

## 概要

Adderは、パイプラインのイベント処理状況をPrometheus形式で公開します。AdderはAPIリスナー上で`GET /metrics`を提供し、このエンドポイントを`/v1`グループの外部に配置します。

## エンドポイント

APIリスナーを`API_ADDRESS`と`API_PORT`で設定します。デフォルトではリスナーは`0.0.0.0:8080`で待ち受けます。

```shell
curl http://localhost:8080/metrics
```

Prometheusは、`/v1`のプレフィックスを付けずにAPIリスナーへ`/metrics`をリクエストします。Prometheusからアクセスする場合は、Adderを実行しているネットワークからAPIリスナーに到達できることを確認してください。`0.0.0.0`で待ち受ける設定は、すべてのネットワークインターフェイスからのアクセスを許可するため、必要に応じてファイアウォールなどでアクセスを制限してください。

## パイプラインメトリクス

Adderは次の4つのメトリクスを公開します。

| メトリクス | 種類 | 内容 |
| --- | --- | --- |
| `adder_pipeline_received_events_total` | Counter | 入力プラグインの出力チャネルからパイプラインが読み取ったイベント数。 |
| `adder_pipeline_processed_events_total` | Counter | 設定したすべての出力チャネルがイベントを受け入れた後、終端ステージが完了したイベント数。外部シンクへの配信完了は確認しません。 |
| `adder_pipeline_filtered_events_total` | Counter | フィルターによって破棄されたイベント数。組み込みフィルターは拒否した各イベントを報告します。 |
| `adder_pipeline_processing_duration_seconds` | Histogram | パイプラインが入力イベントを読み取ってから、設定したすべての出力チャネルが受け入れるまでの時間。パイプラインへの入力時刻を保持する完了イベントを記録します。 |

### メトリクスの解釈

- `adder_pipeline_processed_events_total`は、設定した出力チャネルがイベントを受け入れたことを示しますが、外部サービスやその他の外部シンクがイベントを受け取ったことを示しません。
- Adderは、これらのメトリクスにイベントの内容やユーザーデータを含むラベルを使用しません。
- Adderは、プロセスを再起動するとCounterとHistogramの値をリセットします。