---
title: ウォレットカスタム送信エンドポイント設定ガイド
description: Tx Submit APIでカスタム送信エンドポイントを使用するためのウォレット設定。
---

# Tx Submit APIを使用してウォレットからトランザクションを送信する

Tx Submit APIは、Go言語で書かれたCardanoトランザクション送信APIサービスです。HTTPを介してCBORエンコードされたトランザクションペイロードを受け取り、gOuroborosを使用してOuroboros NetworkのLocalTxSubmissionミニプロトコルに変換します。このプロジェクトはProject Catalyst Fund 9で資金提供されました。

Tx Submit APIはHTTPを介してトランザクションを送信するため、Cardanoブロックチェーンへのトランザクション送信をより高速に行うことができます。

ウォレットを使用してTx Submit APIでトランザクションを送信するには、ウォレットで`カスタム送信エンドポイント`を設定する必要があります。

ウォレットを設定するには、以下の手順に従ってください。

***

ウォレットをTx Submit APIに接続するプロセスは、各Cardanoウォレット間で類似しています。ただし、オプションの名前が若干異なる場合があります。例えば、Eternlウォレットではこのオプションを`Custom Submit Endpoint`と呼んでいます。

![txsubmit-eternl-custom-submit-endpoint-screen](/txsubmit-eternl-custom-submit-endpoint-screen.png)

一方、Laceウォレットではこのオプションを`Custom Submit API`と呼んでいます。

![txsubmit-lace-custom-submit-api-screen](/txsubmit-lace-custom-submit-api-screen.png)

このガイドでは、Eternlウォレットを使用します。

***

## ステップ1 - Eternlウォレットで設定を開く

Eternlウォレットを開き、設定オプションをクリックします。

![txsubmit-eternl-settings-screen](/txsubmit-eternl-settings-screen.png)

## ステップ2 - アプリ設定を選択

App settingsをクリックします。

![txsubmit-eternl-app-settings-screen](/txsubmit-eternl-app-settings-screen.png)

## ステップ3 - カスタム送信エンドポイントを選択

下にスクロールして、Custom Submit Endpointをクリックします。

![txsubmit-eternl-custom-submit-endpoint-select-screen](/txsubmit-eternl-custom-submit-endpoint-select-screen.png)

## ステップ4 - エンドポイントを追加

Add Endpointをクリックします。

![txsubmit-eternl-add-endpoint-screen](/txsubmit-eternl-add-endpoint-screen.png)

## ステップ5 - エンドポイントURLを入力

Tx Submit APIのURLを入力します。`http://192.0.2.0:8090/api/submit/tx`のような形式になります。⚠️ お使いのIPとポートに調整してください。

![txsubmit-eternl-IP-endpoint-screen](/txsubmit-eternl-IP-endpoint-screen.png)

### おめでとうございます！ウォレットからTx Submit APIでトランザクションを送信する準備が整いました！

