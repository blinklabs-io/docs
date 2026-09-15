---
title: Dingoのトポロジー設定
description: Dingoのtopology.jsonに対するアクセス先とルートのvalency検証を説明する。
---

# Dingoのトポロジー設定

このページでは、Dingoが`topology.json`を読み込むときに検証するトポロジー設定を説明します。対象は、`localRoots[*].accessPoints[*]`、`publicRoots[*].accessPoints[*]`、`bootstrapPeers[*]`の3つの設定項目群です。

## 検証のタイミング

Dingoは、`topology.json`をJSONとして読み込んだ後、設定を返す前にトポロジーを検証します。検証に失敗した設定を読み込み時に拒否します。

## アクセス先の検証

次のJSONパスにある各エントリを検証します。

- `localRoots[*].accessPoints[*]`
- `publicRoots[*].accessPoints[*]`
- `bootstrapPeers[*]`

Dingoは各アクセス先に次の条件を適用します。

- `address`には、空文字列や空白だけの値を指定できません。
- `port`には、`1`から`65535`までの範囲にあるTCPポートを指定します。`1`と`65535`は指定できます。

Dingoは検証エラーに対象の設定項目群と配列インデックスを含めます。たとえば、`localRoots[0].accessPoints[1]`や`bootstrapPeers[0]`のように、影響を受けたエントリを特定できます。

## ルートの`warmValency`と`valency`

Dingoは`localRoots`と`publicRoots`の各ルートに次の条件を適用します。

- `warmValency`が`0`ではない場合、`warmValency`は`valency`以下である必要があります（`warmValency <= valency`）。
- `accessPoints`が空ではない場合、`valency`は`accessPoints`のエントリ数以下である必要があります（`valency <= len(accessPoints)`）。
- `accessPoints`が空のリストでも有効です。空のリストの場合、`valency`と`accessPoints`のエントリ数は比較しません。ただし、`warmValency`が`0`ではない場合の`warmValency <= valency`の条件は適用されます。

Dingoは`bootstrapPeers`にアクセス先の検証だけを適用します。`bootstrapPeers`では`warmValency`と`valency`を検証しません。

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>