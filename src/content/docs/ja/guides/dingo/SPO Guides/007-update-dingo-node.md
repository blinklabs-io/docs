---
title: "Dingo ノードの更新"
description: "Dingo プールのSPOガイド - Dingo Nodeを更新する方法。"
---

## Dingo Nodeを更新する方法

## ステップ1 - 最新のリリースをダウンロード
<a href="https://github.com/blinklabs-io/dingo/releases" target="_blank">Dingoリリース</a>ページから最新のリリースをダウンロードしてください。

⚠️ バージョンとアーキテクチャを調整して、システムにマッチします。
```
cd ~/dingo
 wget https://github.com/blinklabs-io/dingo/releases/download/v0.87.0/dingo-v0.87.0-linux-amd64.tar.gz -O - | tar -xz
```

***

## ステップ2 - Dingo Nodeを停止する

```
sudo systemctl stop dingo
```

***

## ステップ3 - Dingoバイナリを`/usr/local/bin/`にコピーする

```
sudo cp $DINGO_HOME/dingo /usr/local/bin/
```

`which dingo`でコピーされていることを確認してください。

***

## ステップ4 - 設定ファイルの更新をチェックする
設定の更新が必要なかどうかを確認します。

<a href="https://docs.blinklabs.io/guides/dingo/releases/001-release-notes/" target="_blank"> Dingoリリースノート</a>を参照してください。

> ◀ `dingo.yaml` ファイルの実行を表示および編集するには:
>
> ```
> sudo nano /etc/dingo/dingo.yaml
> ```
> ⚠️ 必要に応じてパスを調整する

***

## ステップ5 - RECOMMENDED - `.dingo`データベースを削除し、Mithrilスナップショットを再同期
Dingoはアクティブ開発中なので、データベースを削除し、新規に起動する際は、アップグレード時におすすめです。

> ⚠️**Musashi v0.87.0要件:** `rc-2026w42`リスピンは、同梱の Byron と Shelley のジェネシスハッシュを置き換えるので、Musashiは既存のチェーンデータベースを再利用することはできません。 構成されたデータベースを削除し、新しいMithrilスナップショットまたはジェネシスから再同期します。 他のネットワークは、上記の一般的な推奨事項に従うことができますが、Musashiはこのリセットを必要とします。

### ステップ 5.1 - `.dingo`データベースの削除
> ◀ 隠しファイルとダブルチェックパスの実行を表示するには:
> ```
> cd $DINGO_HOME
> ls -a
> ```
>
> `.dingo`を参照してください。 そうでない場合は、設定したデータベースパスの`dingo.yaml`ファイルを確認してください。

次のコマンドで `.dingo` データベースディレクトリを削除します。
```
cd $DINGO_HOME
rm -r .dingo
```

### ステップ5.2 - Mithril Sync
Dingoは、自動的にスナップショットをダウンロードし、ロードする組み込みのMithrilクライアントを持っています。 これは、Genesisからチェーンを再生すると比較して、同期時間の時間を節約します。

`$DINGO_HOME`ディレクトリから次のコマンドを実行します。
```
dingo sync --mithril
```
Dingo:
1. 設定されたネットワークで最新のMithrilスナップショットをダウンロード
2. 証明書チェーンの確認
3. スナップショットをデータベースにロードする

システムやネットワーク速度に応じて約20～30分かかります。

> このステップをスキップすると、 Dingo は genesis から同期します。

### ステップ 5.3 - スタート Dingo
Mithrilのスナップショットがロードが完了したら、ノードを開始します。
```
cd $DINGO_HOME
sudo systemctl start dingo
```
***

## ステップ6 - 更新を確認する
新しいバージョンがインストールされていることを確認します。
```
dingo version
```

***

## ステップ7 - サービスステータスの確認
サービスが実行されていることを確認します。
```
sudo systemctl status dingo.service
```

ログをリアルタイムでフォローするには:
```
sudo journalctl -u dingo -f
```

エラーがある場合、最近のログを表示するには:
```
sudo journalctl -u dingo -n 50 --no-pager
```


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
