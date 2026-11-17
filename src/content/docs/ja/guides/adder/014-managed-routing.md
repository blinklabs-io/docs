---
title: "Managedカスタマールーティングと設定リファレンス"
description: "Adderのmanagedカスタマールーティングを設定し、設定を再読み込みして、ルーティング状態と配信証跡を解釈する方法を説明します。"
---

# Managedカスタマールーティングと設定

## 概要

このリファレンスでは、Adderのオプトイン方式であるmanaged modeについて説明します。managed modeは1つのChainSync入力を読み取り、名前付き顧客ごとに独立したフィルターレーンを適用して、一致するイベントを顧客の宛先へ送信します。[動作モードの概要](./002-operating-mode-overview)では、managed modeとAdderの他の動作モードとの関係を説明します。[コマンドリファレンス](./006-command_list)には完全なCLIを記載しています。このページではmanaged modeのフラグと実行時の動作を説明します。

`--managed-config-dir`を指定しない場合、managed modeは通常のAdder CLIや組み込みパイプラインを変更しません。これらのパイプラインでは、既存のフィルター、出力のバックプレッシャー、設定の優先順位、HTTP API、公開`/events`ストリームがそのまま動作します。

## 有効化と前提条件

`--managed-config-dir`を設定してmanaged modeを選択します。Adderは次の設定を持つ`chainsync`入力を要求します。

- `intersect-tip=true`
- `auto-reconnect=true`
- `state-path`を指定しない
- 明示的な`intersect-point`を指定しない
- グローバルフィルターオプションを指定しない

managed modeはChainSyncソースをライブテールとして使用します。通常のHTTP APIと公開`/events`ストリームは起動しません。Adderは再起動するとその時点のtipから開始するため、実行間のイベントが失われることがあります。プロセス内で再接続すると、直近のイベントを再生したり、ロールバックを出力したりする場合があります。ルーターも有効なプラグインも配信キューを永続化しません。

ソースはDingoまたは公開Cardanoピアへ接続できます。すべての顧客レーンはこの1つの入力を共有し、設定によって各一致イベントを宛先へ割り当てます。

## オペレーターフラグと前提条件

managed modeで使用するフラグは次のとおりです。

| フラグ | 既定値 | 目的 |
| --- | --- | --- |
| `--managed-config-dir` | Empty | managed modeを有効にし、`manifest.json`と顧客ファイルを含むディレクトリを指定します。 |
| `--managed-credentials-dir` | Empty | 制限付き認証情報ファイルを含むディレクトリを指定します。 |
| `--managed-log-dir` | Empty | managed `log`宛先用の信頼できるローカルディレクトリを指定します。 |
| `--managed-token-file` | Empty | オペレーターAPIトークンを含む制限付きファイルを指定します。 |
| `--managed-address` | `127.0.0.1:8081` | 非公開managed APIリスナーのアドレスを指定します。Adderはリテラルのループバックアドレスだけを受け付けます。 |
| `--managed-allow-hosts` | Empty | オペレーターが承認したWebhookホスト名を列挙します。 |
| `--managed-allow-local-targets` | `false` | ローカルテスト用のループバックWebhook受信先を許可します。 |

managed APIリスナーはリテラルのループバックアドレスだけを受け付けます。リモートのオペレーターアクセスには、別途管理する安全なトンネルを使用します。`--managed-allow-local-targets`フラグは、ローカルテストで使うループバックWebhook受信先に対する明示的な例外です。他のWebhook宛先にはHTTPS、承認済みホスト名、公開宛先アドレスが必要です。

トークンは制限付きの通常ファイルに保存します。ファイルには32文字以上の1行を記載し、URLにはトークンを含めません。Unixでは、認証情報ファイルとオペレータートークンファイルに`0600`以下のモードが必要です。Windowsでは、実行アカウント、`LocalSystem`、または`Administrators`が所有し、Windowsアクセス制御リストはこれらのIDだけにアクセスを許可します。

