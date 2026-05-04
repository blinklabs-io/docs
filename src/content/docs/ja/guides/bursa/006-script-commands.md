---
title: スクリプトコマンドラインガイド
description: マルチシグネチャ操作のためのBursaコマンドラインガイド。
---

<a name="script"></a>

マルチシグネチャ操作のためのBursaコマンドラインガイド。

## マルチシグネチャ操作用のコマンド
Bursaは、マルチシグネチャスクリプトの生成にも使用できます。Bursaのscriptコマンドには3つのコマンドタイプがあります。

> **scriptコマンドの種類:**
>  - **create:** 新しいマルチシグネチャスクリプトを作成
>  - **validate:** 署名およびスロットに対してスクリプトを検証
>  - **address:** スクリプトからメインネットアドレスを生成

#### マルチシグネチャスクリプトの作成

- 2-of-3マルチシグスクリプトを作成

```
./bursa script create --required 2 --key-hashes abcdef1234567890abcdef1234567890abcdef12,abcdef1234567890abcdef1234567890abcdef13,abcdef1234567890abcdef1234567890abcdef14
```

- 全署名者必須スクリプトを作成

```
./bursa script create --all --key-hashes abcdef1234567890abcdef1234567890abcdef12,abcdef1234567890abcdef1234567890abcdef13
```

- いずれかの署名者で有効なスクリプトを作成

```
./bursa script create --any --key-hashes abcdef1234567890abcdef1234567890abcdef12,abcdef1234567890abcdef1234567890abcdef13,abcdef1234567890abcdef1234567890abcdef14
```

- タイムロックスクリプトを作成 (スロット1000000以降に有効)

```
./bursa script create --required 2 --key-hashes abcdef1234567890abcdef1234567890abcdef12,abcdef1234567890abcdef1234567890abcdef13 --timelock-after 1000000
```

***

その他のBursaコマンドを探索

> **Bursaコマンドカテゴリ**
> 1. [wallet](../003-commands) &nbsp; - Cardanoウォレットの管理に必要なウォレットおよびファイルを生成するコマンド
> 2. [api](../003-commands)  &emsp;&nbsp;&nbsp; - APIを実行するコマンド
> 3. [cert](../004-cert-commands)   &emsp;&nbsp; - 各種Cardano証明書を生成するコマンド
> 4. [hash](../005-hash-commands)  &nbsp;&nbsp;&nbsp; - Cardanoで使用される暗号ハッシュを生成するコマンド
> 5. [script](#script) &nbsp;&nbsp; - マルチシグネチャ操作用のコマンド
> 6. [address](../007-address-commands) - Cardanoアドレスを操作するコマンド
> 7. [key](../008-key-commands)  &emsp;&nbsp;&nbsp; - ニーモニックから個別の鍵を導出するコマンド

***
