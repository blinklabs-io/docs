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
ローカルで macOS パッケージを作成し、通知の許可を有効にする必要がある場合は、ビルド時に `ADHOC=1` を指定します。この方法で作る `.pkg` は未署名であり、署名済みでノータライズ済みのリリース版とは異なり、Gatekeeper を通過する配布方法ではありません。


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
