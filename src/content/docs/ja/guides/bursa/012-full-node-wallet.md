---
title: フルノードウォレット
description: Bursa フルノードウォレットのインストール、設定、ビルド、問題解決を説明します。
---

<a id="bursa-full-node-wallet"></a>

# Bursa フルノードウォレット

このガイドは、Bursa フルノードウォレットのインストール、起動モード、実行時設定、ソースからのビルド、macOS パッケージ作成、運用時の問題解決を扱います。

<a id="install"></a>

## インストール

[Bursa リリースページ](https://github.com/blinklabs-io/bursa/releases)から、対象プラットフォームのウォレットをダウンロードします。リリースファイルの名前は次の形式です。

```text
bursa-wallet-<version>-<os>-<arch>.<ext>
```

| プラットフォーム | ファイル | インストールの動作 |
| --- | --- | --- |
| macOS arm64 (Apple Silicon) | `.pkg` | Apple の署名と公証が付いたインストーラーが `Bursa.app` をインストールします。 |
| Windows amd64 または arm64 | `.msi` | Windows の署名付きインストーラーです。 |
| Linux amd64 または arm64 | `.tar.gz` | アーカイブを展開し、ネイティブウィンドウ版を実行します。 |
| FreeBSD amd64 または arm64 | `.tar.gz` | アーカイブを展開し、ヘッドレス版をブラウザーで使用します。ネイティブウィンドウ版は提供されません。 |

Linux または FreeBSD では、展開して同梱の `bursa-wallet` を実行します。

```bash
tar xzf bursa-wallet-<version>-<os>-<arch>.tar.gz
./bursa-wallet
```

<a id="run-the-wallet"></a>

## ウォレットの実行

macOS または Windows パッケージをインストール後、アプリケーションメニューから `Bursa` を起動するか、実行ファイルを直接実行します。

```bash
bursa-wallet
```

デスクトップ版はネイティブウィンドウを開きます。ヘッドレス版は <http://127.0.0.1:8090> にインターフェイスを提供するので、ブラウザーで開いてください。ウォレットはループバックの `127.0.0.1:8090` にバインドします。

初回起動時に組み込みノードを同期します。既定の `mithril` モードは、ジェネシスからチェーンを再実行せず、Mithril スナップショットからブートストラップします。データは `~/.bursa-wallet/<network>/` に保存します。

<a id="configuration"></a>

## 設定

初期設定に使用する環境変数は、初回起動前に設定します。

| 変数 | 既定値 | 動作 |
| --- | --- | --- |
| `BURSA_NETWORK` | `preview` | Cardano ネットワークとそのデータディレクトリを選択します。 |
| `BURSA_SYNC` | `mithril` | `genesis` を指定すると、Mithril スナップショットではなくチェーンの起点から再実行します。 |
| `BURSA_LEAN` | `false` | 過去のチェーンデータを削除してディスク使用量を減らす lean ストレージを有効にします。 |
| `BURSA_CONNECTOR` | `false` | dApp コネクターバックエンドを有効にします。 |

初回実行後、インターフェイスで設定した値は永続化されます。保存された設定値は、環境変数より優先されます。

<a id="build-from-source"></a>

## ソースからのビルド

Go `1.26` 以降と Node `22` をインストールし、リポジトリのルートでビルドコマンドを実行します。

<a id="build-the-headless-wallet"></a>

### ヘッドレスウォレットのビルド

Web バンドルと既定の pure-Go バイナリをビルドします。

```bash
make wallet
```

出力先は `ui/bursa-wallet` です。このビルドはループバック上でインターフェイスを提供し、クロスコンパイルに対応します。

<a id="build-the-native-window-wallet"></a>

### ネイティブウィンドウ版のビルド

ネイティブウィンドウ版をビルドします。

```bash
make wallet-webview
```

CGO、C ツールチェーン、対象プラットフォームの webview 開発ヘッダーが必要です。

- macOS: `WKWebView`
- Windows: `WebView2`
- Linux: ビルド用の `webkit2gtk` 開発ヘッダーと、実行時用の `libayatana-appindicator3`。`webview` タグ付きビルドでトレイを使用するには両方が必要です。

webview 版は異なるアーキテクチャへのコンパイルに対応しません。対象のアーキテクチャを持つマシンでビルドします。Linux では `webkit2gtk-4.1` を使用できます。上流のバインディングが `4.0` を要求する場合、Makefile が `pkg-config` シムを提供します。

<a id="package-for-macos"></a>

### macOS パッケージの作成

ローカルテスト用パッケージを作成します。

```bash
make bundle-macos
```

このターゲットはアドホック署名の `.pkg` を作成します。署名と公証を行うリリースパッケージは次で作成します。

```bash
make pkg-macos
```

`pkg-macos` には Apple の署名および公証用の秘密情報が必要です。

<a id="troubleshooting"></a>

## トラブルシューティング

<a id="synchronization-is-slow-or-appears-stuck"></a>

### 同期が遅い、または停止しているように見える

1. **Settings → Diagnostics** を開き、ノードの状態、ピアの状態、同期状況を確認します。
2. 診断ログをエクスポートするか、`~/.bursa-wallet/<network>/logs/bursa-wallet.log` を直接確認します。

<a id="the-linux-webview-window-is-blank"></a>

### Linux の webview ウィンドウが空白になる

webview 版には `webkit2gtk` と開発ヘッダーをインストールします。別途、`webview` タグ付きビルドを実行する前に、実行時用の `libayatana-appindicator3` もインストールします。webview のないシステムでは、pure-Go ブラウザー版を使用してループバックアドレスを開いてください。

<a id="the-wallet-uses-too-much-disk-space"></a>

### ディスク使用量が大きい

初回実行時に lean ストレージを有効にします。

```bash
BURSA_LEAN=true bursa-wallet
```

lean ストレージは過去のチェーンデータを期限切れにして、ディスク使用量を減らします。


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
