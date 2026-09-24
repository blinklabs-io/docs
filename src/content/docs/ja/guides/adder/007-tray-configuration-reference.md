---
title: Adder トレイ設定リファレンス
description: Adder のトレイで監視対象と通知ルールを編集する方法。
---

このリファレンスでは、`adder-tray.yaml` の Adder Tray 設定について説明します。Tray は `filter` セクションを使用して通知ターゲットを照合します。エンジン設定は Tray のターゲットリストを提供しません。

## 通知ルールエディターを開く

初回設定では、`Configure` からセットアップウィザードを開き、監視対象と通知カテゴリを設定します。セットアップ完了後、または後から設定を変更する場合は、Windows のシステムトレイで Adder を右クリックし、`Notification Rules...` を選択します。

`Notification Rules` エディターでは、`Wallets`、`DReps`、`Pools`、`Assets`、`Policies` の対象リストと通知カテゴリを同じ画面で編集できます。初回設定と後続編集では同じ対象形式とマッチング規則を使用します。

## 設定ファイルの場所

Adder Tray は、プラットフォームに応じた次のパスに `adder-tray.yaml` を保存します。

| プラットフォーム | 設定パス |
| --- | --- |
| macOS | `$HOME/Library/Application Support/Adder/adder-tray.yaml` |
| Windows | `%APPDATA%\Adder\adder-tray.yaml`、または `APPDATA` が設定されていない場合は `%USERPROFILE%\AppData\Roaming\Adder\adder-tray.yaml` |
| Linux | `$XDG_CONFIG_HOME/adder/adder-tray.yaml`、または `XDG_CONFIG_HOME` が設定されていない場合は `$HOME/.config/adder/adder-tray.yaml` |

`ADDER_TRAY_CONFIG_DIR` を設定すると、`adder-tray.yaml` を保存するディレクトリを変更できます。上書き値には、置き換えるファイル名ではなくディレクトリを指定します。

## 自動起動設定

`adder-tray.yaml` の `auto_start` は、Adderをログイン時または再起動時に自動起動するかどうかを指定します。

```yaml
auto_start: true
```

- `true`: Adderの自動起動を有効にします。
- `false`: Adderの自動起動を無効にします。

セットアップウィザードで `Start Adder automatically on login / reboot` を選択すると `auto_start` を有効にし、チェックを外すと無効にします。ウィザードはこの設定を `adder-tray.yaml` に保存します。

`adder-tray.yaml` はAdder Trayが使用する設定ファイルです。Adderエンジンの設定ファイルとは別に保存します。

## セットアップウィザードの起動状態

セットアップウィザードは、バックグラウンド活動の登録と実行状態を次のいずれかで表示します。

| 表示 | 意味 |
| --- | --- |
| `Background Activity: Registered & Running (io.blinklabs.adder)` | 起動登録があり、Adderが実行中です。 |
| `Background Activity: Registered (io.blinklabs.adder)` | 起動登録はありますが、Adderは実行されていません。 |
| `Background Activity: Not registered` | 起動登録がありません。 |
| `Background Activity: Status unknown` | 状態を確認できませんでした。 |

## プラットフォームごとの自動起動

### Windows

`auto_start` を有効にすると、Adder Trayを現在のユーザーのスタートアップに登録します。ログオン時にトレイが起動し、Adderエンジンをウィンドウなしで起動します。無効にすると、この自動起動登録を使用しません。

### macOS

`auto_start` を有効にすると、Adderはユーザーの `LaunchAgent` に起動時の設定を登録し、macOSの `Login Items` に追加します。これにより、ログイン時にAdderのバックグラウンド処理とメニューバーのトレイを起動します。

無効にすると、`LaunchAgent` の自動起動を無効にし、`Login Items` からAdderを削除します。

## ターゲットフィルター

次の例では、明示的なターゲット配列を使用します。

```yaml
filter:
  monitor_everything: false
  wallets:
    - addr1...
    - stake1...
  dreps:
    - drep1...
    - deadbeef
  pools:
    - pool1...
    - 0123456789abcdef
  assets:
    - asset1...
  policies:
    - aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
  drep_match: any
  pool_match: all
  asset_match: any
  policy_match: any
```

