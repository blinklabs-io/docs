---
title: "Adderの更新チェックとインストール"
description: "Adderトレイアプリで更新を確認し、各プラットフォームにインストールする方法。"
---

# Adderの更新チェックとインストール

## 概要

Adderトレイアプリは、手動または週間スケジュールで新しいリリースを確認します。macOSとWindowsでは、使用環境に一致するインストーラを確認してからインストールを開始します。LinuxとFreeBSDでは、リリースページから手動で更新します。

## 手動で更新を確認する

1. システムトレイのAdderメニューを開き、`Check for Updates...`を選択します。
2. `Software Update`ウィンドウで最新リリースを確認します。
3. Adderが最新の場合、`Software Update`ウィンドウは`You're up to date!`を表示します。`OK`を選択してウィンドウを閉じます。
4. 更新がある場合、ウィンドウはリリース情報と詳細へのリンクを表示します。`Details`でリリースの詳細を開き、`Recent version history`で最近のバージョン履歴を開きます。

## 週間更新チェック

`Check for updates weekly`は、セットアップウィザードの`Software Updates`セクションと`Software Update`ウィンドウで設定します。設定を有効にすると、Adderは定期的に最新リリースを確認します。最後の確認から1週間以内には、Adderは同じ週間チェックを繰り返しません。

- 有効にすると、Adderは自動で更新を確認し、更新が見つかると`Software Update`ウィンドウを開きます。
- 無効にすると、Adderは自動の週間チェックを実行しません。手動の`Check for Updates...`は引き続き使用できます。
- Adderは、更新ウィンドウで切り替えた`Check for updates weekly`の変更を即時保存します。

## 更新状態の保存

Adderは、トレイ設定ファイル`adder-tray.yaml`に更新確認の状態を保存します。

- `skipped_version`は、`Skip This Version`でスキップしたリリースのバージョンを保存します。週間チェックでは、Adderは同じバージョンを再度通知しません。手動で`Check for Updates...`を選択すると、そのバージョンを再確認できます。
- `check_updates_weekly`は、`Check for updates weekly`のオンまたはオフを保存します。
- `last_update_check`は、最後に成功した週間更新チェックの日時を保存します。Adderはこの日時から1週間が経過するまで、次の週間チェックを待ちます。

設定を再適用しても、Adderは`skipped_version`と`last_update_check`を保持します。

## macOSとWindowsで更新する

macOSでは`.pkg`、Windowsでは`.msi`のインストーラを使用します。Adderは、実行中の環境に一致するリリースに添付されたインストーラだけを選択します。

1. `Software Update`ウィンドウで更新を確認し、`Install and Relaunch`を選択します。
2. Adderが一致するインストーラをダウンロードし、リリースに登録されたSHA-256ダイジェストで内容を検証します。
3. 検証に成功すると、Adderがインストーラを起動します。続いて`Quit & Install`を選択すると、Adderが終了してインストールを完了し、再起動します。
4. ダウンロードまたはインストーラの起動を取り消す場合は、`Cancel`を選択します。

一致するインストーラがリリースにない場合、Adderは別の環境向けのインストーラに置き換えません。`Open Release Page`を選択してリリースページを開き、対応する配布物を確認します。

選択したインストーラに有効なSHA-256ダイジェストがない場合、またはダウンロードした内容のダイジェストが一致しない場合、Adderはインストールを停止し、インストーラを起動しません。

## LinuxとFreeBSDで更新する

AdderはLinuxとFreeBSDで自動インストールを実行しません。

1. `Software Update`ウィンドウで更新を確認します。
2. `Open Release Page`を選択してリリースページを開きます。
3. 使用環境に対応する配布物をリリースページからダウンロードし、手動でインストールします。

Adderは`Install and Relaunch`を表示せず、リリースページにある配布物の選択やインストールを代行しません。

---
<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>