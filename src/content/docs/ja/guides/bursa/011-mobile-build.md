---
title: Bursaモバイルビルドリファレンス
description: BursaのAndroidとiOSモバイルビルドに必要な設定とCI検証。
---

## 概要

このガイドは、BursaのAndroidおよびiOSビルドを再現するための設定とCI検証を説明します。AndroidはビルドコンテナでAPKとAABを生成し、iOSはmacOS上でフレームワークとシミュレータ用アプリを生成します。

## Androidビルド

### ビルドモード

Androidビルドは、リポジトリを`/code`へ、任意の出力先を`/out`へマウントしたビルドコンテナで実行します。`BURSA_BUILD_TYPE`でビルドモードを選択します。

| `BURSA_BUILD_TYPE` | 生成物 | 署名要件 |
| --- | --- | --- |
| `debug` | 未署名のデバッグAPK | 不要 |
| `release` | 署名済みのリリースAPKとAAB | 既存のキーストアと4つの`BURSA_*`環境変数が必要 |

`BURSA_BUILD_TYPE=debug`では、コンテナが`assembleDebug`を実行し、デバッグAPKを`/out`へコピーします。`release`では、コンテナが`assembleRelease bundleRelease`を実行し、リリースAPKとAABを生成します。

### リリース署名

`release`を選択する場合、次の環境変数をすべて指定し、`BURSA_KEYSTORE_PATH`が既存のキーストアを指すようにします。

- `BURSA_KEYSTORE_PATH`
- `BURSA_KEYSTORE_PASSWORD`
- `BURSA_KEY_ALIAS`
- `BURSA_KEY_PASSWORD`

署名情報がない場合、ビルドは失敗します。ビルドは未署名APKを配布可能な成果物として扱わず、署名済みAPKだけを選択して`apksigner verify --verbose --print-certs`で検証します。署名済みAPKまたはAABを生成できない場合や、`apksigner`の検証に失敗した場合も、ビルドは失敗します。

CIでは、次のシークレットを使用します。

- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

CIは`ANDROID_KEYSTORE_BASE64`をデコードして一時ディレクトリ内にキーストアを作成し、そのファイルをコンテナ内の`/signing/release.jks`へ読み取り専用でマウントします。CIはそのパスを`BURSA_KEYSTORE_PATH`としてコンテナに渡し、残りのシークレットをそれぞれ`BURSA_KEYSTORE_PASSWORD`、`BURSA_KEY_ALIAS`、`BURSA_KEY_PASSWORD`として渡します。CIはシークレットの値をログや成果物に出力しません。

リリースAPKの選択では`*-unsigned.apk`を除外します。これにより、署名処理が設定されていないAPKを選択して公開することを防ぎます。

### バージョンとBuild Tools

`v*`タグからリリースを作成すると、CIは先頭の`v`を除いた値を`BURSA_VERSION_NAME`に設定します。`BURSA_VERSION_CODE`は、次の形式でタグから算出します。

```text
(major * 10000 + minor * 100 + patch) * 100 + rank
```

タグのコアバージョンは`MAJOR.MINOR.PATCH`形式で指定します。各値には次の制限があります。

- `major`は先頭の`0`を除く最大4桁で、最大値は`2099`です。
- `minor`と`patch`は先頭の`0`を除く最大2桁です。
- `0`は各値に使用できますが、`01`のような先頭のゼロは使用できません。
- プレリリースは`-alpha.N`、`-beta.N`、`-rc.N`のいずれかで、`N`は先頭のゼロがない`1`から`29`です。

`rank`は同じコアバージョン内の順序を表します。`alpha.N`は`N`、`beta.N`は`30 + N`、`rc.N`は`60 + N`、プレリリースなしの最終版は`99`になります。CIは形式、値の範囲、Androidの最大`versionCode`である`2100000000`を検証し、条件に合わないタグを拒否します。

Android Build Toolsは`35.0.0`に固定されています。

## Android CIゲートとスモークテスト

Androidの`android`ジョブと`android-smoke-test`ジョブは、次の条件を満たす場合だけ実行します。

```yaml
vars.BURSA_ANDROID_ENABLED == 'true'
```

この値が`'true'`以外の場合、Androidのビルドジョブは実行せず、APKやAABの生成、アーティファクトのアテステーションとアップロードも行いません。Androidスモークテストも実行しません。値の判定は文字列として行うため、`true`以外の値はゲートを通過しません。

スモークテストはarm64ランナー上のAPI 34、`google_apis`、`arm64-v8a`エミュレータで実行します。テストはビルドジョブが選択したAPKを起動し、リリースビルドでは署名済みAPKが、埋め込みウォレットのready状態と`WalletService`を示すことを検証します。APKがこの検証を満たさない場合、スモークテストは失敗します。

## iOSビルド

iOSビルドはmacOS上で次の順序で実行します。

1. `gomobile bind`で`Bursa.xcframework`を生成します。
2. `xcodegen generate`で`Bursa.xcodeproj`を生成します。
3. `xcodebuild`でシミュレータ用の未署名`Debug`アプリをビルドします。

フレームワークの生成には、`ui`ディレクトリから次のコマンドを使用します。

```bash
gomobile bind \
  -target=ios \
  -o ../mobile/ios/Bursa.xcframework \
  ./mobile
```

Xcodeプロジェクトの生成とシミュレータビルドには、次のコマンドを使用します。

```bash
cd mobile/ios
xcodegen generate
xcodebuild \
  -project Bursa.xcodeproj \
  -scheme Bursa \
  -sdk iphonesimulator \
  -configuration Debug \
  -derivedDataPath build \
  CODE_SIGNING_ALLOWED=NO \
  build
```

`mobile/ios/project.yml`には、フレームワークビルドとアプリビルドに必要な設定を指定します。

- Swiftアプリモジュールを`BursaApp`に設定します。
- `OTHER_LDFLAGS`に`-lresolv`を含めます。
- `PRODUCT_NAME`は`Bursa`のままにします。
- `PRODUCT_BUNDLE_IDENTIFIER`は`io.blinklabs.bursa`のままにします。
- `CODE_SIGNING_ALLOWED`と`CODE_SIGNING_REQUIRED`を`NO`にし、シミュレータ用アプリを署名なしでビルドします。
- `Bursa.xcframework`をアプリに埋め込みます。

CIは生成した`Bursa.app`を`Bursa-ios-sim.zip`にパッケージします。`xcodebuild`がアプリを生成しない場合、パッケージ処理は失敗します。

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>