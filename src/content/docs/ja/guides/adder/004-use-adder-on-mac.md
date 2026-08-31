---
title: Macでの使用
description: MacでAdderを使用する方法。
---

# MacでAdderを使う

Adder は、署名済みでノータライズ済みの macOS `.pkg` パッケージとして配布されます。

## Adder をインストールする

リリース版をインストールする前に、Macのアーキテクチャに合う `darwin-arm64` または `darwin-amd64` の `.pkg` パッケージを選択し、macOS 11.0 以降を使用していることを確認します。

1. Adder のリリースページを開き、macOS の `.pkg` パッケージをダウンロードします。
2. `.pkg` ファイルをダブルクリックして、インストーラの案内に従います。
3. インストーラは `Adder.app` を `/Applications` に配置します。

このパッケージには、トレイGUIとCLIの両方が同じ `Adder.app` に含まれています。`Adder.app` を開くとトレイGUIが起動します。

## Adder を起動する

- `/Applications` から `Adder` を開きます。
- または、`ターミナル` で `open /Applications/Adder.app` を実行します.

## CLI を使用する

インストール後、通常は `/usr/local/bin/adder` のシンボリックリンクを通じて `adder` を実行できます。

```bash
adder --help
```

インストーラはこのシンボリックリンクを可能な範囲で作成します。書き込みが制限された macOS や読み取り専用の `/usr/local` ではリンクを作成できない場合があります。また、別のツールがすでに `/usr/local/bin/adder` を使用している場合、インストーラはそのファイルを上書きしません。リンクを利用できない場合も、CLIは `/Applications/Adder.app/Contents/MacOS/adder` から直接実行できます。

```bash
/Applications/Adder.app/Contents/MacOS/adder --help
```

## ローカルでパッケージを作成する場合

ローカルで macOS パッケージを作成し、通知の許可を機能させる必要がある場合は、ビルド時に `ADHOC=1` を指定します。この方法で作成した `.pkg` は未署名であり、署名済みでノータライズ済みのリリース版とは異なり、Gatekeeper を通過する配布方法ではありません。
