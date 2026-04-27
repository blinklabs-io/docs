---
title: コマンドラインガイド
description: Bursaコマンドラインガイド。
---

これでコマンドラインを使用してCardanoウォレットを作成し、ウォレット管理に必要なすべてのファイルを出力できます。また、APIを起動してAPI Swaggerドキュメントにアクセスすることもできます。

Bursaは、マルチシグネチャスクリプト、ハッシュ、鍵の生成にも使用できます。これにはCardanoステークプールの運用に必要な鍵や証明書も含まれます。

現在、Bursaが実行できるコマンドのカテゴリは7つあり、Cardanoユーザーにとって強力なツールとなっています。

> **Bursaコマンドカテゴリ**
> 1. [wallet](#wallet) &nbsp; - Cardanoウォレットの管理に必要なウォレットおよびファイルを生成するコマンド
> 2. [api](#api)  &emsp;&nbsp;&nbsp; - APIを実行するコマンド
> 3. [cert](../004-cert-commands)   &emsp;&nbsp; - 各種Cardano証明書を生成するコマンド
> 4. [hash](../005-hash-commands)  &nbsp;&nbsp;&nbsp; - Cardanoで使用される暗号ハッシュを生成するコマンド
> 5. [script](../006-script-commands) &nbsp;&nbsp; - マルチシグネチャ操作用のコマンド
> 6. [address](../007-address-commands) - Cardanoアドレスを操作するコマンド
> 7. [key](../008-key-commands)  &emsp;&nbsp;&nbsp; - ニーモニックから個別の鍵を導出するコマンド

***

<a name="wallet"></a>

## コマンドラインでウォレットを作成しウォレットファイルを出力

コマンドラインを使用してウォレットを作成し、Cardanoウォレット管理に必要なすべてのファイルを出力できます。

この例では、`--output`フラグを使用して出力先ディレクトリを指定し、`dev`フォルダにウォレットファイルを作成します。

```
./bursa wallet create --output dev
```

![bursa-wallet-create-with-output-string](/bursa-wallet-create-with-output-string.png)

これで`dev`ディレクトリにすべてのウォレットファイルが作成されます。

![bursa-wallet-files](/bursa-wallet-files.png)

***

<a name="api"></a>

## コマンドラインでAPIを起動

APIを使用したい場合は、以下のコマンドを実行してコマンドラインから起動できます。

```
./bursa api
```

![bursa-start-api](/bursa-start-api.png)

## API Swaggerドキュメントにアクセス

IP:port/swagger/index.htmlにアクセスしてBursa APIを確認できます。必要に応じてIPとポートを調整してください。

```
http://localhost:8080/swagger/index.html
```

![bursa-swagger](/bursa-swagger.png)

***

その他のBursaコマンドを探索

> **Bursaコマンドカテゴリ**
> 1. [wallet](#wallet) &nbsp; - Cardanoウォレットの管理に必要なウォレットおよびファイルを生成するコマンド
> 2. [api](#api)  &emsp;&nbsp;&nbsp; - APIを実行するコマンド
> 3. [cert](../004-cert-commands)   &emsp;&nbsp; - 各種Cardano証明書を生成するコマンド
> 4. [hash](../005-hash-commands)  &nbsp;&nbsp;&nbsp; - Cardanoで使用される暗号ハッシュを生成するコマンド
> 5. [script](../006-script-commands) &nbsp;&nbsp; - マルチシグネチャ操作用のコマンド
> 6. [address](../007-address-commands) - Cardanoアドレスを操作するコマンド
> 7. [key](../008-key-commands)  &emsp;&nbsp;&nbsp; - ニーモニックから個別の鍵を導出するコマンド

***
