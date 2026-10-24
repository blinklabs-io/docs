---
title: SPO ガイドの概要
description: Dingo プールの SPO ガイド。
---

# Dingo ノード

## このガイドでは、Dingo ノードを使用して Preview ネットワークにテストプールを構築する手順を説明します。

⚠️ Dingo ノードは現在も活発に開発中です。そのため、Dingo のブロック生成はテストネットのみで推奨されます。

> 📝 リリースノートの推奨ネットワーク互換性の表を確認してください。
>
> ### 推奨ネットワーク互換性 ⚠️
>
> | ネットワーク | 互換性 |
> | --- | --- |
> | mainnet | ⛔ |
> | preprod-testnet | ✅ |
> | preview-testnet | ✅ |
> | musashi | ✅ |

Preview ネットワークで Dingo ノードを登録して実行するには、主に 5 つの手順が必要です。

- [x] 1. Dingo ノードのセットアップと設定
- [x] 2. プール鍵の生成
- [x] 3. 支払い鍵とステーク鍵の生成
- [x] 4. ステークアドレスの登録
- [x] 5. ステークプールの登録

***

📝 このガイドは、サーバーのセキュリティを強化済みであることを前提とします。詳しくは [Coincashew のサーバー保護ガイド](https://www.coincashew.com/coins/overview-ada/guide-how-to-build-a-haskell-stakepool-node/part-i-installation/hardening-an-ubuntu-server)を参照してください。

⚠️ エアギャップ環境の構築手順も省略しており、必要なファイルを適切に保護していることを前提とします。
