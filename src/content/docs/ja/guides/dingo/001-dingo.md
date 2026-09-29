---
title: Dingo
description: ノード運用者、アプリ開発者、コントリビューター向けのDingoドキュメント。
---

![Dingoロゴ](/dingo-logo-250.png)

DingoはBlink LabsがGoで実装したCardanoノードです。目的に合ったガイドを選んでください。

## ノードを運用する

- [クイックスタート](/ja/guides/dingo/002-quick-start-overview/) — Dingoを入手し、Previewノードを起動します。
- [設定とストレージモード（英語）](/guides/dingo/005-node-configuration/) — リレー、ブロックプロデューサー、APIノードの設定を確認します。
- [Dingoの設定リファレンス（英語）](/guides/dingo/009-configuration-reference/) — Dingo v0.73.4の設定と完全な設定例を確認できます。
- [ブートストラップとデータ管理（英語）](/guides/dingo/007-bootstrap-and-data-maintenance/) — Mithrilとローカルデータの管理について説明します。
- [サービスとして起動](/ja/guides/dingo/003-create-start-up-service/)、[Grafanaで監視](https://docs.blinklabs.io/guides/dingo/spo-guides/008-grafana-dashboard/)。
- [ステークプール運用ガイド](https://docs.blinklabs.io/guides/dingo/spo-guides/000-spo-guide/) — テストネットのブロックプロデューサーを設定します。

## アプリケーションを接続する

- [APIとアーカイブサービス（英語）](/guides/dingo/006-apis-and-archive/) — APIの選択、アクセス制御、Barkアーカイブを確認します。
- [Blockfrost APIクライアントの構築（英語）](/guides/dingo/Development%20Guides/009-build-blockfrost-client/) — Dingoの互換APIにアプリケーションを接続します。
- [UTxO RPCを使うウォレットフロントエンドの構築（英語）](/guides/dingo/Development%20Guides/010-build-utxorpc-frontend/) — UTxOの照会とトランザクション送信を行います。
- [ガバナンスダッシュボードの構築（英語）](/guides/dingo/Development%20Guides/011-build-governance-dashboard/) — インデックス済みメタデータの選択肢と制約を確認します。
- [Cardano CLIでDingoを使う](/ja/guides/dingo/004-using-dingo-with-cardano-cli/) — node-to-client接続でノードを照会します。

## Dingoに貢献する

[Dingoリポジトリ](https://github.com/blinklabs-io/dingo)にはGoソースと開発者向けドキュメントがあります。[開発ガイド](https://github.com/blinklabs-io/dingo/blob/main/docs/development.md)、[アーキテクチャ](https://github.com/blinklabs-io/dingo/blob/main/ARCHITECTURE.md)、[データベース設計](https://github.com/blinklabs-io/dingo/blob/main/DATABASE.md)から始めてください。GoライブラリAPIのリファレンスは[pkg.go.dev](https://pkg.go.dev/github.com/blinklabs-io/dingo)で確認できます。

[リリースノート](/ja/guides/dingo/releases/001-release-notes/)にはバージョン間の変更が記載されています。

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
