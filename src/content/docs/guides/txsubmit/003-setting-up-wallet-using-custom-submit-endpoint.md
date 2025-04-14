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

