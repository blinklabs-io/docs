---
title: "Windowsでの使用"
description: "WindowsでAdderを使用する方法。"
---

Adderは、システムトレイで動作するパッケージ化されたデスクトップアプリケーションで、Cardanoブロックチェーンアクティビティを監視するための合理化されたユーザーフレンドリーなエクスペリエンスを提供します。

<a id="install-and-configure"></a>

## インストールと構成

<a id="step-11---download-the-adder-installer"></a>

### ステップ1.1 - Adderインストーラをダウンロード
Windows上でAdderをインストールする最も簡単な方法は、<a href="https://blinklabs.io/projects-open-source" target="_blank">https://blinklabs.io/projects-open-source</a>で利用可能なMSIインストーラを使用することです。 <br>

<img src="/adder-windows-release-download.webp"
     alt="adder-windows-release-download"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

> お使いのシステム(Windows x64 または Windows arm64)の適切なバージョンを選択します。

***

<a id="step-12---once-the-download-is-complete-click-open-to-open-the-msi-file"></a>

### ステップ1.2 - ダウンロードが完了したら、`Open`をクリックして`.msi`ファイルを開きます。
<img src="/adder-windows-open-msi.webp"
     alt="adder-windows-open-msi"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

***

<a id="step-13---then-click-run-to-start-the-installation"></a>

### ステップ1.3 - 次に、`Run`をクリックしてインストールを開始します。
<img src="/adder-windows-run-msi.webp"
     alt="adder-windows-run-msi"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

署名済みMSIはWindows x64およびWindows arm64に対応し、`%ProgramFiles%\Adder`にCLIの`adder.exe`とトレイアプリの`adder-tray.exe`をインストールします。トレイアプリはスタートメニューから起動でき、インストール情報はWindowsの「アプリと機能」（Add/Remove Programs）に表示されます。MSIはScheduled Taskを登録しません。

***

<a id="step-2---launch-adder"></a>

### ステップ2 - Adderを起動する

<a id="step-21---open-the-windows-start-menu"></a>

### ステップ2.1 - Windowsのスタートメニューを開きます。

<img src="/adder-windows-start-menu.webp"
     alt="adder-windows-start-menu"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

***

<a id="step-22---search-for-adder"></a>

### ステップ2.2 - `Adder`の検索
Adderアプリを検索して開きます。


<img src="/adder-windows-search-adder-app.webp"
     alt="adder-windows-search-adder-app"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

> **Welcome**設定画面が表示されない場合は、システムトレイを開き、Adderアプリを右クリックし、**Configure**を選択して設定ウィザードを開きます。

Windows版のトレイアプリは、ログとパニックからの復旧情報を`%LOCALAPPDATA%/Adder/Logs/adder-tray.log`に記録します。ログオンセッションごとに起動できるトレイアプリは1つだけです。

***

<a id="step-3---configure-adder"></a>

### ステップ3 - Adderの設定
*Adder Tray App*を開くと、**Welcome**画面が表示されます。これにより、Adderを設定し、受信するアラートを設定することができます。

<img src="/adder-windows-config-welcome.webp"
     alt="adder-windows-config-welcome"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

***

<a id="step-31---select-a-cardano-network-that-you-want-to-monitor"></a>

### ステップ 3.1 - 監視する Cardano ネットワークを選択します。
`Mainnet`、`Preprod`、`Preview`、または`Dijkstra`（`DijkstraNet`）を選択し、監視するネットワークを指定します。
<img src="/adder-windows-config-network.webp"
     alt="adder-windows-config-network"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />
***

<a id="step-32---add-your-monitoring-targets"></a>

### ステップ3.2 - 監視対象を追加する
該当する対象のセクションに、1つ以上の値を入力します。

- `Watch Wallet`にはウォレットアドレスを入力します。
- `Track DRep`にはDRep IDを入力します。
- `Monitor Pool`にはプールIDを入力します。
- 必要に応じて、任意の`Follow Asset`セクションにアセットフィンガープリントを入力します。
- 必要に応じて、任意の`Follow Policy`セクションにポリシーIDを入力します。

