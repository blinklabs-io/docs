---
title: node-parity from-genesisメトリクス
description: node-parity from-genesisのPrometheusメトリクスを有効化し、監視する方法を説明する。
---

# node-parity from-genesisメトリクス

このページでは、`node-parity from-genesis` のPrometheusメトリクスを有効化し、検証結果とアラートを解釈する方法を説明します。対象ネットワークは `preview` と `preprod` です。

## メトリクスの有効化

`from-genesis` はDingoのチェーンをgenesisから追跡し、エポックごとにプロトコルパラメータ、ステーク分布、UTxOセットをKoiosと比較します。実行には `--network` と `--dingo-addr` が必要です。

`--metrics-addr` を明示的に指定して、メトリクスリスナーを有効にします。

```bash
node-parity from-genesis \
  --network preview \
  --dingo-addr /path/to/dingo.socket \
  --metrics-addr :9464
```

Prometheusは、指定したアドレスの `/metrics` エンドポイントをスクレイプします。既定値は `:9464` ですが、`from-genesis` はフラグを省略するとリスナーを起動しません。空の値を明示すると、リスナーを無効にできます。

```bash
node-parity from-genesis \
  --network preview \
  --dingo-addr /path/to/dingo.socket \
  --metrics-addr=
```

`--metrics-addr` は `node-parity` プロセスのリスナーを制御します。Dingoの `dingo.yaml` にある `metricsPort` とは別の設定です。

## メトリクスの契約

すべての `from-genesis` メトリクスは、実行対象の `network` ラベルを持ちます。`field` ラベルには次の値を使用します。

- `protocol_params`
- `stake_distribution`
- `utxo`

| メトリクス | ラベル | 意味 |
| --- | --- | --- |
| `node_parity_epochs_total` | `network` | 少なくとも1つのチェックが信頼できる判定に到達したエポック数。 |
| `node_parity_epoch_checks_incomplete_total{field}` | `network`, `field` | 信頼できる判定に到達できなかったチェック数。 |
| `node_parity_divergence_total{field,reference="koios"}` | `network`, `field`, `reference` | DingoとKoiosの間で実際の差異を検出した回数。 |

実際の差異と不完全なチェックは別の状態です。`node_parity_divergence_total` はDingoの値とKoiosの値が異なる場合に増加します。`node_parity_epoch_checks_incomplete_total` はチェックを信頼できる判定まで完了できなかった場合に増加します。

`node_parity_divergence_total` は `check` と `watch` でも使用し、その場合の `reference` は `"cardano_node"` です。`from-genesis` は `reference="koios"` を使用します。

`from-genesis` は `check` と `watch` 用の次のカウンターを登録しません。

- `node_parity_checks_total`
- `node_parity_checks_skipped_total`
- `node_parity_check_errors_total`

そのため、これらのカウンターの欠如は `from-genesis` の正常性を示しません。`from-genesis` の進行状況は、専用のエポックカウンターと不完全チェックカウンターで確認します。

## アラート

### `NodeParityFromGenesisStalled`

プロセスの起動から2時間を超えた後、直近2時間に検証済みエポックも不完全なチェックも記録されない状態を検出します。この状態が15分続くと、アラートルールは発報します。リプレイ自体が停止した可能性を示します。

### `NodeParityFromGenesisNotVerifying`

直近2時間に不完全なチェックが発生している一方、信頼できる判定に到達したエポックがない状態を検出します。この状態が30分続くと、アラートルールは発報します。Koiosを参照できず、リプレイが進んでいても検証できていない可能性を示します。

共有の `node-parity` 差異アラートは、アノテーションの `{{ $labels.reference }}` で比較対象を示します。`from-genesis` の差異では `koios`、`check` と `watch` の差異では `cardano_node` が表示されます。

---
<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>