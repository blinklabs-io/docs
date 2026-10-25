---
title: Musashiテストネットプールのセットアップ
description: Dingoプール向けSPOガイド - Musashiテストネットプールのセットアップ方法。
---

このガイドでは、DingoノードでMusashiテストネットのステークプールを2つのセクションに分けてセットアップします：
1. **Dingoノードのセットアップ。**
2. **Musashiテストネットプールの登録。**

⚠️ MusashiはLeiosのプロトタイプテストネットです。随時リセット（リスピン）され、リスピンのたびに新しいMusashi設定を含むDingoリリースが必要になります。始める前に、DingoのリリースノートでMusashiとの互換性を確認してください。

<br>

***

## セクション1 - Dingoノードのセットアップ

✅ このガイドは、x86-64（`amd64`）またはARM64（`aarch64`）マシン上の`systemd`を使用する一般的なLinux環境を前提としています。必要に応じてコマンドとパスを調整してください。

***

<br>

### ステップ1 - 環境の設定

プールのファイル用のディレクトリを作成し、`cardano-cli`がノードに接続するために使用する変数を設定します。

変数を`.bashrc`に追加して読み込みます：

```
cat <<'EOF' >> ~/.bashrc
export DINGO_HOME=~/dingo-leios-testnet
export CARDANO_NODE_NETWORK_ID=164
export CARDANO_NODE_SOCKET_PATH="$DINGO_HOME/dingo.socket"
EOF
source ~/.bashrc
```

> 💡 `CARDANO_NODE_NETWORK_ID`を設定すると、`cardano-cli`は`--testnet-magic`フラグなしでMusashi（ネットワークマジック164）と通信します。

作業ディレクトリを作成します：

```
mkdir -p "$DINGO_HOME"
```

ブロックプロデューサーには正確な時刻が必要です。`chrony`をインストールして有効化します：

```
sudo apt install -y chrony
sudo systemctl enable --now chrony
```

> 以下を実行して確認できます：
> ```
> echo $DINGO_HOME $CARDANO_NODE_NETWORK_ID $CARDANO_NODE_SOCKET_PATH
> ```

***

<br>

### ステップ2 - Dingoバイナリのダウンロード

<a href="https://github.com/blinklabs-io/dingo/releases" target="_blank">Dingoリリース</a>ページから最新リリースをダウンロードします。

ダウンロードするアーキテクチャを設定します。DingoはLinux向けに`amd64`と`arm64`のビルドを公開しています：

```
case "$(uname -m)" in
  x86_64) DINGO_ARCH=amd64 ;;
  aarch64|arm64) DINGO_ARCH=arm64 ;;
  *) echo "Unsupported architecture: $(uname -m)" ;;
esac
echo $DINGO_ARCH
```

次に、リリースをダウンロードして展開します：

```
cd $DINGO_HOME
wget https://github.com/blinklabs-io/dingo/releases/download/v0.88.0/dingo-v0.88.0-linux-$DINGO_ARCH.tar.gz -O - | tar -xz
```

バイナリのバージョンを確認してから、システム全体からアクセスできるように`/usr/local/bin/`にコピーします：

```
./dingo version
sudo cp $DINGO_HOME/dingo /usr/local/bin/
```

> ✅ `which dingo`を実行して、バイナリがコピーされたことを確認できます

***

<br>

### ステップ3 - Leios Cardano-CLIバイナリのダウンロード

Musashiには、ネットワークに対応するLeiosプロトタイプリリースの`cardano-cli`が必要です。ネットワークのバージョンは、Musashiの<a href="https://book.play.dev.cardano.org/environments-pre/leios/config.json" target="_blank">config.json</a>の`MinNodeVersion`フィールドで確認できます。たとえば、`11.1.0.164-prototype-2026w42`は<a href="https://github.com/input-output-hk/ouroboros-leios/releases" target="_blank">ouroboros-leiosリリース</a>ページの`rc-2026w42`リリースに対応します。