## 設定ファイルの公開

オペレーターが設定ファイルと認証情報ファイルを管理します。Adderはこれらのファイルを書き込みません。完全なバンドルはアトミック置換で、次の順序で公開します。

1. 認証情報ファイルを公開します。
2. 顧客ファイルを公開します。
3. 最後に`manifest.json`を公開します。

完全公開ではmanifestの`generation`を増やし、変更した各顧客の`revision`を増やします。オペレーターが管理する非公開ディレクトリを使用します。拒否された更新を復元または修正済みrevisionへ置き換えられるように、正常動作が確認された保護済みバンドルをライブ公開ディレクトリの外部に保持します。

初期バンドルには、Adderの起動前に少なくとも1つの顧客を含めます。Adderはすべてのmanifestと顧客ファイルの参照を設定済みディレクトリ内に限定し、安全なベース名だけを受け付けます。顧客IDは、同じ実行中に以前削除したIDも含めて、ASCIIの大文字小文字を区別せず一意である必要があります。manifestのファイル参照もASCIIの大文字小文字を区別せず一意である必要があります。再起動すると、適用済みのIDとrevisionのインメモリ履歴は消去されます。

### Manifest

manifestには正のgenerationと、少なくとも1つの顧客参照を含めます。各参照には顧客のIDとrevisionを繰り返し記載し、顧客ファイルを指定します。

```json
{
  "generation": 1,
  "customers": [
    {
      "id": "u1",
      "revision": 1,
      "file": "u1.json"
    }
  ]
}
```

manifestファイルには有効なJSON値を1つだけ含めます。未知のフィールドや追加のJSON値があると検証に失敗します。顧客ファイルには参照された`id`と`revision`を正確に繰り返し記載します。

### 顧客ルールと宛先

顧客には少なくとも1つの宛先と1つのフィルタールールが必要です。各ルールには識別子、正規の入力イベントタイプの1つ、`all`または1つの名前付き宛先を指定します。サポートされる正規のイベントタイプは次のとおりです。

- `input.block`
- `input.transaction`
- `input.rollback`
- `input.governance`
- `input.drep-registration`
- `input.drep-update`
- `input.drep-retirement`

任意の`criteria`には、`addresses`、`policies`、`asset_fingerprints`、`pool_ids`、`drep_ids`という名前の配列を指定できます。アドレス、ポリシー、アセットの条件はANDで組み合わせます。プールとDRepのIDが両方ある場合、それらの条件はORで組み合わせます。matcherは、ブロックルールではプール条件、トランザクションルールではすべての条件、ガバナンスルールではアドレス、プール、DRep条件、DRep証明書ルールではDRep条件を受け付けます。ロールバックルールではCardano条件を指定できません。

この顧客はすべての宛先へブロックとロールバックを送信し、`local`宛先へトランザクションを送信します。

```json
{
  "id": "u1",
  "revision": 1,
  "destinations": [
    {
      "id": "local",
      "plugin": "log",
      "options": {
        "path": "u1.events.jsonl",
        "format": "json"
      }
    }
  ],
  "filters": [
    {
      "id": "blocks",
      "event_type": "input.block",
      "destination": "all"
    },
    {
      "id": "transactions",
      "event_type": "input.transaction",
      "destination": "local"
    },
    {
      "id": "rollbacks",
      "event_type": "input.rollback",
      "destination": "all"
    }
  ]
}
```

managed `log`宛先は、信頼できるローカルJSON追記ファイルへ書き込みます。ベース名は所有する顧客IDで始まり、その直後にピリオドを置く必要があります。Adderは開くファイルを限定し、その通常ファイルとしての識別情報を検証します。managed log宛先では、任意のパスやstdoutをペイロード宛先に指定できません。

### Webhook宛先と認証情報

Webhook宛先では、URLと任意の基本認証値に対して、バージョン付きの制限ファイル参照を使用します。

