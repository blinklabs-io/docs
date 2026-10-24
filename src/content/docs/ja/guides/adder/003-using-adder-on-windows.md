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

> お使いのシステム(Windows x64 または Windows アーム64)の適切なバージョンを選択します。

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

>設定 *Welcome**画面が見つからない場合は、システムトレイを開き、Adderアプリを右クリックし、**Configure**を選択して設定ウィザードを開きます。

***

<a id="step-3---configure-adder"></a>

### ステップ3 - Adderの設定
*Adderトレイアプリを開くと、**Welcome**画面が表示されます。これにより、Adderを設定し、受信するアラートを設定することができます。

<img src="/adder-windows-config-welcome.webp"
     alt="adder-windows-config-welcome"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

***

<a id="step-31---select-a-cardano-network-that-you-want-to-monitor"></a>

### ステップ 3.1 - 監視する Cardano ネットワークを選択します。
<img src="/adder-windows-config-network.webp"
     alt="adder-windows-config-network"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />
***

<a id="step-32---add-your-monitoring-targets"></a>

### ステップ3.2 - あなたの監視ターゲットを追加する
監視したい情報を入力してください。例えば、ウォレットアドレス、ポリシーID、アセット指紋、プールID、および/またはDRep ID。

この例では、フォローしたいプールIDとDREP IDを入力します。

<img src="/adder-windows-config-pool-id-drep-id.webp"
     alt="adder-windows-config-pool-id-drep-id"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

プールまたはDRepのいずれかがあなたが追跡するために選択したイベントを実行する場合は、`OR`を選択します。

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

***

<a id="congratulations-adder-will-now-alert-you-when-an-event-that-you-have-selected-to-track-occurs"></a>

### おめでとうございます!Adderは、選択したイベントが発生したときに警告します。

***

<a id="using-the-tray-menu"></a>

## トレイメニューの利用
最近のイベントを表示したい場合は、設定を調整したり、アプリを起動したり、アプリを再起動したり、必要に応じて、システムトレイでAdderアプリを右クリックして設定を調整することができます。

<img src="/adder-windows-tray-app-menu.webp"
     alt="adder-windows-tray-app-menu"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