`filter.monitor_everything` を `true` に設定すると、サポートされているすべてのイベント種別を監視します。この設定はすべてのターゲット配列を無視します。選択したターゲットだけを照合する場合は `false` に設定し、その場合は `wallets`、`dreps`、`pools`、`assets`、`policies` のいずれかに少なくとも1つのターゲットを指定します。

ターゲット配列には、次の値を使用します。

- `wallets`: `addr...` または `stake...` で始まる Cardano の支払い用アドレスまたはステークアドレス。
- `dreps`: `drep1...` で始まる bech32 形式の DRep ID、または16進数の DRep ID。
- `pools`: `pool1...` で始まる bech32 形式のプール ID、または16進数のプール ID。
- `assets`: `asset1...` で始まる CIP-14 の asset fingerprint。
- `policies`: 56文字の16進数の policy ID。

エディターの入力欄にカンマ区切りで複数の値を入力すると、Adder は各値を別の対象として追加します。各値の前後の空白を削除し、空の要素を無視します。不正な値が1つでも含まれる場合はインラインエラーを表示し、その入力から対象を追加しません。

同じグループ内の重複は、大文字と小文字を区別せず拒否します。既存の対象との重複だけでなく、同じ入力欄にまとめて入力した値同士の重複も対象です。追加済みの行を削除する場合は、削除ボタンを選択し、確認ダイアログで削除を確定します。

### マッチモード

`drep_match`、`pool_match`、`asset_match`、`policy_match` には `any` または `all` を設定します。マッチフィールドを省略すると `any` として解決されます。

各ターゲット配列は、その配列内のいずれか1つの値に一致します。マッチフィールドは、値が指定されたターゲットグループを、直前に値が指定されたグループへ結合します。

- `any` はグループを `OR` で結合します。
- `all` はグループを `AND` で結合します。

たとえば、次のフィルターは、選択したウォレットイベントまたは選択した DRep イベントに一致します。

```yaml
filter:
  wallets: [addr1...]
  dreps: [drep1...]
  drep_match: any
```

`drep_match` を `all` に変更すると、イベントはウォレットグループと DRep グループの両方に一致する必要があります。各グループ内では引き続き `OR` を使用するため、両方のグループに複数の値がある場合、式は `(wallet 1 OR wallet 2) AND (DRep 1 OR DRep 2)` になります。最初に値が指定されたグループには直前のグループがないため、そのマッチフィールドは効果を持ちません。Adder Tray は `wallet_match` フィールドをサポートしません。

`Notification Rules` エディターでは、値が入力されたグループの間に `AND` または `OR` コネクターを表示します。同じグループの値は常に `OR` で結合されます。`OR` はいずれかのグループへの一致を、`AND` は結合したグループの条件を同じイベントに要求します。

`Pools` はブロック、`Wallets`・`Assets`・`Policies` はトランザクション、`DReps` はガバナンスのイベント種別に対応します。異なるイベント種別を `AND` で結び、どのイベントも満たせない式を作ると、エディターは適用前の検証で設定を拒否します。`OR` を選択するか、対象グループのいずれかを削除してください。

## 通知設定

`notify_prefs` は、サポートされている各アラートカテゴリを `true` または `false` に対応付けます。次の YAML マップキーをそのまま使用します。

```yaml
notify_prefs:
  "Incoming transactions": true
  "Outgoing transactions": true
  "Token transfers": true
  "Blocks minted": true
  "Chain rollbacks": true
  "Pool parameter changes": true
  "New governance proposals": true
  "Votes cast": true
  "Registration changes": true
  "Asset activity": true
  "Policy activity": true
  "Connection issues": true
```

`Notification Rules` エディターの各チェックボックスは、設定済みの対象に対する対応する通知ルールを有効または無効にします。通知カテゴリと現在の対象範囲は次のとおりです。

- `Incoming transactions`、`Outgoing transactions`、`Token transfers`: 追跡したウォレットに関係するトランザクション。
- `Blocks minted`: 追跡したプールがブロックの発行者である場合のブロック通知。
- `Chain rollbacks`: チェーンのロールバック通知。
- `New governance proposals`: 特定の DRep に限定されない一般的なガバナンス提案通知。
- `Votes cast`、`Registration changes`: 追跡した DRep に関係するガバナンス通知。
- `Asset activity`: 追跡した asset fingerprint に関係するトランザクション。
- `Policy activity`: 追跡した policy ID に関係するトランザクション。
- `Connection issues`: 対象イベントとは別の接続状態通知。必要な場合は別に有効化します。