ディレクトリを作成して移動します：

```
mkdir -p "$DINGO_HOME/cli" && cd "$DINGO_HOME/cli"
```

LeiosリリースのLinuxビルドの名前は`x86_64`と`aarch64`です。リリースタグとアーキテクチャを設定し、アーカイブとそのチェックサムをダウンロードします：

```
LEIOS_RELEASE=rc-2026w42
LEIOS_ARCH=$(uname -m)
[ "$LEIOS_ARCH" = arm64 ] && LEIOS_ARCH=aarch64
wget https://github.com/input-output-hk/ouroboros-leios/releases/download/$LEIOS_RELEASE/cardano-node-leios-$LEIOS_ARCH-linux.tar.gz
wget https://github.com/input-output-hk/ouroboros-leios/releases/download/$LEIOS_RELEASE/cardano-node-leios-$LEIOS_ARCH-linux.sha256
sha256sum -c cardano-node-leios-$LEIOS_ARCH-linux.sha256
tar -xzf cardano-node-leios-$LEIOS_ARCH-linux.tar.gz
```

> ✅ `sha256sum`は`cardano-node-leios-x86_64-linux.tar.gz: OK`（ARM64では`aarch64`）と表示するはずです

`cardano-cli`を`/usr/local/bin`に移動し、バージョンを確認してから、ダウンロードしたファイルを削除します：

```
sudo mv bin/cardano-cli /usr/local/bin/cardano-cli
cardano-cli --version
cd $DINGO_HOME
rm -rf cli
```

***

<br>

### ステップ4 - ネットワークファイルのダウンロード

DingoにはMusashi向けのCardanoネットワーク設定（genesisファイルとconfig.json）が組み込まれているため、実行にこれらのファイルは必要ありません。ただし、このガイドの後半で`cardano-cli`がShelley genesisファイルを使用し、Dingoにはトポロジーファイルが必要です。

`config`ディレクトリを作成し、ファイルをダウンロードします：

```
mkdir -p "$DINGO_HOME/config" && cd "$DINGO_HOME/config"
wget https://book.play.dev.cardano.org/environments-pre/leios/shelley-genesis.json
wget https://book.play.dev.cardano.org/environments-pre/leios/topology.json
wget https://book.play.dev.cardano.org/environments-pre/leios/peer-snapshot.json
```

ダウンロードしたトポロジーはMusashiのブートストラップリレーに接続し、`peer-snapshot.json`を使用して追加のピアを見つけます。同期にはこれで十分です。

> 💡 ヒント: Musashiの設定ファイルは<a href="https://book.play.dev.cardano.org/adv-musashi.html" target="_blank">Musashi環境ページ</a>に掲載されています。

**任意: 知っているピアの追加**

他のMusashiプールのリレーをローカルルートとして追加することもできます。<a href="https://kleioscan.com/#/musashi/pools" target="_blank">Kleioscan Musashiプール</a>ページで確認してください：

<img src="/dingo-kleio-explorer-pools.png"
     alt="KleioscanのMusashiプール一覧"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

SPO仲間のプールをいくつかクリックし、パブリックIPとポートをコピー📝します：

<img src="/dingo-kleio-explorer-pool-relay-example.png"
     alt="KleioscanでのMusashiプールのリレー"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

次に、それらを`topology.json`の`localRoots`セクションに追加します：

```
nano $DINGO_HOME/config/topology.json
```

***3つのプールを含む`localRoots`セクションの例：***
```
  "localRoots": [
    {
      "accessPoints": [
        { "address": "RELAY_1_ADDRESS", "port": RELAY_1_PORT },
        { "address": "RELAY_2_ADDRESS", "port": RELAY_2_PORT },
        { "address": "RELAY_3_ADDRESS", "port": RELAY_3_PORT }
      ],
      "advertise": false,
      "trustable": false,
      "valency": 3
    }
  ],
```

