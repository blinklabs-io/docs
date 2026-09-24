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


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
