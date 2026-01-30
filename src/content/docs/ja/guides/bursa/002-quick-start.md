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

**ステップ1-C** - バイナリファイルをダウンロードして希望の場所に移動するか、または...

![bursa-blinklabs-site-download](/bursa-blinklabs-site-download.png)

<br>

Blinklabsからパスをコピーし、以下のコマンドを実行してバイナリファイルをダウンロードします。

<br>

ダウンロードするバージョンに応じてリンクパスを調整してください。

> ヒント: 最新のBursaリリースは<a href="https://github.com/blinklabs-io/bursa/releases" target="_blank">https://github.com/blinklabs-io/bursa/releases</a>ページからダウンロードできます。

```
wget -O - https://github.com/blinklabs-io/bursa/releases/download/v0.11.1/bursa-v0.11.1-linux-amd64 > bursa
```

***

<br>



## ステップ2 - 権限の変更

<br>

この例では、バイナリファイルを`bursa`と名付けました。ファイルを実行可能にするには、以下のコマンドを実行します:

<br>

必要に応じてファイルパスとファイル名を調整してください。

```
chmod +x bursa
```

***

<br>



## ステップ3 - API用にポート8080のファイアウォールを開く

<br>

APIのためにファイアウォールが開いていることを確認してください。この例ではポート8080を使用しました。ポート8080を開くには以下のコマンドを実行します:

```
sudo ufw allow 8080/tcp
```

***

<br>

### おめでとうございます！Bursaを使用する準備が整いました！

これでコマンドラインを使用してCardanoウォレットを作成し、ウォレット管理に必要なすべてのファイルを出力できます。また、APIを起動してAPI Swaggerドキュメントにアクセスすることもできます。

## コマンドラインでウォレットを作成しファイルを出力

コマンドラインを使用してウォレットを作成し、Cardanoウォレット管理に必要なすべてのファイルを出力できます。

この例では、`--output`フラグを使用して出力先ディレクトリを指定し、`dev`フォルダにウォレットファイルを作成します。

```
./bursa wallet create --output dev
```

![bursa-wallet-create-with-output-string](/bursa-wallet-create-with-output-string.png)

これで`dev`ディレクトリにすべてのウォレットファイルが作成されます。

![bursa-wallet-files](/bursa-wallet-files.png)

## コマンドラインでAPIを起動

APIを使用したい場合は、以下のコマンドを実行してコマンドラインから起動できます。

```
./bursa api
```

![bursa-start-api](/bursa-start-api.png)

## API Swaggerドキュメントにアクセス

IP:port/swagger/index.htmlにアクセスしてBursa APIを確認できます。必要に応じてIPとポートを調整してください。

```
http://localhost:8080/swagger/index.html
```

![bursa-swagger](/bursa-swagger.png)