`RELAY_*`プレースホルダーをKleioscanからコピーしたアドレスとポートに置き換え、`valency`を追加したリレーの数に設定してください。ファイルのその他の部分はダウンロードしたままにしてください。`useLedgerAfterSlot`はネットワークがリスピンされると変わります。

***

<br>

### ステップ5 - dingo.yaml設定ファイルの作成

設定ディレクトリとデータベースディレクトリを作成します：

```
sudo mkdir -p /etc/dingo
mkdir -p $DINGO_HOME/.dingo
```

`dingo.yaml`ファイルを作成します：

> `$DINGO_HOME`変数は自動的にホームディレクトリのパスに展開されます。

```
sudo bash -c "cat <<EOF > /etc/dingo/dingo.yaml
# Global data directory for both blob and metadata storage plugins.
# Can be overridden with CARDANO_DATABASE_PATH or --data-dir.
databasePath: \"$DINGO_HOME/.dingo\"

# Network
network: \"musashi\"
relayPort: 3010
socketPath: \"$DINGO_HOME/dingo.socket\"

# Path to the topology configuration file for Cardano node
topology: \"$DINGO_HOME/config/topology.json\"
EOF"
```

以下を実行して`dingo.yaml`ファイルを表示し、確認できます：

```
cat /etc/dingo/dingo.yaml
```

> 💡 ヒント: ポート3010が開いていることを確認してください。
> ```
> sudo ufw allow 3010/tcp
> ```

***

<br>

### ステップ6 - `dingo.service`ユニットファイルの作成

systemdサービスファイルを作成します。`YOUR_USER`をLinuxのユーザー名（`echo $USER`）に置き換えてください：

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

以下を実行して`dingo.service`ファイルを表示し、確認できます：

```
cat /etc/systemd/system/dingo.service
```

***

<br>

### ステップ7 - サービスの有効化と開始

起動時にサービスが実行されるように有効化し、すぐに開始します：

```
sudo systemctl daemon-reload
sudo systemctl enable dingo.service
sudo systemctl start dingo.service
```

***

<br>

### ステップ8 - ステータスの確認

サービスが実行中であることを確認します：

```
sudo systemctl status dingo.service
```

ログをリアルタイムで追跡するには：

```
sudo journalctl -u dingo -f
```

エラーが発生した場合に最近のログを確認するには：

```
sudo journalctl -u dingo -n 50 --no-pager
```

同期の進捗を確認します。`syncProgress`が`100.00`になると、ノードの同期は完了です：

```
cardano-cli query tip
```

***

<br>

#### おめでとうございます。**Musashiテストネットプールの登録**セクションに進むことができます

<br>

***

## セクション2 - Musashiテストネットプールの登録

> 先に進む前に、ノードが完全に同期していることを確認してください。`cardano-cli query tip`で`"syncProgress": "100.00"`と表示される必要があります。

このセクションのコマンドは`dijkstra`エラを使用します。エラは`cardano-cli query tip`の`era`フィールドで確認してください。

***

<br>

### ステップ1 - `keys`フォルダーの作成

プールのキーと証明書ファイル用に`keys`フォルダーを作成し、そのフォルダーに移動します。これらのキーはプールを管理するものなので、このフォルダーをバックアップしてください。

```
mkdir -p "$DINGO_HOME/keys" && cd "$DINGO_HOME/keys"
```

***

<br>

### ステップ2 - 支払いキーとステークキーの作成

支払いキーを作成します：
```
cardano-cli dijkstra address key-gen \
  --verification-key-file payment.vkey \
  --signing-key-file payment.skey
```

ステークキーを作成します：
```
cardano-cli dijkstra stake-address key-gen \
  --verification-key-file stake.vkey \
  --signing-key-file stake.skey
```

***

<br>

### ステップ3 - 支払いアドレスの作成と入金