```json
{
  "id": "alerts",
  "plugin": "webhook",
  "options": {
    "format": "adder"
  },
  "credentials": {
    "url": {
      "file": "u1-alert-url-v1.json",
      "version": 1
    }
  },
  "limit_group": "alerts.example.com",
  "interval_ms": 1000
}
```

参照する認証情報ファイルには、所有する顧客、認証情報のversion、値を含めます。

```json
{
  "customer_id": "u1",
  "version": 1,
  "value": "https://alerts.example.com/incoming/SECRET"
}
```

認証情報参照はインスタンスが管理し、credentialsディレクトリ内に限定され、顧客間で共有できません。適用済み参照versionの内容は、顧客revisionが進んでも変更できません。認証情報をローテーションするには、新しいversionを公開します。オペレーターは、オペレータートークンファイルと同じ方法で認証情報ファイルを制限します。

AdderはWebhookの宛先、認証情報の紐付け、形式、承認済みホスト、ローカル宛先の例外、リダイレクト、プロバイダーのクォータグループを検証します。リダイレクト、環境プロキシ、プライベートまたは予約済みの宛先アドレス、拒否対象アドレスへのDNS変更、`state-path`、TLS検証のバイパス、未宣言のオプションは拒否します。`format=discord`には少なくとも2秒のintervalが必要です。

## 認証済み設定API

status、health、metricsを含むすべてのmanagedルートには、次のヘッダーが必要です。

```http
Authorization: Bearer <operator token>
```

Bearerトークンがない場合や無効な場合、Adderは`401 Unauthorized`を返し、`WWW-Authenticate: Bearer`を設定します。リクエストは読み込まれたトークンと公開済みファイルを使用します。reloadリクエストは、置換用の設定本文を受け付けません。

| リクエスト | 本文 | 結果 |
| --- | --- | --- |
| `POST /v1/config/reload` | `{"generation":2}` | 完全なmanifestを検証して準備し、1つのディスパッチ境界で切り替えます。顧客の追加と削除にはこのルートを使用します。 |
| `POST /v1/config/customers/{id}/reload` | `{"revision":2}` | manifestの顧客構成を変更せずに、既存の顧客を1つ再読み込みします。他の顧客は適用済みrevisionを保持します。 |
| `GET /v1/config/status` | None | 観測および適用済みgeneration、顧客revisionとcutover、検証エラー、宛先状態、カウンター、capability、ソース状態を返します。 |
| `GET /healthcheck` | None | ルーターのreadinessを返します。ソース接続と宛先の機能低下は別の状態シグナルです。 |
| `GET /metrics` | None | 顧客または認証情報のラベルを含まないmanagedカウンターの集計値を返します。 |

認証済みmanaged `/metrics`エンドポイントは、[メトリクスリファレンス](./010-metrics)で説明する通常パイプラインのメトリクスとは別です。通常の出力プラグインと通常の設定については、[出力連携ガイド](./008-output-integrations)を参照してください。managed modeではこれらのアダプターを有効にしません。

## Reloadとcutoverのセマンティクス

Adderはreloadを直列化し、新しい設定を検証してステージングしてから切り替えます。準備期限の既定値は10秒です。準備に失敗すると既存の設定をアクティブなままにして、ステージングしたプラグインをクリーンアップします。クリーンアップには最大5秒かかる場合があります。完了しないクリーンアップはmanaged作業予算に計上され続け、cleanup-pendingエラーを発生させる場合があります。

完全reloadルートには、想定するmanifest `generation`が必要です。対象を指定するreloadには、想定する顧客`revision`、既存の顧客、変更されていないmanifestの顧客構成が必要です。古いgenerationまたはrevision、incrementなしの内容変更、IDの不一致、不正なファイル、制限を超えるリソース予約があるとreloadに失敗します。適用済みgenerationまたはrevisionで同一内容を繰り返す処理は冪等です。対象指定のreloadでは顧客revisionが混在する場合があります。削除した顧客の最後に適用されたIDとrevisionはプロセスの存続中に予約され、再起動すると履歴は消去されます。

