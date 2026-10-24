---
title: "Dingo ノードのセットアップ"
description: "Dingo プールのSPOガイド - Dingo Nodeのセットアップと構成。"
---

✅ このガイドは、典型的なLinuxのセットアップを想定しています。必要に応じて、コマンドとパスを調整してください。

***

<br>

### ステップ1 - 作業ディレクトリを作成する
プールファイル用のディレクトリを作成します。

まず次のコマンドで、ディレクトリのパスを `.bashrc` でエクスポートします。

```
echo 'export DINGO_HOME=~/dingo-testnet-preview' >> ~/.bashrc
source ~/.bashrc
```

次にディレクトリを作成します。

```
mkdir -p "$DINGO_HOME"
```

<br>

> ✅ 実行して確認することができます:
> ```
> echo $DINGO_HOME
> ```

***

<br>

### ステップ2 - Dingoバイナリをダウンロード
<br>

<a href="https://github.com/blinklabs-io/dingo/releases" target="_blank">Dingoリリース</a>ページから最新のリリースをダウンロードしてください。

⚠️ バージョンとアーキテクチャを調整して、システムにマッチします。

```
cd $DINGO_HOME
 wget https://github.com/blinklabs-io/dingo/releases/download/v0.87.0/dingo-v0.87.0-linux-amd64.tar.gz -O - | tar -xz
```

<br>

✅ 実行してバイナリバージョンを確認することができます:

```
./dingo version
```

***

Dingoバイナリを`/usr/local/bin/`に移動して、アクセス可能なシステム全体です。

<br>

バイナリをコピーする:

```
sudo cp $DINGO_HOME/dingo /usr/local/bin/
```

<br>

> ✅ 実行してバイナリがコピーされたことを確認することができます。
> ```
> which dingo
> ```

***

<br>

### ステップ3 - Cardano-CLIバイナリをダウンロード

Cardano-CLIバイナリをダウンロードし、次のコマンドを実行します。

```
cd $DINGO_HOME
wget https://github.com/IntersectMBO/cardano-cli/releases/download/cardano-cli-11.2.3.1/cardano-cli-11.2.3.1-x86_64-linux.tar.gz -O - | tar -xz
```

> Cardano-CLI最新リリースリポジトリは、<a href="https://github.com/IntersectMBO/cardano-cli/releases" target="_blank">https://github.com/IntersectMBO/cardano-cli/releases</a>ページをご覧ください。


***

<br>

`cardano-cli`を`/usr/local/bin`に動かして下さい動くことによって:

```
sudo mv cardano-cli-x86_64-linux /usr/local/bin/cardano-cli
```

<br>

✅ `cardano-cli`バージョンの動作確認ができます。

```
cardano-cli version
```

***

<br>

**CLI コマンドの一部は Shelley Genesis JSON ファイルが必要です。**

この例では、`$DINGO_HOME/config/` を使用します。次のコマンドはディレクトリを作成し、次のように移動します。
```
mkdir -p "$DINGO_HOME/config" && cd "$DINGO_HOME/config"
```

<br>

Shelley Genesisファイルをダウンロードするには、次のコマンドを実行します。

```
wget https://book.play.dev.cardano.org/environments/preview/shelley-genesis.json
```

> ▷ ヒント: Cardano Configuration Filesは<a href="https://book.play.dev.cardano.org/env-preview.html" target="_blank">https://book.play.dev.cardano.org/env-preview.html</a>で見つけることができます

***

<br>

### ステップ4 - 環境変数の追加

bashrc を開きます。

```
nano ~/.bashrc
```

環境変数を追加します。

```
export CARDANO_NODE_NETWORK_ID=2
export CARDANO_NODE_SOCKET_PATH="$DINGO_HOME/dingo.socket"
```

> ヒント: 2 = プレビュー。

<br>

**保存と終了。**

bashrc を再読み込みします。

```
source ~/.bashrc
```

***

> ✅ 実行することで環境変数を検証できます。
> ```
> echo $CARDANO_NODE_NETWORK_ID
> ```
>
> ```
> echo $CARDANO_NODE_SOCKET_PATH
> ```

***

<br>

### ステップ5 - dingo.yaml構成ファイルを作成する

Dingoは、プレビュー、プリプロド、メインネット用の組み込みのCardanoネットワーク構成(genesisファイルとconfig.json)で出荷します。 そのため、別途ダウンロードする必要はありません。

- まず、必要なディレクトリを作成します。
```
sudo mkdir -p /etc/dingo
```

**`.dingo`ディレクトリを作成します:**

```
mkdir -p $DINGO_HOME/.dingo
```

- 次に、`dingo.yaml`ファイルを作成します。

> `$DINGO_HOME` 変数は、以下のコマンドでホームディレクトリパスに自動的に展開されます。

```
sudo bash -c "cat <<EOF > /etc/dingo/dingo.yaml
# Global data directory for both blob and metadata storage plugins.
# Can be overridden with CARDANO_DATABASE_PATH or --data-dir.
databasePath: \"$DINGO_HOME/.dingo\"

# Network
network: \"preview\"
relayPort: 3001
socketPath: \"$DINGO_HOME/dingo.socket\"

EOF"
```

`dingo.yaml`ファイルを閲覧して確認することができます。

```
sudo nano /etc/dingo/dingo.yaml
```

> ▷ ヒント: ポート3001が開いていることを確認してください。
> ```
> sudo ufw allow 3001/tcp
> ```

***

<br>

### ステップ6 - `dingo.service`ユニットファイルを作成する

systemd のサービスファイルを作成します。 ⚠️ `YOUR_USER`をLinuxのユーザー名に置き換えます(`echo $USER`を実行して確認します):

```
cat <<ENDFILE | sudo tee /etc/systemd/system/dingo.service > /dev/null
[Unit]
Description=Dingo Node
After=network-online.target

[Service]
Type=simple
Restart=on-failure
RestartSec=10
User=YOUR_USER
ExecStart=/usr/local/bin/dingo serve --config /etc/dingo/dingo.yaml
SyslogIdentifier=dingo
TimeoutStopSec=5

[Install]
WantedBy=multi-user.target
ENDFILE
```

***

✅ `dingo.service`ファイルを実行して確認することができます:

```
sudo nano /etc/systemd/system/dingo.service
```

***

<br>

### ステップ7 - サービスの有効化と開始

起動時にサービスが実行されるよう有効にし、今すぐ起動します。

```
sudo systemctl daemon-reload
sudo systemctl enable dingo.service
sudo systemctl start dingo.service
```

***

<br>

### ステップ8 - ステータスの確認

✅ サービスが実行されていることを確認します。

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

***

<br>

#### おめでとうございます! Dingo ノードが同期するはずです。 <br><br> ノードが続行する前に完全に同期されていることを確認してください。

***

<br>

このコマンドを実行して、ノードが100%同期されているかどうかを確認します。

> ```
> cardano-cli query tip
> ```

***


---

<!-- doc-holiday-watermark -->
<p align="center">
  <a href="https://doc.holiday">
    <img alt="Doc Holiday logo" src="https://doc.holiday/assets/docs-by-doc-holiday.png" width="200">
  </a>
</p>
<p align="center">Docs authored by <a href="https://doc.holiday">Doc Holiday</a></p>
