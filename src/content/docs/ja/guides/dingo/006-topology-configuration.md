---
title: Dingoのトポロジー設定
description: Dingoのtopology.jsonに対するアクセス先とルートのvalency検証を説明する。
---

# Dingoのトポロジー設定

このページでは、Dingoが`topology.json`を読み込むときに検証するトポロジー設定を説明します。対象は、`localRoots[*].accessPoints[*]`、`publicRoots[*].accessPoints[*]`、`bootstrapPeers[*]`の3つのコレクションです。

## 検証のタイミング

Dingoは、`topology.json`をJSONとして読み込んだ後、設定を返す前にトポロジーを検証します。検証に失敗した設定は読み込み時に拒否されます。

## アクセス先の検証

次のJSONパスにある各エントリを検証します。

- `localRoots[*].accessPoints[*]`
- `publicRoots[*].accessPoints[*]`
- `bootstrapPeers[*]`

各アクセス先には、次の条件が適用されます。

- `address`には、空文字列や空白だけの値を指定できません。
- `port`には、`1`から`65535`までの範囲にあるTCPポートを指定します。`1`と`65535`は指定できます。

検証エラーには、対象のコレクションと配列インデックスが含まれます。たとえば、`localRoots[0].accessPoints[1]`や`bootstrapPeers[0]`のように、影響を受けたエントリを特定できます。

## ルートの`warmValency`と`valency`

`localRoots`と`publicRoots`の各ルートには、次の条件が適用されます。

- `warmValency`が`0`ではない場合、`warmValency`は`valency`以下である必要があります（`warmValency <= valency`）。
- `accessPoints`が空ではない場合、`valency`は`accessPoints`のエントリ数以下である必要があります（`valency <= len(accessPoints)`）。
- `accessPoints`が空のリストでも有効です。空のリストの場合、`valency`と`accessPoints`のエントリ数は比較しません。ただし、`warmValency`が`0`ではない場合の`warmValency <= valency`の条件は適用されます。

`bootstrapPeers`にはアクセス先の検証だけを適用します。`bootstrapPeers`には`warmValency`と`valency`の検証を適用しません。

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>