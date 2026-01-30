---
title: クイックスタートガイド
description: Bluefinクイックスタート概要。
---

# Bluefin

Bluefinは、Goで書かれたスタンドアロンのFortuna（TUNA）マイナーです。チェーンを同期し、TUNAをマイニングし、他のインフラストラクチャなしでリモートノードにトランザクションを送信します。

Bluefinは自己完結型で、外部依存関係なしで実行できます。<a href="https://github.com/blinklabs-io/bluefin/pkgs/container/bluefin" target="_blank">Dockerイメージ</a>または<a href="https://github.com/blinklabs-io/bluefin/releases" target="_blank">リリースページ</a>のバイナリで実行できます。

<br>

このガイドでは、Bluefinバイナリのダウンロードと実行方法を説明します。開始するには、以下の手順に従ってください。

<br>

⚠️ このガイドは一般的なLinux環境を想定しています。必要に応じてコマンドやパスを調整してください。

***

<br>

## ステップ1 - Blinklabsからバイナリをダウンロード
<br>

**ステップ1-A** - まず<a href="https://blinklabs.io/projects-open-source" target="_blank">https://blinklabs.io/projects-open-source</a>にアクセスし、Bluefinまでスクロールします。

![bluefin-blinklabs-site](/bluefin-blinklabs-site.png)
<br>


**ステップ1-B** - Bluefinを実行するオペレーティングシステムを選択します。

![bluefin-blinklabs-site-operating-system](/bluefin-blinklabs-site-operating-system.png)
<br>

**ステップ1-C** - バイナリファイルをダウンロードして好みの場所に移動するか、または...

![bluefin-blinklabs-site-download](/bluefin-blinklabs-site-download.png)

<br>

Blinklabsからパスをコピーし、以下のコマンドを実行してバイナリファイルをダウンロードします。

<br>

⚠️ ダウンロードしたいバージョンに合わせてリンクパスを調整してください。

> 💡 ヒント: 最新のBluefinリリースは<a href="https://github.com/blinklabs-io/bluefin/releases" target="_blank">https://github.com/blinklabs-io/bluefin/releases</a>ページからダウンロードできます。

```
wget -O - https://github.com/blinklabs-io/bluefin/releases/download/v0.13.5/bluefin-v0.13.5-linux-amd64 > bluefin
```

***

<br>

## ステップ2 - 権限の変更

<br>

この例では、バイナリファイルを`bluefin`という名前にしています。ファイルを実行可能にするには、以下のコマンドを実行します:

<br>

⚠️ 必要に応じてファイルパスとファイル名を調整してください。

```
chmod +x bluefin
```

***

<br>

## ステップ3 - Bluefinの実行

<br>

> 📝 Bluefinは環境変数から設定を取得するように設計されています。以下のすべての例はシェルから直接bluefinバイナリを実行することを示しており、Dockerで使用する場合は適宜調整が必要です。
>
> 設定なしで実行すると、bluefinはデフォルトでメインネット上のTUNA v1をマイニングします。新しいウォレットを生成し、シードフレーズを現在のディレクトリのseed.txtファイルに書き込みます。

```
./bluefin
...
{"level":"info","timestamp":"2024-07-04T20:13:53-05:00","caller":"wallet/wallet.go:62","msg":"wrote generated mnemonic to seed.txt"}
{"level":"info","timestamp":"2024-07-04T20:13:53-05:00","caller":"bluefin/main.go:73","msg":"loaded mnemonic for address: addr1..."}
{"level":"info","timestamp":"2024-07-04T20:13:53-05:00","caller":"bluefin/main.go:79","msg":"starting indexer on mainnet"}
```

`NETWORK`と`PROFILE`環境変数を使用して、bluefinの動作モードを変更できます。
例えば、`preview`でTUNA v2をマイニングするには:

```
NETWORK=preview PROFILE=tuna-v2 ./bluefin
```

独自のウォレットシードフレーズを提供したい場合は、`MNEMONIC`環境変数を設定するか、bluefinを実行する前に`seed.txt`ファイルを作成できます。

### ウォレットへの資金投入

bluefinに新しいウォレットを生成させる場合、起動時にログに記録されるウォレットアドレスを使用して、ウォレットに初期資金を投入する必要があります。ウォレットが既に存在する場合は、bluefinに認識されるように資金を自分のウォレットに送り返す必要があるかもしれません。ウォレットには少なくとも2つの利用可能なUTxOが必要です。1つはTX手数料をカバーするため、もう1つは担保として使用するための少なくとも5 (t)ADAです。

### トランザクションの送信

デフォルトでは、bluefinはNtN（node-to-node）TxSubmissionプロトコルを使用して、Cardanoネットワークに直接トランザクションを送信します。この方法には、トランザクションが失敗した場合にフィードバックが提供されないという欠点があります。代わりに`SUBMIT_URL`環境変数を使用して、submit APIのURLを指定することができ、トランザクション検証の問題に関するフィードバックが提供されます。

### ローカルデータのクリア

Bluefinはローカルデータを現在のディレクトリの`.bluefin/`に保存します。データのクリアが必要な問題が発生した場合は、このデータを削除すると、bluefinは最初から再同期します。
