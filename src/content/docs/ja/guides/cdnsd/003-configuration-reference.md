---
title: 設定リファレンス
description: cDNSdのYAMLと環境変数のリファレンスです。
---

cDNSdは省略可能なYAMLファイルを読み込み、環境変数で上書きします。環境変数はYAMLの値より優先されます。

<a id="logging-dns-and-observability"></a>

## ログ、DNS、可観測性

| YAMLキー | 環境変数 | 用途 | 既定値 |
| --- | --- | --- | --- |
| `logging.debug` | `LOGGING_DEBUG` | デバッグログを有効にします。 | `false` |
| `logging.queryLog` | `LOGGING_QUERY_LOG` | 個々のDNSクエリを記録します。 | `true` |
| `dns.address` | `DNS_LISTEN_ADDRESS` | DNS待受アドレス。空の場合はすべてのインターフェース。 | 空 |
| `dns.port` | `DNS_LISTEN_PORT` | UDP/TCPのDNSポート。 | `8053` |
| `dns.tlsPort` | `DNS_LISTEN_TLS_PORT` | DNS-over-TLSポート。TLSにはキーと証明書の両方のパスが必要です。 | `8853` |
| `dns.recursionEnabled` | `DNS_RECURSION` | ブロックチェーン以外の名前の再帰検索を許可します。 | `false` |
| `dns.rootHints` | `DNS_ROOT_HINTS` | 直接指定するルートヒントの内容。 | 組み込み |
| `dns.rootHintsFile` | `DNS_ROOT_HINTS_FILE` | ルートヒントを含むファイル。 | 空 |
| `dns.retryCount` | `DNS_RETRY_COUNT` | 上流への問い合わせの再試行回数。 | `3` |
| `dns.retryDelayMs` | `DNS_RETRY_DELAY_MS` | 再試行間の待機時間（ミリ秒）。 | `100` |
| `dns.queryTimeoutMs` | `DNS_QUERY_TIMEOUT_MS` | 上流クエリのタイムアウト（ミリ秒）。 | `5000` |
| `dns.soa.mname` | `DNS_SOA_MNAME` | SOAのプライマリネームサーバー。 | `ns1.cdnsd.localhost.` |
| `dns.soa.rname` | `DNS_SOA_RNAME` | SOAの管理者メールボックス。 | `hostmaster.cdnsd.localhost.` |
| `dns.soa.refresh` | `DNS_SOA_REFRESH` | SOAの更新間隔。 | `3600` |
| `dns.soa.retry` | `DNS_SOA_RETRY` | SOAの再試行間隔。 | `900` |
| `dns.soa.expire` | `DNS_SOA_EXPIRE` | SOAの有効期間。 | `604800` |
| `dns.soa.minimum` | `DNS_SOA_MINIMUM` | SOAの最小値/TTL。 | `86400` |
| `metrics.address` | `METRICS_LISTEN_ADDRESS` | Prometheusメトリクスの待受アドレス。 | 空 |
| `metrics.port` | `METRICS_LISTEN_PORT` | Prometheusメトリクスのポート。 | `8081` |
| `debug.address` | `DEBUG_ADDRESS` | デバッグとpprofのHTTP待受アドレス。 | `localhost` |
| `debug.port` | `DEBUG_PORT` | デバッグとpprofのHTTPポート。`0`で無効。 | `0` |

ローカル専用の設定では`METRICS_LISTEN_ADDRESS=127.0.0.1`が最も安全です。空のアドレスでは、認証のない`/metrics`がすべてのインターフェースで待ち受けます。

<a id="indexing-state-and-tls"></a>

## インデックス、状態、TLS

| YAMLキー | 環境変数 | 用途 | 既定値 |
| --- | --- | --- | --- |
| `indexer.network` | `INDEXER_NETWORK` | `preprod`や`mainnet`などのCardanoネットワーク名。 | プロファイルで指定 |
| `indexer.networkMagic` | `INDEXER_NETWORK_MAGIC` | 必要な場合のCardanoネットワークマジック。 | `0` |
| `indexer.address` | `INDEXER_TCP_ADDRESS` | CardanoノードのTCPアドレス。 | 空 |
| `indexer.socketPath` | `INDEXER_SOCKET_PATH` | CardanoノードのIPCソケットパス。 | 空 |
| `indexer.interceptHash` | `INDEXER_INTERCEPT_HASH` | 同期を開始または再開するブロックハッシュ。 | プロファイルで指定 |
| `indexer.interceptSlot` | `INDEXER_INTERCEPT_SLOT` | 同期を開始または再開するスロット。 | プロファイルで指定 |
| `indexer.verify` | `INDEXER_VERIFY` | 追加のインデクサー検証を有効にします。 | `true` |
| `indexer.handshakeAddress` | `INDEXER_HANDSHAKE_ADDRESS` | Handshakeピアのアドレス。 | 空 |
| `state.dir` | `STATE_DIR` | BadgerDBの永続状態ディレクトリ。 | `./.state` |
| `tls.certFilePath` | `TLS_CERT_FILE_PATH` | DNS-over-TLSのTLS証明書。 | 空 |
| `tls.keyFilePath` | `TLS_KEY_FILE_PATH` | DNS-over-TLSのTLS秘密キー。 | 空 |
| `profiles` | `PROFILES` | 有効なプロファイル名（カンマ区切り）。 | `ada-preprod,auto-preprod` |

DNS-over-TLSは`TLS_CERT_FILE_PATH`と`TLS_KEY_FILE_PATH`の両方が読み取り可能なファイルを指す場合のみ起動します。プロファイルはネットワークと同期開始点を指定できます。現在の一覧は[プロファイルのソース](https://github.com/blinklabs-io/cdnsd/blob/main/internal/config/profile.go)を参照してください。
