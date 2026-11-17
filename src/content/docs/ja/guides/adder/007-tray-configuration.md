---
title: "Adder Trayの設定リファレンス"
description: "Adder Trayの監視対象、通知設定、通知レート制限を設定する方法。"
---

このリファレンスでは、Adder Trayが保存する監視対象フィルターとデスクトップ通知の設定を説明します。Trayは構造化されたフィルターに監視対象を保存し、監視対象と通知レートを一つの設定として管理します。

## 設定ファイル

Trayの設定は`adder-tray.yaml`に保存されます。監視対象は`filter`配下に記述し、通知レートは設定ファイルのトップレベルに記述します。

```yaml
filter:
  monitor_everything: false
  wallets:
    - addr1...
  dreps:
    - drep1...
  pools:
    - pool1...
  assets:
    - asset1...
  policies:
    - 0123456789abcdef0123456789abcdef0123456789abcdef01234567
  drep_match: any
  pool_match: any
  asset_match: any
  policy_match: any
notify_rate_limit: 1
notify_rate_window: 5s
```

### `filter`のキー

次のキーは、Trayで設定する監視対象を表します。

| キー | 対応するUIラベル | 内容 |
| --- | --- | --- |
| `filter.monitor_everything` | `Monitor Everything (ignore per-target lists)` | `true`の場合、個別の対象リストを無視して、サポートされるすべての対象を監視します。個別のリストとは併用しません。 |
| `filter.wallets` | `Wallets` | 監視するCardanoウォレットアドレスのリストです。 |
| `filter.dreps` | `DReps` | 監視するDRep IDのリストです。 |
| `filter.pools` | `Pools` | 監視するプールIDのリストです。 |
| `filter.assets` | `Assets` | 監視するアセットフィンガープリントのリストです。 |
| `filter.policies` | `Policies` | 監視するポリシーIDのリストです。 |
| `filter.drep_match` | DRepsの一致方法 | DRepグループと直前の対象グループを`any`または`all`で結合します。 |
| `filter.pool_match` | Poolsの一致方法 | Poolグループと直前の対象グループを`any`または`all`で結合します。 |
| `filter.asset_match` | Assetsの一致方法 | Assetグループと直前の対象グループを`any`または`all`で結合します。 |
| `filter.policy_match` | Policiesの一致方法 | Policyグループと直前の対象グループを`any`または`all`で結合します。 |

同じ対象グループ内の値はOR条件で評価します。`any`は対象グループ間をORで結合し、`all`はANDで結合します。対象グループが1つだけの場合、対応する`*_match`キーは結果に影響しません。

`Wallets`、`DReps`、`Pools`、`Assets`、`Policies`のいずれかを使う場合は、`filter.monitor_everything`を`false`にします。個別の対象を指定しない場合は、`Monitor Everything (ignore per-target lists)`を有効にするか、`filter.monitor_everything`を`true`にします。

## ウィザードで監視対象を設定する

1. Adder Trayの設定ウィザードで`Monitoring Targets`を開きます。
2. すべての対象を監視する場合は、`Monitor Everything (ignore per-target lists)`を選択します。この選択をすると、個別の対象リストを設定できなくなります。
3. 対象を限定する場合は、`Monitor Everything (ignore per-target lists)`を解除し、`Wallets`、`DReps`、`Pools`、`Assets`、`Policies`の対象を入力します。
4. 複数の対象グループを使う場合は、各グループの一致方法に`any`または`all`を指定します。
5. 設定を保存してウィザードを完了します。

Trayは入力値を対象の種類に応じて検証します。`Wallets`にはCardanoアドレス、`DReps`には`drep1...`形式または16進数のDRep ID、`Pools`には`pool1...`形式または16進数のPool ID、`Assets`には`asset1...`形式のCIP-14アセットフィンガープリント、`Policies`には56文字の16進数ポリシーIDを指定します。

## 旧設定からの移行

新しい設定では、通知対象の一致をTrayの`filter`設定で管理します。新規ユーザーは、エンジン設定の`filter.cardano`キーではなく、Tray設定の次の構造化されたキーを使用してください。

- `filter.monitor_everything`
- `filter.wallets`
- `filter.dreps`
- `filter.pools`
- `filter.assets`
- `filter.policies`
- `filter.drep_match`
- `filter.pool_match`
- `filter.asset_match`
- `filter.policy_match`

既存の設定を読み込むと、Trayの構造化されたフィルターが空の場合に限り、旧エンジン設定の`filter.cardano.address`、`filter.cardano.drep`、`filter.cardano.pool`、`filter.cardano.asset`、`filter.cardano.policy`の値を対応するリストへ移行します。移行時はカンマ区切りの値を分割し、各値の前後の空白と空の項目を除去します。

Trayが設定を適用すると、対象リストをエンジン設定へ書き戻しません。旧来の`filter.cardano`の対象キーを手動で変更しても、Trayの通知対象の一致には反映されません。対象を変更する場合は、Trayのウィザードまたは`adder-tray.yaml`の`filter`設定を変更します。

## 通知の設定

`Notifications`の設定では、監視対象に対応する通知の種類を選択します。Trayは選択した対象の種類に基づいて、表示する通知項目を決定します。Trayは接続状態の通知をチェーンイベントのレート制限とは別に処理します。

### 通知レート制限

通知レート制限は、短時間に発生するイベントをまとめて表示するための設定です。設定ファイルでは次のキーを使用します。

| キー | 内容 |
| --- | --- |
| `notify_rate_limit` | `notify_rate_window`内で即時に送信する通知の上限です。 |
| `notify_rate_window` | 通知数を数える時間枠です。`Go duration`形式で指定します。 |

`notify_rate_limit`または`notify_rate_window`を省略するか、値を`0`にすると、既定値の1件の通知を5秒間隔で使用します。`notify_rate_limit`に正の値を指定すると、時間枠内の上限を超えた一致を1件のバッチ通知にまとめ、時間枠の終了時に送信します。`notify_rate_limit`に負の値を指定すると、まとめ処理を無効にし、各一致をすぐに通知します。

## Advancedのレート設定

ウィザードの`Advanced — Rate Limiting`を開くと、レート制限を変更できます。

- `Max notifications per window`には整数を入力します。
- `Window duration (e.g. 5s, 30s, 1m)`には正の`Go duration`を入力します。入力例は`5s`、`30s`、`1m`です。
- どちらかの入力欄を空にすると、その項目は既定値に戻ります。
- 上限に負の整数を入力すると、通知のまとめ処理を無効にします。

不正な整数や`Go duration`を入力すると、ウィザードは設定を適用せず、入力エラーを表示します。時間枠には0以下の値を指定できません。

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>