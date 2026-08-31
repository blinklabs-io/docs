---
title: Windowsでの使用
description: WindowsでAdderを使用する方法。
---

# WindowsでAdderを使用する

このガイドでは、WindowsでAdderを使用する方法を説明します。以下のセクションでは、Adderの使用例を示します。これらはAdderの機能に慣れるためのサンプルであることを覚えておいてください。Adderの真の力は、あなたの想像力によって解き放たれます。

> このガイドでは、<a href="https://blinklabs.io/projects-open-source" target="_blank">blinklabs.io</a>からAdder exeをダウンロード済みであることを前提としています。exeをダウンロードしていない場合は、[クイックスタート](../002-quick-start-overview)を参照してください

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

## Adder Trayの監視と通知を設定する

Adder Trayのウィザードでは、監視対象を次のグループに分けて登録できます。各グループには複数の値を追加できます。

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

<br />


> ヒント：`-h`または`--help`フラグを使用すると、利用可能なすべてのコマンドのリストを取得できます。

<br />


これで、Adderの有用性とパワーについて、いくつかの[例](../examples/001-using-adder-examples-desc)を見ていく準備ができました！
