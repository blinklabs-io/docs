---
title: アドレスコマンドラインガイド
description: Cardanoアドレスを扱うためのBursaコマンドラインガイド。
---

<a name="address"></a>

Cardanoアドレスを扱うためのBursaコマンドラインガイド。

## アドレス
Bursaは、`build`コマンドを通じて支払い検証鍵からCardanoウォレットアドレスを生成するために使用できます。Bursaは、`info`を使用してアドレスをパースし、その構成要素を表示することもできます。

> **BursaはすべてのCIP-0019アドレスタイプをサポートしています:**
> - ベースアドレス (支払い + ステーク認証情報)
> - エンタープライズアドレス (支払いのみ)
> - ポインタアドレス (支払い + ステークポインタ)
> - 報酬アドレス (ステークのみ)
> - Byron/ブートストラップアドレス (レガシー)

### アドレスの作成
- ベースアドレス (支払い + ステーク認証情報)
```bash
./bursa address build --payment-key addr_vk1... --stake-key stake_vk1... --network mainnet
```

- エンタープライズアドレス (支払いのみ)
エンタープライズアドレスには支払い認証情報のみが含まれ、ステーク認証情報は含まれません。
ステーキング委任のないシンプルな支払いに役立ちます。

```bash
./bursa address build --payment-key addr_vk1... --network mainnet --type enterprise
```

- 報酬アドレス (ステークのみ)
```bash
./bursa address build --stake-key stake_vk1... --network mainnet --type reward
```

#### アドレス情報
`address info`コマンドを使用してCardanoアドレスに関する情報を表示できます。
認証情報はbech32形式とhex形式の両方で表示されます。

- ベースアドレスの例:
```bash
./bursa address info addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer...
  ```

- ステークアドレスの例:
```bash
./bursa address info stake1uy9ggsc9qls4pu46g9...
```

***

その他のBursaコマンドを探索

> **Bursaコマンドカテゴリ**
> 1. [wallet](../003-commands) &nbsp; - Cardanoウォレットの管理に必要なウォレットおよびファイルを生成するコマンド
> 2. [api](../003-commands)  &emsp;&nbsp;&nbsp; - APIを実行するコマンド
> 3. [cert](../004-cert-commands)   &emsp;&nbsp; - 各種Cardano証明書を生成するコマンド
> 4. [hash](../005-hash-commands)  &nbsp;&nbsp;&nbsp; - Cardanoで使用される暗号ハッシュを生成するコマンド
> 5. [script](../006-script-commands) &nbsp;&nbsp; - マルチシグネチャ操作用のコマンド
> 6. [address](#address) - Cardanoアドレスを操作するコマンド
> 7. [key](../008-key-commands)  &emsp;&nbsp;&nbsp; - ニーモニックから個別の鍵を導出するコマンド

***