支払いアドレスを作成し、`payment.addr`に保存します：
```
cardano-cli dijkstra address build \
  --payment-verification-key-file payment.vkey \
  --stake-verification-key-file stake.vkey \
  --out-file payment.addr
```

支払いアドレスを表示してコピーします：

```
cat payment.addr; echo
```

<a href="https://faucet.leios.play.dev.cardano.org/basic-faucet" target="_blank">Musashi Faucet</a>にアクセスし、1つ目のフォーム（`address`）にアドレスを貼り付け、reCAPTCHAのチェックボックスにチェックを入れて送信します。Faucetは10,000 test adaを送金します。これで500 adaのプールデポジット、2 adaのステークアドレスデポジット、誓約（pledge）、手数料をまかなえます。

<img src="/dingo-musashi-faucet.png"
     alt="上部にアドレスフォーム、その下にプール委任フォームがあるMusashi Faucet"
     style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

test adaが届いたことを確認します。UTxOエントリが1つ表示されるはずです：

```
cardano-cli dijkstra query utxo --address "$(cat payment.addr)"
```

***

<br>

### ステップ4 - ノード運用キーの作成

コールドキー、KESキー、VRFキーを作成します。

**コールドキー（プールのID）**
```
cardano-cli dijkstra node key-gen \
  --cold-verification-key-file cold.vkey \
  --cold-signing-key-file cold.skey \
  --operational-certificate-issue-counter-file opcert.counter
```

> ⚠️ このテストネットガイドでは、簡略化のためにノード上でコールドキーを作成します。メインネットでは、コールドキーをオフラインのマシンで作成して保管してください。

**KESキー（定期的にローテーションするホットキー）**
```
cardano-cli dijkstra node key-gen-KES \
  --verification-key-file kes.vkey \
  --signing-key-file kes.skey
```

**VRFキー（ブロック生成スロットの獲得に使用）**
```
cardano-cli dijkstra node key-gen-VRF \
  --verification-key-file vrf.vkey \
  --signing-key-file vrf.skey
```

***

<br>

### ステップ5 - BLSキーの作成

BLSキーは、プールがLeiosのエンドーサーブロックに投票し、認証するために使用するキーです。BLSキーがないと、ステップ9のプール登録証明書を作成できません。

```
cardano-cli dijkstra node key-gen-BLS \
  --verification-key-file bls.vkey \
  --signing-key-file bls.skey
```

> ✅ `jq -r .type bls.vkey`は`BlsVerificationKey_bls12-381-BLS-Signature-Minimal-Signature-Size`と表示するはずです

***

<br>

### ステップ6 - 運用証明書の作成

現在のKES期間を確認します：

```
slotsPerKESPeriod=$(jq -r '.slotsPerKESPeriod' "$DINGO_HOME/config/shelley-genesis.json")
slotNo=$(cardano-cli query tip | jq -r '.slot')
kesPeriod=$(( slotNo / slotsPerKESPeriod ))
echo $kesPeriod
```

運用証明書`node.cert`を作成します：
```
cardano-cli dijkstra node issue-op-cert \
  --kes-verification-key-file kes.vkey \
  --cold-signing-key-file cold.skey \
  --operational-certificate-issue-counter-file opcert.counter \
  --kes-period "$kesPeriod" \
  --out-file node.cert
```

***

<br>

### ステップ7 - プールのメタデータの作成

以下の値をプールの情報に合わせて更新してください。

📝 **ticker**は3〜5文字にする必要があります
📝 **description**は255文字以内にする必要があります。

```
cat > meta.json << EOF
{
"name": "MyPoolName",
"description": "My pool description",
"ticker": "ABC",
"homepage": "https://pool-Website.com"
}
EOF
```

メタデータファイルのハッシュを計算します。ハッシュは`poolMetaDataHash.txt`に保存されます：

```
cardano-cli dijkstra stake-pool metadata-hash \
  --pool-metadata-file meta.json \
  --out-file poolMetaDataHash.txt
```