reloadが成功すると、`cutover_occurrence_id`を含むレスポンスを返します。Adderはロールバックや同一イベントの繰り返しを含むソースイベントに、単調増加するoccurrence IDを割り当てます。この値は設定の切り替え前に割り当てられた最後のソースoccurrenceを示します。切り替え後にイベントが到着しなくても返される場合があり、冪等な繰り返し処理では元のcutover値を返します。

`cutover_occurrence_id`はドレイン完了の確認ではなく、revisionがイベントを処理したことを示さず、外部配信を確認するものでもありません。顧客がすでに受け入れたイベントは、受け入れ時の設定revisionを保持します。顧客または宛先の削除、認証情報のローテーションは、古いrevisionのイベントが顧客キューに残っていても、古い宛先generationを取り消します。すでに送信した処理の結果は不明になる場合があります。

## キューの分離、制限、カウンター

managedディスパッチは、顧客ごとおよび宛先ごとに上限付きキューを使用します。各顧客には入力順を保持するフィルターワーカーが1つあり、宛先ワーカーは独立して動作します。遅い顧客が別の顧客のキュー許容量を消費することはありません。重複するルールは、occurrenceと宛先ごとに1つの送信へまとめ、該当するルールIDをソートします。Adderは一致を直ちに送信候補にし、定期的なフラッシュタイマーを使用しません。

managed routingの既定の上限は次のとおりです。

| リソース | 既定値 |
| --- | ---: |
| 顧客数 | `32` |
| 顧客ごとのルール数 | `32` |
| 顧客ごとの宛先数 | `8` |
| アクティブ、ステージング中、または終了処理中のプラグインインスタンス | `512` |
| 顧客ごとの入力キュー | `256` items |
| 宛先キュー | `256` items |
| イベントJSON表現 | `1 MiB` |
| キューごとの計上保持データ | `16 MiB` |
| プロセス全体のmanaged予約予算 | `512 MiB` |

Adderは設定を切り替える前にキュー容量を予約します。各キューは、エンコードしたイベントサイズの8倍に固定オーバーヘッドを加えた保守的な値を計上します。設定オブジェクト、該当ルールのメタデータ、プラグインチャネルのスロット、デコード済み認証情報、キューにイベントが残る廃止設定も、プロセス全体の予算を消費します。これらはルーティング作業の上限であり、プロセス全体のメモリ使用量を保証するものではありません。Goランタイムのオーバーヘッド、入力プラグインのバッファー、一時的なエンコーダーの割り当ては保証の対象外です。

キューが満杯になると新しい項目を破棄し、そのレーンのdropカウンターを増やします。リソースを予約できないreloadは切り替え前に失敗します。managed作業予算は診断メタデータも計上します。非同期キューは最大1,024件を保持し、プロセス予算が小さい場合は上限が低くなります。`diagnostic_dropped`はイベント損失とは別に、診断のオーバーフローを数えます。

statusとプロセス合計では、次のカウンターを区別します。

| カウンター | 意味 |
| --- | --- |
| `input_dropped` | 顧客レーンが受付時に拒否したイベント数。 |
| `matched` | ルールごとの一致数。 |
| `destination_dropped` | 宛先キューが拒否した項目数。 |
| `submitted_to_plugin` | managedプラグインのチャネルが受け付けた項目数。 |
| `plugin_errors` | プラグイン処理エラー数。 |
| `unknown_outcomes` | 外部結果が不明なままの送信数。 |
| `canceled` | 取り消しまたは停止がキャンセルした処理数。 |
| `diagnostic_dropped` | 診断キューがあふれたメタデータ診断数。 |

顧客カウンターは受付と一致を対象にします。宛先カウンターは送信と結果を対象にします。プロセス合計は削除された宛先のカウントを保持します。診断では`component=managed.router`を使用し、不透明な顧客ID、ルールID、revision、occurrence IDを含めますが、認証情報やイベントペイロードは含めません。

