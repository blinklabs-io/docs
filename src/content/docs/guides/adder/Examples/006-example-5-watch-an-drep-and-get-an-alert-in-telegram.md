---
title: Watch an DRep and get an Alert in Telegram
description: Adder Example 5 - Watch an DRep and get an Alert in Telegram.
---

In this example we will use Adder to send us a Telegram notification, when there is an action by the DRep that we want to track. 

### The events that will trigger an alert are the following actions by our DRep:

✅ DRep Registration Updates - if the DRep deregisters or changes registration.

✅ DRep Delegations - if the DRep we are tracking has a new delegator.

✅ Governance Votes - if the DRep votes on a governance action.

***

> ✅ For this guide we assume you have already downloaded the Adder exe and have opened a command prompt. If not see our [Quick Start](../../002-quick-start-overview) guide.

***

Before we breakdown the filters and commands we will use for this example we need to get a DRep id to track also a Telgram bot token and chat id so we can get alerts in Telegram. We will walk through the steps below.

<a name="step-1"></a>

## Step 1 - Get DRep ID for the DRep you want to Track

In order to filter by a DRep that we want to watch we need the DRep id. We can use tools like adastat.net to search by a DRep so we can get the DRep id.

In this example we searched  `Earn Coin Pool` on <a href="https://adastat.net/dreps" target="_blank">https://adastat.net/dreps</a>

![adder-drep-id](/adder-drep-id.png)

<br />

📝 Make note of the Drep ID, we will need it later. For this example, it was:

```
drep1yg8vjs7ute7z7vyd8yez5tgjey6043djjfh8d3n7sjev35g064xxc
```

***

<a name="step-2"></a>

## Step 2 - Creating the Telegram Bot (Required Once)

In order to get alerts in Telegram we will need a bot token from BotFather and then a chat id:

**2-1.** Open BotFather in Telegram by searching for `BotFather`

![adder-search-botfather](/adder-search-botfather.png)

***

**2-2.** Create a New Bot

![adder-botfather-create-new-bot](/adder-botfather-create-new-bot.png)

***

**2-3.** Name your bot and give it a unique username

![adder-botfather-new-bot-details](/adder-botfather-new-bot-details.png)

***

**2-4.** Then click `Create Bot`

![adder-botfather-click-create-bot](/adder-botfather-click-create-bot.png)

***

<a name="step-2-5"></a>

**2-5.** Copy the Bot Token

📝 Make note of the Bot Token, we will need it later. 

![adder-botfather-copy-bot-token](/adder-botfather-copy-bot-token.png)

***

**2-6.** Click `Username`

![adder-botfather-click-username](/adder-botfather-click-username.png)

***

**2-7.** Click `Message` to start chat with Bot

![adder-botfather-click-message-bot](/adder-botfather-click-message-bot.png)

**2-8.** Click `Start`

![adder-bot-chat-click-start](/adder-bot-chat-click-start.png)

<a name="step-2-9"></a>

**2-9.** Open this URL in a browser with your bot token from [Step 2-5](#step-2-5) `https://api.telegram.org/bot{your_bot_token}/getUpdates`

See we need to prefix our token with a word `bot`

> Eg: https://api.telegram.org/bot87xxxxxx07:AAG8xxxxxx1hi-C8xxxxxxTB2/getUpdates

You’ll receive a JSON response containing Telegram information related to your Bot chat.  

Here’s an example of the JSON format:
```
{
  "ok": true,
  "result": [
    {
      "update_id": 386670171,
      "message": {
        "message_id": 5,
        "from": {
          "id": 1902914866,
          "is_bot": false,
          "first_name": "ECP",
          "username": "EarnCoinPool",
          "language_code": "en"
        },
        "chat": {
          "id": 1902914866,
          "first_name": "ECP",
          "username": "EarnCoinPool",
          "type": "private"
        },
        "date": 1773686781,
        "text": "/start",
        "entities": [
          {
            "offset": 0,
            "length": 6,
            "type": "bot_command"
          }
        ]
      }
    }
  ]
}
```
📝 Make note of the CHAT_ID, we will need it later.  

In this example, `1902914866` is your CHAT_ID.
<br />

## Step 3 - Selecting Adder Commands

Now that we have the DRep id that we want to monitor and our Telegram Token and chat id, we are ready to look at the filters and commands we will use. For this example, we will use:

* Filter Type
* Filter DRep
* Output Telegram
* Output Telegram Bot Token
* Output Telegram Chat Id

***

### Filter Type

We want to get an alert only when a Governance event occurs so we can use the filter type governance. We will use the following filter:

```
--filter-type input.governance
```

### Filter DRep

We can use the DRep id from [Step 1](#step-1) to have Adder track our DRep by using the following filter:

```
--filter-drep drep1yg8vjs7ute7z7vyd8yez5tgjey6043djjfh8d3n7sjev35g064xxc
```

### Output Telegram

We need to add a command to let Adder know that we want to use Telegram. To do this we will add the following command:

```
--output telegram
```

### Output Telegram Bot Token

Since we want Adder to notify us in Telegram, we need to tell Adder the Bot Token we want to use in Telegram. To do this we will add the following command using the Bot Token from [Step 2-5](#step-2-5):

```
--output-telegram-bot-token $TELEGRAM_TOKEN
```

### Output Telegram Chat Id

For us to get a notification in our preferred Telegram channel, we need to tell Adder the chat id to the Telegram bot. To do this we will add the following command using the Chat Id from [Step 2-9](#step-2-9):

```
--output-telegram-chat-id $CHAT_ID
```

***

## Step 4 - Putting it All Together

To get Telegram notifications when a action occurs by a DRep, we will run the following command in our command prompt:

> ⚠️ Please adjust the path to your Adder exe. In this example it's on the Desktop for user richm.\
> Also adjust the DRep id, $TELEGRAM_TOKEN, and $CHAT_ID.

```
C:\Users\richm\Desktop\adder-v0.39.1-windows-amd64.exe --filter-type input.governance --filter-drep drep1yg8vjs7ute7z7vyd8yez5tgjey6043djjfh8d3n7sjev35g064xxc --output telegram --output-telegram-bot-token $TELEGRAM_TOKEN --output-telegram-chat-id $CHAT_ID
```

![adder-DRep-alert](/adder-DRep-alert.png)

### Congratulations!

Now you can minimize the window and let Adder run in the background. Anytime an action occurs with our DRep we will get an Alert in Telegram.

***


> 💡 TIP: You can get a list of all available commands by using the `-h` or `--help` flag.

See our other examples to see what else Adder can do and unlock the power of Adder 💪

1. [Example 1](../002-example-1-watch-my-wallet-and-get-a-desktop-notification) - Watch My Wallet and get a Desktop Notification
2. [Example 2](../003-example-2-watch-a-token-and-get-a-desktop-notification) - Watch a Token and get a Desktop Notification
3. [Example 3](../004-example-3-watch-an-spo-and-get-an-alert-in-discord) - Watch an SPO and get an Alert in Discord
4. [Example 4](../005-example-4-watch-a-smart-contract-for-a-specific-asset-id-and-get-a-desktop-notification) - Watch a Smart Contract for a Specific Asset ID and get a Desktop Notification
5. [Example 5](../006-example-5-watch-an-drep-and-get-an-alert-in-telegram) - Watch an DRep and get an Alert in Telegram
6. [Example 6](../007-example-6-watch-mempool-for-a-token) - Watch Mempool for a Transaction with a Token