***

<br>

### ステップ8 - メタデータのホスティング

プール登録に含めるメタデータURLは最大128文字です。すでに自分のWebサイトでメタデータをホストしている場合は、以下の`METADATA_URL`にそのURLを設定し、GitHubの手順をスキップしてください。それ以外の場合は、GitHub Pagesで無料でホストできます：

1. <a href="https://github.com" target="_blank">GitHub</a>にサインインし、`pool`という名前の新しい**public**リポジトリを作成します。
2. リポジトリで**Add file** → **Upload files**を選択し、`meta.json`をアップロードして、`main`ブランチにコミットします。
3. **Settings** → **Pages**を開きます。**Build and deployment**で、**Source**を**Deploy from a branch**に設定し、`main`ブランチと`/ (root)`フォルダーを選択して、**Save**を選択します。

   <img src="/dingo-musashi-github-pages.png"
        alt="Deploy from a branch、main、/ (root)が選択されたGitHub Pagesのビルドとデプロイの設定"
        style="max-width:100%; height:auto; max-height:500px; object-fit:contain; border:1px solid #ccc;" />

4. 1〜2分後、メタデータは`https://YOUR_GITHUB_USERNAME.github.io/pool/meta.json`で公開されます。

URLを設定し、アクセスできることと128文字以内であることを確認します：

```
METADATA_URL=https://YOUR_GITHUB_USERNAME.github.io/pool/meta.json
curl -s -L "$METADATA_URL"
echo -n "$METADATA_URL" | wc -c
```

ホストしたファイルのハッシュがローカルファイルと同じであることを確認します。2つのコマンドは同じハッシュを表示するはずです：

```
cardano-cli dijkstra stake-pool metadata-hash --pool-metadata-file <(curl -s -L "$METADATA_URL")
cat poolMetaDataHash.txt; echo
```

> ⚠️ `cardano-cli`がハッシュを計算したファイルをそのままアップロードしてください。アップロード後にGitHub上で編集するとハッシュが変わり、登録したハッシュと一致しなくなるため、ウォレットやエクスプローラーがメタデータを無視します。

***

<br>

### ステップ9 - ステークアドレスとプールの登録

ステークアドレス証明書とプール証明書の両方を作成し、1つのトランザクションで送信します。

**ステークアドレス登録証明書：**
```
cardano-cli dijkstra stake-address registration-certificate \
  --stake-verification-key-file stake.vkey \
  --key-reg-deposit-amt "$(cardano-cli dijkstra query protocol-parameters | jq .stakeAddressDeposit)" \
  --out-file stake-reg.cert
```

**プール登録証明書：**

`RELAY_IP`に、他のノードがこのノードに接続するために使用するパブリックIPv4アドレスを設定します。メタデータURLには、ステップ8で設定した`METADATA_URL`を使用します。

```
RELAY_IP=YOUR_PUBLIC_IP
```

次に証明書を作成します。以下の値は、誓約1,000 test ada、固定費170 test ada、マージン5%を設定します。

```
cardano-cli dijkstra stake-pool registration-certificate \
  --cold-verification-key-file cold.vkey \
  --vrf-verification-key-file vrf.vkey \
  --bls-signing-key-file bls.skey \
  --pool-pledge 1000000000 \
  --pool-cost 170000000 \
  --pool-margin 0.05 \
  --pool-reward-account-verification-key-file stake.vkey \
  --pool-owner-stake-verification-key-file stake.vkey \
  --pool-relay-ipv4 "$RELAY_IP" \
  --pool-relay-port 3010 \
  --metadata-url "$METADATA_URL" \
  --metadata-hash $(cat poolMetaDataHash.txt) \
  --out-file pool-reg.cert
```

**トランザクションの作成、署名、送信：**

