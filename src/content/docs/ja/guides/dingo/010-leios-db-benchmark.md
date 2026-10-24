---
title: LeiosDB ベンチマーク CLI
description: v0.86.0 の LeiosDB レイテンシベンチマークを実行し、出力を読み取ります。
---

`cmd/leios-db-bench` コマンドは、取得、投票の読み取り、配信リクエストの読み取り、適用時の読み取りにかかる LeiosDB のレイテンシを測定します。

<a id="invocation"></a>

## 実行方法

次のいずれかの方法でベンチマークを実行します。

```sh
make bench-leios-db
```

読み取り時にデータを格納するキャッシュのシナリオを測定するには、次のターゲットを使用します。このターゲットは `LEIOS_DB_BENCH_ARGS` の値をベンチマークに渡します。

```sh
make bench-leios-db-cached
```

```sh
go run ./cmd/leios-db-bench
```

<a id="current-flags"></a>

## 現在のフラグ

レイテンシベンチマークは、次のフラグをサポートします。

| フラグ | 役割 |
| --- | --- |
| `-volatile-ebs` | 測定に使用する揮発性 EB を設定します。 |
| `-request-bytes` | リクエストのサイズを設定します。 |
| `-job-bytes` | ジョブのサイズを設定します。 |
| `-upstream-peers` | 取得範囲を分担する上流ピアの数を設定します。 |
| `-downstream-peers` | 配信リクエストを分担する下流ピアの数を設定します。 |
| `-samples` | 収集するサンプル数を設定します。 |
| `-gc-every` | ガベージコレクションの実行頻度を設定します。 |
| `-burst` | オプションのバーストスケジューリングを有効にします。 |
| `-burst-size` | スケジュールするバーストのサイズを設定します。 |
| `-burst-interval` | バースト間の間隔を設定します。 |
| `-cached-reads` | 各エンドーサーブロックの永続化済みマニフェストとクロージャーの読み取りに、読み取り時にデータを格納するキャッシュを有効にします。 |
| `-cpuprofile` | ベンチマークの CPU プロファイルを出力します。 |
| `-heapprofile` | ベンチマークのヒーププロファイルを出力します。 |

<a id="removed-flags"></a>

## 削除されたフラグ

> **移行時の注意:** 次のスループットベンチマーク用フラグは削除されています。指定すると実行に失敗するため、既存のスクリプトでは上記の現在のフラグに置き換える必要があります。

- `-pre-populated-ebs`
- `-fetch-clients`
- `-ebs-per-client`
- `-fetch-servers`
- `-chain-sel-reads`
- `-gc-ticks`
- `-runs`

<a id="workload-behavior"></a>

## ワークロードの動作

ベンチマークは、一度に 1 つのエンドーサーブロックについて次の処理を測定します。

1. **Fetch** はエンドーサーブロックのデータを読み取ります。
2. **Vote read** はブロックの投票データを読み取ります。
3. **Serve request reads** は下流ピアから要求されたデータを読み取ります。
4. **Apply read** は適用処理で使用するデータを読み取ります。

ベンチマークは、設定された上流ピアと下流ピアの間でリクエストと範囲を分担します。読み取りが進行中のエンドーサーブロックを越えてプルーニングを進めることはありません。ベンチマークが終了すると、オプションの `-burst` スケジューラーは次の実行間隔を待たず、速やかに停止します。

<a id="output"></a>

## 出力

ベンチマークは、取得、投票、配信、適用のそれぞれについて次の値を出力します。

- `p50` レイテンシ
- `p99` レイテンシ
- 最大レイテンシ
- サンプル数

これらは各処理のレイテンシを表します。スループットや反復処理の所要時間は表しません。

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
