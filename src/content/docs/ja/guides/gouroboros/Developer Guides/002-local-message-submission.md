---
title: LocalMessageSubmissionのリプレイ保護
description: gOuroboros v0.213.7におけるLocalMessageSubmissionのリプレイ保護と設定方法。
---

## 概要

このガイドでは、gOuroboros v0.213.7で追加された認証済み`LocalMessageSubmission`メッセージのリプレイ保護について説明します。リプレイ保護は、メッセージの`ExpiresAt`が過ぎるまで、認証済みメッセージIDを保持します。

有効期限内の同じメッセージIDを受信すると、最初に予約に成功した送信だけが`SubmitMessageFunc`に到達します。サーバーは、アプリケーションコールバックを実行する前にIDを予約し、同じIDの後続送信を拒否します。

詳細は[`LocalMessageSubmission` APIリファレンス](https://pkg.go.dev/github.com/blinklabs-io/gouroboros/protocol/localmessagesubmission)と、[gOuroboros v0.213.7のリリース情報](https://github.com/blinklabs-io/gouroboros/releases/tag/v0.213.7)を参照してください。

## 設定

`Config.MaxReplayEntries`は、期限切れになるまで保持する認証済みメッセージIDの最大数を指定します。`NewConfig`は既定値として`10,000`を設定します。`localmessagesubmission.WithMaxReplayEntries(...)`を使用すると、保持数を変更できます。

```go
config := localmessagesubmission.NewConfig(
	localmessagesubmission.WithMaxReplayEntries(10000),
)
```

接続をまたぐリプレイ状態が必要な場合は、`Config`を接続の受け付けループの外側で構築します。共有方法の詳細は「接続間での利用」を参照してください。

## 接続間での利用

ホストが複数の接続を処理する場合、1つの`Config`インスタンスをすべての`LocalMessageSubmission`サーバーに渡します。同じ`Config`から作成した接続は、認証済みメッセージIDの予約状態を共有します。そのため、ある接続で受け付けたIDを別の接続から再送しても、`SubmitMessageFunc`には到達しません。

`NewConfig`を接続ごとに呼び出すと、各設定が別々のリプレイ状態を持ちます。別々の`Config`インスタンスは重複を相互に検出しないため、接続の受け付けループ内で`NewConfig`を呼び出さないでください。

## 拒否される送信

- 同じメッセージIDを有効期限内に再送すると、サーバーは`pcommon.AlreadyReceivedReason`で拒否します。連続した再送と、共有された`Config`を使う接続からの同時送信のどちらも同じ動作になります。
- サーバーは、リプレイ状態から期限切れのIDを削除してから新しいIDを予約します。`MaxReplayEntries`に達した場合、期限切れのIDが削除されるまで新しいIDを拒否します。
- `MaxReplayEntries`に`1`未満の値を設定すると、サーバーは送信をアプリケーションコールバックへ渡す前に拒否します。

リプレイ保護は認証と有効期限の検証を通過したメッセージに適用します。予約に成功したIDだけが`SubmitMessageFunc`へ進み、コールバックが受け付けた場合はサーバーがメッセージを受け付けます。コールバックが拒否した場合も、予約済みIDは`ExpiresAt`までリプレイ保護の対象になります。