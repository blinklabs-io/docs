---
title: Dingo設定リファレンス
description: DingoのKoios、トークンレジストリ、SQLiteメタデータ設定とCLIオプションのリファレンス。
---

# Dingo設定リファレンス

このページでは、Koiosの宛先保護、トークンレジストリのサイズ上限、SQLiteメタデータの定期メンテナンスに関する設定を説明します。

## Koiosの宛先制御

`koiosParity.allowPrivateAddresses` は、Koiosの宛先にプライベート、ループバック、リンクローカル、マルチキャスト、未指定、その他の特殊用途のアドレスを許可するかを指定します。既定値は `false` です。`false` の場合、リダイレクト先やDNS解決後の宛先も含め、これらの宛先を拒否します。

```yaml
koiosParity:
  allowPrivateAddresses: false
```

この設定は次の環境変数とCLIフラグでも指定できます。

- 環境変数: `DINGO_KOIOS_PARITY_ALLOW_PRIVATE_ADDRESSES`
- CLIフラグ: `--koios-parity-allow-private-addresses`

プライベートなデプロイメントを明示的に許可する場合は、値を `true` に設定します。平文HTTPの許可は別の設定で指定するため、HTTPの許可だけではプライベートな宛先を許可しません。

`node-parity` の `from-genesis` サブコマンドでは、専用のCLIフラグを使用します。

```text
node-parity from-genesis --koios-allow-private-addresses
```

## トークンレジストリの上限

`tokenRegistry` の各設定値に `0` を指定すると、組み込みの既定値を使用します。

| YAMLキー | `0` の動作と既定値 | 環境変数 | CLIフラグ |
| --- | --- | --- | --- |
| `tokenRegistry.maxDecompressedBytes` | `0` は `2 GB` を使用 | `DINGO_TOKEN_REGISTRY_MAX_DECOMPRESSED_BYTES` | `--token-registry-max-decompressed-bytes` |
| `tokenRegistry.maxArchiveEntries` | `0` は `100000` を使用 | `DINGO_TOKEN_REGISTRY_MAX_ARCHIVE_ENTRIES` | `--token-registry-max-archive-entries` |
| `tokenRegistry.maxAcceptedEntries` | `0` は `50000` を使用 | `DINGO_TOKEN_REGISTRY_MAX_ACCEPTED_ENTRIES` | `--token-registry-max-accepted-entries` |
| `tokenRegistry.maxBatchBytes` | `0` は `64 MB` を使用 | `DINGO_TOKEN_REGISTRY_MAX_BATCH_BYTES` | `--token-registry-max-batch-bytes` |

`maxEntryBytes` も設定する場合、両方の値が `0` より大きいとき、起動時に `maxBatchBytes >= maxEntryBytes` を満たす必要があります。Dingoは起動時に、`maxBatchBytes` が `maxEntryBytes` より小さい設定を拒否します。

## SQLiteメタデータのVACUUM

`vacuumIntervalSeconds` はSQLiteメタデータプロバイダー専用の設定です。

```yaml
plugins:
  storage:
    metadata:
      provider: "sqlite"
      config:
        vacuumIntervalSeconds: 86400
```

値は秒数で指定します。設定を省略するか `0` を指定すると、定期的な完全 `VACUUM` を無効にします。正の値を指定すると、その間隔で完全 `VACUUM` を実行します。完全 `VACUUM` はSQLiteの書き込みを一時停止する場合があるため、停止を許容できる間隔を設定してください。

この設定には、追加のCLIフラグや環境変数の別名はありません。


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
