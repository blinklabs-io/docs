---
title: クイックスタートガイド
description: Bursaクイックスタート概要。
---

# Bursa

Go言語で書かれたプログラマティックなCardanoウォレットで、API、CLI、ライブラリインターフェースを提供し、開発者がウォレット機能を簡単に統合できるようにします。

blinklabs.ioからBursaのバイナリファイルをダウンロードするだけです。その後、コマンドラインまたはAPIでBursaを実行します。

<br>

以下の手順に従って始めましょう

<br>

このガイドは一般的なLinux環境を想定しています。必要に応じてコマンドとパスを調整してください。

***

<br>

## ステップ1 - Blinklabsからバイナリをダウンロード
<br>

**ステップ1-A** - まず<a href="https://blinklabs.io/projects-open-source" target="_blank">https://blinklabs.io/projects-open-source</a>にアクセスし、Bursaまでスクロールします。



![bursa-blinklabs-site](/bursa-blinklabs-site.png)
<br>


**ステップ1-B** - Bursaを実行するオペレーティングシステムを選択します。

![bursa-blinklabs-site-operating-system](/bursa-blinklabs-site-operating-system.png)
<br>

**ステップ1-C** - LinuxまたはFreeBSDでCLIを使用する場合は、アーキテクチャに合った`.tar.gz`アーカイブをダウンロードし、希望の場所に移動するか、または...

![bursa-blinklabs-site-download](/bursa-blinklabs-site-download.png)

<br>

LinuxまたはFreeBSDのCLIアーカイブを使用する場合は、Blinklabsからパスをコピーし、以下のコマンドを実行してリリースアーカイブをダウンロードし、展開します。Windowsの`.msi`またはmacOSの`.pkg`デスクトップウォレットを使用する場合は、アーカイブを展開したり実行権限を変更したりせず、各プラットフォームのインストーラーを使用してください。

<br>

ダウンロードするバージョンに応じてリンクパスを調整してください。

> ヒント: 最新のBursaリリースは<a href="https://github.com/blinklabs-io/bursa/releases" target="_blank">https://github.com/blinklabs-io/bursa/releases</a>ページからダウンロードできます。

```bash
wget -O bursa-v0.15.0-linux-amd64.tar.gz https://github.com/blinklabs-io/bursa/releases/download/v0.15.0/bursa-v0.15.0-linux-amd64.tar.gz
tar xzf bursa-v0.15.0-linux-amd64.tar.gz
```

LinuxとFreeBSDのCLIダウンロードはアーキテクチャ別の`.tar.gz`アーカイブ、WindowsのCLIダウンロードは`.exe`ファイル、macOSのCLIダウンロードは`.zip`ファイルです。デスクトップウォレットは、Windowsではアーキテクチャ別の署名済み`.msi`インストーラー、macOSではアーキテクチャ別の公証済み`.pkg`インストーラーで配布されます。Windowsの`.msi`には、そのリリースがオプションのWebView2 Evergreenブートストラッパーを含み、WebView2ランタイムが未インストールの場合に限り、ブートストラッパーが含まれることがあります。

***

<br>



## ステップ2 - Linux/FreeBSD CLIの権限の変更

<br>

この手順はLinuxまたはFreeBSDのCLIアーカイブから展開したバイナリに適用します。この例では、バイナリファイルを`bursa`と名付けました。ファイルを実行可能にするには、以下のコマンドを実行します。Windowsの`.msi`またはmacOSの`.pkg`デスクトップウォレットには、このコマンドを実行しないでください。

<br>

必要に応じてファイルパスとファイル名を調整してください。

```bash
chmod +x bursa
```

***

<br>



## ステップ3 - API用にポート8080のファイアウォールを開く

<br>

APIのためにファイアウォールが開いていることを確認してください。この例ではポート8080を使用しました。ポート8080を開くには以下のコマンドを実行します:

```bash
sudo ufw allow 8080/tcp
```

***

<br>

### おめでとうございます！Bursaを使用する準備が整いました！

これでコマンドラインを使用してCardanoウォレットを作成し、ウォレット管理に必要なすべてのファイルを出力できます。また、APIを起動してAPI Swaggerドキュメントにアクセスすることもできます。

Bursaは、マルチシグネチャスクリプト、ハッシュ、鍵の生成にも使用できます。これにはCardanoステークプールの運用に必要な鍵や証明書も含まれます。

[コマンドラインでのBursaの使い方と実行可能な便利なコマンドについての詳細はこちら。](../003-commands)


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
