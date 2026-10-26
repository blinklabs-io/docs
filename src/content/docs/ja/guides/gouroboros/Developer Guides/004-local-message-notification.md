---
title: LocalMessageNotification の設定
description: LocalMessageNotification クライアントのリプレイ ID 保持数と容量動作を設定します。
---

# LocalMessageNotification の設定

このガイドでは、gOuroboros の `LocalMessageNotification` クライアントにおけるリプレイ保護の設定と容量動作を説明します。

## 概要

`localmessagenotification.Config.MaxReplayEntries` は、クライアントが保持する、受け入れ済みメッセージ ID の最大数を指定します。

## 設定

`localmessagenotification.NewConfig` に `localmessagenotification.WithMaxReplayEntries` を渡して、通知クライアントのリプレイ ID 上限を設定します。

```go
cfg := localmessagenotification.NewConfig(
	localmessagenotification.WithMaxReplayEntries(200000),
)
```

オプションを省略するか `MaxReplayEntries` を `0` にすると、既定値の `126976` 件を使用します。`WithMaxReplayEntries` に正の値を渡すと、クライアントは指定した値を上限として使用します。

## 容量と有効期限

- この既定値は、ステークプールごとの未期限切れメッセージ `31` 件を `4096` プール分保持できる値です。
- クライアントは、受け入れ済みメッセージ ID を署名付きの有効期限まで保持します。未期限切れの ID を先に削除して空きを作ることはありません。
- 返信に含まれる新しいメッセージを加えると上限を超える場合、クライアントは返信全体を容量エラーで拒否します。
- 拒否した返信のメッセージは、コールバックへ渡さず、記録もしません。クライアントは容量エラーで接続を閉じます。
- 受け入れ済み ID が十分な数だけ期限切れになるまで、後続の返信も処理できません。

---
 
<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>