`--tx-in`に使用するUTxOを取得します。Faucetからの送金直後は、アドレスにUTxOが1つだけあります：
```
TXIN=$(cardano-cli dijkstra query utxo --address "$(cat payment.addr)" | jq -r 'keys[0]')
```

トランザクションを作成します：
```
cardano-cli dijkstra transaction build \
  --tx-in "$TXIN" \
  --change-address "$(cat payment.addr)" \
  --certificate-file stake-reg.cert \
  --certificate-file pool-reg.cert \
  --out-file pool-reg-tx.raw
```

トランザクションに署名します：
```
cardano-cli dijkstra transaction sign \
  --tx-body-file pool-reg-tx.raw \
  --signing-key-file payment.skey \
  --signing-key-file stake.skey \
  --signing-key-file cold.skey \
  --out-file pool-reg-tx.signed
```

トランザクションを送信します：
```
cardano-cli dijkstra transaction submit \
  --tx-file pool-reg-tx.signed
```

***

<br>

### ステップ10 - プールへのステークの委任

誓約は、自分のステークを自分のプールに委任して初めてカウントされます。委任証明書を作成し、別のトランザクションで送信します。

委任証明書を作成します：
```
cardano-cli dijkstra stake-address stake-delegation-certificate \
  --stake-verification-key-file stake.vkey \
  --cold-verification-key-file cold.vkey \
  --out-file delegation.cert
```

`--tx-in`に使用するUTxOを取得します：
```
TXIN=$(cardano-cli dijkstra query utxo --address "$(cat payment.addr)" | jq -r 'keys[0]')
```

トランザクションを作成します：
```
cardano-cli dijkstra transaction build \
  --tx-in "$TXIN" \
  --change-address "$(cat payment.addr)" \
  --certificate-file delegation.cert \
  --out-file delegation-tx.raw
```

トランザクションに署名します：
```
cardano-cli dijkstra transaction sign \
  --tx-body-file delegation-tx.raw \
  --signing-key-file payment.skey \
  --signing-key-file stake.skey \
  --out-file delegation-tx.signed
```

トランザクションを送信します：
```
cardano-cli dijkstra transaction submit \
  --tx-file delegation-tx.signed
```

***

<br>

### ステップ11 - Faucetへの委任のリクエスト

1,000 adaの誓約では少なすぎるため、プールがブロック生成に選ばれません。Faucetは約1,000,000 test adaをプールに委任できます。

bech32形式（`pool1…`）のプールIDを取得します：

```
cardano-cli dijkstra stake-pool id --output-bech32 --cold-verification-key-file cold.vkey
```

<a href="https://faucet.leios.play.dev.cardano.org/basic-faucet" target="_blank">Musashi Faucet</a>にアクセスし、2つ目のフォーム（`pool`、ステップ3のスクリーンショットの下側のフォーム）にプールIDを貼り付け、reCAPTCHAのチェックボックスにチェックを入れて送信します。

***

<br>

### ステップ12 - 登録の確認

プールIDとステークアドレスを取得します：

```
POOL_ID=$(cardano-cli dijkstra stake-pool id --cold-verification-key-file cold.vkey --output-format hex)
STAKE_ADDR=$(cardano-cli dijkstra stake-address build --stake-verification-key-file stake.vkey)
echo "pool id: $POOL_ID"
echo "stake address: $STAKE_ADDR"
```

プールがオンチェーンで登録されていることを確認します。プールのパラメーター（誓約、コスト、マージン、VRF）が表示されます：
```
cardano-cli dijkstra query pool-state --stake-pool-id "$POOL_ID"
```

委任が反映されたことを確認します。`stakeDelegation`にプールIDが表示されるはずです：

```
cardano-cli dijkstra query stake-address-info --address "$STAKE_ADDR"
```

BLSキーが登録されていることを確認します：

```
cardano-cli dijkstra query pool-state --stake-pool-id "$POOL_ID" | jq '.[].blsKey'
```

