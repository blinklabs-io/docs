---
title: Dingo
description: ノード運用者、アプリ開発者、コントリビューター向けのDingoドキュメント。
---

![Dingoロゴ](/dingo-logo-250.png)

DingoはBlink LabsがGoで実装したCardanoノードです。目的に合ったガイドを選んでください。

> Dingoは現在も開発中です。現行リリースはPreview、Preprod、またはプライベートDevNetで使用してください。メインネット運用には対応していません。

## ノードを運用する

- [クイックスタート](/ja/guides/dingo/002-quick-start-overview/) — Dingoを入手し、Previewノードを起動します。
- [設定とストレージモード](/guides/dingo/005-node-configuration/) — リレー、ブロックプロデューサー、APIノードの設定を確認します。
- [ブートストラップとデータ管理](/guides/dingo/007-bootstrap-and-data-maintenance/) — Mithrilとローカルデータの管理について説明します。
- [サービスとして起動](/ja/guides/dingo/003-create-start-up-service/)、[Grafanaで監視](https://docs.blinklabs.io/guides/dingo/spo-guides/008-grafana-dashboard/)。
- [ステークプール運用ガイド](https://docs.blinklabs.io/guides/dingo/spo-guides/001-spo-guide/) — テストネットのブロックプロデューサーを設定します。

## アプリケーションを接続する

- [APIとアーカイブサービス](/guides/dingo/006-apis-and-archive/) — APIの選択、アクセス制御、Barkアーカイブを確認します。
- [Cardano CLIでDingoを使う](/ja/guides/dingo/004-using-dingo-with-cardano-cli/) — node-to-client接続でノードを照会します。

## Dingoに貢献する

[Dingoリポジトリ](https://github.com/blinklabs-io/dingo)にはGoソース、サンプル、開発者向けドキュメントがあります。[開発ガイド](https://github.com/blinklabs-io/dingo/blob/main/docs/development.md)、[アーキテクチャ](https://github.com/blinklabs-io/dingo/blob/main/ARCHITECTURE.md)、[データベース設計](https://github.com/blinklabs-io/dingo/blob/main/DATABASE.md)から始めてください。

正確な設定値については、実行するDingoと同じリリースの[設定例](https://github.com/blinklabs-io/dingo/blob/main/dingo.yaml.example)を参照してください。[リリースノート](/guides/dingo/releases/001-release-notes/)にはバージョン間の変更が記載されています。