追跡していない DRep やプールの活動は、追跡対象に対する通知になりません。`Monitor Everything (ignore per-target lists)` を有効にすると対象リストを無視し、対象に依存しないイベント通知を使用します。

UI に `Pool parameter changes` が表示される場合でも、Adder は現在プールパラメーター変更イベントを生成しません。このチェックボックスを有効にしても、プールパラメーター変更の通知は生成されません。

## 通知の集約

`notify_rate_limit` は、`notify_rate_window` の期間中に発生する通知の最大数を設定します。上限を超えた一致イベントは、期間の終了時に1件へまとめられます。

- 両方のフィールドを省略するか、いずれかのフィールドを `0` に設定すると、5秒ごとに1件の通知を使用します。
- `notify_rate_limit` に負の数を設定すると集約を無効にし、一致したイベントごとに即時通知を発生させます。
- `notify_rate_window` には、`5s`、`30s`、`1m` などの正の期間文字列を設定します。
- セットアップウィザードは同じ期間形式を受け付け、0以下の期間を拒否します。

例:

```yaml
notify_rate_limit: 1
notify_rate_window: 5s
```

## 適用とキャンセル

`Apply & Restart` を選択すると、Adder は監視対象、通知カテゴリ、通知レート制限を保存し、保存したルールとレート制限を実行中の監視エンジンに適用します。監視エンジンの再接続または再起動を試みますが、トレイプロセス自体の再起動は必要ありません。各入力値は追加時に検証し、適用前にはマッチング式全体を検証します。

`Cancel` を選択すると、エディターを開いてから行った未保存の変更を破棄します。保存済みの設定と実行中の監視エンジンは変更しません。

## 適用時の警告

設定の保存後に、Adder バイナリの検出、サービスの再起動、または Adder API への再接続で問題が発生する場合があります。この場合も設定は保存された状態になり、Adder は警告を表示します。`Notification Rules` エディターは開いたまま入力を再び有効にするため、問題を確認した後に `Apply & Restart` を再試行できます。

## Recent Events のリンク

トレイメニューの `Recent Events` からイベントを選択すると、イベントのネットワークを使用した explorer ページを開きます。トランザクションとガバナンスのイベントは transaction explorer を、ブロックのイベントは block explorer を開きます。

## トラブルシューティング

### 成立しない条件のエラー

成立しない式のエラーが表示された場合は、該当する `AND` を確認します。異なるイベント種別を同じイベントに要求する場合は `OR` に変更するか、対象グループのいずれかを削除します。

### 適用後の警告

設定が保存されていることを前提に、警告に示されたバイナリ、サービス、または API の問題を確認します。入力は再び有効になっているため、問題を解消した後に `Apply & Restart` を再試行できます。

## 従来のフィルター設定からの移行

以前の設定では、エンジン設定の `plugins.filter.cardano` に Tray のターゲット値を保存していました。アップグレード時に、新しい Tray の `filter` に `monitor_everything` の設定もターゲット値もない場合に限り、Adder Tray はその値をインポートします。カンマ区切りの値は、対応するターゲット配列の項目になります。

### 移行前

```yaml
plugins:
  filter:
    cardano:
      address: addr1...,stake1...
      drep: drep1...,deadbeef
      pool: pool1...,0123456789abcdef
      asset: asset1...
      policy: aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
```

### 移行後

Adder Tray は、インポートしたターゲットを `adder-tray.yaml` に保存します。

```yaml
filter:
  monitor_everything: false
  wallets:
    - addr1...
    - stake1...
  dreps:
    - drep1...
    - deadbeef
  pools:
    - pool1...
    - 0123456789abcdef
  assets:
    - asset1...
  policies:
    - aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
```

Adder Tray が新しい設定を保存すると、エンジン設定から従来の `address`、`drep`、`pool`、`asset`、`policy` キーを削除します。その後に従来のエンジン値を手動で編集しても、Tray の通知照合は変わりません。

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
