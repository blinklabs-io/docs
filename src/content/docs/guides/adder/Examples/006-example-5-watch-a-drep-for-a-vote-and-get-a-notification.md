---
title: Watch a drep and get an Alert
description: Adder Example 5 - Watch an DRep and get an Alert in Telegram.
---

# Watch an DRep and get an Alert in Telegram

In this example we will use Adder to send us a Telegram notification, when there is an action by the DRep that we want to track. 


### The events that will trigger an alert are the following actions by our DRep:

✅ DRep Registration Updates - if the DRep deregisters or changes registration.

✅ DRep Delegations - if the DRep we are tracking has a new delegator.

✅ Governance Votes - if the DRep votes on a governance action.

***

> ✅ For this guide we assume you have already downloaded the Adder exe and have opened a command prompt. If not see our [Quick Start](../../002-quick-start-overview) guide.

***

Before we breakdown the filters and commands we will use for this example we need to get a DRep id to track and Telgram bot token and chat id so we can get alerts in our Telegram. We will walk through the steps below.

<a name="step-1"></a>

## Step 1 - Get DRep ID for the DRep you want to Track

In order to filter by a DRep that we want to watch we need the DRep id. We can use tools like adastat.net to search by a DRep so we can get the DRep id.

In this example we searched  `Ear Coin Pool` on <a href="https://adastat.net/dreps" target="_blank">https://adastat.net/dreps</a>

![adder-drep-id](/adder-drep-id.png)

<br />

📝 Make note of the Drep ID, we will need it later. For this example, it was:

```
drep1yg8vjs7ute7z7vyd8yez5tgjey6043djjfh8d3n7sjev35g064xxc
```

***

<a name="step-2"></a>

## Step 2 - Creating the Telegram Bot (Required Once)

In order to get alerts in Telegram we will need a bot token from BotFather:

1. Open BotFather in Telegram by searching for `BotFather`

![adder-search-botfather](/adder-search-botfather.png)

***

2. Create a New Bot

![adder-botfather-create-new-bot](/adder-botfather-create-new-bot.png)

***

3. Name your bot and give it a unique username

![adder-botfather-new-bot-details](/adder-botfather-new-bot-details.png)

***

4. Then click `Create Bot`

![adder-botfather-click-create-bot](/adder-botfather-click-create-bot.png)

***

5. Copy the Bot Token

![adder-botfather-copy-bot-token](/adder-botfather-copy-bot-token.png)

***

6. Click Username

![adder-botfather-click-username](/adder-botfather-click-username.png)

***

7. Click `Message` to start chat with Bot

![adder-botfather-click-message-bot](/adder-botfather-click-message-bot.png)

8. Click Start

![adder-bot-chat-click-start](/adder-bot-chat-click-start.png)


9. Open this URL in a browser `https://api.telegram.org/bot{our_bot_token}/getUpdates`

See we need to prefix our token with a word `bot`

> Eg: https://api.telegram.org/bot87xxxxxx07:AAG8xxxxxx1hi-C8xxxxxxTB2/getUpdates

<br />