- `bksKey.blsPubKey`が自分のキーと一致するはずです。4文字のCBORプレフィックス`5860`を除いた`bls.vkey`と比較してください：
  ```
  jq -r .cborHex bls.vkey | cut -c5-
  ```
- `bksRegisteredIn`は、登録が有効になるエポックです。ノードはキーが登録されたエポックを公開しないため、`cardano-cli`はこのエポックを報告します。この値を控えておいてください。キーはこのエポックから一定数のエポック後に失効します（ステップ15を参照）。


> 💡 <a href="https://leios.cardano-scaling.org/docs/testnet/rewards-program" target="_blank">Musashiテストネット報酬プログラム</a>は新しいプールの受け付けを終了しています。すでにプログラムに参加しているプールは、<a href="https://metsuke-leios.play.dev.cardano.org/" target="_blank">Metsuke</a>でテレメトリを報告します。MetsukeはHaskell版cardano-node向けに作られたエージェントで、ノードのPrometheusエンドポイントとトレース行を読み取ります。

***

<br>

### ステップ13 - Dingoをブロックプロデューサーとして設定

Dingoノードを停止します：
```
sudo systemctl stop dingo
```

署名キーを自分のユーザーだけが読み取れるように制限します。Dingoは、グループやその他のユーザーが読み取れるBLS署名キーの読み込みを拒否します：

```
chmod 600 $DINGO_HOME/keys/*.skey
```

`dingo.yaml`をブロックプロデューサー用の設定に置き換えます。この設定では、セクション1の設定にKESキー、VRFキー、運用証明書、BLSキーを追加します：

```
sudo bash -c "cat <<EOF > /etc/dingo/dingo.yaml
# Global data directory for both blob and metadata storage plugins.
# Can be overridden with CARDANO_DATABASE_PATH or --data-dir.
databasePath: \"$DINGO_HOME/.dingo\"

# Network
network: \"musashi\"
relayPort: 3010
socketPath: \"$DINGO_HOME/dingo.socket\"

# Path to the topology configuration file for Cardano node
topology: \"$DINGO_HOME/config/topology.json\"

# Block producer
blockProducer: true
shelleyVrfKey: \"$DINGO_HOME/keys/vrf.skey\"
shelleyKesKey: \"$DINGO_HOME/keys/kes.skey\"
shelleyOperationalCertificate: \"$DINGO_HOME/keys/node.cert\"

# Leios voting: the BLS key registered with your pool in Step 9
leiosVoteSigningKeyFile: \"$DINGO_HOME/keys/bls.skey\"
EOF"
```

> 💡 `leiosVoteSigningKeyFile`を設定しない場合でもプールはブロックを生成しますが、Leiosのエンドーサーブロックには投票しません。

以下を実行して`dingo.yaml`ファイルを表示し、確認できます：

```
cat /etc/dingo/dingo.yaml
```

***

<br>

### ステップ14 - Dingoの起動とステータスの確認

Dingoノードを起動します：

```
sudo systemctl start dingo
```

Dingoが実行中であることを確認します：

```
sudo systemctl status dingo
```

ログをリアルタイムで追跡するには：

```
sudo journalctl -u dingo -f
```

エラーが発生した場合に最近のログを確認するには：

```
sudo journalctl -u dingo -n 50 --no-pager
```

> 💡 プールは登録から約2エポック後、自分のステークを含むステークスナップショットが有効になった時点でブロック生成を開始します。

***

<br>

### ステップ15 - BLSキーのローテーション

BLSキーには有効期限があります。キーは、現在のエポックが`bksRegisteredIn`にネットワークの最大キー有効期間（テストネットで告知されます）を加えた値より小さい間だけ有効です。その後、プールは委員会の席を維持しますが、投票できなくなります。

キーのローテーションは、新しいBLSキーを使用し、その他の値はすべて変えずに再登録することで行います。新しいキーはエポック境界で有効になるため、有効期限よりも十分前にローテーションしてください。

