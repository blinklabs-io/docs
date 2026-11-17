---
title: "Cardano PreviewでAdderとDingoの接続を検証する"
description: "実行中のDingo PreviewノードのN2C UnixソケットにAdderを接続します。"
---

Cardano `preview` ネットワークで実行中のDingoノードを使用し、Adderを実行するユーザーがNode-to-Client Unixソケットにアクセスできるようにしてください。ノードの設定は[Dingoのセットアップガイド](/ja/guides/dingo/002-quick-start-overview/)を参照してください。

`DINGO_SOCKET_PATH` にノードのソケットパスを設定し、Adderを実行します。

```sh
export DINGO_SOCKET_PATH=/path/to/dingo.socket
adder --input chainsync --input-chainsync-network preview \
  --input-chainsync-socket-path "$DINGO_SOCKET_PATH" \
  --input-chainsync-intersect-tip=true --output log
```

ログで接続成功、ChainSyncの交点、および後続のブロックイベントを確認します。新しいイベントはノードがブロックを受信するまで到着しない場合があります。ロールバックで表示スロットが小さくなることもあります。Ctrl-CでAdderを停止します。

保存済みカーソルを使用しない場合、`intersect-tip` は起動するたびにノードの現在のtipを要求します。保存済みカーソルが優先されます。[カーソルの永続化](/ja/guides/adder/chainsync-cursor-persistence/)を参照してください。

コンテナ構成には[cardano-compose-stacks](https://github.com/blinklabs-io/cardano-compose-stacks)を使用してください。

---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
