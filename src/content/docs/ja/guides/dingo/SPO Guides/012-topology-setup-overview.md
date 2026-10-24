---
title: トポロジーガイドの概要
description: Dingo プールの SPO ガイド - トポロジー JSON の設定方法。
---

Dingo は組み込みの既定トポロジーでも動作しますが、SPO は独自の `topology.json` を使用してください。このガイドでは Preview ネットワークのファイルを例にします。全ネットワークのファイルは [Cardano の環境一覧](https://book.play.dev.cardano.org/environments.html)にあります。

ネットワークとノード構成に合わせて変更してください。ここでは、2 つのリレーの背後に 1 つのブロックプロデューサーを配置する一般的な構成を使用します。

**このガイドの内容:**

- [既定の Preview トポロジー JSON](#default)
- [トポロジーフラグの意味](#flags)
- [リレー用トポロジー例](#relay)
- [BP 用トポロジー例](#bp)

<h2 id="default">既定の Preview トポロジー JSON</h2>

既定の Preview トポロジー JSON は次の形式です。

```
{
  "bootstrapPeers": [
    {
      "address": "preview-node.play.dev.cardano.org",
      "port": 3001
    }
  ],
  "localRoots": [
    {
      "accessPoints": [],
      "advertise": false,
      "trustable": false,
      "valency": 1
    }
  ],
  "peerSnapshotFile": "peer-snapshot.json",
  "publicRoots": [
    {
      "accessPoints": [],
      "advertise": false
    }
  ],
  "useLedgerAfterSlot": 119231973
}
```

> `useLedgerAfterSlot` と `bootstrapPeers` は、そのネットワークの公式トポロジーからコピーします。上記の Preview スロットは時間とともに古くなり、preprod/mainnet には適しません。

<h2 id="flags">トポロジーフラグの意味</h2>

トポロジー JSON を変更して使用するため、次の項目を理解してください。

- [ローカルピアと公開ピア](#local)
- [ブートストラップピア](#bootstrapping)
- [advertise フラグ](#advertise)
- [アクセスポイント](#access)
- [trustable フラグ](#trustable)

<h3 id="local">ローカルピアと公開ピア</h3>

ローカルルートは、自分のブロックプロデューサーなど、常にホットまたはウォームに保つピア向けです。公開ルートは代替ピアの取得元です。

<h3 id="bootstrapping">ブートストラップピア</h3>

ノードが長時間停止していた場合に役立ちます。これらと他の信頼するピアから同期し、先端に到達したら台帳ピアを使用します。

<h3 id="advertise">advertise フラグ</h3>

`advertise` が true の場合、ピア共有によってそのピアのアドレスを共有でき、着信接続が増える可能性があります。未登録のリレーで役立ちます。ブロックプロデューサーを広告してはいけません。

<h3 id="access">アクセスポイント</h3>

アクセスポイントは `localRoots` グループ内に配置します。これにより、BP の advertise を false にし、リレーでは true にできます。

<h3 id="trustable">trustable フラグ</h3>

信頼するピアは、ブートストラップピアと、信頼対象に設定したローカルルートピアで構成されます。ローカルルートピアは既定では信頼対象ではありません。

自分のリレーと BP は `"trustable": true` に設定してください。

<h2 id="relay">リレー用トポロジー例</h2>

一般的な 2 リレーと BP の構成では、リレーのトポロジーを次のように設定します。

- BP を隠しながら他のリレーを広告できるよう、localRoots を 2 グループに分けます。
- BP を含むグループは `"advertise": false,` にして、BP を非公開に保ちます。
- 他のリレーが 1 つ（合計 2 つ）なら "valency": 1、他のリレーが 2 つ（合計 3 つ）なら "valency": 2 とします。
- `hotValency` は `valency` の別名として使用でき、両方があれば `valency` が優先されます。空でないトポロジーグループでは、アクセスポイント数に対して `warmValency` を検証します。
- 先端から大きく遅れても同期できるよう、リレーは "trustable": true にします。
- Genesis/スナップショットモードでは、ブートストラップピアの代わりに、または併用して `peerSnapshotFile` を使用します。
- `"publicRoots": [{ "accessPoints": [], "advertise": false }]` で公開ルートを空にします。

> 次の例では "relay2.Address" と "blockProducerAddress" を自分のリレーと BP のアドレスに、"port": 3001 を使用するポートに変更してください。

```
{
  "bootstrapPeers": [
    {
      "address": "preview-node.play.dev.cardano.org",
      "port": 3001
    }
  ],
  "localRoots": [
    {
      "accessPoints": [
        {
          "address": "relay2.Address",
          "port": 3001
        }
      ],
      "advertise": true,
      "valency": 1,
      "trustable": true
    },
    {
      "accessPoints": [
        {
          "address": "blockProducerAddress",
          "port": 3001
        }
      ],
      "advertise": false,
      "valency": 1,
      "trustable": true
    }
  ],
  "peerSnapshotFile": "peer-snapshot.json",
  "publicRoots": [
    {
      "accessPoints": [],
      "advertise": false
    }
  ],
  "useLedgerAfterSlot": 119231973
}
```

<h2 id="bp">BP 用トポロジー例</h2>

ブロックプロデューサーは、自分のリレーにのみ接続するようにします。

- `"bootstrapPeers": null` にします。
- BP のローカルルートを非公開に保つため、`"advertise": false,` にします。
- リレーを `"trustable": true,` にします。
- この例はリレーが 2 つなので `"valency": 2` にします。3 つなら `3` にします。
- `"publicRoots": [{ "accessPoints": [], "advertise": false }]` で公開ルートを空にします。
- 台帳ピアデータでほかのノードに接続しないよう、`"useLedgerAfterSlot": -1` にします。
- 公開ネットワークから同期すべきではないため、BP に `peerSnapshotFile` や `bootstrapPeers` は不要です。

BP 用トポロジー JSON の例:

```
{
  "bootstrapPeers": null,
  "localRoots": [
    {
      "accessPoints": [
        {
          "address": "relay1.Address",
          "port": 3001
        },
        {
          "address": "relay2.Address",
          "port": 3001
        }
      ],
      "advertise": false,
      "trustable": true,
      "valency": 2
    }
  ],
  "publicRoots": [
    {
      "accessPoints": [],
      "advertise": false
    }
  ],
  "useLedgerAfterSlot": -1
}
```

各トポロジーファイルを保存後、Dingo がそのファイルを使用するよう設定して再起動し、BP が自分のリレーだけにホット接続していることを確認します。

既存の `/etc/dingo/dingo.yaml` に次を追加します。ファイルを上書きしないでください。

```
sudo bash -c "cat <<EOF >> /etc/dingo/dingo.yaml
# Path to the topology configuration file
topology: \"$DINGO_HOME/config/topology.json\"
EOF"
```

> パスは Dingo SPO ガイドに合わせています。必要に応じて調整してください。
>
> $DINGO_HOME はノードセットアップガイドと同様に、コマンド実行時に展開されます。BP と各リレーには、それぞれ異なる topology.json を使用します。

ファイルを確認します。

```
sudo nano /etc/dingo/dingo.yaml
```

再起動します。

```
sudo systemctl restart dingo
```

### リレーとブロックプロデューサーの独自トポロジーを設定できました。


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
