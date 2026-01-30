---
title: Docker Desktopを使ったクイックスタート
description: Docker Desktopを使用したcardano-upの使い方。
---

# WindowsでDocker Desktopを使用したcardano-up

cardano-upはCardanoサービスを管理するためのコマンドラインユーティリティです。cardano-upを使用すると、Dockerイメージを利用してCardanoサービスをインストールできます。

このガイドでは、Docker Desktopのダウンロード方法、Ubuntu WSLの実行方法、およびWindowsでcardano-upバイナリをダウンロードする方法について説明します。

以下の手順に従って開始してください。

## ステップ1 - Docker Desktopのダウンロード

まず、<a href="https://www.docker.com/products/docker-desktop/" target="_blank">https://www.docker.com/products/docker-desktop/</a>にアクセスし、`Download Docker Desktop`までスクロールしてください。

![cardano-up-docker-desktop-website](/cardano-up-docker-desktop-website.png)

***

## ステップ2 - オペレーティングシステムの選択

この例では、Windows - AMD64を選択しました。お使いのオペレーティングシステムを選択してください。

![cardano-up-docker-desktop-website-operating-system](/cardano-up-docker-desktop-website-operating-system.png)

画面の指示に従ってください。

![cardano-up-docker-desktop-install](/cardano-up-docker-desktop-install.png)

> ヒント: Docker Desktopは、Dockerが実行されるWindows Subsystem for Linuxをインストールします。
>
> ![cardano-up-subsystem-install](/cardano-up-subsystem-install.png)

***

## ステップ3 - 管理者としてPowerShellを開く

検索バーに`powershell`と入力し、「管理者として実行」を選択します。

![cardano-up-open-powershell-admin](/cardano-up-open-powershell-admin.png)

> ヒント: PowerShellで以下のコマンドを実行して、Docker Desktopが実行されていることを確認できます。
>
> ```
> wsl -l -v
> ```
>
> ![cardano-up-verify-wsl-docker-desktop](/cardano-up-verify-wsl-docker-desktop.png)

***

## ステップ4 - WSLにUbuntuをインストール

WSLにUbuntuをインストールするには、PowerShellで以下のコマンドを実行します:

```
wsl --install -d Ubuntu
```

![cardano-up-install-ubuntu-wsl](/cardano-up-install-ubuntu-wsl.png)

***

<a name="step-5"></a>

## ステップ5 - WSLを起動してセットアップを完了

Ubuntuがインストールされたら、PowerShellで以下のコマンドを実行して、ユーザー名とパスワードを作成してセットアップを完了します。まず、以下を実行してUbuntu WSLを起動します:

```
wsl.exe -d Ubuntu
```

![cardano-up-finish-install-ubuntu-wsl-exe](/cardano-up-finish-install-ubuntu-wsl-exe.png)


ユーザー名とパスワードを入力してください。パスワードは2回入力する必要があります。

![cardano-up-finish-install-ubuntu-username](/cardano-up-finish-install-ubuntu-username.png)

ユーザー名とパスワードを追加すると、「Welcome to Ubuntu...」というメッセージが表示されます。`exit`と入力してPowerShellを終了できます。

![cardano-up-install-ubuntu-wsl-successful](/cardano-up-install-ubuntu-wsl-successful.png)

***

## ステップ6 - Docker DesktopでUbuntuを有効化

Docker DesktopでUbuntuを有効にするには、Docker Desktopに戻り、設定を選択します。

![cardano-up-docker-desktop-settings](/cardano-up-docker-desktop-settings.png)

設定画面で、左側の`Resources`タブを選択します。

![cardano-up-docker-desktop-resources](/cardano-up-docker-desktop-resources.png)

Resourcesタブの下で`WSL integration`を選択します。

![cardano-up-docker-desktop-wsl-integration](/cardano-up-docker-desktop-wsl-intergration.png)

WSL integrationの下で`Ubuntu`を選択し、`Apply & restart`をクリックします。

![cardano-up-docker-desktop-apply-ubuntu](/cardano-up-docker-desktop-apply-ubuntu.png)

***

## ステップ7 - Ubuntuアプリを起動

検索バーに`ubuntu`と入力し、Ubuntuアプリを選択して開くをクリックします。

![cardano-up-launch-ubuntu-app](/cardano-up-launch-ubuntu-app.png)

> ヒント: `docker`を実行することで、Dockerが利用可能かどうかを確認できます。利用可能なすべてのDockerコマンドのリストが表示されます。
>
> ![cardano-up-check-docker-available-tip](/cardano-up-check-docker-available-tip.png)

***

## ステップ8 - cardano-upバイナリのダウンロード

注意: ダウンロードリンクを最新バージョンに調整してください。

> ヒント: 最新のcardano-upリリースは<a href="https://github.com/blinklabs-io/cardano-up/releases" target="_blank">https://github.com/blinklabs-io/cardano-up/releases</a>ページからダウンロードできます。

以下のコマンドを実行してcardano-upバイナリをダウンロードします:

```
wget -O - https://github.com/blinklabs-io/cardano-up/releases/download/v0.14.2/cardano-up-v0.14.2-linux-amd64 > cardano-up
```

![cardano-up-download-cardano-up](/cardano-up-download-cardano-up.png)

***

## ステップ9 - 権限の変更

この例では、バイナリファイルを`cardano-up`という名前にしました。ファイルを実行可能にするには、以下のコマンドを実行します:

```
chmod +x cardano-up
```

![cardano-up-change-permissions](/cardano-up-change-permissions.png)

***

## ステップ10 - cardano-upの移動

この例では、cardano-upバイナリを`/usr/local/bin`に配置します。cardano-upバイナリを移動するには、以下を実行します:

```
sudo mv cardano-up /usr/local/bin/cardano-up
```

![cardano-up-move-binary](/cardano-up-move-binary.png)

[ステップ5](#step-5)で作成したパスワードを入力する必要があります。

![cardano-up-move-binary-password](/cardano-up-move-binary-password.png)

> ヒント: `which cardano-up`を実行して、cardano-upバイナリの場所を確認できます。
>
> ![cardano-up-verify-binary-path](/cardano-up-verify-binary-path.png)

***

### おめでとうございます!

これでcardano-upを使用する準備が整いました。[cardano-upの使い方](../003-using-cardano-up)を確認して、必要なCardanoサービスのDockerイメージをインストールするcardano-upの使いやすさとパワーを体験してください。
