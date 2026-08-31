---
title: notify-json 通知リファレンス
description: Adder のヘッドレス通知出力、JSON 設定、検証コマンドのリファレンス。
---

# notify-json 通知リファレンス

## 概要

このページでは、Adder が GUI なしで対象を認識した通知を JSON Lines（NDJSON）として標準出力へ出力する方法を説明します。`notify-json` は `schemaVersion` 1 の JSON 設定を読み込み、接続状態と通知リクエストを 1 行に 1 オブジェクトずつ出力します。

## 前提条件

- `chainsync` 入力で Cardano ノードへ接続できること
- 通知設定を JSON ファイルとして保存していること
- `notify-json` の出力を読み取るプロセスが標準出力を処理できること

## 通知コマンドと設定検証

### `notify-json` の起動

`--output` に `notify-json` を指定し、`--output-notify-json-config` に設定ファイルのパスを指定します。

```sh
adder \
  --input chainsync \
  --input-chainsync-network mainnet \
  --output notify-json \
  --output-notify-json-config ./notifications.json
```

`--output-notify-json-config` には空でないパスが必要です。`notify-json` は `chainsync` 入力だけをサポートします。設定ファイルの内容、入力ネットワーク、カスタムノードのアドレスが起動条件を満たさない場合、Adder はパイプラインを開始しません。

### 設定の検証

次のコマンドは設定を検証し、人間が読む形式で結果を表示します。

```sh
adder notifications validate --config ./notifications.json
```

検証に成功すると、次の 1 行を表示します。

```text
notification configuration is valid
```

検証に失敗すると、エラーごとに `field: message` 形式の行を表示し、コマンドは失敗します。`--config` は必須です。パスが存在しない場合、JSON が壊れている場合、未知のフィールドを含む場合、複数の JSON 値を含む場合、または設定値が制約に違反する場合、検証は失敗します。

自動処理には `--json` を指定します。

```sh
adder notifications validate --config ./notifications.json --json
```

機械可読の結果は次の形式です。

```json
{
  "schemaVersion": 1,
  "valid": true
}
```

無効な設定では `valid` が `false` になり、`errors` 配列を追加します。各要素は `field` と `message` を持ちます。

```json
{
  "schemaVersion": 1,
  "valid": false,
  "errors": [
    {
      "field": "monitor",
      "message": "configure at least one target or enable everything"
    }
  ]
}
```

JSON 結果の `schemaVersion` は検証結果の形式を示し、常に `1` です。検証に失敗した場合、JSON 結果を出力してからコマンドも失敗します。

## バージョン付き JSON 設定スキーマ

設定ファイルは 1 つの JSON オブジェクトで構成します。トップレベルには `schemaVersion`、`network`、`monitor`、`alerts`、`rateLimit`、`connectionStaleSeconds` を指定します。

### トップレベルフィールド

| フィールド | 型 | 必須条件 | 説明 |
| --- | --- | --- | --- |
| `schemaVersion` | 整数 | `1` | 設定スキーマのバージョン。現在は `1` だけを受け付けます。 |
| `network` | オブジェクト | 必須 | Cardano ネットワークと任意のカスタムノードを指定します。 |
| `monitor` | オブジェクト | 必須 | 通知対象、またはすべての対象を監視する設定を指定します。 |
| `alerts` | オブジェクト | 必須 | 通知カテゴリごとの有効化状態を指定します。少なくとも 1 つを `true` にします。 |
| `rateLimit` | オブジェクト | 必須 | 通知のレート制限を指定します。 |
| `connectionStaleSeconds` | 整数 | 必須 | チェーンイベントが届かない状態を `stale` と判定するまでの秒数を指定します。`30` 以上 `3600` 以下にします。 |

### `network`

| フィールド | 型 | 必須条件 | 説明 |
| --- | --- | --- | --- |
| `name` | 文字列 | 必須 | `mainnet`、`preprod`、`preview` のいずれかを指定します。 |
| `customAddress` | 文字列 | 任意 | カスタムノードのホスト名または IP アドレスを指定します。`customPort` と組み合わせます。 |
| `customPort` | 整数 | 任意 | カスタムノードのポートを `1` から `65535` の範囲で指定します。`customAddress` を指定した場合に必要です。`customAddress` なしで指定することはできません。 |

`customAddress` と `customPort` を省略すると、Adder は `name` に対応する通常のネットワーク接続を使用します。カスタムノードを指定する場合、両方のフィールドを指定してください。

### `monitor`

