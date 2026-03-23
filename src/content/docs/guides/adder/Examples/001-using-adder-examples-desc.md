---
title: Examples Overview
description: Overview of common Adder filters and commands.
---

# Using Adder Examples

<br />

## Common Filter Overview

Before we walk you through some examples let's familiarize you with some of the common commands and filters you can use.

> 💡 TIP: You can get a list of all available commands by using the `-h` or `--help` flag.

### Filter Options:

1. `--filter-type` (There are 3 filter types: Transaction, Block and Rollback)
   * [x] `--filter-type input.transaction`
   * [x] `--filter-type input.rollback`
   * [x] `--filter-type input.block`
   * [x] `--filter-type input.governance`
2. `--filter-policy xyz...` (filter by policy id)
3. `--filter-asset asset1xyz...` (filter by asset id)
4. `--filter-drep drepxyz...` (filter by drep id)
5. `--filter-address addr1xyz...` (filter by wallet receive address)
6. `--filter-address stake1xyz...` (filter by stake address)
7. `--filter-pool poolxyz...` (filter by stake pool id)

### Output Options:

1. `--output log`
2. `--output notify`
3. `--output telegram`
4. `--output webhook`
5. `--output push`

### Change Network

* -input-chainsync-network (There are 3 networks: preview, preprod, mainnet)
  * [x] `--input-chainsync-network preview`
  * [x] `--input-chainsync-network preprod`
  * [x] `--input-chainsync-network mainnet`


Now that we have an overview of the type of filters and commands you can use, let's walk through some examples to get you familiar with the power of Adder.

1. [Example 1](../002-example-1-watch-my-wallet-and-get-a-desktop-notification) - Watch My Wallet and get a Desktop Notification
2. [Example 2](../003-example-2-watch-a-token-and-get-a-desktop-notification) - Watch a Token and get a Desktop Notification
3. [Example 3](../004-example-3-watch-an-spo-and-get-an-alert-in-discord) - Watch an SPO and get an Alert in Discord
4. [Example 4](../005-example-4-watch-a-smart-contract-for-a-specific-asset-id-and-get-a-desktop-notification) - Watch a Smart Contract for a Specific Asset ID and get a Desktop Notification
5. [Example 5](../006-example-5-watch-an-drep-and-get-an-alert-in-telegram) - Watch an DRep and get an Alert in Telegram
6. [Example 6](../007-example-6-watch-mempool-for-a-token) - Watch Mempool for a Transaction with a Token
