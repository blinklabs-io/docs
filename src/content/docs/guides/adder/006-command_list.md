---
title: Command Reference Guide
description: List of Adder Commands.
---

# <ins>List of commands:</ins>

## Configuration:


```
 --config string
```
 
> path to config file to load

***

## Filter:

```
  --filter-address string
```
  
> specifies address to filter on
<br />


```
  --filter-asset string
```
  
> specifies the asset fingerprint (asset1xxx) to filter on
<br />


```
  --filter-drep string
```
  
> specifies DRep ID(s) to filter on (comma-separated, hex or bech32)
<br />


```
  --filter-policy string
```
  
> specifies asset policy ID to filter on
<br />

```
  --filter-pool string
```
  
> specifies Pool ID to filter on
<br />

```
  --filter-type string
```
  
> specifies event type to filter on
        
***

## Input:

```
  --input list
```
  
> input plugin to use, 'list' to show available (default "chainsync")
<br />

```
  --input string
```
  
> input plugin to use, 'list' to show available (default "chainsync")
<br />

### input-chainsync:

```
  --input-chainsync-address string
```
  
> specifies the TCP address of the node to connect to in the form 'host:port'
<br />

 ```
  --input-chainsync-auto-reconnect
```
  
> auto-reconnect if the connection is broken (default true)
<br />

```
  --input-chainsync-delay-confirmations uint
```
  
> number of confirmations required before emitting events
<br />

```
  --input-chainsync-include-cbor
```
  
> include original CBOR for block/transaction in events
<br />

```
  --input-chainsync-intersect-point string
```
  
> start syncing at the specified chain point(s) in '<slot>.<hash>' format
<br />

```
  --input-chainsync-intersect-tip
```
  
> start syncing at the chain tip (defaults to chain genesis) (default true)
<br />

```
  --input-chainsync-network string
```
  
> specifies a well-known Cardano network name (default "mainnet")
<br />

```
  --input-chainsync-network-magic uint
```
  
> specifies the network magic value to use, overrides 'network'
<br />

```
  --input-chainsync-ntc-tcp
```
  
> use the NtC (node-to-client) protocol over TCP, for use when exposing a node's UNIX socket via socat or similar
<br />

```
  --input-chainsync-socket-path string
```
  
> specifies the path to the UNIX socket to connect to

***

```
  --input-chainsync-kupo-url string
```
  
> kupo-url address
<br />


### input-mempool:

```
  --input-mempool-address string
```
  
> TCP address (host:port); requires ntc-tcp=true
<br />

```
  --input-mempool-include-cbor
```
  
> include transaction CBOR in events
<br />

```
  --input-mempool-kupo-url string
```
  
> Kupo API URL for resolving transaction inputs (e.g. http://localhost:1442). Kupo must index the outputs you need (e.g. run with --match "*") or resolution will be empty.
<br />

```
  --input-mempool-network string
```
  
> well-known Cardano network name (e.g. mainnet, preprod) (default "mainnet")
<br />

```
  --input-mempool-network-magic uint
```
  
> network magic value (overrides network name)
<br />

```
  --input-mempool-ntc-tcp
```
  
> use NtC over TCP (e.g. when exposing socket via socat)
<br />

```
  --input-mempool-poll-interval string
```
  
> how often to poll the mempool (e.g. 5s, 1m) (default "5s")
<br />

```
  --input-mempool-socket-path string
```
  
> path to the node's UNIX socket (NtC)

***

## Logging:

```
  --logging-level string
```
  
> logging level (debug, info, warn, error) (default "info")
<br />

***

## Output:

```
  --output string
```
  
> output plugin to use, 'list' to show available (default "log")
<br />

```
  --output-log-format string
```
  
> specifies the output format: text (human-readable, default) or json (machine-parseable) (default "text")
<br />

```
  --output-notify-title string
```
  
> specifies the title to use (default "Adder")
<br />

```
  --output-push-accessTokenUrl string
```
  
> specifies the url to get access token from (default `https://www.googleapis.com/auth/firebase.messaging`)
<br />

```
  --output-push-serviceAccountFilePath string
```
  
> specifies the path to the service account file
<br />

```
  --output-telegram-bot-token string
```
  
> Telegram Bot API token (from @BotFather)
<br />

```
  --output-telegram-chat-id string
```
  
> Telegram chat ID to send messages to (user, group, or channel)
<br />

```
  --output-telegram-disable-preview
```
  
> disable link preview in messages
<br />

```
  --output-telegram-parse-mode string
```
  
> message parse mode (HTML, Markdown, MarkdownV2) (default "HTML")
<br />

```
  --output-webhook-format string
```
  
> specifies the webhook payload format to use (default "adder")
<br />

```
  --output-webhook-password string
```
  
> specifies the password for basic auth
<br />

```
  --output-webhook-tls-skip-verify
```
  
> skip tls verification (for self-signed certs)
<br />

```
  --output-webhook-url string
```
  
> specifies the url to use (default `http://localhost:3000`)
<br />

```
  --output-webhook-username string
```
  
> specifies the username for basic auth

***

## Version:

```
  --version
```
  
> show version and exit

