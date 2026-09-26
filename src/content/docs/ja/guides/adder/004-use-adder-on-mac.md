---
title: Macでの使用
description: MacでAdderを使用する方法。
---

# MacでAdderを使う

Adder は、対応する Mac のアーキテクチャごとに、署名済みでノータライズ済みの macOS `.pkg` パッケージとして配布されます。

## Adder をインストールする

1. Adder のリリースページを開き、Mac のアーキテクチャに合う macOS の `.pkg` パッケージをダウンロードします。Apple silicon には `arm64`、Intel Mac には `amd64` を選択します。
2. `.pkg` ファイルをダブルクリックして、インストーラの案内に従います。
3. インストーラは `Adder.app` を `/Applications` に配置します。`Adder.app` には `adder-tray` GUI と `adder` CLI を同梱します。
4. インストーラが `/usr/local/bin/adder` の利便性リンクを作成した場合は、`ターミナル` で `adder` を実行します。リンクを作成できない場合は、`/Applications/Adder.app/Contents/MacOS/adder` を実行します。インストーラは、別のツールが使用している既存の `/usr/local/bin/adder` リンクを上書きしません。

## Adder を起動する

- `/Applications` から `Adder` を開きます。
- または、`ターミナル` で `open /Applications/Adder.app` を実行します.

初回起動時のトレイウィザードが、起動時およびログイン時の登録を処理します。パッケージはこれらの設定を構成しません。

### macOS の起動を設定する

1. トレイウィザードで `Start Adder automatically on login / reboot` を選択すると自動起動を有効にできます。自動起動を無効にするには、この項目を解除します。
2. ウィザードのバックグラウンドアクティビティの状態で、macOS サービスの登録状況と実行状況を確認します。
3. `Open Login Items Settings...` を選択すると、`システム設定 > 一般 > ログイン項目と機能拡張 > ログイン時に開く / アプリのバックグラウンドアクティビティ` が開きます。

ウィザードは起動時の選択を適用し、macOS の LaunchAgent と Login Item の設定を同期します。

### About の情報を表示する

トレイメニューから `About Adder` を開くと、実行中のバージョンを確認できます。ビルドにコミットハッシュが含まれている場合は、About ウィンドウでその値も確認できます。バージョンがない場合は `devel` と表示されます。

## ローカルの macOS パッケージをビルドする

標準パッケージをローカルでビルドするには、次のコマンドを実行します。

```bash
make pkg-macos
```

`ARCH` でパッケージのアーキテクチャを選択します。

```bash
ARCH=arm64 make pkg-macos
ARCH=amd64 make pkg-macos
```

ローカルテストでは、アプリバンドルにアドホック署名を付けて通知を有効にする次のターゲットを使用します。

```bash
make pkg-macos-adhoc
ARCH=arm64 make pkg-macos-adhoc
ARCH=amd64 make pkg-macos-adhoc
```

リリース用パッケージは、リリース用の認証情報が利用できる場合にリリース署名、ノータライズ、チケットのステープル処理を行います。`pkg-macos-adhoc` ターゲットは `ADHOC=1` を設定し、アプリバンドルにローカル用のアドホック署名を付けて通知を有効にします。ただし、`.pkg` 自体には署名せず、ノータライズもしません。Gatekeeper はローカルの署名なしまたはアドホックパッケージを受け付けない場合があります。

明示的なバージョンとコミットメタデータを指定してローカルのアプリバンドルをビルドするには、`bundle-macos` ターゲットに `VERSION` と `COMMIT_HASH` を渡します。

```bash
VERSION=1.2.3 COMMIT_HASH=abc1234 make bundle-macos
```

バンドルスクリプトは `VERSION` を `adder` と `adder-tray` のビルドに渡し、指定した値をバンドルの `AdderGitVersion` メタデータに保存します。生成されたプログラムは `VERSION` と `COMMIT_HASH` を使用するため、About ダイアログで指定した値を確認できます。

## ソースチェックアウトからアンインストールする

Adder のソースチェックアウトからアンインストールスクリプトを実行します。

```bash
./scripts/bundle-macos-uninstall.sh
```

このスクリプトは、実行中の Adder プロセスを停止し、Login Items から Adder を削除し、LaunchAgent をアンロードして削除し、Adder のアプリバンドルを削除して、ローカルのビルド成果物をクリーンアップします。デフォルトでは設定とログを保持します。

設定とログも削除するには、`--purge`、`--all`、または `-a` を指定します。

```bash
./scripts/bundle-macos-uninstall.sh --purge
```

インストール済みパッケージを手動で削除しても、このクリーンアップは実行されません。スクリプトは `/usr/local/bin/adder` の利便性リンクを削除しません。パッケージインストーラは可能な場合にこのリンクを作成しますが、無関係な既存のリンクは置き換えないため、リンクが存在しない Adder インストールを指している場合は別途処理してください。


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