## 配信証跡、エラー、停止

managed配信は永続的でもexactly onceでもありません。プラグインチャネルは外部配信ではなく、処理の完了を報告します。完了オブザーバーは、一度に1つの未処理プラグインイベントを扱い、プラグインが処理を完了したことだけを監視します。そのため、プラグインチャネルが受け付けたことは、プロバイダーがイベントを受け入れた、保存した、または配信したことを証明しません。

accept後に接続が切れることで再試行と重複送信が発生する場合など、外部結果は不明なままになります。HTTPエラーとログ書き込みエラーは、別の診断として扱います。失敗した宛先やアクティブな作業予算を使い切った宛先は機能低下状態になりますが、別の顧客の宛先は独立して処理を続けます。

HTTP試行の期限は5秒です。managed宛先の処理には、共有クォータの待機時間を除き、15秒のアクティブ作業予算があります。Webhookの再試行には上限があります。プロバイダーの`429`レスポンスと`Retry-After`の値は、正規のターゲットauthorityに属する共有limit groupのすべての宛先を遅延させます。別のoriginは独立して進行します。設定した`interval_ms`は、再試行を含む試行間隔の最小値です。1つのauthorityグループに属するすべての宛先には同じintervalを設定します。ルートの削除とintervalの変更を設定で切り替えても、保留中のプロバイダー遅延は維持されます。このpilotはauthorityスコープのクォータをサポートします。異なるauthority間で共有するクォータが必要な出力には、専用アダプターが必要です。

停止は次の順序で実行します。

1. ソースの受付を停止します。
2. 既定で最大20秒間、受け付け済みのルーティング処理をドレインします。
3. 残りの処理をキャンセルします。
4. キャンセルしたワーカーを、さらに最大5秒間、または設定した停止タイムアウトの短い方まで待機します。

完了しないプラグインはcleanup-pendingエラーを返し、リソース予約を保持し、ワーカーが完了するまで同じルーターを再起動できないようにします。ログファイルはライターが終了してから閉じます。プラグイン処理が完了しても、送信済みの操作の結果は不明なままになる場合があります。起動中と停止中はreadinessがfalseです。1つの宛先の機能低下が、別の顧客のルートを停止したり、入力を再接続させたりすることはありません。

## Managedアダプターの機能

managed modeで使用できる宛先は`log`と`webhook`に限定されます。

| アダプター | managedでの扱い |
| --- | --- |
| `log` | 所有する顧客IDで始まり、その直後にピリオドを置いたベース名を持つ、信頼できるローカルJSON追記ファイルで有効です。 |
| `webhook` | `adder`または`discord`形式の1つの宛先、インスタンスが所有する認証情報、限定されたトランスポート、authorityクォータ、上限付き再試行で有効です。 |
| `slack`, `telegram`, `discord`, `matrix`, `signal`, `push` | botまたはサーバーのライフサイクル、複数宛先への送信、プロバイダーアカウントのクォータに専用アダプターが必要なため、managed modeでは拒否します。 |
| `sns`, `sqs`, `pubsub`, `s3`, `kafka`, `nats`, `mqtt`, `rabbitmq`, `redis`, `postgres`, `clickhouse`, `elasticsearch` | SDKまたはブローカーのバッファー、再試行、エンドポイント検出、認証情報、クォータ境界に専用アダプターが必要なため、managed modeでは拒否します。 |
| `notify`, `notify-json` | デスクトップとファイルへの副作用を顧客ごとに分離できないため、managed modeでは拒否します。 |

出力レジストリに登録されているだけでは、managed modeでアダプターを使用できません。managed modeで有効にするには、アダプターがライフサイクル、許可するイベント、複数宛先への配信、保持バッファー、レート制限、認証情報、宛先制限、観測可能な結果を定義する必要があります。

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>