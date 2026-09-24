---
title: Windowsでの使用
description: WindowsでAdderを使用する方法。
---

# WindowsでAdderを使用する

このガイドでは、WindowsでAdderをインストールし、トレイアプリを設定して動作を確認する手順を説明します。

> Windows x64またはarm64向けのAdder MSIをインストール済みであることを前提とします。単体のexeを使用する場合は、[クイックスタート](../002-quick-start-overview)を参照してください。

## Windows MSIをインストール

1. Windowsのシステムに合うx64またはarm64のAdder MSIを選択します。
2. MSIを実行してインストールします。MSIはCLIの`adder.exe`とトレイアプリの`adder-tray.exe`を`%ProgramFiles%\Adder`にインストールします。
3. スタートメニューから`Adder`を選択してトレイアプリを起動します。MSIはトレイアプリのスタートメニューショートカットを作成し、`アプリの追加と削除`にもAdderを表示します。

リリース用MSIは署名されています。ローカルまたはテスト用のMSIは未署名の場合があり、WindowsがSmartScreenまたは不明な発行元の警告を表示することがあります。MSIはScheduled Taskや独立した自動起動を登録しません。ログイン時の自動起動は、トレイウィザードが現在のWindowsユーザーに対して設定します。

## Adder Trayで監視対象と通知を設定

システムトレイのAdderを右クリックし、`Configure`を選択してセットアップウィザードを開きます。

### 監視対象を選択

次のいずれかの監視モードを選択します。

- `Monitor Everything`を有効にすると、対応するすべてのイベントを監視し、各対象セクションの値を無視します。
- `Monitor Everything`を無効にする場合は、`Wallets`、`DReps`、`Pools`、`Assets`、または `Policies`の対応するセクションに、少なくとも1つの有効な値を入力します。

各セクションには、次の形式の値を入力します。

- `Wallets`: Cardanoの支払いアドレスまたはステークアドレス（`addr1...`または`stake1...`）。
- `DReps`: bech32形式のDRep ID（`drep1...`）または16進数のDRep ID。
- `Pools`: bech32形式のPool ID（`pool1...`）または16進数のPool ID。
- `Assets`: CIP-14 asset fingerprint（`asset1...`）。
- `Policies`: 56文字の16進数のpolicy ID。

Adderは、同じ対象セクションに入力した値を代替条件として扱います。入力済みの対象セクションの間に表示される `OR` と `AND` で、セクション間の条件を選択します。どちらかのセクションに一致すればよい場合は `OR` を選択します。

異なるイベント種別のセクションを `AND` で結合しないでください。`Pools`はブロック、`Wallets`・`Assets`・`Policies`はトランザクション、`DReps`はガバナンスイベントに一致します。異なるイベント種別を結合する `AND` 条件は1つのイベントでは成立しないため、ウィザードが設定を拒否します。その場合は `OR` を選択するか、対象を1つ削除します。

詳細は[Tray設定リファレンス](../007-tray-configuration-reference)を参照してください。

### 通知カテゴリを選択

Notificationsステップでは、`Monitor Everything`を有効にすると基本的なイベント通知カテゴリを表示し、個別の監視対象を設定すると対象セクションに関連する通知カテゴリを表示します。表示されたカテゴリから通知するイベントを選択します。複数の対象セクションを設定した場合は、ウィザードが該当するカテゴリをまとめて表示します。

- `Monitor Everything`: `Blocks minted`、`Chain rollbacks`、`Incoming transactions`、`Votes cast`
- `Wallets`: `Incoming transactions`、`Outgoing transactions`、`Token transfers`
- `DReps`: `New governance proposals`、`Votes cast`、`Registration changes`
- `Pools`: `Blocks minted`、`Pool parameter changes`、`Chain rollbacks`
- `Assets`: `Asset activity`
- `Policies`: `Policy activity`

`Notify on connection issues`はイベントカテゴリとは別に選択します。接続状態の通知が必要な場合に有効にします。

