---
title: "ClickHouse出力"
description: "AdderのClickHouse出力における設定とイベント保存動作を説明します。"
---

# ClickHouse出力

## 概要

`clickhouse`出力は、選択したイベントをHTTP経由の`JSONEachRow`バッチとして、指定したClickHouseデータベースの`adder_events_v1`に保存します。この出力は、起動時に`MergeTree`テーブルを作成し、`event_time`の月単位でパーティションを分けます。

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
- `event-types`には、`blocks`、`transactions`、`rollbacks`、`governance`、`drep-registration`、`drep-update`、`drep-retirement`のいずれかを少なくとも1つ指定します。未対応の値や空のリストは拒否されます。

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
- 1回のフラッシュで1つの`INSERT`を実行します。HTTP処理が正常に完了した時点でバッチ全体を成功として扱い、個々の後続クエリ単位では確認しません。
- 出力は`async_insert=0`を指定し、ClickHouse側の非同期挿入設定に関係なく、HTTPの成功が挿入完了を示すようにします。
- Adderの停止時には、受け付け済みの入力バッファを排出し、10秒の期限内に残りのバッチを1回フラッシュします。
- バッチに失敗すると、出力はエラーをログに記録し、空きがある場合はエラーチャネルに送信します。そのバッチをローカルに保持せず、永続キューも使用しません。曖昧な失敗を自動再試行しないため、同じバッチの再送による重複行を防ぎます。
- `event_time`が`DateTime64(9)`で受け付けられる範囲を外れるイベントは、バッチに追加する前に拒否します。出力はそのエラーを報告し、同じバッチ内の有効な行を破棄しません。

## 重複とロールバック

正常に挿入した行はすべて保持します。同じイベントのJSONから生成した同じ`event_hash`を持つ行も保持します。出力はClickHouseの挿入重複排除を無効にするため、同一ブロックをロールバック後に再適用すると、別の発生として保存します。

ロールバックは通常の`input.rollback`行として保存し、以前に保存した行を削除しません。