<img src="/adder-windows-config-pool-id-drep-id.webp"
     alt="adder-windows-config-pool-id-drep-id"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

対象を個別に入力する代わりに、排他的な`Monitor Everything`モードを使って、サポートされるすべての種類の対象を監視できます。このモードと対象の値を併用しないでください。

次のステップに進みます。Adderは、ここで入力した対象の種類、または`Monitor Everything`モードに基づいて通知の選択肢を決定します。

<img src="/adder-windows-config-or.webp"
     alt="adder-windows-config-or"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

***

<a id="step-33---notification-output-optional"></a>

### ステップ3.3 - 通知出力(オプション)
Adderは、デスクトップ通知を提供するように既に設定されています。選択した場合には、他の通知方法を選択できます。
<img src="/adder-windows-config-output.webp"
     alt="adder-windows-config-output"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

***

**`Next Step`**をクリック

***

<a id="step-34---event-alerts"></a>

### ステップ3.4 - イベントアラート
デスクトップアラートを受信したいイベントのチェックボックスを選択します。
`Chain rollbacks`チェックボックスを使用すると、`Blocks minted`とは独立してチェーンのロールバック通知を設定できます。ロールバック通知を有効にするには、`Chain rollbacks`を選択します。
<img src="/adder-windows-config-events.webp"
     alt="adder-windows-config-events"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

***

<a id="step-35---send-a-test-notification"></a>

### ステップ3.5 - テスト通知を送信する

`Test Notification`をクリックし、デスクトップアラートを受信していることを確認します。
<img src="/adder-windows-config-send-test.webp"
     alt="adder-windows-config-send-test"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

通知が表示された場合は、`Yes, I saw it`をクリックします。

***

<a id="step-36---finish-setup"></a>

### ステップ3.6 - セットアップの完了
`Finish Setup` をクリックします。

### 起動設定
`Start Adder automatically on login / reboot`を選択すると、ログインまたは再起動時にAdderを自動的に起動します。`Background Activity:`で始まるステータス表示は、Adderのバックグラウンドアクティビティの登録状態と実行状態を示します。

`Open Login Items Settings...`をクリックすると、Windowsのスタートアップアプリ設定が開きます。

***

<a id="congratulations-adder-will-now-alert-you-when-an-event-that-you-have-selected-to-track-occurs"></a>

### おめでとうございます!Adderは、選択したイベントが発生したときに警告します。

***

<a id="using-the-tray-menu"></a>

## トレイメニューの利用
システムトレイでAdderアプリを右クリックすると、最近のイベントの表示、設定の変更、アプリの起動や再起動などを行えます。

最近のイベントから開くエクスプローラーのリンクは、設定したネットワークを使用します。トランザクションおよびガバナンスイベントにはトランザクションハッシュ、ブロックイベントにはブロックハッシュを使用します。

<img src="/adder-windows-tray-app-menu.webp"
     alt="adder-windows-tray-app-menu"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

`Notification Rules...`を選択すると、通知ルールエディターが開きます。このエディターでは、`Wallets`、`DReps`、`Pools`、`Assets`、`Policies`の監視対象を編集し、通知カテゴリを切り替えられます。`Monitor Everything`を選択すると、個別の対象リストを使わずに、サポートされるすべての対象を監視します。

プールのブロック通知はフォローしているプールに限定され、DRepのガバナンス通知はフォローしているDRepに限定されます。複数の投票を含むイベントでは、フォローしているDRepの投票内容が通知テキストに表示されます。

`Apply & Restart`をクリックすると、設定を保存し、`Adder Tray`を再起動せずに通知ルールとレート制限を更新します。対象を削除するには確認が必要です。再接続の警告が表示された場合も、Adderはエディターを開いたまま入力を再び有効にします。設定を修正して再試行できます。

`About`を選択すると、アプリ内のAboutダイアログが開きます。コミットメタデータを利用できる場合は`Version: <version> (commit: <hash>)`を表示し、利用できない場合はバージョンだけを表示します。


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
