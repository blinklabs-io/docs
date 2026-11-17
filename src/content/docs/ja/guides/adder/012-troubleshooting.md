---
title: トラブルシューティング
description: Adderのプロファイリングに関するトラブルシューティング。
---

<a id="profiling"></a>

## HTTP経由でプロファイルを取得できない

### 症状

デバッグリスナーに接続して、`http://localhost:6060/debug/pprof/goroutineleak` からプロファイルを取得できません。

### 原因

AdderのデバッグリスナーはHTTP pprofハンドラーを登録しません。そのため、`GOEXPERIMENT=goroutineleakprofile go build -o adder ./cmd/adder` を実行してHTTP経由でプロファイルを取得する手順はサポートされていません。`go tool pprof http://localhost:6060/debug/pprof/goroutineleak` も使用しないでください。

### 対応

ネットワークに接続するプロファイリングリスナーを公開せず、プロファイルをプライベートな一時ディレクトリに保存する、範囲を限定したローカルベンチマークを使用してください。Go testのプロファイルフラグ、`go tool pprof`、`go tool trace`を使用する手順は、[ベンチマークとプロファイリング](./011-benchmarks)を参照してください。

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>