| フィールド | 型 | 必須条件 | 説明 |
| --- | --- | --- | --- |
| `everything` | 真偽値 | `true` または対象配列のいずれかが必要 | `true` の場合、指定した対象配列を使わず、すべての対象を監視します。 |
| `wallets` | 文字列配列 | 任意 | 監視するウォレットのアドレスを指定します。各値は `addr` または `stake` で始めます。 |
| `dreps` | 文字列配列 | 任意 | 監視する DRep ID を指定します。各値は `drep1` で始まる値、または 16 進数のバイト列にします。 |
| `pools` | 文字列配列 | 任意 | 監視するステークプール ID を指定します。各値は `pool1` で始まる値、または 16 進数のバイト列にします。 |
| `assets` | 文字列配列 | 任意 | 監視するアセットフィンガープリントを指定します。各値は `asset1` で始めます。 |
| `policies` | 文字列配列 | 任意 | 監視するミンティングポリシー ID を指定します。各値は 56 文字の 16 進数文字列にします。 |
| `drepMatch` | 文字列 | 任意 | `dreps` グループと、その前にある対象グループの結合方法を `any` または `all` で指定します。 |
| `poolMatch` | 文字列 | 任意 | `pools` グループと、その前にある対象グループの結合方法を `any` または `all` で指定します。 |
| `assetMatch` | 文字列 | 任意 | `assets` グループと、その前にある対象グループの結合方法を `any` または `all` で指定します。 |
| `policyMatch` | 文字列 | 任意 | `policies` グループと、その前にある対象グループの結合方法を `any` または `all` で指定します。 |

`any` は対象グループを OR で結合し、`all` は AND で結合します。各グループ内の値は OR で判定します。`drepMatch`、`poolMatch`、`assetMatch`、`policyMatch` を省略するか空文字列にすると、通常の判定では `any` として扱います。`everything` が `false` の場合、少なくとも 1 つの対象配列に値を入れてください。

同じ対象を同じ配列に複数回指定できません。検証では対象文字列の前後の空白を取り除いたうえで、大文字と小文字を区別せず重複を判定します。空の対象値や形式が合わない対象値も無効です。

### `alerts`

`alerts` のキーには次のカテゴリだけを指定できます。値が `true` のカテゴリが通知を有効にします。未知のキーは無効です。

| キー | 通知対象 |
| --- | --- |
| `incomingTransactions` | 監視対象に関係する受信トランザクション |
| `outgoingTransactions` | 監視対象に関係する送信トランザクション |
| `tokenTransfers` | トークン転送 |
| `blocksMinted` | 新しく生成されたブロック |
| `chainRollbacks` | チェーンのロールバック |
| `poolParameterChanges` | ステークプールパラメーターの変更 |
| `governanceProposals` | ガバナンス提案 |
| `votesCast` | 投票 |
| `registrationChanges` | 登録情報の変更 |
| `assetActivity` | 監視対象アセットに関係する活動 |
| `policyActivity` | 監視対象ポリシー ID に関係する活動 |
| `connectionIssues` | 接続状態の問題 |

`chainRollbacks` は `blocksMinted` とは独立した設定です。`blocksMinted` を `false` にしてもロールバック通知は無効になりません。ロールバック通知を無効にするには、`chainRollbacks` を明示的に `false` にしてください。

### `rateLimit`

| フィールド | 型 | 制約 | 説明 |
| --- | --- | --- | --- |
| `max` | 整数 | `-1` または `0` 以上 | 時間枠内に許可する通知数を指定します。`-1` はレート制限を無効にします。 |
| `windowSeconds` | 整数 | `1` 以上 | `max` を適用する時間枠を秒単位で指定します。 |

### 設定例

次の設定は、すべての対象配列とすべての通知カテゴリを明示し、カスタムノードと各種マッチモードを使用します。

```json
{
  "schemaVersion": 1,
  "network": {
    "name": "mainnet",
    "customAddress": "node.example.com",
    "customPort": 3001
  },
  "monitor": {
    "everything": false,
    "wallets": [
      "addr_example"
    ],
    "dreps": [
      "drep1example"
    ],
    "pools": [
      "pool1example"
    ],
    "assets": [
      "asset1example"
    ],
    "policies": [
      "0123456789abcdef0123456789abcdef0123456789abcdef01234567"
    ],
    "drepMatch": "any",
    "poolMatch": "all",
    "assetMatch": "any",
    "policyMatch": "all"
  },
  "alerts": {
    "incomingTransactions": true,
    "outgoingTransactions": true,
    "tokenTransfers": true,
    "blocksMinted": true,
    "chainRollbacks": true,
    "poolParameterChanges": true,
    "governanceProposals": true,
    "votesCast": true,
    "registrationChanges": true,
    "assetActivity": true,
    "policyActivity": true,
    "connectionIssues": true
  },
  "rateLimit": {
    "max": 10,
    "windowSeconds": 60
  },
  "connectionStaleSeconds": 120
}
```

この例に対応する起動コマンドは次のとおりです。

```sh
adder \
  --input chainsync \
  --input-chainsync-network mainnet \
  --input-chainsync-address node.example.com:3001 \
  --output notify-json \
  --output-notify-json-config ./notifications.json
```

## JSON の読み込みと正規化

Adder は JSON を厳密に読み込みます。トップレベルとネストしたオブジェクトの未知のフィールドを拒否し、1 つ目の JSON オブジェクトの後に別の JSON 値が続く場合も拒否します。

読み込み時に次の文字列の前後の空白を取り除きます。

