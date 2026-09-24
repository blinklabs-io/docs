---
title: Windowsでの使用
description: WindowsでAdderを使用する方法。
---

# WindowsでAdderを使用する

このガイドでは、WindowsでAdderを使用する方法を説明します。以下のセクションでは、Adderの使用例を示します。これらはAdderの機能に慣れるためのサンプルであることを覚えておいてください。Adderの真の力は、あなたの想像力によって解き放たれます。

> このガイドでは、<a href="https://blinklabs.io/projects-open-source" target="_blank">blinklabs.io</a>からAdder exeをダウンロード済みであることを前提としています。exeをダウンロードしていない場合は、[クイックスタート](../002-quick-start-overview)を参照してください

## Adder Trayで監視対象と通知を設定

システムトレイのAdderを右クリックし、`Configure`を選択してセットアップウィザードを開きます。

### 監視対象を選択

次のいずれかの監視モードを選択します。

- `Monitor Everything`を有効にすると、対応するすべてのイベントを監視し、各 target section の値を無視します。
- `Monitor Everything`を無効にする場合は、`Wallets`、`DReps`、`Pools`、`Assets`、または `Policies`の対応するセクションに、少なくとも1つの有効な値を入力します。

各セクションには、次の形式の値を入力します。

- `Wallets`: Cardanoの支払いアドレスまたはステークアドレス（`addr1...`または`stake1...`）。
- `DReps`: bech32形式のDRep ID（`drep1...`）または16進数のDRep ID。
- `Pools`: bech32形式のPool ID（`pool1...`）または16進数のPool ID。
- `Assets`: CIP-14 asset fingerprint（`asset1...`）。
- `Policies`: 56文字の16進数のpolicy ID。

Adderは、同じ target section に入力した値を代替条件として扱います。入力済みの target section の間に表示される `OR` と `AND` で、セクション間の条件を選択します。どちらかのセクションに一致すればよい場合は `OR` を選択します。

異なるイベント種別のセクションを `AND` で結合することはできません。`Pools`はブロック、`Wallets`・`Assets`・`Policies`はトランザクション、`DReps`はガバナンスイベントに一致します。異なるイベント種別を結合する `AND` 条件は1つのイベントでは成立しないため、ウィザードが設定を拒否します。その場合は `OR` を選択するか、対象を1つ削除します。

詳細は[Tray設定リファレンス](../007-tray-configuration-reference)を参照してください。

### 通知カテゴリを選択

Notificationsステップには、ウィザードが設定した target section に関連する通知カテゴリだけを表示します。表示されたカテゴリから通知するイベントを選択します。複数の target section を設定した場合は、ウィザードが該当するカテゴリをまとめて表示します。

- `Wallets`: `Incoming transactions`、`Outgoing transactions`、`Token transfers`
- `DReps`: `New governance proposals`、`Votes cast`、`Registration changes`
- `Pools`: `Blocks minted`、`Pool parameter changes`、`Chain rollbacks`
- `Assets`: `Asset activity`
- `Policies`: `Policy activity`

`Notify on connection issues`はイベントカテゴリとは別に選択します。接続状態の通知が必要な場合に有効にします。

通知の頻度を変更するには、`Advanced — Rate Limiting`を開きます。`Max notifications per window`にウィンドウごとの最大通知数を入力し、`Window duration`に`5s`、`30s`、`1m`などの期間を入力します。両方を空欄にすると、デフォルトの1通知/5秒を使用します。最大通知数に負の値を入力すると、通知のまとめ処理を無効にします。

## ステップ1 - Windowsでコマンドプロンプトを開く

Adder exeファイルをダウンロードしたので、コマンドラインプロンプトを開く必要があります。ここで後ほど、追跡したいイベントについてAdderにフィルターとコマンドを入力します。



コマンドプロンプトを開くには、Windowsのスタートメニューに移動します

![adder-windows-start-menu](/adder-windows-start-menu.webp)



次に、検索ボックスに`cmd`と入力し、`開く`をクリックします

![adder-windows-search-cmd](/adder-windows-search-cmd.webp)

## ステップ2 - Adder exeのパスを取得

次に、コマンドラインで実行できるように、ダウンロードしたAdder exeファイルのパスを取得する必要があります。

この例では、Adder exeをデスクトップにダウンロードしたので、Adder exeを右クリックしてパスをコピーできます。

パスをメモしてください。今後必要になります

![adder-exe-path](/adder-exe-path.png)

## ステップ3 - コマンドプロンプトでAdderを実行

Adder exeのパスが取得できたので、パスを入力するか、前のステップでコピーした場合は貼り付けます。

![adder-cmd-paste-path](/adder-cmd-paste-path.png)

### おめでとうございます！

これで、特定の情報を追跡し、通知方法を選択するために、フィルターとコマンドを使用してAdderを実行する準備ができました。

<br />


> ヒント：`-h`または`--help`フラグを使用すると、利用可能なすべてのコマンドのリストを取得できます。

<br />


これで、Adderの有用性とパワーについて、いくつかの[例](../examples/001-using-adder-examples-desc)を見ていく準備ができました！
