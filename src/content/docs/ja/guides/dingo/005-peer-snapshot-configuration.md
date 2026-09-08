---
title: ピアスナップショット設定
description: DingoのpeerSnapshotFileとピアスナップショットの起動時検証を説明する。
---

# ピアスナップショット設定

このページでは、`topology.json` から `cardano-node` のピアスナップショットを読み込むための `peerSnapshotFile` と、起動時に適用される検証条件を説明します。

## `peerSnapshotFile` の設定

`topology.json` の `peerSnapshotFile` に、`cardano-node` のピアスナップショットファイルを指定します。

```json
{
  "peerSnapshotFile": "peer-snapshot.json"
}
```

相対パスは、`topology.json` があるディレクトリを基準に解決します。

## スナップショットの検証条件

Dingoは、スナップショットからピアを読み込む前に、次の条件を検証します。

- `NodeToClientVersion` は `23` である必要があります。
- `NetworkMagic` には値を指定します。Dingoは、設定済みのネットワークマジックと一致しない値を受け付けません。
- `Point.blockPointHash` は、64文字の16進数で指定する必要があります。これは32バイトのハッシュに相当します。
- `bigLedgerPools` と `allLedgerPools` の一方だけに1件以上のプールを設定し、もう一方は空にします。`allLedgerPools` を使用できます。
- 選択した各プールの `relays` リストに、1件以上のリレーを設定します。

## リレー接続先

各リレーには、次の条件を満たす `address` と `port` を指定します。

- `address` は空にできません。値には有効なDNSホスト名、または未指定ではないIPアドレスを指定します。
- `port` には明示的なTCPポートを指定します。指定できる範囲は `1` から `65535` です。
- DingoはポートなしのSRVリレーをサポートしません。`port: 0` をポート未指定として拒否し、起動に失敗します。

不正な形式のスナップショットを受け付けないため、Dingoは起動に失敗します。検証に成功したスナップショットだけをピアの入力として使用します。