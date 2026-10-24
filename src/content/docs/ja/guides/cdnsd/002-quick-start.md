---
title: クイックスタート
description: cDNSdリゾルバーのインストール、設定、テストを行います。
---

<a id="step-1-install-and-start-cdnsd"></a>

## 手順1：cDNSdをインストールして起動する

[cDNSdリリース](https://github.com/blinklabs-io/cdnsd/releases)から`cdnsd`をビルドまたはダウンロードし、必要に応じて設定ファイルを指定して起動します。

```sh
cdnsd -config /etc/cdnsd/config.yaml
```

設定ファイルがない場合、DNSはポート`8053`、メトリクスは`8081`、永続状態は`./.state`を使用します。DNS-over-TLSはTLS証明書とキーの両方のパスを設定した場合のみポート`8853`で有効になります。`1024`未満のポートには通常、管理者権限が必要です。標準ポート53を公開する場合は、リバースプロキシまたはコンテナのポートマッピングを使用してください。

<a id="step-2-create-a-minimal-configuration"></a>

## 手順2：最小限の設定を作成する

この例ではCardanoのpreprodプロファイルを有効にし、作業ディレクトリの外に状態を保存します。

```yaml
dns:
  address: "0.0.0.0"
  port: 8053
metrics:
  address: "127.0.0.1"
  port: 8081
indexer:
  network: "preprod"
  address: "127.0.0.1:3001"
state:
  dir: "/var/lib/cdnsd"
profiles:
  - "ada-preprod"
```

CardanoノードにはcDNSdから接続可能なアドレスを指定してください。ローカルノードソケットを使用する場合は`address`の代わりに`socketPath`を使います。プロファイルはネットワークとドメインの設定を提供します。[利用可能なプロファイル](https://github.com/blinklabs-io/cdnsd/blob/main/internal/config/profile.go)を参照してください。

`METRICS_LISTEN_ADDRESS`が空の場合、メトリクスはすべてのインターフェースで待ち受けます。`/metrics`には認証がないため、ローカル監視には`127.0.0.1`を使用してください。意図的に公開する場合は、ネットワーク制御と認証で保護してください。

<a id="step-3-start-with-environment-variables"></a>

## 手順3：環境変数で起動する

コンテナやsystemdユニットでは、YAMLをマウントせずに同じ値を上書きできます。

```sh
export DNS_LISTEN_ADDRESS=127.0.0.1
export DNS_LISTEN_PORT=8053
export METRICS_LISTEN_ADDRESS=127.0.0.1
export INDEXER_NETWORK=preprod
export INDEXER_TCP_ADDRESS=127.0.0.1:3001
export STATE_DIR=/var/lib/cdnsd
export PROFILES=ada-preprod
cdnsd
```

環境変数はYAMLファイルの値より優先されます。

<a id="step-4-test-the-resolver"></a>

## 手順4：リゾルバーをテストする

`dig`でDNSリスナーに直接問い合わせます。

```sh
dig @127.0.0.1 -p 8053 example.com
dig @127.0.0.1 -p 8053 <indexed-domain>.ada
```

最初のクエリは通常のDNS名前解決を確認します。`<indexed-domain>`はノードがインデックスしたCardano/Handshake状態に存在するドメインに置き換えてください。プロファイルを設定しただけでは、特定の名前が解決できるとは限りません。DNS-over-TLSを有効にした場合は、対応クライアントと設定済み証明書でテストしてください。

<a id="step-5-monitor-cdnsd"></a>

## 手順5：cDNSdを監視する

設定したメトリクスのアドレスとポートから`/metrics`を収集します。`debug.port`を0以外にすると、Goのpprofを含むデバッグHTTPサーバーが有効になります。診断目的で意図的に公開する場合を除き、デバッグエンドポイントはlocalhostに限定するか、認証で保護してください。

すべての設定項目は[設定リファレンス](/ja/guides/cdnsd/003-configuration-reference/)を参照してください。
