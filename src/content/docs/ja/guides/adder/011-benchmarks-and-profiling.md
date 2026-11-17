---
title: ストリーミングとプロファイリングのベンチマーク
description: Adderのストリーミングベンチマークとローカルプロファイリングの方法。
---

## 代表的なベンチマーク

リポジトリのルートから次のコマンドを実行すると、イベントフロー、Cardanoフィルター、イベントJSONのベンチマークを同じ条件で測定できます。

```sh
go test ./pipeline ./filter/cardano ./event -run '^$' -bench 'Benchmark(PipelineEventFlow|CardanoFilter|EventJSON)' -benchmem -benchtime=1s -count=5
```

`BenchmarkPipelineEventFlow`は、実行中のパイプラインに1イベントずつイベントを送り、出力に到達するまで待つ処理を測定します。パススルーフィルターの数は0個、1個、3個で、出力は1つです。起動と終了は計測区間の外側にあり、入力側は各イベントが出力に到達してから次のイベントを送ります。このワークロードは、同時入力による最大スループットではなく、下流のバックプレッシャーがない単一プロデューサーの処理を表します。

`BenchmarkCardanoFilter`は、1つの出力と1つの解決済み入力を持つトランザクションに対するアドレスフィルターとアセットフィルター、およびブロックに対するプールフィルターを測定します。各フィルターには、固定した一致ケースと不一致ケースがあります。フィルター設定とフィクスチャーの作成は計測区間の外側にあり、ベンチマークはプラグインのイベントループが使用するフィルター処理関数を呼び出します。

`BenchmarkEventJSON`は、トランザクションコンテキスト、ブロックハッシュ、手数料、出金、CBORバイト列を含むトランザクションイベントについて、JSONへのマーシャリングとJSONからのアンマーシャリングを別々に測定します。完全にデコードした台帳トランザクションは含みません。アンマーシャリング後の`Event`の`any`フィールドは、通常のラウンドトリップと同様に汎用JSON値になります。

各ベンチマークの時間とアロケーションは、ここで定義したワークロードに固有です。比較には同じマシン、同じGoバージョン、同じワークロードを使用してください。測定結果だけでは、実際の運用でどこに時間が費やされるかや、本番環境のボトルネックを証明できません。

## ストリーミングとバックプレッシャー

ChainSync入力には2,048イベントの出力バッファがあり、通常のプラグインチャネルはデフォルトで10スロットです。パイプラインの転送チャネルはバッファを持ちません。同じパイプラインと出力を使用し、合成入力バッファの容量を10、256、2,048スロットで比較します。

```sh
for order in 0 1 2 2 1 0; do
  GOMAXPROCS=2 ADDER_BENCH_ORDER="$order" GOWORK=off go test ./pipeline -run '^$' -bench '^BenchmarkPipelineStreaming$' -benchmem -benchtime=200ms -count=1 -v
done
```

各オペレーションは4,096個のブロックイベントエンベロープを送信して排出します。`fast_output`は継続的に排出します。`periodic_output_pause`は間欠的なシンクのバックプレッシャーを再現するため、64イベントを排出するたびに100マイクロ秒スリープします。ベンチマークは、4,096イベントの各オペレーションについて、時間とアロケーションに加えてevents/sを報告します。起動処理は計測区間の外側です。ベンチマークはCardanoノード、デコード、フィルター、シリアライズ、ネットワーク出力、ペイロードのアロケーションを計測対象に含めません。一時停止は合成スケジュールであり、実際のシンクのレイテンシーを計測するものではありません。6回の個別実行で3つのバッファ順序を均等に扱い、`-v`は各順序の未加工のタイミングを表示します。実行間では同じ名前のケースを比較してください。プロデューサーの完了が速いだけでは、エンドツーエンドの配信が速いことを意味しません。

チャネルの作成はタイマーの外側で行うため、B/opにはバッファのストレージが含まれません。

