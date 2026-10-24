---
title: Grafana ダッシュボード
description: Dingo プールの SPO ガイド - Grafana ダッシュボード。
---

# Dingo Grafana ダッシュボード

Blink Labs が開発する Go 実装の Cardano ノード、[Dingo](https://github.com/blinklabs-io/dingo)用の監視ダッシュボードです。

ファイルと README は [Dingo リポジトリ](https://github.com/blinklabs-io/dingo/tree/main/docs/dashboards)にあります。

## ダッシュボード

| ダッシュボード | ファイル | 内容 |
| --- | --- | --- |
| **Node Overview** | `node-overview.json` | エポック、スロット、先端との差、密度、blockfetch、メモリプール、KES、ピア、ストレージ、ランタイムの概要、ブロック高、エポック進行、ブロック生成統計 |
| **Block Production** | `block-production.json` | ブロック生成レイテンシのヒートマップ、ブロック遅延の累積分布、生成率、KES ライフサイクル |
| **Peer Health** | `peer-health.json` | ホット/ウォーム/コールドのピア、接続の種類、ピア状態の時系列、昇格と降格、ネットワーク I/O |
| **Mempool** | `mempool.json` | 保留トランザクション、メモリプールサイズ、トランザクションのライフサイクル、CBOR キャッシュ、イベントバス |
| **Resource Usage** | `resources.json` | CPU、メモリ、GC ヒートマップ、ディスク I/O、IOPS、PSI 負荷、Badger、ファイル記述子 |

## 前提条件

次の項目を用意します。

- **Grafana 12+**（12.4 で確認済み）: [インストールガイド](https://grafana.com/docs/grafana/latest/setup-grafana/installation/)
- **Prometheus**: ローカル構成では `localhost:12798` の Dingo を収集します（手順 2 で設定）。リモート収集では、ノードの `metricsBindAddr` または `DINGO_METRICS_BIND_ADDR` を明示的に設定します。`bindAddr` ではメトリクスの公開範囲は変わりません。
- **Dingo**: メトリクスを有効にしたノード。既定のポートは `12798`、バインド先は `127.0.0.1` です。
- **[Business Text プラグイン](https://grafana.com/grafana/plugins/marcusolsson-dynamictext-panel/)**: すべてのダッシュボードのヘッダーパネルに必要です。
- **[prometheus-node-exporter](https://github.com/prometheus/node_exporter)**: ホストの CPU、メモリ、ディスクを表示する Resource Usage ダッシュボードにのみ必要です。

## クイックスタート

### 1. Business Text プラグインのインストール

Grafana のマシンで端末を開き、実行します。

```bash
sudo grafana cli --homepath /usr/share/grafana --pluginsDir /var/lib/grafana/plugins plugins install marcusolsson-dynamictext-panel
sudo systemctl restart grafana-server
```

`--homepath` と `--pluginsDir` は Grafana の `.deb` と `.rpm` が使用するパスです。これらがない場合、Grafana 13 は `Could not find config defaults` で停止します。

Docker または Kubernetes では、代わりに環境変数を設定します。

```text
GF_INSTALL_PLUGINS=marcusolsson-dynamictext-panel
```

### 2. Prometheus 収集先の設定

Dingo の場所を指定するため、`prometheus.yml` の `scrape_configs` に追加します。

```yaml
- job_name: dingo
  scrape_interval: 15s
  static_configs:
    - targets: ['localhost:12798']

# Optional: required for Resource Usage dashboard
- job_name: node
  scrape_interval: 15s
  static_configs:
    - targets: ['localhost:9100']
```

Dingo の YAML の `metricsAuthToken` または `DINGO_METRICS_AUTH_TOKEN` でトークンを設定します。この秘密情報用の CLI フラグはありません。次を `dingo` 収集ジョブに追加します。

```yaml
  authorization:
    credentials_file: /run/secrets/dingo-metrics-token
```

`credentials_file` には設定したトークンの値だけを格納し、`Bearer ` 接頭辞を付けないでください。同じトークンが Mithril メトリクスも保護するため、そちらの収集にも同じ Prometheus 認証設定を使用します。メトリクスリスナーは平文 HTTP です。リモートでトークンを送る場合、TLS リバースプロキシまたは認証付き暗号化トンネルで通信を保護してください。

設定を反映するため Prometheus を再読み込みします。

```bash
sudo systemctl reload prometheus
```

### 3. Prometheus データソースの追加

Grafana には、既定として設定された Prometheus データソースが必要です。既存のデータソースが既定の場合のみ、この手順を省略できます。そうでなければ、次の設定を追加するか、**Connections → Data sources** で既存のものの **Default** を有効にします。

```bash
sudo tee /etc/grafana/provisioning/datasources/prometheus.yaml >/dev/null <<'EOF'
apiVersion: 1
datasources:
  - name: Prometheus
    type: prometheus
    url: http://localhost:9090
    access: proxy
    isDefault: true
EOF
sudo systemctl restart grafana-server
```

Prometheus が別のホストまたはポートで動く場合は `url` を変更します。

### 4. ダッシュボードの取り込み

2 つの方法があります。

**方法 A: プロビジョニング（推奨）**

ディスク上のファイルから自動で取り込みます。起動時、または既に稼働していれば約 30 秒以内に読み込みます。

```bash
DASH_URL=https://raw.githubusercontent.com/blinklabs-io/dingo/main/docs/dashboards
sudo mkdir -p /var/lib/grafana/dashboards/dingo
sudo curl -fsSL -o /etc/grafana/provisioning/dashboards/dingo.yaml "$DASH_URL/provisioning.yaml"
for f in node-overview block-production peer-health mempool resources; do
  sudo curl -fsSL -o "/var/lib/grafana/dashboards/dingo/$f.json" "$DASH_URL/$f.json"
done
sudo chown -R grafana:grafana /var/lib/grafana/dashboards/dingo/
sudo systemctl restart grafana-server
```

再起動後、Grafana の **Dashboards → Browse** で「Dingo」を検索します。5 つのダッシュボードが **Dingo** フォルダーに自動表示されます。

**注意:** `allowUiUpdates: true` では UI で編集できますが、次のプロビジョニング周期（30 秒ごと）で上書きされます。永続的な変更は JSON ファイルを直接編集してください。

**方法 B: 手動インポート**

1. ブラウザーで Grafana を開きます。
2. **Dashboards → New → Import** に移動します。
3. 各 JSON ファイルをアップロードします。

既定の Prometheus データソースを自動使用します。[データソース](#datasource)を参照してください。

### 5. アラートルール（任意）

ルールファイルは編集せず使用できます。Prometheus のルールディレクトリにコピーします。

```bash
sudo mkdir -p /etc/prometheus/rules
sudo curl -fsSL -o /etc/prometheus/rules/dingo.yaml https://raw.githubusercontent.com/blinklabs-io/dingo/main/docs/dashboards/alerts.yaml
```

`prometheus.yml` に追加します。

```yaml
rule_files:
  - /etc/prometheus/rules/dingo.yaml
```

Prometheus を再読み込みします。

```bash
sudo systemctl reload prometheus
```

<a id="datasource"></a>

## データソース

すべてのダッシュボードは UID `default` で Prometheus データソースを参照します。これは、既定として設定されたデータソースを指す Grafana の組み込み別名です。Prometheus が既定であれば、UID の変更なしで参照できます。

## テンプレート変数

すべてのダッシュボードは、Dingo インスタンスを自動検出する 2 つの変数を含みます。

| 変数 | クエリ | 用途 |
| --- | --- | --- |
| `$network` | `label_values(dingo_build_info, network)` | Cardano ネットワーク（`preview`、`preprod`、`mainnet`）の選択。 |
| `$instance` | `label_values(dingo_build_info{network="$network"}, instance)` | 特定の Dingo インスタンスの選択。複数選択可能で、既定値は All。 |

`dingo_build_info` は Dingo だけが公開するメトリクスで、`network`、`version`、`commit` ラベルを含みます。このため、ドロップダウンには Dingo のみが表示され、Haskell cardano-node は表示されません。

パネルクエリのセレクターはすべて `{network="$network", instance=~"$instance"}` です。

**Resource Usage** は 3 つ目の変数を追加します。

| 変数 | クエリ | 用途 |
| --- | --- | --- |
| `$node_instance` | `label_values(node_uname_info, instance)` | ホストの CPU、メモリ、ディスク、ネットワーク用の node_exporter 取得先。node_exporter は Dingo メトリクスとは別ポート（既定 `9100`）なので、独自のインスタンス選択が必要です。 |

`$node_instance` は、node_exporter 取得先のホスト名とポート（通常 `localhost:9100` またはホスト IP）を指定します。

## ナビゲーション

上部のリンクが 5 つのダッシュボードを結び、選択した時間範囲とテンプレート変数を保持します。

## 非アクティブなメトリクス

機能が有効なときだけ出力するメトリクスがあります。有効になるまで、パネルは「No data」を表示します。

| メトリクス | 出力条件 |
| --- | --- |
| `cardano_node_metrics_Forge_node_is_leader_int` | ブロック生成が有効 |
| `cardano_node_metrics_Forge_adopted_int` | ブロックを生成し、採用したとき |
| `dingo_metrics_blockForgingLatency_seconds_bucket` | ブロック生成時 |
| `cardano_node_metrics_remainingKESPeriods_int` | KES 鍵が設定されている |
| `dingo_forge_tip_gap_slots` | ブロック生成が有効 |
| `dingo_forge_opcert_counter_loaded` | ブロック生成の資格情報を読み込み済み |
| `dingo_forge_opcert_counter_onchain` | ブロック生成の資格情報を読み込み済み。プールの運用証明書を含むブロックを台帳が適用するまでは `NaN` |
| `dingo_forge_slots_per_kes_period` | ブロック生成の資格情報を読み込み済み |
| `dingo_forge_credentials_valid` | 資格情報を読み込み済み。現在のスロットで署名できなければ 0 |
| `dingo_forge_missed_leader_slots_total` | ブロック生成が有効。ノード自身のブロックが採用されなかったリーダースロットを数える |
| `dingo_database_size_bytes` | データベースストアの初期化後 |
| `database_blob_*` | Badger blob ストアが有効 |

## ファイル一覧

```text
https://github.com/blinklabs-io/dingo/tree/main/docs/dashboards
  node-overview.json       Node Overview dashboard
  block-production.json    Block Production dashboard
  peer-health.json         Peer Health dashboard
  mempool.json             Mempool dashboard
  resources.json           Resource Usage dashboard
  provisioning.yaml        Grafana provisioning config
  prometheus.yaml          Prometheus scrape config snippet
  alerts.yaml              Prometheus alert rules
  alerts_test.yaml         promtool test cases for alerts.yaml
  README.md                Source for this page
```

## トラブルシューティング

**Business Text がない / "Panel plugin not found: marcusolsson-dynamictext-panel" と表示される**
手順 1 でインストールして Grafana を再起動します。管理環境では `GF_INSTALL_PLUGINS` に `marcusolsson-dynamictext-panel` を追加します。

**パネルに "No data" と表示される**
Prometheus の **Status → Targets** で `dingo` ジョブが稼働しているか確認します。ダッシュボード上部の `$network` と `$instance` も確認してください。

**データソースが見つからない**
**Connections → Data sources** で Prometheus を開き、**Default** を有効にします。

**プロビジョニング後に表示されない**
`/etc/grafana/provisioning/dashboards/dingo.yaml` のパスを確認します。Grafana は 30 秒ごとに再読み込みします。1 分後にも表示されなければ、`journalctl -u grafana-server` でエラーを確認します。


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
