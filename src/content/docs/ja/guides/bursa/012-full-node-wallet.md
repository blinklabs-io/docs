---
title: フルノードウォレット
description: Bursaフルノードウォレットのインストール、起動、設定、ソースビルド、パッケージング、トラブルシューティング。
---

# Bursaフルノードウォレット

## 概要

このガイドでは、Bursaフルノードウォレットのリリース資産からのインストール、起動、実行時設定、ソースからのビルド、macOSパッケージの作成、運用上のトラブルシューティングを説明します。

## インストール

リリースページから、`bursa-wallet-<version>-<os>-<arch>.<ext>`形式のウォレット資産をダウンロードします。

| プラットフォーム | 資産 | 動作 |
| --- | --- | --- |
| macOS arm64（Apple Silicon） | `.pkg` | 署名と公証を済ませています。`Bursa.app`をインストールします。 |
| Windows amd64、arm64 | `.msi` | 署名を済ませています。 |
| Linux amd64、arm64 | `.tar.gz` | ネイティブウィンドウを表示します。 |
| FreeBSD amd64、arm64 | `.tar.gz` | ヘッドレスで動作します。ブラウザーでインターフェースを開きます。 |

macOSの`.pkg`とWindowsの`.msi`は、それぞれ対応するプラットフォームのインストーラーとして実行します。LinuxまたはFreeBSDの`.tar.gz`は展開して使用します。FreeBSDではネイティブウィンドウを使用できません。

## 起動

macOSまたはWindowsでは、インストール後にアプリケーション一覧から`Bursa`を起動します。バイナリから起動する場合は、次のコマンドを実行します。

```bash
bursa-wallet
```

ネイティブウィンドウを使用しないビルドは、同じインターフェースを`http://127.0.0.1:8090`で提供します。ブラウザーでこのURLを開いてください。ウォレットはループバックアドレスにだけバインドします。

初回起動ではノードの同期を開始します。既定では`mithril`を使用してスナップショットから同期します。ウォレットは同期の進行状況を表示し、同期中でも読み取り専用で開きます。

## 実行時設定

環境変数を設定してから`bursa-wallet`を起動します。

| 環境変数 | 既定値 | 動作 |
| --- | --- | --- |
| `BURSA_NETWORK` | `preview` | Cardanoネットワークを選択し、そのネットワークのデータディレクトリを選択します。 |
| `BURSA_SYNC` | `mithril` | `genesis`を指定すると、Mithrilスナップショットを使わずにチェーンを最初から再生します。 |
| `BURSA_LEAN` | `false` | `true`を指定すると、履歴チェーンデータを整理する省容量プロファイルを使用します。 |
| `BURSA_CONNECTOR` | `false` | `true`を指定すると、dAppコネクターのバックエンドを有効にします。 |

```bash
BURSA_NETWORK=preview BURSA_SYNC=mithril BURSA_LEAN=false BURSA_CONNECTOR=false bursa-wallet
```

ウォレットは`127.0.0.1:8090`でサービスを提供します。ウォレットはインターフェースで変更した設定を初回起動後に保存し、保存済みの値を以後の環境変数より優先します。`BURSA_NETWORK`は`~/.bursa-wallet/<network>/`のデータディレクトリも決定し、ウォレットはログをその配下の`logs/bursa-wallet.log`に保存します。

## ソースからのビルド

### 前提条件

- Go `1.26`以降
- Node `22`

リポジトリのルートディレクトリで次のコマンドを実行します。

### 純粋なGoのヘッドレスビルド

```bash
make wallet
```

このターゲットはWebバンドルを作成し、`ui/bursa-wallet`に既定の純粋なGoバイナリを作成します。このバイナリはループバックでインターフェースを提供し、クロスコンパイルできます。

### ネイティブウィンドウビルド

```bash
make wallet-webview
```

このターゲットはCGOと各プラットフォームのシステムWebViewを使用します。対象アーキテクチャのマシン上で、CツールチェーンとWebView開発用ヘッダーを用いてビルドしてください。クロスコンパイルには対応していません。

- macOSは`WKWebView`を使用します。
- Windowsは`WebView2`を使用します。
- Linuxでは、`webkit2gtk`の開発用ヘッダーと、`webview`タグのビルドでトレイを表示するための`libayatana-appindicator3`ランタイムが必要です。

Linuxで`webkit2gtk-4.1`だけをインストールしている場合、ビルド処理は`4.0`を要求するWebView部品向けに`pkg-config`互換設定を作成します。

### macOSパッケージ

```bash
make bundle-macos
make pkg-macos
```

`make bundle-macos`はローカルテスト用に署名した`.pkg`を作成します。`make pkg-macos`は署名と公証を済ませた`.pkg`を作成し、Appleのシークレットを必要とします。

## トラブルシューティング

### 同期が遅い、または停止したように見える

1. ウォレットの設定にある診断画面で、ノードの状態、ピア、同期状態を確認します。
2. 診断画面からログをエクスポートします。
3. 次のパスにあるログを直接確認します。

```text
~/.bursa-wallet/<network>/logs/bursa-wallet.log
```

### Linuxでウィンドウが空白になる

`make wallet-webview`で作成したビルドでは、空白のウィンドウを防ぐために`webkit2gtk`が必要です。Linuxでは、`libayatana-appindicator3`も実行時に必要です。`webkit2gtk`をインストールできない場合は、`make wallet`で純粋なGoのビルドを作成し、ブラウザーで`http://127.0.0.1:8090`を開いてください。

### ディスク使用量が大きい

初回起動時に`BURSA_LEAN=true`を設定して、履歴チェーンデータを整理する省容量プロファイルを選択します。既存のウォレットでは、設定で省容量ストレージを有効にします。

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>