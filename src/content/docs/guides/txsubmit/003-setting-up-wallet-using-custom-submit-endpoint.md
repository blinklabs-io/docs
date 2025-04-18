---
title: Wallet Custom Submit Endpoint Setup Guide
description: Tx Submit API Setting up wallet to use custom submit endpoint.
---

# Use Tx Submit API to Submit Transactions From Your Wallet

Tx Submit API is a Cardano transaction submit API service written in Go which takes CBOR encoded transaction payloads over HTTP and converts it to the Ouroboros Network LocalTxSubmission mini-protocol via gOuroboros. This project was funded in Project Catalyst Fund 9.

Tx Submit API submits transactions over HTTP making it a faster option for submitting transaction to the Cardano blockchain.

To submit transactions using Tx Submit API using your wallet we will need to setup a `custom submit endpoint` in your wallet. 

To get setup your wallet follow the steps below

***

The process to connect your wallet to Tx Submit API is pretty similar between each Cardano wallet. However, the name of the option may slightly differ. For example, the Eternal wallet calls the option `Custom Submit Endpoint`

![txsubmit-eternl-custom-submit-endpoint-screen](/txsubmit-eternl-custom-submit-endpoint-screen.png)

While Lace wallet calls the option `Custom Submit API`

![txsubmit-lace-custom-submit-api-screen](/txsubmit-lace-custom-submit-api-screen.png)

For this guide we will use the Ethernl wallet.

***

## Step 1 - Open Settings in the Eternl Wallet

Open your Eternl wallet and click on the settings option.

![txsubmit-eternl-settings-screen](/txsubmit-eternl-settings-screen.png)

## Step 2 - Select App Settings

Click on App settings

![txsubmit-eternl-app-settings-screen](/txsubmit-eternl-app-settings-screen.png)

## Step 3 - Select Custom Submit Endpoint

Scroll down and click on Custom Submit Endpoint

![txsubmit-eternl-custom-submit-endpoint-select-screen](/txsubmit-eternl-custom-submit-endpoint-select-screen.png)

## Step 4 - Add Endpoint

Click on Add Endpoint

![txsubmit-eternl-add-endpoint-screen](/txsubmit-eternl-add-endpoint-screen.png)
