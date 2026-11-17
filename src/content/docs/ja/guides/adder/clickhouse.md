---
title: "ClickHouse出力"
description: "AdderのClickHouse出力における設定とイベント保存動作を説明します。"
---

# ClickHouse出力

## 概要

`clickhouse`出力は、選択したイベントをHTTP経由の`JSONEachRow`バッチとして、指定したClickHouseデータベースの`adder_events_v1`に保存します。この出力は、起動時に`MergeTree`テーブルを作成し、`event_time`の月単位でパーティションを分けます。

関連情報は[コマンドリファレンス](./006-command_list.md)と[出力連携リファレンス](./008-output-integrations.md)です。

## 設定

YAML設定では、`output`に`clickhouse`を指定し、`plugins.output.clickhouse`の下に接続情報とイベント種別を設定します。

```yaml
output: clickhouse
plugins:
  output:
    clickhouse:
      url: https://clickhouse.example.org:8443
      database: analytics
      username: adder
      password: YOUR_PASSWORD
      event-types: blocks,transactions,rollbacks,governance
```

### パラメーター

| キー | デフォルト値 | 説明 |
| --- | --- | --- |
| `url` | `http://127.0.0.1:8123` | ClickHouseのHTTP接続先です。 |
| `database` | `default` | 保存先のClickHouseデータベースです。 |
| `username` | `default` | ClickHouseユーザーです。 |
| `password` | 空 | 任意のClickHouseパスワードです。 |
| `event-types` | `blocks,transactions,rollbacks,governance,drep-registration,drep-update,drep-retirement` | 保存するイベント種別をコンマ区切りで指定します。 |

次の制約を満たす値を指定してください。

- `url`には、ホスト名を含む`http://`または`https://`のHTTP originを指定します。認証情報、クエリ、フラグメント、パスは指定できません。ただし、パス`/`は使用できます。
- `username`は空にできません。
- `database`は空にできず、空白、`/`、または`\\`を含めることはできません。
- `password`を指定する場合、`localhost`またはループバックアドレス以外では`https://`を使用します。
- `event-types`には、パラメーター表に示した対応値を少なくとも1つ指定します。未対応の値や空のリストは拒否されます。
- HTTPリクエストはリダイレクトを追跡せず、リダイレクト先へ認証情報を転送しません。

## `adder_events_v1`テーブル

出力は、次の列を持つ`adder_events_v1`テーブルに`JSONEachRow`形式で行を挿入します。

| フィールド | 型 | 内容 |
| --- | --- | --- |
| `schema_version` | `UInt8` | 行スキーマのバージョンです。現在の値は`1`です。 |
| `event_hash` | `String` | イベント全体のJSONに対するSHA-256値です。重複を比較するために使用しますが、一意キーではありません。 |
| `event_type` | `LowCardinality(String)` | イベントの値です。値には`input.block`、`input.transaction`、`input.rollback`、`input.governance`、`input.drep-registration`、`input.drep-update`、`input.drep-retirement`があります。 |
| `event_time` | `DateTime64(9, 'UTC')` | イベントのUTC時刻です。ナノ秒精度で保存します。 |
| `event_json` | `String` | イベント全体のJSONです。 |

テーブルは`MergeTree`として作成し、`event_time`の月でパーティションを分けます。並び順は分析用であり、チェーンの再生順を全体として保証しません。

## バッチ処理と保存動作

- 出力は、100件に達した時点、または1秒が経過した時点のいずれか早い方でフラッシュします。
- 1回のフラッシュで1つの`INSERT`を実行します。出力はHTTPステータスとレスポンス本文を確認し、ClickHouseがクエリ処理後に本文で返すエラーも検出します。エラーがない場合、出力はバッチ全体の完了を確認します。個々のイベントの完了は個別に確認しません。
- 出力は`async_insert=0`と`wait_end_of_query=1`を指定し、ClickHouse側の非同期挿入設定に関係なく、HTTPの成功が挿入完了を示すようにします。
- Adderの停止時には、受け付け済みのイベントを処理し、10秒の期限内に残りのバッチを1回フラッシュします。
- バッチに失敗すると、出力はエラーをログに記録し、空きがある場合はエラー通知を送信して、失敗したバッチを破棄します。そのバッチをローカルに保持せず、永続キューも使用しません。同じバッチの再送で重複行が発生し得るため、失敗したバッチを自動再試行しません。
- ClickHouseが受け付ける`DateTime64(9)`の範囲を外れる`event_time`を持つイベントは、バッチに追加する前に拒否します。出力はイベントごとにそのエラーを報告し、同じバッチ内の有効な行を破棄しません。

## 重複とロールバック

正常に挿入した行はすべて保持します。同じイベントのJSONから生成した同じ`event_hash`を持つ行も保持します。出力は`deduplicate_insert=disable`と`insert_deduplicate=0`を指定してClickHouseの挿入重複排除を無効にするため、同一ブロックをロールバック後に再適用すると、別の発生として保存します。出力は`event_hash`を一意キーとして使用しません。

ロールバックは通常の`input.rollback`行として保存し、以前に保存した行を削除しません。

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