新しいキーを作成します。ローテーションがオンチェーンに反映されるまで、古いキーは保持してください：

```
cd $DINGO_HOME/keys
cardano-cli dijkstra node key-gen-BLS \
  --verification-key-file bls-new.vkey \
  --signing-key-file bls-new.skey
```

ステップ9と同じ値で新しい登録証明書を作成します。新しいシェルの場合は、先に`RELAY_IP`と`METADATA_URL`を再度設定してください：

```
RELAY_IP=YOUR_PUBLIC_IP
METADATA_URL=https://YOUR_GITHUB_USERNAME.github.io/pool/meta.json
```


```
cardano-cli dijkstra stake-pool registration-certificate \
  --cold-verification-key-file cold.vkey \
  --vrf-verification-key-file vrf.vkey \
  --bls-signing-key-file bls-new.skey \
  --pool-pledge 1000000000 \
  --pool-cost 170000000 \
  --pool-margin 0.05 \
  --pool-reward-account-verification-key-file stake.vkey \
  --pool-owner-stake-verification-key-file stake.vkey \
  --pool-relay-ipv4 "$RELAY_IP" \
  --pool-relay-port 3010 \
  --metadata-url "$METADATA_URL" \
  --metadata-hash $(cat poolMetaDataHash.txt) \
  --out-file pool-rotate.cert
```

この証明書だけを送信します（今回はステークアドレス証明書は不要です）：

```
TXIN=$(cardano-cli dijkstra query utxo --address "$(cat payment.addr)" | jq -r 'keys[0]')

cardano-cli dijkstra transaction build \
  --tx-in "$TXIN" \
  --change-address "$(cat payment.addr)" \
  --certificate-file pool-rotate.cert \
  --out-file pool-rotate.raw

cardano-cli dijkstra transaction sign \
  --tx-body-file pool-rotate.raw \
  --signing-key-file payment.skey \
  --signing-key-file cold.skey \
  --out-file pool-rotate.signed

cardano-cli dijkstra transaction submit --tx-file pool-rotate.signed
```

新しい登録エポックを確認します：

```
cardano-cli dijkstra query pool-state --stake-pool-id "$POOL_ID" | jq '.[].blsKey.bksRegisteredIn'
```

`bksRegisteredIn`に新しいエポックが表示され、**かつ**その次のエポック境界を過ぎてから、Dingoを新しいキーに切り替えてください。その後、`/etc/dingo/dingo.yaml`の`leiosVoteSigningKeyFile`を`bls-new.skey`に設定し、自分のユーザーだけが読み取れるようにして（`chmod 600`）、`sudo systemctl restart dingo`でDingoを再起動します。

***

<br>

### ステップ16 - ノードの監視

Dingoは`127.0.0.1:12798`でPrometheusメトリクスを提供します。グラフで表示するには、[Grafanaダッシュボードガイド（英語）](/guides/dingo/spo-guides/008-grafana-dashboard/)に従い、ダッシュボードのネットワークセレクターで`musashi`を選択してください。

コマンドラインからプールが投票しているかどうかを確認するには：

```
curl -s 127.0.0.1:12798/metrics | grep -E '^dingo_metrics_leios_(committee_size|votes_not_emitted)'
```

`dingo_metrics_leios_votes_not_emitted_total`は、ノードが投票しなかったエンドーサーブロックの数を理由ごとにカウントします。BLSキーがオンチェーンのステークスナップショットに含まれるまでは、`reason="no_key"`のカウントが増加します。

***

<br>

#### おめでとうございます。Musashiテストネット上でLeios Dingoノードが稼働しています。

***

<br>

> 元のガイドと追加リソースはこちらです：<a href="https://leios.cardano-scaling.org/docs/testnet/getting-started" target="_blank">Getting started</a>と<a href="https://leios.cardano-scaling.org/docs/testnet/register-stake-pool" target="_blank">Register a stake pool</a>
