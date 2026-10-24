---
title: LocalMessageSubmission のリプレイ保護
description: 認証付き LocalMessageSubmission メッセージのリプレイ保護と重複処理を設定します。
---

# LocalMessageSubmission のリプレイ保護

このガイドでは、gOuroboros `v0.213.7` の認証付き `LocalMessageSubmission` 経路におけるリプレイ保護を説明します。実行時の送信順序と、接続をまたいでメッセージ ID の重複を排除するための設定を扱います。

## 概要

サーバーは `Config` ごとのリプレイキャッシュを使用し、認証済みローカル DMQ メッセージ ID の元の `ExpiresAt` が有効な間に、同じ ID が複数回処理されることを防ぎます。新しい予約を処理する際に、期限切れ ID を削除します。

この動作は [gOuroboros `v0.213.7`](https://github.com/blinklabs-io/gouroboros/releases/tag/v0.213.7) で利用できます。パッケージのリファレンスは [gOuroboros API ドキュメント](https://pkg.go.dev/github.com/blinklabs-io/gouroboros)にあります。

## 設定

`localmessagesubmission.NewConfig` で `Config` を作成し、サーバーのコールバック、メッセージ認証、TTL 検証、リプレイ容量を明示的に設定します。

```go
cfg := localmessagesubmission.NewConfig(
	localmessagesubmission.WithSubmitMessageFunc(submitMessage),
	localmessagesubmission.WithAuthenticator(authenticator),
	localmessagesubmission.WithTTLValidator(ttlValidator),
	localmessagesubmission.WithMaxReplayEntries(10000),
)
```

`WithMaxReplayEntries` は、期限切れまで保持する認証済みメッセージ ID の最大数を制御します。コールバックの同時実行数や、アクティブな接続数は制限しません。

### 接続間で 1 つの設定を使用する

接続受け入れループの外で 1 つの `Config` を作成し、すべての `LocalMessageSubmission` サーバーに渡します。同じ `Config` のコピーはリプレイ状態を共有します。`localmessagesubmission.NewConfig` を別々に呼び出すと、別々のリプレイ状態が作られるため、同じメッセージ ID の重複を排除できません。

```go
cfg := localmessagesubmission.NewConfig(
	localmessagesubmission.WithSubmitMessageFunc(submitMessage),
	localmessagesubmission.WithAuthenticator(authenticator),
	localmessagesubmission.WithTTLValidator(ttlValidator),
	localmessagesubmission.WithMaxReplayEntries(10000),
)

// Create each connection's LocalMessageSubmission server with &cfg.
// Do not call NewConfig inside this loop.
for {
	conn := acceptConnection()
	startLocalMessageSubmission(conn, &cfg)
}
```

例の接続設定関数は、ホストアプリケーションの接続管理を表します。重要なのは、すべてのサーバーがループ前に作成した同じ `Config` 値を受け取ることです。

### 容量と有効期限

- `MaxReplayEntries` が 0 または未設定の場合、既定値は `10,000` です。
- `localmessagesubmission.WithMaxReplayEntries(...)` で、保持する認証済みメッセージ ID 数の上限を変更します。
- サーバーは、新しい予約を処理する際に `ExpiresAt` を過ぎた ID を削除します。
- キャッシュが上限に達すると、既存の項目の期限が切れて削除されるまで、新しいメッセージ ID を拒否します。
- 負の値は無効です。サーバーは `SubmitMessageFunc` を呼び出す前に送信を拒否します。

容量不足と不正な設定による失敗には専用エラーコードを使用せず、`pcommon.OtherReason` によるプロトコル拒否を返します。

## 送信時の動作

認証付きローカル DMQ 送信では、サーバーは次の順に処理します。

1. メッセージの TTL を検証します。
2. メッセージを準備し、認証します。
3. 送信時刻を使って TTL を再度検証します。
4. リプレイキャッシュ内でメッセージ ID を予約します。
5. 予約に成功した場合にのみ `SubmitMessageFunc` を呼び出します。

認証と TTL 検証に合格した送信だけが、リプレイキャッシュに入ります。予約は `SubmitMessageFunc` の前に行い、同じ設定を共有する同時送信では、ミューテックスによって予約をアトミックに行います。

### 重複した送信

最初の有効な送信はメッセージ ID を予約し、`SubmitMessageFunc` に進むことができます。その後の重複した送信には `pcommon.AlreadyReceivedReason` を返し、その重複分のコールバックを呼び出しません。

同じ ID の同時送信にも同じルールを適用します。最初に ID を予約した送信だけが `SubmitMessageFunc` に進むことができ、それ以外はすべて `pcommon.AlreadyReceivedReason` を受け取り、コールバックには到達しません。1 つの `Config` を再利用する異なる接続を通して送信された場合も同じです。

サーバーは元の `ExpiresAt` を過ぎるまで ID の予約を保持します。最初の送信を `SubmitMessageFunc` が拒否しても、その結果によって予約は解放されません。後続の送信は同じ ID をすぐには再利用できず、有効期限が切れるまで待つ必要があります。

## 拒否時の動作

外部から確認できる結果は次のとおりです。

| 条件 | 結果 | コールバックの呼び出し |
| --- | --- | --- |
| 有効、認証済み、期限内の ID で容量に空きがある | ID を予約し、送信を処理します。 | `SubmitMessageFunc` を 1 回実行します。 |
| ID が予約済みで期限内 | `pcommon.AlreadyReceivedReason` で拒否します。 | 実行しません。 |
| 新規 ID に対してキャッシュが `MaxReplayEntries` に達している | `pcommon.OtherReason` で拒否します。 | 実行しません。 |
| `MaxReplayEntries` が負 | `pcommon.OtherReason` で拒否します。 | 実行しません。 |
| TTL 検証または認証に失敗 | 検証または認証の結果に従って拒否します。 | 実行しません。 |

期限切れ ID は、以前の予約が削除された後に再びキャッシュに入ることができます。有効な予約が残る重複 ID は、最初のコールバックがメッセージを受け入れたか拒否したかに関係なく、アプリケーションのコールバックに到達しません。


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
