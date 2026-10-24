---
title: cDNSd
description: cDNSdでCardanoとHandshakeに対応したDNSリゾルバーを実行します。
---

cDNSdは[Cardano](https://cardano.org/)と[Handshake](https://handshake.org/)向けのDNSリゾルバー兼ブロックチェーンインデクサーです。Handshakeのトップレベルドメインに登録されたセカンドレベルドメインを解決し、通常のDNS名もICANNルートヒントで解決します。

デーモンはUDPとTCPでDNSを提供し、DNS-over-TLSにも対応しています。Prometheusメトリクスも公開します。YAML、環境変数、または両方で設定できます。

<a id="what-you-need"></a>

## 必要なもの

- cDNSdからTCPまたはローカルIPCソケットで接続できるCardanoノード。
- cDNSdの状態を保存する永続ディレクトリ。
- 解決するCardano/Handshakeドメインに対応するプロファイル設定。

<a id="next-steps"></a>

## 次の手順

- [クイックスタート](/ja/guides/cdnsd/002-quick-start/)に従ってリゾルバーをインストール、設定、テストしてください。
- すべてのYAMLキーと環境変数は[設定リファレンス](/ja/guides/cdnsd/003-configuration-reference/)を参照してください。

<a id="source-and-support"></a>

## ソースとサポート

- [cDNSdのソースコード](https://github.com/blinklabs-io/cdnsd)
- [cDNSdのリリース](https://github.com/blinklabs-io/cdnsd/releases)
- [問題を報告](https://github.com/blinklabs-io/cdnsd/issues)
