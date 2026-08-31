---
title: Macでの使用
description: MacでAdderを使用する方法。
---

# MacでAdderを使う

Adder は、署名済みでノータライズ済みの macOS `.pkg` パッケージとして配布されます。

## Adder をインストールする

1. Adder のリリースページを開き、macOS の `.pkg` パッケージをダウンロードします。
2. `.pkg` ファイルをダブルクリックして、インストーラの案内に従います。
3. インストーラは `Adder.app` を `/Applications` に配置します。

## Adder を起動する

- `/Applications` から `Adder` を開きます。
- または、`ターミナル` で `open /Applications/Adder.app` を実行します.

## CLI を使用する

インストール後は、通常 `/usr/local/bin/adder` のシンボリックリンクを通じて `adder` を実行できます。

```bash
adder --help
```

インストーラは `/usr/local/bin/adder` のシンボリックリンクの作成を試みますが、macOS で `/usr/local` が読み取り専用または書き込み制限下にある場合、リンクを作成できないことがあります。また、別のツールがすでに `/usr/local/bin/adder` を使用している場合、インストーラはそのファイルを上書きしません。リンクを利用できない場合も、CLIは `/Applications/Adder.app/Contents/MacOS/adder` から直接実行できます。

```bash
/Applications/Adder.app/Contents/MacOS/adder --help
```

## ローカルでパッケージを作成する場合

ローカルで macOS パッケージを作成し、通知の許可を有効にする必要がある場合は、ビルド時に `ADHOC=1` を指定します。この方法で作る `.pkg` は未署名であり、署名済みでノータライズ済みのリリース版とは異なり、Gatekeeper を通過する配布方法ではありません。


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