Apple M5でGo 1.27.3、`GOMAXPROCS=2`を設定し、マシン上で他の処理を実行した状態で6回繰り返した場合の中央値は次のとおりです。

| 入力バッファ | Fast output events/s | Periodic pause events/s | イベントスロットのストレージ |
| ---: | ---: | ---: | ---: |
| 10 | 1,050,530 | 352,140 | 960 B |
| 256 | 1,080,099 | 354,043 | 24 KiB |
| 2,048 | 1,048,588 | 353,900 | 192 KiB |

ストレージ列は、このarm64ビルドにおける容量と96バイトの`event.Event`値を乗算した値です。この値はチャネルの管理情報と、イベントペイロードが保持するメモリを除外しています。実際のメモリ使用量と保持量は、キューの深さとペイロードサイズによって変わります。ここで示す小さなスループット差は、大きなバッファの利点を示すものではありません。

大きなバッファはバーストを吸収できますが、シンクが処理に追いつかない間は、より多くのキュー内イベントと、それらが参照するペイロードを保持します。バッファは、継続的に遅いシンクの処理能力を高めません。この比較はこのトレードオフを切り分けるものであり、特定のノード、ネットワーク、イベント構成、出力に適したChainSync設定を示すものではありません。対象のワークロードから得た測定結果が変更を正当化するまで、実行時のデフォルト値を維持してください。

## CPU、メモリ、実行トレースのプロファイル

実行時間を制限したローカルベンチマークからプロファイルを取得します。プロファイルがアプリケーションデータやパスを含む場合があるため、非公開の一時ディレクトリを使用してください。

```sh
profile_dir=$(mktemp -d)
GOWORK=off go test ./pipeline -run '^$' -bench '^BenchmarkPipelineStreaming/buffer_2048/fast_output$' -benchtime=1s -count=1 -cpuprofile="$profile_dir/cpu.out"
go tool pprof -top "$profile_dir/cpu.out"
GOWORK=off go test ./pipeline -run '^$' -bench '^BenchmarkPipelineStreaming/buffer_2048/fast_output$' -benchtime=200ms -count=1 -memprofile="$profile_dir/mem.out"
go tool pprof -alloc_space -top "$profile_dir/mem.out"
GOWORK=off go test ./pipeline -run '^$' -bench '^BenchmarkPipelineStreaming/buffer_2048/fast_output$' -benchtime=200ms -count=1 -trace="$profile_dir/trace.out"
go tool trace -pprof=sched "$profile_dir/trace.out" > "$profile_dir/sched.pprof"
go tool pprof -top "$profile_dir/sched.pprof"
```

CPUプロファイルは、実行中のCPU処理をサンプリングします。`alloc_space`は累積アロケーションを報告し、保持中のヒープは報告しません。取得時点で保持されているヒープを調べるには`-inuse_space`を使用します。メモリプロファイルは、プロセスの起動とベンチマークのセットアップも対象にします。スケジューラープロファイルは、実行可能な状態で発生した遅延を示します。短い実行ではサンプルが少なすぎる場合があるため、マシンに余裕がある場合に限り`-benchtime`を増やしてください。1つのプロファイラーが別のプロファイラーに影響を与えないように、各プロファイルを個別に取得します。この合成チャネルワークロードはGoランタイムのスケジューリングが支配的になる場合があり、実際のAdderデプロイメントのボトルネックは特定できません。比較では、Goのバージョン、マシン、ワークロード、ベンチマーク時間を固定し、プロファイルを取得しない実行を複数回行って、events/sとB/opの両方を比較します。プロファイルの計測処理はタイミングを変えるため、プロファイルを取得した実行をスループットの基準値に使用しないでください。

Adderのデバッグリスナーはデフォルトで無効になっており、HTTP pprofハンドラーを登録しません。これらのコマンドはGoのテストプロファイラーを使用し、ネットワークのリスナーを開きません。公開インターフェースでプロファイリングリスナーを公開しないでください。

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
