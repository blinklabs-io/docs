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

## 起動とバックグラウンドアクティビティ

セットアップウィザードで `Start Adder automatically on login / reboot` を有効にすると、ログイン時または再起動時に Adder が自動的に起動します。この設定は、Adder Tray の launch agent と macOS のログイン項目への登録を同期します。

セットアップウィザードは、バックグラウンドアクティビティの登録状態と実行状態を示します。macOS の設定を確認または変更するには、`Open Login Items Settings...` を選択します。設定画面では `System Settings > General > Login Items & Extensions` を開き、`Open at Login` と `App Background Activity` を確認します。

## 通知ルールエディター

トレイメニューから `Notification Rules...` を選択すると、通知ルールを編集できます。次の対象ごとに監視対象を設定できます。

- `Wallets`
- `DReps`
- `Pools`
- `Assets`
- `Policies`

通知カテゴリのトグルで、対象ごとに受け取る通知の種類を選択します。`Monitor Everything` を選択するとすべてを監視し、個別の監視対象指定とは併用できません。

`Apply` を選択すると変更を保存し、通知ルールとレート制限を直ちに反映します。トレイプロセスの再起動は必要ありません。対象を削除する前に、エディターは確認を求めます。適用後の再接続でエディターが警告を示しても、エディターは閉じずに入力欄を再び有効にするため、入力を有効にした状態で再試行できます。

## About ダイアログ

トレイメニューから `About` を選択すると、アプリ内の About ダイアログが開きます。コミットハッシュを利用できる場合、ダイアログは `Version: <version> (commit: <hash>)` を示します。利用できない場合、ダイアログは `Version: <version>` のみを示します。

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
