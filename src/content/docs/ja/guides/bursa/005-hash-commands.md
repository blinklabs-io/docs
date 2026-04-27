---
title: Hashコマンドラインガイド
description: Cardanoで使用される暗号ハッシュを生成するためのBursaコマンドラインガイド。
---

<a name="hash"></a>

Cardanoで使用される暗号ハッシュを生成するためのBursaコマンドラインガイド。

## メタデータファイルやアンカーデータのハッシュを作成
Bursaを使用して、Cardanoのガバナンスやステークプール運用でよく使われるメタデータまたはanchor-dataのハッシュを作成できます。

> **ハッシュの種類:**
> - metadata - プール/DRepメタデータJSONのBlake2b-256ハッシュ <br>
> - anchor-data - アンカーデータ(憲法、ガバナンス提案)のBlake2b-256ハッシュ

#### メタデータ
hash metadataコマンドは、プールおよびDRepメタデータの登録に使用されます。
ハッシュは正規のJSON表現から計算されます。

**サポートされているメタデータの種類:**
  - pool: プール登録メタデータ
  - drep: DRep登録メタデータ

**プールメタデータコマンドの例**
```bash
./bursa hash metadata pool-metadata.json
```

#### アンカーデータ
hash anchor-dataコマンドは、Cardanoガバナンスで使用されるアンカーデータのBlake2b-256ハッシュを生成するために使用されます。

たとえば、憲法、ガバナンス提案、その他のオンチェーンガバナンスアクションにアンカーされるドキュメント用のアンカーデータハッシュを作成したい場合があります。

**anchor-dataコマンドの例**
```bash
./bursa hash anchor-data --file-text constitution.txt
```

***

その他のBursaコマンドを探索

> **Bursaコマンドカテゴリ**
> 1. [wallet](../003-commands) &nbsp; - Cardanoウォレットの管理に必要なウォレットおよびファイルを生成するコマンド
> 2. [api](../003-commands)  &emsp;&nbsp;&nbsp; - APIを実行するコマンド
> 3. [cert](../004-cert-commands)   &emsp;&nbsp; - 各種Cardano証明書を生成するコマンド
> 4. [hash](#hash)  &nbsp;&nbsp;&nbsp; - Cardanoで使用される暗号ハッシュを生成するコマンド
> 5. [script](../006-script-commands) &nbsp;&nbsp; - マルチシグネチャ操作用のコマンド
> 6. [address](../007-address-commands) - Cardanoアドレスを操作するコマンド
> 7. [key](../008-key-commands)  &emsp;&nbsp;&nbsp; - ニーモニックから個別の鍵を導出するコマンド

***
