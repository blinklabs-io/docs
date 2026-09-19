---
title: クイックスタートガイド
description: Bursaクイックスタート概要。
---

# Bursa

Go言語で書かれたプログラマティックなCardanoウォレットで、API、CLI、ライブラリインターフェースを提供し、開発者がウォレット機能を簡単に統合できるようにします。

blinklabs.ioからBursaのCLI用のバイナリまたはアーカイブ、各プラットフォームのインストーラーをダウンロードするだけです。その後、コマンドラインまたはAPIでBursaを実行します。

プラットフォームウォレットのインストール、ソースからのビルド、トラブルシューティングは、[フルノードウォレットガイド](../012-full-node-wallet)を参照してください。

<br>

以下の手順に従って始めましょう

<br>

このガイドは一般的なLinux環境を想定しています。必要に応じてコマンドとパスを調整してください。

***

<br>

## ステップ1 - BlinklabsからCLI用のバイナリまたはアーカイブ、各プラットフォームのインストーラーをダウンロード
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

LinuxまたはFreeBSDのCLIアーカイブを使用する場合は、Blinklabsからパスをコピーし、以下のコマンドを実行してリリースアーカイブをダウンロードし、展開します。WindowsまたはmacOSのデスクトップウォレットを使用する場合は、各プラットフォームのインストーラーを使用し、アーカイブの展開や実行権限の変更は行いません。

<br>

ダウンロードするバージョンに応じてリンクパスを調整してください。

> ヒント: 最新のBursaリリースは<a href="https://github.com/blinklabs-io/bursa/releases" target="_blank">https://github.com/blinklabs-io/bursa/releases</a>ページからダウンロードできます。

```bash
wget -O bursa-v0.15.0-linux-amd64.tar.gz https://github.com/blinklabs-io/bursa/releases/download/v0.15.0/bursa-v0.15.0-linux-amd64.tar.gz
tar xzf bursa-v0.15.0-linux-amd64.tar.gz
```

LinuxとFreeBSDのCLIダウンロードにはアーキテクチャ別の`.tar.gz`アーカイブを使用し、WindowsのCLIダウンロードには`.exe`ファイル、macOSのCLIダウンロードには`.zip`ファイルを使用します。Windowsではアーキテクチャ別の署名済み`.msi`インストーラーを、macOSではアーキテクチャ別の公証済み`.pkg`インストーラーをデスクトップウォレット向けに配布します。オプションのWebView2 Evergreenブートストラッパーを含むリリースでは、WebView2ランタイムが未インストールの場合に限り、Windowsの`.msi`がブートストラッパーを含むことがあります。

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



## ステップ3 - APIの接続を設定

<br>

APIはデフォルトで`127.0.0.1:8080`で待ち受けます。ローカルクライアントはファイアウォールでポートを開かずに接続できます。リモートアクセスが必要な場合は、YAMLの`api.address`または環境変数`API_LISTEN_ADDRESS`で非ループバックアドレスを明示的に設定し、TLSとBearer認証を含むセキュリティ要件を適用してください。設定の詳細は[設定リファレンス](../009-configuration-reference)を参照してください。

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