- `network.name`
- `network.customAddress`
- `monitor.wallets`
- `monitor.dreps`
- `monitor.pools`
- `monitor.assets`
- `monitor.policies`
- `monitor.drepMatch`
- `monitor.poolMatch`
- `monitor.assetMatch`
- `monitor.policyMatch`

正規化後の値に対して、ネットワーク名、対象形式、マッチモード、アラートキー、レート制限、接続の停止時間を検証します。正規化しても未知のキーや余分な JSON 値は有効になりません。

## NDJSON 出力

`notify-json` は JSON 配列を作らず、標準出力に JSON オブジェクトを 1 行ずつ書き込みます。すべてのレコードに `schemaVersion: 1` と `kind` が含まれます。`timestamp` は UTC の RFC 3339 形式です。

### 接続状態レコード

接続状態レコードは次のフィールドを持ちます。

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `schemaVersion` | 整数 | `1` 固定です。 |
| `kind` | 文字列 | `status` 固定です。 |
| `status` | 文字列 | `starting`、`connected`、`stale` のいずれかです。 |
| `timestamp` | 文字列 | レコードを生成した時刻を UTC で示します。 |
| `message` | 文字列 | 状態の詳細を示します。 |

Adder は設定を読み込んで出力を開始すると、次の `starting` レコードを出力します。

```json
{"schemaVersion":1,"kind":"status","status":"starting","timestamp":"2026-01-01T00:00:00Z","message":"waiting for the first chain event"}
```

最初のチェーンイベントを受け取ると、次の `connected` レコードを出力します。`message` のネットワーク名には設定の `network.name` を使います。

```json
{"schemaVersion":1,"kind":"status","status":"connected","timestamp":"2026-01-01T00:00:10Z","message":"receiving chain events from mainnet"}
```

`connectionStaleSeconds` の時間内にチェーンイベントを受け取らない場合、Adder は `stale` レコードを出力します。最初のイベントをまだ受け取っていない場合のメッセージは `no chain events received before startup timeout` です。いったん接続した後のメッセージは `no chain events received recently` です。

```json
{"schemaVersion":1,"kind":"status","status":"stale","timestamp":"2026-01-01T00:02:10Z","message":"no chain events received recently"}
```

Adder はチェーンイベントを受け取るたびに停止判定タイマーをリセットします。`stale` の後にイベントを受け取ると、再び `connected` レコードを出力してからイベントを通知ルールへ渡します。最初のイベントは必ず `connected` 状態を発生させ、最初のイベントより前に `stale` が発生した場合も同じ動作をします。

### 通知レコード

対象とアラートカテゴリに一致した通知は、次のフィールドを持つレコードとして出力します。

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `schemaVersion` | 整数 | `1` 固定です。 |
| `kind` | 文字列 | `notification` 固定です。 |
| `timestamp` | 文字列 | 通知レコードを生成した時刻を UTC で示します。 |
| `ruleId` | 文字列 | 一致した通知ルールの識別子です。 |
| `eventType` | 文字列 | 通知を発生させたイベント種別です。値がない場合、このフィールドを省略します。 |
| `title` | 文字列 | 通知のタイトルです。ルールにタイトルがない場合は `Adder` になります。 |
| `body` | 文字列 | 通知本文です。 |
| `batched` | 真偽値 | 通知が複数イベントをまとめたものかどうかを示します。 |
| `count` | 整数 | 通知に含まれるイベント数です。 |

通知レコードの形は次のとおりです。各値は実際に一致したルールとイベントの内容に応じて変わります。

```json
{
  "schemaVersion": 1,
  "kind": "notification",
  "timestamp": "2026-01-01T00:00:11Z",
  "ruleId": "<matched-rule-id>",
  "eventType": "input.transaction",
  "title": "<notification-title>",
  "body": "<notification-body>",
  "batched": false,
  "count": 1
}
```

`notify-json` は対象を認識する通知ルールとレート制限を使用します。チェーンイベントは通知ルールで評価する前に、安定した JSON のフィールド名と配列・マップの形式へ正規化します。

## 起動時の整合性検証

`--output notify-json` を選択すると、Adder はパイプラインを起動する前に次の条件を検証します。

1. `--input` が `chainsync` であること。`mempool` など別の入力は拒否します。
2. `--output-notify-json-config` が空でないこと。
3. 設定ファイルが存在し、JSON として正しく、`schemaVersion` 1 とすべての設定制約を満たすこと。
4. 設定の `network.name` と `--input-chainsync-network` が一致すること。
5. `network.customAddress` を設定した場合、設定の `customAddress:customPort` と `--input-chainsync-address` が一致すること。

カスタムノードの比較では、ホスト名を小文字に変換し、IP アドレスを標準表記にし、ポートを数値として正規化します。したがって、表記が異なっていても正規化後の同じ `host:port` は一致します。`customAddress` を設定していない場合、Adder は入力アドレスのカスタムノード比較を行いません。

いずれかの条件に違反すると、Adder はエラーを返して起動を拒否します。これにより、通知ルールが別のネットワークや別のチェーン同期ノードに対して実行されることを防ぎます。