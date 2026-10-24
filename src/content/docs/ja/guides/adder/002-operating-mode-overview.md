---
title: 動作モードの概要
description: Adderの動作モードの概要。Adderには、Adder TrayとAdder CLIの2つの主要モードがあります。
---

Adderには、利用者や導入環境に合わせた2つの動作モードがあります。使いやすさ、設定の柔軟性、運用上の制御を考慮して、適切なモードを選択してください。

<a id="1-adder-tray-windows--macos"></a>

## 1. Adder Tray（WindowsとmacOS）

Adder Trayはシステムトレイで動作するデスクトップアプリケーションです。Cardanoブロックチェーンの活動を手軽に監視できます。

- [Windowsインストールガイド](../003-using-adder-on-windows)
- [Macインストールガイド](../004-use-adder-on-mac)

<a id="key-characteristics"></a>

### 主な特徴

- 署名付きインストーラー（Windows用の`.msi`、macOS用の`.pkg`）を提供します。
- OSと自動的に統合されます。
  - システムトレイメニュー
  - 設定ウィザード
  - 通知の権限
  - バックグラウンドサービスの管理
- 設定が簡単です。
  - アドレス、ステーキングキー、プールID、DRepなどの対象を選択します。
  - Adder Trayが定義済みの通知タイプを適用します。
- YAMLやCLIは不要で、技術に詳しくない利用者にも適しています。

<a id="use-cases"></a>

### 用途

- 簡単な通知が必要なSPOや委任者。
- 投票や提案を監視するガバナンス参加者。
- コマンドラインよりGUIでの設定を好む利用者。

<a id="2-adder-cli--event-monitor-linux-binary"></a>

## 2. Adder CLI / イベントモニター（Linuxバイナリ）

コマンドラインバイナリでは、Adderのイベント処理パイプラインをすべて利用できます。イベントのフィルタリングと出力を細かく制御したい運用者、開発者、インテグレーター向けです。

- [Linuxガイド](../005-use-adder-on-linux)

<a id="key-characteristics-1"></a>

### 主な特徴

- バイナリをダウンロードしてインストールします。
- 次の方法で柔軟に設定できます。
  - コマンドラインフラグ
  - YAML設定ファイル
  - 環境変数
- すべての入出力プラグインを利用できます。
  - chainsync、mempool、ntn、ntc入力
  - log、push、webhookなどの出力
- 次の条件で詳細にイベントをフィルタリングできます。
  - イベントタイプ
  - ウォレットアドレス
  - ステークアドレス
  - アセットフィンガープリント
  - ポリシーID
  - プールIDなど
- 自動化、スクリプト、外部システムとの統合に適しています。

<a id="use-cases-1"></a>

### 用途

- SPOインフラの監視。
- 独自のインデクサーや分析パイプライン。
- Webhook、プッシュ通知、JSONパイプラインを利用する自動アラートシステム。
- GoライブラリとしてAdderを組み込む開発者。

<a id="quick-decision-matrix"></a>

## モードの選択

| 要件 | 推奨モード |
| --- | --- |
| 簡単な通知 | **Adder Tray** |
| CLIの経験がない | **Adder Tray** |
| 完全なカスタマイズ | **Adder CLI** |
| YAML設定 | **Adder CLI** |
| Webhook / JSON出力 | **Adder CLI** |
| OS標準の通知 | **Adder Tray** |
| Linuxでの実行 | **Adder CLI** |
| スクリプトやサービスとの統合 | **Adder CLI** |
| GUIによる設定 | **Adder Tray** |

<a id="adder-tray-guides-windows--macos"></a>

## Adder Trayガイド（WindowsとmacOS）

- [Windowsインストールガイド](../003-using-adder-on-windows)
- [Macインストールガイド](../004-use-adder-on-mac)

<a id="adder-cli--event-monitor-guides-linux"></a>

## Adder CLI / イベントモニターガイド（Linux）

- [Linuxガイド](../005-use-adder-on-linux)
