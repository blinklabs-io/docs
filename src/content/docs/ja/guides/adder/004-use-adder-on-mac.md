---
title: Macでの使用
description: MacでAdderを使用する方法。
---

# MacでAdderを使う

Adder は、署名済みでノータライズ済みの macOS `.pkg` パッケージとして配布されます。
このパッケージは、トレイ GUI と `adder` CLI を備えた `Adder.app` を提供します。

## Adder をインストールする

1. Adder のリリースページを開き、macOS の `.pkg` パッケージをダウンロードします。
2. `.pkg` ファイルをダブルクリックして、インストーラの案内に従います。
3. インストーラは `Adder.app` を `/Applications` に配置します。

## Adder を更新する

更新時は、以前のアプリ単体の配布物ではなく、macOS の `.pkg` パッケージを使用します。インストーラは `/usr/local/bin/adder` が存在しない場合、または `/Applications/Adder.app/Contents/MacOS/adder` を指している場合に限り、CLI のシンボリックリンクを作成します。別のコマンドを指す既存のパスは上書きしません。

## Adder を起動する

- `/Applications` から `Adder` を開きます。
- または、`ターミナル` で `open /Applications/Adder.app` を実行します.

## ローカルでパッケージをビルドする

ローカルで通知機能を確認するには、次のコマンドを実行します。

```sh
make pkg-macos-adhoc
```

このコマンドは `ADHOC=1` を指定してアプリバンドルにアドホック署名を付けます。生成した `.pkg` は署名されないため、Gatekeeper は承認しません。


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