通知の頻度を変更するには、`Advanced — Rate Limiting`を開きます。`Max notifications per window`にウィンドウごとの最大通知数を入力し、`Window duration`に`5s`、`30s`、`1m`などの期間を入力します。両方を空欄にすると、デフォルトの1通知/5秒を使用します。最大通知数に負の値を入力すると、通知のまとめ処理を無効にします。

### 自動起動とバックグラウンド動作

Notificationsステップで`Start Adder automatically on login / reboot`を有効にすると、現在のWindowsユーザーがログインしたとき、またはWindowsを再起動したあとにAdderを自動的に起動します。自動起動を無効にするには、このチェックボックスをオフにします。Windowsはこの設定を現在のユーザーのスタートアップに登録します。管理者権限は必要ありません。トレイはAdderエンジンをウィンドウを表示せずにバックグラウンドで起動します。

`Background Activity`には、次のいずれかの状態が表示されます。

- `Background Activity: Registered & Running (io.blinklabs.adder)`: 自動起動が登録され、Adderエンジンが実行中です。
- `Background Activity: Registered (io.blinklabs.adder)`: 自動起動は登録されていますが、Adderエンジンは実行されていません。
- `Background Activity: Not registered`: 自動起動は無効です。
- `Background Activity: Status unknown`: Adderは自動起動の状態を確認できません。

`Open Login Items Settings...`を選択するとWindowsのスタートアップ設定が開き、Adderの自動起動登録を確認できます。

## Trayメニュー

システムトレイのAdderを右クリックして`About`を選択すると、アプリ内ウィンドウが開きます。このウィンドウには現在のAdderのバージョンが表示されます。コミットハッシュがある場合は`Version: <version> (commit: <hash>)`形式で表示され、ない場合は`Version: <version>`形式で表示されます。

`Notification Rules...`を選択すると、`Wallets`、`DReps`、`Pools`、`Assets`、`Policies`の監視対象と通知カテゴリを編集できます。`Apply & Restart`を選択すると設定を保存して実行中の通知エンジンを更新します。トレイアプリ自体を再起動する必要はありません。設定の形式、コネクター、通知カテゴリの詳細は[Tray設定リファレンス](../007-tray-configuration-reference)を参照してください。

`Notification Rules...`でも、重複する対象や成立しない条件は適用できません。入力を修正してからもう一度`Apply & Restart`を選択します。

`Recent Events`のイベントを選択すると、トランザクションまたはガバナンスイベントではトランザクションハッシュを使ったexplorerのトランザクションページを開き、ブロックイベントではブロックハッシュを使ったブロックページを開きます。リンク先はイベントのネットワークに対応します。

## Windowsでの診断と再試行

トレイメニューの`Show Logs`を選択するとログを確認できます。WindowsのGUIは通常のコンソールを持たないため、起動時または実行時のエラー、panic、グラフィックス初期化エラーを次のファイルに記録します。

`%LOCALAPPDATA%\Adder\Logs\adder-tray.log`

Windowsのログオンセッションごとに実行できるトレイアプリは1つだけです。2回目の起動がすぐ終了する場合は、既存のAdderトレイが実行中でないか確認します。

警告が表示されても、設定は保存されています。サービスの再起動またはAdder APIへの再接続が完了しない場合、ルールエディターは開いたまま入力を再び有効にします。状態と`adder-tray.log`を確認し、接続が復旧してから設定を再試行します。

## ステップ1 - Windowsでコマンドプロンプトを開く

Adder exeファイルをダウンロードしたので、コマンドラインプロンプトを開く必要があります。ここで後ほど、追跡したいイベントについてAdderにフィルターとコマンドを入力します。



コマンドプロンプトを開くには、Windowsのスタートメニューに移動します

![adder-windows-start-menu](/adder-windows-start-menu.webp)



次に、検索ボックスに`cmd`と入力し、`開く`をクリックします

![adder-windows-search-cmd](/adder-windows-search-cmd.webp)

## ステップ2 - Adder exeのパスを取得

次に、コマンドラインで実行できるようにAdder exeファイルのパスを取得します。MSIを使用した場合のCLIは`%ProgramFiles%\Adder\adder.exe`です。単体のAdder exeを使用する場合は、ダウンロードしたファイルのパスを取得します。

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


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
