---
title: Windowsでの使用
description: WindowsでAdderを使用する方法。
---

# WindowsでAdderを使用する

このガイドでは、WindowsでAdderを使用する方法を説明します。以下のセクションでは、Adderの使用例を示します。これらはAdderの機能に慣れるためのサンプルであることを覚えておいてください。Adderの真の力は、あなたの想像力によって解き放たれます。

> このガイドでは、署名済みリリースのWindows MSIを使用する手順を説明します。スタンドアロンの`adder.exe`を使用する手順は、MSIとは別の代替手段として後述します。

## ステップ1 - Windows用MSIを選択

1. Adderの署名済みリリースから、Windowsのプロセッサに対応するMSIをダウンロードします。x64の場合は`adder-<version>-windows-amd64.msi`、arm64の場合は`adder-<version>-windows-arm64.msi`を選択します。
2. ダウンロードしたMSIを開き、インストーラーの手順に従ってインストールします。

## ステップ2 - Adderを起動

1. Windowsのスタートメニューから`Adder`を起動します。インストーラーは、次の2つの実行ファイルを`%ProgramFiles%\Adder`に配置します。

   - `%ProgramFiles%\Adder\adder.exe`: コマンドライン版
   - `%ProgramFiles%\Adder\adder-tray.exe`: 通知領域版

2. スタートメニューの`Adder`ショートカットは`adder-tray.exe`を起動し、トレイとセットアップウィザードを開きます。

MSIはコマンドライン版を`PATH`に追加しません。コマンドライン版を直接実行する場合は、`%ProgramFiles%\Adder\adder.exe`のパスを指定します。MSIはScheduled Taskや自動起動項目も作成しません。ログオン時のトレイ自動起動は、トレイの初回セットアップがユーザー単位で設定します。

## スタンドアロン`.exe`を使う場合

MSIを使用しない場合は、ダウンロードしたスタンドアロンの`adder.exe`をコマンドプロンプトから実行できます。この手順では、MSIのインストール先ではなく、ダウンロードしたファイルのパスを使用します。

### ステップ1 - Windowsでコマンドプロンプトを開く

Windowsのスタートメニューからコマンドプロンプトを開きます。ここで、追跡するイベントのフィルターとコマンドをAdderに入力します。

![adder-windows-start-menu](/adder-windows-start-menu.webp)

検索ボックスに`cmd`と入力し、`開く`をクリックします。

![adder-windows-search-cmd](/adder-windows-search-cmd.webp)

### ステップ2 - Adder exeのパスを取得

ダウンロードした`adder.exe`を右クリックしてパスをコピーします。この例では、ファイルをデスクトップにダウンロードしています。

![adder-exe-path](/adder-exe-path.png)

### ステップ3 - コマンドプロンプトでAdderを実行

コマンドプロンプトに`adder.exe`のパスを入力するか、コピーしたパスを貼り付けて実行します。

![adder-cmd-paste-path](/adder-cmd-paste-path.png)

これで、フィルターとコマンドを使用してAdderを実行できます。

## Adder Trayの監視と通知を設定する

Adder Trayのウィザードと`Notification Rules...`エディターでは、監視対象を次のグループに分けて登録できます。各グループには複数の値を追加できます。

- `Wallets`: ウォレットアドレス
- `DReps`: DRep ID
- `Pools`: プールID
- `Assets`: アセットフィンガープリント
- `Policies`: ポリシーID

`Monitor Everything`を有効にすると、個別の対象リストを無視してすべてのイベントを監視します。この選択は個別の対象指定と排他的です。無効にする場合は、少なくとも1つの対象を登録してください。空の値、形式が正しくない値、重複する値は登録できません。

同じグループ内の値は`OR`条件で照合します。複数のグループに値を登録した場合は、グループ間の接続方法として`OR`または`AND`を選択できます。`OR`ではいずれかのグループに一致したイベントを監視し、`AND`では接続したグループの条件をすべて満たすイベントを監視します。

通知ウィザードは、選択した対象グループに応じたアラート項目を表示します。接続問題のアラートは対象グループのアラートとは別に設定します。

`Advanced — Rate Limiting`では、通知をまとめる上限と時間枠を設定できます。最大通知数には`Max notifications per window`、時間枠には`Window duration`を使用し、時間枠には`5s`、`30s`、`1m`などを指定します。空欄にした項目は、最大通知数なら既定値の1件、時間枠なら既定値の5秒を使用します。最大通知数に負の値を指定すると、通知のまとめ処理を無効にします。

WindowsでAdder Trayが使用する設定ファイルの保存先は`%APPDATA%\Adder\adder-tray.yaml`です。以前の設定でAdder Trayのフィルター設定が未設定の場合、アップグレード時に`engine.yaml`の`filter.cardano`にある旧対象キー（`address`、`drep`、`pool`、`asset`、`policy`）を対応する対象リストへ移行します。新しい設定を適用すると、`engine.yaml`からこれらの旧対象キーを削除します。

### `Notification Rules...`で通知ルールを編集する

セットアップ完了後、通知領域のAdderアイコンを右クリックし、`Notification Rules...`を選択します。

1. 画面に表示される上記5つの対象リストを編集します。各リストの項目を削除するときは、確認ダイアログで削除を確定します。
2. 監視方法に合わせて、`Monitor Everything (ignore per-target lists)`を有効または無効にします。
3. 複数の対象グループを使用する場合は、対象リストの間に表示される`OR`または`AND`コネクターを選択します。
4. `Notification Preferences`に表示される通知カテゴリのチェックボックスを選択または解除します。
5. `Apply & Restart`（適用して再起動）を選択すると、対象と通知設定を`%APPDATA%\Adder\adder-tray.yaml`に保存し、実行中の通知ルールと通知のレート制限を更新します。
6. 変更を保存せずに終了する場合は、`Cancel`（キャンセル）を選択します。未保存の編集を破棄し、現在の設定を維持します。

<br />


> ヒント：`-h`または`--help`フラグを使用すると、利用可能なすべてのコマンドのリストを取得できます。

<br />


これで、Adderの有用性とパワーについて、いくつかの[例](../examples/001-using-adder-examples-desc)を見ていく準備ができました！


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
