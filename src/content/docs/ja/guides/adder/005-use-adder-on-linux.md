---
title: Linuxでの使用
description: LinuxでAdderを使用する方法。
---


## Adderバイナリをダウンロード

最新のAdderリリースは、<a href="https://github.com/blinklabs-io/adder/releases" target="_blank">https://github.com/blinklabs-io/adder/releases</a>ページからダウンロードできます。

以下のコマンドを実行してAdderバイナリをダウンロードします。ダウンロードリンクを最新バージョンに調整してください。

```
wget -c https://github.com/blinklabs-io/adder/releases/download/v0.30.1/adder-v0.30.1-linux-amd64.tar.gz -O - | tar -xz
```


***

## フィルターとコマンドでAdderを実行

これでフィルターとコマンドを使用してAdder `./adder`を実行できます。例えば、`-h`/`-help`フラグを使用すると、利用可能なすべてのコマンドライン引数のリストを取得できます。

```
./adder -h
```

![adder-linux-h-sample](/adder-linux-h-sample.png)

***

### おめでとうございます！

これで、特定の情報を追跡し、通知方法を選択するために、フィルターとコマンドを使用してAdderを実行する準備ができました。

<br />

これで、Adderの有用性とパワーについて、いくつかの[例](../examples/001-using-adder-examples-desc)を見ていく準備ができました！
