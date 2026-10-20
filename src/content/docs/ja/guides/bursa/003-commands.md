---
title: コマンドラインガイド
description: Bursaコマンドラインガイド。
---

これでコマンドラインを使用してCardanoウォレットを作成し、ウォレット管理に必要なすべてのファイルを出力できます。また、APIを起動してAPI Swaggerドキュメントにアクセスすることもできます。

Bursaは、マルチシグネチャスクリプト、ハッシュ、鍵の生成にも使用できます。これにはCardanoステークプールの運用に必要な鍵や証明書も含まれます。

現在、Bursaが実行できるコマンドのカテゴリは11個あり、Cardanoユーザーにとって強力なツールとなっています。

> **Bursaコマンドカテゴリ**
> 1. [wallet](#wallet) &nbsp; - Cardanoウォレットの管理に必要なウォレットおよびファイルを生成するコマンド
> 2. [api](#api)  &emsp;&nbsp;&nbsp; - APIを実行するコマンド
> 3. [kes-agent](#kes-agent) &emsp;&nbsp;&nbsp; - KESエージェントを実行するコマンド
> 4. [cert](../004-cert-commands)   &emsp;&nbsp; - 各種Cardano証明書を生成するコマンド
> 5. [hash](../005-hash-commands)  &nbsp;&nbsp;&nbsp; - Cardanoで使用される暗号ハッシュを生成するコマンド
> 6. [script](../006-script-commands) &nbsp;&nbsp; - マルチシグネチャ操作用のコマンド
> 7. [address](../007-address-commands) - Cardanoアドレスを操作するコマンド
> 8. [key](../008-key-commands)  &emsp;&nbsp;&nbsp; - ニーモニックから個別の鍵を導出するコマンド
> 9. [tx](#tx) - オフライントランザクション操作
> 10. [sign](#sign) - CIP-8/CIP-30メッセージの署名と検証
> 11. [signer](#signer) - リモート署名サービス

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

### ウォレットの復元と確認

保護されたファイルから既存のBIP-39ニーモニックを読み込み、生成された鍵ファイルを確認します。

```sh
./bursa wallet restore --mnemonic-file dev/seed.txt --output restored-wallet
./bursa wallet load --dir restored-wallet
```

`--output` を指定するとアドレスと鍵ファイルを書き出し、省略するとアドレスのみをログに出力します。復元ではニーモニックを出力先にコピーしません。ニーモニックと署名鍵ファイルは非公開で安全にバックアップしてください。ニーモニックの入力元は、非推奨の `--mnemonic`、`MNEMONIC` 環境変数、`--mnemonic-file`、デフォルトの `seed.txt` ファイルの順で確認されます。`--mnemonic-file` を使う場合は `MNEMONIC` を解除してください。`--mnemonic` と `--password` 引数は他のローカルユーザーに見えるため非推奨です。代わりに `--mnemonic-file` と `--password-file` を使用してください。BIP-39パスワードを使って導出したウォレットには `--password-file /path/to/password.txt` を指定します。これは鍵の導出用パスワードであり、出力ファイルの暗号化ではありません。

`wallet load` は既存の鍵ファイルを読み込み、新しいウォレットを導出しません。秘密鍵の16進数は標準では非表示で、`--show-secrets` を明示すると表示されます。各オプションは `./bursa wallet restore --help` と `./bursa wallet load --help` で確認できます。

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

ループバック以外でAPIを公開する場合のTLSとBearer認証の要件は、[設定リファレンス](../009-configuration-reference)を参照してください。

<a name="kes-agent"></a>

## コマンドラインで `kes-agent` を起動

`kes-agent` は `serve-key` または `sign` モードで起動します。設定ファイルは、以下のコマンドの `--config` フラグで指定します。

```
./bursa kes-agent --config /path/to/kes-agent.yaml
```

`--config` にはYAML設定ファイルのパスを指定します。フラグを省略した場合は、`BURSA_CONFIG` 環境変数で設定ファイルのパスを指定できます。

`kes-agent` のモード、ソケット、鍵、タイミング設定については[設定リファレンス](../009-configuration-reference)を参照してください。

***

<a name="tx"></a>

## オフライントランザクション操作

`tx` コマンドはノードに接続せず、既存のトランザクションを確認して署名します。`unsigned.tx` には16進数CBOR、または `cborHex` を含むJSONテキストエンベロープを指定します。

```sh
./bursa tx decode --tx-file unsigned.tx
./bursa tx id --tx-file unsigned.tx
./bursa tx sign --tx-file unsigned.tx \
  --signing-key-file dev/payment.skey --out-file signed.tx
```

複数の署名鍵を使うには `--signing-key-file` を繰り返します。別々に署名する場合は、分離したウィットネスを作成し、同じトランザクションに結合します。

```sh
./bursa tx witness --tx-file unsigned.tx \
  --signing-key-file dev/payment.skey --out-file payment.witness
./bursa tx assemble --tx-file unsigned.tx \
  --witness-file payment.witness --out-file assembled.tx
```

追加のウィットネスには `--witness-file` を繰り返します。署名、ウィットネス作成、結合はJSONテキストエンベロープを `--out-file` に書き出し、省略時は標準出力に表示します。`tx decode --protocol-params protocol-parameters.json` はCardanoプロトコルパラメータのJSONファイルから最小手数料も推定します。オプションは `./bursa tx --help` と各サブコマンドの `--help` で確認できます。

<a name="sign"></a>

## メッセージの署名と検証

`sign data` はCIP-8/CIP-30 COSE署名と公開鍵をJSONで出力します。`ADDRESS_HEX` には署名鍵に対応するアドレスのバイト列を16進数で設定します（Bech32アドレス文字列ではありません）。署名後、返された `signature` と `key` の値を `SIGNATURE_HEX` と `COSE_KEY_HEX` に設定します。

```sh
./bursa sign data --address "$ADDRESS_HEX" --payload 'Hello Cardano' \
  --signing-key-file dev/payment.skey
./bursa sign verify --signature "$SIGNATURE_HEX" --key "$COSE_KEY_HEX" \
  --payload 'Hello Cardano'
```

バイナリデータには `--payload` の代わりに `--payload-hex` を使います。期待するペイロードを指定した検証は、成功時に `VALID` を表示し、失敗時はエラーで終了します。

<a name="signer"></a>

## リモート署名サービスの起動

`signer` コマンドは、カストディバックエンド、呼び出し元の権限、鍵ポリシー、二重署名防止ウォーターマークの設定に従い、認証されたリモート署名リクエストを処理します。

```sh
./bursa signer --config /path/to/signer.yaml
```

`--config` を省略すると、`BURSA_CONFIG` がYAMLファイルを選択します。認証方式を少なくとも1つ設定してください。JWT Bearer、mTLSクライアント証明書、登録鍵によるリクエスト署名に対応しています。起動前に[署名サービス運用ガイド](https://github.com/blinklabs-io/bursa/blob/main/docs/signer/runbook.md)を参照し、[設定例](https://github.com/blinklabs-io/bursa/blob/main/docs/signer/signer.example.yaml)のカストディ、認証、TLS、呼び出し元の権限、永続ウォーターマークを調整してください。[署名サービス概要](https://github.com/blinklabs-io/bursa/blob/main/docs/signer/README.md)にはAPI仕様とセキュリティガイドへのリンクがあります。

***

その他のBursaコマンドを探索

> **Bursaコマンドカテゴリ**
> 1. [wallet](#wallet) &nbsp; - Cardanoウォレットの管理に必要なウォレットおよびファイルを生成するコマンド
> 2. [api](#api)  &emsp;&nbsp;&nbsp; - APIを実行するコマンド
> 3. [kes-agent](#kes-agent) &emsp;&nbsp;&nbsp; - KESエージェントを実行するコマンド
> 4. [cert](../004-cert-commands)   &emsp;&nbsp; - 各種Cardano証明書を生成するコマンド
> 5. [hash](../005-hash-commands)  &nbsp;&nbsp;&nbsp; - Cardanoで使用される暗号ハッシュを生成するコマンド
> 6. [script](../006-script-commands) &nbsp;&nbsp; - マルチシグネチャ操作用のコマンド
> 7. [address](../007-address-commands) - Cardanoアドレスを操作するコマンド
> 8. [key](../008-key-commands)  &emsp;&nbsp;&nbsp; - ニーモニックから個別の鍵を導出するコマンド
> 9. [tx](#tx) - オフライントランザクション操作
> 10. [sign](#sign) - CIP-8/CIP-30メッセージの署名と検証
> 11. [signer](#signer) - リモート署名サービス

***


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
